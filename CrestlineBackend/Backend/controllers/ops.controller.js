const { FeeStructure, ApiConfig } = require("../models/Ops.model");
const crypto = require("crypto");


exports.getFeeStructures = async (req, res) => {
  try {
    const fees = await FeeStructure.find({});
    return res.status(200).json({ success: true, data: fees });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, flatAmount, percentageAmount, status } = req.body;

    const updatedFee = await FeeStructure.findByIdAndUpdate(
      id,
      { type, flatAmount, percentageAmount, status },
      { new: true, runValidators: true }
    );

    if (!updatedFee) return res.status(404).json({ success: false, message: "Fee rule not found" });
    return res.status(200).json({ success: true, data: updatedFee });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


exports.getApiConfig = async (req, res) => {
  try {
    let config = await ApiConfig.findOne({});
    // Generate a default pair if database profile is fresh
    if (!config) {
      const newClientId = `CR_LIVE_${crypto.randomBytes(7).toString("hex").toUpperCase()}`;
      const newSecretKey = `sk_live_v4_${crypto.randomBytes(16).toString("hex")}`;
      config = await ApiConfig.create({
        clientId: newClientId,
        secretKeyHash: crypto.createHash("sha256").update(newSecretKey).digest("hex"),
        rawSecretKeyView: newSecretKey, 
        webhookUrl: "https://api.merchant.com/v1/hook"
      });
    }
    return res.status(200).json({ success: true, data: config });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.rotateApiKeys = async (req, res) => {
  try {
    const newClientId = `CR_LIVE_${crypto.randomBytes(7).toString("hex").toUpperCase()}`;
    const newSecretKey = `sk_live_v4_${crypto.randomBytes(16).toString("hex")}`;
    
    const config = await ApiConfig.findOneAndUpdate(
      {},
      {
        clientId: newClientId,
        secretKeyHash: crypto.createHash("sha256").update(newSecretKey).digest("hex"),
        rawSecretKeyView: newSecretKey,
        lastRotated: Date.now()
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({ success: true, data: config });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateWebhook = async (req, res) => {
  try {
    const { webhookUrl } = req.body;
    const config = await ApiConfig.findOneAndUpdate({}, { webhookUrl }, { new: true, upsert: true });
    return res.status(200).json({ success: true, data: config });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};