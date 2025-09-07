import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface ImageUploadProps {
  onImageSelect: (file: File, dataUrl: string) => void;
  selectedImage?: string;
  onRemoveImage?: () => void;
  className?: string;
}

export function ImageUpload({
  onImageSelect,
  selectedImage,
  onRemoveImage,
  className,
}: ImageUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          onImageSelect(file, dataUrl);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".bmp", ".webp"],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  if (selectedImage) {
    return (
      <Card
        className={cn("relative bg-slate-800/50 border-slate-600", className)}
      >
        <CardContent className="p-4">
          <div className="relative">
            <img
              src={selectedImage}
              alt="Selected"
              className="w-full h-auto rounded-md max-h-96 object-contain border border-slate-600"
            />
            {onRemoveImage && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600"
                onClick={onRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "border-dashed border-2 border-slate-600 bg-slate-800/30",
        className
      )}
    >
      <CardContent className="p-8">
        <div
          {...getRootProps()}
          className={cn(
            "cursor-pointer rounded-lg border-dashed border-2 border-slate-600 p-8 text-center transition-colors",
            isDragActive && "border-emerald-500 bg-emerald-500/10",
            "hover:border-emerald-500 hover:bg-emerald-500/5"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-4">
            {isDragActive ? (
              <Upload className="h-12 w-12 text-emerald-500" />
            ) : (
              <ImageIcon className="h-12 w-12 text-slate-400" />
            )}
            <div className="space-y-2">
              <p className="text-lg font-medium text-white">
                {isDragActive ? "Drop the image here" : "Upload an image"}
              </p>
              <p className="text-sm text-slate-300">
                Drag and drop an image, or click to select
              </p>
              <p className="text-xs text-slate-400">PNG, JPG, GIF up to 10MB</p>
            </div>
            <Button
              variant="outline"
              type="button"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              Choose File
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
