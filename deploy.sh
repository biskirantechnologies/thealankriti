#!/bin/bash

echo "🚀 Ukriti Jewells Deployment Script"
echo "=================================="

# Build the frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "✅ Frontend build complete!"
echo ""
echo "🌐 Hosting Options:"
echo ""
echo "1. Netlify (Recommended):"
echo "   - Go to https://netlify.com"
echo "   - Drag and drop the 'frontend/build' folder"
echo "   - Your site will be live instantly!"
echo ""
echo "2. GitHub Pages:"
echo "   - Create a new repository on GitHub"
echo "   - Push this code to the repository"
echo "   - Run: cd frontend && npm run deploy"
echo ""
echo "3. Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Import your GitHub repository"
echo "   - Deploy automatically!"
echo ""
echo "4. Manual hosting:"
echo "   - Upload the contents of 'frontend/build' folder"
echo "   - to any web hosting service"
echo ""
echo "📁 Your built files are in: frontend/build"
echo "🎉 Your beautiful minimalist jewelry website is ready to host!"
