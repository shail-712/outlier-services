const express = require('express');
const router = express.Router();
const { getPaymentModes } = require('../controllers/paymentModeController');

router.get('/', getPaymentModes);

module.exports = router;
