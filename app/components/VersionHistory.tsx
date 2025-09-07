import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { Badge } from '~/components/ui/badge'
import { History, Eye, Download, Trash2, Copy } from 'lucide-react'
import { cn } from '~/lib/utils'

export interface ImageVersion {
  id: string
  originalImage: string
  editedImage: string
  maskImage: string
  prompt: string
  negativePrompt?: string
  timestamp: Date
  isActive?: boolean
}

interface VersionHistoryProps {
  versions: ImageVersion[]
  onVersionSelect: (version: ImageVersion) => void
  onVersionDelete: (versionId: string) => void
  onVersionDuplicate: (version: ImageVersion) => void
  activeVersionId?: string
  className?: string
}

export function VersionHistory({ 
  versions, 
  onVersionSelect, 
  onVersionDelete,
  onVersionDuplicate,
  activeVersionId,
  className 
}: VersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<ImageVersion | null>(null)

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp)
  }

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = filename
    link.click()
  }

  if (versions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Version History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            No versions yet. Create your first edit to see version history.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="h-5 w-5" />
          <span>Version History</span>
          <Badge variant="secondary">{versions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {versions.map((version, index) => (
            <div
              key={version.id}
              className={cn(
                "border rounded-lg p-3 transition-colors cursor-pointer",
                activeVersionId === version.id 
                  ? "border-primary bg-primary/5" 
                  : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() => onVersionSelect(version)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <img
                    src={version.editedImage}
                    alt={`Version ${versions.length - index}`}
                    className="w-16 h-16 object-cover rounded-md border"
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">
                      Version {versions.length - index}
                      {activeVersionId === version.id && (
                        <Badge variant="default" className="ml-2 text-xs">Active</Badge>
                      )}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(version.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {version.prompt}
                  </p>
                  <div className="flex items-center space-x-1 mt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedVersion(version)
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Version {versions.length - index} Details</DialogTitle>
                        </DialogHeader>
                        {selectedVersion && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h5 className="text-sm font-medium mb-2">Original</h5>
                                <img
                                  src={selectedVersion.originalImage}
                                  alt="Original"
                                  className="w-full h-auto rounded-md border"
                                />
                              </div>
                              <div>
                                <h5 className="text-sm font-medium mb-2">Edited</h5>
                                <img
                                  src={selectedVersion.editedImage}
                                  alt="Edited"
                                  className="w-full h-auto rounded-md border"
                                />
                              </div>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium mb-2">Prompt</h5>
                              <p className="text-sm bg-gray-50 p-3 rounded-md">
                                {selectedVersion.prompt}
                              </p>
                              {selectedVersion.negativePrompt && (
                                <>
                                  <h5 className="text-sm font-medium mb-2 mt-3">Negative Prompt</h5>
                                  <p className="text-sm bg-gray-50 p-3 rounded-md">
                                    {selectedVersion.negativePrompt}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onVersionDuplicate(version)
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadImage(version.editedImage, `edited-image-v${versions.length - index}.png`)
                      }}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onVersionDelete(version.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
