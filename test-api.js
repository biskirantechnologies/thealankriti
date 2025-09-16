const http = require('http');

function testAPI() {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/products',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ API Test Successful!');
        console.log(`📊 Products returned: ${response.products?.length || 0}`);
        console.log(`📄 Total products: ${response.pagination?.totalProducts || 0}`);
        
        if (response.products?.length > 0) {
          console.log(`📝 Sample product: ${response.products[0].name}`);
        }
      } catch (error) {
        console.log('❌ Failed to parse API response:', error.message);
        console.log('Raw response:', data.substring(0, 200));
      }
      process.exit(0);
    });
  });

  req.on('error', (error) => {
    console.log('❌ API connection failed:', error.message);
    console.log('🔍 Make sure backend server is running on port 3001');
    process.exit(1);
  });

  req.setTimeout(5000, () => {
    console.log('❌ API request timed out');
    req.destroy();
    process.exit(1);
  });

  req.end();
}

console.log('🧪 Testing Products API...');
testAPI();
