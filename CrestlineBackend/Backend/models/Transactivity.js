const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: String,
  accountNumber: String,
  reference: String,
  amount: String,
  description: String,
  tier: String,
  status: { type: String, default: 'completed' },
  createdAt: { type: Date, default: Date.now }
});

const ActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  details: String,
  reason: String, 
  ipAddress: String,
  createdAt: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', TransactionSchema);
const Activity = mongoose.model('Activity', ActivitySchema);

module.exports = { Transaction, Activity };