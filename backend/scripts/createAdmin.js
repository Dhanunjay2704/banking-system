const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const createAdmin = async () => {
  try {
    // Connect to MongoDB using banking_system database
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/banking_system';
    await mongoose.connect(mongoUri);
    console.log(`✅ Connected to MongoDB: ${mongoUri}`);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com', role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️ Admin already exists with email: admin@example.com');
      await mongoose.connection.close();
      return;
    }

    // Create new admin
    const adminData = {
      name: 'Admin',
      email: 'admin@example.com',
      phone: '9876543200',
      password: 'admin123',
      role: 'admin',
      status: 'active',
      balance: 0,
      accountNumber: 'ADMIN001'
    };

    // Hash password before saving
    const salt = await bcryptjs.genSalt(10);
    adminData.password = await bcryptjs.hash(adminData.password, salt);

    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Admin created successfully in banking_system database!');
    console.log('');
    console.log('📋 Admin Credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('🔐 Login at: http://localhost:3000/admin/login');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
