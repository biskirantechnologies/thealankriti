require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.production') });
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (existingAdmin) {
      console.log(`⚠️  Admin user already exists: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Role: ${existingAdmin.role}`);
      
      // Update password if needed
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('✅ Admin password updated');
    } else {
      // Create admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);
      
      const adminUser = new User({
        firstName: 'TheAlankriti',
        lastName: 'Admin',
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        isActive: true
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully!');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Name: ${adminUser.name}`);
      console.log(`   Role: ${adminUser.role}`);
    }

    // Check if super admin exists
    const existingSuperAdmin = await User.findOne({ email: process.env.SUPER_ADMIN_EMAIL });
    if (existingSuperAdmin) {
      console.log(`⚠️  Super Admin user already exists: ${existingSuperAdmin.email}`);
      
      // Update password if needed
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, salt);
      existingSuperAdmin.password = hashedPassword;
      existingSuperAdmin.role = 'super_admin';
      await existingSuperAdmin.save();
      console.log('✅ Super Admin password updated');
    } else {
      // Create super admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, salt);
      
      const superAdminUser = new User({
        firstName: 'Super',
        lastName: 'Administrator',
        email: process.env.SUPER_ADMIN_EMAIL,
        password: hashedPassword,
        role: 'super_admin',
        isVerified: true,
        isActive: true
      });

      await superAdminUser.save();
      console.log('✅ Super Admin user created successfully!');
      console.log(`   Email: ${superAdminUser.email}`);
      console.log(`   Name: ${superAdminUser.name}`);
      console.log(`   Role: ${superAdminUser.role}`);
    }

    console.log('\n📋 Login Credentials:');
    console.log(`   Admin: ${process.env.ADMIN_EMAIL} / ${process.env.ADMIN_PASSWORD}`);
    console.log(`   Super Admin: ${process.env.SUPER_ADMIN_EMAIL} / ${process.env.SUPER_ADMIN_PASSWORD}`);

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  createAdmin();
}

module.exports = createAdmin;
