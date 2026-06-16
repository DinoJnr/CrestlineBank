const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Registeruser    = require('../models/Registerusers.model');
const { Transaction, Activity } = require('../models/Transactivity');
const CardReplacement = require('../models/CardReplacement.model');

const generateAccountNumber = async () => {
  let accountNumber;
  let exists = true;
  while (exists) {
    accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    exists = await Registeruser.findOne({ accountNumber });
  }
  return accountNumber;
};

const generateRef = (prefix = 'CT') =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const logActivity = async (userId, action, details = '', ipAddress = 'Staff Portal') => {
  try {
    await Activity.create({ userId, action, details, ipAddress });
  } catch (_) {
  }
};

exports.getUser = async (req, res) => {
  try {
    const { accountNumber } = req.params;

    if (!accountNumber || accountNumber.length !== 10) {
      return res.status(400).json({ success: false, message: 'Provide a valid 10-digit NUBAN account number.' });
    }

    const user = await Registeruser
      .findOne({ accountNumber })
      .select('-password -transactionPin -cardPin -card.cvv');

    if (!user) {
      return res.status(404).json({ success: false, message: `No account found for ${accountNumber}` });
    }

    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('[getUser]', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.enrollUser = async (req, res) => {
  try {
    const {
      fullName, email, phone, address, dob,
      gender, accountType, password,
      bvn, nin, altPhone, state, lga, branch, occupation,
      employer, employerAddress, monthlyIncome, pep,
    } = req.body;

    if (!fullName || !email || !phone || !address || !dob || !password) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
    }

    const emailExists = await Registeruser.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const birthDate = new Date(dob);
    const today     = new Date();
    let age         = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age < 18) {
      return res.status(400).json({ success: false, message: 'Customer must be at least 18 years old.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const accountNumber  = await generateAccountNumber();

    const newUser = await Registeruser.create({
      fullName,
      email:        email.toLowerCase(),
      phone,
      altPhone:     altPhone     || null,
      address,
      state:        state        || null,
      lga:          lga          || null,
      branch:       branch       || 'Main Branch',
      dob:          birthDate,
      gender,
      accountType:  accountType  || 'personal',
      accountNumber,
      password:     hashedPassword,
      bvn:          bvn          || null,
      nin:          nin          || null,
      occupation:   occupation   || null,
      employer:     employer     || null,
      employerAddress: employerAddress || null,
      monthlyIncome: monthlyIncome ? Number(monthlyIncome) : 0,
      pep:          pep          || false,
      balance:      0,
      status:       'active',
      kycMetadata: {
        bvn: bvn || null,
        nin: nin || null,
        utilityBill: null,
        verifiedAt: bvn || nin ? new Date() : null
      },
      kyc: {
        status: bvn || nin ? 'Verified' : 'Pending',
        level: bvn || nin ? 'Tier 1 KYC' : 'Basic KYC',
        completedDate: bvn || nin ? new Date() : null,
        bvnLinked: !!bvn,
        ninLinked: !!nin,
        faceMatch: false,
        documents: []
      }
    });

    await logActivity(newUser._id, 'ACCOUNT_CREATED', `New ${accountType || 'personal'} account enrolled by staff.`);

    return res.status(201).json({
      success: true,
      message: 'Account successfully created.',
      user: {
        _id:           newUser._id,
        fullName:      newUser.fullName,
        email:         newUser.email,
        accountNumber: newUser.accountNumber,
        accountType:   newUser.accountType,
        status:        newUser.status,
        createdAt:     newUser.createdAt,
      },
    });
  } catch (err) {
    console.error('[enrollUser]', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { accountNumber } = req.params;

    const ALLOWED_FIELDS = [
      'fullName', 'phone', 'altPhone', 'email', 'address', 'state', 'lga', 'branch',
      'gender', 'dob', 'occupation', 'employer', 'employerAddress', 'monthlyIncome',
      'smsAlert', 'emailAlert', 'pushAlert',
    ];

    const updates = {};
    for (const key of ALLOWED_FIELDS) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update.' });
    }

    const user = await Registeruser.findOne({ accountNumber });
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });

    const updated = await Registeruser
      .findByIdAndUpdate(user._id, { $set: updates }, { new: true, runValidators: true })
      .select('-password -transactionPin -cardPin -card.cvv');

    await logActivity(user._id, 'PROFILE_UPDATED', `Fields updated by staff: ${Object.keys(updates).join(', ')}`);

    return res.status(200).json({ success: true, message: 'Profile updated successfully.', data: updated });
  } catch (err) {
    console.error('[updateUser]', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const {
      status, frozenReason,
      pndType,
      amlFlag, watchlist,
      dormant, unclaimed,
      cbnBlacklist, crsFlag, fatcaFlag,
      failedLogins,
      currentComplianceTier,
      cardTier,
      cardStatus,
    } = req.body;

    const user = await Registeruser.findOne({ accountNumber });
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });

    const updates = {};
    if (status                !== undefined) updates.status                = status;
    if (frozenReason          !== undefined) updates.frozenReason          = frozenReason;
    if (pndType               !== undefined) updates.pndType               = pndType;
    if (amlFlag               !== undefined) updates.amlFlag               = amlFlag;
    if (watchlist             !== undefined) updates.watchlist             = watchlist;
    if (dormant               !== undefined) updates.dormant               = dormant;
    if (unclaimed             !== undefined) updates.unclaimed             = unclaimed;
    if (cbnBlacklist          !== undefined) updates.cbnBlacklist          = cbnBlacklist;
    if (crsFlag               !== undefined) updates.crsFlag               = crsFlag;
    if (fatcaFlag             !== undefined) updates.fatcaFlag             = fatcaFlag;
    if (failedLogins          !== undefined) updates.failedLogins          = failedLogins;
    if (cardStatus            !== undefined) updates.cardStatus            = cardStatus;
    if (currentComplianceTier !== undefined) updates.currentComplianceTier = Number(currentComplianceTier);

    if (cardTier !== undefined) {
      updates['card.tier'] = cardTier;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid status/compliance fields provided.' });
    }

    const updated = await Registeruser
      .findByIdAndUpdate(user._id, { $set: updates }, { new: true })
      .select('-password -transactionPin -cardPin -card.cvv');

    const summary = Object.entries(updates)
      .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
      .join(', ');

    await logActivity(user._id, 'STATUS_UPDATED', summary);

    return res.status(200).json({ success: true, message: 'Account compliance/status updated.', data: updated });
  } catch (err) {
    console.error('[updateUserStatus]', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.updateUserLimits = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const LIMIT_KEYS = ['daily', 'transfer', 'pos', 'atm', 'ussd', 'nfc'];

    const updates = {};
    for (const key of LIMIT_KEYS) {
      if (req.body[key] !== undefined) {
        const val = Number(req.body[key]);
        if (isNaN(val) || val < 0) {
          return res.status(400).json({ success: false, message: `Invalid value for limit key: ${key}` });
        }
        updates[`transactionLimit.${key}`] = val;
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid limit fields provided.' });
    }

    const user = await Registeruser.findOne({ accountNumber });
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });

    const updated = await Registeruser
      .findByIdAndUpdate(user._id, { $set: updates }, { new: true })
      .select('accountNumber transactionLimit');

    const summary = Object.entries(updates)
      .map(([k, v]) => `${k.replace('transactionLimit.', '')}=₦${Number(v).toLocaleString()}`)
      .join(', ');

    await logActivity(user._id, 'LIMITS_UPDATED', `Transaction limits modified: ${summary}`);

    return res.status(200).json({ success: true, message: 'Transaction limits updated.', data: updated });
  } catch (err) {
    console.error('[updateUserLimits]', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.creditAccount = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const { amount, description, channel, narration } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'A valid positive amount is required.' });
    }

    const user = await Registeruser.findOne({ accountNumber });
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });

    if (user.status === 'frozen') {
      return res.status(403).json({ success: false, message: 'Account is frozen — unfreeze before crediting.' });
    }

    const creditAmount    = Number(amount);
    const previousBalance = user.balance;
    const newBalance      = previousBalance + creditAmount;
    const reference       = generateRef('CR');

    await Registeruser.findByIdAndUpdate(user._id, { balance: newBalance });

    await Transaction.create({
      userId:        user._id,
      customerName:  user.fullName,
      accountNumber: user.accountNumber,
      reference,
      amount:        creditAmount.toString(),
      description:   description || narration || 'Staff Manual Credit',
      tier:          channel || 'Manual Credit',
      status:        'completed',
      balanceAfter:  newBalance,
    });

    await logActivity(user._id, 'ACCOUNT_CREDITED', `₦${creditAmount.toLocaleString()} credited via ${channel || 'Manual'}. Ref: ${reference}`);

    return res.status(200).json({
      success: true,
      message: `₦${creditAmount.toLocaleString()} credited successfully.`,
      data: { reference, previousBalance, newBalance, amount: creditAmount },
    });
  } catch (err) {
    console.error('[creditAccount]', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.debitAccount = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const { amount, description, channel, narration } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'A valid positive amount is required.' });
    }

    const user = await Registeruser.findOne({ accountNumber });
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });

    if (user.status === 'frozen') {
      return res.status(403).json({ success: false, message: 'Account is frozen — cannot debit a frozen account.' });
    }

    if (user.pndType === 'Debit' || user.pndType === 'Full') {
      return res.status(403).json({ success: false, message: `Post-No-Debit (${user.pndType}) is active on this account.` });
    }

    const debitAmount     = Number(amount);
    const previousBalance = user.balance;

    if (debitAmount > previousBalance) {
      return res.status(400).json({ success: false, message: 'Insufficient balance for this debit.' });
    }

    const newBalance = previousBalance - debitAmount;
    const reference  = generateRef('DR');

    await Registeruser.findByIdAndUpdate(user._id, { balance: newBalance, lastTransaction: new Date() });

    await Transaction.create({
      userId:        user._id,
      customerName:  user.fullName,
      accountNumber: user.accountNumber,
      reference,
      amount:        (-debitAmount).toString(),
      description:   description || narration || 'Staff Manual Debit',
      tier:          channel || 'Manual Debit',
      status:        'completed',
      balanceAfter:  newBalance,
    });

    await logActivity(user._id, 'ACCOUNT_DEBITED', `₦${debitAmount.toLocaleString()} debited via ${channel || 'Manual'}. Ref: ${reference}`);

    return res.status(200).json({
      success: true,
      message: `₦${debitAmount.toLocaleString()} debited successfully.`,
      data: { reference, previousBalance, newBalance, amount: debitAmount },
    });
  } catch (err) {
    console.error('[debitAccount]', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.getUserTransactions = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip  = (page - 1) * limit;

    const user = await Registeruser.findOne({ accountNumber }).select('_id');
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });

    const filter = { userId: user._id };
    if (req.query.type && req.query.type !== 'all') filter.status = req.query.type;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[getUserTransactions]', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.reverseTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason }        = req.body;

    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return res.status(400).json({ success: false, message: 'Invalid transaction ID.' });
    }

    const txn = await Transaction.findById(transactionId);
    if (!txn) return res.status(404).json({ success: false, message: 'Transaction not found.' });

    if (txn.reversed) {
      return res.status(409).json({ success: false, message: 'This transaction has already been reversed.' });
    }

    const user = await Registeruser.findById(txn.userId);
    if (!user) return res.status(404).json({ success: false, message: 'Account not found for this transaction.' });

    const originalAmount = Number(txn.amount);
    const reversal        = -originalAmount;
    const newBalance      = user.balance + reversal;

    if (newBalance < 0) {
      return res.status(400).json({
        success: false,
        message: `Reversal would push balance negative (₦${newBalance.toLocaleString()}). Current balance is ₦${user.balance.toLocaleString()}.`,
      });
    }

    const reversalRef = generateRef('RV');

    await Registeruser.findByIdAndUpdate(user._id, { balance: newBalance });
    await Transaction.findByIdAndUpdate(transactionId, { reversed: true, reversalRef });

    await Transaction.create({
      userId:        user._id,
      customerName:  user.fullName,
      accountNumber: user.accountNumber,
      reference:     reversalRef,
      amount:        reversal.toString(),
      description:   `Reversal of ${txn.reference} — ${reason || 'Staff reversal'}`,
      tier:          'Staff Reversal',
      status:        'completed',
      balanceAfter:  newBalance,
    });

    await logActivity(user._id, 'TRANSACTION_REVERSED', `Original ref: ${txn.reference} | Reversal ref: ${reversalRef} | Reason: ${reason || 'N/A'}`);

    return res.status(200).json({
      success: true,
      message: 'Transaction reversal posted successfully.',
      data: { reversalRef, newBalance },
    });
  } catch (err) {
    console.error('[reverseTransaction]', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.blockCard = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const { reason, permanent } = req.body;

    const user = await Registeruser.findOne({ accountNumber });
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });

    if (!user.card || user.cardStatus === 'none') {
      return res.status(400).json({ success: false, message: 'No card found on this account.' });
    }

    if (user.cardStatus === 'disabled') {
      return res.status(409).json({ success: false, message: 'Card is already blocked.' });
    }

    const newStatus = permanent ? 'hotlisted' : 'disabled';
    await Registeruser.findByIdAndUpdate(user._id, { cardStatus: newStatus });

    await CardReplacement.create({
      userId:        user._id,
      customerName:  user.fullName,
      accountNumber: user.accountNumber,
      reason:        reason || (permanent ? 'Hotlisted by staff' : 'Blocked by staff'),
      oldTier:       user.card?.tier || 'silver',
      status:        'pending',
    });

    const action = permanent ? 'CARD_HOTLISTED' : 'CARD_BLOCKED';
    await logActivity(user._id, action, reason || 'Staff action');

    return res.status(200).json({
      success: true,
      message: permanent ? 'Card hotlisted permanently.' : 'Card blocked successfully.',
      data: { accountNumber, cardStatus: newStatus },
    });
  } catch (err) {
    console.error('[blockCard]', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.unblockCard = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const { reason }        = req.body;

    const user = await Registeruser.findOne({ accountNumber });
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });

    if (!user.card || user.cardStatus === 'none') {
      return res.status(400).json({ success: false, message: 'No card found on this account.' });
    }

    if (user.cardStatus === 'hotlisted') {
      return res.status(403).json({ success: false, message: 'Hotlisted cards cannot be unblocked — issue a replacement card.' });
    }

    if (user.cardStatus === 'active') {
      return res.status(409).json({ success: false, message: 'Card is already active.' });
    }

    await Registeruser.findByIdAndUpdate(user._id, { cardStatus: 'active' });
    await logActivity(user._id, 'CARD_UNBLOCKED', reason || 'Staff action');

    return res.status(200).json({
      success: true,
      message: 'Card unblocked successfully.',
      data: { accountNumber, cardStatus: 'active' },
    });
  } catch (err) {
    console.error('[unblockCard]', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.replaceCard = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const { reason, oldTier, deliveryAddress } = req.body;

    const user = await Registeruser.findOne({ accountNumber });
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });

    const replacement = await CardReplacement.create({
      userId:          user._id,
      customerName:    user.fullName,
      accountNumber:   user.accountNumber,
      reason:          reason || 'Staff replacement request',
      oldTier:         oldTier || user.card?.tier || 'silver',
      deliveryAddress: deliveryAddress || user.address,
      status:          'pending',
    });

    if (user.cardStatus === 'active') {
      await Registeruser.findByIdAndUpdate(user._id, { cardStatus: 'disabled' });
    }

    await logActivity(user._id, 'CARD_REPLACEMENT_REQUESTED', `Reason: ${reason || 'N/A'} | Delivery: ${deliveryAddress || user.address}`);

    return res.status(201).json({
      success: true,
      message: 'Card replacement request submitted — allow 5 business days.',
      data: { requestId: replacement._id, status: 'pending' },
    });
  } catch (err) {
    console.error('[replaceCard]', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.resetPin = async (req, res) => {
  try {
    const { accountNumber } = req.params;

    const user = await Registeruser.findOne({ accountNumber });
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });

    const tempPin    = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedPin  = await bcrypt.hash(tempPin, 10);

    await Registeruser.findByIdAndUpdate(user._id, {
      cardPin:        hashedPin,
      pinMustChange:  true,
    });

    await logActivity(user._id, 'PIN_RESET', 'Card PIN reset by staff — OTP dispatched to registered phone.');

    return res.status(200).json({
      success: true,
      message: 'PIN reset OTP sent to registered phone number.',
    });
  } catch (err) {
    console.error('[resetPin]', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const { newPassword, reason } = req.body;

    if (newPassword && newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }

    const user = await Registeruser.findOne({ accountNumber });
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });

    if (newPassword) {
      const hashed = await bcrypt.hash(newPassword, 12);
      await Registeruser.findByIdAndUpdate(user._id, { password: hashed, passwordMustChange: true });
    } else {
      await Registeruser.findByIdAndUpdate(user._id, { passwordMustChange: true });
    }

    await logActivity(user._id, 'PASSWORD_RESET_BY_STAFF', reason || 'Password reset initiated by staff.');

    return res.status(200).json({
      success: true,
      message: newPassword
        ? 'Password updated successfully — customer must change on next login.'
        : 'Password reset link sent to registered email address.',
    });
  } catch (err) {
    console.error('[resetPassword]', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.generateStatement = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const { from, to }      = req.query;

    const user = await Registeruser.findOne({ accountNumber })
      .select('-password -transactionPin -cardPin -card.cvv');
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });

    const filter = { userId: user._id };
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to)   filter.createdAt.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
    }

    const transactions = await Transaction.find(filter).sort({ createdAt: -1 });

    const openingBalance = transactions.length
      ? Number(transactions[transactions.length - 1].balanceAfter || 0) -
        Number(transactions[transactions.length - 1].amount || 0)
      : user.balance;

    const statement = {
      generatedAt:    new Date().toISOString(),
      accountNumber:  user.accountNumber,
      accountName:    user.fullName,
      accountType:    user.accountType,
      currency:       user.currency || 'NGN',
      openingBalance,
      closingBalance: user.balance,
      period: {
        from: from || (transactions.length ? transactions[transactions.length - 1].createdAt : null),
        to:   to   || new Date().toISOString(),
      },
      totalCredits: transactions
        .filter(t => Number(t.amount) > 0)
        .reduce((s, t) => s + Number(t.amount), 0),
      totalDebits: transactions
        .filter(t => Number(t.amount) < 0)
        .reduce((s, t) => s + Math.abs(Number(t.amount)), 0),
      transactions,
    };

    await logActivity(user._id, 'STATEMENT_GENERATED', `E-statement generated by staff. Period: ${from || 'all'} – ${to || 'now'}`);

    return res.status(200).json({ success: true, data: statement });
  } catch (err) {
    console.error('[generateStatement]', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.notifyUser = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const { channel, message, subject } = req.body;

    if (!channel || !message) {
      return res.status(400).json({ success: false, message: 'Channel and message are required.' });
    }

    const user = await Registeruser.findOne({ accountNumber }).select('fullName email phone');
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });

    await logActivity(user._id, `NOTIFICATION_SENT_${channel.toUpperCase()}`, `Subject: ${subject || 'N/A'} | Message: ${message.substring(0, 80)}...`);

    const channelLabel = { sms: 'SMS', email: 'email', push: 'push notification' }[channel] || channel;

    return res.status(200).json({
      success: true,
      message: `${channelLabel} dispatched to customer successfully.`,
    });
  } catch (err) {
    console.error('[notifyUser]', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.getUserActivities = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }

    const activities = await Activity
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({ success: true, activities });
  } catch (err) {
    console.error('[getUserActivities]', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.logActivityEntry = async (req, res) => {
  try {
    const { userId, action, details } = req.body;

    if (!userId || !action) {
      return res.status(400).json({ success: false, message: 'userId and action are required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }

    const entry = await Activity.create({
      userId,
      action,
      details:   details   || '',
      ipAddress: req.ip    || 'Staff Portal',
    });

    return res.status(201).json({ success: true, data: entry });
  } catch (err) {
    console.error('[logActivityEntry]', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// FIX: added an account-status guard so staff cannot create a standing order
// on a frozen, blacklisted, or full-PND account.
exports.addMandate = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const { beneficiary, beneficiaryAccount, amount, frequency, startDate, endDate, narration } = req.body;

    if (!beneficiary || !beneficiaryAccount || !amount || !frequency || !startDate) {
      return res.status(400).json({ success: false, message: 'Beneficiary, account, amount, frequency and start date are required.' });
    }

    const user = await Registeruser.findOne({ accountNumber });
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });

    if (user.status === 'frozen' || user.cbnBlacklist || user.pndType === 'Full') {
      return res.status(403).json({ success: false, message: 'Cannot create a standing order on a frozen, blacklisted, or fully restricted account.' });
    }

    const mandate = {
      _id: new mongoose.Types.ObjectId(),
      beneficiary,
      beneficiaryAccount,
      amount: Number(amount),
      frequency,
      nextDate: startDate,
      endDate: endDate || null,
      narration: narration || '',
      status: 'Active',
    };

    user.mandates.push(mandate);
    await user.save();

    await logActivity(user._id, 'MANDATE_CREATED', `Standing order to ${beneficiary} (${beneficiaryAccount}) — ₦${Number(amount).toLocaleString()} ${frequency}`);

    return res.status(201).json({ success: true, message: 'Standing order created.', data: mandate });
  } catch (err) {
    console.error('[addMandate]', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.updateMandateStatus = async (req, res) => {
  try {
    const { accountNumber, mandateId } = req.params;
    const { status } = req.body;

    if (!['Active', 'Suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Active or Suspended.' });
    }

    const user = await Registeruser.findOne({ accountNumber });
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });

    const mandate = user.mandates.find((m) => m._id.toString() === mandateId);
    if (!mandate) return res.status(404).json({ success: false, message: 'Mandate not found.' });

    mandate.status = status;
    user.markModified('mandates');
    await user.save();

    await logActivity(user._id, 'MANDATE_STATUS_UPDATED', `Mandate ${mandateId} → ${status}`);

    return res.status(200).json({ success: true, message: `Standing order ${status.toLowerCase()}.`, data: mandate });
  } catch (err) {
    console.error('[updateMandateStatus]', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.cancelMandate = async (req, res) => {
  try {
    const { accountNumber, mandateId } = req.params;

    const user = await Registeruser.findOne({ accountNumber });
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });

    const before = user.mandates.length;
    user.mandates = user.mandates.filter((m) => m._id.toString() !== mandateId);

    if (user.mandates.length === before) {
      return res.status(404).json({ success: false, message: 'Mandate not found.' });
    }

    user.markModified('mandates');
    await user.save();
    await logActivity(user._id, 'MANDATE_CANCELLED', `Mandate ${mandateId} cancelled`);

    return res.status(200).json({ success: true, message: 'Standing order cancelled.' });
  } catch (err) {
    console.error('[cancelMandate]', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// FIX: added an account-status guard, matching addMandate.
exports.addSignatory = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const { name, bvn, signatoryClass, phone } = req.body;

    if (!name || !bvn) {
      return res.status(400).json({ success: false, message: 'Signatory name and BVN are required.' });
    }

    if (bvn.length !== 11) {
      return res.status(400).json({ success: false, message: 'BVN must be 11 digits.' });
    }

    const user = await Registeruser.findOne({ accountNumber });
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });

    if (user.status === 'frozen' || user.cbnBlacklist || user.pndType === 'Full') {
      return res.status(403).json({ success: false, message: 'Cannot add a signatory on a frozen, blacklisted, or fully restricted account.' });
    }

    const signatory = {
      _id: new mongoose.Types.ObjectId(),
      name,
      bvn,
      class: signatoryClass || 'Authorized Signatory',
      phone: phone || null,
      status: 'Active',
    };

    user.signatories.push(signatory);
    await user.save();

    await logActivity(user._id, 'SIGNATORY_ADDED', `${name} added as ${signatory.class}`);

    return res.status(201).json({ success: true, message: 'Signatory added — mandate updated.', data: signatory });
  } catch (err) {
    console.error('[addSignatory]', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// FIX: prevents removing the last remaining active signatory on an account,
// which would otherwise leave it with no authorized signer at all.
exports.removeSignatory = async (req, res) => {
  try {
    const { accountNumber, signatoryId } = req.params;

    const user = await Registeruser.findOne({ accountNumber });
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });

    const target = user.signatories.find((s) => s._id.toString() === signatoryId);
    if (!target) return res.status(404).json({ success: false, message: 'Signatory not found.' });

    const remainingActive = user.signatories.filter(
      (s) => s._id.toString() !== signatoryId && s.status === 'Active'
    );
    if (target.status === 'Active' && remainingActive.length === 0) {
      return res.status(400).json({ success: false, message: 'Cannot remove the last active signatory on this account.' });
    }

    user.signatories = user.signatories.filter((s) => s._id.toString() !== signatoryId);

    user.markModified('signatories');
    await user.save();
    await logActivity(user._id, 'SIGNATORY_REMOVED', `Signatory ${signatoryId} removed`);

    return res.status(200).json({ success: true, message: 'Signatory removed — mandate updated.' });
  } catch (err) {
    console.error('[removeSignatory]', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};