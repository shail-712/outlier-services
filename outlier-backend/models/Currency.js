const mongoose = require('mongoose');

const CurrencySchema = new mongoose.Schema(
  {
    Currency_Code: { type: String, required: true, unique: true, index: true },
    Currency_Name: { type: String, required: true },
    Currency_Symbol: { type: String, required: true },
    // Home/anchor country for this currency (matches source JSON)
    Country_Code: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Currency', CurrencySchema);
