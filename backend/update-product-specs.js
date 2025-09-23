const mongoose = require('mongoose');
const Product = require('./models/Product');

// MongoDB connection string from environment or hardcoded for development
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thealankriti';

async function updateProductSpecifications() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Find the product that needs specifications
    const product = await Product.findOne({ sku: 'PROD_1758525716302' });
    
    if (!product) {
      console.log('❌ Product not found with SKU: PROD_1758525716302');
      process.exit(1);
    }
    
    console.log(`📍 Found product: ${product.name}`);
    console.log(`📦 Current specifications:`, product.specifications);
    
    // Update with sample jewelry specifications
    const updatedSpecifications = {
      metal: 'gold',
      purity: '18k',
      gemstone: 'diamond',
      weight: {
        value: 2.5,
        unit: 'grams'
      },
      dimensions: {
        length: 15,
        width: 8,
        height: 3,
        unit: 'mm'
      }
    };
    
    product.specifications = updatedSpecifications;
    await product.save();
    
    console.log('✅ Successfully updated product specifications:');
    console.log('- Metal Type: Gold');
    console.log('- Purity: 18K');
    console.log('- Gemstone: Diamond');
    console.log('- Weight: 2.5 grams');
    console.log('- Dimensions: 15x8x3 mm');
    
    console.log('\n🎉 Product specifications updated successfully!');
    console.log('You can now view the product with proper specification data.');
    
  } catch (error) {
    console.error('❌ Error updating product:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

updateProductSpecifications();