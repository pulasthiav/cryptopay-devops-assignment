const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  coin: { type: String, required: true },
  plan: { type: String, required: true },
  time: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', TransactionSchema);
