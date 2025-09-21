const mongoose = require('mongoose');
const Product = require('./models/Product');
const fs = require('fs');
const path = require('path');

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ukriti-jewells';
mongoose.connect(mongoUri)
  .then(() => console.log('📊 MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function updateProductImages() {
  try {
    console.log('🔧 Updating Products with Available Images...\n');
    
    // Get available images from uploads directory
    const uploadsDir = path.join(__dirname, 'uploads', 'products');
    let availableImages = [];
    
    try {
      availableImages = fs.readdirSync(uploadsDir).filter(file => 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      );
    } catch (error) {
      console.error('Error reading uploads directory:', error);
    }
    
    console.log(`� Found ${availableImages.length} available images:`, availableImages);
    
    const products = await Product.find({});
    console.log(`📊 Found ${products.length} products to update\n`);
    
    if (availableImages.length === 0) {
      console.log('⚠️ No images found in uploads directory');
      return;
    }
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // Clear existing images
      product.images = [];
      
      // Assign 1-2 images per product, cycling through available images
      const numImages = Math.min(2, availableImages.length);
      
      for (let j = 0; j < numImages; j++) {
        const imageIndex = (i * numImages + j) % availableImages.length;
        const imageFile = availableImages[imageIndex];
        
        product.images.push({
          url: `/uploads/products/${imageFile}`,
          alt: `${product.name} - Image ${j + 1}`,
          isPrimary: j === 0  // First image is primary
        });
      }
      
      await product.save();
      
      console.log(`✅ Updated ${product.name} (SKU: ${product.sku || 'N/A'})`);
      product.images.forEach((img, idx) => {
        console.log(`   Image ${idx + 1}: ${img.url} (Primary: ${img.isPrimary})`);
      });
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
