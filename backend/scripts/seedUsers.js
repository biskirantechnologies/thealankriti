const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Sample user data
const sampleUsers = [
  {
    firstName: "John",
    lastName: "Doe",
    name: "John Doe",
    email: "john.doe@example.com",
    password: "password123",
    phone: "+91-9876543210",
    role: "customer"
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    name: "Jane Smith", 
    email: "jane.smith@example.com",
    password: "password123",
    phone: "+91-9876543211",
    role: "customer"
  },
  {
    firstName: "Admin",
    lastName: "User",
    name: "Admin User",
    email: "bewithu.aj@gmail.com",
    password: "admin123",
    phone: "+91-9876543212",
    role: "admin"
  }
];

async function seedUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/The Alankriti-jewells');
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Hash passwords and create users
    const usersWithHashedPasswords = await Promise.all(
      sampleUsers.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return {
          ...user,
          password: hashedPassword
        };
      })
    );

    // Insert sample users
    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    console.log(`Created ${createdUsers.length} sample users`);

    console.log('Sample users created successfully:');
    createdUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`);
    });

    console.log('\nLogin credentials:');
    console.log('Customer 1: john.doe@example.com / password123');
    console.log('Customer 2: jane.smith@example.com / password123');
    console.log('Admin: bewithu.aj@gmail.com / admin123');

  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  seedUsers();
}

module.exports = { seedUsers, sampleUsers };
