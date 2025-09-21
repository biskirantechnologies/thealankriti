const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const cleanTestImages = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all products with test images
    const productsWithTestImages = await Product.find({
      'images.alt': { $regex: /Test Image/i }
    });

    console.log(`\n📋 Found ${productsWithTestImages.length} products with test images:`);
    
    productsWithTestImages.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - ${product.images.length} test images`);
    });

    if (productsWithTestImages.length === 0) {
      console.log('✅ No test images found in database');
      return;
    }

    console.log('\n🧹 Cleaning test images...');

    // Update all products to remove test images
    const result = await Product.updateMany(
      { 'images.alt': { $regex: /Test Image/i } },
      { $set: { images: [] } }
    );

    console.log(`✅ Cleaned test images from ${result.modifiedCount} products`);

    // Verify cleanup
    const remainingTestImages = await Product.find({
      'images.alt': { $regex: /Test Image/i }
    });

    if (remainingTestImages.length === 0) {
      console.log('✅ All test images successfully removed');
    } else {
      console.log(`⚠️ ${remainingTestImages.length} products still have test images`);
    }

    // Show updated product status
    const allProducts = await Product.find({});
    const productsWithImages = allProducts.filter(p => p.images && p.images.length > 0);
    const productsWithoutImages = allProducts.filter(p => !p.images || p.images.length === 0);

    console.log(`\n📊 Final Status:`);
    console.log(`  Total products: ${allProducts.length}`);
    console.log(`  Products with images: ${productsWithImages.length}`);
    console.log(`  Products without images: ${productsWithoutImages.length}`);

    if (productsWithoutImages.length > 0) {
      console.log(`\n📷 Products without images:`);
      productsWithoutImages.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error cleaning test images:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔚 Disconnected from MongoDB');
  }
};

// Run the cleanup
cleanTestImages();