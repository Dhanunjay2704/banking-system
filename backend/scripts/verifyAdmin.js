const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const verifyAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/banking_system';
    await mongoose.connect(mongoUri);
    console.log(`✅ Connected to MongoDB`);

    const admin = await User.findOne({ email: 'admin@example.com', role: 'admin' }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin not found in database');
      await mongoose.connection.close();
      return;
    }

    console.log('✅ Admin found!');
    console.log('');
    console.log('Admin Details:');
    console.log('  Email:', admin.email);
    console.log('  Name:', admin.name);
    console.log('  Role:', admin.role);
    console.log('  Status:', admin.status);
    console.log('  Password Hash:', admin.password ? 'YES' : 'NO');
    console.log('');

    // Test password
    const isPasswordMatch = await admin.comparePassword('admin123');
    console.log('Password Verification:');
    console.log('  Testing password "admin123":', isPasswordMatch ? '✅ VALID' : '❌ INVALID');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

verifyAdmin();
