const mongoose = require("mongoose");

const PendingInquirySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Registeruser", required: true },
  subject: { 
    type: String, 
    required: true, 
    enum: ["Transaction Dispute", "Tier Upgrade Issue", "Card Management", "Security/Recovery", "Other Feedback"] 
  },
  message: { type: String, required: true }
}, { timestamps: true });

const ArchivedInquirySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Registeruser", required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  originalTicketId: { type: mongoose.Schema.Types.ObjectId },
  resolutionNotes: { type: String, default: "" },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  resolvedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const PendingInquiry = mongoose.model("PendingInquiry", PendingInquirySchema);
const ArchivedInquiry = mongoose.model("ArchivedInquiry", ArchivedInquirySchema);

module.exports = { PendingInquiry, ArchivedInquiry };