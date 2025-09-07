import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  Download,
  Trash2,
  MousePointer,
  Check,
  X,
  Edit3,
  Sparkles,
} from "lucide-react";

const ImageLassoEditor = () => {
  const [image, setImage] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [completedPaths, setCompletedPaths] = useState([]);
  const [mode, setMode] = useState("select"); // 'select' or 'draw'
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 });
  const [editText, setEditText] = useState("");
  const [pendingGrayRegions, setPendingGrayRegions] = useState([]);
  const [autoEditEnabled, setAutoEditEnabled] = useState(true);
  const [history, setHistory] = useState([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(-1);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);
  const containerRef = useRef(null); // Ref for the canvas container

  // Handle image upload
  const handleImageUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setHistory([]);
          setCurrentVersionIndex(-1);
          setImage(img); // Set image first to trigger draw useEffect
          setMode("draw"); // Set lasso tool by default
          setCompletedPaths([]);
          setCurrentPath([]);
          setShowTextDialog(false);
          setPendingGrayRegions([]);
          setEditText("");
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

  // Effect to handle finishing a drawing path when mouse/touch is released anywhere on the page
  useEffect(() => {
    const handleUp = () => {
      if (isDrawing) {
        endDrawing();
      }
    };

    if (isDrawing) {
      window.addEventListener("mouseup", handleUp);
      window.addEventListener("touchend", handleUp);
    }

    return () => {
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchend", handleUp);
    };
  }, [isDrawing, endDrawing]);

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

  // Calculate the centroid of a polygon
  const getPolygonCentroid = useCallback((polygon) => {
    let cx = 0;
    let cy = 0;
    for (const point of polygon) {
      cx += point.x;
      cy += point.y;
    }
    return {
      x: cx / polygon.length,
      y: cy / polygon.length,
    };
  }, []);

  // Fill selected area with gray and show text dialog
  const fillSelectedArea = useCallback(() => {
    if (!image || completedPaths.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasRect = canvas.getBoundingClientRect();

    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    const offscreenCtx = offscreenCanvas.getContext("2d");
    offscreenCtx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const imageData = offscreenCtx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );
    const data = imageData.data;
    const grayRegions = [];

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const point = { x, y };
        for (let i = 0; i < completedPaths.length; i++) {
          const path = completedPaths[i];
          if (path.length > 2 && isPointInPolygon(point, path)) {
            const index = (y * canvas.width + x) * 4;
            data[index] = 128;
            data[index + 1] = 128;
            data[index + 2] = 128;
            if (!grayRegions[i]) grayRegions[i] = [];
            grayRegions[i].push({ x, y });
            break;
          }
        }
      }
    }

    offscreenCtx.putImageData(imageData, 0, 0);

    const newImage = new Image();
    newImage.onload = () => {
      setImage(newImage);
      setPendingGrayRegions(grayRegions);

      const firstPath = completedPaths[0];
      const centroid = getPolygonCentroid(firstPath);
      const scaleX = canvasRect.width / canvas.width;
      const scaleY = canvasRect.height / canvas.height;
      const dialogWidth = 300;
      const dialogHeight = 110;

      let targetX = centroid.x * scaleX - dialogWidth / 2;
      let targetY = centroid.y * scaleY - dialogHeight / 2;

      targetX = Math.max(
        5,
        Math.min(canvasRect.width - dialogWidth - 5, targetX)
      );
      targetY = Math.max(
        5,
        Math.min(canvasRect.height - dialogHeight - 5, targetY)
      );

      setDialogPosition({ x: targetX, y: targetY });
      setShowTextDialog(true);
      setEditText("");

      setTimeout(() => textInputRef.current?.focus(), 100);
      setCompletedPaths([]);
    };
    newImage.src = offscreenCanvas.toDataURL();
  }, [image, completedPaths, isPointInPolygon, getPolygonCentroid]);

  useEffect(() => {
    if (autoEditEnabled && completedPaths.length > 0 && !showTextDialog) {
      fillSelectedArea();
    }
  }, [completedPaths, autoEditEnabled, fillSelectedArea, showTextDialog]);

  const switchToVersion = useCallback(
    (index) => {
      if (index < 0 || index >= history.length) return;
      const versionImage = new Image();
      versionImage.onload = () => {
        setImage(versionImage);
        setCurrentVersionIndex(index);
        setCurrentPath([]);
        setCompletedPaths([]);
        setShowTextDialog(false);
      };
      versionImage.src = history[index];
    },
    [history]
  );

  const handleAcceptEdit = useCallback(() => {
    console.log("AI Edit Triggered:", editText);
    if (!canvasRef.current) return;

    const newVersionDataUrl = canvasRef.current.toDataURL();
    const newHistory = history.slice(0, currentVersionIndex + 1);
    newHistory.push(newVersionDataUrl);

    setHistory(newHistory);
    setCurrentVersionIndex(newHistory.length - 1);

    setShowTextDialog(false);
    setEditText("");
    setPendingGrayRegions([]);
  }, [editText, history, currentVersionIndex]);

  const handleRejectEdit = useCallback(() => {
    setShowTextDialog(false);
    setPendingGrayRegions([]);
    if (history[currentVersionIndex]) {
      const currentImageVersion = new Image();
      currentImageVersion.onload = () => setImage(currentImageVersion);
      currentImageVersion.src = history[currentVersionIndex];
    }
  }, [history, currentVersionIndex]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleAcceptEdit();
      } else if (e.key === "Escape") {
        handleRejectEdit();
      }
    },
    [handleAcceptEdit, handleRejectEdit]
  );

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

    // When a new image is loaded, history is reset. This condition captures the initial state.
    if (history.length === 0 && image.src) {
      const initialDataUrl = canvas.toDataURL();
      setHistory([initialDataUrl]);
      setCurrentVersionIndex(0);
    }

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
  }, [image, currentPath, completedPaths, history]);

  const downloadImage = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "edited-image.png";
    link.href = canvas.toDataURL();
    link.click();
  }, []);

  const clearSelections = useCallback(() => {
    setCurrentPath([]);
    setCompletedPaths([]);
    setShowTextDialog(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Image Editor
          </h1>
          <p className="text-gray-600">
            Use the lasso to select an area or just type a prompt to edit your
            image.
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
                  <div className="flex items-center space-x-4">
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
                    <div className="flex items-center space-x-2">
                      <label
                        htmlFor="auto-edit-toggle"
                        className="flex items-center cursor-pointer text-sm text-gray-600"
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            id="auto-edit-toggle"
                            checked={autoEditEnabled}
                            onChange={() =>
                              setAutoEditEnabled(!autoEditEnabled)
                            }
                            className="sr-only"
                          />
                          <div
                            className={`block w-10 h-6 rounded-full transition-colors ${
                              autoEditEnabled ? "bg-green-500" : "bg-gray-300"
                            }`}
                          ></div>
                          <div
                            className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                              autoEditEnabled ? "translate-x-4" : ""
                            }`}
                          ></div>
                        </div>
                        <span className="ml-2">Auto-Edit</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!autoEditEnabled && (
                      <button
                        className="px-3 py-1.5 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                        onClick={fillSelectedArea}
                        disabled={completedPaths.length === 0}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Selection
                      </button>
                    )}
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
                        setHistory([]);
                        setCurrentVersionIndex(-1);
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

            <div className="flex flex-col md:flex-row gap-4">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex-grow">
                <div className="p-4 flex justify-center items-center h-full">
                  <div ref={containerRef} className="relative inline-block">
                    <canvas
                      ref={canvasRef}
                      className={`border border-gray-300 rounded max-w-full h-auto ${
                        mode === "draw" ? "cursor-crosshair" : "cursor-default"
                      }`}
                      onMouseDown={startDrawing}
                      onMouseMove={continueDrawing}
                      onMouseUp={endDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={continueDrawing}
                      onTouchEnd={endDrawing}
                      style={{ touchAction: "none" }}
                    />

                    {completedPaths.length > 0 && !showTextDialog && (
                      <div className="absolute bottom-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-sm pointer-events-none z-10">
                        {completedPaths.length} area
                        {completedPaths.length !== 1 ? "s" : ""} selected
                      </div>
                    )}

                    {showTextDialog && (
                      <div
                        className="absolute bg-white rounded-lg shadow-2xl border border-gray-200 pointer-events-auto transform transition-all duration-200 ease-out z-20"
                        style={{
                          left: `${dialogPosition.x}px`,
                          top: `${dialogPosition.y}px`,
                          width: "300px",
                        }}
                      >
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2.5 rounded-t-lg">
                          <h3 className="font-semibold text-sm flex items-center">
                            <Edit3 className="w-4 h-4 mr-2" />
                            Describe Your Edit
                          </h3>
                        </div>
                        <div className="p-3">
                          <textarea
                            ref={textInputRef}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="e.g., Replace with a blue sky..."
                            className="w-full p-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                            rows={2}
                          />
                          <div className="flex items-center justify-end space-x-2 mt-3">
                            <button
                              onClick={handleRejectEdit}
                              className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </button>
                            <button
                              onClick={handleAcceptEdit}
                              disabled={!editText.trim()}
                              className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed rounded-md transition-all duration-200 shadow-sm"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Apply
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full md:w-56 flex-shrink-0">
                <div className="p-4 h-full flex flex-col">
                  <h3 className="text-sm font-medium text-gray-800 mb-3 flex-shrink-0">
                    Version History
                  </h3>
                  <div className="flex-grow overflow-y-auto space-y-2 pr-2 -mr-2">
                    {history.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => switchToVersion(index)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                          index === currentVersionIndex
                            ? "bg-blue-100 text-blue-800 font-semibold"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <span>Version {index}</span>
                        {index === 0 && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                            Original
                          </span>
                        )}
                        {index === currentVersionIndex && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4">
                <label
                  htmlFor="prompt-input"
                  className="block text-sm font-medium text-gray-800 mb-2"
                >
                  AI Prompt
                </label>
                <textarea
                  id="prompt-input"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Describe the changes for the entire image, or for the selected area... e.g., 'make the sky a vibrant sunset'"
                  className="w-full p-2 border border-gray-300 rounded-md resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  rows={3}
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleAcceptEdit}
                    disabled={!editText.trim()}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed rounded-md transition-all duration-200 shadow-sm"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showTextDialog && (
          <div
            className="fixed inset-0 z-10"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
            onClick={handleRejectEdit}
          />
        )}
      </div>
    </div>
  );
};

export default ImageLassoEditor;
