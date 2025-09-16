const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('🧪 Testing Admin Login API...\n');
    
    // Test with bewithu.aj@gmail.com
    console.log('1. Testing login with bewithu.aj@gmail.com...');
    
    try {
      const response1 = await axios.post('http://localhost:3001/api/auth/admin-login', {
        email: 'bewithu.aj@gmail.com',
        password: 'admin123'
      });
      console.log('✅ Login successful for bewithu.aj@gmail.com');
      console.log('Token received:', response1.data.token ? 'Yes' : 'No');
    } catch (error1) {
      console.log('❌ Login failed for bewithu.aj@gmail.com');
      console.log('Error:', error1.response?.data?.message || error1.message);
    }
    
    // Test with admin@test.com
    console.log('\n2. Testing login with admin@test.com...');
    
    try {
      const response2 = await axios.post('http://localhost:3001/api/auth/admin-login', {
        email: 'admin@test.com',
        password: 'admin123'
      });
      console.log('✅ Login successful for admin@test.com');
      console.log('Token received:', response2.data.token ? 'Yes' : 'No');
    } catch (error2) {
      console.log('❌ Login failed for admin@test.com');
      console.log('Error:', error2.response?.data?.message || error2.message);
    }
    
    // Test with different password variations
    console.log('\n3. Testing with different password variations...');
    const passwords = ['admin123', 'password', '123456', 'admin', 'test123'];
    
    for (const password of passwords) {
      try {
        const response = await axios.post('http://localhost:3001/api/auth/admin-login', {
          email: 'admin@test.com',
          password: password
        });
        console.log(`✅ Login successful with password: ${password}`);
        break;
      } catch (error) {
        console.log(`❌ Failed with password: ${password}`);
      }
    }
    
  } catch (error) {
    console.error('❌ General error:', error.message);
  }
}

testAdminLogin();
