const PaymentMode = require('../models/PaymentMode');

// GET /api/payment-modes?currency=XX
// Matches shape of payment-modes.json: array of { Payment_Code, Payment_Name, Currency_Code }
exports.getPaymentModes = async (req, res) => {
  try {
    const { currency } = req.query;
    const filter = currency ? { Currency_Code: String(currency).toUpperCase() } : {};

    const paymentModes = await PaymentMode.find(
      filter,
      'Payment_Code Payment_Name Currency_Code -_id'
    ).lean();
    res.json(paymentModes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment modes', details: err.message });
  }
};
