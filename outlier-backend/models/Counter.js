const mongoose = require('mongoose');

// Used to atomically generate sequential Transaction_IDs (starting at 1001,
// mirroring the frontend's `let transactionCounter = 1000` pattern).
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. "transaction_id"
  seq: { type: Number, default: 1000 },
});

const Counter = mongoose.model('Counter', CounterSchema);

async function getNextSequence(name) {
  const result = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return result.seq;
}

module.exports = { Counter, getNextSequence };
