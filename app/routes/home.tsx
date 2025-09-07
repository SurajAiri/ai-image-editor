import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Palette, Upload, Edit3, History, Wand2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Image Editor
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your images with AI-powered editing. Upload an image, select areas to edit, 
            and let AI create stunning modifications with simple text prompts.
          </p>
          
          <Link to="/image-editor">
            <Button size="lg" className="mb-12">
              <Wand2 className="mr-2 h-5 w-5" />
              Start Editing
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="text-center">
              <Upload className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <CardTitle className="text-lg">1. Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Drag and drop or select an image to get started. Supports JPG, PNG, and more.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Palette className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <CardTitle className="text-lg">2. Select Area</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Draw over the areas you want to edit with our intuitive canvas tools.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Edit3 className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <CardTitle className="text-lg">3. Describe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Write a prompt describing what you want to change or add to the selected area.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <History className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <CardTitle className="text-lg">4. Version Control</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Keep track of all your edits with automatic version history and easy comparison.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-center">Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">🎨 Intuitive Drawing Tools</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Easy-to-use brush and eraser tools for precise area selection.
                </p>

                <h3 className="font-semibold mb-2">📝 Smart Prompting</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Built-in prompt suggestions and negative prompting for better results.
                </p>

                <h3 className="font-semibold mb-2">💾 Auto-Save Versions</h3>
                <p className="text-sm text-gray-600">
                  Every edit is automatically saved with full version history.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">🔄 Easy Comparison</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Compare original and edited images side by side.
                </p>

                <h3 className="font-semibold mb-2">📥 Multiple Export Options</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Download your edited images or the mask patterns.
                </p>

                <h3 className="font-semibold mb-2">🎯 Precise Control</h3>
                <p className="text-sm text-gray-600">
                  Adjustable brush sizes and tool options for precise editing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            Ready to transform your images? Get started with our AI-powered editor.
          </p>
        </div>
      </div>
    </div>
  );
}
