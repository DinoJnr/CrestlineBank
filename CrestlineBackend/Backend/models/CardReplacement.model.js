const mongoose = require('mongoose');

const CardReplacementSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Registeruser', required: true },
  customerName:  String,
  accountNumber: String,
  reason:        { type: String, required: true },
  oldTier:       String,
  status:        { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  requestedAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('CardReplacement', CardReplacementSchema);