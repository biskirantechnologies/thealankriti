#!/usr/bin/env node

const axios = require('axios');

async function testOrderFlow() {
  console.log('🧪 Testing Order Flow for Admin Panel Visibility\n');

  try {
    // Step 1: Test admin login
    console.log('1. Testing admin login...');
    const adminLogin = await axios.post('http://localhost:3001/api/auth/admin-login', {
      email: 'bewithu.aj@gmail.com',
      password: 'admin123'
    });

    if (!adminLogin.data.token) {
      console.error('❌ Admin login failed - no token received');
      return;
    }

    const adminToken = adminLogin.data.token;
    console.log('✅ Admin login successful');

    // Step 2: Test user login (for order creation)
    console.log('\n2. Testing user login...');
    let userToken;
    try {
      const userLogin = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      userToken = userLogin.data.token;
      console.log('✅ User login successful');
    } catch (error) {
      console.log('⚠️ No test user found, creating one...');
      
      // Create test user
      const userRegistration = await axios.post('http://localhost:3001/api/auth/register', {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        phone: '9876543210'
      });
      userToken = userRegistration.data.token;
      console.log('✅ Test user created and logged in');
    }

    // Step 3: Get current orders count
    console.log('\n3. Checking current orders in admin panel...');
    const currentOrders = await axios.get('http://localhost:3001/api/admin/orders', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const initialOrderCount = currentOrders.data.orders?.length || 0;
    console.log(`📊 Current orders in system: ${initialOrderCount}`);

    // Step 4: Create a new test order
    console.log('\n4. Creating a new test order...');
    const testOrder = {
      items: [{
        product: "507f1f77bcf86cd799439011", // Dummy but valid ObjectId
        productSnapshot: {
          name: "Test Diamond Ring",
          sku: "TEST-RING-001",
          image: "/uploads/products/test-product.jpg",
          price: 2500,
          specifications: { material: "Gold", weight: "5g" }
        },
        quantity: 1,
        price: 2500,
        variant: {}
      }],
      customerInfo: {
        firstName: "John",
        lastName: "Doe",
        email: "test@example.com",
        phone: "9876543210",
        userId: "507f1f77bcf86cd799439012"
      },
      shippingAddress: {
        firstName: "John",
        lastName: "Doe",
        email: "test@example.com",
        phone: "9876543210",
        street: "123 Test Street",
        apartment: "Apt 4B",
        city: "Kathmandu",
        state: "Bagmati",
        zipCode: "44600",
        country: "Nepal"
      },
      billingAddress: {
        firstName: "John",
        lastName: "Doe",
        email: "test@example.com",
        phone: "9876543210",
        street: "123 Test Street",
        apartment: "Apt 4B",
        city: "Kathmandu",
        state: "Bagmati",
        zipCode: "44600",
        country: "Nepal"
      },
      payment: {
        method: "cod",
        status: "pending",
        transactionId: `COD-${Date.now()}`
      },
      pricing: {
        subtotal: 2500,
        shippingCost: 100,
        tax: 125,
        discount: 0,
        total: 2725
      },
      couponDiscount: 0,
      notes: {
        customerNotes: "Test order for admin panel visibility",
        specialInstructions: "This is a test order",
        giftMessage: ""
      },
      orderSource: "website",
      deviceInfo: {
        userAgent: "Test Agent",
        platform: "Test Platform",
        timestamp: new Date().toISOString()
      }
    };

    const orderResponse = await axios.post('http://localhost:3001/api/orders', testOrder, {
      headers: { 
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Test order created successfully');
    console.log(`📦 Order ID: ${orderResponse.data.order.id}`);
    console.log(`📋 Order Number: ${orderResponse.data.order.orderNumber}`);

    // Step 5: Wait a moment and check admin panel again
    console.log('\n5. Waiting 2 seconds and checking admin panel...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const updatedOrders = await axios.get('http://localhost:3001/api/admin/orders', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    const newOrderCount = updatedOrders.data.orders?.length || 0;
    console.log(`📊 Orders after creation: ${newOrderCount}`);

    if (newOrderCount > initialOrderCount) {
      console.log('✅ SUCCESS: New order is visible in admin panel!');
      
      // Show the latest order
      const latestOrder = updatedOrders.data.orders[0];
      console.log('\n📋 Latest Order Details:');
      console.log(`   - Order Number: ${latestOrder.orderNumber}`);
      console.log(`   - Customer: ${latestOrder.customerInfo.firstName} ${latestOrder.customerInfo.lastName}`);
      console.log(`   - Total: NPR ${latestOrder.pricing.total}`);
      console.log(`   - Payment: ${latestOrder.payment.method.toUpperCase()}`);
      console.log(`   - Status: ${latestOrder.status}`);
      console.log(`   - Created: ${new Date(latestOrder.createdAt).toLocaleString()}`);
    } else {
      console.log('❌ PROBLEM: New order is NOT visible in admin panel!');
      console.log('\n🔍 Possible Issues:');
      console.log('   - Order creation succeeded but not indexed properly');
      console.log('   - Admin query has filters that exclude new orders');
      console.log('   - Database synchronization issue');
      console.log('   - Pagination issue (new orders on different page)');
    }

    // Step 6: Try to fetch the specific order by ID
    console.log('\n6. Testing direct order retrieval...');
    try {
      const specificOrder = await axios.get(`http://localhost:3001/api/admin/orders/${orderResponse.data.order.id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Specific order retrieval works - order exists in database');
    } catch (error) {
      console.log('❌ Cannot retrieve specific order:', error.response?.data?.message || error.message);
    }

    // Step 7: Check pagination and filters
    console.log('\n7. Testing pagination and filters...');
    const allOrdersPage1 = await axios.get('http://localhost:3001/api/admin/orders?page=1&limit=50', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`📊 Orders on page 1 (limit 50): ${allOrdersPage1.data.orders?.length || 0}`);

    const pendingOrders = await axios.get('http://localhost:3001/api/admin/orders?status=pending', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`📊 Pending orders: ${pendingOrders.data.orders?.length || 0}`);

    // Step 8: Test order stats
    console.log('\n8. Testing order statistics...');
    const orderStats = await axios.get('http://localhost:3001/api/admin/orders/stats', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('📈 Order Statistics:', {
      total: orderStats.data.total,
      pending: orderStats.data.pending,
      confirmed: orderStats.data.confirmed,
      totalRevenue: orderStats.data.totalRevenue
    });

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testOrderFlow().then(() => {
  console.log('\n🏁 Test completed');
}).catch(error => {
  console.error('💥 Test crashed:', error.message);
});
