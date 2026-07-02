const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const VAC = require('../models/VAC');
const Country = require('../models/Country');
const PaymentMode = require('../models/PaymentMode');
const Currency = require('../models/Currency');
const Service = require('../models/Service');
const { getNextSequence } = require('../models/Counter');

// Flattens a Transaction document (one doc, many Line_Items) into an array of
// TransactionRecord objects — matching the shape the frontend's AppContext.checkout()
// already produces (one flat record per line item, all sharing Batch_ID/Grand_Total).
function toTransactionRecords(txn) {
  return txn.Line_Items.map((item) => ({
    Transaction_ID: txn.Transaction_ID,
    VAC_Code: txn.VAC_Code,
    VAC_Name: txn.VAC_Name,
    Country_Name: txn.Country_Name,
    Service_Code: item.Service_Code,
    Service_Name: item.Service_Name,
    Payment_Code: txn.Payment_Code,
    Payment_Name: txn.Payment_Name,
    Currency_Code: txn.Currency_Code,
    Currency_Symbol: txn.Currency_Symbol,
    Unit_Price: item.Unit_Price,
    Quantity: item.Quantity,
    Line_Total: item.Line_Total,
    Grand_Total: txn.Grand_Total,
    Transaction_Date: txn.Transaction_Date,
    Transaction_Status: txn.Transaction_Status,
    Batch_ID: txn.Batch_ID,
  }));
}

// POST /api/transactions
// Body:
// {
//   "VAC_Code": "IN_DEL",
//   "Country_Code": "IN",
//   "Payment_Code": "UPI_INR",
//   "Currency_Code": "INR",
//   "line_items": [
//     { "Service_Code": "SVC_XEROX_A4", "Quantity": 2 },
//     { "Service_Code": "SVC_PHOTO", "Quantity": 1 }
//   ]
// }
exports.createTransaction = async (req, res) => {
  try {
    const { VAC_Code, Country_Code, Payment_Code, Currency_Code, line_items } = req.body;

    if (!VAC_Code || !Country_Code || !Payment_Code || !Currency_Code) {
      return res.status(400).json({
        error: 'VAC_Code, Country_Code, Payment_Code, and Currency_Code are all required',
      });
    }
    if (!Array.isArray(line_items) || line_items.length === 0) {
      return res.status(400).json({ error: 'line_items must be a non-empty array' });
    }

    // Resolve reference documents in parallel
    const [vac, country, paymentMode, currency] = await Promise.all([
      VAC.findOne({ VAC_Code }),
      Country.findOne({ Country_Code }),
      PaymentMode.findOne({ Payment_Code }),
      Currency.findOne({ Currency_Code }),
    ]);

    if (!vac) return res.status(404).json({ error: `VAC not found: ${VAC_Code}` });
    if (!country) return res.status(404).json({ error: `Country not found: ${Country_Code}` });
    if (!paymentMode) return res.status(404).json({ error: `Payment mode not found: ${Payment_Code}` });
    if (!currency) return res.status(404).json({ error: `Currency not found: ${Currency_Code}` });

    // Resolve each service and compute line totals server-side (never trust client prices)
    const serviceCodes = line_items.map((li) => li.Service_Code);
    const services = await Service.find({ Service_Code: { $in: serviceCodes } });
    const serviceMap = new Map(services.map((s) => [s.Service_Code, s]));

    const resolvedLineItems = [];
    for (const li of line_items) {
      const svc = serviceMap.get(li.Service_Code);
      if (!svc) {
        return res.status(404).json({ error: `Service not found: ${li.Service_Code}` });
      }
      const quantity = Number(li.Quantity);
      if (!Number.isFinite(quantity) || quantity < 1) {
        return res.status(400).json({ error: `Invalid quantity for ${li.Service_Code}` });
      }
      resolvedLineItems.push({
        Service_Code: svc.Service_Code,
        Service_Name: svc.Service_Name,
        Unit_Price: svc.Unit_Price,
        Quantity: quantity,
        Line_Total: Math.round(svc.Unit_Price * quantity * 100) / 100,
        Service_Ref: svc._id,
      });
    }

    const grandTotal = resolvedLineItems.reduce((sum, li) => sum + li.Line_Total, 0);
    const transactionId = await getNextSequence('transaction_id');
    const batchId = `BATCH-${Date.now()}-${transactionId}`;

    const txn = await Transaction.create({
      Transaction_ID: transactionId,
      Batch_ID: batchId,
      VAC_Code: vac.VAC_Code,
      VAC_Name: vac.VAC_Name,
      Country_Code: country.Country_Code,
      Country_Name: country.Country_Name,
      Payment_Code: paymentMode.Payment_Code,
      Payment_Name: paymentMode.Payment_Name,
      Currency_Code: currency.Currency_Code,
      Currency_Symbol: currency.Currency_Symbol,
      Line_Items: resolvedLineItems,
      Grand_Total: Math.round(grandTotal * 100) / 100,
      Transaction_Date: new Date().toISOString(),
      Transaction_Status: 'Completed',
      VAC_Ref: vac._id,
      Country_Ref: country._id,
      Payment_Ref: paymentMode._id,
      Currency_Ref: currency._id,
    });

    // Return flat TransactionRecord[] — same shape as AppContext.checkout()
    res.status(201).json(toTransactionRecords(txn));
  } catch (err) {
    res.status(500).json({ error: 'Failed to create transaction', details: err.message });
  }
};

// GET /api/transactions/:id
// :id can be either the numeric Transaction_ID or the Batch_ID.
// Returns the flat TransactionRecord[] for that batch.
exports.getTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const isNumeric = /^\d+$/.test(id);

    const txn = isNumeric
      ? await Transaction.findOne({ Transaction_ID: Number(id) })
      : await Transaction.findOne({ Batch_ID: id });

    if (!txn) return res.status(404).json({ error: `Transaction not found: ${id}` });

    res.json(toTransactionRecords(txn));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transaction', details: err.message });
  }
};
