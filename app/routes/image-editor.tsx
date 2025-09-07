import { useState, useCallback } from 'react'
import { ImageUpload } from '~/components/ImageUpload'
import { CanvasDrawing } from '~/components/CanvasDrawing'
import { PromptInput } from '~/components/PromptInput'
import { VersionHistory, type ImageVersion } from '~/components/VersionHistory'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Palette, Upload, Edit3, History } from 'lucide-react'

export default function ImageEditor() {
  const [originalImage, setOriginalImage] = useState<string>('')
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [maskImage, setMaskImage] = useState<string>('')
  const [versions, setVersions] = useState<ImageVersion[]>([])
  const [activeVersionId, setActiveVersionId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<'upload' | 'draw' | 'prompt'>('upload')

  const handleImageSelect = useCallback((file: File, dataUrl: string) => {
    setOriginalImage(dataUrl)
    setOriginalFile(file)
    setCurrentStep('draw')
    // Clear previous versions when new image is uploaded
    setVersions([])
    setActiveVersionId('')
  }, [])

  const handleRemoveImage = useCallback(() => {
    setOriginalImage('')
    setOriginalFile(null)
    setMaskImage('')
    setVersions([])
    setActiveVersionId('')
    setCurrentStep('upload')
  }, [])

  const handleMaskChange = useCallback((maskDataUrl: string) => {
    setMaskImage(maskDataUrl)
    if (maskDataUrl && currentStep === 'draw') {
      setCurrentStep('prompt')
    }
  }, [currentStep])

  const handlePromptSubmit = useCallback(async (prompt: string, negativePrompt?: string) => {
    if (!originalImage || !maskImage) return

    setIsLoading(true)
    
    try {
      // Call the API route
      const formData = new FormData()
      formData.append('originalImage', originalImage)
      formData.append('maskImage', maskImage)
      formData.append('prompt', prompt)
      if (negativePrompt) {
        formData.append('negativePrompt', negativePrompt)
      }

      const response = await fetch('/api/edit', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

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
        }
        
        setVersions(prev => [newVersion, ...prev])
        setActiveVersionId(newVersion.id)
      } else {
        console.error('API error:', result.error)
        // Handle error - show toast or error message
      }
      
    } catch (error) {
      console.error('Error generating edit:', error)
      // Handle error - show toast or error message
    } finally {
      setIsLoading(false)
    }
  }, [originalImage, maskImage])

  const handleVersionSelect = useCallback((version: ImageVersion) => {
    setActiveVersionId(version.id)
    // Optionally update the canvas with the selected version's mask
  }, [])

  const handleVersionDelete = useCallback((versionId: string) => {
    setVersions(prev => prev.filter(v => v.id !== versionId))
    if (activeVersionId === versionId) {
      const remainingVersions = versions.filter(v => v.id !== versionId)
      setActiveVersionId(remainingVersions.length > 0 ? remainingVersions[0].id : '')
    }
  }, [activeVersionId, versions])

  const handleVersionDuplicate = useCallback((version: ImageVersion) => {
    const duplicatedVersion: ImageVersion = {
      ...version,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    setVersions(prev => [duplicatedVersion, ...prev])
    setActiveVersionId(duplicatedVersion.id)
  }, [])

  const goToStep = (step: 'upload' | 'draw' | 'prompt') => {
    if (step === 'upload' || (step === 'draw' && originalImage) || (step === 'prompt' && originalImage && maskImage)) {
      setCurrentStep(step)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Image Editor</h1>
          <p className="text-gray-600">Upload an image, select areas to edit, and transform them with AI prompts.</p>
        </div>

        {/* Progress Steps */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-8">
              <Button
                variant={currentStep === 'upload' ? 'default' : 'ghost'}
                onClick={() => goToStep('upload')}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </Button>
              <div className={`h-0.5 w-16 ${currentStep !== 'upload' ? 'bg-primary' : 'bg-gray-300'}`} />
              <Button
                variant={currentStep === 'draw' ? 'default' : 'ghost'}
                onClick={() => goToStep('draw')}
                disabled={!originalImage}
                className="flex items-center space-x-2"
              >
                <Palette className="h-4 w-4" />
                <span>Draw</span>
              </Button>
              <div className={`h-0.5 w-16 ${currentStep === 'prompt' ? 'bg-primary' : 'bg-gray-300'}`} />
              <Button
                variant={currentStep === 'prompt' ? 'default' : 'ghost'}
                onClick={() => goToStep('prompt')}
                disabled={!originalImage || !maskImage}
                className="flex items-center space-x-2"
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
            {currentStep === 'upload' && (
              <ImageUpload
                onImageSelect={handleImageSelect}
                selectedImage={originalImage}
                onRemoveImage={handleRemoveImage}
              />
            )}

            {currentStep === 'draw' && originalImage && (
              <CanvasDrawing
                imageUrl={originalImage}
                onMaskChange={handleMaskChange}
              />
            )}

            {currentStep === 'prompt' && originalImage && maskImage && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Original</h4>
                        <img
                          src={originalImage}
                          alt="Original"
                          className="w-full h-auto rounded-md border"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Selected Area</h4>
                        <img
                          src={maskImage}
                          alt="Mask"
                          className="w-full h-auto rounded-md border"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <PromptInput
                  onSubmit={handlePromptSubmit}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* Show active version result */}
            {activeVersionId && versions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Latest Edit Result</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const activeVersion = versions.find(v => v.id === activeVersionId)
                    return activeVersion ? (
                      <div className="space-y-4">
                        <img
                          src={activeVersion.editedImage}
                          alt="Edited result"
                          className="w-full h-auto rounded-md border"
                        />
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm">
                            <strong>Prompt:</strong> {activeVersion.prompt}
                          </p>
                          {activeVersion.negativePrompt && (
                            <p className="text-sm mt-1">
                              <strong>Negative Prompt:</strong> {activeVersion.negativePrompt}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : null
                  })()}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <VersionHistory
              versions={versions}
              activeVersionId={activeVersionId}
              onVersionSelect={handleVersionSelect}
              onVersionDelete={handleVersionDelete}
              onVersionDuplicate={handleVersionDuplicate}
            />

            {/* API Integration Panel - Coming Soon */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5" />
                  <span>API Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Connect your image editing API (Stability AI, OpenAI DALL-E, etc.) to enable real image processing.
                </p>
                <Button variant="outline" className="w-full mt-3" disabled>
                  Configure API (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
