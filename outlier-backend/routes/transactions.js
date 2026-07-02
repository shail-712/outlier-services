const express = require('express');
const router = express.Router();
const { createTransaction, getTransaction } = require('../controllers/transactionController');

router.post('/', createTransaction);
router.get('/:id', getTransaction);

module.exports = router;
