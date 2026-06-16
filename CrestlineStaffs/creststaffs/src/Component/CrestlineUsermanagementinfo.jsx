import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Copy, ShieldCheck, MapPin, Phone, User, Landmark,
  AlertTriangle, Zap, Download, CreditCard, History, Send,
  PlusCircle, MinusCircle, X, Lock, Eye, FileText, Ban,
  UserMinus, Bell, MessageSquare, Settings, ChevronRight,
  Activity, Camera, Trash2, CheckCircle, Upload, Clock,
  AlertCircle, Search, RefreshCw, EyeOff, List, KeyRound,
  WifiOff, Shield,
} from "lucide-react";
import CrestlineStaffLayout from "./CrestlineStaffLayout";

const CrestlineUsermanagementinfo = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [modal, setModal] = useState({ isOpen: false, type: null, title: "" });
  const [limits, setLimits] = useState({ daily: 500000, single: 100000 });
  const [profileImg, setProfileImg] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const customer = {
    personal: { name: "Chidi Okoro", email: "chidi@example.com", phone: "+2348012345678", dob: "12/05/1994", gender: "Male", joinDate: "Jan 2024" },
    banking: { nuban: "0123456789", balance: 5025000.75, type: "Savings", tier: "Tier 3", status: "Active", branch: "Lagos Main" },
    kyc: { bvn: "22234567890", nin: "12345678901", address: "12 Admiralty Way, Lekki", nok: "Amaka Okoro (Wife)" },
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => { setProfileImg(reader.result); setTimeout(() => setIsUploading(false), 800); };
      reader.readAsDataURL(file);
    }
  };

  const openModal = (type, title) => setModal({ isOpen: true, type, title });
  const closeModal = () => setModal({ isOpen: false, type: null, title: "" });

  /* ─── MODAL CONTENT RENDERER ─── */
  const renderModalBody = () => {
    switch (modal.type) {

      /* ── EXISTING: deposit / withdraw / transfer ── */
      case "deposit":
      case "withdraw":
      case "transfer":
        return (
          <>
            <Field label="Amount (NGN)">
              <input type="number" placeholder="0.00" className={inputCls} />
            </Field>
            {modal.type === "transfer" && (
              <Field label="Recipient Account Number">
                <input type="text" placeholder="0000000000" className={inputCls} />
              </Field>
            )}
            <Field label="Mandatory Staff Comment">
              <textarea placeholder="Reason for this operation..." className={`${inputCls} min-h-[100px]`} />
            </Field>
          </>
        );

      /* ── PLACE HOLD ── */
      case "placeHold":
        return (
          <>
            <Field label="Hold Amount (NGN)">
              <input type="number" placeholder="0.00" className={inputCls} />
            </Field>
            <Field label="Hold Duration">
              <select className={inputCls}>
                <option value="">Select duration</option>
                <option>24 Hours</option>
                <option>48 Hours</option>
                <option>72 Hours</option>
                <option>7 Days</option>
                <option>30 Days</option>
                <option>Indefinite</option>
              </select>
            </Field>
            <Field label="Hold Reference / Case ID">
              <input type="text" placeholder="e.g. CASE-2024-001" className={inputCls} />
            </Field>
            <Field label="Reason for Hold">
              <textarea placeholder="Provide justification for this hold..." className={`${inputCls} min-h-[90px]`} />
            </Field>
          </>
        );

      /* ── CARD VAULT ── */
      case "issueCard":
        return (
          <>
            <Field label="Card Type">
              <select className={inputCls}>
                <option>Mastercard Debit</option>
                <option>Visa Debit</option>
                <option>Verve Debit</option>
              </select>
            </Field>
            <Field label="Delivery Address">
              <input type="text" placeholder="Enter delivery address" className={inputCls} defaultValue={customer.kyc.address} />
            </Field>
            <Field label="Card PIN (4-digit)">
              <input type="password" maxLength={4} placeholder="••••" className={inputCls} />
            </Field>
            <Field label="Staff Authorization Note">
              <textarea placeholder="Reason for issuing new card..." className={`${inputCls} min-h-[80px]`} />
            </Field>
          </>
        );

      case "blockCard":
        return (
          <>
            <InfoBanner variant="danger" text="This action will immediately disable the card. The customer will be unable to make any transactions." />
            <Field label="Card Number (Last 4 Digits)">
              <input type="text" maxLength={4} placeholder="8829" className={inputCls} />
            </Field>
            <Field label="Block Reason">
              <select className={inputCls}>
                <option>Reported Lost</option>
                <option>Reported Stolen</option>
                <option>Suspicious Activity</option>
                <option>Customer Request</option>
                <option>Compliance Hold</option>
              </select>
            </Field>
            <Field label="Incident Reference">
              <input type="text" placeholder="e.g. INC-2024-009" className={inputCls} />
            </Field>
            <Field label="Staff Comment">
              <textarea placeholder="Additional notes..." className={`${inputCls} min-h-[80px]`} />
            </Field>
          </>
        );

      case "replaceCard":
        return (
          <>
            <Field label="Replacement Reason">
              <select className={inputCls}>
                <option>Damaged Card</option>
                <option>Expired Card</option>
                <option>Lost / Stolen</option>
                <option>Upgrade Request</option>
              </select>
            </Field>
            <Field label="New Delivery Address">
              <input type="text" placeholder="Enter delivery address" className={inputCls} defaultValue={customer.kyc.address} />
            </Field>
            <Field label="Confirm Customer Identity">
              <input type="text" placeholder="BVN or NIN" className={inputCls} />
            </Field>
            <Field label="Staff Note">
              <textarea placeholder="Replacement authorization note..." className={`${inputCls} min-h-[80px]`} />
            </Field>
          </>
        );

      case "maskedCard":
        return (
          <>
            <InfoBanner variant="warning" text="Viewing masked card details is a sensitive action and will be logged in the audit trail." />
            <Field label="Reason for Access">
              <select className={inputCls}>
                <option>Customer Verification</option>
                <option>Dispute Resolution</option>
                <option>Fraud Investigation</option>
                <option>Compliance Review</option>
              </select>
            </Field>
            <Field label="Your Staff PIN">
              <input type="password" placeholder="Enter your staff PIN" className={inputCls} />
            </Field>
            <div className="p-4 bg-teal-50 rounded-2xl space-y-2 mt-2">
              <p className="text-[8px] font-black text-teal-900/40 uppercase tracking-widest mb-2">Card Details (Masked)</p>
              <Row label="Card Number" value="**** **** **** 8829" />
              <Row label="Expiry" value="**/**" />
              <Row label="CVV" value="***" />
            </div>
          </>
        );

      /* ── COMPLIANCE & KYC ── */
      case "verifyIdentity":
        return (
          <>
            <Field label="Verification Method">
              <select className={inputCls}>
                <option>BVN Lookup</option>
                <option>NIN Verification</option>
                <option>Passport Check</option>
                <option>Driver's License</option>
              </select>
            </Field>
            <Field label="ID Number">
              <input type="text" placeholder="Enter ID number" className={inputCls} />
            </Field>
            <div className="p-4 bg-teal-50 rounded-2xl space-y-2">
              <p className="text-[8px] font-black text-teal-900/40 uppercase tracking-widest mb-2">On-File Details</p>
              <Row label="BVN" value={customer.kyc.bvn} />
              <Row label="NIN" value={customer.kyc.nin} />
              <Row label="Name" value={customer.personal.name} />
            </div>
            <Field label="Verification Note">
              <textarea placeholder="Staff verification remarks..." className={`${inputCls} min-h-[80px]`} />
            </Field>
          </>
        );

      case "uploadDocuments":
        return (
          <>
            <Field label="Document Type">
              <select className={inputCls}>
                <option>National ID Card</option>
                <option>International Passport</option>
                <option>Driver's License</option>
                <option>Utility Bill</option>
                <option>Bank Statement</option>
                <option>CAC Certificate</option>
              </select>
            </Field>
            <Field label="Document Expiry Date">
              <input type="date" className={inputCls} />
            </Field>
            <Field label="Upload File">
              <div className="w-full p-6 border-2 border-dashed border-teal-900/20 rounded-2xl flex flex-col items-center justify-center gap-2 bg-teal-50/50 cursor-pointer hover:border-teal-600 transition-all">
                <Upload size={20} className="text-teal-900/30" />
                <p className="text-[9px] font-black text-teal-900/40 uppercase">Click to upload or drag & drop</p>
                <p className="text-[8px] text-teal-900/30">PDF, JPG, PNG — max 5MB</p>
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
              </div>
            </Field>
            <Field label="Staff Note">
              <textarea placeholder="Document submission notes..." className={`${inputCls} min-h-[70px]`} />
            </Field>
          </>
        );

      case "blacklistCheck":
        return (
          <>
            <InfoBanner variant="info" text="This will run a cross-check against the CBN blacklist, NIBSS watchlist, and internal fraud database." />
            <Field label="Check Against">
              <div className="space-y-2">
                {["CBN Blacklist", "NIBSS Watchlist", "Internal Fraud DB", "GIABA / AML List"].map((item) => (
                  <label key={item} className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-teal-700" />
                    <span className="text-[10px] font-black uppercase">{item}</span>
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Staff Authorization PIN">
              <input type="password" placeholder="Enter your staff PIN" className={inputCls} />
            </Field>
          </>
        );

      case "flagReview":
        return (
          <>
            <InfoBanner variant="danger" text="Flagging this account will trigger a compliance review and notify the Risk & Fraud team immediately." />
            <Field label="Flag Category">
              <select className={inputCls}>
                <option>Suspicious Transaction Pattern</option>
                <option>AML / Money Laundering</option>
                <option>Identity Fraud</option>
                <option>Account Takeover</option>
                <option>PEP / Sanctions Match</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Priority Level">
              <select className={inputCls}>
                <option>Low</option>
                <option>Medium</option>
                <option selected>High</option>
                <option>Critical</option>
              </select>
            </Field>
            <Field label="Evidence / Case Notes">
              <textarea placeholder="Describe the suspicious activity or provide supporting details..." className={`${inputCls} min-h-[100px]`} />
            </Field>
            <Field label="Related Transaction IDs (optional)">
              <input type="text" placeholder="TXN-001, TXN-002..." className={inputCls} />
            </Field>
          </>
        );

      /* ── SECURITY ACTIONS ── */
      case "resetPassword":
        return (
          <>
            <InfoBanner variant="warning" text="A password reset link will be sent to the customer's registered email and phone number." />
            <Field label="Delivery Channel">
              <select className={inputCls}>
                <option>Email & SMS</option>
                <option>Email Only</option>
                <option>SMS Only</option>
              </select>
            </Field>
            <Field label="Customer Email">
              <input type="email" defaultValue={customer.personal.email} className={inputCls} />
            </Field>
            <Field label="Customer Phone">
              <input type="tel" defaultValue={customer.personal.phone} className={inputCls} />
            </Field>
            <Field label="Reset Reason">
              <select className={inputCls}>
                <option>Customer Request</option>
                <option>Security Breach</option>
                <option>Account Recovery</option>
                <option>Routine Security Reset</option>
              </select>
            </Field>
            <Field label="Staff Note">
              <textarea placeholder="Authorization remarks..." className={`${inputCls} min-h-[70px]`} />
            </Field>
          </>
        );

      case "resetPIN":
        return (
          <>
            <InfoBanner variant="warning" text="This resets the customer's 4-digit transfer PIN. They will be prompted to set a new one on next login." />
            <Field label="PIN Type">
              <select className={inputCls}>
                <option>Transfer PIN</option>
                <option>Card PIN</option>
                <option>Both</option>
              </select>
            </Field>
            <Field label="Reset Method">
              <select className={inputCls}>
                <option>Force Reset on Next Login</option>
                <option>Send OTP to Phone</option>
                <option>Manual Override</option>
              </select>
            </Field>
            <Field label="Reset Reason">
              <select className={inputCls}>
                <option>Customer Forgot PIN</option>
                <option>PIN Compromise Suspected</option>
                <option>Account Recovery</option>
                <option>Customer Request via Branch</option>
              </select>
            </Field>
            <Field label="Staff Authorization Note">
              <textarea placeholder="Describe why this PIN reset is being performed..." className={`${inputCls} min-h-[80px]`} />
            </Field>
          </>
        );

      case "disableOnlineBanking":
        return (
          <>
            <InfoBanner variant="danger" text="This will immediately revoke the customer's online and mobile banking access. All active sessions will be terminated." />
            <Field label="Disable Reason">
              <select className={inputCls}>
                <option>Security Threat Detected</option>
                <option>Account Takeover Suspected</option>
                <option>Customer Request</option>
                <option>Regulatory Compliance</option>
                <option>Fraud Investigation</option>
              </select>
            </Field>
            <Field label="Disable Duration">
              <select className={inputCls}>
                <option>Temporary (24 Hours)</option>
                <option>Temporary (72 Hours)</option>
                <option>Until Manual Re-enable</option>
                <option>Pending Review Outcome</option>
              </select>
            </Field>
            <Field label="Notify Customer?">
              <div className="flex gap-3">
                {["Yes — via SMS & Email", "No — Silent Disable"].map((opt) => (
                  <label key={opt} className="flex-1 flex items-center gap-2 p-3 bg-teal-50 rounded-xl cursor-pointer text-[9px] font-black uppercase">
                    <input type="radio" name="notify" className="accent-teal-700" /> {opt}
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Staff Authorization Note">
              <textarea placeholder="Mandatory justification for disabling access..." className={`${inputCls} min-h-[80px]`} />
            </Field>
          </>
        );

      case "loginActivity":
        return (
          <>
            <Field label="Date Range">
              <div className="flex gap-2">
                <input type="date" className={`${inputCls} flex-1`} />
                <input type="date" className={`${inputCls} flex-1`} />
              </div>
            </Field>
            <Field label="Filter by Status">
              <select className={inputCls}>
                <option>All Sessions</option>
                <option>Successful Only</option>
                <option>Failed Attempts</option>
                <option>Suspicious Logins</option>
              </select>
            </Field>
            <div className="space-y-2">
              <p className="text-[8px] font-black text-teal-900/40 uppercase tracking-widest">Recent Sessions</p>
              {[
                { device: "Chrome / Windows", ip: "105.112.45.23", time: "Today, 2:15pm", status: "success" },
                { device: "Mobile App / Android", ip: "197.210.88.11", time: "Yesterday, 9:42am", status: "success" },
                { device: "Unknown Device", ip: "41.58.120.5", time: "2 days ago", status: "failed" },
              ].map((s, i) => (
                <div key={i} className={`p-3 rounded-xl flex justify-between items-center border ${s.status === "failed" ? "border-red-100 bg-red-50" : "border-teal-900/5 bg-teal-50/50"}`}>
                  <div>
                    <p className="text-[9px] font-black uppercase">{s.device}</p>
                    <p className="text-[8px] text-teal-900/40 font-mono">{s.ip} · {s.time}</p>
                  </div>
                  <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full ${s.status === "failed" ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"}`}>{s.status}</span>
                </div>
              ))}
            </div>
          </>
        );

      case "auditLogs":
        return (
          <>
            <Field label="Date Range">
              <div className="flex gap-2">
                <input type="date" className={`${inputCls} flex-1`} />
                <input type="date" className={`${inputCls} flex-1`} />
              </div>
            </Field>
            <Field label="Filter by Action Type">
              <select className={inputCls}>
                <option>All Actions</option>
                <option>Fund Operations</option>
                <option>KYC / Compliance</option>
                <option>Card Actions</option>
                <option>Security Changes</option>
                <option>Profile Updates</option>
              </select>
            </Field>
            <div className="space-y-2">
              <p className="text-[8px] font-black text-teal-900/40 uppercase tracking-widest">Audit Trail</p>
              {[
                { action: "Password Reset", staff: "Staff: A. Bello", time: "Today 10:22am", type: "security" },
                { action: "Deposit — ₦25,000", staff: "Staff: M. Okafor", time: "Yesterday 3:10pm", type: "funds" },
                { action: "KYC Document Uploaded", staff: "Staff: A. Bello", time: "3 days ago", type: "kyc" },
                { action: "Card Blocked", staff: "Staff: T. Adeyemi", time: "Last week", type: "card" },
              ].map((log, i) => (
                <div key={i} className="p-3 rounded-xl border border-teal-900/5 bg-teal-50/50 flex justify-between items-center">
                  <div>
                    <p className="text-[9px] font-black uppercase">{log.action}</p>
                    <p className="text-[8px] text-teal-900/40">{log.staff} · {log.time}</p>
                  </div>
                  <span className="text-[7px] font-black uppercase px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full">{log.type}</span>
                </div>
              ))}
            </div>
            <button className="w-full py-3 border-2 border-dashed border-teal-900/10 rounded-xl text-[9px] font-black text-teal-900/30 uppercase hover:border-teal-900/30 hover:text-teal-900 transition-all flex items-center justify-center gap-2">
              <Download size={12} /> Export Full Audit Log
            </button>
          </>
        );

      /* ── DANGER ZONE ── */
      case "danger":
        return (
          <>
            <InfoBanner variant="danger" text="This action will freeze all debit and credit transactions on this account. Customer will be notified." />
            <Field label="Action">
              <div className="flex gap-3">
                {["Freeze Account", "Unfreeze Account"].map((opt) => (
                  <label key={opt} className="flex-1 flex items-center gap-2 p-3 bg-teal-50 rounded-xl cursor-pointer text-[9px] font-black uppercase">
                    <input type="radio" name="freezeAction" className="accent-teal-700" /> {opt}
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Reason">
              <textarea placeholder="Reason for freeze/unfreeze..." className={`${inputCls} min-h-[90px]`} />
            </Field>
          </>
        );

      default:
        return null;
    }
  };

  /* ─── SHARED FIELD COMPONENTS ─── */
  const inputCls = "w-full p-4 bg-teal-50 border-2 border-transparent focus:border-teal-500 rounded-2xl outline-none text-sm font-bold";

  const Field = ({ label, children }) => (
    <div className="space-y-1">
      <label className="text-[9px] font-black text-teal-950 uppercase tracking-widest ml-1">{label}</label>
      {children}
    </div>
  );

  const Row = ({ label, value }) => (
    <div className="flex justify-between items-center">
      <span className="text-[9px] font-black text-teal-900/40 uppercase">{label}</span>
      <span className="text-xs font-mono font-black">{value}</span>
    </div>
  );

  const InfoBanner = ({ variant, text }) => {
    const styles = {
      danger: "bg-red-50 border-red-200 text-red-700",
      warning: "bg-amber-50 border-amber-200 text-amber-700",
      info: "bg-blue-50 border-blue-200 text-blue-700",
    };
    const icons = { danger: AlertTriangle, warning: AlertCircle, info: AlertCircle };
    const Icon = icons[variant];
    return (
      <div className={`p-4 rounded-2xl border flex items-start gap-3 ${styles[variant]}`}>
        <Icon size={14} className="mt-0.5 shrink-0" />
        <p className="text-[10px] font-bold leading-relaxed">{text}</p>
      </div>
    );
  };

  /* ─── SUBCOMPONENTS ─── */
  const ActionCard = ({ title, children, icon: Icon, variant = "teal" }) => (
    <div className="bg-white rounded-[32px] border border-teal-900/5 shadow-sm overflow-hidden flex flex-col">
      <div className={`p-4 flex items-center gap-2 border-b border-teal-900/5 ${variant === "danger" ? "bg-red-50" : "bg-teal-50/50"}`}>
        <Icon size={14} className={variant === "danger" ? "text-red-600" : "text-teal-700"} />
        <h3 className={`text-[10px] font-black uppercase tracking-widest ${variant === "danger" ? "text-red-600" : "text-teal-900"}`}>{title}</h3>
      </div>
      <div className="p-5 flex flex-col gap-2">{children}</div>
    </div>
  );

  const MiniBtn = ({ label, onClick, danger }) => (
    <button onClick={onClick} className={`w-full py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-between transition-all active:scale-95 ${danger ? "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white" : "bg-teal-900/5 text-teal-950 hover:bg-teal-950 hover:text-white"}`}>
      {label} <ChevronRight size={12} />
    </button>
  );

  return (
    <CrestlineStaffLayout>
      <div className="max-w-[1600px] mx-auto p-6 space-y-6 text-left">

        {/* TOP HUD */}
        <div className="bg-teal-950 rounded-[40px] p-8 text-white flex flex-col lg:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden">
          <Landmark size={300} className="absolute -right-20 -bottom-20 text-white/[0.03] -rotate-12 pointer-events-none" />
          <div className="flex items-center gap-6 z-10">
            <button onClick={() => navigate(-1)} className="w-14 h-14 bg-white/10 hover:bg-white text-white hover:text-teal-950 rounded-2xl flex items-center justify-center transition-all shadow-xl">
              <ArrowLeft size={24} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black italic tracking-tighter uppercase">{customer.personal.name}</h1>
                <div className="bg-emerald-500 px-3 py-1 rounded-full text-[9px] font-black uppercase">Verified Node</div>
              </div>
              <p className="text-xs font-mono text-teal-400 font-bold uppercase mt-1 tracking-widest">
                {customer.banking.type} • {customer.banking.tier} • {customer.banking.nuban} • {customer.banking.branch}
              </p>
            </div>
          </div>
          <div className="text-right z-10 bg-white/5 p-6 rounded-[30px] border border-white/10 backdrop-blur-md">
            <p className="text-[9px] font-black text-teal-400 uppercase tracking-widest mb-1">Total Ledger Balance</p>
            <h2 className="text-5xl font-black italic tracking-tighter">₦{customer.banking.balance.toLocaleString()}</h2>
            <div className="flex justify-end gap-2 mt-2">
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[8px] font-black uppercase border border-emerald-500/30">Inflow: Active</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[8px] font-black uppercase border border-emerald-500/30">Outflow: Active</span>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* COLUMN 1: FINANCIAL TERMINAL */}
          <div className="space-y-6">
            <ActionCard title="Ledger Operations" icon={PlusCircle}>
              <button onClick={() => openModal("deposit", "Deposit Funds")} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
                <PlusCircle size={14} /> Deposit Funds
              </button>
              <button onClick={() => openModal("withdraw", "Withdraw Funds")} className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2">
                <MinusCircle size={14} /> Withdraw Funds
              </button>
              <button onClick={() => openModal("transfer", "Internal Transfer")} className="w-full py-4 bg-teal-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                <Send size={14} /> Transfer Funds
              </button>
              <MiniBtn label="Place Hold on Funds" onClick={() => openModal("placeHold", "Place Hold on Funds")} />
              <MiniBtn label="Close Account" danger />
            </ActionCard>

            <ActionCard title="Compliance & KYC" icon={ShieldCheck}>
              <div className="p-3 bg-teal-50 rounded-xl space-y-2 mb-2">
                <p className="text-[8px] font-black text-teal-900/40 uppercase">Transaction Limits</p>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold">Daily Max:</span>
                  <input type="text" value={`₦${limits.daily.toLocaleString()}`} className="bg-transparent text-right font-black text-teal-950 w-24 outline-none" readOnly />
                </div>
              </div>
              <MiniBtn label="Verify Identity" onClick={() => openModal("verifyIdentity", "Verify Identity")} />
              <MiniBtn label="Upload Documents" onClick={() => openModal("uploadDocuments", "Upload Documents")} />
              <MiniBtn label="Blacklist Check" onClick={() => openModal("blacklistCheck", "Blacklist Check")} />
              <MiniBtn label="Flag for Review" onClick={() => openModal("flagReview", "Flag for Review")} danger />
            </ActionCard>
          </div>

          {/* COLUMN 2: CARD & CHANNEL MANAGEMENT */}
          <div className="space-y-6">
            <ActionCard title="Card Vault" icon={CreditCard}>
              <div className="aspect-[1.6/1] bg-gradient-to-br from-gray-800 to-black rounded-2xl p-5 text-white flex flex-col justify-between relative overflow-hidden mb-2">
                <div className="z-10 flex justify-between items-start">
                  <p className="text-[8px] font-mono opacity-60">MASTER DEBIT</p>
                  <Landmark size={20} className="opacity-20" />
                </div>
                <p className="z-10 text-lg font-mono tracking-[0.2em]">**** **** **** 8829</p>
                <div className="z-10 flex justify-between items-end">
                  <p className="text-[8px] font-mono">CHIDI OKORO</p>
                  <p className="text-[8px] font-mono uppercase text-emerald-400">Active</p>
                </div>
              </div>
              <MiniBtn label="Issue New Card" onClick={() => openModal("issueCard", "Issue New Card")} />
              <MiniBtn label="Block Card" onClick={() => openModal("blockCard", "Block Card")} danger />
              <MiniBtn label="Replace Card" onClick={() => openModal("replaceCard", "Replace Card")} />
              <MiniBtn label="Masked Card Details" onClick={() => openModal("maskedCard", "Masked Card Details")} />
            </ActionCard>

            <ActionCard title="Security Actions" icon={Lock}>
              <MiniBtn label="Reset Password" onClick={() => openModal("resetPassword", "Reset Password")} />
              <MiniBtn label="Reset Transfer PIN" onClick={() => openModal("resetPIN", "Reset Transfer PIN")} />
              <MiniBtn label="Disable Online Banking" onClick={() => openModal("disableOnlineBanking", "Disable Online Banking")} danger />
              <MiniBtn label="View Login Activity" onClick={() => openModal("loginActivity", "Login Activity")} />
              <MiniBtn label="Audit Logs" onClick={() => openModal("auditLogs", "Audit Logs")} />
            </ActionCard>
          </div>

          {/* COLUMN 3: BIO-DATA & INFO */}
          <div className="space-y-6 lg:col-span-1">
            <ActionCard title="Identity Photo" icon={Camera}>
              <div className="relative group w-full flex flex-col items-center py-2">
                <div className="w-32 h-32 rounded-full border-4 border-teal-900/5 bg-teal-50 flex items-center justify-center overflow-hidden relative shadow-inner">
                  {profileImg ? (
                    <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-teal-900/20" />
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-teal-950/40 backdrop-blur-sm flex items-center justify-center">
                      <Activity size={24} className="text-white animate-spin" />
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                <div className="flex gap-2 mt-4 w-full">
                  <button onClick={() => fileInputRef.current.click()} className="flex-1 py-2 bg-teal-950 text-white rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-1 hover:bg-black transition-all">
                    <Upload size={12} /> {profileImg ? "Change Photo" : "Upload Photo"}
                  </button>
                  {profileImg && (
                    <button onClick={() => setProfileImg(null)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                {profileImg && !isUploading && (
                  <p className="text-[7px] font-black text-emerald-600 uppercase mt-2 flex items-center gap-1">
                    <CheckCircle size={8} /> Node Image Synced
                  </p>
                )}
              </div>
            </ActionCard>

            <ActionCard title="Customer Profile" icon={User}>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-teal-900/5 pb-2">
                  <span className="text-[9px] font-black text-teal-900/30 uppercase">BVN</span>
                  <span className="text-xs font-mono font-black">{customer.kyc.bvn}</span>
                </div>
                <div className="flex justify-between items-center border-b border-teal-900/5 pb-2">
                  <span className="text-[9px] font-black text-teal-900/30 uppercase">Phone</span>
                  <span className="text-xs font-mono font-black">{customer.personal.phone}</span>
                </div>
                <div className="flex justify-between items-center border-b border-teal-900/5 pb-2">
                  <span className="text-[9px] font-black text-teal-900/30 uppercase">Gender</span>
                  <span className="text-xs font-black uppercase">{customer.personal.gender}</span>
                </div>
                <div className="bg-teal-50 p-4 rounded-2xl">
                  <p className="text-[8px] font-black text-teal-900/40 uppercase mb-1">Residential Address</p>
                  <p className="text-[10px] font-bold text-teal-950 uppercase">{customer.kyc.address}</p>
                </div>
                <button className="w-full py-3 bg-teal-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Edit User Info</button>
              </div>
            </ActionCard>
          </div>

          {/* COLUMN 4: ACTIVITY LEDGER */}
          <div className="lg:col-span-1">
            <ActionCard title="Recent Transactions" icon={Activity}>
              <div className="space-y-3">
                {[
                  { type: "Dr", amount: 5000, title: "ATM Withdrawal", date: "Today, 2:15pm" },
                  { type: "Cr", amount: 25000, title: "Salary Credit", date: "Yesterday" },
                  { type: "Dr", amount: 1200, title: "Bank Charges", date: "2 days ago" },
                ].map((trx, i) => (
                  <div key={i} className="p-3 border border-teal-900/5 rounded-xl flex justify-between items-center bg-white">
                    <div>
                      <p className="text-[10px] font-black text-teal-950 uppercase leading-none mb-1">{trx.title}</p>
                      <p className="text-[8px] font-bold text-teal-900/30 uppercase">{trx.date}</p>
                    </div>
                    <p className={`text-xs font-black font-mono ${trx.type === "Cr" ? "text-emerald-600" : "text-red-600"}`}>
                      {trx.type === "Cr" ? "+" : "-"}₦{trx.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
                <button className="w-full py-3 border-2 border-dashed border-teal-900/10 rounded-xl text-[9px] font-black text-teal-900/30 uppercase hover:border-teal-900/30 hover:text-teal-900 transition-all">
                  View Full Statement
                </button>
              </div>
            </ActionCard>

            <div className="mt-6 p-6 bg-red-50 rounded-[32px] border border-red-100 space-y-4">
              <h4 className="text-[10px] font-black uppercase text-red-600 flex items-center gap-2">
                <Ban size={14} /> High Risk Zone
              </h4>
              <button onClick={() => openModal("danger", "Restrict Node")} className="w-full py-3 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase shadow-lg">
                Freeze / Unfreeze
              </button>
              <button className="w-full py-3 bg-black text-white rounded-xl text-[9px] font-black uppercase">
                Flag for Fraud
              </button>
            </div>
          </div>
        </div>

        {/* ─── MODAL ─── */}
        {modal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-teal-950/80 backdrop-blur-md p-6">
            <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl relative flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-10 pb-6 shrink-0">
                <button onClick={closeModal} className="absolute top-8 right-8 text-teal-900/20 hover:text-teal-950">
                  <X size={24} />
                </button>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-teal-950">{modal.title}</h3>
                <p className="text-[9px] font-black text-teal-900/40 uppercase tracking-widest">Transaction Authorization Required</p>
              </div>

              {/* Scrollable Body */}
              <div className="px-10 overflow-y-auto flex-1">
                <div className="space-y-5 pb-4">
                  {renderModalBody()}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-10 pt-6 shrink-0">
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={closeModal} className="py-5 bg-teal-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">
                    Confirm & Execute
                  </button>
                  <button onClick={closeModal} className="py-5 bg-teal-50 text-teal-950 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CrestlineStaffLayout>
  );
};

export default CrestlineUsermanagementinfo;