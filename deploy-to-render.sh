#!/bin/bash

# 🚀 Quick Deployment Script for Render
# Run this script to prepare your project for Render deployment

echo "🚀 Preparing Ukriti Jewells for Render Deployment..."
echo "=================================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git repository already exists"
fi

# Add all files
echo "📦 Adding all files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy: Ready for Render deployment - $(date)"

# Check if remote origin exists
if git remote | grep -q "origin"; then
    echo "🔗 Remote origin already configured"
    echo "📤 Pushing to existing repository..."
    git push origin main
else
    echo "❓ No remote origin found."
    echo ""
    echo "📋 Next steps:"
    echo "1. Create a new repository on GitHub"
    echo "2. Run these commands:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/ukriti-jewells.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
fi

echo ""
echo "🌐 Render Deployment URLs:"
echo "Frontend: https://thealankriti-frontend.onrender.com"
echo "Backend:  https://thealankriti-backend.onrender.com"
echo "Admin:    https://thealankriti-frontend.onrender.com/admin/login"
echo ""
echo "📖 See RENDER_DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
echo "✨ Ready for Render deployment!"