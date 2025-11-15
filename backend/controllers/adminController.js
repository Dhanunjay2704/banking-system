const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email, role: 'admin' }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({
      message: 'Admin login successful',
      token,
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Admin Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const activeAccounts = await User.countDocuments({ role: 'customer', status: 'active' });
    const pendingApprovals = await User.countDocuments({ role: 'customer', status: 'pending' });

    const totalDepositsAgg = await User.aggregate([
      { $match: { role: 'customer', status: 'active' } },
      { $group: { _id: null, totalBalance: { $sum: '$balance' } } },
    ]);

    const totalDeposits = totalDepositsAgg[0]?.totalBalance || 0;

    res.json({
      totalCustomers,
      activeAccounts,
      pendingApprovals,
      totalDeposits,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Recent Transactions
exports.getRecentTransactions = async (req, res) => {
  try {
    const Transaction = require('../models/Transaction');
    const transactions = await Transaction.find()
      .populate('userId', 'name email accountNumber')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Customers
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-password');
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Pending Customers
exports.getPendingCustomers = async (req, res) => {
  try {
    const pending = await User.find({ role: 'customer', status: 'pending' }).select('-password');
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve Customer Account
exports.approveCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Generate account number (keep password unchanged)
    const accountNumber = 'ACC' + Date.now();

    user.status = 'active';
    user.accountNumber = accountNumber;
    // Password remains unchanged - customer uses registration password to login
    await user.save();

    res.json({
      message: 'Customer approved successfully',
      accountNumber,
      customer: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountNumber: accountNumber,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await User.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const Transaction = require('../models/Transaction');
    const transactions = await Transaction.find()
      .populate('userId', 'name email accountNumber')
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Deposit Money to Customer Account (Admin Only)
exports.depositToCustomer = async (req, res) => {
  try {
    const { customerId, amount, description } = req.body;

    if (!customerId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid customer ID or amount' });
    }

    const customer = await User.findById(customerId);

    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (customer.status !== 'active') {
      return res.status(400).json({ message: 'Customer account must be active to receive deposits' });
    }

    customer.balance += amount;
    await customer.save();

    // Create transaction record
    const Transaction = require('../models/Transaction');
    const transaction = new Transaction({
      userId: customer._id,
      accountNumber: customer.accountNumber,
      amount,
      type: 'deposit',
      balanceAfter: customer.balance,
      description: `Admin deposit: ${description || 'Deposit by admin'}`,
    });

    await transaction.save();

    res.json({
      message: 'Deposit successful',
      amount,
      customer: {
        id: customer._id,
        name: customer.name,
        accountNumber: customer.accountNumber,
        newBalance: customer.balance,
      },
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Withdraw Money from Customer Account (Admin Only)
exports.withdrawFromCustomer = async (req, res) => {
  try {
    const { customerId, amount, description } = req.body;

    if (!customerId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid customer ID or amount' });
    }

    const customer = await User.findById(customerId);

    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (customer.status !== 'active') {
      return res.status(400).json({ message: 'Customer account must be active' });
    }

    if (customer.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance in customer account' });
    }

    customer.balance -= amount;
    await customer.save();

    // Create transaction record
    const Transaction = require('../models/Transaction');
    const transaction = new Transaction({
      userId: customer._id,
      accountNumber: customer.accountNumber,
      amount,
      type: 'withdrawal',
      balanceAfter: customer.balance,
      description: `Admin withdrawal: ${description || 'Withdrawal by admin'}`,
    });

    await transaction.save();

    res.json({
      message: 'Withdrawal successful',
      amount,
      customer: {
        id: customer._id,
        name: customer.name,
        accountNumber: customer.accountNumber,
        newBalance: customer.balance,
      },
      transaction,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
