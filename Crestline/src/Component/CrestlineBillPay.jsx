import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Tv, Lightbulb, ShieldCheck, 
  ArrowRight, Search, Loader2, CheckCircle2, ListFilter
} from 'lucide-react';
import axios from 'axios';

// --- Navbar Wrapper ---
import CrestlineNavbar from './CrestlineNavbar'; 
// --- REUSABLE PIN MODAL ---
import CrestlineTransactionPinModal from "./CrestlineTransactionPinModal";

const CrestlineBillPay = () => {
  const [category, setCategory] = useState("");
  const [biller, setBiller] = useState("");
  const [packagePlan, setPackagePlan] = useState("");
  const [idNumber, setIdNumber] = useState("");
  
  // Verification & Processing States
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Data Architecture
  const categories = [
    { id: 'cable', name: 'Cable Television', icon: <Tv size={18} /> },
    { id: 'power', name: 'Electricity / Power', icon: <Lightbulb size={18} /> },
  ];

  const billers = {
    cable: ['DSTV', 'Gotv', 'StarTimes'],
    power: ['Ikeja Electric', 'Eko Electric', 'PHED'],
  };

  const plans = {
    DSTV: ['DSTV Premium - ₦29,500', 'DSTV Compact Plus - ₦19,800', 'DSTV Confam - ₦9,300'],
    Gotv: ['Gotv Supa - ₦6,400', 'Gotv Max - ₦4,850', 'Gotv Joli - ₦3,300'],
    StarTimes: ['StarTimes Nova - ₦1,500', 'StarTimes Smart - ₦3,500', 'StarTimes Super - ₦6,500'],
    'Ikeja Electric': ['Prepaid Meter - ₦5,000', 'Prepaid Meter - ₦10,000', 'Prepaid Meter - ₦20,000', 'Postpaid Assessment - ₦15,000'],
    'Eko Electric': ['Prepaid Units - ₦5,000', 'Prepaid Units - ₦10,000', 'Postpaid Settlement - ₦25,000'],
    'PHED': ['Prepaid Token - ₦5,000', 'Prepaid Token - ₦10,000', 'Postpaid Token - ₦20,000'],
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setBiller("");
    setPackagePlan("");
    setIdNumber("");
    setVerifiedName(null);
  };

  const handleBillerChange = (e) => {
    setBiller(e.target.value);
    setPackagePlan("");
    setIdNumber("");
    setVerifiedName(null);
  };

  // ⚡ DEBOUNCED UTILITY CUSTOMER ID PARSER VERIFICATION LOOKUP
  useEffect(() => {
    if (!category || !biller || idNumber.trim().length < 8) {
      setVerifiedName(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsVerifying(true);
      setVerifiedName(null);
      const token = localStorage.getItem('crestline_token');

      try {
        const response = await axios.post('http://localhost:5300/user/bill-verify', {
          category,
          biller,
          idNumber: idNumber.trim()
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setVerifiedName(response.data.customerName);
        } else {
          setVerifiedName(null);
        }
      } catch (err) {
        console.error("Utility validation trace failed:", err.response?.data?.message);
        setVerifiedName(null);
      } finally {
        setIsVerifying(false);
      }
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [idNumber, biller, category]);

  // ⚡ LIVE REVENUE TRANSACTION DISPATCHER
  const handleFinalVerify = async (pin) => {
    setIsProcessing(true);
    const token = localStorage.getItem('crestline_token');

    // Extract structural pricing values cleanly (e.g. "DSTV Premium - ₦29,500" -> 29500)
    const rawPriceString = packagePlan.split(' - ₦')[1] || "0";
    const numericAmount = Number(rawPriceString.replace(/,/g, ''));
    const cleanPlanName = packagePlan.split(' - ')[0];

    try {
      const response = await axios.post('http://localhost:5300/user/bill-pay', {
        // Logging Layer Framework Metadata Injection
        action: "Utility Bill Payment",
        details: `Settled ${biller} ${cleanPlanName} subscription for Account ID: ${idNumber} (${verifiedName}).`,
        reason: "Utility value provisioning",

        // Security Authentication Verification Handshake Keys
        transactionPin: pin,
        authPin: pin,

        // Core Financial Fields
        category,
        biller,
        packagePlan: cleanPlanName,
        idNumber: idNumber.trim(),
        customerName: verifiedName,
        amount: numericAmount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setShowPinModal(false);
        setIsSuccess(true);
        
        setTimeout(() => {
          setIsSuccess(false);
          setCategory("");
          setBiller("");
          setPackagePlan("");
          setIdNumber("");
          setVerifiedName(null);
        }, 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Utility settlement pipeline error.");
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
          title="Confirm Payment"
          subtitle="Authorize Utility Settlement"
          confirmLabel="Pay Now"
          summaryItems={[
            { label: "Biller", value: biller },
            { label: "Package", value: packagePlan.split(' - ')[0] },
            { label: "ID Number", value: idNumber },
            { label: "Customer", value: verifiedName },
            { label: "Amount", value: packagePlan.split(' - ')[1] || "Flexible", highlight: true }
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
              <span className="text-[11px] font-black uppercase tracking-widest italic">Payment Successful</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="text-left">
            <button onClick={() => window.history.back()} className="group flex items-center gap-2 text-zinc-600 hover:text-white transition-colors mb-4">
              <ChevronLeft size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest italic">Return</span>
            </button>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
              Crestline<span className="text-blue-500">BillPay</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-blue-500/5 border border-blue-500/10 px-4 py-2 rounded-2xl text-blue-500">
            <ListFilter size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest text-center">Certified Merchant Link</span>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950 border border-white/5 rounded-[40px] p-8 md:p-12 relative shadow-2xl"
        >
          <div className="space-y-8 relative z-10">
            
            {/* 1. Category */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2 italic text-left block">Utility Category</label>
              <select 
                value={category}
                onChange={handleCategoryChange}
                className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-5 text-sm font-bold appearance-none outline-none focus:border-blue-500 text-white"
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* 2. Biller */}
            <AnimatePresence>
              {category && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 overflow-hidden">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2 italic text-left block">Merchant / Biller</label>
                  <select 
                    value={biller}
                    onChange={handleBillerChange}
                    className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-5 text-sm font-bold appearance-none outline-none focus:border-blue-500 text-white"
                  >
                    <option value="">Select Biller</option>
                    {billers[category].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 3. Package */}
            <AnimatePresence>
              {biller && plans[biller] && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 overflow-hidden">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2 italic text-left block">Select Package</label>
                  <select 
                    value={packagePlan}
                    onChange={(e) => { setPackagePlan(e.target.value); setIdNumber(""); setVerifiedName(null); }}
                    className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-5 text-sm font-bold appearance-none outline-none focus:border-blue-500 text-white"
                  >
                    <option value="">Select Plan</option>
                    {plans[biller].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 4. Validation */}
            <AnimatePresence>
              {packagePlan && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6 overflow-hidden">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2 italic text-left block">
                      {category === 'cable' ? 'SmartCard Number' : 'Meter Number'}
                    </label>
                    <div className="relative group">
                      <input 
                        type="text"
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter Identification Serial"
                        className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-5 pl-14 font-mono text-lg tracking-widest outline-none focus:border-blue-500 text-white"
                      />
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                      <div className="absolute right-5 top-1/2 -translate-y-1/2">
                        {isVerifying && <Loader2 className="animate-spin text-blue-500" size={20} />}
                        {verifiedName && <CheckCircle2 className="text-emerald-500" size={20} />}
                      </div>
                    </div>
                  </div>

                  {verifiedName && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-blue-600/5 border border-blue-500/20 p-5 rounded-3xl text-left">
                       <p className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em] italic mb-1">Authenticated Account</p>
                       <p className="text-sm font-black uppercase italic tracking-tighter text-white">{verifiedName}</p>
                    </motion.div>
                  )}

                  <button 
                    onClick={() => setShowPinModal(true)}
                    disabled={!verifiedName || isVerifying}
                    className="w-full py-6 bg-white text-black rounded-[28px] font-black italic uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all shadow-2xl disabled:opacity-20 group"
                  >
                    Authorize Payment <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>

        <p className="mt-8 text-center text-[9px] font-black uppercase tracking-[0.4em] text-zinc-800 italic">
          Authorized Payment Settlement Hub
        </p>
      </div>
    </CrestlineNavbar>
  );
};

export default CrestlineBillPay;