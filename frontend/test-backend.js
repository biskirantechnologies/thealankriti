// Simple test to check backend connectivity from frontend
const axios = require('axios');

async function testBackendConnection() {
  try {
    console.log('🔗 Testing backend connectivity from frontend...\n');
    
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:3001/health', {
      timeout: 5000
    });
    console.log(`✅ Health check successful: ${healthResponse.status}`);
    console.log(`   Response:`, healthResponse.data);
    
    // Test 2: Test any public endpoint (like products)
    console.log('\n2. Testing public products endpoint...');
    const productsResponse = await axios.get('http://localhost:3001/api/products', {
      timeout: 5000
    });
    console.log(`✅ Products endpoint accessible: ${productsResponse.status}`);
    console.log(`   Products found: ${productsResponse.data.products?.length || 0}`);
    
    // Test 3: Test auth endpoint (login)
    console.log('\n3. Testing auth endpoint...');
    try {
      const authResponse = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'test@example.com',
        password: 'wrongpassword'
      }, { timeout: 5000 });
    } catch (authError) {
      if (authError.response && authError.response.status === 400) {
        console.log(`✅ Auth endpoint accessible (expected 400 for wrong credentials): ${authError.response.status}`);
      } else {
        console.log(`❌ Auth endpoint error: ${authError.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Backend connectivity test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   → Backend server is not running or not accessible');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('   → Connection timeout - backend may be slow to respond');
    }
  }
}

testBackendConnection();
