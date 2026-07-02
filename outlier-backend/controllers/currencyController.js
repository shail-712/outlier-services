const Currency = require('../models/Currency');

// GET /api/currencies
// Matches shape of currencies.json: array of { Currency_Code, Currency_Name, Currency_Symbol, Country_Code }
exports.getCurrencies = async (req, res) => {
  try {
    const currencies = await Currency.find(
      {},
      'Currency_Code Currency_Name Currency_Symbol Country_Code -_id'
    ).lean();
    res.json(currencies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch currencies', details: err.message });
  }
};
