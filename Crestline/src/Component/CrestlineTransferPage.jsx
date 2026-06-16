import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  User,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import axios from "axios";

import CrestlineNavbar from "./CrestlineNavbar";
import CrestlineTransactionPinModal from "./CrestlineTransactionPinModal";

// ─── tiny helper ─────────────────────────────────────────────
const API = "http://localhost:5300/user";
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("crestline_token")}`,
});

// ─────────────────────────────────────────────────────────────
// LANDMARK ICON
// ─────────────────────────────────────────────────────────────
const LandmarkIcon = ({ size = 18, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 21h18" />
    <path d="M3 7v1a3 3 0 0 0 6 0V7m6 0v1a3 3 0 0 0 6 0V7M3 7l9-4 9 4M4 21v-7m5 7v-7m6 7v-7m5 7v-7" />
  </svg>
);

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
const CrestlineTransferPage = () => {
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount]               = useState("");
  const [description, setDescription]     = useState("");

  const [isVerifying, setIsVerifying]     = useState(false);
  const [recipient, setRecipient]         = useState(null);
  const [lookupError, setLookupError]     = useState("");

  const [showPinModal, setShowPinModal]   = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  // Compliance states for runtime validation
  const [userComplianceTier, setUserComplianceTier] = useState(1);
  const [userWalletBalance, setUserWalletBalance] = useState(0);

  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Establish Compliance Tier Matrix ───────────────────────
  const tierLimits = {
    1: 50000,     // Tier 1 Max
    2: 2000000,   // Tier 2 Max
    3: 10000000   // Tier 3 Max
  };
  const activeMaxLimit = tierLimits[userComplianceTier] || 50000;

  // ── Sync Active Identity Metrics on Mount ──────────────────
  useEffect(() => {
    const fetchUserComplianceState = async () => {
      try {
        const res = await axios.get(`${API}/profile`, { headers: authHeaders() });
        if (res.data && res.data.user) {
          setUserComplianceTier(res.data.user.currentComplianceTier || 1);
          setUserWalletBalance(res.data.user.balance || 0);
        }
      } catch (err) {
        console.error("Failed executing synchronization map data context pipeline:", err);
      }
    };
    fetchUserComplianceState();
  }, []);

  // ── Account lookup ────────────────────────────────────────
  const lookupAccount = useCallback(async (accNum) => {
    setIsVerifying(true);
    setRecipient(null);
    setLookupError("");
    try {
      const res = await axios.get(`${API}/lookup-account`, {
        params:  { accountNumber: accNum },
        headers: authHeaders(),
      });
      setRecipient(res.data.recipient);
    } catch (err) {
      setLookupError(err.response?.data?.message || "Account not found.");
    } finally {
      setIsVerifying(false);
    }
  }, []);

  useEffect(() => {
    if (accountNumber.length === 10) {
      lookupAccount(accountNumber);
    } else {
      setRecipient(null);
      setLookupError("");
      setIsVerifying(false);
    }
  }, [accountNumber, lookupAccount]);

  // ── Balance and Limit Evaluations ─────────────────────────
  const parsedAmount = parseFloat(amount) || 0;
  const isOverLimit = parsedAmount > activeMaxLimit;
  const isOverBalance = parsedAmount > userWalletBalance;

  // ── PIN confirmed ─────────────────────────────────────────
  const handlePinConfirm = async (pin) => {
    setIsTransferring(true);
    try {
      const res = await axios.post(
        `${API}/transfer`,
        {
          accountNumber: recipient.accountNumber,
          amount,
          description: description || `Transfer to ${recipient.fullName}`,
          authPin: pin,
        },
        { headers: authHeaders() },
      );

      if (res.data.success) {
        setShowPinModal(false);
        showToast(
          "success",
          `₦${Number(amount).toLocaleString()} sent to ${res.data.recipient}`,
        );
        // Reduce local state balance instantly on complete write
        setUserWalletBalance((prev) => prev - parsedAmount);
        setAccountNumber("");
        setAmount("");
        setDescription("");
        setRecipient(null);
      }
    } catch (err) {
      showToast(
        "error",
        err.response?.data?.message || "Transfer failed. Try again.",
      );
      setShowPinModal(false);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <CrestlineNavbar>
      <div className="p-4 md:p-10 max-w-2xl mx-auto min-h-[90vh] flex flex-col justify-center text-white">

        <CrestlineTransactionPinModal
          isOpen={showPinModal}
          onClose={() => !isTransferring && setShowPinModal(false)}
          onConfirm={handlePinConfirm}
          isProcessing={isTransferring}
          transactionType="activity"
          payload={{
            action:  "TRANSFER_INITIATED",
            details: `Transfer of ₦${Number(amount || 0).toLocaleString()} to ${recipient?.accountNumber}`,
          }}
          title="Confirm Transfer"
          subtitle="Identity Verification Required"
          summaryItems={[
            { label: "Beneficiary", value: recipient?.fullName },
            {
              label: "Amount",
              value: `₦${Number(amount || 0).toLocaleString()}`,
              highlight: true,
            },
            { label: "Description", value: description || "Transfer" },
          ]}
        />

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl
                ${toast.type === "success"
                  ? "bg-emerald-500 text-black shadow-emerald-500/30"
                  : "bg-red-500 text-white shadow-red-500/30"
                }`}
            >
              {toast.type === "success"
                ? <CheckCircle2 size={18} />
                : <AlertTriangle size={18} />}
              <span className="text-[11px] font-black uppercase tracking-widest italic">
                {toast.message}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="group flex items-center gap-2 text-zinc-600 hover:text-white transition-colors mb-4"
            >
              <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-blue-600 transition-all">
                <ChevronLeft size={14} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest italic">
                Return to Terminal
              </span>
            </button>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
              Crestline <span className="text-blue-500">Transfer</span>
            </h1>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
              <ShieldCheck size={14} className="text-blue-500" />
              <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                Tier {userComplianceTier} Limit: ₦{activeMaxLimit.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] font-bold text-zinc-500 mr-2 uppercase tracking-wider">
              Available Vault: <span className="text-zinc-300">₦{userWalletBalance.toLocaleString()}</span>
            </span>
          </div>
        </div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950 border border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden shadow-2xl"
        >
          <div className="space-y-7 relative z-10">

            {/* Account number */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2 italic block">
                Destination Account
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 p-2 bg-zinc-900 rounded-lg group-focus-within:text-blue-500 transition-colors">
                  <LandmarkIcon size={18} />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) =>
                    setAccountNumber(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="0000000000"
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-[24px] py-6 pl-16 pr-14 text-2xl font-mono tracking-[0.3em] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-white placeholder:opacity-10"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  {isVerifying && (
                    <Loader2 className="animate-spin text-blue-500" size={24} />
                  )}
                  {!isVerifying && recipient && (
                    <CheckCircle2 className="text-emerald-500" size={24} />
                  )}
                  {!isVerifying && lookupError && (
                    <AlertTriangle className="text-red-400" size={24} />
                  )}
                </div>
              </div>

              <AnimatePresence>
                {lookupError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-400 text-[10px] font-black uppercase tracking-widest ml-2 flex items-center gap-1"
                  >
                    <AlertTriangle size={11} /> {lookupError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Recipient badge */}
            <AnimatePresence>
              {recipient && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-blue-600/5 border border-blue-500/20 p-5 rounded-3xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 italic">
                        Recipient Identity
                      </p>
                      <p className="text-sm font-black uppercase italic tracking-tight">
                        {recipient.fullName}
                      </p>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                        {recipient.accountType} account
                      </p>
                    </div>
                  </div>
                  <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Amount + description + button */}
            <AnimatePresence>
              {recipient && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 pt-6 mt-6 border-t border-white/5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 block">
                        Volume (NGN)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className={`w-full bg-zinc-900 border rounded-2xl p-5 text-xl font-black italic tracking-tighter outline-none focus:border-blue-500 text-white transition-colors ${
                          isOverLimit || isOverBalance ? 'border-red-500/50 focus:border-red-500' : 'border-white/5'
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 block">
                        Reference Tag
                      </label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="E.g. Services"
                        className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-5 text-sm font-bold outline-none focus:border-blue-500 text-white"
                      />
                    </div>
                  </div>

                  {/* Operational Compliance Exception Errors */}
                  <AnimatePresence>
                    {isOverLimit && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400">
                        <AlertTriangle size={16} className="shrink-0" />
                        <p className="text-[10px] font-black uppercase tracking-wider italic">
                          Limit Breach: Tier {userComplianceTier} parameters permit a maximum transaction cap of ₦{activeMaxLimit.toLocaleString()}.
                        </p>
                      </motion.div>
                    )}

                    {!isOverLimit && isOverBalance && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400">
                        <AlertTriangle size={16} className="shrink-0" />
                        <p className="text-[10px] font-black uppercase tracking-wider italic">
                          Insufficient Funds: Requested volume exceeds your current core vault balance.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {amount && parseFloat(amount) > 0 && !isOverLimit && !isOverBalance && (
                    <div className="bg-white/5 border border-white/5 rounded-2xl px-5 py-4 flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                        You are sending
                      </span>
                      <span className="text-lg font-black italic text-blue-400">
                        ₦{Number(amount).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowPinModal(true)}
                    disabled={!amount || parseFloat(amount) <= 0 || !recipient || isOverLimit || isOverBalance}
                    className="w-full py-6 bg-white text-black rounded-[28px] font-black italic uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all shadow-2xl group active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed text-sm"
                  >
                    Execute Transfer{" "}
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
        </motion.div>

        <p className="mt-8 text-center text-[9px] font-black uppercase tracking-[0.4em] text-zinc-800">
          Crestline Global Payment Gateway v2.4
        </p>
      </div>
    </CrestlineNavbar>
  );
};

export default CrestlineTransferPage;