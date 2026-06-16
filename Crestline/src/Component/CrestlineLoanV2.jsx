import React, { useState, useEffect } from "react"; // Added useEffect tracking hook
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  ChevronLeft, Banknote, Calendar, Percent, Info,
  ArrowRight, ShieldCheck, Landmark, Scale,
  CheckCircle2, AlertCircle, Wallet, Receipt, X, Trash2, Edit3
} from "lucide-react";

import CrestlineNavbar from "./CrestlineNavbar";
import CrestlineTransactionPinModal from "./CrestlineTransactionPinModal";

const CrestlineLoanV2 = () => {
  const [activeTab, setActiveTab] = useState("portfolio");
  const [loanAmount, setLoanAmount] = useState(50000);
  const [tenure, setTenure] = useState(3);

  // Modals & Logic States
  const [showPinModal, setShowPinModal] = useState(false);
  const [managementModal, setManagementModal] = useState(null); 
  const [repayType, setRepayType] = useState("installment"); 
  const [customRepayAmount, setCustomRepayAmount] = useState(""); 
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [actionType, setActionType] = useState(""); 

  // ⚡ START STATE AT NULL (No default fake assumptions)
  const [activeLoan, setActiveLoan] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const monthlyRate = 0.05;
  const totalRepayment = loanAmount + loanAmount * monthlyRate * tenure;
  const monthlyInstallment = totalRepayment / tenure;

  // ⚡ FETCH ACTUAL REAL LOAN STATE FROM DATABASE ON COMPONENT MOUNT
  useEffect(() => {
    const fetchLoanData = async () => {
      const token = localStorage.getItem('crestline_token');
      try {
        const response = await axios.get('http://localhost:5300/user/loan-state', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setActiveLoan(response.data.activeLoan);
          // If no active debt structure exists, switch presentation to exploration view natively
          if (!response.data.activeLoan) {
            setActiveTab("explore");
          }
        }
      } catch (err) {
        console.error("Profile state tracking integration block mismatch", err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchLoanData();
  }, []);

  const getPaymentValue = () => {
    if (managementModal === 'extend') return 2500;
    if (repayType === 'full') return activeLoan?.balance || 0;
    if (repayType === 'installment') return activeLoan?.installment || 0;
    return Number(customRepayAmount) || 0;
  };

  const initiateAuth = (type) => {
    const finalAmount = getPaymentValue();
    if (type === 'repay' && finalAmount <= 0) {
      alert("Please enter a valid amount greater than 0.");
      return;
    }
    if (type === 'repay' && finalAmount > (activeLoan?.balance || 0)) {
      alert("Payment value cannot exceed your current outstanding loan balance.");
      return;
    }
    setActionType(type);
    setManagementModal(null);
    setShowPinModal(true);
  };

  const handleFinalVerify = async (pin) => {
    setIsProcessing(true);
    const paymentValue = getPaymentValue();
    const token = localStorage.getItem('crestline_token');

    try {
      let response;

      if (actionType === 'new_loan') {
        response = await axios.post('http://localhost:5300/user/loan-request', {
          principal: loanAmount,
          tenure: tenure,
          transactionPin: pin
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setActiveLoan(response.data.activeLoan);
          setSuccessMsg("Capital Disbursed Successfully");
        }
      } 
      else if (actionType === 'repay') {
        response = await axios.post('http://localhost:5300/user/loan-repay', {
          loanId: activeLoan.id,
          amount: paymentValue,
          repayType: repayType,
          transactionPin: pin
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setActiveLoan(response.data.activeLoan); 
          setSuccessMsg(response.data.message || "Repayment Processed");
          setCustomRepayAmount("");
        }
      } 
      else if (actionType === 'extend') {
        response = await axios.post('http://localhost:5300/user/loan-extend', {
          loanId: activeLoan.id,
          transactionPin: pin
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setSuccessMsg("Tenure Extended by 30 Days");
          if (response.data.nextDue) {
            setActiveLoan(prev => ({ ...prev, nextDue: response.data.nextDue }));
          }
        }
      }

      setShowPinModal(false);
      setIsSuccess(true);
      setTimeout(() => { setIsSuccess(false); setActiveTab("portfolio"); }, 2500);

    } catch (err) {
      alert(err.response?.data?.message || "An asset pipeline processing breakdown occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Global Loading Protection Screen while verification fetches
  if (isLoadingProfile) {
    return (
      <CrestlineNavbar>
        <div className="min-h-[90vh] flex flex-col items-center justify-center bg-black text-zinc-500 font-black tracking-widest uppercase italic text-[11px]">
          Syncing Credit Parameters...
        </div>
      </CrestlineNavbar>
    );
  }

  return (
    <CrestlineNavbar>
      <div className="p-4 md:p-10 max-w-2xl mx-auto min-h-[90vh] flex flex-col text-left">
        
        {/* SUCCESS NOTIFICATION */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl"
            >
              <CheckCircle2 size={18} />
              <span className="text-[11px] font-black uppercase tracking-widest italic">{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* REPAYMENT / EXTENSION MODAL */}
        <AnimatePresence>
          {managementModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setManagementModal(null)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative bg-zinc-950 border border-white/10 w-full max-w-md rounded-[40px] p-8 shadow-2xl overflow-hidden">
                
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">
                    {managementModal === 'repay' ? 'Loan Settlement' : 'Extend Tenure'}
                  </h3>
                  <button onClick={() => setManagementModal(null)} className="p-2 bg-white/5 rounded-full text-zinc-500"><X size={18}/></button>
                </div>

                {managementModal === 'repay' ? (
                  <div className="space-y-6 mb-8">
                    
                    {/* QUICK TOGGLE OPTIONS */}
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        type="button"
                        onClick={() => { setRepayType('installment'); setCustomRepayAmount(""); }} 
                        className={`p-3 rounded-xl border text-center transition-all ${repayType === 'installment' ? 'bg-blue-600 border-transparent text-white' : 'bg-white/5 border-white/5 text-zinc-400'}`}
                      >
                        <p className="text-[8px] font-black uppercase tracking-wider block mb-0.5">Next Due</p>
                        <p className="text-[11px] font-black italic">₦{activeLoan?.installment.toLocaleString()}</p>
                      </button>

                      <button 
                        type="button"
                        onClick={() => { setRepayType('full'); setCustomRepayAmount(""); }} 
                        className={`p-3 rounded-xl border text-center transition-all ${repayType === 'full' ? 'bg-emerald-600 border-transparent text-white' : 'bg-white/5 border-white/5 text-zinc-400'}`}
                      >
                        <p className="text-[8px] font-black uppercase tracking-wider block mb-0.5">Full Pay</p>
                        <p className="text-[11px] font-black italic">₦{activeLoan?.balance.toLocaleString()}</p>
                      </button>

                      <button 
                        type="button"
                        onClick={() => { setRepayType('custom'); setCustomRepayAmount(String(activeLoan?.installment)); }} 
                        className={`p-3 rounded-xl border text-center transition-all ${repayType === 'custom' ? 'bg-zinc-100 border-transparent text-black' : 'bg-white/5 border-white/5 text-zinc-400'}`}
                      >
                        <p className="text-[8px] font-black uppercase tracking-wider block mb-0.5">Custom</p>
                        <p className="text-[11px] font-black italic">Variable</p>
                      </button>
                    </div>

                    {/* DYNAMIC SETTLEMENT VALUE INPUT FIELD */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1 block">Payment Value (₦)</label>
                      <div className="relative">
                        <input 
                          type="text"
                          inputMode="numeric"
                          disabled={repayType !== 'custom'}
                          value={repayType === 'installment' ? activeLoan?.installment : repayType === 'full' ? activeLoan?.balance : customRepayAmount}
                          onChange={(e) => setCustomRepayAmount(e.target.value.replace(/\D/g, ""))}
                          placeholder="Enter payment structure value"
                          className={`w-full bg-zinc-900 border rounded-2xl p-5 pl-12 font-mono text-xl font-bold tracking-wide outline-none text-white ${repayType === 'custom' ? 'border-zinc-500 focus:border-white' : 'border-white/5 opacity-60 cursor-not-allowed'}`}
                        />
                        <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        {repayType === 'custom' && (
                          <Edit3 className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 animate-pulse" size={16} />
                        )}
                      </div>
                      <p className="text-[9px] font-medium text-zinc-500 italic px-1">
                        {repayType === 'custom' ? "Type any preferred settlement amount above." : "Pill selections auto-fill and lock standard values. Switch to 'Custom' to edit."}
                      </p>
                    </div>

                    <p className="text-[9px] font-bold text-zinc-600 uppercase text-center italic tracking-widest mt-2">
                      Any payment reduces outstanding interest balances immediately.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 mb-8">
                    <div className="bg-white/5 p-8 rounded-[32px] border border-white/5 text-center">
                       <p className="text-[10px] font-black text-zinc-500 uppercase mb-2">30-Day Extension Fee</p>
                       <p className="text-4xl font-black italic text-white">₦2,500</p>
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => initiateAuth(managementModal)} 
                  disabled={managementModal === 'repay' && repayType === 'custom' && (!customRepayAmount || Number(customRepayAmount) <= 0)}
                  className="w-full py-6 bg-white text-black rounded-[28px] font-black italic uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl disabled:opacity-20"
                >
                  Confirm ₦{getPaymentValue().toLocaleString()}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* BRANDED HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <button onClick={() => window.history.back()} className="group flex items-center gap-2 text-zinc-600 hover:text-white transition-colors mb-4 text-white">
              <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-blue-600 transition-all">
                <ChevronLeft size={14} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest italic text-zinc-400">Credit Terminal</span>
            </button>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">
              Crestline<span className="text-blue-500">Credit</span>
            </h1>
          </div>
          <div className="flex bg-zinc-900 p-1 rounded-2xl border border-white/5">
            {['portfolio', 'explore'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${activeTab === tab ? "bg-blue-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"}`}>
                {tab === 'portfolio' ? 'Active Loan' : 'New Loan'}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "portfolio" ? (
          <div className="space-y-6">
            {activeLoan ? (
              <>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-950 border border-white/10 rounded-[40px] p-8 relative overflow-hidden shadow-2xl">
                  <div className="relative z-10 space-y-8">
                    <div className="flex justify-between items-center text-left">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 italic">Outstanding Balance</p>
                          <h2 className="text-5xl font-black italic tracking-tighter text-white">₦{activeLoan.balance.toLocaleString()}</h2>
                       </div>
                       <div className="h-14 w-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20"><Banknote size={28} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5 text-left">
                       <div>
                          <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-1">Monthly Installment</p>
                          <p className="text-xl font-black italic text-white">₦{activeLoan.installment.toLocaleString()}</p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-1">Next Due</p>
                          <p className="text-xl font-black italic text-blue-500">{activeLoan.nextDue}</p>
                       </div>
                    </div>
                  </div>
                </motion.div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic px-2">Action Terminal</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <button onClick={() => setManagementModal('repay')} className="bg-white text-black p-6 rounded-[32px] font-black italic uppercase tracking-widest flex items-center justify-between group">
                      <span>Settle Balance</span>
                      <Wallet size={20} className="group-hover:scale-110 transition-transform"/>
                    </button>
                    <button onClick={() => setManagementModal('extend')} className="bg-zinc-900 border border-white/5 text-white p-6 rounded-[32px] font-black italic uppercase tracking-widest flex items-center justify-between hover:bg-zinc-800 transition-all">
                      <span>Extend Tenure</span>
                      <Receipt size={20} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center flex flex-col items-center opacity-30 grayscale italic">
                <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mb-4"><ShieldCheck size={40} /></div>
                <p className="text-[10px] font-black uppercase tracking-widest">Credit Line Clear & Available</p>
                <button onClick={() => setActiveTab('explore')} className="mt-6 text-blue-500 font-black uppercase text-[10px] underline underline-offset-4 tracking-widest italic opacity-100 grayscale-0">Request New Capital</button>
              </motion.div>
            )}
          </div>
        ) : (
          /* NEW LOAN TAB */
          <div className="space-y-6">
            {activeLoan ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-500/5 border border-red-500/20 rounded-[40px] p-10 flex flex-col items-center text-center space-y-6">
                <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500"><AlertCircle size={40} /></div>
                <div>
                  <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">Existing Debt Detected</h3>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase mt-2 max-w-[250px] leading-relaxed">
                    Borrowing is locked. Please settle your current ₦{activeLoan.balance.toLocaleString()} balance to re-enable credit.
                  </p>
                </div>
                <button onClick={() => setActiveTab('portfolio')} className="px-8 py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-red-500/20">Go to Settlement</button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-950 border border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden shadow-2xl text-left">
                <div className="space-y-10">
                  <div className="space-y-6">
                    <div className="flex justify-between items-end"><label className="text-[10px] font-black uppercase text-zinc-500 italic block">Amount Needed</label><span className="text-3xl font-black italic text-white">₦{loanAmount.toLocaleString()}</span></div>
                    <input type="range" min="5000" max="1000000" step="5000" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="w-full h-2 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-zinc-500 italic block">Repayment Tenure</label>
                    <div className="grid grid-cols-4 gap-3">
                      {[3, 6, 12, 24].map((m) => (
                        <button key={m} onClick={() => setTenure(m)} className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all border ${tenure === m ? "bg-blue-600 border-transparent text-white shadow-lg" : "bg-zinc-900 border-white/5 text-zinc-500"}`}>{m} Months</button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 space-y-6">
                    <div className="flex justify-between items-center text-white"><span className="text-[10px] font-black uppercase text-zinc-400">Monthly Installment</span><span className="text-lg font-black italic text-blue-500">₦{monthlyInstallment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
                    <div className="pt-4 border-t border-white/5 flex justify-between items-center text-white"><span className="text-[10px] font-black uppercase italic">Total Commitment</span><span className="text-xl font-black italic">₦{totalRepayment.toLocaleString()}</span></div>
                  </div>
                  <button onClick={() => initiateAuth('new_loan')} className="w-full py-6 bg-white text-black rounded-[28px] font-black italic uppercase flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all group">Request Capital <ArrowRight size={20} className="group-hover:translate-x-1" /></button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        <CrestlineTransactionPinModal 
          isOpen={showPinModal}
          onClose={() => setShowPinModal(false)}
          onConfirm={handleFinalVerify}
          isProcessing={isProcessing}
          title={actionType === 'repay' ? 'Authorize Repayment' : actionType === 'extend' ? 'Authorize Extension' : 'Authorize Credit'}
          subtitle="Legal Capital Commitment"
          confirmLabel={actionType === 'repay' ? 'Execute Payment' : actionType === 'extend' ? 'Pay Fee' : 'Apply for Loan'}
          summaryItems={actionType === 'new_loan' ? [
            { label: "Principal", value: `₦${loanAmount.toLocaleString()}` },
            { label: "Installment", value: `₦${monthlyInstallment.toLocaleString(undefined, {maximumFractionDigits: 0})}` },
            { label: "Total Repayment", value: `₦${totalRepayment.toLocaleString()}`, highlight: true }
          ] : [
            { label: "Repayment Type", value: actionType === 'extend' ? 'Tenure Extension' : (repayType === 'full' ? 'Full Settlement' : repayType === 'installment' ? 'Monthly Installment' : 'Custom Partial Settlement') },
            { label: "Asset ID", value: activeLoan?.id },
            { label: "Amount Due", value: `₦${getPaymentValue().toLocaleString()}`, highlight: true }
          ]}
        />
      </div>
    </CrestlineNavbar>
  );
};

export default CrestlineLoanV2;