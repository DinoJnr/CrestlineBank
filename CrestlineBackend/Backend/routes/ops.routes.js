console.log("🚀 >>> INVEST.ROUTE.JS IS ALIVE AND BEING READ BY NODE! <<< 🚀");

const express = require("express");
const router = express.Router();

const {
  getFeeStructures,
  updateFeeStructure,
  getApiConfig,
  rotateApiKeys,
  updateWebhook,
} = require("../controllers/ops.controller");

const { protect } = require("../Middleware/authMiddleware");

router.get("/fees", protect, getFeeStructures);
router.put("/fees/:id", updateFeeStructure);

router.get("/api-config", protect, getApiConfig);
router.post("/api-config/rotate", protect, rotateApiKeys);
router.put("/api-config/webhook", protect, updateWebhook);

module.exports = router;
