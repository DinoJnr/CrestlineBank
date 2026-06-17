const Registeruser = require('../models/Registerusers.model');
const bcrypt = require('bcryptjs');
const { sendRegisterwelcomeEmail } = require('../utils/sendWelcomeMail');
const { sendSecurityUpdateEmail } = require('../utils/updateSecurity');
const jwt = require('jsonwebtoken');
const { Transaction, Activity } = require('../models/Transactivity');
const mongoose = require('mongoose');
const CardReplacement = require("../models/CardReplacement.model");
const Settings = require("../models/Settings.model");
const { blockIfRestricted } = require('../utils/accountRestrictions');
const { PendingInquiry, ArchivedInquiry } = require("../models/Inquiry.model");

const generateReference  = () => `CRST-${Math.floor(100000 + Math.random() * 900000)}`;
const generateRef = (prefix = 'CT') =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const generateCardNumber = () => Array.from({ length: 4 }, () => Math.floor(1000 + Math.random() * 9000)).join('');
const generateCVV        = () => String(Math.floor(100 + Math.random() * 900));
const getExpiry = (years) => {
  const d  = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear() + years).slice(-2);
  return `${mm}/${yy}`;
};
const TIER_DURATION = { silver: 3, gold: 5, black: 10 };

const checkPin = async (plain, hashed) => {
  if (!hashed) return false;
  return await bcrypt.compare(String(plain), hashed);
};

const makeRef = () =>
  'TRF-' + Date.now().toString(36).toUpperCase() + '-' +
  Math.random().toString(36).substring(2, 6).toUpperCase();

exports.register = async (req, res) => {
  try {
    const systemSettings = await Settings.findOne({});

    if (systemSettings && systemSettings.maintenanceMode) {
      return res.status(503).json({
        success: false,
        message: "Registration is temporarily offline for scheduled system upgrades. Please try again shortly."
      });
    }

    const {
      fullName, email, phone, address,
      dob, gender, accountType, password, accountNumber
    } = req.body;

    const existingRegisteruser = await Registeruser.findOne({ email });
    if (existingRegisteruser) {
      return res.status(400).json({ message: "Email already registered to an account." });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newRegisteruser = new Registeruser({
      fullName, email, phone, address, dob, gender,
      accountType, accountNumber, password: hashedPassword
    });

    await newRegisteruser.save();

    try {
      await sendRegisterwelcomeEmail(newRegisteruser);
    } catch (mailError) {
      console.error("Email failed to send:", mailError);
    }

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newRegisteruser._id,
        fullName: newRegisteruser.fullName,
        accountNumber: newRegisteruser.accountNumber
      }
    });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Registeruser.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials. Access denied." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials. Access denied." });
    }

    if (user.cbnBlacklist) {
      return res.status(403).json({
        success: false,
        code: 'CBN_BLACKLISTED',
        message: 'Access denied. This account has been placed on the CBN sanctions list. Contact your branch immediately.'
      });
    }

    const token = jwt.sign(
      { id: user._id, accountNumber: user.accountNumber },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: "Authorization successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        accountNumber: user.accountNumber,
        balance: user.balance,
        accountType: user.accountType,
        status: user.status,
        pndType: user.pndType || null,
        dormant: user.dormant,
        amlFlag: user.amlFlag,
        watchlist: user.watchlist,
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal server error during authorization." });
  }
};

exports.getDashboardData = async (req, res) => {
  try {
    const user = await Registeruser.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found in Crestline records." });
    }

    res.status(200).json({
      user: {
        fullName:      user.fullName,
        accountNumber: user.accountNumber,
        balance:       user.balance,
        accountType:   user.accountType,
        currency:      user.currency,
        hasPin:        !!user.transactionPin,
        cardStatus:    user.cardStatus || null,
        cardPin:       user.cardPin    || null,
        card: user.card ? {
          cardNumber: user.card.cardNumber,
          cvv:        user.card.cvv,
          expiryDate: user.card.expiryDate,
          tier:       user.card.tier,
        } : null,
        status:        user.status,
        frozenReason:  user.frozenReason || null,
        pndType:       user.pndType || null,
        dormant:       user.dormant,
        amlFlag:       user.amlFlag,
        watchlist:     user.watchlist,
        cbnBlacklist:  user.cbnBlacklist,
      }
    });

  } catch (error) {
    console.error("Dashboard Fetch Error:", error);
    res.status(500).json({ message: "Security terminal error: Could not retrieve vault data." });
  }
};

exports.addMoney = async (req, res) => {
  try {
    const { reference, userId, amount, description } = req.body;

    if (!reference || !userId || !amount) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const existing = await Transaction.findOne({ reference });
    if (existing) {
      return res.status(200).json({ success: true, message: "Transaction already recorded" });
    }

    const user = await Registeruser.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (blockIfRestricted(user, 'credit', res)) return;

    const numericAmount = parseFloat(amount);

    await Transaction.create({
      userId:        user._id,
      customerName:  user.fullName,
      accountNumber: user.accountNumber,
      reference,
      amount:        String(numericAmount),
      description:   description || "Wallet Top-Up via Paystack",
      status:        "completed",
    });

    await Registeruser.findByIdAndUpdate(userId, {
      $inc: { balance: numericAmount },
    });

    res.status(200).json({
      success: true,
      message: `₦${numericAmount.toLocaleString()} added to your vault.`,
      newBalance: user.balance + numericAmount,
    });

  } catch (error) {
    console.error("ADD MONEY ERROR:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateSecurity = async (req, res) => {
  try {
    const { type, currentPassword, newPassword, oldPin, newPin } = req.body;
    const user = await Registeruser.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (type === 'password') {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(401).json({ message: "Incorrect current password." });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      try {
        await Activity.create({
          userId: user._id, action: "Password Change",
          details: "User successfully rotated their login credentials.",
          ipAddress: req.ip || req.headers['x-forwarded-for']
        });
      } catch (logErr) { console.error("Activity logging failed:", logErr.message); }

      try { await sendSecurityUpdateEmail(user, 'password'); } catch (e) {}
      return res.status(200).json({ message: "Password updated successfully" });
    }

    if (type === 'pin') {
      if (user.transactionPin) {
        const isPinMatch = await bcrypt.compare(String(oldPin), user.transactionPin);
        if (!isPinMatch) return res.status(401).json({ message: "Incorrect old PIN." });
      }

      const salt = await bcrypt.genSalt(10);
      user.transactionPin = await bcrypt.hash(String(newPin), salt);
      await user.save();

      try {
        await Activity.create({
          userId: user._id, action: "PIN Modification",
          details: user.transactionPin ? "User updated their existing transaction PIN." : "User established their initial transaction PIN.",
          ipAddress: req.ip || req.headers['x-forwarded-for']
        });
      } catch (logErr) {}

      try { await sendSecurityUpdateEmail(user, 'pin'); } catch (e) {}
      return res.status(200).json({ message: "Transaction PIN secured" });
    }

  } catch (error) {
    console.error("Security Controller Error:", error);
    res.status(500).json({ message: "Security protocol error" });
  }
};

exports.verifyPin = async (req, res) => {
  try {
    const { pin } = req.body;
    const user = await Registeruser.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const match = await checkPin(pin, user.transactionPin);
    if (!match) return res.status(401).json({ success: false, message: "Incorrect PIN" });

    res.json({ success: true, message: "PIN verified" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.saveTransaction = async (req, res) => {
  try {
    const { price, cardTier, authPin, description } = req.body;

    if (price === undefined || price === null) {
      return res.status(400).json({ success: false, message: "Transaction price is missing" });
    }

    const user = await Registeruser.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (blockIfRestricted(user, 'debit', res)) return;

    const match = await checkPin(authPin, user.transactionPin);
    if (!match) return res.status(401).json({ success: false, message: "Incorrect Transaction PIN" });

    const numericAmount = Number(String(price).replace(/[^0-9.-]+/g, ""));
    if (isNaN(numericAmount)) {
      return res.status(400).json({ success: false, message: "Invalid price format" });
    }

    if (user.balance < numericAmount) {
      return res.status(400).json({ success: false, message: "Insufficient Funds" });
    }

    user.balance -= numericAmount;

    const newTransaction = new Transaction({
      userId:        user._id,
      customerName:  user.fullName,
      accountNumber: user.accountNumber || "N/A",
      reference:     generateReference(),
      amount:        price,
      tier:          cardTier,
      description:   description || `Payment for ${cardTier} card`,
      status:        'completed',
    });

    await user.save();
    await newTransaction.save();

    res.json({
      success:   true,
      message:   "Payment Successful",
      balance:   user.balance,
      reference: newTransaction.reference,
    });

  } catch (err) {
    console.error("TX_ERROR:", err.message);
    res.status(500).json({ success: false, message: "Server Error during transaction" });
  }
};

exports.saveActivity = async (req, res) => {
  try {
    const { action, details, authPin, transactionPin, reason } = req.body;
    const incomingPin = authPin || transactionPin;

    const user = await Registeruser.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (blockIfRestricted(user, 'debit', res)) return;

    if (!incomingPin) {
      return res.status(400).json({ success: false, message: "Transaction verification PIN is missing." });
    }

    const match = await checkPin(incomingPin, user.transactionPin);
    if (!match) return res.status(401).json({ success: false, message: "Invalid PIN" });

    const logAction = action || "Financial Transaction Request";

    await Activity.create({
      userId: user._id,
      action: logAction,
      details: details || "User authorized an encrypted terminal operation.",
      reason: reason || "System utility deployment",
      ipAddress: req.ip || req.headers['x-forwarded-for'],
    });

    res.json({ success: true, message: "Activity successfully logged" });

  } catch (err) {
    console.error("ACTIVITY_ERROR:", err);
    res.status(500).json({ success: false, message: "Log Error" });
  }
};

const CARD_TIER_FEES = {
  silver: 2500,
  gold:   4000,
  black:  15000,
};

exports.requestCard = async (req, res) => {
  try {
    const { tier, address, pin } = req.body;
    const user = await Registeruser.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (blockIfRestricted(user, 'debit', res)) return;

    const match = await checkPin(pin, user.transactionPin);
    if (!match) return res.status(401).json({ success: false, message: 'Incorrect Transaction PIN' });

    const fee = CARD_TIER_FEES[tier];
    if (fee === undefined) {
      return res.status(400).json({ success: false, message: 'Invalid card tier specified.' });
    }

    if (user.balance < fee) {
      return res.status(400).json({ success: false, message: 'Insufficient balance to cover card issuance fee.' });
    }

    user.balance -= fee;
    user.lastTransaction = new Date();

    user.cardStatus = 'active';
    user.card = {
      cardNumber: generateCardNumber(),
      expiryDate: getExpiry(TIER_DURATION[tier] || 3),
      cvv:        generateCVV(),
      tier,
      address,
      issuedAt:   new Date(),
    };

    await user.save();

    const reference = generateRef('CD');

    try {
      await Transaction.create({
        userId:        user._id,
        customerName:  user.fullName,
        accountNumber: user.accountNumber,
        reference,
        amount:        (-fee).toString(),
        description:   `${tier} card issuance fee`,
        tier:          'Card Issuance',
        status:        'completed',
        balanceAfter:  user.balance,
      });
    } catch (logError) { console.error("Transaction ledger logging failure:", logError.message); }

    try {
      await Activity.create({
        userId: user._id, action: "Card Issuance",
        details: `New ${tier} card issued — Card No: ${user.card.cardNumber}, Expiry: ${user.card.expiryDate}. Fee: ₦${fee.toLocaleString()}. Ref: ${reference}`,
        ipAddress: req.ip || req.headers['x-forwarded-for']
      });
    } catch (logError) {}

    res.json({ success: true, message: 'Card issued successfully', card: user.card, reference, newBalance: user.balance });

  } catch (err) {
    console.error('REQUEST_CARD_ERROR:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.requestReplacement = async (req, res) => {
  try {
    const { reason, pin } = req.body;
    const user = await Registeruser.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (blockIfRestricted(user, 'debit', res)) return;

    const match = await checkPin(pin, user.transactionPin);
    if (!match) return res.status(401).json({ success: false, message: 'Incorrect Transaction PIN' });

    const oldTier   = user.card?.tier || 'unknown';
    user.cardStatus = 'disabled';
    await user.save();

    await CardReplacement.create({
      userId:        user._id,
      customerName:  user.fullName,
      accountNumber: user.accountNumber,
      reason,
      oldTier,
      status:        'pending',
    });

    await Activity.create({
      userId:    user._id,
      action:    'CARD_REPLACEMENT_REQUESTED',
      details:   `Reason: ${reason}`,
      ipAddress: req.ip || req.headers['x-forwarded-for'],
    });

    res.json({ success: true, message: 'Replacement request submitted. Card disabled.' });

  } catch (err) {
    console.error('REPLACEMENT_ERROR:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.setCardPin = async (req, res) => {
  try {
    const { oldPin, newPin, txnPin } = req.body;
    const user = await Registeruser.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (blockIfRestricted(user, 'any', res)) return;

    const txnMatch = await bcrypt.compare(String(txnPin), user.transactionPin);
    if (!txnMatch) return res.status(401).json({ success: false, message: 'Incorrect Transaction PIN' });

    if (user.cardPin) {
      if (!oldPin) return res.status(400).json({ success: false, message: 'Current card PIN required' });
      const isOldPinValid = await bcrypt.compare(String(oldPin), user.cardPin);
      if (!isOldPinValid) return res.status(401).json({ success: false, message: 'Incorrect current card PIN' });
    }

    const hashedCardPin = await bcrypt.hash(String(newPin), 10);
    await Registeruser.findByIdAndUpdate(req.user.id, { $set: { cardPin: hashedCardPin } });

    await Activity.create({
      userId: user._id, action: 'CARD_PIN_SET',
      details: 'Card ATM PIN updated',
      ipAddress: req.ip || req.headers['x-forwarded-for'],
    });

    res.json({ success: true, message: 'Card PIN updated successfully' });

  } catch (err) {
    console.error('SET_CARD_PIN_ERROR:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.lookupAccount = async (req, res) => {
  try {
    const { accountNumber } = req.query;

    if (!accountNumber || accountNumber.length !== 10) {
      return res.status(400).json({ success: false, message: 'Enter a valid 10-digit account number.' });
    }

    const recipient = await Registeruser.findOne(
      { accountNumber },
      'fullName accountNumber accountType status cbnBlacklist'
    );

    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    if (recipient._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot transfer to your own account.' });
    }

    if (recipient.cbnBlacklist) {
      return res.status(403).json({ success: false, message: 'Transfers to this account are restricted. Please contact your branch.' });
    }

    return res.status(200).json({
      success: true,
      recipient: {
        fullName:      recipient.fullName.toUpperCase(),
        accountNumber: recipient.accountNumber,
        accountType:   recipient.accountType,
      },
    });
  } catch (err) {
    console.error('[lookupAccount]', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

exports.executeTransfer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { accountNumber, amount, description, authPin } = req.body;

    if (!accountNumber || !amount || !authPin) {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ success: false, message: 'Invalid transfer amount.' });
    }

    const sender = await Registeruser.findById(req.user.id).session(session);
    if (!sender) {
      await session.abortTransaction(); session.endSession();
      return res.status(404).json({ success: false, message: 'Sender account not found.' });
    }

    const restriction = require('../utils/accountRestrictions').checkRestrictions(sender, 'debit');
    if (restriction) {
      await session.abortTransaction(); session.endSession();
      return res.status(403).json(restriction);
    }

    const activeTier = sender.currentComplianceTier || 1;
    const tierLimits = { 1: 50000, 2: 2000000, 3: 10000000 };
    const allowedMaxLimit = tierLimits[activeTier] || 50000;

    if (transferAmount > allowedMaxLimit) {
      await session.abortTransaction(); session.endSession();
      return res.status(403).json({
        success: false,
        message: `Transaction limits exceeded. Your current Tier ${activeTier} status limits single transfers to ₦${allowedMaxLimit.toLocaleString()}. Please complete your infrastructure upgrade protocol.`
      });
    }

    if (!sender.transactionPin) {
      await session.abortTransaction(); session.endSession();
      return res.status(403).json({ success: false, message: 'No transaction PIN set. Please set one first.' });
    }

    const pinMatch = await bcrypt.compare(authPin, sender.transactionPin);
    if (!pinMatch) {
      await session.abortTransaction(); session.endSession();
      return res.status(401).json({ success: false, message: 'Incorrect transaction PIN.' });
    }

    if (sender.balance < transferAmount) {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ success: false, message: 'Insufficient balance.' });
    }

    const recipient = await Registeruser.findOne({ accountNumber }).session(session);
    if (!recipient) {
      await session.abortTransaction(); session.endSession();
      return res.status(404).json({ success: false, message: 'Recipient account not found.' });
    }

    if (recipient._id.toString() === sender._id.toString()) {
      await session.abortTransaction(); session.endSession();
      return res.status(400).json({ success: false, message: 'You cannot transfer to your own account.' });
    }

    const recipientRestriction = require('../utils/accountRestrictions').checkRestrictions(recipient, 'credit');
    if (recipientRestriction) {
      await session.abortTransaction(); session.endSession();
      return res.status(403).json({
        success: false,
        message: `Transfer declined: The recipient account cannot receive funds at this time. Please try a different account.`
      });
    }

    const reference = makeRef();

    const senderNewBalance = sender.balance - transferAmount;
    const recipientNewBalance = recipient.balance + transferAmount;

    await Registeruser.findByIdAndUpdate(
      sender._id,
      { $inc: { balance: -transferAmount }, lastTransaction: new Date() },
      { session }
    );

    await Registeruser.findByIdAndUpdate(
      recipient._id,
      { $inc: { balance: transferAmount } },
      { session }
    );

    await Transaction.create([{
      userId:        sender._id,
      customerName:  sender.fullName,
      accountNumber: sender.accountNumber,
      reference,
      amount:        (-transferAmount).toString(),
      description:   description || `Transfer to ${recipient.fullName}`,
      tier:          'Transfer',
      status:        'completed',
      balanceAfter:  senderNewBalance,
    }], { session });

    await Transaction.create([{
      userId:        recipient._id,
      customerName:  recipient.fullName,
      accountNumber: recipient.accountNumber,
      reference,
      amount:        transferAmount.toString(),
      description:   description || `Transfer from ${sender.fullName}`,
      tier:          'Transfer',
      status:        'completed',
      balanceAfter:  recipientNewBalance,
    }], { session });

    await Activity.create([{
      userId:    sender._id,
      action:    'TRANSFER_SENT',
      details:   `₦${transferAmount.toLocaleString()} sent to ${recipient.fullName} (${recipient.accountNumber}). Ref: ${reference}`,
      ipAddress: req.ip || 'User App',
    }], { session });

    await Activity.create([{
      userId:    recipient._id,
      action:    'TRANSFER_RECEIVED',
      details:   `₦${transferAmount.toLocaleString()} received from ${sender.fullName} (${sender.accountNumber}). Ref: ${reference}`,
      ipAddress: 'System',
    }], { session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: 'Transfer successful.',
      reference,
      amount: transferAmount,
      recipient: recipient.fullName.toUpperCase(),
      newBalance: senderNewBalance,
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('[executeTransfer]', err);
    return res.status(500).json({ success: false, message: 'Transfer failed. Please try again.' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await Registeruser.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found in Crestline records.' });

    const tierMap  = { personal: 'Tier 1', business: 'Tier 2', corporate: 'Tier 3' };
    const limitMap = { personal: 500_000, business: 2_000_000, corporate: 10_000_000 };

    res.status(200).json({
      user: {
        fullName: user.fullName, email: user.email, phone: user.phone,
        address: user.address, dob: user.dob, gender: user.gender,
        accountType: user.accountType, accountNumber: user.accountNumber,
        balance: user.balance, currentComplianceTier: user.currentComplianceTier || 1,
        kycMetadata: user.kycMetadata, currency: user.currency,
        status: user.status, hasPin: !!user.transactionPin,
        cardStatus: user.cardStatus || null,
        card: user.card ? {
          cardNumber: user.card.cardNumber, expiryDate: user.card.expiryDate,
          tier: user.card.tier, address: user.card.address, issuedAt: user.card.issuedAt,
        } : null,
        tier: tierMap[user.accountType] || 'Tier 1',
        transactionLimit: limitMap[user.accountType] || 500_000,
        frozenReason:  user.frozenReason || null,
        pndType:       user.pndType || null,
        dormant:       user.dormant,
        amlFlag:       user.amlFlag,
        watchlist:     user.watchlist,
        cbnBlacklist:  user.cbnBlacklist,
        unclaimed:     user.unclaimed,
      },
    });

  } catch (error) {
    console.error('Profile Fetch Error:', error);
    res.status(500).json({ message: 'Security terminal error: Could not retrieve profile data.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await Registeruser.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found in Crestline records.' });

    if (phone !== undefined) user.phone = phone;
    await user.save();

    return res.status(200).json({
      message: 'Security terminal synchronized: Profile phone parameter updated successfully.'
    });
  } catch (error) {
    console.error('Profile Modification Error:', error);
    return res.status(500).json({ message: 'Failed to synchronize updated identity parameters back to DB.' });
  }
};

exports.airtimeTopUp = async (req, res) => {
  try {
    const { phoneNumber, network, amount, transactionPin } = req.body;

    if (!phoneNumber || !network || !amount || !transactionPin) {
      return res.status(400).json({ success: false, message: "Missing required parameters." });
    }
    if (amount <= 0) {
      return res.status(400).json({ success: false, message: "Provide a valid numeric top-up value." });
    }

    const user = await Registeruser.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User account signature not found." });

    if (blockIfRestricted(user, 'debit', res)) return;

    if (!user.transactionPin) {
      return res.status(400).json({ success: false, message: "Transaction PIN not configured on this account." });
    }

    const isPinValid = await bcrypt.compare(String(transactionPin), user.transactionPin);
    if (!isPinValid) {
      return res.status(401).json({ success: false, message: "Invalid Transaction Authorization PIN." });
    }

    if (user.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient vault balance to fulfill request." });
    }

    user.balance -= amount;
    user.lastTransaction = new Date();
    await user.save();

    const reference = generateRef('AT');

    try {
      await Transaction.create({
        userId:        user._id,
        customerName:  user.fullName,
        accountNumber: user.accountNumber,
        reference,
        amount:        (-amount).toString(),
        description:   `${network.toUpperCase()} airtime top-up — ${phoneNumber}`,
        tier:          'Airtime Purchase',
        status:        'completed',
        balanceAfter:  user.balance,
      });
    } catch (logError) { console.error("Transaction ledger logging failure:", logError.message); }

    try {
      await Activity.create({
        userId: user._id, action: "Airtime Purchase",
        details: `Successfully dispatched ₦${amount.toLocaleString()} ${network.toUpperCase()} airtime to ${phoneNumber}. Ref: ${reference}`,
        ipAddress: req.ip || req.headers['x-forwarded-for']
      });
    } catch (logError) { console.error("Ledger logging failure:", logError.message); }

    return res.status(200).json({
      success: true,
      message: `Successfully loaded ₦${amount.toLocaleString()} to ${phoneNumber}.`,
      reference,
      newBalance: user.balance
    });

  } catch (error) {
    console.error("AIRTIME PROTOCOL FAILURE:", error);
    return res.status(500).json({ success: false, message: "Internal application core terminal error." });
  }
};

exports.dataTopUp = async (req, res) => {
  try {
    const { phoneNumber, network, amount, planSize, planValidity, transactionPin } = req.body;

    if (!phoneNumber || !network || !amount || !planSize || !transactionPin) {
      return res.status(400).json({ success: false, message: "Missing vital utility transaction parameters." });
    }

    const user = await Registeruser.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User credentials contextual trace missing." });

    if (blockIfRestricted(user, 'debit', res)) return;

    if (!user.transactionPin) {
      return res.status(400).json({ success: false, message: "Security parameters unconfigured on account." });
    }

    const isPinValid = await bcrypt.compare(String(transactionPin), user.transactionPin);
    if (!isPinValid) {
      return res.status(401).json({ success: false, message: "Unauthorized account security signature match." });
    }

    if (user.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient vault funds for this data deployment." });
    }

    user.balance -= amount;
    user.lastTransaction = new Date();
    await user.save();

    const reference = generateRef('DT');

    try {
      await Transaction.create({
        userId:        user._id,
        customerName:  user.fullName,
        accountNumber: user.accountNumber,
        reference,
        amount:        (-amount).toString(),
        description:   `${network.toUpperCase()} ${planSize} data bundle (${planValidity}) — ${phoneNumber}`,
        tier:          'Data Bundle Purchase',
        status:        'completed',
        balanceAfter:  user.balance,
      });
    } catch (logError) { console.error("Transaction ledger logging failure:", logError.message); }

    try {
      await Activity.create({
        userId: user._id, action: "Data Bundle Purchase",
        details: `Dispatched ${planSize} ${network.toUpperCase()} bundle (${planValidity}) to ${phoneNumber}. Ref: ${reference}`,
        ipAddress: req.ip || req.headers['x-forwarded-for']
      });
    } catch (logError) {}

    return res.status(200).json({
      success: true,
      message: `Successfully established ${planSize} bundle deployment to ${phoneNumber}.`,
      reference,
      newBalance: user.balance
    });

  } catch (error) {
    console.error("DATA PURCHASE FAILURE:", error);
    return res.status(500).json({ success: false, message: "Internal execution failure across core framework engines." });
  }
};

exports.verifySportyAccount = async (req, res) => {
  try {
    const { platform, customerId } = req.body;
    if (!platform || !customerId) {
      return res.status(400).json({ success: false, message: "Missing query parameter parameters." });
    }
    const platformPrefix = platform.substring(0, 3).toUpperCase();
    const verifiedName = `CRESTLINE_${platformPrefix}_USER_${customerId.slice(-4)}`;
    return res.status(200).json({ success: true, accountName: verifiedName });
  } catch (error) {
    return res.status(500).json({ success: false, message: "External aggregator connection timeout." });
  }
};

exports.sportyWalletTopUp = async (req, res) => {
  try {
    const { platform, customerId, accountName, amount, transactionPin } = req.body;

    if (!platform || !customerId || !amount || !transactionPin || !accountName) {
      return res.status(400).json({ success: false, message: "Missing required payout checkout data fields." });
    }
    if (amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid financial target amount requirements." });
    }

    const user = await Registeruser.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User security account context trace lost." });

    if (blockIfRestricted(user, 'debit', res)) return;

    if (!user.transactionPin) {
      return res.status(400).json({ success: false, message: "Transaction PIN parameters are unconfigured." });
    }

    const isPinValid = await bcrypt.compare(String(transactionPin), user.transactionPin);
    if (!isPinValid) {
      return res.status(401).json({ success: false, message: "Unauthorized transaction security signature." });
    }

    if (user.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient internal vault balance to perform checkout." });
    }

    user.balance -= amount;
    user.lastTransaction = new Date();
    await user.save();

    const reference = generateRef('SP');

    try {
      await Transaction.create({
        userId:        user._id,
        customerName:  user.fullName,
        accountNumber: user.accountNumber,
        reference,
        amount:        (-amount).toString(),
        description:   `${platform.toUpperCase()} wallet funding — ${accountName} (${customerId})`,
        tier:          'Merchant Wallet Funding',
        status:        'completed',
        balanceAfter:  user.balance,
      });
    } catch (logError) { console.error("Transaction ledger logging failure:", logError.message); }

    try {
      await Activity.create({
        userId: user._id, action: "Merchant Wallet Funding",
        details: `Funded ₦${Number(amount).toLocaleString()} into ${platform.toUpperCase()} ID: ${customerId} (${accountName}). Ref: ${reference}`,
        ipAddress: req.ip || req.headers['x-forwarded-for']
      });
    } catch (logError) {}

    return res.status(200).json({
      success: true,
      message: `Merchant gateway successfully completed settlement to ${accountName}.`,
      reference,
      newBalance: user.balance
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error during settlement." });
  }
};

exports.verifyBillAccount = async (req, res) => {
  try {
    const { category, biller, idNumber } = req.body;
    if (!category || !biller || !idNumber) {
      return res.status(400).json({ success: false, message: "Missing required query verification fields." });
    }
    const labelTag = category === 'cable' ? 'CARD' : 'METER';
    const computedName = `CRESTLINE_${biller.toUpperCase()}_${labelTag}_${idNumber.slice(-4)}`;
    return res.status(200).json({ success: true, customerName: computedName });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Aggregator processing lookup timeout." });
  }
};

exports.settleUtilityBill = async (req, res) => {
  try {
    const { category, biller, packagePlan, idNumber, customerName, amount, transactionPin } = req.body;

    if (!category || !biller || !packagePlan || !idNumber || !customerName || !amount || !transactionPin) {
      return res.status(400).json({ success: false, message: "Incomplete transactional payload parameters parsed." });
    }
    if (amount <= 0) {
      return res.status(400).json({ success: false, message: "Calculated invoice amount violates financial safety criteria." });
    }

    const user = await Registeruser.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "Security user contextual trace dropped." });

    if (blockIfRestricted(user, 'debit', res)) return;

    if (!user.transactionPin) {
      return res.status(400).json({ success: false, message: "Account security transaction PIN parameters unconfigured." });
    }

    const isPinValid = await bcrypt.compare(String(transactionPin), user.transactionPin);
    if (!isPinValid) {
      return res.status(401).json({ success: false, message: "Invalid accounting security signature trace." });
    }

    if (user.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient internal wallet liquidities for utility checkout." });
    }

    user.balance -= amount;
    user.lastTransaction = new Date();
    await user.save();

    const reference = generateRef('UB');

    try {
      await Transaction.create({
        userId:        user._id,
        customerName:  user.fullName,
        accountNumber: user.accountNumber,
        reference,
        amount:        (-amount).toString(),
        description:   `${biller} ${packagePlan} — ${customerName} (${idNumber})`,
        tier:          'Utility Payment',
        status:        'completed',
        balanceAfter:  user.balance,
      });
    } catch (logError) { console.error("Transaction ledger logging failure:", logError.message); }

    try {
      await Activity.create({
        userId: user._id, action: "Utility Bill Payment",
        details: `Settled ${biller} ${packagePlan} for Account ID: ${idNumber} (${customerName}). Value: ₦${amount.toLocaleString()}. Ref: ${reference}`,
        ipAddress: req.ip || req.headers['x-forwarded-for']
      });
    } catch (logError) {}

    return res.status(200).json({
      success: true,
      message: `Utility asset ledger settled successfully to account reference ${customerName}.`,
      reference,
      newBalance: user.balance
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal application core orchestration matrix crash." });
  }
};

exports.getLoanState = async (req, res) => {
  try {
    const user = await Registeruser.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const dynamicLoanState = (user.activeLoan && user.activeLoan.balance > 0) ? user.activeLoan : null;

    return res.status(200).json({
      success: true,
      activeLoan: dynamicLoanState,
      walletBalance: user.balance
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.requestLoan = async (req, res) => {
  try {
    const { principal, tenure, transactionPin } = req.body;
    const user = await Registeruser.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (blockIfRestricted(user, 'any', res)) return;

    const isPinValid = await bcrypt.compare(transactionPin, user.transactionPin);
    if (!isPinValid) {
      return res.status(400).json({ success: false, message: "Invalid Transaction PIN" });
    }

    if (user.activeLoan && user.activeLoan.balance > 0) {
      return res.status(400).json({ success: false, message: "Locked: Active debt obligation outstanding." });
    }

    const monthlyRate = 0.05;
    const totalRepayment = principal + (principal * monthlyRate * tenure);
    const monthlyInstallment = totalRepayment / tenure;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const generatedLoan = {
      id: `LN-${Math.floor(100000 + Math.random() * 900000)}`,
      principal: Number(principal),
      totalRepayment,
      balance: totalRepayment,
      nextDue: dueDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      tenure: `${tenure} Months`,
      installment: Math.round(monthlyInstallment)
    };

    user.balance += Number(principal);
    user.activeLoan = generatedLoan;
    user.lastTransaction = new Date();
    await user.save();

    const reference = generateRef('LN');

    try {
      await Transaction.create({
        userId:        user._id,
        customerName:  user.fullName,
        accountNumber: user.accountNumber,
        reference,
        amount:        Number(principal).toString(),
        description:   `Loan disbursement — ${generatedLoan.id} (${tenure} months)`,
        tier:          'Loan Disbursement',
        status:        'completed',
        balanceAfter:  user.balance,
      });
    } catch (logError) { console.error("Transaction ledger logging failure:", logError.message); }

    try {
      await Activity.create({
        userId: user._id, action: "Loan Disbursed",
        details: `Loan ${generatedLoan.id} disbursed — Principal: ₦${Number(principal).toLocaleString()}, Tenure: ${tenure} months. Ref: ${reference}`,
        ipAddress: req.ip || req.headers['x-forwarded-for']
      });
    } catch (logError) {}

    return res.status(200).json({
      success: true,
      activeLoan: user.activeLoan,
      reference,
      walletBalance: user.balance
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.repayLoan = async (req, res) => {
  try {
    const { loanId, amount, repayType, transactionPin } = req.body;
    const user = await Registeruser.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (blockIfRestricted(user, 'debit', res)) return;

    const isPinValid = await bcrypt.compare(transactionPin, user.transactionPin);
    if (!isPinValid) {
      return res.status(400).json({ success: false, message: "Invalid Transaction PIN" });
    }

    if (!user.activeLoan || user.activeLoan.id !== loanId) {
      return res.status(400).json({ success: false, message: "No active matching record found." });
    }

    const paymentAmount = Number(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid payment amount specification." });
    }

    if (paymentAmount > user.activeLoan.balance) {
      return res.status(400).json({ success: false, message: "Payment exceeds remaining outstanding debt balance." });
    }

    if (user.balance < paymentAmount) {
      return res.status(400).json({ success: false, message: "Insufficient wallet balance to perform settlement." });
    }

    user.balance -= paymentAmount;
    user.lastTransaction = new Date();
    const netRemainingDebt = user.activeLoan.balance - paymentAmount;

    let responseMessage = "";
    if (netRemainingDebt <= 0) {
      user.activeLoan = null;
      responseMessage = "Loan Cleared! Credit Line Restored";
    } else {
      user.activeLoan.balance = netRemainingDebt;
      if (user.activeLoan.balance < user.activeLoan.installment) {
        user.activeLoan.installment = user.activeLoan.balance;
      }
      responseMessage = `Settle execution successful: Paid ₦${paymentAmount.toLocaleString()}`;
    }

    await user.save();

    const reference = generateRef('LR');

    try {
      await Transaction.create({
        userId:        user._id,
        customerName:  user.fullName,
        accountNumber: user.accountNumber,
        reference,
        amount:        (-paymentAmount).toString(),
        description:   `Loan repayment — ${loanId}`,
        tier:          'Loan Repayment',
        status:        'completed',
        balanceAfter:  user.balance,
      });
    } catch (logError) { console.error("Transaction ledger logging failure:", logError.message); }

    try {
      await Activity.create({
        userId: user._id, action: "Loan Repayment",
        details: `${responseMessage} — Loan ${loanId}. Ref: ${reference}`,
        ipAddress: req.ip || req.headers['x-forwarded-for']
      });
    } catch (logError) {}

    return res.status(200).json({
      success: true,
      message: responseMessage,
      activeLoan: user.activeLoan,
      reference,
      walletBalance: user.balance
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.extendLoan = async (req, res) => {
  try {
    const { loanId, transactionPin } = req.body;
    const extensionFee = 2500;
    const user = await Registeruser.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (blockIfRestricted(user, 'debit', res)) return;

    const isPinValid = await bcrypt.compare(transactionPin, user.transactionPin);
    if (!isPinValid) {
      return res.status(400).json({ success: false, message: "Invalid Transaction PIN" });
    }

    if (user.balance < extensionFee) {
      return res.status(400).json({ success: false, message: "Insufficient balance to process extension fee." });
    }

    if (!user.activeLoan || user.activeLoan.id !== loanId) {
      return res.status(400).json({ success: false, message: "Target credit instrument not active." });
    }

    user.balance -= extensionFee;
    user.lastTransaction = new Date();

    const currentDueDate = new Date(user.activeLoan.nextDue);
    const parsingFallback = isNaN(currentDueDate.getTime()) ? new Date() : currentDueDate;
    parsingFallback.setDate(parsingFallback.getDate() + 30);
    const newDueDateString = parsingFallback.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    user.activeLoan.nextDue = newDueDateString;
    await user.save();

    const reference = generateRef('LE');

    try {
      await Transaction.create({
        userId:        user._id,
        customerName:  user.fullName,
        accountNumber: user.accountNumber,
        reference,
        amount:        (-extensionFee).toString(),
        description:   `Loan extension fee — ${loanId}`,
        tier:          'Loan Extension',
        status:        'completed',
        balanceAfter:  user.balance,
      });
    } catch (logError) { console.error("Transaction ledger logging failure:", logError.message); }

    try {
      await Activity.create({
        userId: user._id, action: "Loan Extension",
        details: `Loan ${loanId} extended — New due date: ${newDueDateString}. Fee: ₦${extensionFee.toLocaleString()}. Ref: ${reference}`,
        ipAddress: req.ip || req.headers['x-forwarded-for']
      });
    } catch (logError) {}

    return res.status(200).json({
      success: true, nextDue: newDueDateString, reference, walletBalance: user.balance
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.processTierUpgrade = async (req, res) => {
  try {
    const { targetTier, bvn, nin } = req.body;
    const user = await Registeruser.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Security Context Error: Account structure not found." });

    if (blockIfRestricted(user, 'any', res)) return;

    if (parseInt(targetTier) === 2) {
      if (!bvn || bvn.length !== 11 || !nin || nin.length !== 11) {
        return res.status(400).json({ message: "Validation parameters rejected. BVN and NIN must be exactly 11 digits." });
      }
      user.kycMetadata.bvn = bvn;
      user.kycMetadata.nin = nin;
      user.currentComplianceTier = 2;
      user.kycMetadata.verifiedAt = new Date();
    } else if (parseInt(targetTier) === 3) {
      const documentReference = req.body.utilityBillUrl || "uploads/utility_verified_secure.pdf";
      user.kycMetadata.utilityBill = documentReference;
      user.currentComplianceTier = 3;
      user.kycMetadata.verifiedAt = new Date();
    } else {
      return res.status(400).json({ message: "Invalid system compliance operation index." });
    }

    await user.save();

    return res.status(200).json({
      message: `System upgrade authorized. Account synced to Tier ${user.currentComplianceTier}.`,
      currentTier: user.currentComplianceTier
    });

  } catch (error) {
    console.error("KYC Processing Critical Failure:", error);
    return res.status(500).json({ message: "Internal verification data channel error." });
  }
};

exports.createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const userId = req.user._id;

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: "Missing required ticket parameters." });
    }

    const ticket = await PendingInquiry.create({
      userId,
      subject,
      message
    });

    return res.status(201).json({
      success: true,
      message: "Ticket dispatched to queue.",
      data: ticket
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// exports.getUserInquiries = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const activeTickets = await PendingInquiry.find({ userId }).sort({ createdAt: -1 });
//     const resolvedTickets = await ArchivedInquiry.find({ userId }).sort({ resolvedAt: -1 });

//     return res.status(200).json({
//       success: true,
//       pending: activeTickets,
//       archived: resolvedTickets
//     });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

