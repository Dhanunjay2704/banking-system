const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Customer Registration
exports.registerCustomer = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or phone already registered' });
    }

    // Create new customer
    const user = new User({
      name,
      email,
      phone,
      password,
      role: 'customer',
      status: 'pending',
    });

    await user.save();

    res.status(201).json({
      message: 'Registration successful. Please wait for admin approval.',
      customer: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Customer Login
exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email, role: 'customer' }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    // Allow login for both pending and active status
    res.json({
      message: 'Login successful',
      token,
      status: user.status,
      customer: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountNumber: user.accountNumber || null,
        balance: user.balance || null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check Account Approval Status
exports.checkApprovalStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (user.status !== 'active') {
      return res.json({
        approved: false,
        status: user.status,
      });
    }

    res.json({
      approved: true,
      status: user.status,
      accountNumber: user.accountNumber,
      message: 'Your account is now active!',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Customer Dashboard
exports.getCustomerDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let lastTransaction = null;
    
    // Only fetch transactions if account is active
    if (user.status === 'active') {
      lastTransaction = await Transaction.findOne({ userId: req.user.id }).sort({
        createdAt: -1,
      });
    }

    res.json({
      accountNumber: user.accountNumber || null,
      name: user.name,
      balance: user.balance || 0,
      status: user.status,
      lastTransaction: lastTransaction || null,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send Money to Another Customer
exports.sendMoney = async (req, res) => {
  try {
    const { recipientAccountNumber, amount, description } = req.body;

    if (!recipientAccountNumber || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid recipient account or amount' });
    }

    const sender = await User.findById(req.user.id);

    if (!sender) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (sender.status !== 'active') {
      return res.status(403).json({ 
        message: 'Your account must be approved before you can perform transactions',
        status: sender.status 
      });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Find recipient by account number
    const recipient = await User.findOne({ accountNumber: recipientAccountNumber, role: 'customer', status: 'active' });

    if (!recipient) {
      return res.status(404).json({ message: 'Recipient account not found or not active' });
    }

    if (sender._id.toString() === recipient._id.toString()) {
      return res.status(400).json({ message: 'Cannot send money to your own account' });
    }

    // Deduct from sender
    sender.balance -= amount;
    await sender.save();

    // Add to recipient
    recipient.balance += amount;
    await recipient.save();

    // Create transaction record for sender
    const senderTransaction = new Transaction({
      userId: sender._id,
      accountNumber: sender.accountNumber,
      amount,
      type: 'transfer',
      balanceAfter: sender.balance,
      description: `Transfer to ${recipient.accountNumber}: ${description || 'Transfer'}`,
    });

    await senderTransaction.save();

    // Create transaction record for recipient
    const recipientTransaction = new Transaction({
      userId: recipient._id,
      accountNumber: recipient.accountNumber,
      amount,
      type: 'transfer',
      balanceAfter: recipient.balance,
      description: `Received from ${sender.accountNumber}: ${description || 'Transfer'}`,
    });

    await recipientTransaction.save();

    res.json({
      message: 'Transfer successful',
      amount,
      newBalance: sender.balance,
      senderTransaction,
      recipientTransaction,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Customer Balance
exports.getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      balance: user.balance,
      accountNumber: user.accountNumber,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Customer Statement
exports.getStatement = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    const user = await User.findById(req.user.id);

    res.json({
      transactions,
      currentBalance: user.balance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Customer Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      customer: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
