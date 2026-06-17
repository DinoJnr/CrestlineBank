const express = require("express");
const router = express.Router();

const {
  getUser,
  enrollUser,
  updateUser,
  updateUserStatus,
  updateUserLimits,
  creditAccount,
  debitAccount,
  getUserTransactions,
  reverseTransaction,
  blockCard,
  unblockCard,
  replaceCard,
  resetPin,
  resetPassword,
  generateStatement,
  notifyUser,
  getUserActivities,
  logActivityEntry,
  addMandate,
  updateMandateStatus,
  cancelMandate,
  addSignatory,
  removeSignatory,
  getPending,
  getArchived,
  resolveInquiry,
  getDashboardStats,
  getPendingInquiries,
} = require("../controllers/Staff.controller");

const { protect } = require("../Middleware/authMiddleware");

router.get("/accounts/:accountNumber", protect, getUser);
router.post("/accounts", enrollUser);
router.patch("/accounts/:accountNumber", protect, updateUser);
router.patch("/accounts/:accountNumber/status", protect, updateUserStatus);
router.patch("/accounts/:accountNumber/limits", protect, updateUserLimits);
router.post("/accounts/:accountNumber/credit", protect, creditAccount);
router.post("/accounts/:accountNumber/debit", protect, debitAccount);
router.get(
  "/accounts/:accountNumber/transactions",
  protect,
  getUserTransactions,
);
router.post(
  "/transactions/:transactionId/reverse",
  protect,
  reverseTransaction,
);
router.get("/accounts/:accountNumber/statement", protect, generateStatement);
router.patch("/cards/:accountNumber/block", protect, blockCard);
router.patch("/cards/:accountNumber/unblock", protect, unblockCard);
router.post("/cards/:accountNumber/replace", protect, replaceCard);
router.post("/accounts/:accountNumber/reset-pin", protect, resetPin);
router.post("/accounts/:accountNumber/reset-password", protect, resetPassword);
router.post("/accounts/:accountNumber/notify", protect, notifyUser);
router.get("/accounts/:userId/activities", protect, getUserActivities);
router.post("/activities", protect, logActivityEntry);
router.post("/accounts/:accountNumber/mandates", protect, addMandate);
router.patch(
  "/accounts/:accountNumber/mandates/:mandateId",
  protect,
  updateMandateStatus,
);
router.delete(
  "/accounts/:accountNumber/mandates/:mandateId",
  protect,
  cancelMandate,
);
router.post("/accounts/:accountNumber/signatories", protect, addSignatory);
router.delete(
  "/accounts/:accountNumber/signatories/:signatoryId",
  protect,
  removeSignatory,
);
router.get("/pending", protect, getPending);
router.get("/archived", protect, getArchived);
router.post("/:id/resolve", protect, resolveInquiry);
router.get("/dashboard-stats", protect, getDashboardStats);
router.get("/pending", protect, getPendingInquiries);
module.exports = router;
