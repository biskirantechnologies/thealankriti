const mongoose = require('mongoose');
require('./config/database');
const Product = require('./models/Product');

async function updateProductStock() {
  try {
    console.log('Updating product stock information...');
    
    // Update all products to have proper stock structure
    const result = await Product.updateMany({}, {
      $set: {
        'stock.quantity': 15,
        'stock.lowStockThreshold': 5,
        'stock.status': 'in-stock'
      }
    });
    
    console.log(`Updated ${result.modifiedCount} products with stock information`);
    
    // Update specific test product
    const testProduct = await Product.findById('68d0f914305bfebd8ae1b84d');
    if (testProduct) {
      testProduct.stock = {
        quantity: 10,
        lowStockThreshold: 5,
        status: 'in-stock'
      };
      await testProduct.save();
      console.log('Updated test product stock:', testProduct.stock);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating stock:', error);
    process.exit(1);
  }
}

setTimeout(updateProductStock, 2000);