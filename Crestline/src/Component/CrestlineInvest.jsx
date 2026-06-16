import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, TrendingUp, BarChart3, PieChart, 
  ArrowUpRight, ShieldCheck, Briefcase, Calculator, ArrowRight, CheckCircle2 
} from 'lucide-react';

// --- Navbar Wrapper ---
import CrestlineNavbar from './CrestlineNavbar'; 
// --- REUSABLE PIN MODAL ---
import CrestlineTransactionPinModal from "./CrestlineTransactionPinModal";

const CrestlineInvest = () => {
  const [selectedVault, setSelectedVault] = useState(null);
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState(12); // Months

  // Security & Transaction States
  const [showPinModal, setShowPinModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const vaults = [
    { id: 'fixed', name: 'Fixed Income', roi: '14%', risk: 'Low', desc: 'Secure government backed bonds.', color: 'text-emerald-500' },
    { id: 'realestate', name: 'Real Estate', roi: '22%', risk: 'Medium', desc: 'Fractional ownership of prime assets.', color: 'text-blue-500' },
    { id: 'stocks', name: 'Global Tech', roi: '35%', risk: 'High', desc: 'High-growth US & EU equities.', color: 'text-purple-500' },
  ];

  // Logic for calculations
  const selectedVaultData = vaults.find(v => v.id === selectedVault);
  const currentROI = selectedVaultData?.roi.replace('%', '') / 100 || 0;
  
  const principal = amount ? parseFloat(amount) : 0;
  const profit = principal * currentROI * (duration / 12);
  const projectedReturn = principal + profit;

  const handleFinalVerify = (pin) => {
    setIsProcessing(true);
    // Simulate API Call
    setTimeout(() => {
      setIsProcessing(false);
      setShowPinModal(false);
      setIsSuccess(true);
      
      // Reset after success
      setTimeout(() => {
        setIsSuccess(false);
        setAmount('');
        setSelectedVault(null);
        setDuration(12);
      }, 3000);
    }, 2000);
  };

  return (
    <CrestlineNavbar>
      <div className="p-4 md:p-10 max-w-2xl mx-auto min-h-[90vh] flex flex-col justify-center text-left">
        
        {/* REUSABLE PIN MODAL */}
        <CrestlineTransactionPinModal 
          isOpen={showPinModal}
          onClose={() => setShowPinModal(false)}
          onConfirm={handleFinalVerify}
          isProcessing={isProcessing}
          title="Confirm Investment"
          subtitle="Authorize Capital Commitment"
          confirmLabel="Commit Capital"
          summaryItems={[
            { label: "Asset Class", value: selectedVaultData?.name },
            { label: "Duration", value: `${duration} Months` },
            { label: "Est. Profit", value: `+₦${profit.toLocaleString()}` },
            { label: "Total Payout", value: `₦${projectedReturn.toLocaleString()}`, highlight: true }
          ]}
        />

        {/* SUCCESS NOTIFICATION */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-black px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl"
            >
              <CheckCircle2 size={18} />
              <span className="text-[11px] font-black uppercase tracking-widest italic">Capital Committed Successfully</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BRANDED HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <button onClick={() => window.history.back()} className="group flex items-center gap-2 text-zinc-600 hover:text-white transition-colors mb-4 text-white">
              <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-blue-600 transition-all">
                <ChevronLeft size={14} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest italic">Wealth Home</span>
            </button>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">
              Crestline<span className="text-blue-500">Invest</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/10 px-4 py-2 rounded-2xl text-emerald-500">
            <TrendingUp size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Market Open</span>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950 border border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden shadow-2xl"
        >
          <div className="space-y-8 relative z-10">
            
            {/* 1. Vault Selection */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2 italic block text-left">Select Asset Class</label>
              <div className="grid grid-cols-1 gap-3">
                {vaults.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVault(v.id)}
                    className={`p-6 rounded-[28px] border text-left transition-all flex items-center justify-between group ${
                      selectedVault === v.id 
                      ? 'bg-blue-600/10 border-blue-500 shadow-xl' 
                      : 'bg-zinc-900 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`p-3 bg-black/40 rounded-2xl ${v.color}`}>
                        <Briefcase size={22} />
                      </div>
                      <div className="text-white">
                        <h4 className="text-sm font-black italic uppercase tracking-tight">{v.name}</h4>
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{v.risk} Risk • {v.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black italic ${v.color}`}>{v.roi}</p>
                      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">Annual ROI</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Capital Input & Duration */}
            <AnimatePresence>
              {selectedVault && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-6 pt-6 border-t border-white/5 overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Capital Injection</label>
                      <input 
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="₦ 0.00"
                        className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-5 text-xl font-black italic outline-none focus:border-blue-500 text-white"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Lock-in Period</label>
                      <select 
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-5 text-sm font-bold outline-none focus:border-blue-500 appearance-none text-white"
                      >
                        <option value={6}>6 Months</option>
                        <option value={12}>12 Months (1 Year)</option>
                        <option value={24}>24 Months (2 Years)</option>
                      </select>
                    </div>
                  </div>

                  {/* 3. Projection Display */}
                  <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="text-center md:text-left">
                        <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                          <Calculator size={14} className="text-blue-500" />
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Projected Value</span>
                        </div>
                        <h3 className="text-3xl font-black italic tracking-tighter text-white">
                          ₦{projectedReturn.toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </h3>
                      </div>
                      <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-600/40 animate-pulse">
                        <ArrowUpRight size={32} />
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full" />
                  </div>

                  <button 
                    onClick={() => setShowPinModal(true)}
                    disabled={!amount || amount <= 0}
                    className="w-full py-6 bg-white text-black rounded-[28px] font-black italic uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all shadow-2xl group active:scale-95 disabled:opacity-20"
                  >
                    Commit Capital <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
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
             <span className="text-[8px] font-black uppercase tracking-widest">SEC Regulated</span>
           </div>
           <div className="flex items-center gap-2 text-blue-500 opacity-100">
             <PieChart size={14} />
             <span className="text-[8px] font-black uppercase tracking-widest">Diversified Assets</span>
           </div>
        </div>
      </div>
    </CrestlineNavbar>
  );
};

export default CrestlineInvest;