const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const resetAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/banking_system';
    await mongoose.connect(mongoUri);
    console.log(`✅ Connected to MongoDB`);

    // Delete existing admin
    const deleted = await User.deleteOne({ email: 'admin@example.com', role: 'admin' });
    console.log(`✅ Deleted existing admin: ${deleted.deletedCount} record(s)`);

    // Create new admin - DO NOT hash password, let the model's pre-save hook do it
    const adminData = new User({
      name: 'Admin',
      email: 'admin@example.com',
      phone: '9876543200',
      password: 'admin123', // Pass plain password, model will hash it
      role: 'admin',
      status: 'active',
      balance: 0,
      accountNumber: 'ADMIN001'
    });

    await adminData.save();

    console.log('✅ New admin created successfully!');
    console.log('');
    console.log('📋 Admin Credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('🔐 Login at: http://localhost:3000/admin/login');

    // Verify the password
    const verify = await User.findOne({ email: 'admin@example.com' }).select('+password');
    const isValid = await verify.comparePassword('admin123');
    console.log('');
    console.log('✅ Password verification:', isValid ? 'VALID ✓' : 'INVALID ✗');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetAdmin();
