const express = require("express");
const router = express.Router();


const opsController = require("../controllers/settings.controller");
const { protect } = require("../Middleware/authMiddleware");

if (!opsController.getGlobalSettings) console.error("❌ Error: getGlobalSettings is undefined in ops.controller!");
if (!opsController.updateGlobalSettings) console.error("❌ Error: updateGlobalSettings is undefined in ops.controller!");
if (!opsController.triggerBackup) console.error("❌ Error: triggerBackup is undefined in ops.controller!");


router.get("/fetch", protect, opsController.getGlobalSettings);
router.put("/update", protect, opsController.updateGlobalSettings);
router.post("/post-backup", protect, opsController.triggerBackup); 

module.exports = router;