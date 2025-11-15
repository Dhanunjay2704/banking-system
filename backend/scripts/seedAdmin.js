require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const adminExists = await User.findOne({ email: 'admin@bank.com' });

    if (!adminExists) {
      const admin = new User({
        name: 'Admin User',
        email: 'admin@bank.com',
        phone: '9999999999',
        password: 'admin123',
        role: 'admin',
        status: 'active',
        accountNumber: 'ADMIN001',
        balance: 0,
      });

      await admin.save();
      console.log('✅ Admin account created successfully');
      console.log('📧 Email: admin@bank.com');
      console.log('🔐 Password: admin123');
    } else {
      console.log('ℹ️ Admin account already exists');
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
