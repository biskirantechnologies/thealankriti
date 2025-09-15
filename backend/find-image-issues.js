const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/The Alankriti_jewells')
  .then(() => console.log('📊 MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Product schema
const productSchema = new mongoose.Schema({
  name: String,
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  price: Number,
  category: String,
  sku: String
});

const Product = mongoose.model('Product', productSchema);

async function findProductsWithoutImages() {
  try {
    console.log('🔍 Finding Products WITHOUT Images...\n');
    
    // Find products without images
    const productsWithoutImages = await Product.find({
      $or: [
        { images: { $exists: false } },
        { images: { $eq: [] } },
        { 'images.0.url': { $exists: false } },
        { 'images.0.url': '' }
      ]
    });
    
    console.log(`❌ Found ${productsWithoutImages.length} products WITHOUT images:\n`);
    
    productsWithoutImages.forEach((product, index) => {
      console.log(`${index + 1}. Product: ${product.name}`);
      console.log(`   SKU: ${product.sku}`);
      console.log(`   Price: NPR ${product.price}`);
      console.log(`   Images: ${JSON.stringify(product.images)}`);
      console.log('');
    });
    
    // Also find all products to see which have issues
    const allProducts = await Product.find({});
    console.log(`\n📊 Checking ALL ${allProducts.length} products for image issues:\n`);
    
    allProducts.forEach((product, index) => {
      const hasValidImages = product.images && 
                           Array.isArray(product.images) && 
                           product.images.length > 0 && 
                           product.images[0].url && 
                           product.images[0].url.trim() !== '';
      
      if (!hasValidImages) {
        console.log(`❌ ISSUE: ${product.name} (${product.sku})`);
        console.log(`   Images: ${JSON.stringify(product.images)}`);
        console.log('');
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

findProductsWithoutImages();
