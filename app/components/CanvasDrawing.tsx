import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Brush, Eraser, Download, RotateCcw } from "lucide-react";
import { cn } from "~/lib/utils";

interface Point {
  x: number;
  y: number;
}

interface CanvasDrawingProps {
  imageUrl: string;
  onMaskChange: (maskDataUrl: string) => void;
  className?: string;
}

export function CanvasDrawing({
  imageUrl,
  onMaskChange,
  className,
}: CanvasDrawingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create a transparent mask
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    onMaskChange(maskCanvas.toDataURL());
  }, [onMaskChange]);

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match the displayed image size
    const rect = image.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    setCanvasSize({ width: rect.width, height: rect.height });

    // Set up canvas for drawing
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalCompositeOperation = "source-over";

    clearCanvas();
  }, [clearCanvas]);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    const handleImageLoad = () => {
      initializeCanvas();
    };

    if (image.complete) {
      handleImageLoad();
    } else {
      image.addEventListener("load", handleImageLoad);
      return () => image.removeEventListener("load", handleImageLoad);
    }
  }, [imageUrl, initializeCanvas]);

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const startDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      setIsDrawing(true);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const pos = getMousePos(e);

      ctx.globalCompositeOperation =
        tool === "eraser" ? "destination-out" : "source-over";
      ctx.lineWidth = brushSize;
      ctx.strokeStyle =
        tool === "brush" ? "rgba(128, 128, 128, 0.8)" : "rgba(0, 0, 0, 1)";

      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    },
    [tool, brushSize, getMousePos]
  );

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const pos = getMousePos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    },
    [isDrawing, getMousePos]
  );

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Generate mask data URL
    onMaskChange(canvas.toDataURL());
  }, [isDrawing, onMaskChange]);

  const downloadMask = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "mask.png";
    link.href = canvas.toDataURL();
    link.click();
  }, []);

  return (
    <Card className={cn("bg-slate-800/50 border-slate-600", className)}>
      <CardHeader>
        <CardTitle className="text-white">Draw Selection Area</CardTitle>
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <Button
            variant={tool === "brush" ? "default" : "outline"}
            size="sm"
            onClick={() => setTool("brush")}
            className={
              tool === "brush"
                ? "gradient-primary text-white"
                : "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
            }
          >
            <Brush className="h-4 w-4" />
          </Button>
          <Button
            variant={tool === "eraser" ? "default" : "outline"}
            size="sm"
            onClick={() => setTool("eraser")}
            className={
              tool === "eraser"
                ? "gradient-primary text-white"
                : "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
            }
          >
            <Eraser className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-slate-300">Size:</label>
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-20 accent-emerald-500"
            />
            <span className="text-sm w-8 text-slate-300">{brushSize}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCanvas}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadMask}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative inline-block">
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Edit target"
            className="max-w-full h-auto rounded-md border border-slate-600"
            style={{ maxHeight: "500px" }}
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 cursor-crosshair rounded-md"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        </div>
        <p className="text-sm text-slate-400 mt-2">
          Draw over the areas you want to edit. Gray areas will be processed
          with your prompt.
        </p>
      </CardContent>
    </Card>
  );
}
