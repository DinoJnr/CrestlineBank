// ── CrestlineTopUp.jsx ──────────────────────────────────────────────
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Zap, ShieldCheck, 
  ArrowRight, Smartphone, Activity, CheckCircle2 
} from 'lucide-react';
import axios from 'axios';

// --- Navbar Wrapper ---
import CrestlineNavbar from './CrestlineNavbar'; 
// --- REUSABLE PIN MODAL ---
import CrestlineTransactionPinModal from "./CrestlineTransactionPinModal";

const CrestlineTopUp = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [amount, setAmount] = useState('');

  // Security & Transaction States
  const [showPinModal, setShowPinModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const networks = [
    { id: 'mtn', name: 'MTN', color: 'bg-yellow-400', textColor: 'text-black' },
    { id: 'glo', name: 'Glo', color: 'bg-green-600', textColor: 'text-white' },
    { id: 'airtel', name: 'Airtel', color: 'bg-red-600', textColor: 'text-white' },
    { id: '9mobile', name: '9mobile', color: 'bg-emerald-900', textColor: 'text-white' },
  ];

  const quickAmounts = ['100', '200', '500', '1000', '2000', '5000'];

  // ⚡ LIVE PRODUCTION RECHARGE HOOK
// Inside CrestlineTopUp.jsx
const handleFinalVerify = async (pin) => {
  setIsProcessing(true);
  const token = localStorage.getItem('crestline_token');

  try {
    const response = await axios.post('http://localhost:5300/user/airtime-topup', {
      // ⚡ Logger Keys
      action: "Airtime Purchase", 
      details: `Dispatched ₦${amount} ${selectedNetwork.toUpperCase()} airtime to ${phoneNumber}.`,
      reason: "Utility vending",
      
      // 🔐 PIN Keys (Send both to satisfy the controller AND the logger framework)
      transactionPin: pin, // Used by the airtimeTopUp controller validation block
      authPin: pin,        // Used by your standalone saveActivity middleware check if active

      // 📱 Core Financial Business Transaction Payload
      phoneNumber,
      network: selectedNetwork,
      amount: Number(amount),
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      setShowPinModal(false);
      setIsSuccess(true);
      
      // Reset dynamic interface flows after success state display
      setTimeout(() => {
        setIsSuccess(false);
        setAmount('');
        setPhoneNumber('');
        setSelectedNetwork(null);
      }, 3000);
    }
  } catch (err) {
    // This alert will show the exact reason sent by your backend error validation string
    alert(err.response?.data?.message || "Airtime disbursement failed.");
  } finally {
    setIsProcessing(false);
  }
};
  const selectedNetworkName = networks.find(n => n.id === selectedNetwork)?.name;

  return (
    <CrestlineNavbar>
      <div className="p-4 md:p-10 max-w-2xl mx-auto min-h-[90vh] flex flex-col justify-center">
        
        {/* REUSABLE PIN MODAL */}
        <CrestlineTransactionPinModal 
          isOpen={showPinModal}
          onClose={() => setShowPinModal(false)}
          onConfirm={handleFinalVerify}
          isProcessing={isProcessing}
          title="Confirm Airtime Refill"
          subtitle="Biometric & PIN Verification"
          confirmLabel="Authorize Refill"
          summaryItems={[
            { label: "Carrier", value: selectedNetworkName },
            { label: "Recipient", value: phoneNumber },
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
              <span className="text-[11px] font-black uppercase tracking-widest italic">Airtime Refill Successful</span>
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
              <span className="text-[10px] font-black uppercase tracking-widest italic">Terminal Home</span>
            </button>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">
              Crestline<span className="text-blue-500">TopUp</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-blue-500/5 border border-blue-500/10 px-4 py-2 rounded-2xl text-blue-500">
            <Activity size={14} className="animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest">Network Active</span>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-950 border border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden shadow-2xl"
        >
          <div className="space-y-8 relative z-10">
            
            {/* 1. Destination Line */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2 italic block text-left">Recipient Line</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-blue-500 transition-colors">
                  <Smartphone size={20} />
                </div>
                <input 
                  type="tel"
                  maxLength={11}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="080 0000 0000"
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-[24px] py-6 pl-14 pr-6 text-2xl font-mono tracking-[0.2em] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:opacity-5 text-white"
                />
              </div>
            </div>

            {/* 2. Infrastructure (Network) Selector */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2 italic block text-left">Carrier Protocol</label>
              <div className="grid grid-cols-4 gap-3">
                {networks.map((net) => (
                  <button
                    key={net.id}
                    onClick={() => setSelectedNetwork(net.id)}
                    className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-tighter transition-all border ${
                      selectedNetwork === net.id 
                      ? `${net.color} ${net.textColor} border-transparent scale-105 shadow-xl` 
                      : 'bg-zinc-900 border-white/5 text-zinc-600 hover:border-white/20'
                    }`}
                  >
                    {net.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Value Allocation */}
            <AnimatePresence>
              {selectedNetwork && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 pt-4 border-t border-white/5"
                >
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2 italic block text-left">Recharge Value (NGN)</label>
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-zinc-900 border border-white/5 rounded-[24px] p-6 text-4xl font-black italic tracking-tighter outline-none focus:border-blue-500 placeholder:text-zinc-800 text-white"
                    />
                  </div>

                  {/* High-Speed Selection Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {quickAmounts.map((q) => (
                      <button
                        key={q}
                        onClick={() => setAmount(q)}
                        className={`py-3 rounded-xl text-xs font-black italic border transition-all active:scale-95 ${
                          amount === q 
                          ? 'bg-blue-600 border-transparent text-white' 
                          : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'
                        }`}
                      >
                        ₦{q}
                      </button>
                    ))}
                  </div>

                  {/* Execution Button */}
                  <button 
                    onClick={() => setShowPinModal(true)}
                    disabled={!amount || phoneNumber.length < 11}
                    className="w-full py-6 bg-white text-black rounded-[28px] font-black italic uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all shadow-2xl group active:scale-95 disabled:opacity-20"
                  >
                    Authorize Refill <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full" />
        </motion.div>

        {/* Security Footer */}
        <div className="mt-8 flex flex-col items-center gap-2 opacity-30 text-white">
           <div className="flex items-center gap-2">
             <ShieldCheck size={14} className="text-blue-500" />
             <span className="text-[8px] font-black uppercase tracking-[0.4em]">Crestline Protocol Encrypted</span>
           </div>
           <p className="text-[7px] font-bold text-zinc-600 uppercase tracking-widest text-center max-w-[200px]">
             Instant recharge via authorized carrier links only.
           </p>
        </div>
      </div>
    </CrestlineNavbar>
  );
};

export default CrestlineTopUp;