const express = require('express');
const router = express.Router();
const { authMiddleware, customerMiddleware } = require('../middleware/authMiddleware');
const customerController = require('../controllers/customerController');

// Public routes
router.post('/register', customerController.registerCustomer);
router.post('/login', customerController.loginCustomer);

// Protected routes
router.get('/check-approval', authMiddleware, customerMiddleware, customerController.checkApprovalStatus);
router.get('/approval-status', authMiddleware, customerMiddleware, customerController.checkApprovalStatus);
router.get('/dashboard', authMiddleware, customerMiddleware, customerController.getCustomerDashboard);
router.post('/send-money', authMiddleware, customerMiddleware, customerController.sendMoney);
router.get('/balance', authMiddleware, customerMiddleware, customerController.getBalance);
router.get('/statement', authMiddleware, customerMiddleware, customerController.getStatement);
router.put('/profile', authMiddleware, customerMiddleware, customerController.updateProfile);

module.exports = router;
