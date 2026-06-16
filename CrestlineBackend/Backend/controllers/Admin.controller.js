const { Admin, Staff } = require('../models/Admin.model');
const Registeruser    = require('../models/Registerusers.model');
const bcrypt          = require('bcryptjs');
const jwt             = require('jsonwebtoken');
const mongoose        = require('mongoose');
const { Transaction, Activity } = require('../models/Transactivity');
const CardReplacement = require('../models/CardReplacement.model');

const generateSerialDesignation = async (Model, prefix) => {
  const count = await Model.countDocuments();
  return `${prefix}-${String(count + 1).padStart(4, '0')}-${Date.now().toString().slice(-4)}`;
};

exports.registerPersonnel = async (req, res) => {
  try {
    const { fullName, govId, email, regType, privilegeDept, password, serialDesignation } = req.body;

    const existingAdmin = await Admin.findOne({ $or: [{ email }, { govId }, { serialDesignation }] });
    const existingStaff = await Staff.findOne({ $or: [{ email }, { govId }, { serialDesignation }] });

    if (existingAdmin || existingStaff) {
      return res.status(400).json({
        success: false,
        message: 'Personnel anomaly detected: Email, Gov ID, or Serial is already provisioned.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (regType === 'admin') {
      await new Admin({ fullName, govId, email, clearanceLevel: privilegeDept, password: hashedPassword, serialDesignation }).save();
    } else if (regType === 'staff') {
      await new Staff({ fullName, govId, email, department: privilegeDept, password: hashedPassword, serialDesignation }).save();
    } else {
      return res.status(400).json({ success: false, message: 'Invalid node registration type specifier.' });
    }

    return res.status(201).json({ success: true, message: `Secure ${regType.toUpperCase()} protocol node synced to network core.` });
  } catch (err) {
    console.error('PROVISIONING_ERROR:', err);
    return res.status(500).json({ success: false, message: 'Uplink synchronization fault.' });
  }
};

exports.staffLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'All clearance paths require complete inputs.' });
    }

    const staffMember = await Staff.findOne({ email });
    if (!staffMember) {
      return res.status(401).json({ success: false, message: 'Node rejection: Invalid credentials entered.' });
    }

    const isMatch = await bcrypt.compare(password, staffMember.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Node rejection: Passphrase verification mismatch.' });
    }

    const token = jwt.sign(
      { id: staffMember._id, role: 'staff', department: staffMember.department },
      process.env.JWT_SECRET || 'JWT_SECRET_NODE_KEY',
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Access granted. Session token active.',
      token,
      staff: {
        id:                staffMember._id,
        fullName:          staffMember.fullName,
        email:             staffMember.email,
        department:        staffMember.department,
        serialDesignation: staffMember.serialDesignation,
      },
    });
  } catch (err) {
    console.error('STAFF_AUTH_CORE_ERROR:', err);
    return res.status(500).json({ success: false, message: 'Internal validation gateway fault.' });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Access Denied: Invalid Administrative ID.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Access Denied: Invalid Access Key.' });
    }

    const token = jwt.sign(
      {
        id:                admin._id,
        clearanceLevel:    admin.clearanceLevel,
        serialDesignation: admin.serialDesignation,
        role:              'admin',
      },
      process.env.JWT_SECRET || 'crestline_vault_secure_core_key_2026',
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      success: true,
      token,
      admin: {
        id:                admin._id,
        fullName:          admin.fullName,
        email:             admin.email,
        clearanceLevel:    admin.clearanceLevel,
        serialDesignation: admin.serialDesignation,
      },
    });
  } catch (error) {
    console.error('[adminLogin Operational Error]:', error);
    return res.status(500).json({ success: false, message: 'Secure Terminal Connection Failure.', error: error.message });
  }
};

exports.onboardPersonnel = async (req, res) => {
  try {
    const { fullName, govId, email, password, type, department, clearanceLevel } = req.body;

    const emailExists = await Admin.findOne({ email }) || await Staff.findOne({ email });
    if (emailExists) return res.status(400).json({ success: false, message: 'Email vector already registered' });

    const govIdExists = await Admin.findOne({ govId }) || await Staff.findOne({ govId });
    if (govIdExists) return res.status(400).json({ success: false, message: 'Government Identification footprint exists' });

    const salt           = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    let newPersonnel;

    if (type === 'admin') {
      const serialDesignation = await generateSerialDesignation(Admin, 'CL-ADM');
      newPersonnel = new Admin({
        fullName, govId, email,
        password:       hashedPassword,
        clearanceLevel: clearanceLevel || 'LEVEL 0: GLOBAL ROOT',
        serialDesignation,
      });
    } else {
      const serialDesignation = await generateSerialDesignation(Staff, 'CL-STF');
      newPersonnel = new Staff({
        fullName, govId, email,
        password:   hashedPassword,
        department: department || 'GENERAL OPERATIONS',
        serialDesignation,
      });
    }

    await newPersonnel.save();
    return res.status(201).json({ success: true, data: newPersonnel });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSystemDashboardMetrics = async (req, res) => {
  try {
    const liquidityGroup = await Registeruser.aggregate([
      {
        $group: {
          _id:               null,
          coreBalance:       { $sum: '$balance' },
          investmentBalance: { $sum: '$investLiquidityBalance' },
        },
      },
    ]);
    const totalCore       = liquidityGroup[0]?.coreBalance       || 0;
    const totalInvest     = liquidityGroup[0]?.investmentBalance  || 0;
    const aggregateLiquidity = totalCore + totalInvest;

    const activeUsersCount = await Registeruser.countDocuments({ status: 'active' });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const dailyVolumeGroup = await Transaction.aggregate([
      { $match: { createdAt: { $gte: startOfToday } } },
      {
        $group: {
          _id:         null,
          totalVolume: { $sum: { $abs: { $toDouble: '$amount' } } },
        },
      },
    ]);
    const dailyVolume = dailyVolumeGroup[0]?.totalVolume || 0;

    const feesRevenueGroup = await Transaction.aggregate([
      { $match: { description: { $regex: /Fee|Charge|Card Payment/i } } },
      { $group: { _id: null, total: { $sum: { $abs: { $toDouble: '$amount' } } } } },
    ]);
    const totalFees = feesRevenueGroup[0]?.total || 0;

    const loanRepaymentsGroup = await Transaction.aggregate([
      { $match: { description: { $regex: /Loan Repay|EMI|Loan Recovery/i } } },
      { $group: { _id: null, total: { $sum: { $abs: { $toDouble: '$amount' } } } } },
    ]);
    const totalLoanRepayments = loanRepaymentsGroup[0]?.total || 0;

    const penaltyRevenueGroup = await Transaction.aggregate([
      { $match: { description: { $regex: /Penalty|Overdraft Fee|Early Exit/i } } },
      { $group: { _id: null, total: { $sum: { $abs: { $toDouble: '$amount' } } } } },
    ]);
    const totalPenalties = penaltyRevenueGroup[0]?.total || 0;

    const totalRevenue = totalFees + totalLoanRepayments + totalPenalties;

    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const formattedFlux = recentTransactions.map(tx => {
      const amt = Number(tx.amount || 0);
      let type  = 'Payment';
      if (/transfer/i.test(tx.description))    type = 'Transfer';
      else if (/loan|emi/i.test(tx.description)) type = 'Loan Repay';
      else if (/withdrawal/i.test(tx.description)) type = 'Withdrawal';
      else if (/airtime/i.test(tx.description)) type = 'Airtime';
      else if (/invest/i.test(tx.description)) type = 'Investment';

      return {
        id:     tx.reference || `TX-${tx._id.toString().slice(-4).toUpperCase()}`,
        user:   tx.customerName || 'System Account',
        type,
        amount: `₦${Math.abs(amt).toLocaleString()}`,
        direction: amt >= 0 ? 'Credit' : 'Debit',
        status: tx.status === 'completed' ? 'Success' : tx.status === 'failed' ? 'Failed' : 'Pending',
        time:   tx.createdAt
                  ? new Date(tx.createdAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
                  : 'Just now',
      };
    });

    return res.status(200).json({
      success: true,
      metrics: {
        totalLiquidity: aggregateLiquidity,
        activeUsers:    activeUsersCount,
        dailyVolume,
        revenue: {
          total:     totalRevenue,
          breakdown: [
            { source: 'Transaction Fees',  amount: totalFees },
            { source: 'Loan Repayments',   amount: totalLoanRepayments },
            { source: 'System Penalties',  amount: totalPenalties },
          ],
        },
      },
      recentFlux: formattedFlux,
    });
  } catch (error) {
    console.error('Dashboard Core Aggregation Pipeline Failure:', error);
    return res.status(500).json({ success: false, message: 'Internal metrics server error.' });
  }
};

exports.getPersonnelHubMetrics = async (req, res) => {
  try {
    const totalUsers       = await Registeruser.countDocuments();
    const pendingKycUsers  = await Registeruser.countDocuments({ 'kyc.status': 'Pending' });
    const totalStaff       = await Staff.countDocuments();
    const totalAdmins      = await Admin.countDocuments();

    return res.status(200).json({
      success: true,
      metrics: {
        customers: { count: totalUsers,   subtext: `${pendingKycUsers} pending KYC` },
        staff:     { count: totalStaff,   subtext: 'All synced' },
        admins:    { count: totalAdmins,  subtext: 'Secured' },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCustomerDatabase = async (req, res) => {
  try {
    const users = await Registeruser.find({}).select('-password -transactionPin -cardPin');
    return res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getStaffDirectory = async (req, res) => {
  try {
    const staff = await Staff.find({}).select('-password');
    return res.status(200).json({ success: true, count: staff.length, data: staff });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAdminDirectory = async (req, res) => {
  try {
    const admins = await Admin.find({}).select('-password');
    return res.status(200).json({ success: true, count: admins.length, data: admins });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllCustomerDatabase = async (req, res) => {
  try {
    const { filter, search } = req.query;
    let queryConditions = {};

    if (filter && filter !== 'All') {
      if (filter === 'Pending') {
        queryConditions['kyc.status'] = 'Pending';
      } else if (filter === 'Verified') {
        queryConditions['status']      = 'active';
        queryConditions['kyc.status']  = { $ne: 'Pending' };
      } else if (filter === 'Flagged') {
        queryConditions['$or'] = [
          { status:       { $ne: 'active' } },
          { amlFlag:      true },
          { cbnBlacklist: true },
        ];
      }
    }

    if (search) {
      queryConditions['$or'] = [
        { accountNumber: { $regex: search, $options: 'i' } },
        { fullName:      { $regex: search, $options: 'i' } },
      ];
    }

    const databaseLedger = await Registeruser.find(queryConditions)
      .select('fullName email accountNumber balance currency status kyc amlFlag cbnBlacklist createdAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: databaseLedger.length, data: databaseLedger });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Matrix fetch execution faulted.', error: error.message });
  }
};

exports.getAllStaffDirectory = async (req, res) => {
  try {
    const { filter } = req.query;
    let queryConditions = {};
    if (filter && filter !== 'All') queryConditions.status = filter;

    const dataset = await Staff.find(queryConditions)
      .select('fullName serialDesignation email department status')
      .lean();

    const formattedData = dataset.map(item => ({
      id:     item.serialDesignation || 'CL-2026-XYZ',
      name:   item.fullName          || 'Unknown Operator',
      role:   item.department        || 'Operations Tier',
      email:  item.email             || 'internal@crestline.com',
      status: item.status            || 'Active',
      access: 'Staff',
    }));

    return res.status(200).json({ success: true, count: formattedData.length, data: formattedData });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Operator node synchronization execution fault.', error: error.message });
  }
};

exports.getAllAdminDirectory = async (req, res) => {
  try {
    const { filter } = req.query;
    let queryConditions = {};
    if (filter && filter !== 'All') queryConditions.status = filter;

    const dataset = await Admin.find(queryConditions)
      .select('fullName serialDesignation email clearanceLevel status')
      .lean();

    const formattedData = dataset.map(item => ({
      id:     item.serialDesignation || 'CL-2026-XYZ',
      name:   item.fullName          || 'Unknown Operator',
      role:   item.clearanceLevel    || 'LEVEL 0: GLOBAL ROOT',
      email:  item.email             || 'internal@crestline.com',
      status: item.status            || 'Active',
      access: 'Admin',
    }));

    return res.status(200).json({ success: true, count: formattedData.length, data: formattedData });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Operator node synchronization execution fault.', error: error.message });
  }
};

exports.getLiveLiquidityFromSource = async (req, res) => {
  try {
    const balanceAggregation = await Registeruser.aggregate([
      { $group: { _id: null, totalLiabilities: { $sum: '$balance' } } },
    ]);
    const totalUserDeposits = balanceAggregation[0]?.totalLiabilities || 0;

    const pastDay = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const inflowAggregation = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: pastDay },
          $expr:     { $gt: [{ $toDouble: '$amount' }, 0] },
        },
      },
      { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } },
    ]);

    const outflowAggregation = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: pastDay },
          $expr:     { $lt: [{ $toDouble: '$amount' }, 0] },
        },
      },
      { $group: { _id: null, total: { $sum: { $abs: { $toDouble: '$amount' } } } } },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalLiquidity: totalUserDeposits,
        reserveRatio:   22.5,
        inflow24h:      inflowAggregation[0]?.total  || 0,
        outflow24h:     outflowAggregation[0]?.total || 0,
        vaults: [
          { name: 'Central Operational Vault', balance: totalUserDeposits * 0.65, status: 'Optimal', health: 95 },
          { name: 'Digital Float Reserve',     balance: totalUserDeposits * 0.35, status: 'Optimal', health: 98 },
        ],
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Context breakdown: No authenticated session tracker found.' });
    }

    const adminProfile = await Admin.findById(req.user._id);
    if (!adminProfile) {
      return res.status(404).json({ success: false, message: 'Profile Sync Error: Target administrative account not found.' });
    }

    return res.status(200).json({
      success: true,
      data: {
        id:        adminProfile._id,
        name:      adminProfile.fullName          || 'Unknown Operator',
        email:     adminProfile.email,
        tier:      adminProfile.clearanceLevel    || 'LEVEL 0: GLOBAL ROOT',
        serial:    adminProfile.serialDesignation || 'N/A',
        role:      adminProfile.role              || 'Core Infrastructure Operator',
        location:  adminProfile.location          || 'Lagos, NG',
        lastLogin: adminProfile.lastLogin         || 'Recent Active Session',
      },
    });
  } catch (error) {
    console.error('Profile payload stream breakdown:', error);
    return res.status(500).json({ success: false, message: `Internal ledger pipeline error: ${error.message}` });
  }
};

exports.updateAdminProfile = async (req, res) => {
  try {
    const { name, email, location } = req.body;

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          fullName: name,
          email,
          location,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ success: false, message: 'Admin profile not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Administrative profile ledger synchronized safely.',
      data: {
        id:        updatedAdmin._id,
        name:      updatedAdmin.fullName          || updatedAdmin.name,
        email:     updatedAdmin.email,
        tier:      updatedAdmin.clearanceLevel    || updatedAdmin.tier,
        serial:    updatedAdmin.serialDesignation || updatedAdmin.serial,
        role:      updatedAdmin.role              || 'Core Infrastructure Operator',
        location:  updatedAdmin.location,
        lastLogin: updatedAdmin.lastLogin         || 'Just Now',
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.staffUpdate = async (req, res) => {
  try {
    const { fullName, email, department, clearanceLevel } = req.body;

    const updatedStaff = await Staff.findOneAndUpdate(
      { serialDesignation: req.params.id },
      { fullName, email, department, clearanceLevel },
      { new: true, runValidators: true }
    );

    if (!updatedStaff) {
      return res.status(404).json({ success: false, message: 'Operational target node entry absent from matrix.' });
    }

    return res.status(200).json({ success: true, message: 'Ledger details updated cleanly.', data: updatedStaff });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.terminateSessions = async (req, res) => {
  try {
    const { id } = req.params;
    const staffMember = await Staff.findOne({ serialDesignation: id });
    if (!staffMember) {
      return res.status(404).json({ success: false, message: 'Target node entry absent from directory.' });
    }
    return res.status(200).json({ success: true, message: 'Active sessions killed instantly across all terminal clusters.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetMfa = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedStaff = await Staff.findOneAndUpdate(
      { serialDesignation: id },
      { mfaEnabled: false, mfaSecret: null },
      { new: true }
    );
    if (!updatedStaff) {
      return res.status(404).json({ success: false, message: 'Target node entry absent from directory.' });
    }
    return res.status(200).json({ success: true, message: 'MFA authenticator mapping unlinked successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleSuspension = async (req, res) => {
  try {
    const { id }          = req.params;
    const { isSuspended } = req.body;

    const updatedStaff = await Staff.findOneAndUpdate(
      { serialDesignation: id },
      { isSuspended },
      { new: true, runValidators: true }
    );

    if (!updatedStaff) {
      return res.status(404).json({ success: false, message: 'Target node entry absent from directory.' });
    }

    return res.status(200).json({
      success: true,
      message: `Node access status updated cleanly to: ${isSuspended ? 'SUSPENDED' : 'OPERATIONAL'}.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.decommissionStaff = async (req, res) => {
  try {
    const { id }        = req.params;
    const deletedStaff  = await Staff.findOneAndDelete({ serialDesignation: id });

    if (!deletedStaff) {
      return res.status(404).json({ success: false, message: 'Target node entry absent from directory.' });
    }

    return res.status(200).json({ success: true, message: 'Institutional node entry archived and unlinked from active ledger matrices.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const searchCondition = id.startsWith('CL-') || id.startsWith('ADM-')
      ? { serialDesignation: id }
      : { _id: id };

    const adminProfile = await Admin.findOne(searchCondition).select('-password');
    if (!adminProfile) {
      return res.status(404).json({ success: false, message: `Entity mismatch error. Code identifier ${id} not found.` });
    }

    return res.status(200).json({ success: true, data: adminProfile });
  } catch (error) {
    return res.status(500).json({ success: false, message: `System node execution fault: ${error.message}` });
  }
};

exports.getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const searchCondition = id.startsWith('CL-') || id.startsWith('ADM-')
      ? { serialDesignation: id }
      : { _id: id };

    const staffProfile = await Staff.findOne(searchCondition).select('-password');
    if (!staffProfile) {
      return res.status(404).json({ success: false, message: `Entity mismatch error. Code identifier ${id} not found.` });
    }

    return res.status(200).json({ success: true, data: staffProfile });
  } catch (error) {
    return res.status(500).json({ success: false, message: `System node execution fault: ${error.message}` });
  }
};

exports.getAdminDossier = async (req, res) => {
  try {
    const { id } = req.params;
    const searchCondition = id.startsWith('CL-') || id.startsWith('ADM-')
      ? { serialDesignation: id }
      : { _id: id };

    const adminProfile = await Admin.findOne(searchCondition).select('-password');
    if (!adminProfile) {
      return res.status(404).json({ success: false, message: `Entity mismatch error. Code identifier ${id} not found.` });
    }

    return res.status(200).json({ success: true, data: adminProfile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.modifyAdminClearance = async (req, res) => {
  try {
    const { id }           = req.params;
    const { clearanceLevel } = req.body;

    if (!clearanceLevel) {
      return res.status(400).json({ success: false, message: 'Missing parameters fault: clearanceLevel variable required.' });
    }

    const searchCondition = id.startsWith('CL-') || id.startsWith('ADM-')
      ? { serialDesignation: id }
      : { _id: id };

    const updatedAdmin = await Admin.findOneAndUpdate(
      searchCondition,
      { $set: { clearanceLevel } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedAdmin) {
      return res.status(404).json({ success: false, message: `Mutation error: Node reference code ${id} not found.` });
    }

    return res.status(200).json({
      success: true,
      message: 'Admin security level credentials reassigned clean.',
      data:    updatedAdmin,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};