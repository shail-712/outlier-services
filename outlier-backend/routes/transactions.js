const express = require('express');
const router = express.Router();
const { createTransaction, getTransaction } = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/auth');

// All transaction routes require authentication
router.use(protect);

// Only admin can create transactions and list all
router.post('/', authorize('admin'), createTransaction);

// Both admin and user can view a specific transaction by ID
router.get('/:id', getTransaction);

module.exports = router;
