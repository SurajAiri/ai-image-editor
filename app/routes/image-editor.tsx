import { useState, useCallback } from "react";
import { ImageUpload } from "~/components/ImageUpload";
import { CanvasDrawing } from "~/components/CanvasDrawing";
import { PromptInput } from "~/components/PromptInput";
import { VersionHistory, type ImageVersion } from "~/components/VersionHistory";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Palette, Upload, Edit3, History, Wand2 } from "lucide-react";

export default function ImageEditor() {
  const [originalImage, setOriginalImage] = useState<string>("");
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [maskImage, setMaskImage] = useState<string>("");
  const [versions, setVersions] = useState<ImageVersion[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<"upload" | "draw" | "prompt">(
    "upload"
  );

  const handleImageSelect = useCallback((file: File, dataUrl: string) => {
    setOriginalImage(dataUrl);
    setOriginalFile(file);
    setCurrentStep("draw");
    // Clear previous versions when new image is uploaded
    setVersions([]);
    setActiveVersionId("");
  }, []);

  const handleRemoveImage = useCallback(() => {
    setOriginalImage("");
    setOriginalFile(null);
    setMaskImage("");
    setVersions([]);
    setActiveVersionId("");
    setCurrentStep("upload");
  }, []);

  const handleMaskChange = useCallback(
    (maskDataUrl: string) => {
      setMaskImage(maskDataUrl);
      if (maskDataUrl && currentStep === "draw") {
        setCurrentStep("prompt");
      }
    },
    [currentStep]
  );

  const handlePromptSubmit = useCallback(
    async (prompt: string, negativePrompt?: string) => {
      if (!originalImage || !maskImage) return;

      setIsLoading(true);

      try {
        // Call the API route
        const formData = new FormData();
        formData.append("originalImage", originalImage);
        formData.append("maskImage", maskImage);
        formData.append("prompt", prompt);
        if (negativePrompt) {
          formData.append("negativePrompt", negativePrompt);
        }

        const response = await fetch("/api/edit", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          // Create a new version
          const newVersion: ImageVersion = {
            id: Date.now().toString(),
            originalImage,
            editedImage: result.editedImage,
            maskImage,
            prompt,
            negativePrompt,
            timestamp: new Date(),
          };

          setVersions((prev) => [newVersion, ...prev]);
          setActiveVersionId(newVersion.id);
        } else {
          console.error("API error:", result.error);
          // Handle error - show toast or error message
        }
      } catch (error) {
        console.error("Error generating edit:", error);
        // Handle error - show toast or error message
      } finally {
        setIsLoading(false);
      }
    },
    [originalImage, maskImage]
  );

  const handleVersionSelect = useCallback((version: ImageVersion) => {
    setActiveVersionId(version.id);
    // Optionally update the canvas with the selected version's mask
  }, []);

  const handleVersionDelete = useCallback(
    (versionId: string) => {
      setVersions((prev) => prev.filter((v) => v.id !== versionId));
      if (activeVersionId === versionId) {
        const remainingVersions = versions.filter((v) => v.id !== versionId);
        setActiveVersionId(
          remainingVersions.length > 0 ? remainingVersions[0].id : ""
        );
      }
    },
    [activeVersionId, versions]
  );

  const handleVersionDuplicate = useCallback((version: ImageVersion) => {
    const duplicatedVersion: ImageVersion = {
      ...version,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setVersions((prev) => [duplicatedVersion, ...prev]);
    setActiveVersionId(duplicatedVersion.id);
  }, []);

  const goToStep = (step: "upload" | "draw" | "prompt") => {
    if (
      step === "upload" ||
      (step === "draw" && originalImage) ||
      (step === "prompt" && originalImage && maskImage)
    ) {
      setCurrentStep(step);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-2">
            AI Image Editor
          </h1>
          <p className="text-slate-300">
            Upload an image, select areas to edit, and transform them with AI
            prompts.
          </p>
        </div>

        {/* Progress Steps */}
        <Card className="mb-6 card-enhanced bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-8">
              <Button
                variant={currentStep === "upload" ? "default" : "ghost"}
                onClick={() => goToStep("upload")}
                className={`flex items-center space-x-2 ${
                  currentStep === "upload"
                    ? "gradient-primary text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
              >
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </Button>
              <div
                className={`h-0.5 w-16 ${currentStep !== "upload" ? "bg-emerald-500" : "bg-slate-600"}`}
              />
              <Button
                variant={currentStep === "draw" ? "default" : "ghost"}
                onClick={() => goToStep("draw")}
                disabled={!originalImage}
                className={`flex items-center space-x-2 ${
                  currentStep === "draw"
                    ? "gradient-primary text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-700 disabled:text-slate-500 disabled:hover:bg-transparent"
                }`}
              >
                <Palette className="h-4 w-4" />
                <span>Draw</span>
              </Button>
              <div
                className={`h-0.5 w-16 ${currentStep === "prompt" ? "bg-emerald-500" : "bg-slate-600"}`}
              />
              <Button
                variant={currentStep === "prompt" ? "default" : "ghost"}
                onClick={() => goToStep("prompt")}
                disabled={!originalImage || !maskImage}
                className={`flex items-center space-x-2 ${
                  currentStep === "prompt"
                    ? "gradient-primary text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-700 disabled:text-slate-500 disabled:hover:bg-transparent"
                }`}
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {currentStep === "upload" && (
              <div className="card-enhanced bg-slate-800/50 border-slate-700 rounded-xl p-6">
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  selectedImage={originalImage}
                  onRemoveImage={handleRemoveImage}
                />
              </div>
            )}

            {currentStep === "draw" && originalImage && (
              <div className="card-enhanced bg-slate-800/50 border-slate-700 rounded-xl p-1">
                <CanvasDrawing
                  imageUrl={originalImage}
                  onMaskChange={handleMaskChange}
                />
              </div>
            )}

            {currentStep === "prompt" && originalImage && maskImage && (
              <div className="space-y-6">
                <Card className="card-enhanced bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-slate-300">
                          Original
                        </h4>
                        <img
                          src={originalImage}
                          alt="Original"
                          className="w-full h-auto rounded-md border border-slate-600"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-slate-300">
                          Selected Area
                        </h4>
                        <img
                          src={maskImage}
                          alt="Mask"
                          className="w-full h-auto rounded-md border border-slate-600"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="card-enhanced bg-slate-800/50 border-slate-700 rounded-xl p-1">
                  <PromptInput
                    onSubmit={handlePromptSubmit}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Show active version result */}
            {activeVersionId && versions.length > 0 && (
              <Card className="card-enhanced bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Wand2 className="h-5 w-5 text-emerald-400" />
                    <span>Latest Edit Result</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const activeVersion = versions.find(
                      (v) => v.id === activeVersionId
                    );
                    return activeVersion ? (
                      <div className="space-y-4">
                        <img
                          src={activeVersion.editedImage}
                          alt="Edited result"
                          className="w-full h-auto rounded-md border border-slate-600"
                        />
                        <div className="bg-slate-900/50 p-4 rounded-md border border-slate-600">
                          <p className="text-sm text-slate-300">
                            <strong className="text-emerald-400">
                              Prompt:
                            </strong>{" "}
                            {activeVersion.prompt}
                          </p>
                          {activeVersion.negativePrompt && (
                            <p className="text-sm mt-2 text-slate-300">
                              <strong className="text-red-400">
                                Negative Prompt:
                              </strong>{" "}
                              {activeVersion.negativePrompt}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card-enhanced bg-slate-800/50 border-slate-700 rounded-xl p-1">
              <VersionHistory
                versions={versions}
                activeVersionId={activeVersionId}
                onVersionSelect={handleVersionSelect}
                onVersionDelete={handleVersionDelete}
                onVersionDuplicate={handleVersionDuplicate}
              />
            </div>

            {/* API Integration Panel */}
            <Card className="card-enhanced bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <History className="h-5 w-5 text-blue-400" />
                  <span>API Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                  Connect your image editing API (Stability AI, OpenAI DALL-E,
                  etc.) to enable real image processing.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                  disabled
                >
                  Configure API (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
