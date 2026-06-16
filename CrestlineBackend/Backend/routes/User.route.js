const express = require("express");
const router = express.Router();
const { protect } = require("../Middleware/authMiddleware");
const {
  register,
  login,
  getDashboardData,
  updateSecurity,
  saveActivity,
  saveTransaction,
  verifyPin,
  addMoney,
  requestCard,
  requestReplacement,
  setCardPin,
  lookupAccount,
  executeTransfer,
  getProfile,
  updateProfile,
  airtimeTopUp,
  dataTopUp,
  verifySportyAccount,
  sportyWalletTopUp,
  verifyBillAccount,
  settleUtilityBill,
  requestLoan,
  repayLoan,
  extendLoan,
  getLoanState,

  processTierUpgrade,
} = require("../controllers/User.controller");

router.post("/register", register);
router.post("/login", login);
router.get("/dashboard-data", protect, getDashboardData);
router.put("/update-security", protect, updateSecurity);
router.post("/add", protect, addMoney);
router.post("/verify-pin", protect, verifyPin);
router.post("/save-transaction", protect, saveTransaction);
router.post("/save-activity", protect, saveActivity);
router.post("/request-card", protect, requestCard);
router.post("/request-replacement", protect, requestReplacement);
router.post("/set-card-pin", protect, setCardPin);
router.get("/lookup-account", protect, lookupAccount);
router.get("/profile", protect, getProfile);
router.patch("/profile", protect, updateProfile);
router.post("/airtime-topup", protect, airtimeTopUp);
router.post("/data-topup", protect, dataTopUp);
router.post("/transfer", protect, executeTransfer);
router.post("/sporty-verify", protect, verifySportyAccount);
router.post("/sporty-topup", protect, sportyWalletTopUp);
router.post("/bill-verify", protect, verifyBillAccount);
router.post("/bill-pay", protect, settleUtilityBill);

router.post("/loan-request", protect, requestLoan);
router.post("/loan-repay", protect, repayLoan);
router.post("/loan-extend", protect, extendLoan);
router.get("/loan-state", protect, getLoanState);

router.post("/kyc-upgrade", protect, processTierUpgrade);

module.exports = router;
