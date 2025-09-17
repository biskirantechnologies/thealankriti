# 🚀 Quick Deployment Script for Render (PowerShell)
# Run this script to prepare your project for Render deployment

Write-Host "🚀 Preparing Ukriti Jewells for Render Deployment..." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Navigate to project directory
$projectPath = "C:\Users\bewit\Downloads\Ukriti Jewells\thealankriti"
Set-Location $projectPath

# Check if git is initialized
if (!(Test-Path ".git")) {
    Write-Host "📁 Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository already exists" -ForegroundColor Green
}

# Add all files
Write-Host "📦 Adding all files to git..." -ForegroundColor Yellow
git add .

# Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
$commitMessage = "Deploy: Ready for Render deployment - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git commit -m $commitMessage

# Check if remote origin exists
$remotes = git remote
if ($remotes -contains "origin") {
    Write-Host "🔗 Remote origin already configured" -ForegroundColor Green
    Write-Host "📤 Pushing to existing repository..." -ForegroundColor Yellow
    git push origin main
} else {
    Write-Host "❓ No remote origin found." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Create a new repository on GitHub" -ForegroundColor White
    Write-Host "2. Run these commands:" -ForegroundColor White
    Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/ukriti-jewells.git" -ForegroundColor Gray
    Write-Host "   git branch -M main" -ForegroundColor Gray
    Write-Host "   git push -u origin main" -ForegroundColor Gray
    Write-Host ""
}

Write-Host ""
Write-Host "🌐 Render Deployment URLs:" -ForegroundColor Cyan
Write-Host "Frontend: https://thealankriti-frontend.onrender.com" -ForegroundColor White
Write-Host "Backend:  https://thealankriti-backend.onrender.com" -ForegroundColor White
Write-Host "Admin:    https://thealankriti-frontend.onrender.com/admin/login" -ForegroundColor White
Write-Host ""
Write-Host "📖 See RENDER_DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ Ready for Render deployment!" -ForegroundColor Green