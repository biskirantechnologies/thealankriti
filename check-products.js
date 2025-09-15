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

async function checkProducts() {
  try {
    console.log('🔍 Checking Products and Their Images...\n');
    
    const products = await Product.find({}).limit(10);
    console.log(`📊 Found ${products.length} products\n`);
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      console.log(`${i + 1}. Product: ${product.name}`);
      console.log(`   SKU: ${product.sku}`);
      console.log(`   Price: NPR ${product.price}`);
      console.log(`   Images: ${product.images?.length || 0}`);
      
      if (product.images && product.images.length > 0) {
        product.images.forEach((img, idx) => {
          console.log(`   Image ${idx + 1}: ${img.url}`);
        });
      } else {
        console.log(`   ❌ NO IMAGES FOUND`);
      }
      console.log('');
    }
    
    // Count products with and without images
    const productsWithImages = await Product.countDocuments({ 
      $and: [
        { images: { $exists: true } },
        { images: { $ne: [] } },
        { 'images.0.url': { $exists: true, $ne: '' } }
      ]
    });
    
    const productsWithoutImages = await Product.countDocuments({
      $or: [
        { images: { $exists: false } },
        { images: { $eq: [] } },
        { 'images.0.url': { $exists: false } },
        { 'images.0.url': '' }
      ]
    });
    
    console.log('📈 Summary:');
    console.log(`✅ Products with images: ${productsWithImages}`);
    console.log(`❌ Products without images: ${productsWithoutImages}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkProducts();
