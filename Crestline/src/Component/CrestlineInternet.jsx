import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Globe, Wifi, ShieldCheck, 
  ArrowRight, Smartphone, CheckCircle2, Zap 
} from 'lucide-react';
import axios from 'axios';

// --- Navbar Wrapper ---
import CrestlineNavbar from './CrestlineNavbar'; 
// --- REUSABLE PIN MODAL ---
import CrestlineTransactionPinModal from "./CrestlineTransactionPinModal";

const CrestlineInternet = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [validityFilter, setValidityFilter] = useState('Monthly');
  const [selectedPlanId, setSelectedPlanId] = useState(null);

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

  const categories = ['Daily', 'Weekly', 'Monthly', '3-Month'];

  const bundles = {
    'Daily': [
      { id: 1, size: '1GB', price: '500', label: 'Daily Heavy' },
      { id: 2, size: '2.5GB', price: '750', label: 'Daily Max' },
    ],
    'Weekly': [
      { id: 3, size: '1.5GB', price: '1,000', label: 'Weekly Lite' },
      { id: 4, size: '6GB', price: '2,500', label: 'Weekly Pro' },
    ],
    'Monthly': [
      { id: 5, size: '12GB', price: '4,000', label: 'Standard Monthly' },
      { id: 6, size: '25GB', price: '6,500', label: 'Premium Monthly' },
      { id: 7, size: '40GB', price: '10,000', label: 'Corporate Monthly' },
    ],
    '3-Month': [
      { id: 8, size: '150GB', price: '30,000', label: 'Quarterly Core' },
      { id: 9, size: '480GB', price: '90,000', label: 'Quarterly Ultra' },
    ]
  };

  const getSelectedBundle = () => {
    return bundles[validityFilter].find(b => b.id === selectedPlanId);
  };

  // ⚡ LIVE PRODUCTION DATA LINK DISPATCHER
  const handleFinalVerify = async (pin) => {
    setIsProcessing(true);
    const token = localStorage.getItem('crestline_token');
    const targetBundle = getSelectedBundle();

    if (!targetBundle) {
      alert("Invalid bundle state selection.");
      setIsProcessing(false);
      return;
    }

    // Clean comma symbols from prices (e.g. "1,000" -> 1000) for strict mathematical logic
    const numericPrice = Number(targetBundle.price.replace(/,/g, ''));

    try {
      const response = await axios.post('http://localhost:5300/user/data-topup', {
        // Logger Context Handshaking
        action: "Data Bundle Purchase",
        details: `Provisioned ${targetBundle.size} ${selectedNetwork.toUpperCase()} package (${validityFilter}) to ${phoneNumber}.`,
        reason: "Telecom asset provisioning",

        // Authentication Framework Dual-Keys
        transactionPin: pin,
        authPin: pin,

        // Financial Core Parameters
        phoneNumber,
        network: selectedNetwork,
        amount: numericPrice,
        planSize: targetBundle.size,
        planValidity: validityFilter
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setShowPinModal(false);
        setIsSuccess(true);
        
        setTimeout(() => {
          setIsSuccess(false);
          setPhoneNumber('');
          setSelectedNetwork(null);
          setSelectedPlanId(null);
        }, 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Data pipeline network drop detected.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <CrestlineNavbar>
      <div className="p-4 md:p-10 max-w-2xl mx-auto min-h-[90vh] flex flex-col justify-center">
        
        {/* REUSABLE PIN MODAL */}
        <CrestlineTransactionPinModal 
          isOpen={showPinModal}
          onClose={() => setShowPinModal(false)}
          onConfirm={handleFinalVerify}
          isProcessing={isProcessing}
          title="Confirm Data Purchase"
          subtitle="Identity Verification Required"
          summaryItems={[
            { label: "Target Line", value: phoneNumber },
            { label: "Network", value: selectedNetwork?.toUpperCase() },
            { label: "Data Plan", value: `${getSelectedBundle()?.size} (${validityFilter})` },
            { label: "Price", value: `₦${getSelectedBundle()?.price}`, highlight: true }
          ]}
        />

        {/* SUCCESS TOAST */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-black px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl shadow-emerald-500/20"
            >
              <CheckCircle2 size={18} />
              <span className="text-[11px] font-black uppercase tracking-widest italic">Data Link Secured</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <button onClick={() => window.history.back()} className="group flex items-center gap-2 text-zinc-600 hover:text-white transition-colors mb-4 text-white">
              <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-blue-600 transition-colors"><ChevronLeft size={14} /></div>
              <span className="text-[10px] font-black uppercase tracking-widest italic">Terminal Home</span>
            </button>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">
              Crestline<span className="text-blue-500">Internet</span>
            </h1>
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl">
             <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest italic mb-1">System Node Status</p>
             <p className="text-sm font-black italic tracking-tighter text-emerald-500 flex items-center gap-1.5">
               <Zap size={12} className="fill-emerald-500" /> OPERATIONAL
             </p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-950 border border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden shadow-2xl">
          <div className="space-y-8 relative z-10">
            
            {/* Step 1: Destination & Network */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Destination Line</label>
                  <input 
                    type="tel" maxLength={11}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="080..." 
                    className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-5 font-mono text-lg tracking-widest outline-none focus:border-blue-500 text-white" 
                  />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Network Protocol</label>
                  <div className="flex gap-2">
                    {networks.map(n => (
                      <button 
                        key={n.id} 
                        onClick={() => setSelectedNetwork(n.id)}
                        className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase transition-all border ${selectedNetwork === n.id ? n.color + ' ' + n.textColor + ' border-transparent' : 'bg-zinc-900 text-zinc-600 border-white/5'}`}
                      >
                        {n.name}
                      </button>
                    ))}
                  </div>
               </div>
            </div>

            {/* Step 2: Validity Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setValidityFilter(cat); setSelectedPlanId(null); }}
                  className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${validityFilter === cat ? 'bg-blue-600 text-white' : 'bg-white/5 text-zinc-500 border border-white/5 hover:border-white/20'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Step 3: Bundle Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence mode='wait'>
                {bundles[validityFilter].map((bundle) => (
                  <motion.button
                    key={bundle.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setSelectedPlanId(bundle.id)}
                    className={`relative p-6 rounded-[28px] border text-left transition-all ${selectedPlanId === bundle.id ? 'bg-blue-600/10 border-blue-500 shadow-xl shadow-blue-600/10' : 'bg-zinc-900 border-white/5 hover:border-white/10'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2 rounded-lg ${selectedPlanId === bundle.id ? 'bg-blue-500 text-white' : 'bg-black/30 text-blue-500'}`}><Wifi size={18} /></div>
                      {selectedPlanId === bundle.id && <CheckCircle2 size={20} className="text-blue-500" />}
                    </div>
                    <p className="text-2xl font-black italic tracking-tighter uppercase mb-1 text-white">{bundle.size}</p>
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-4">{bundle.label}</p>
                    <div className="flex items-center justify-between mt-auto">
                       <span className="text-lg font-black italic text-white">₦{bundle.price}</span>
                       <span className="text-[8px] font-black uppercase text-zinc-600 italic">{validityFilter}</span>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {/* Step 4: Final Execution */}
            <button 
              onClick={() => setShowPinModal(true)}
              disabled={!selectedPlanId || !selectedNetwork || phoneNumber.length < 11}
              className="w-full py-6 bg-white text-black rounded-[28px] font-black italic uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all shadow-2xl disabled:opacity-20 group"
            >
              Initialize Data Link <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

          </div>
        </motion.div>

        {/* Security Footer */}
        <div className="mt-8 flex items-center justify-center gap-4 opacity-20 text-white">
           <Globe size={14} />
           <span className="text-[8px] font-black uppercase tracking-[0.4em]">Global Connectivity Backbone Active</span>
        </div>
      </div>
    </CrestlineNavbar>
  );
};

export default CrestlineInternet;