import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Trophy, Search, CheckCircle2, 
  Loader2, ArrowRight, ShieldCheck, CreditCard, UserCheck
} from 'lucide-react';
import axios from 'axios';

// --- Navbar Wrapper ---
import CrestlineNavbar from './CrestlineNavbar'; 
// --- REUSABLE PIN MODAL ---
import CrestlineTransactionPinModal from "./CrestlineTransactionPinModal";

const CrestlineSporty = () => {
  const [platform, setPlatform] = useState(null);
  const [customerId, setCustomerId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [accountName, setAccountName] = useState(null);
  const [amount, setAmount] = useState('');

  // Security & Transaction States
  const [showPinModal, setShowPinModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const platforms = [
    { id: 'sportybet', name: 'SportyBet', logo: 'SB', color: 'bg-red-600' },
    { id: 'bet9ja', name: 'Bet9ja', logo: 'B9', color: 'bg-emerald-600' },
    { id: '1xbet', name: '1xBet', logo: '1X', color: 'bg-blue-600' },
    { id: 'betking', name: 'BetKing', logo: 'BK', color: 'bg-zinc-800' },
  ];

  // ⚡ DEBOUNCED MERCHANT CUSTOMER IDENTIFICATION LOOKUP
  useEffect(() => {
    if (!platform || customerId.trim().length < 6) {
      setAccountName(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsVerifying(true);
      setAccountName(null);
      const token = localStorage.getItem('crestline_token');

      try {
        const response = await axios.post('http://localhost:5300/user/sporty-verify', {
          platform,
          customerId: customerId.trim()
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setAccountName(response.data.accountName);
        } else {
          setAccountName(null);
        }
      } catch (err) {
        console.error("Verification error:", err.response?.data?.message);
        setAccountName(null);
      } finally {
        setIsVerifying(false);
      }
    }, 800); // 800ms input window delay throttle

    return () => clearTimeout(delayDebounceFn);
  }, [customerId, platform]);

  // ⚡ LIVE REVENUE CAPITAL DISBURSEMENT DISPATCHER
  const handleFinalVerify = async (pin) => {
    setIsProcessing(true);
    const token = localStorage.getItem('crestline_token');

    try {
      const response = await axios.post('http://localhost:5300/user/sporty-topup', {
        // Logging System Hooks
        action: "Merchant Wallet Funding",
        details: `Funded ₦${Number(amount).toLocaleString()} into ${platform.toUpperCase()} ID: ${customerId} (${accountName}).`,
        reason: "Alternative asset provisioning",

        // Security Identity Dual-Key Setup
        transactionPin: pin,
        authPin: pin,

        // Core Financial Fields
        platform,
        customerId: customerId.trim(),
        accountName,
        amount: Number(amount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setShowPinModal(false);
        setIsSuccess(true);
        
        setTimeout(() => {
          setIsSuccess(false);
          setAmount('');
          setCustomerId('');
          setPlatform(null);
          setAccountName(null);
        }, 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Merchant checkout gateway timeout.");
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedPlatformName = platforms.find(p => p.id === platform)?.name;

  return (
    <CrestlineNavbar>
      <div className="p-4 md:p-10 max-w-2xl mx-auto min-h-[90vh] flex flex-col justify-center">
        
        {/* REUSABLE PIN MODAL */}
        <CrestlineTransactionPinModal 
          isOpen={showPinModal}
          onClose={() => setShowPinModal(false)}
          onConfirm={handleFinalVerify}
          isProcessing={isProcessing}
          title="Confirm Merchant Payout"
          subtitle="Identity Verification Required"
          confirmLabel="Authorize Funding"
          summaryItems={[
            { label: "Merchant", value: selectedPlatformName },
            { label: "User ID", value: customerId },
            { label: "Account Name", value: accountName },
            { label: "Amount", value: `₦${Number(amount).toLocaleString()}`, highlight: true }
          ]}
        />

        {/* SUCCESS TOAST */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-black px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl"
            >
              <CheckCircle2 size={18} />
              <span className="text-[11px] font-black uppercase tracking-widest italic">Merchant Wallet Funded</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BRANDED HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 text-left">
          <div>
            <button 
              onClick={() => window.history.back()}
              className="group flex items-center gap-2 text-zinc-600 hover:text-white transition-colors mb-4 text-white"
            >
              <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-blue-600 transition-all">
                <ChevronLeft size={14} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest italic">Return to Terminal</span>
            </button>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">
              Crestline<span className="text-blue-500">Sporty</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-orange-500/5 border border-orange-500/10 px-4 py-2 rounded-2xl text-orange-500">
            <Trophy size={14} className="animate-bounce" />
            <span className="text-[9px] font-black uppercase tracking-widest">Rapid Funding</span>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-950 border border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-black"
        >
          <div className="space-y-8 relative z-10">
            
            {/* 1. Platform Selector */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2 italic block text-left">Select Merchant</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setPlatform(p.id); setCustomerId(''); setAccountName(null); }}
                    className={`p-4 rounded-2xl flex flex-col items-center gap-2 border transition-all ${
                      platform === p.id 
                      ? `${p.color} border-transparent scale-105 shadow-xl text-white` 
                      : 'bg-zinc-900 border-white/5 text-zinc-600 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xl font-black italic">{p.logo}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Customer ID Input */}
            <AnimatePresence>
              {platform && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2 italic block text-left">Customer / User ID</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-blue-500">
                      <Search size={20} />
                    </div>
                    <input 
                      type="text"
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      placeholder="Enter Account ID"
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-[24px] py-6 pl-14 pr-14 text-2xl font-mono tracking-widest outline-none focus:border-blue-500 text-white"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                      {isVerifying && <Loader2 className="animate-spin text-blue-500" size={20} />}
                      {accountName && <CheckCircle2 className="text-emerald-500" size={20} />}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 3. Verified User & Amount */}
            <AnimatePresence>
              {accountName && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 pt-6 border-t border-white/5"
                >
                  <div className="bg-blue-600/5 border border-blue-500/20 p-5 rounded-3xl flex items-center gap-4">
                    <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                      <UserCheck size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest italic">Merchant Account Name</p>
                      <p className="text-xs font-black uppercase italic tracking-tight text-white">{accountName}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2 italic block text-left">Fund Amount (NGN)</label>
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-zinc-900 border border-white/5 rounded-[24px] p-6 text-3xl font-black italic tracking-tighter outline-none focus:border-blue-500 text-white"
                    />
                  </div>

                  <button 
                    onClick={() => setShowPinModal(true)}
                    disabled={!amount || Number(amount) <= 0 || isVerifying}
                    className="w-full py-6 bg-white text-black rounded-[28px] font-black italic uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all shadow-2xl group disabled:opacity-20"
                  >
                    Authorize Merchant Payout <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>

        {/* Security Footer */}
        <div className="mt-8 flex items-center justify-center gap-6 opacity-30 grayscale text-white">
           <div className="flex items-center gap-2">
             <ShieldCheck size={14} />
             <span className="text-[8px] font-black uppercase tracking-widest">Anti-Fraud Layer</span>
           </div>
           <div className="flex items-center gap-2">
             <CreditCard size={14} />
             <span className="text-[8px] font-black uppercase tracking-widest">Instant Settlement</span>
           </div>
        </div>
      </div>
    </CrestlineNavbar>
  );
};

export default CrestlineSporty;