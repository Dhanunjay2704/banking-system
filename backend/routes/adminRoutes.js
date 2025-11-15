const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// Admin login (no auth required)
router.post('/login', adminController.adminLogin);

// Protected routes
router.get('/dashboard', authMiddleware, adminMiddleware, adminController.getDashboardStats);
router.get('/recent-transactions', authMiddleware, adminMiddleware, adminController.getRecentTransactions);
router.get('/customers', authMiddleware, adminMiddleware, adminController.getAllCustomers);
router.get('/pending', authMiddleware, adminMiddleware, adminController.getPendingCustomers);
router.post('/approve/:id', authMiddleware, adminMiddleware, adminController.approveCustomer);
router.delete('/customer/:id', authMiddleware, adminMiddleware, adminController.deleteCustomer);
router.get('/transactions', authMiddleware, adminMiddleware, adminController.getAllTransactions);
router.post('/deposit', authMiddleware, adminMiddleware, adminController.depositToCustomer);
router.post('/withdraw', authMiddleware, adminMiddleware, adminController.withdrawFromCustomer);

module.exports = router;
