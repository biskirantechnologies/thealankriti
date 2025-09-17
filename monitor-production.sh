#!/bin/bash

# Production Health Monitor for Ukriti Jewells
# Usage: ./monitor-production.sh

echo "🔍 UKRITI JEWELLS PRODUCTION HEALTH CHECK"
echo "======================================="

BACKEND_URL="https://thealankriti-backendd.onrender.com"
FRONTEND_URL="https://thealankriti-frontend.onrender.com"

# Backend Health Check
echo ""
echo "🖥️  Backend Health Check..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health")
if [ "$response" = "200" ]; then
    echo "✅ Backend: ONLINE ($response)"
    # Get detailed health info
    curl -s "$BACKEND_URL/health" | python3 -m json.tool 2>/dev/null || echo "Health data retrieved"
else
    echo "❌ Backend: OFFLINE ($response)"
fi

# API Endpoints Check
echo ""
echo "🔌 API Endpoints Check..."
endpoints=("/api/debug" "/api/products")
for endpoint in "${endpoints[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL$endpoint")
    if [ "$response" = "200" ]; then
        echo "✅ $endpoint: OK"
    else
        echo "❌ $endpoint: FAILED ($response)"
    fi
done

# Frontend Check
echo ""
echo "🌐 Frontend Check..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$response" = "200" ]; then
    echo "✅ Frontend: ONLINE ($response)"
else
    echo "❌ Frontend: OFFLINE ($response)"
    echo "💡 If frontend is offline, deploy it manually on Render"
fi

# Database Check (indirect via API)
echo ""
echo "🗄️  Database Connectivity..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/products")
if [ "$response" = "200" ]; then
    echo "✅ MongoDB: Connected (via API test)"
else
    echo "❌ MongoDB: Connection issues"
fi

echo ""
echo "📊 MONITORING SUMMARY"
echo "===================="
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo "Timestamp: $(date)"
echo ""
echo "🔄 Run this script regularly to monitor production health"