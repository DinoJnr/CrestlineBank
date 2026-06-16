import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ShieldCheck,
  Truck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  MapPin,
  Cpu,
  RefreshCcw,
  Copy,
  Check,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  X,
} from "lucide-react";
import axios from "axios";

import CrestlineNavbar from "./CrestlineNavbar";
import CrestlineTransactionPinModal from "./CrestlineTransactionPinModal";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const TIERS = [
  {
    id: "silver",
    name: "Standard Silver",
    price: "₦2,500",
    duration: 3,
    gradient: "from-zinc-400 to-zinc-600",
    features: ["Global ATMs", "Online Payments", "₦1M Daily Limit"],
  },
  {
    id: "gold",
    name: "Executive Gold",
    price: "₦4,000",
    duration: 5,
    gradient: "from-yellow-400 to-orange-600",
    features: ["Lounge Access", "Zero Web Fees", "₦5M Daily Limit"],
  },
  {
    id: "black",
    name: "Elite Black",
    price: "₦15,000",
    duration: 10,
    gradient: "from-zinc-800 via-black to-zinc-900",
    features: ["Concierge Service", "High Limit", "Priority Support"],
  },
];

const getExpiry = (duration) => {
  const d = new Date();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = (d.getFullYear() + duration).toString().slice(-2);
  return `${month}/${year}`;
};

const isCardExpired = (expiryStr) => {
  if (!expiryStr) return false;
  const [mm, yy] = expiryStr.split("/");
  const expDate = new Date(`20${yy}`, parseInt(mm) - 1, 1);
  return new Date() >= expDate;
};

// ─────────────────────────────────────────────
// SET / CHANGE PIN MODAL
// ─────────────────────────────────────────────
const PinSetModal = ({ isOpen, isChange, onClose, onSuccess }) => {
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState({ old: false, new: false, confirm: false });
  const [error, setError] = useState("");
  const [showTxnModal, setShowTxnModal] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setOldPin("");
      setNewPin("");
      setConfirm("");
      setError("");
      setShowTxnModal(false);
    }
  }, [isOpen]);

  const handleProceed = () => {
    if (isChange && oldPin.length < 4)
      return setError("Enter your current PIN");
    if (newPin.length < 4) return setError("PIN must be at least 4 digits");
    if (newPin !== confirm) return setError("PINs do not match");
    setError("");
    setShowTxnModal(true);
  };

  const handleTxnConfirm = (txnPin) => {
    setShowTxnModal(false);
    onSuccess({ oldPin: isChange ? oldPin : null, newPin, txnPin });
  };

  const Field = ({ label, val, setter, showKey, placeholder }) => (
    <div className="space-y-1">
      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">
        {label}
      </label>
      <div className="relative">
        <input
          type={show[showKey] ? "text" : "password"}
          inputMode="numeric"
          maxLength={6}
          value={val}
          onChange={(e) => setter(e.target.value.replace(/\D/g, ""))}
          placeholder={placeholder || "••••"}
          className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-3 pl-4 pr-12 text-sm font-mono font-bold outline-none focus:border-blue-500 text-white tracking-[0.4em]"
        />
        <button
          type="button"
          onClick={() => setShow((s) => ({ ...s, [showKey]: !s[showKey] }))}
          className="absolute right-4 top-3.5 text-zinc-500 hover:text-white"
        >
          {show[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-zinc-950 border border-white/10 p-8 rounded-[40px] w-full max-w-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black italic uppercase">
                {isChange ? "Change" : "Set"} Card PIN
              </h2>
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">
                {isChange ? "Update your card PIN" : "Create a new card PIN"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-white/5 rounded-xl hover:bg-red-600/20 transition-all"
            >
              <X size={14} />
            </button>
          </div>

          {/* ✅ FIX 1: Wrapped in <form> — enables Enter-key submit + password manager autofill */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleProceed();
            }}
            className="space-y-4"
          >
            {isChange && (
              <Field
                label="Current PIN"
                val={oldPin}
                setter={setOldPin}
                showKey="old"
                placeholder="••••"
              />
            )}
            <Field
              label="New PIN"
              val={newPin}
              setter={setNewPin}
              showKey="new"
              placeholder="••••"
            />
            <Field
              label="Confirm New PIN"
              val={confirm}
              setter={setConfirm}
              showKey="confirm"
              placeholder="••••"
            />
            {error && (
              <p className="text-red-400 text-[10px] font-bold flex items-center gap-1">
                <AlertTriangle size={11} />
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full py-4 bg-white text-black rounded-2xl font-black italic uppercase tracking-widest mt-2 hover:bg-blue-600 hover:text-white transition-all"
            >
              Continue <ArrowRight size={16} className="inline ml-1" />
            </button>
          </form>
        </motion.div>
      </div>

      {/* ✅ FIX 2: transactionType is "activity" not "payment" — PIN changes are NOT financial transactions */}
      <CrestlineTransactionPinModal
        isOpen={showTxnModal}
        transactionType="activity"
        payload={{
          action: isChange ? "CARD_PIN_CHANGE" : "CARD_PIN_SET",
          details: isChange ? "User changed card ATM PIN" : "User set card ATM PIN",
        }}
        onClose={() => setShowTxnModal(false)}
        onConfirm={handleTxnConfirm}
      />
    </>
  );
};

// ─────────────────────────────────────────────
// REQUEST REPLACEMENT MODAL
// ─────────────────────────────────────────────
const ReplaceModal = ({ isOpen, onClose, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [showTxnModal, setShowTxnModal] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setReason("");
      setError("");
      setShowTxnModal(false);
    }
  }, [isOpen]);

  const handleProceed = () => {
    if (!reason.trim()) return setError("Please provide a reason");
    setError("");
    setShowTxnModal(true);
  };

  const handleTxnConfirm = (txnPin) => {
    setShowTxnModal(false);
    onSuccess({ reason, txnPin });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-zinc-950 border border-white/10 p-8 rounded-[40px] w-full max-w-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black italic uppercase">
                Request Replacement
              </h2>
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">
                State your reason below
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-white/5 rounded-xl hover:bg-red-600/20 transition-all"
            >
              <X size={14} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4">
              <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle size={12} /> This will disable your current card
                immediately.
              </p>
            </div>
            <textarea
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Card Lost, Stolen, Damaged, Expired..."
              className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 text-sm font-bold outline-none focus:border-blue-500 resize-none text-white"
            />
            {error && (
              <p className="text-red-400 text-[10px] font-bold flex items-center gap-1">
                <AlertTriangle size={11} />
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={handleProceed}
              className="w-full py-4 bg-white text-black rounded-2xl font-black italic uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
            >
              Continue <ArrowRight size={16} className="inline ml-1" />
            </button>
          </div>
        </motion.div>
      </div>

      <CrestlineTransactionPinModal
        isOpen={showTxnModal}
        transactionType="activity"
        payload={{
          action: "CARD_REPLACEMENT_REQUESTED",
          details: `Replacement reason: ${reason}`,
        }}
        onClose={() => setShowTxnModal(false)}
        onConfirm={handleTxnConfirm}
      />
    </>
  );
};

// ─────────────────────────────────────────────
// ACTIVE CARD VIEW
// ─────────────────────────────────────────────
const ActiveCardView = ({
  card,
  user,
  onRequestReplacement,
  onSetPin,
  onChangePin,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const expired = isCardExpired(card.expiryDate);
  const tier = TIERS.find((t) => t.id === card.tier) || TIERS[0];

  const copyNumber = () => {
    navigator.clipboard.writeText(card.cardNumber || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {expired && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3"
        >
          <AlertTriangle size={16} className="text-red-400 shrink-0" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-red-400">
              Card Expired
            </p>
            <p className="text-[9px] text-red-400/70 mt-0.5">
              This card is disabled. Request a new card to continue.
            </p>
          </div>
        </motion.div>
      )}

      <div
        className={`relative w-full aspect-[1.58/1] cursor-pointer ${expired ? "opacity-40 grayscale pointer-events-none" : ""}`}
        style={{ perspective: "1000px" }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative w-full h-full rounded-[24px] shadow-2xl"
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${tier.gradient} p-8 flex flex-col justify-between rounded-[24px]`}
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="flex justify-between items-start">
              <span className="text-xl font-black italic uppercase tracking-widest text-white/90">
                CRESTLINE
              </span>
              <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center">
                <Cpu className="text-white/80" size={28} />
              </div>
            </div>
            <div>
              <p className="text-lg font-mono tracking-[0.3em] text-white/90 mb-2">
                {card.cardNumber
                  ? card.cardNumber.replace(/(.{4})/g, "$1 ").trim()
                  : "**** **** **** ****"}
              </p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[8px] font-black uppercase opacity-60 text-white italic">
                    Card Holder
                  </p>
                  <p className="text-xs font-black uppercase tracking-widest text-white">
                    {user.fullName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black uppercase opacity-60 text-white italic">
                    Expires
                  </p>
                  <p className="text-xs font-black text-white font-mono">
                    {card.expiryDate || getExpiry(tier.duration)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute inset-0 bg-zinc-200 flex flex-col rounded-[24px] overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="w-full h-12 bg-zinc-800 mt-8" />
            <div className="px-8 mt-4 flex-1">
              <p className="text-[7px] text-zinc-500 font-bold uppercase mb-1">
                Authorised Signature — Not valid unless signed
              </p>
              <div className="w-full h-10 flex items-center overflow-hidden rounded-sm border border-zinc-300">
                <div
                  className="flex-1 h-full bg-repeating-linear bg-white"
                  style={{
                    background:
                      "repeating-linear-gradient(45deg, #e4e4e4, #e4e4e4 2px, white 2px, white 8px)",
                  }}
                />
                <div className="bg-white border-l-2 border-zinc-400 px-3 h-full flex items-center shrink-0">
                  <div className="text-center">
                    <p className="text-[6px] text-zinc-400 font-bold uppercase leading-none mb-0.5">
                      CVV
                    </p>
                    <p className="text-sm font-black font-mono text-black tracking-widest">
                      {card.cvv || "•••"}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-[6px] text-zinc-400 mt-3 leading-tight italic">
                If found, please return to any branch of Crestline Bank. Use of
                this card is subject to the terms of the cardholder agreement.
              </p>
            </div>
            <div className="p-6 flex justify-between items-end">
              <div>
                <p className="text-[7px] text-zinc-400 uppercase font-bold">
                  Valid Thru
                </p>
                <p className="text-[11px] font-black text-black font-mono">
                  {card.expiryDate || getExpiry(tier.duration)}
                </p>
              </div>
              <span className="text-[8px] font-black text-zinc-400 uppercase">
                Issued by Crestline
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <p className="text-center text-[9px] text-zinc-600 font-bold uppercase tracking-widest -mt-2">
        Tap card to flip
      </p>

      <div className="bg-zinc-950 border border-white/5 rounded-[32px] p-6 space-y-4">
        <div className="flex items-center justify-between bg-white/5 rounded-2xl px-5 py-4">
          <div>
            <p className="text-[8px] text-zinc-500 uppercase font-black tracking-widest mb-1">
              Card Number
            </p>
            <p className="text-sm font-mono font-black text-white tracking-[0.2em]">
              {card.cardNumber
                ? card.cardNumber.replace(/(.{4})/g, "$1 ").trim()
                : "**** **** **** ****"}
            </p>
          </div>
          <button
            type="button"
            onClick={copyNumber}
            disabled={expired}
            className="p-2.5 bg-zinc-800 rounded-xl hover:bg-blue-600 transition-all disabled:opacity-30"
          >
            {copied ? (
              <Check size={14} className="text-green-400" />
            ) : (
              <Copy size={14} className="text-zinc-400" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-2xl px-5 py-4">
            <p className="text-[8px] text-zinc-500 uppercase font-black tracking-widest mb-1">
              Expires
            </p>
            <p
              className={`text-sm font-mono font-black ${expired ? "text-red-400" : "text-white"}`}
            >
              {card.expiryDate || getExpiry(tier.duration)}
            </p>
          </div>
          <div className="bg-white/5 rounded-2xl px-5 py-4">
            <p className="text-[8px] text-zinc-500 uppercase font-black tracking-widest mb-1">
              Tier
            </p>
            <p className="text-sm font-black text-white italic uppercase">
              {tier.name.split(" ")[1]}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {tier.features.map((f) => (
            <div
              key={f}
              className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/5"
            >
              <CheckCircle2 size={13} className="text-blue-500 shrink-0" />
              <span className="text-[9px] font-black uppercase tracking-tight italic">
                {f}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onRequestReplacement}
          className="py-4 border border-white/10 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600/10 hover:border-red-600/30 transition-all"
        >
          <RefreshCcw size={13} />{" "}
          {expired ? "Request New Card" : "Replace Card"}
        </button>

        <button
          type="button"
          onClick={user.cardPinSet ? onChangePin : onSetPin}
          disabled={expired}
          className="py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600/20 hover:border-blue-600/30 transition-all disabled:opacity-30"
        >
          <KeyRound size={13} />{" "}
          {user.cardPinSet ? "Change PIN" : "Set Card PIN"}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// ORDER VIEW
// ─────────────────────────────────────────────
const OrderView = ({ user, onOrderSuccess }) => {
  const [cardTier, setCardTier] = useState("silver");
  const [address, setAddress] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [showTxnModal, setShowTxnModal] = useState(false);

  const currentTier = TIERS.find((t) => t.id === cardTier);

  const handleOrderAccess = () => {
    if (!address) return alert("Please enter a delivery address");
    setShowTxnModal(true);
  };

  const onPinSuccess = async (pin) => {
    try {
      const token = localStorage.getItem("crestline_token");
      const res = await axios.post(
        "http://localhost:5300/user/request-card",
        {
          tier: currentTier.id,
          price: currentTier.price,
          privileges: currentTier.features,
          address,
          pin,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        setShowTxnModal(false);
        onOrderSuccess();
      }
    } catch (err) {
      alert(
        err.response?.data?.message || "Card request failed. Check balance.",
      );
    }
  };

  return (
    <div className="space-y-8">
      <div
        className="relative w-full aspect-[1.58/1] cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative w-full h-full rounded-[24px] shadow-2xl"
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${currentTier.gradient} p-8 flex flex-col justify-between rounded-[24px]`}
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="flex justify-between items-start">
              <span className="text-xl font-black italic uppercase tracking-widest text-white/90">
                CRESTLINE
              </span>
              <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center">
                <Cpu className="text-white/80" size={28} />
              </div>
            </div>
            <div>
              <p className="text-lg font-mono tracking-[0.3em] text-white/90 mb-2">
                **** **** **** ****
              </p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[8px] font-black uppercase opacity-60 text-white italic">
                    Card Holder
                  </p>
                  <p className="text-xs font-black uppercase tracking-widest text-white">
                    {user.fullName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black uppercase opacity-60 text-white italic">
                    Expires
                  </p>
                  <p className="text-xs font-black text-white font-mono">
                    {getExpiry(currentTier.duration)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute inset-0 bg-zinc-200 flex flex-col rounded-[24px] overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="w-full h-12 bg-zinc-800 mt-8" />
            <div className="px-8 mt-4 flex-1">
              <p className="text-[7px] text-zinc-500 font-bold uppercase mb-1">
                Authorised Signature — Not valid unless signed
              </p>
              <div className="w-full h-10 flex items-center overflow-hidden rounded-sm border border-zinc-300">
                <div
                  className="flex-1 h-full"
                  style={{
                    background:
                      "repeating-linear-gradient(45deg, #e4e4e4, #e4e4e4 2px, white 2px, white 8px)",
                  }}
                />
                <div className="bg-white border-l-2 border-zinc-400 px-3 h-full flex items-center shrink-0">
                  <div className="text-center">
                    <p className="text-[6px] text-zinc-400 font-bold uppercase leading-none mb-0.5">
                      CVV
                    </p>
                    <p className="text-sm font-black font-mono text-zinc-300 tracking-widest">
                      •••
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-[6px] text-zinc-400 mt-3 leading-tight italic">
                If found, please return to any branch of Crestline Bank.
              </p>
            </div>
            <div className="p-6 flex justify-between items-end">
              <div>
                <p className="text-[7px] text-zinc-400 uppercase font-bold">
                  Valid Thru
                </p>
                <p className="text-[11px] font-black text-black font-mono">
                  {getExpiry(currentTier.duration)}
                </p>
              </div>
              <span className="text-[8px] font-black text-zinc-400 uppercase">
                Issued by Crestline
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <p className="text-center text-[9px] text-zinc-600 font-bold uppercase tracking-widest -mt-4">
        Tap card to flip
      </p>

      <div className="grid grid-cols-3 gap-3">
        {TIERS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setCardTier(t.id)}
            className={`p-4 rounded-2xl border transition-all text-center ${cardTier === t.id ? "bg-blue-600 border-transparent shadow-lg scale-105" : "bg-zinc-950 border-white/5 text-zinc-500"}`}
          >
            <p className="text-[10px] font-black uppercase italic tracking-tighter text-white">
              {t.name.split(" ")[1]}
            </p>
            <p className="text-[9px] font-bold opacity-60 mt-1">{t.price}</p>
          </button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-950 border border-white/5 rounded-[40px] p-8 space-y-8"
      >
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2 italic block">
            Privileges
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentTier.features.map((f) => (
              <div
                key={f}
                className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5"
              >
                <CheckCircle2 size={16} className="text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-tight italic">
                  {f}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2 italic block">
            Logistics Destination
          </label>
          <div className="relative">
            <MapPin className="absolute left-5 top-5 text-zinc-600" size={18} />
            <textarea
              rows="2"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter full street address for delivery"
              className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        <button
          type="button"
          disabled={!address}
          onClick={handleOrderAccess}
          className="w-full py-6 bg-white text-black rounded-[28px] font-black italic uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all shadow-2xl disabled:opacity-20 group"
        >
          Order Crestline Asset{" "}
          <ArrowRight
            size={20}
            className="group-hover:translate-x-1 transition-transform"
          />
        </button>
      </motion.div>

      <CrestlineTransactionPinModal
        isOpen={showTxnModal}
        transactionType="activity"
        payload={{
          action: "CARD_ORDER_REQUESTED",
          details: `Card tier: ${currentTier.id} — Delivery: ${address}`,
        }}
        onClose={() => setShowTxnModal(false)}
        onConfirm={onPinSuccess}
      />
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const CrestlineCard = () => {
  const [user, setUser] = useState({
    fullName: "LOADING...",
    cardPinSet: false,
  });
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [showPinSetModal, setShowPinSetModal] = useState(false);
  const [pinModalMode, setPinModalMode] = useState("set");

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("crestline_token");
      const res = await axios.get("http://localhost:5300/user/dashboard-data", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const u = res.data.user;
      setUser({ fullName: u.fullName, cardPinSet: !!u.cardPin });

      if (u.cardStatus === "active" && u.card) {
        setCard({
          cardNumber: u.card.cardNumber,
          expiryDate: u.card.expiryDate,
          cvv: u.card.cvv,
          tier: u.card.tier,
        });
      } else {
        setCard(null);
      }
    } catch {
      console.error("Failed to fetch card data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReplacement = async ({ reason, txnPin }) => {
    try {
      const token = localStorage.getItem("crestline_token");
      await axios.post(
        "http://localhost:5300/user/request-replacement",
        { reason, pin: txnPin },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setShowReplaceModal(false);
      fetchData();
    } catch {
      alert("Request failed. Please try again.");
    }
  };

  const handleSetPin = async ({ oldPin, newPin, txnPin }) => {
    try {
      const token = localStorage.getItem("crestline_token");
      await axios.post(
        "http://localhost:5300/user/set-card-pin",
        { oldPin, newPin, txnPin },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setShowPinSetModal(false);
      fetchData();
    } catch {
      alert("Failed to update PIN. Check your details and try again.");
    }
  };

  return (
    <CrestlineNavbar>
      <div className="p-4 md:p-10 max-w-2xl mx-auto min-h-[90vh] flex flex-col justify-center text-left">
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
                Terminal Home
              </span>
            </button>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
              Crestline<span className="text-blue-500">Card</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-blue-500/5 border border-blue-500/10 px-4 py-2 rounded-2xl text-blue-500">
            <Sparkles size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">
              Premium Issuance
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
            />
          </div>
        ) : card ? (
          <ActiveCardView
            card={card}
            user={user}
            onRequestReplacement={() => setShowReplaceModal(true)}
            onSetPin={() => {
              setPinModalMode("set");
              setShowPinSetModal(true);
            }}
            onChangePin={() => {
              setPinModalMode("change");
              setShowPinSetModal(true);
            }}
          />
        ) : (
          <OrderView user={user} onOrderSuccess={fetchData} />
        )}

        <div className="mt-8 flex items-center justify-center gap-6 opacity-30 grayscale">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} />
            <span className="text-[8px] font-black uppercase tracking-widest">
              PCI-DSS Secure
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Truck size={14} />
            <span className="text-[8px] font-black uppercase tracking-widest">
              3-5 Day Delivery
            </span>
          </div>
        </div>
      </div>

      <ReplaceModal
        isOpen={showReplaceModal}
        onClose={() => setShowReplaceModal(false)}
        onSuccess={handleReplacement}
      />

      <PinSetModal
        isOpen={showPinSetModal}
        isChange={pinModalMode === "change"}
        onClose={() => setShowPinSetModal(false)}
        onSuccess={handleSetPin}
      />
    </CrestlineNavbar>
  );
};

export default CrestlineCard;