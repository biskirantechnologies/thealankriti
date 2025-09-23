const mongoose = require('mongoose');
const Order = require('./models/Order');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thealankriti', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const inspectOrderDetails = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Get the order details
    const order = await Order.findOne().sort({ createdAt: -1 });
    
    if (order) {
      console.log('\n📋 Order Details:');
      console.log('Order ID:', order._id);
      console.log('Order Number:', order.orderNumber);
      console.log('Customer:', order.customerInfo);
      console.log('\n🛍️ Items:');
      order.items.forEach((item, index) => {
        console.log(`Item ${index + 1}:`);
        console.log('  Product ID:', item.product);
        console.log('  Product Snapshot:', JSON.stringify(item.productSnapshot, null, 2));
        console.log('  Quantity:', item.quantity);
        console.log('  Price:', item.price);
        console.log('');
      });
      
      console.log('\n💰 Pricing:', order.pricing);
      console.log('\n📦 Status:', order.status);
      console.log('\n💳 Payment:', order.payment);
    } else {
      console.log('\n❌ No orders found');
    }
    
  } catch (error) {
    console.error('❌ Error inspecting order:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Load environment variables if .env file exists
try {
  require('dotenv').config();
} catch (e) {
  console.log('No .env file found, using default values');
}

inspectOrderDetails();