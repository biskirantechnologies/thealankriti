const mongoose = require('mongoose');

// Product schema - simplified version
const productSchema = new mongoose.Schema({
  name: String,
  images: [Object]
});

const Product = mongoose.model('Product', productSchema);

async function checkProducts() {
  try {
    // Connect to production MongoDB
    await mongoose.connect('mongodb+srv://thealankriti_db_user:ZwHIC6cxgHdKzy50@thealankriti.b27onwb.mongodb.net/?retryWrites=true&w=majority&appName=thealankriti');
    console.log('🔗 Connected to Production MongoDB');
    
    const products = await Product.find({}).limit(5);
    console.log(`📦 Found ${products.length} products in production database`);
    
    products.forEach((product, index) => {
      console.log(`\n--- Product ${index + 1}: ${product.name} ---`);
      console.log('Images:', JSON.stringify(product.images, null, 2));
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from database');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkProducts();