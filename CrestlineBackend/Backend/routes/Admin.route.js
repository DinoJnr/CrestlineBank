const express = require("express");
const router = express.Router();

const {
  registerPersonnel,
  staffLogin,
  getSystemDashboardMetrics,
  adminLogin,
  onboardPersonnel,
  getCustomerDatabase,
  getPersonnelHubMetrics,
  getAdminDirectory,
  getStaffDirectory,
  getAllCustomerDatabase,
  getAllStaffDirectory,
  getAllAdminDirectory,
  getLiveLiquidityFromSource,
  getAdminProfile,
  updateAdminProfile,
  getStaffById,
  staffUpdate,
  terminateSessions,
  resetMfa,
  toggleSuspension,
  decommissionStaff,
  getAdminById,
  getAdminDossier,
  modifyAdminClearance,
} = require("../controllers/Admin.controller");

const { protect } = require("../Middleware/authMiddleware");

router.post("/register", registerPersonnel);
router.post("/staff-login", staffLogin);
router.post("/admin-login", adminLogin);
router.get("/dashboard-metrics", protect, getSystemDashboardMetrics);

router.post("/personnel/onboard", protect, onboardPersonnel);
router.get("/personnel/hub-metrics", protect, getPersonnelHubMetrics);
router.get("/personnel/users", protect, getCustomerDatabase);
router.get("/personnel/staffs", protect, getStaffDirectory);
router.get("/personnel/admins", protect, getAdminDirectory);
router.get("/personnel/users", protect, getAllCustomerDatabase);
router.get("/personnel/staffs", protect, getAllStaffDirectory);
router.get("/personnel/admin", protect, getAllAdminDirectory);
router.get("/financials/liquidity", protect, getLiveLiquidityFromSource);
router.get("/profile", protect, getAdminProfile);
router.put("/profile/update", protect, updateAdminProfile);
router.get("/personnel/staffs/:id", protect, getStaffById);
router.put("/personnel/staffs/:id", protect, staffUpdate);

router
  .route("/:id")
  .patch(protect, toggleSuspension)
  .delete(protect, decommissionStaff);

router.post("/:id/terminate-sessions", protect, terminateSessions);
router.post("/:id/reset-mfa", protect, resetMfa);

router.get("/personnel/admin/:id", protect, getAdminById);

router
  .route("/personnel/admin/:id")
  .get(protect, getAdminDossier)
  .patch(protect, modifyAdminClearance);

module.exports = router;