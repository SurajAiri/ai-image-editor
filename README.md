# AI Image Editor

A powerful web application for AI-powered image editing using React Router 7, Tailwind CSS, and shadcn/ui components.

## Features

- **🖼️ Image Upload**: Drag-and-drop interface for uploading images
- **🎨 Canvas Drawing**: Interactive canvas for selecting regions to edit
- **✍️ AI Prompting**: Text-based prompts for describing desired edits
- **📝 Version History**: Automatic versioning of all edits with full history
- **🔄 Easy Comparison**: Side-by-side comparison of original and edited images
- **💾 Export Options**: Download edited images and mask patterns

## How to Use

1. **Upload an Image**:
   - Drag and drop an image or click to browse
   - Supports JPG, PNG, GIF, and other common formats
   - Maximum file size: 10MB

2. **Draw Selection Area**:
   - Use the brush tool to select areas you want to edit
   - Adjust brush size with the slider
   - Use the eraser to remove selections
   - Clear all selections with the reset button

3. **Write Edit Prompt**:
   - Describe what you want to change or add
   - Use the provided suggestions or write your own
   - Optional: Add negative prompts to avoid unwanted elements

4. **Generate and Review**:
   - Click "Generate Edit" to process your request
   - View the result alongside the original
   - All versions are automatically saved

5. **Manage Versions**:
   - Browse through all previous edits
   - Compare different versions
   - Download any version
   - Duplicate versions to create variations

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Visit http://localhost:5173 to see the application running.

## API Integration

The application includes structure for integrating with image editing APIs like Stability AI, OpenAI DALL-E, etc. Check `/app/routes/api.edit.tsx` for implementation details.

- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
