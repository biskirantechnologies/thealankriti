# Admin Login Debug Script - PowerShell
# Test admin login flow step by step

Write-Host "🔍 ADMIN LOGIN DEBUG TEST" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Yellow

$BackendUrl = "https://thealankriti-backendd.onrender.com"
$FrontendUrl = "https://thealankriti-frontend.onrender.com"
$AdminEmail = "bewithu.aj@gmail.com"
$AdminPassword = "admin123"

# Test 1: Backend Health
Write-Host ""
Write-Host "📡 Test 1: Backend Health Check" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BackendUrl/health" -TimeoutSec 10
    $healthData = $response.Content | ConvertFrom-Json
    Write-Host "✅ Backend Online: $($healthData.status)" -ForegroundColor Green
    Write-Host "   Environment: $($healthData.environment)" -ForegroundColor White
    Write-Host "   Uptime: $($healthData.uptime) seconds" -ForegroundColor White
} catch {
    Write-Host "❌ Backend Health Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Admin Login API
Write-Host ""
Write-Host "🔑 Test 2: Admin Login API" -ForegroundColor Cyan
try {
    $loginPayload = @{
        email = $AdminEmail
        password = $AdminPassword
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$BackendUrl/api/auth/admin-login" -Method POST -Body $loginPayload -ContentType "application/json" -TimeoutSec 10
    
    if ($response.StatusCode -eq 200) {
        $loginData = $response.Content | ConvertFrom-Json
        Write-Host "✅ Admin Login API: SUCCESS" -ForegroundColor Green
        Write-Host "   User ID: $($loginData.user.id)" -ForegroundColor White
        Write-Host "   Email: $($loginData.user.email)" -ForegroundColor White
        Write-Host "   Role: $($loginData.user.role)" -ForegroundColor White
        Write-Host "   Token: $($loginData.token.Substring(0, 20))..." -ForegroundColor White
        
        # Store token for next test
        $global:AuthToken = $loginData.token
    } else {
        Write-Host "❌ Admin Login API: Failed ($($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Admin Login API Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorBody = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorBody)
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Error Details: $responseBody" -ForegroundColor Red
    }
}

# Test 3: Admin Dashboard API
if ($global:AuthToken) {
    Write-Host ""
    Write-Host "📊 Test 3: Admin Dashboard API" -ForegroundColor Cyan
    try {
        $headers = @{
            "Authorization" = "Bearer $global:AuthToken"
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-WebRequest -Uri "$BackendUrl/api/admin/dashboard" -Method GET -Headers $headers -TimeoutSec 10
        
        if ($response.StatusCode -eq 200) {
            $dashboardData = $response.Content | ConvertFrom-Json
            Write-Host "✅ Admin Dashboard API: SUCCESS" -ForegroundColor Green
            Write-Host "   Total Orders: $($dashboardData.summary.totalOrders)" -ForegroundColor White
            Write-Host "   Total Revenue: $($dashboardData.summary.totalRevenue)" -ForegroundColor White
            Write-Host "   Total Customers: $($dashboardData.summary.totalCustomers)" -ForegroundColor White
        } else {
            Write-Host "❌ Admin Dashboard API: Failed ($($response.StatusCode))" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Admin Dashboard API Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Frontend Access
Write-Host ""
Write-Host "🌐 Test 4: Frontend Access" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$FrontendUrl/admin-login" -TimeoutSec 10
    Write-Host "✅ Frontend Admin Login Page: Available ($($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend Admin Login Page: Failed - $($_.Exception.Message)" -ForegroundColor Red
}

# Test Results Summary
Write-Host ""
Write-Host "📋 SUMMARY & RECOMMENDATIONS" -ForegroundColor Green
Write-Host "=============================="
Write-Host "1. If all tests pass: The backend is working correctly" -ForegroundColor Yellow
Write-Host "2. Login using: Email: $AdminEmail, Password: $AdminPassword" -ForegroundColor Yellow
Write-Host "3. Check browser console (F12) for frontend errors" -ForegroundColor Yellow
Write-Host "4. Ensure REACT_APP_API_URL is set in Render frontend environment" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔧 If issues persist:" -ForegroundColor Cyan
Write-Host "- Redeploy backend with updated environment variables" -ForegroundColor White
Write-Host "- Ensure frontend environment variable REACT_APP_API_URL is set" -ForegroundColor White
Write-Host "- Clear browser cache and cookies" -ForegroundColor White
Write-Host ""
Write-Host "Test completed: $(Get-Date)" -ForegroundColor Gray