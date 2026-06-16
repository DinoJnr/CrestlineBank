const express = require('express');
const router  = express.Router();

const {
  getPortfolio,
  commitCapital,
  emergencyWithdraw,
  terminatePlan,
  fundLiquidityPool,
  withdrawLiquidityPool
} = require('../controllers/Investment');

const { getProfile } = require('../controllers/User.controller');
const { protect } = require('../Middleware/authMiddleware');

router.get('/profile', protect, getProfile);
router.get('/invest-portfolio', protect, getPortfolio);
router.post('/invest-commit', protect, commitCapital);
router.post('/invest-withdraw', protect, emergencyWithdraw);
router.post('/invest-terminate', protect, terminatePlan);
router.post('/invest-fund', protect, fundLiquidityPool);
router.post("/invest-pool-withdraw", protect, withdrawLiquidityPool);

module.exports = router;