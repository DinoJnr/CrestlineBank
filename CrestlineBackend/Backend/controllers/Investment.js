const Registeruser = require('../models/Registerusers.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Transaction, Activity } = require('../models/Transactivity');
const mongoose = require('mongoose');
const { blockIfRestricted } = require('../utils/accountRestrictions');

const generateInvestReference = () =>
  `CT-INV-${Math.floor(100000 + Math.random() * 900000)}${Date.now().toString().slice(-4)}`;

const verifyTransactionPin = async (inputPin, userSavedPin) => {
  if (!userSavedPin || !inputPin) return false;
  if (userSavedPin.startsWith('$2a$') || userSavedPin.startsWith('$2b$')) {
    return await bcrypt.compare(String(inputPin), userSavedPin);
  }
  return String(userSavedPin) === String(inputPin);
};

const getCustomerName = (user) =>
  user.fullName ||
  `${user.firstname || ''} ${user.lastname || ''}`.trim() ||
  'Crestline Customer';

const getPortfolio = async (req, res) => {
  try {
    const user = await Registeruser.findById(req.user._id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Your session has expired or this account no longer exists. Please sign out and log back in."
      });
    }

    return res.status(200).json({
      success: true,
      balance: user.investLiquidityBalance || 0,
      myInvestments: user.myInvestments || [],
      completedInvestments: user.completedInvestments || [],
      investmentTransactions: user.investmentTransactions || [],
      restrictions: {
        status:       user.status,
        frozenReason: user.frozenReason || null,
        pndType:      user.pndType || null,
        dormant:      user.dormant,
        amlFlag:      user.amlFlag,
        cbnBlacklist: user.cbnBlacklist,
        unclaimed:    user.unclaimed,
      }
    });
  } catch (error) {
    console.error("Fetch portfolio ledger crash:", error);
    return res.status(500).json({ success: false, message: "Internal server data stream exception." });
  }
};

const fundLiquidityPool = async (req, res) => {
  const { fundAmount, transactionPin } = req.body;

  try {
    const user = await Registeruser.findById(req.user._id);
    if (!user) return res.status(401).json({ success: false, message: "Authentication session invalid." });

    if (blockIfRestricted(user, 'debit', res)) return;

    const isPinValid = await verifyTransactionPin(transactionPin, user.transactionPin);
    if (!isPinValid) {
      return res.status(400).json({ success: false, message: "Invalid Transaction Security PIN." });
    }

    const injectionValue = parseFloat(fundAmount);
    if (isNaN(injectionValue) || injectionValue <= 0) {
      return res.status(400).json({ success: false, message: "Invalid injection funding parameters." });
    }

    if ((user.balance || 0) < injectionValue) {
      return res.status(400).json({
        success: false,
        message: `Insufficient main balance. You have ₦${(user.balance || 0).toLocaleString()} available for funding.`
      });
    }

    user.balance -= injectionValue;
    user.investLiquidityBalance += injectionValue;

    const balanceAfter    = user.balance;
    const txRef           = `CT-FUND-${Math.floor(100000 + Math.random() * 900000)}${Date.now().toString().slice(-4)}`;
    const cleanDateString = new Date().toLocaleString();

    if (!user.investmentTransactions) user.investmentTransactions = [];
    user.investmentTransactions.unshift({
      txnId:  txRef,
      type:   "Investment Credit",
      asset:  "Wallet Liquidity Deposit",
      amount: injectionValue,
      date:   cleanDateString
    });

    await user.save();

    await Transaction.create({
      userId:        user._id,
      customerName:  getCustomerName(user),
      accountNumber: user.accountNumber || "N/A",
      reference:     txRef,
      amount:        -injectionValue,
      balanceAfter:  balanceAfter,
      description:   "Transfer to Investment Liquidity Wallet",
      channel:       "Crestline Invest",
      narration:     `Funded investment pool with ₦${injectionValue.toLocaleString()}`,
      status:        "completed"
    });

    return res.status(200).json({
      success: true,
      message: `Successfully funded account with ₦${injectionValue.toLocaleString()}`,
      balance: user.investLiquidityBalance
    });

  } catch (error) {
    console.error("Liquidity injection breakdown:", error);
    return res.status(500).json({ success: false, message: "Server operational stream context failure." });
  }
};

const withdrawLiquidityPool = async (req, res) => {
  const { withdrawAmount, transactionPin } = req.body;

  try {
    const user = await Registeruser.findById(req.user._id);
    if (!user) return res.status(401).json({ success: false, message: "Authentication session invalid." });

    if (blockIfRestricted(user, 'any', res)) return;

    const isPinValid = await verifyTransactionPin(transactionPin, user.transactionPin);
    if (!isPinValid) {
      return res.status(400).json({ success: false, message: "Invalid Transaction Security PIN." });
    }

    const extractionValue = parseFloat(withdrawAmount);
    if (isNaN(extractionValue) || extractionValue <= 0) {
      return res.status(400).json({ success: false, message: "Invalid extraction withdrawal parameters." });
    }

    if ((user.investLiquidityBalance || 0) < extractionValue) {
      return res.status(400).json({
        success: false,
        message: `Insolvent pool liquidity balance. You only have ₦${(user.investLiquidityBalance || 0).toLocaleString()} available.`
      });
    }

    user.investLiquidityBalance -= extractionValue;
    user.balance = (user.balance || 0) + extractionValue;

    const balanceAfter    = user.balance;
    const txRef           = `CT-WTHD-${Math.floor(100000 + Math.random() * 900000)}${Date.now().toString().slice(-4)}`;
    const cleanDateString = new Date().toLocaleString();

    if (!user.investmentTransactions) user.investmentTransactions = [];
    user.investmentTransactions.unshift({
      txnId:  txRef,
      type:   "Investment Debit",
      asset:  "Pool Extraction Payout",
      amount: extractionValue,
      date:   cleanDateString
    });

    await user.save();

    await Transaction.create({
      userId:        user._id,
      customerName:  getCustomerName(user),
      accountNumber: user.accountNumber || "N/A",
      reference:     txRef,
      amount:        extractionValue,
      balanceAfter:  balanceAfter,
      description:   "Withdrawal from Investment Liquidity Wallet",
      channel:       "Crestline Invest",
      narration:     `Moved ₦${extractionValue.toLocaleString()} from investment pool to main balance`,
      status:        "completed"
    });

    return res.status(200).json({
      success: true,
      message: `Successfully moved ₦${extractionValue.toLocaleString()} back to main balance`,
      balance: user.investLiquidityBalance
    });

  } catch (error) {
    console.error("Pool extraction breakdown:", error);
    return res.status(500).json({ success: false, message: "Server operational payout context failure." });
  }
};

const commitCapital = async (req, res) => {
  const { planName, principalAmount, rate, duration, transactionPin } = req.body;

  try {
    const user = await Registeruser.findById(req.user._id);
    if (!user) return res.status(401).json({ success: false, message: "Authentication session invalid." });

    if (blockIfRestricted(user, 'debit', res)) return;

    const isPinValid = await verifyTransactionPin(transactionPin, user.transactionPin);
    if (!isPinValid) {
      return res.status(400).json({ success: false, message: "Invalid Transaction Security PIN." });
    }

    const principal = parseFloat(principalAmount);
    if (isNaN(principal) || principal <= 0) {
      return res.status(400).json({ success: false, message: "Invalid capital allocation amount." });
    }

    if ((user.investLiquidityBalance || 0) < principal) {
      return res.status(400).json({ success: false, message: "Insolvent investment liquidity balance." });
    }

    user.investLiquidityBalance -= principal;

    const newAsset = {
      _id:       new mongoose.Types.ObjectId(),
      name:      planName,
      principal,
      interest:  0,
      rate,
      duration:  Number(duration),
      createdAt: new Date()
    };

    if (!user.myInvestments) user.myInvestments = [];
    user.myInvestments.push(newAsset);

    const txRef           = generateInvestReference();
    const cleanDateString = new Date().toLocaleString();

    if (!user.investmentTransactions) user.investmentTransactions = [];
    user.investmentTransactions.unshift({
      txnId:  txRef,
      type:   "Investment Debit",
      asset:  planName,
      amount: principal,
      date:   cleanDateString
    });

    await user.save();

    return res.status(200).json({
      success:       true,
      message:       "Capital Disbursed to Vault Successfully",
      balance:       user.investLiquidityBalance,
      myInvestments: user.myInvestments
    });

  } catch (error) {
    console.error("Investment contract commit crash:", error);
    return res.status(500).json({ success: false, message: "Transaction ledger processing breakdown." });
  }
};

const emergencyWithdraw = async (req, res) => {
  const { assetId, drawAmount, transactionPin } = req.body;

  try {
    const user = await Registeruser.findById(req.user._id);
    if (!user) return res.status(401).json({ success: false, message: "Authentication session invalid." });

    if (blockIfRestricted(user, 'any', res)) return;

    const isPinValid = await verifyTransactionPin(transactionPin, user.transactionPin);
    if (!isPinValid) {
      return res.status(400).json({ success: false, message: "Invalid Transaction Security PIN." });
    }

    const assetIndex = user.myInvestments.findIndex(inv => inv._id.toString() === assetId);
    if (assetIndex === -1) {
      return res.status(404).json({ success: false, message: "Active allocation profile context target not found." });
    }

    const currentAsset    = user.myInvestments[assetIndex];
    const assetTotalWorth = (currentAsset.principal || 0) + (currentAsset.interest || 0);
    const exactDraw       = drawAmount ? parseFloat(drawAmount) : assetTotalWorth;

    if (exactDraw <= 0 || exactDraw > assetTotalWorth) {
      return res.status(400).json({ success: false, message: "Withdrawal parameters exceed allocation limits." });
    }

    const isFullWithdrawal = Math.abs(exactDraw - assetTotalWorth) < 0.01;

    if (isFullWithdrawal) {
      if (!user.completedInvestments) user.completedInvestments = [];
      user.completedInvestments.push({
        name:      currentAsset.name,
        principal: currentAsset.principal,
        interest:  currentAsset.interest,
        rate:      currentAsset.rate,
        duration:  String(currentAsset.duration),
        status:    "Withdrawn",
        closedAt:  new Date()
      });
      user.myInvestments.splice(assetIndex, 1);
    } else {
      if (exactDraw <= currentAsset.interest) {
        currentAsset.interest -= exactDraw;
      } else {
        const remainingDeficit  = exactDraw - currentAsset.interest;
        currentAsset.interest   = 0;
        currentAsset.principal -= remainingDeficit;
      }
    }

    user.investLiquidityBalance += exactDraw;

    const txRef           = generateInvestReference();
    const cleanDateString = new Date().toLocaleString();

    if (!user.investmentTransactions) user.investmentTransactions = [];
    user.investmentTransactions.unshift({
      txnId:  txRef,
      type:   "Emergency Withdrawal",
      asset:  currentAsset.name,
      amount: exactDraw,
      date:   cleanDateString
    });

    await user.save();

    return res.status(200).json({
      success:       true,
      message:       "Emergency Drawdown Cleared Natively",
      balance:       user.investLiquidityBalance,
      myInvestments: user.myInvestments
    });

  } catch (error) {
    console.error("Emergency asset draw crash:", error);
    return res.status(500).json({ success: false, message: "Internal ledger payout execution failure." });
  }
};

const terminatePlan = async (req, res) => {
  const { assetId, transactionPin } = req.body;

  try {
    const user = await Registeruser.findById(req.user._id);
    if (!user) return res.status(401).json({ success: false, message: "Authentication session invalid." });

    if (blockIfRestricted(user, 'any', res)) return;

    const isPinValid = await verifyTransactionPin(transactionPin, user.transactionPin);
    if (!isPinValid) {
      return res.status(400).json({ success: false, message: "Invalid Transaction Security PIN." });
    }

    const assetIndex = user.myInvestments.findIndex(inv => inv._id.toString() === assetId);
    if (assetIndex === -1) {
      return res.status(404).json({ success: false, message: "Target asset portfolio reference not found." });
    }

    const targetAsset            = user.myInvestments[assetIndex];
    const liquidationFeePenalty  = (targetAsset.principal || 0) * 0.035;
    const grossValue             = (targetAsset.principal || 0) + (targetAsset.interest || 0);
    const finalLiquidRefundValue = Math.max(0, grossValue - liquidationFeePenalty);

    if (!user.completedInvestments) user.completedInvestments = [];
    user.completedInvestments.push({
      name:      targetAsset.name,
      principal: targetAsset.principal,
      interest:  targetAsset.interest,
      rate:      targetAsset.rate,
      duration:  String(targetAsset.duration),
      status:    "Terminated",
      closedAt:  new Date()
    });

    user.myInvestments.splice(assetIndex, 1);
    user.investLiquidityBalance += finalLiquidRefundValue;

    const txRef           = generateInvestReference();
    const cleanDateString = new Date().toLocaleString();

    if (!user.investmentTransactions) user.investmentTransactions = [];
    user.investmentTransactions.unshift({
      txnId:  txRef,
      type:   "Asset Liquidation",
      asset:  targetAsset.name,
      amount: finalLiquidRefundValue,
      date:   cleanDateString
    });

    await user.save();

    return res.status(200).json({
      success:       true,
      message:       "Asset Contract Closed. Liquid Refund Cleared.",
      balance:       user.investLiquidityBalance,
      myInvestments: user.myInvestments
    });

  } catch (error) {
    console.error("Asset liquidation termination crash:", error);
    return res.status(500).json({ success: false, message: "Asset liquidation operational loop failure." });
  }
};

module.exports = {
  getPortfolio,
  commitCapital,
  emergencyWithdraw,
  terminatePlan,
  fundLiquidityPool,
  withdrawLiquidityPool
};