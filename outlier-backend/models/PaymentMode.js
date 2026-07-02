const mongoose = require('mongoose');

const PaymentModeSchema = new mongoose.Schema(
  {
    Payment_Code: { type: String, required: true, unique: true, index: true },
    Payment_Name: { type: String, required: true },
    Currency_Code: { type: String, required: true, index: true },

    Currency_Ref: { type: mongoose.Schema.Types.ObjectId, ref: 'Currency' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentMode', PaymentModeSchema);
