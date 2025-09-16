const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ukriti_jewells')
  .then(() => console.log('📊 MongoDB Connected for user debugging'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define User schema (simplified)
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function debugUsers() {
  try {
    console.log('\n🔍 Debugging Users in Database...\n');
    
    // Get total count of users
    const totalUsers = await User.countDocuments();
    console.log(`📊 Total Users in Database: ${totalUsers}`);
    
    // Get all users
    const allUsers = await User.find({})
      .select('firstName lastName email role isVerified createdAt')
      .sort({ createdAt: -1 });
    
    console.log('\n👥 All Users:');
    console.log('=============');
    
    if (allUsers.length === 0) {
      console.log('❌ No users found in database');
    } else {
      allUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. User: ${user.firstName || 'N/A'} ${user.lastName || 'N/A'}`);
        console.log(`   Email: ${user.email || 'N/A'}`);
        console.log(`   Role: ${user.role || 'user'}`);
        console.log(`   Verified: ${user.isVerified}`);
        console.log(`   Created: ${user.createdAt}`);
      });
    }
    
    // Check specifically for admin users
    const adminUsers = await User.find({ role: 'admin' })
      .select('firstName lastName email isVerified createdAt');
    
    console.log(`\n🔐 Admin Users Found: ${adminUsers.length}`);
    
    if (adminUsers.length > 0) {
      console.log('\n👑 Admin Users Details:');
      console.log('======================');
      
      adminUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. Admin: ${user.firstName || 'N/A'} ${user.lastName || 'N/A'}`);
        console.log(`   Email: ${user.email || 'N/A'}`);
        console.log(`   Verified: ${user.isVerified}`);
        console.log(`   Created: ${user.createdAt}`);
      });
    } else {
      console.log('❌ No admin users found in database');
      console.log('\n💡 Creating a test admin user...');
      
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@ukritijewells.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true
      });
      
      await adminUser.save();
      console.log('✅ Admin user created successfully');
      console.log('   Email: admin@ukritijewells.com');
      console.log('   Password: admin123');
    }
    
  } catch (error) {
    console.error('❌ Error debugging users:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔚 Database connection closed');
  }
}

// Run the debug function
debugUsers();
