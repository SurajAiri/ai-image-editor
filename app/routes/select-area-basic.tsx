import React, { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Download, Trash2, MousePointer } from "lucide-react";

const ImageLassoEditor = () => {
  const [image, setImage] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [completedPaths, setCompletedPaths] = useState([]);
  const [mode, setMode] = useState("select"); // 'select' or 'draw'

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          setCurrentPath([]);
          setCompletedPaths([]);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Get mouse/touch position relative to canvas
  const getCanvasPosition = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  // Start drawing
  const startDrawing = useCallback(
    (e) => {
      if (mode !== "draw" || !image) return;
      e.preventDefault();
      setIsDrawing(true);
      const pos = getCanvasPosition(e);
      setCurrentPath([pos]);
    },
    [mode, image, getCanvasPosition]
  );

  // Continue drawing
  const continueDrawing = useCallback(
    (e) => {
      if (!isDrawing || mode !== "draw") return;
      e.preventDefault();
      const pos = getCanvasPosition(e);
      setCurrentPath((prev) => [...prev, pos]);
    },
    [isDrawing, mode, getCanvasPosition]
  );

  // End drawing
  const endDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPath.length > 2) {
      setCompletedPaths((prev) => [...prev, [...currentPath]]);
    }
    setCurrentPath([]);
  }, [isDrawing, currentPath]);

  // Point-in-polygon test using ray casting algorithm
  const isPointInPolygon = useCallback((point, polygon) => {
    let inside = false;
    const x = point.x;
    const y = point.y;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;
      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }, []);

  // ⭐ FIXED: Fill selected area with gray
  const fillSelectedArea = useCallback(() => {
    if (!image || completedPaths.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;

    // 1. Create an off-screen canvas to perform the modification
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    const offscreenCtx = offscreenCanvas.getContext("2d");

    // 2. Draw the current image to the off-screen canvas
    offscreenCtx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // 3. Get the pixel data from this clean image
    const imageData = offscreenCtx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );
    const data = imageData.data;

    // 4. Loop through pixels and modify if they are inside a selection
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const point = { x, y };
        let isInside = false;
        for (const path of completedPaths) {
          if (path.length > 2 && isPointInPolygon(point, path)) {
            isInside = true;
            break;
          }
        }
        if (isInside) {
          const index = (y * canvas.width + x) * 4;
          data[index] = 128; // R
          data[index + 1] = 128; // G
          data[index + 2] = 128; // B
        }
      }
    }

    // 5. Put the modified data back onto the off-screen canvas
    offscreenCtx.putImageData(imageData, 0, 0);

    // 6. Create a new Image object from the modified canvas data
    const newImage = new Image();
    newImage.onload = () => {
      // 7. Update the React state with the new image
      setImage(newImage);
      // 8. Clear the paths now that they've been applied
      setCompletedPaths([]);
    };
    newImage.src = offscreenCanvas.toDataURL();
  }, [image, completedPaths, isPointInPolygon]);

  // Draw on canvas
  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const maxWidth = 800;
    const maxHeight = 600;
    let { width, height } = image;
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    [...completedPaths, currentPath].forEach((path) => {
      if (path.length > 1) {
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        path.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
        if (
          path.length > 2 &&
          path === completedPaths.find((p) => p === path)
        ) {
          ctx.closePath();
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  }, [image, currentPath, completedPaths]);

  // Download edited image
  const downloadImage = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "edited-image.png";
    link.href = canvas.toDataURL();
    link.click();
  }, []);

  // Clear all selections
  const clearSelections = useCallback(() => {
    setCurrentPath([]);
    setCompletedPaths([]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Image Lasso Editor
          </h1>
          <p className="text-gray-600">
            Upload an image, select areas with the lasso tool, and fill them
            with gray
          </p>
        </div>

        {!image && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-8">
              <div className="text-center space-y-4">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="w-12 h-12 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Upload an Image
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Select an image file to start editing
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Choose Image
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {image && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <button
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center ${
                        mode === "select"
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick={() => setMode("select")}
                    >
                      <MousePointer className="w-4 h-4 mr-2" />
                      Select
                    </button>
                    <button
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        mode === "draw"
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick={() => setMode("draw")}
                    >
                      Lasso Tool
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      className="px-3 py-1.5 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      onClick={fillSelectedArea}
                      disabled={completedPaths.length === 0}
                    >
                      Fill Gray
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors flex items-center"
                      onClick={clearSelections}
                      disabled={
                        completedPaths.length === 0 && currentPath.length === 0
                      }
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center"
                      onClick={downloadImage}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      onClick={() => {
                        setImage(null);
                        setCurrentPath([]);
                        setCompletedPaths([]);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                    >
                      New Image
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 flex justify-center">
                <div className="relative inline-block">
                  <canvas
                    ref={canvasRef}
                    className={`border border-gray-300 rounded max-w-full h-auto ${
                      mode === "draw" ? "cursor-crosshair" : "cursor-default"
                    }`}
                    onMouseDown={startDrawing}
                    onMouseMove={continueDrawing}
                    onMouseUp={endDrawing}
                    onMouseLeave={endDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={continueDrawing}
                    onTouchEnd={endDrawing}
                    style={{ touchAction: "none" }}
                  />

                  {mode === "draw" && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm pointer-events-none">
                      Lasso Mode: Draw to select areas
                    </div>
                  )}

                  {completedPaths.length > 0 && (
                    <div className="absolute bottom-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-sm pointer-events-none">
                      {completedPaths.length} area
                      {completedPaths.length !== 1 ? "s" : ""} selected
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  Instructions:
                </h3>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Click "Lasso Tool" to enter drawing mode.</li>
                  <li>
                    Click and drag to draw freehand selections around areas you
                    want to fill.
                  </li>
                  <li>
                    Once a selection is complete, click "Fill Gray" to apply the
                    change.
                  </li>
                  <li>
                    Use "Clear" to remove selections or "Download" to save your
                    edited image.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageLassoEditor;
