const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/The Alankriti_jewells')
  .then(() => console.log('📊 MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Product schema (simplified)
const productSchema = new mongoose.Schema({
  name: String,
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  price: Number,
  stockQuantity: Number,
  sku: String
});

const Product = mongoose.model('Product', productSchema);

async function updateProductImages() {
  try {
    console.log('🔧 Updating Products with Sample Images...\n');
    
    const products = await Product.find({});
    console.log(`📊 Found ${products.length} products to update\n`);
    
    // Sample image (using one that exists)
    const sampleImageUrl = '/uploads/products/product-1756484332742-131039068.png';
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // Update product with sample image
      product.images = [{
        url: sampleImageUrl,
        alt: `${product.name} image`,
        isPrimary: true
      }];
      
      await product.save();
      
      console.log(`✅ Updated ${product.name} (SKU: ${product.sku})`);
      console.log(`   Image URL: ${sampleImageUrl}`);
      console.log('');
    }
    
    console.log('🎉 All products updated with images!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔚 Database connection closed');
  }
}

updateProductImages();
