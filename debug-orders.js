const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ukriti_jewells')
  .then(() => console.log('📊 MongoDB Connected for debugging'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Order schema (simplified)
const orderSchema = new mongoose.Schema({
  orderNumber: String,
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerInfo: {
    email: String,
    firstName: String,
    lastName: String,
    phone: String
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number
  }],
  payment: {
    method: {
      type: String,
      enum: ['qr-code', 'upi', 'card', 'bank-transfer', 'cod']
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded']
    }
  },
  status: String,
  pricing: {
    total: Number
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

async function debugOrders() {
  try {
    console.log('\n🔍 Debugging Orders in Database...\n');
    
    // Get total count of orders
    const totalOrders = await Order.countDocuments();
    console.log(`📊 Total Orders in Database: ${totalOrders}`);
    
    // Get all orders with payment method details
    const allOrders = await Order.find({})
      .select('orderNumber customerInfo payment status pricing createdAt')
      .sort({ createdAt: -1 })
      .limit(20);
    
    console.log('\n📋 Recent Orders:');
    console.log('================');
    
    if (allOrders.length === 0) {
      console.log('❌ No orders found in database');
    } else {
      allOrders.forEach((order, index) => {
        console.log(`\n${index + 1}. Order: ${order.orderNumber || 'N/A'}`);
        console.log(`   Customer: ${order.customerInfo?.firstName || 'N/A'} ${order.customerInfo?.lastName || 'N/A'}`);
        console.log(`   Email: ${order.customerInfo?.email || 'N/A'}`);
        console.log(`   Payment Method: ${order.payment?.method || 'N/A'}`);
        console.log(`   Payment Status: ${order.payment?.status || 'N/A'}`);
        console.log(`   Order Status: ${order.status || 'N/A'}`);
        console.log(`   Total: ₹${order.pricing?.total || 0}`);
        console.log(`   Created: ${order.createdAt}`);
      });
    }
    
    // Check specifically for COD orders
    const codOrders = await Order.find({ 'payment.method': 'cod' })
      .select('orderNumber customerInfo payment status pricing createdAt')
      .sort({ createdAt: -1 });
    
    console.log(`\n💰 COD Orders Found: ${codOrders.length}`);
    
    if (codOrders.length > 0) {
      console.log('\n📋 COD Orders Details:');
      console.log('=====================');
      
      codOrders.forEach((order, index) => {
        console.log(`\n${index + 1}. COD Order: ${order.orderNumber || 'N/A'}`);
        console.log(`   Customer: ${order.customerInfo?.firstName || 'N/A'} ${order.customerInfo?.lastName || 'N/A'}`);
        console.log(`   Email: ${order.customerInfo?.email || 'N/A'}`);
        console.log(`   Payment Status: ${order.payment?.status || 'N/A'}`);
        console.log(`   Order Status: ${order.status || 'N/A'}`);
        console.log(`   Total: ₹${order.pricing?.total || 0}`);
        console.log(`   Created: ${order.createdAt}`);
      });
    } else {
      console.log('❌ No COD orders found in database');
    }
    
    // Check orders by status
    const statusBreakdown = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('\n📊 Orders by Status:');
    console.log('===================');
    statusBreakdown.forEach(item => {
      console.log(`   ${item._id || 'undefined'}: ${item.count}`);
    });
    
    // Check orders by payment method
    const paymentBreakdown = await Order.aggregate([
      {
        $group: {
          _id: '$payment.method',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('\n💳 Orders by Payment Method:');
    console.log('============================');
    paymentBreakdown.forEach(item => {
      console.log(`   ${item._id || 'undefined'}: ${item.count}`);
    });
    
  } catch (error) {
    console.error('❌ Error debugging orders:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔚 Database connection closed');
  }
}

// Run the debug function
debugOrders();
