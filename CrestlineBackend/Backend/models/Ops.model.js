const mongoose = require("mongoose");

const FeeStructureSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  type: { type: String, enum: ["Flat", "Percentage", "Mixed"], required: true },
  flatAmount: { type: Number, default: 0 },
  percentageAmount: { type: Number, default: 0 },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
}, { timestamps: true });

const ApiConfigSchema = new mongoose.Schema({
  clientId: { type: String, required: true, unique: true },
  secretKeyHash: { type: String, required: true },
  rawSecretKeyView: { type: String, required: true },
  lastRotated: { type: Date, default: Date.now },
  webhookUrl: { type: String, default: "" }
}, { timestamps: true });

const FeeStructure = mongoose.model("FeeStructure", FeeStructureSchema);
const ApiConfig = mongoose.model("ApiConfig", ApiConfigSchema);

module.exports = { FeeStructure, ApiConfig };