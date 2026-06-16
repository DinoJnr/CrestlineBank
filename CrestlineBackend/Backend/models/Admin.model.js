const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  govId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  clearanceLevel: { type: String, default: "LEVEL 0: GLOBAL ROOT" },
  password: { type: String, required: true },
  serialDesignation: { type: String, required: true, unique: true },
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String, default: null },
  lastLogin: { type: String, default: "Never" },
  terminalIp: { type: String, default: "0.0.0.0" }
}, { 
  timestamps: true 
});

const StaffSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  govId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  clearanceLevel: { 
    type: String, 
    required: true,
    default: "LEVEL 1: OBSERVER" 
  }, 
  password: { type: String, required: true },
  serialDesignation: { type: String, required: true, unique: true },
  isSuspended: { type: Boolean, default: false },
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String, default: null },
  lastLogin: { type: String, default: "Never" },
  terminalIp: { type: String, default: "0.0.0.0" },
  recentActions: [
    {
      action: { type: String, required: true },
      target: { type: String, required: true },
      time: { type: String, default: "Just Now" }
    }
  ]
}, { 
  timestamps: true 
});

const Admin = mongoose.model('Admin', AdminSchema);
const Staff = mongoose.model('Staff', StaffSchema);

module.exports = { Admin, Staff };