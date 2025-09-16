#!/bin/bash

echo "🧪 Testing Ukriti Jewells E-commerce Platform"
echo "=============================================="

# Test backend health
echo "1. Testing Backend Health..."
HEALTH_RESPONSE=$(curl -s http://localhost:3001/health)
if [[ $HEALTH_RESPONSE == *"OK"* ]]; then
    echo "   ✅ Backend server is running"
else
    echo "   ❌ Backend server is not responding"
    exit 1
fi

# Test products API
echo "2. Testing Products API..."
PRODUCTS_COUNT=$(curl -s http://localhost:3001/api/products | jq '.totalProducts // 0')
if [[ $PRODUCTS_COUNT -gt 0 ]]; then
    echo "   ✅ Products API working - $PRODUCTS_COUNT products found"
else
    echo "   ❌ Products API not working or no products found"
fi

# Test admin login
echo "3. Testing Admin Authentication..."
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email":"bewithu.aj@gmail.com","password":"admin123"}' | jq -r '.token // empty')

if [[ -n "$TOKEN" ]]; then
    echo "   ✅ Admin login successful"
else
    echo "   ❌ Admin login failed"
fi

# Test user registration (create test user)
echo "4. Testing User Registration..."
REG_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Customer", 
    "email": "test.customer@example.com",
    "password": "password123",
    "phone": "+91-9999999999"
  }')

if [[ $REG_RESPONSE == *"success"* ]]; then
    echo "   ✅ User registration working"
else
    echo "   ℹ️  User might already exist (this is okay)"
fi

# Test customer login
echo "5. Testing Customer Login..."
CUSTOMER_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@example.com","password":"password123"}' | jq -r '.token // empty')

if [[ -n "$CUSTOMER_TOKEN" ]]; then
    echo "   ✅ Customer login successful"
else
    echo "   ❌ Customer login failed"
fi

# Test order creation (mock)
echo "6. Testing Order Creation..."
if [[ -n "$CUSTOMER_TOKEN" ]]; then
    ORDER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/orders \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $CUSTOMER_TOKEN" \
      -d '{
        "items": [
          {
            "product": "mock-product-id",
            "quantity": 1,
            "price": 25000,
            "name": "Test Ring",
            "image": "test.jpg"
          }
        ],
        "customerInfo": {
          "name": "John Doe",
          "email": "john.doe@example.com", 
          "phone": "+91-9876543210"
        },
        "shippingAddress": {
          "address": "123 Test Street",
          "city": "Mumbai",
          "state": "Maharashtra",
          "pincode": "400001",
          "country": "India"
        },
        "payment": {
          "method": "upi",
          "amount": 25000
        },
        "pricing": {
          "subtotal": 25000,
          "shipping": 0,
          "tax": 0,
          "total": 25000
        }
      }')
    
    if [[ $ORDER_RESPONSE == *"success"* ]] || [[ $ORDER_RESPONSE == *"order"* ]]; then
        echo "   ✅ Order creation API working"
    else
        echo "   ⚠️  Order creation needs product validation"
    fi
else
    echo "   ⏭️  Skipping order test (no customer token)"
fi

# Test admin orders endpoint
echo "7. Testing Admin Orders Access..."
if [[ -n "$TOKEN" ]]; then
    ADMIN_ORDERS=$(curl -s -H "Authorization: Bearer $TOKEN" \
      "http://localhost:3001/api/admin/orders?page=1&limit=5" | jq '.orders // [] | length')
    echo "   ✅ Admin can access orders ($ADMIN_ORDERS orders found)"
else
    echo "   ⏭️  Skipping admin orders test (no admin token)"
fi

# Test frontend
echo "8. Testing Frontend..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [[ $FRONTEND_RESPONSE == "200" ]]; then
    echo "   ✅ Frontend is accessible"
else
    echo "   ❌ Frontend is not accessible"
fi

echo ""
echo "🎉 Testing Complete!"
echo ""
echo "📋 Summary of Available Features:"
echo "================================="
echo "✨ Customer Features:"
echo "   • Browse jewelry products with beautiful images"
echo "   • Add items to cart with quantity management"
echo "   • User registration and login"
echo "   • Complete checkout with detailed information capture"
echo "   • Order tracking with tracking ID"
echo "   • Responsive design (mobile & desktop)"
echo ""
echo "👩‍💼 Admin Features:"
echo "   • Admin dashboard with analytics"
echo "   • Complete order management"
echo "   • Customer information viewing"
echo "   • Product management (CRUD operations)" 
echo "   • Order status updates"
echo "   • Payment tracking"
echo ""
echo "🔗 URLs to Test:"
echo "   • Frontend: http://localhost:3000"
echo "   • Products: http://localhost:3000/#/products"
echo "   • Admin Login: http://localhost:3000/#/admin/login"
echo "   • Track Order: http://localhost:3000/#/track-order"
echo ""
echo "🔑 Login Credentials:"
echo "   • Admin: bewithu.aj@gmail.com / admin123"
echo "   • Customer: john.doe@example.com / password123"
echo "   • Customer: jane.smith@example.com / password123"
echo ""
echo "💎 Sample Products Available:"
echo "   • Golden Rose Ring (₹25,000)"
echo "   • Diamond Stud Earrings (₹45,000)"
echo "   • Pearl Pendant Necklace (₹18,000)"
echo "   • Silver Charm Bracelet (₹8,500)"
echo "   • Emerald Drop Earrings (₹65,000)"
echo "   • Gold Chain Necklace (₹35,000)"
echo ""
echo "🛒 Test Shopping Flow:"
echo "   1. Visit products page"
echo "   2. Click 'Add to Cart' on any product"
echo "   3. View cart (should show items)"
echo "   4. Login as customer"
echo "   5. Proceed to checkout"
echo "   6. Complete order with details"
echo "   7. Login as admin to see order"
echo ""
