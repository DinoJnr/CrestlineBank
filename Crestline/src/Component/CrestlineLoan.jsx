import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Banknote,
  Calendar,
  Percent,
  Info,
  ArrowRight,
  ShieldCheck,
  Landmark,
  Scale,
  CheckCircle2
} from "lucide-react";

// --- Navbar Wrapper ---
import CrestlineNavbar from "./CrestlineNavbar";
// --- REUSABLE PIN MODAL ---
import CrestlineTransactionPinModal from "./CrestlineTransactionPinModal";

const CrestlineLoan = () => {
  const [loanAmount, setLoanAmount] = useState(50000);
  const [tenure, setTenure] = useState(3); // Months

  // Security & Transaction States
  const [showPinModal, setShowPinModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Constant interest rate (e.g., 5% per month)
  const monthlyRate = 0.05;
  const totalRepayment = loanAmount + loanAmount * monthlyRate * tenure;
  const monthlyInstallment = totalRepayment / tenure;

  const handleFinalVerify = (pin) => {
    setIsProcessing(true);
    // Simulate Credit Check and Approval
    setTimeout(() => {
      setIsProcessing(false);
      setShowPinModal(false);
      setIsSuccess(true);
      
      // Reset after success
      setTimeout(() => {
        setIsSuccess(false);
        setLoanAmount(50000);
        setTenure(3);
      }, 3000);
    }, 2500);
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
          title="Authorize Loan Request"
          subtitle="Legal Capital Commitment"
          confirmLabel="Apply for Loan"
          summaryItems={[
            { label: "Principal", value: `₦${loanAmount.toLocaleString()}` },
            { label: "Tenure", value: `${tenure} Months` },
            { label: "Monthly Due", value: `₦${monthlyInstallment.toLocaleString(undefined, {maximumFractionDigits: 0})}` },
            { label: "Total Repayment", value: `₦${totalRepayment.toLocaleString()}`, highlight: true }
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
              <span className="text-[11px] font-black uppercase tracking-widest italic">Application Submitted for Review</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BRANDED HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <button
              onClick={() => window.history.back()}
              className="group flex items-center gap-2 text-zinc-600 hover:text-white transition-colors mb-4 text-white"
            >
              <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-blue-600 transition-all">
                <ChevronLeft size={14} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest italic">
                Capital Home
              </span>
            </button>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">
              Crestline<span className="text-blue-500">Credit</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-blue-500/5 border border-blue-500/10 px-4 py-2 rounded-2xl text-blue-500">
            <Scale size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">
              Low-Interest Tier
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950 border border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden shadow-2xl"
        >
          <div className="space-y-10 relative z-10">
            {/* 1. Loan Amount Slider */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic block">
                  Request Capital
                </label>
                <span className="text-3xl font-black italic tracking-tighter text-white">
                  ₦{loanAmount.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="1000000"
                step="5000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full h-2 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[8px] font-black text-zinc-700 uppercase tracking-widest">
                <span>Min: ₦5k</span>
                <span>Max: ₦1M</span>
              </div>
            </div>

            {/* 2. Tenure Selection */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic block">
                Repayment Tenure
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[3, 6, 12, 24].map((m) => (
                  <button
                    key={m}
                    onClick={() => setTenure(m)}
                    className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all border ${
                      tenure === m
                        ? "bg-blue-600 border-transparent text-white shadow-lg"
                        : "bg-zinc-900 border-white/5 text-zinc-500 hover:border-white/20"
                    }`}
                  >
                    {m} Months
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Breakdown Summary Card */}
            <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 space-y-6">
              <div className="flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600/10 text-blue-500 rounded-lg">
                    <Percent size={16} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-zinc-400">
                    Monthly Interest
                  </span>
                </div>
                <span className="text-sm font-black italic">5.0%</span>
              </div>

              <div className="flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 text-zinc-400 rounded-lg">
                    <Calendar size={16} />
                  </div>
                  <span className="text-[10px] font-black uppercase text-zinc-400">
                    Monthly Installment
                  </span>
                </div>
                <span className="text-lg font-black italic text-blue-500">
                  ₦
                  {monthlyInstallment.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-between items-center text-white">
                <span className="text-[10px] font-black uppercase italic">
                  Total Repayment
                </span>
                <span className="text-xl font-black italic tracking-tighter">
                  ₦{totalRepayment.toLocaleString()}
                </span>
              </div>
            </div>

            {/* 4. Action Button */}
            <button 
              onClick={() => setShowPinModal(true)}
              className="w-full py-6 bg-white text-black rounded-[28px] font-black italic uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all shadow-2xl group active:scale-95"
            >
              Apply for Capital{" "}
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>

            <div className="flex items-start gap-3 p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
              <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[8px] font-bold text-zinc-500 uppercase leading-relaxed tracking-widest">
                By clicking apply, you authorize Crestline to perform a credit
                check. Loan disbursement is subject to verification.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Security Footer */}
        <div className="mt-8 flex items-center justify-center gap-6 opacity-30 text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} />
            <span className="text-[8px] font-black uppercase tracking-widest">
              CBN Licensed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Landmark size={14} />
            <span className="text-[8px] font-black uppercase tracking-widest">
              Insured by NDIC
            </span>
          </div>
        </div>
      </div>
    </CrestlineNavbar>
  );
};

export default CrestlineLoan;