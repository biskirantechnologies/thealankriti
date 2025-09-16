const mongoose = require('mongoose');
const axios = require('axios');

// Test admin API directly
async function testAdminAPI() {
  try {
    console.log('🧪 Testing Admin API for Orders...\n');
    
    // First, let's try to get admin token (simulate login)
    console.log('1. Testing admin login...');
    
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@test.com',
      password: 'admin123'
    });
    
    if (loginResponse.data.token) {
      console.log('✅ Admin login successful');
      const token = loginResponse.data.token;
      
      // Now test the admin orders API
      console.log('\n2. Testing admin orders API...');
      
      const ordersResponse = await axios.get('http://localhost:3001/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Orders API responded with status: ${ordersResponse.status}`);
      console.log(`📊 Total orders returned: ${ordersResponse.data.orders?.length || 0}`);
      
      if (ordersResponse.data.orders && ordersResponse.data.orders.length > 0) {
        console.log('\n📋 Orders from API:');
        console.log('==================');
        
        ordersResponse.data.orders.forEach((order, index) => {
          console.log(`\n${index + 1}. Order: ${order.orderNumber || 'N/A'}`);
          console.log(`   Customer: ${order.customerInfo?.firstName || 'N/A'} ${order.customerInfo?.lastName || 'N/A'}`);
          console.log(`   Email: ${order.customerInfo?.email || 'N/A'}`);
          console.log(`   Payment Method: ${order.payment?.method || 'N/A'}`);
          console.log(`   Payment Status: ${order.payment?.status || 'N/A'}`);
          console.log(`   Order Status: ${order.status || 'N/A'}`);
          console.log(`   Total: ₹${order.pricing?.total || 0}`);
          console.log(`   Created: ${order.createdAt}`);
        });
      } else {
        console.log('❌ No orders returned from API');
      }
      
      // Check pagination info
      if (ordersResponse.data.pagination) {
        console.log('\n📄 Pagination Info:');
        console.log('===================');
        console.log(`   Current Page: ${ordersResponse.data.pagination.currentPage}`);
        console.log(`   Total Pages: ${ordersResponse.data.pagination.totalPages}`);
        console.log(`   Total Orders: ${ordersResponse.data.pagination.totalOrders}`);
        console.log(`   Limit: ${ordersResponse.data.pagination.limit}`);
      }
      
    } else {
      console.log('❌ Admin login failed - no token received');
    }
    
  } catch (error) {
    console.error('❌ Error testing admin API:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, error.response.data);
    }
  }
}

// Run the test
testAdminAPI();
