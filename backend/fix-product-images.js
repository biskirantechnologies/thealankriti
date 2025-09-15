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

async function fixProductImages() {
  try {
    console.log('🔧 Fixing Product Images...\n');
    
    // Use the existing image file
    const existingImageUrl = '/uploads/products/product-1756915898917-768217433.jpeg';
    
    // Find all products
    const allProducts = await Product.find({});
    console.log(`📊 Found ${allProducts.length} products\n`);
    
    let fixedCount = 0;
    
    for (const product of allProducts) {
      let needsUpdate = false;
      
      // Check if product has no images
      if (!product.images || product.images.length === 0) {
        console.log(`❌ Product "${product.name}" has NO images - Adding image`);
        product.images = [{
          url: existingImageUrl,
          alt: `${product.name} image`,
          isPrimary: true
        }];
        needsUpdate = true;
        fixedCount++;
      }
      // Check if product has broken image URLs
      else if (product.images.length > 0) {
        const imageUrl = product.images[0].url;
        // If the image URL references the non-existent file, update it
        if (imageUrl && imageUrl.includes('product-1756484332742-131039068.png')) {
          console.log(`🔧 Product "${product.name}" has broken image URL - Fixing`);
          product.images[0].url = existingImageUrl;
          product.images[0].alt = `${product.name} image`;
          product.images[0].isPrimary = true;
          needsUpdate = true;
          fixedCount++;
        } else {
          console.log(`✅ Product "${product.name}" has valid image: ${imageUrl}`);
        }
      }
      
      // Save if updates needed
      if (needsUpdate) {
        await product.save();
        console.log(`   ✅ Updated ${product.name}\n`);
      }
    }
    
    console.log(`\n🎉 Image fix complete!`);
    console.log(`📊 Products fixed: ${fixedCount}`);
    console.log(`📸 All products now use: ${existingImageUrl}`);
    
    // Verify the fix
    console.log('\n🔍 Verification:');
    const productsWithoutImages = await Product.countDocuments({
      $or: [
        { images: { $exists: false } },
        { images: { $eq: [] } },
        { 'images.0.url': { $exists: false } },
        { 'images.0.url': '' }
      ]
    });
    
    console.log(`✅ Products without images: ${productsWithoutImages}`);
    console.log(`✅ All products should now have images!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixProductImages();
