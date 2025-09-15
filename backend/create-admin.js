const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/The Alankriti_jewells')
  .then(() => console.log('📊 MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User schema
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: { type: String, enum: ['user', 'admin', 'customer'], default: 'user' },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createDefaultAdmin() {
  try {
    console.log('🔐 Creating default admin user...\n');
    
    // Check if admin@The Alankriti.com already exists
    const existingAdmin = await User.findOne({ email: 'admin@The Alankriti.com' });
    
    if (existingAdmin) {
      console.log('ℹ️ Admin user admin@The Alankriti.com already exists');
      
      // Update password to ensure it works
      const hashedPassword = await bcrypt.hash('admin123', 12);
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin';
      existingAdmin.isVerified = true;
      await existingAdmin.save();
      
      console.log('✅ Updated existing admin password');
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@The Alankriti.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true
      });
      
      await adminUser.save();
      console.log('✅ Created new admin user');
    }
    
    console.log('\n📋 Admin Login Credentials:');
    console.log('==========================');
    console.log('Email: admin@The Alankriti.com');
    console.log('Password: admin123');
    console.log('');
    console.log('Alternative Admin Emails:');
    console.log('- bewithu.aj@gmail.com (password: admin123)');
    console.log('- admin@test.com (password: admin123)');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔚 Database connection closed');
  }
}

createDefaultAdmin();
