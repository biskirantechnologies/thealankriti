const axios = require('axios');
require('dotenv').config();

async function testAdminProductsAPIWithAuth() {
  try {
    console.log('🔍 Testing admin/products API with authentication...');
    
    // Step 1: Login as admin to get token
    console.log('🔑 Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: process.env.ADMIN_EMAIL || 'bewithu.aj@gmail.com',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    });
    
    console.log('✅ Login successful');
    console.log('🔑 Token received:', loginResponse.data.token ? 'Yes' : 'No');
    
    const token = loginResponse.data.token;
    
    // Step 2: Call admin products API with token
    console.log('\n📦 Fetching admin products...');
    const productsResponse = await axios.get('http://localhost:5000/api/admin/products', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Products API Response received');
    console.log('📦 Response Status:', productsResponse.status);
    console.log('📦 Response Data Keys:', Object.keys(productsResponse.data));
    
    if (productsResponse.data.products) {
      console.log('📦 Products Count:', productsResponse.data.products.length);
      
      // Check each product
      productsResponse.data.products.forEach((product, index) => {
        console.log(`\n🔍 Product ${index + 1}: ${product.name}`);
        console.log('   ID:', product._id);
        console.log('   Images:', JSON.stringify(product.images, null, 2));
        console.log('   Images Count:', product.images?.length || 0);
        console.log('   Images Type:', typeof product.images);
        
        if (product.images && product.images.length > 0) {
          product.images.forEach((img, imgIndex) => {
            console.log(`   Image ${imgIndex + 1}:`, {
              url: img.url || img,
              type: typeof img,
              isPrimary: img.isPrimary,
              alt: img.alt
            });
          });
        }
      });
      
      // Focus on Ring product
      const ringProduct = productsResponse.data.products.find(p => p.name === 'Ring');
      if (ringProduct) {
        console.log('\n💍 RING PRODUCT DETAILED ANALYSIS:');
        console.log('💍 Name:', ringProduct.name);
        console.log('💍 Images Raw:', JSON.stringify(ringProduct.images, null, 2));
        console.log('💍 Images Type:', typeof ringProduct.images);
        console.log('💍 Images Length:', ringProduct.images?.length);
        console.log('💍 Images is Array:', Array.isArray(ringProduct.images));
        
        if (ringProduct.images && ringProduct.images.length > 0) {
          console.log('💍 First Image:', ringProduct.images[0]);
          console.log('💍 First Image Type:', typeof ringProduct.images[0]);
          console.log('💍 First Image URL:', ringProduct.images[0]?.url || ringProduct.images[0]);
          
          // Test URL construction
          const firstImg = ringProduct.images[0];
          const baseUrl = 'http://localhost:5000';
          let imageUrl = '';
          
          if (typeof firstImg === 'string') {
            imageUrl = firstImg.startsWith('/') ? `${baseUrl}${firstImg}` : `${baseUrl}/${firstImg}`;
          } else if (firstImg && firstImg.url) {
            imageUrl = firstImg.url.startsWith('/') ? `${baseUrl}${firstImg.url}` : `${baseUrl}/${firstImg.url}`;
          }
          
          console.log('💍 Constructed URL:', imageUrl);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('❌ Response Status:', error.response.status);
      console.error('❌ Response Data:', error.response.data);
    }
  }
}

testAdminProductsAPIWithAuth();