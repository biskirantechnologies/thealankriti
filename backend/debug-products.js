const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ukriti_jewells')
  .then(() => console.log('📊 MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Product schema (simplified)
const productSchema = new mongoose.Schema({
  name: String,
  images: [String],
  price: Number,
  stockQuantity: Number,
  sku: String
});

const Product = mongoose.model('Product', productSchema);

async function debugProducts() {
  try {
    console.log('🔍 Debugging Product Images...\n');
    
    const products = await Product.find({}).limit(5);
    
    console.log(`📊 Found ${products.length} products\n`);
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. Product: ${product.name}`);
      console.log(`   SKU: ${product.sku}`);
      console.log(`   Images: ${JSON.stringify(product.images)}`);
      console.log(`   Image URLs:`);
      if (product.images && product.images.length > 0) {
        product.images.forEach((img, imgIndex) => {
          console.log(`     ${imgIndex + 1}. ${img}`);
        });
      } else {
        console.log(`     No images found`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔚 Database connection closed');
  }
}

debugProducts();
