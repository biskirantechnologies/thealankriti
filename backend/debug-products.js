const mongoose = require('mongoose');
require('dotenv').config();

// Import Product model
const Product = require('./models/Product');

async function debugProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all products
    const products = await Product.find({}).limit(3);
    console.log(`📦 Found ${products.length} products in database:`);

    products.forEach((product, index) => {
      console.log(`\n--- Product ${index + 1}: ${product.name} ---`);
      console.log('ID:', product._id);
      console.log('Category:', product.category);
      console.log('Price:', product.price);
      console.log('Images:', JSON.stringify(product.images, null, 2));
      console.log('Images type:', typeof product.images);
      console.log('Images length:', product.images?.length || 0);
      
      if (product.images && product.images.length > 0) {
        console.log('First image:', product.images[0]);
        console.log('First image type:', typeof product.images[0]);
        if (typeof product.images[0] === 'object') {
          console.log('First image properties:', Object.keys(product.images[0]));
        }
      } else {
        console.log('❌ No images found for this product');
      }
    });

    // Count products with and without images
    const productsWithImages = await Product.countDocuments({ 
      images: { $exists: true, $ne: [] } 
    });
    const productsWithoutImages = await Product.countDocuments({ 
      $or: [
        { images: { $exists: false } },
        { images: { $size: 0 } }
      ]
    });

    console.log(`\n📊 Summary:`);
    console.log(`Total products: ${products.length}`);
    console.log(`Products with images: ${productsWithImages}`);
    console.log(`Products without images: ${productsWithoutImages}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

debugProducts();