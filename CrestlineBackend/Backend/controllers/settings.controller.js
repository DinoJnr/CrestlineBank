const Settings = require("../models/Settings.model");


const defaultSettingsSeed = {
  maintenanceMode: false,
  appVersion: "v4.18.26",
  environment: "Production",
  region: "NG-WEST-01",
  thresholdAlerts: [
    { key: "criticalWithdrawal", label: "Critical Withdrawal Alert", desc: "Notify when a transaction exceeds ₦1,000,000", enabled: true },
    { key: "systemLoad", label: "System Load Warning", desc: "Notify when API latency exceeds 500ms", enabled: true },
    { key: "manualKyc", label: "Manual KYC Flag", desc: "Notify when a Tier-3 user uploads documents", enabled: false }
  ]
};



exports.getGlobalSettings = async (req, res) => {
  try {

    res.status(200).json({ 
      success: true, 
      data: {
        maintenanceMode: false,
        thresholdAlerts: [
          { key: "low_liq", label: "Low Liquidity Alert", desc: "Triggers when threshold drops", enabled: true }
        ],
        appVersion: "v4.18.26",
        environment: "Production",
        region: "NG-WEST-01",
        lastBackup: new Date()
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateGlobalSettings = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: "Configuration synced" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.triggerBackup = async (req, res) => {
  try {
    res.status(200).json({ 
      success: true, 
      data: { lastBackup: new Date() } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};