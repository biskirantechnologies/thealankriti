const axios = require('axios');

async function testAdminProductsAPI() {
  try {
    console.log('🔍 Testing admin/products API endpoint...');
    
    // First, let's test without authentication to see the response structure
    try {
      const response = await axios.get('http://localhost:5000/api/admin/products');
      console.log('✅ API Response received');
      console.log('📦 Response Status:', response.status);
      console.log('📦 Response Data Keys:', Object.keys(response.data));
      
      if (response.data.products) {
        console.log('📦 Products Count:', response.data.products.length);
        
        // Check each product
        response.data.products.forEach((product, index) => {
          console.log(`\n🔍 Product ${index + 1}: ${product.name}`);
          console.log('   Images:', JSON.stringify(product.images, null, 2));
          console.log('   Images Count:', product.images?.length || 0);
          
          if (product.images && product.images.length > 0) {
            product.images.forEach((img, imgIndex) => {
              console.log(`   Image ${imgIndex + 1}:`, {
                url: img.url || img,
                type: typeof img,
                isPrimary: img.isPrimary
              });
            });
          }
        });
        
        // Focus on Ring product
        const ringProduct = response.data.products.find(p => p.name === 'Ring');
        if (ringProduct) {
          console.log('\n💍 RING PRODUCT DETAILED ANALYSIS:');
          console.log('💍 Name:', ringProduct.name);
          console.log('💍 Images:', JSON.stringify(ringProduct.images, null, 2));
          console.log('💍 Images Type:', typeof ringProduct.images);
          console.log('💍 Images Length:', ringProduct.images?.length);
          
          if (ringProduct.images && ringProduct.images.length > 0) {
            console.log('💍 First Image:', ringProduct.images[0]);
            console.log('💍 First Image URL:', ringProduct.images[0]?.url || ringProduct.images[0]);
          }
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('🔒 API requires authentication. Let\'s check the raw response structure.');
        console.log('🔒 Response:', error.response.data);
      } else {
        console.error('❌ API Error:', error.message);
        if (error.response) {
          console.error('❌ Response Status:', error.response.status);
          console.error('❌ Response Data:', error.response.data);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminProductsAPI();