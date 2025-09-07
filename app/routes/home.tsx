import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Palette,
  Upload,
  Edit3,
  History,
  Wand2,
  Sparkles,
  Zap,
  Target,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center py-16">
          <div className="flex items-center justify-center mb-6">
            <div className="gradient-primary p-3 rounded-2xl mr-4">
              <Wand2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              AI Image Editor
            </h1>
          </div>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your images with AI-powered editing. Upload an image,
            select areas to edit, and let AI create stunning modifications with
            simple text prompts.
          </p>

          <Link to="/image-editor">
            <Button
              size="lg"
              className="gradient-primary text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 px-8 py-4 text-lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Start Creating Magic
            </Button>
          </Link>

          <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-slate-400">
            <div className="flex items-center">
              <Zap className="h-4 w-4 mr-1 text-yellow-400" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center">
              <Target className="h-4 w-4 mr-1 text-emerald-400" />
              <span>Precise Editing</span>
            </div>
            <div className="flex items-center">
              <History className="h-4 w-4 mr-1 text-blue-400" />
              <span>Version Control</span>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="card-enhanced bg-slate-800/50 border-slate-700 group">
            <CardHeader className="text-center pb-4">
              <div className="gradient-secondary p-3 rounded-xl w-fit mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg text-white">1. Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300 text-center leading-relaxed">
                Drag and drop or select an image to get started. Supports JPG,
                PNG, and more formats up to 10MB.
              </p>
            </CardContent>
          </Card>

          <Card className="card-enhanced bg-slate-800/50 border-slate-700 group">
            <CardHeader className="text-center pb-4">
              <div className="gradient-accent p-3 rounded-xl w-fit mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <Palette className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg text-white">
                2. Select Area
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300 text-center leading-relaxed">
                Draw over the areas you want to edit with our intuitive brush
                tools and adjustable sizes.
              </p>
            </CardContent>
          </Card>

          <Card className="card-enhanced bg-slate-800/50 border-slate-700 group">
            <CardHeader className="text-center pb-4">
              <div className="gradient-primary p-3 rounded-xl w-fit mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <Edit3 className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg text-white">3. Describe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300 text-center leading-relaxed">
                Write a prompt describing what you want to change or add to the
                selected area.
              </p>
            </CardContent>
          </Card>

          <Card className="card-enhanced bg-slate-800/50 border-slate-700 group">
            <CardHeader className="text-center pb-4">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl w-fit mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <History className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg text-white">
                4. Version Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300 text-center leading-relaxed">
                Keep track of all your edits with automatic version history and
                easy comparison.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <Card className="card-enhanced bg-slate-800/30 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-white mb-2">
              Everything You Need for Professional Image Editing
            </CardTitle>
            <p className="text-center text-slate-300">
              Powerful tools designed for creators, designers, and anyone who
              wants to enhance their images
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="gradient-primary p-2 rounded-lg">
                    <Palette className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      Intuitive Drawing Tools
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Easy-to-use brush and eraser tools for precise area
                      selection with adjustable sizes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="gradient-secondary p-2 rounded-lg">
                    <Edit3 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      Smart Prompting
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Built-in prompt suggestions and negative prompting for
                      better, more accurate results.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="gradient-accent p-2 rounded-lg">
                    <History className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      Auto-Save Versions
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Every edit is automatically saved with full version
                      history and easy rollback.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      Easy Comparison
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Compare original and edited images side by side with
                      detailed view options.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2 rounded-lg">
                    <Upload className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      Multiple Export Options
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Download your edited images, mask patterns, or entire
                      version history.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-2 rounded-lg">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      Precise Control
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Adjustable brush sizes and advanced tool options for
                      pixel-perfect editing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Images?
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of creators using AI to bring their creative visions
            to life
          </p>
          <Link to="/nano">
            <Button
              size="lg"
              className="gradient-primary text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Wand2 className="mr-2 h-5 w-5" />
              Get Started Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
