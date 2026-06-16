const express = require("express");
const router = express.Router();
const { getProfile } = require("../controllers/User.controller");
const {
  getUserLedgerData,
} = require("../controllers/UserTransactionReceipt.controller");
const { protect } = require("../Middleware/authMiddleware");

router.get("/profile", protect, getProfile);

router.get("/ledger-data", protect, getUserLedgerData);

module.exports = router;
