const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config(); // Load environment variables

async function findAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB Atlas');
    
    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (adminUser) {
      console.log('👤 Admin user found:');
      console.log('   Email:', adminUser.email);
      console.log('   Name:', adminUser.name);
      console.log('   ID:', adminUser._id);
      console.log('   Role:', adminUser.role);
    } else {
      console.log('❌ No admin user found');
    }
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findAdminUser();