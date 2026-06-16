const mongoose = require("mongoose");

const ThresholdAlertSchema = new mongoose.Schema({
  key: { type: String, required: true }, 
  label: { type: String, required: true },
  desc: { type: String, required: true },
  enabled: { type: Boolean, default: true }
});

const SettingsSchema = new mongoose.Schema({
  maintenanceMode: { type: Boolean, default: false },
  thresholdAlerts: [ThresholdAlertSchema],
  appVersion: { type: String, default: "v4.18.26" },
  environment: { type: String, default: "Production" },
  region: { type: String, default: "NG-WEST-01" },
  lastBackup: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Settings", SettingsSchema);

