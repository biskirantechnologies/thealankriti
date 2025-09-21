# Production Health Monitor for TheAlankriti (PowerShell Version)
# Usage: .\monitor-production.ps1

Write-Host "🔍 THEALANKRITI PRODUCTION HEALTH CHECK" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Yellow

$BackendUrl = "https://thealankriti-backend.onrender.com"
$FrontendUrl = "https://thealankriti-frontend.onrender.com"

# Backend Health Check
Write-Host ""
Write-Host "🖥️  Backend Health Check..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BackendUrl/health" -TimeoutSec 10
    Write-Host "✅ Backend: ONLINE ($($response.StatusCode))" -ForegroundColor Green
    $healthData = $response.Content | ConvertFrom-Json
    Write-Host "   Uptime: $($healthData.uptime) seconds" -ForegroundColor White
    Write-Host "   Environment: $($healthData.environment)" -ForegroundColor White
    Write-Host "   Memory: $($healthData.memory)" -ForegroundColor White
} catch {
    Write-Host "❌ Backend: OFFLINE - $($_.Exception.Message)" -ForegroundColor Red
}

# API Endpoints Check
Write-Host ""
Write-Host "🔌 API Endpoints Check..." -ForegroundColor Cyan
$endpoints = @("/api/debug", "/api/products")
foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri "$BackendUrl$endpoint" -TimeoutSec 10
        Write-Host "✅ $endpoint : OK ($($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "❌ $endpoint : FAILED - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Frontend Check
Write-Host ""
Write-Host "🌐 Frontend Check..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $FrontendUrl -TimeoutSec 10
    Write-Host "✅ Frontend: ONLINE ($($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend: OFFLINE - $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 If frontend is offline, deploy it manually on Render" -ForegroundColor Yellow
}

# Database Check (indirect via API)
Write-Host ""
Write-Host "🗄️  Database Connectivity..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BackendUrl/api/products" -TimeoutSec 10
    Write-Host "✅ MongoDB: Connected (via API test)" -ForegroundColor Green
} catch {
    Write-Host "❌ MongoDB: Connection issues" -ForegroundColor Red
}

Write-Host ""
Write-Host "📊 MONITORING SUMMARY" -ForegroundColor Green
Write-Host "===================="
Write-Host "Backend URL: $BackendUrl"
Write-Host "Frontend URL: $FrontendUrl"
Write-Host "Timestamp: $(Get-Date)"
Write-Host ""
Write-Host "🔄 Run this script regularly to monitor production health" -ForegroundColor Yellow