import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Textarea } from '~/components/ui/textarea'
import { Input } from '~/components/ui/input'
import { Wand2, Loader2 } from 'lucide-react'

interface PromptInputProps {
  onSubmit: (prompt: string, negativePrompt?: string) => void
  isLoading?: boolean
  className?: string
}

export function PromptInput({ onSubmit, isLoading = false, className }: PromptInputProps) {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      onSubmit(prompt.trim(), negativePrompt.trim() || undefined)
    }
  }

  const promptSuggestions = [
    "Add beautiful flowers in the garden",
    "Replace with a modern building",
    "Add snow falling from the sky",
    "Transform into a sunset scene",
    "Add colorful butterflies flying around",
    "Change to autumn colors",
    "Add reflections in water",
    "Transform into a vintage style"
  ]

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wand2 className="h-5 w-5" />
          <span>Edit Prompt</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium">
              Describe what you want to change or add
            </label>
            <Textarea
              id="prompt"
              placeholder="e.g., Add beautiful flowers, Change the sky to sunset, Replace with a modern building..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </Button>
            
            {showAdvanced && (
              <div className="space-y-2">
                <label htmlFor="negativePrompt" className="text-sm font-medium">
                  Negative Prompt (what to avoid)
                </label>
                <Textarea
                  id="negativePrompt"
                  placeholder="e.g., blurry, low quality, distorted..."
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  rows={2}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Quick Suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {promptSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!prompt.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Edit
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
