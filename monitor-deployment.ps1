# Monitor Frontend Deployment Progress
# This script checks when the routing fix is deployed

Write-Host "🔄 MONITORING FRONTEND DEPLOYMENT" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Yellow

$FrontendUrl = "https://thealankriti-frontend.onrender.com"
$TestUrl = "$FrontendUrl/admin-login"
$MaxAttempts = 20
$WaitSeconds = 30

Write-Host "📡 Testing URL: $TestUrl" -ForegroundColor Cyan
Write-Host "⏰ Checking every $WaitSeconds seconds (max $MaxAttempts attempts)" -ForegroundColor Yellow
Write-Host ""

for ($i = 1; $i -le $MaxAttempts; $i++) {
    Write-Host "🔍 Attempt $i/$MaxAttempts - $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
    
    try {
        # Test the admin-login route directly
        $response = Invoke-WebRequest -Uri $TestUrl -TimeoutSec 15 -Method HEAD
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ SUCCESS! Frontend routing is fixed!" -ForegroundColor Green
            Write-Host "   Status: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Green
            Write-Host ""
            Write-Host "🎉 Admin login page is now accessible at:" -ForegroundColor Green
            Write-Host "   $TestUrl" -ForegroundColor White
            Write-Host ""
            Write-Host "🔑 Login credentials:" -ForegroundColor Yellow
            Write-Host "   Email: bewithu.aj@gmail.com" -ForegroundColor White
            Write-Host "   Password: admin123" -ForegroundColor White
            Write-Host ""
            Write-Host "📝 Run full test with: .\test-admin-login.ps1" -ForegroundColor Cyan
            exit 0
        }
    } catch {
        $statusCode = "Unknown"
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
        }
        
        Write-Host "❌ Still deploying... (Status: $statusCode)" -ForegroundColor Yellow
        
        if ($statusCode -eq 404) {
            Write-Host "   Old version still active (404 on /admin-login)" -ForegroundColor Gray
        } elseif ($statusCode -eq 502 -or $statusCode -eq 503) {
            Write-Host "   Deployment in progress (502/503 errors)" -ForegroundColor Gray
        }
    }
    
    if ($i -lt $MaxAttempts) {
        Write-Host "   ⏳ Waiting $WaitSeconds seconds..." -ForegroundColor Gray
        Start-Sleep -Seconds $WaitSeconds
    }
}

Write-Host ""
Write-Host "⚠️  Deployment taking longer than expected" -ForegroundColor Yellow
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Check Render dashboard for deployment status" -ForegroundColor White
Write-Host "2. Try the hash URL: $FrontendUrl/#/admin-login" -ForegroundColor White
Write-Host "3. Run: .\test-admin-login.ps1" -ForegroundColor White