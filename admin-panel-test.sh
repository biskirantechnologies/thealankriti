#!/bin/bash

# Admin Panel Feature Testing Script
# This script tests all admin panel features and APIs

echo "🔧 Admin Panel Feature Test Suite"
echo "=================================="

# Test variables
ADMIN_TOKEN=""
BASE_URL="http://localhost:3001/api"

# Function to get admin token
get_admin_token() {
    echo "🔐 Getting admin authentication token..."
    response=$(curl -s -X POST "$BASE_URL/auth/admin-login" \
        -H "Content-Type: application/json" \
        -d '{"email": "bewithu.aj@gmail.com", "password": "admin123"}')
    
    ADMIN_TOKEN=$(echo $response | jq -r '.token')
    
    if [ "$ADMIN_TOKEN" != "null" ] && [ -n "$ADMIN_TOKEN" ]; then
        echo "✅ Admin login successful"
        return 0
    else
        echo "❌ Admin login failed: $response"
        return 1
    fi
}

# Test function template
test_api() {
    local name="$1"
    local endpoint="$2"
    local method="${3:-GET}"
    local data="${4:-}"
    
    echo "🧪 Testing: $name"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $ADMIN_TOKEN")
    else
        response=$(curl -s -X "$method" "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    # Check if response is valid JSON and not an error
    if echo "$response" | jq . >/dev/null 2>&1; then
        error_msg=$(echo "$response" | jq -r '.message // empty')
        if [[ "$error_msg" =~ (error|Error|failed|Failed) ]]; then
            echo "⚠️  $name: $error_msg"
        else
            echo "✅ $name: Working"
        fi
    else
        echo "❌ $name: Invalid response"
    fi
}

# Main test execution
main() {
    echo ""
    echo "Starting admin panel tests..."
    echo ""
    
    # Get authentication token
    if ! get_admin_token; then
        echo "❌ Cannot proceed without authentication"
        exit 1
    fi
    
    echo ""
    echo "🏠 DASHBOARD TESTS"
    echo "=================="
    test_api "Dashboard Stats" "/admin/dashboard"
    test_api "Dashboard (7 days)" "/admin/dashboard?period=7"
    test_api "Dashboard (30 days)" "/admin/dashboard?period=30"
    
    echo ""
    echo "📦 PRODUCT MANAGEMENT TESTS"
    echo "============================"
    test_api "Get Products" "/admin/products"
    test_api "Get Products (Paginated)" "/admin/products?page=1&limit=5"
    test_api "Search Products" "/admin/products?search=test"
    test_api "Filter by Category" "/admin/products?category=rings"
    test_api "Filter by Status" "/admin/products?status=active"
    
    # Test product creation
    echo "🧪 Testing: Create Product"
    create_response=$(curl -s -X POST "$BASE_URL/admin/products" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Test Admin Product",
            "description": "Test product created by admin panel test",
            "category": "rings",
            "price": 999,
            "stockQuantity": 10,
            "sku": "TEST_ADMIN_'$(date +%s)'"
        }')
    
    if echo "$create_response" | jq . >/dev/null 2>&1; then
        product_id=$(echo "$create_response" | jq -r '.product._id // .product.id // empty')
        if [ -n "$product_id" ]; then
            echo "✅ Create Product: Working (ID: $product_id)"
            
            # Test product update
            test_api "Update Product" "/admin/products/$product_id" "PUT" '{"name": "Updated Test Product"}'
            
            # Test stock update
            test_api "Update Stock" "/admin/products/$product_id/stock" "PUT" '{"quantity": 20}'
            
            # Test product deletion
            test_api "Delete Product" "/admin/products/$product_id" "DELETE"
        else
            echo "⚠️  Create Product: Created but no ID returned"
        fi
    else
        echo "❌ Create Product: Failed"
    fi
    
    echo ""
    echo "📋 ORDER MANAGEMENT TESTS"
    echo "=========================="
    test_api "Get Orders" "/admin/orders"
    test_api "Get Orders (Paginated)" "/admin/orders?page=1&limit=3"
    test_api "Filter Orders by Status" "/admin/orders?status=pending"
    test_api "Search Orders" "/admin/orders?search=test"
    test_api "Order Statistics" "/admin/orders/stats"
    
    # Test order status update (if orders exist)
    echo "🧪 Testing: Order Status Update"
    orders_response=$(curl -s "$BASE_URL/admin/orders?limit=1" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    
    order_id=$(echo "$orders_response" | jq -r '.orders[0]._id // empty')
    if [ -n "$order_id" ]; then
        test_api "Update Order Status" "/admin/orders/$order_id/status" "PUT" '{"status": "confirmed"}'
        test_api "Get Order Details" "/admin/orders/$order_id"
    else
        echo "⚠️  Order Status Update: No orders to test with"
    fi
    
    echo ""
    echo "👥 CUSTOMER MANAGEMENT TESTS"
    echo "============================="
    test_api "Get Customers" "/admin/customers"
    test_api "Get Customers (Paginated)" "/admin/customers?page=1&limit=5"
    test_api "Customer Statistics" "/admin/customers/stats"
    test_api "Search Customers" "/admin/customers?search=test"
    
    echo ""
    echo "📊 ANALYTICS TESTS"
    echo "=================="
    test_api "General Analytics" "/admin/analytics"
    test_api "Sales Analytics" "/admin/analytics?type=sales"
    test_api "Customer Analytics" "/admin/analytics?type=customers"
    
    echo ""
    echo "🔧 UTILITY TESTS"
    echo "================"
    echo "🧪 Testing: Export Orders"
    export_response=$(curl -s -X POST "$BASE_URL/admin/orders/export" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"status": "all"}')
    
    if echo "$export_response" | jq . >/dev/null 2>&1; then
        echo "✅ Export Orders: Working"
    else
        echo "❌ Export Orders: Failed"
    fi
    
    echo ""
    echo "📤 UPLOAD TESTS"
    echo "==============="
    echo "🧪 Testing: Image Upload"
    # Create a test image file
    echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > /tmp/test-image.png
    
    upload_response=$(curl -s -X POST "$BASE_URL/admin/upload-image" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -F "image=@/tmp/test-image.png")
    
    if echo "$upload_response" | jq . >/dev/null 2>&1; then
        echo "✅ Image Upload: Working"
    else
        echo "❌ Image Upload: Failed"
    fi
    
    # Cleanup
    rm -f /tmp/test-image.png
    
    echo ""
    echo "🎯 TEST SUMMARY"
    echo "==============="
    echo "All admin panel API tests completed!"
    echo "Check the results above for any failing features."
    echo ""
    echo "🌐 Frontend URLs to test manually:"
    echo "• Admin Login: http://localhost:3000/admin-login"
    echo "• Admin Dashboard: http://localhost:3000/admin"
    echo ""
    echo "📝 Note: Some features may require additional manual testing"
    echo "in the browser interface for complete validation."
}

# Run tests
main
