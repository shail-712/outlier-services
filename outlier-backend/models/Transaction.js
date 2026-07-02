const mongoose = require('mongoose');

// One line item = one service within a checkout batch.
// Embedded (not a separate collection) because line items are always
// created/read/updated together with their parent transaction.
const LineItemSchema = new mongoose.Schema(
  {
    Service_Code: { type: String, required: true },
    Service_Name: { type: String, required: true },
    Unit_Price: { type: Number, required: true, min: 0 },
    Quantity: { type: Number, required: true, min: 1 },
    Line_Total: { type: Number, required: true, min: 0 },

    Service_Ref: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  },
  { _id: false }
);

const TransactionSchema = new mongoose.Schema(
  {
    // Human-friendly sequential ID, mirrors the frontend's Transaction_ID/transactionCounter pattern
    Transaction_ID: { type: Number, required: true, unique: true, index: true },
    Batch_ID: { type: String, required: true, unique: true, index: true },

    VAC_Code: { type: String, required: true },
    VAC_Name: { type: String, required: true },
    Country_Code: { type: String, required: true },
    Country_Name: { type: String, required: true },

    Payment_Code: { type: String, required: true },
    Payment_Name: { type: String, required: true },

    Currency_Code: { type: String, required: true },
    Currency_Symbol: { type: String, required: true },

    Line_Items: { type: [LineItemSchema], required: true, validate: v => Array.isArray(v) && v.length > 0 },

    Grand_Total: { type: Number, required: true, min: 0 },

    Transaction_Date: { type: String, required: true }, // ISO string, matches frontend TransactionRecord
    Transaction_Status: {
      type: String,
      enum: ['Completed', 'Pending', 'Failed'],
      default: 'Completed',
    },

    // Refs for joins
    VAC_Ref: { type: mongoose.Schema.Types.ObjectId, ref: 'VAC' },
    Country_Ref: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
    Payment_Ref: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMode' },
    Currency_Ref: { type: mongoose.Schema.Types.ObjectId, ref: 'Currency' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', TransactionSchema);
