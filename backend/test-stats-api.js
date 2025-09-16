const axios = require('axios');

async function testOrdersStatsAPI() {
  try {
    console.log('🧪 Testing Orders Stats API...\n');
    
    // First login to get token
    console.log('1. Getting admin token...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/admin-login', {
      email: 'admin@ukritijewells.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Token received');
    
    // Test the stats endpoint
    console.log('\n2. Testing /api/admin/orders/stats...');
    const statsResponse = await axios.get('http://localhost:3001/api/admin/orders/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Stats API successful');
    console.log('Response:', JSON.stringify(statsResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testOrdersStatsAPI();
