import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, FileText, CheckCircle2, XCircle, 
  Percent, Clock, Scale, Wallet, AlertCircle,
  Briefcase, ShieldAlert, Zap, Download
} from "lucide-react";
// import CrestlineAdminLayout from "./CrestlineAdminLayout";
import CrestlineStaffLayout from "./CrestlineStaffLayout";

const CrestlineLoanProcessing = () => {
  const navigate = useNavigate();
  const [processingStatus, setProcessingStatus] = useState("pending");

  const loanRequest = {
    id: "LOAN-2024-9981",
    customer: "Chidi Okoro",
    account: "0123456789",
    type: "Business Expansion Loan",
    amount: 2500000.00,
    tenure: "18 Months",
    interestRate: "12.5%",
    monthlyRepayment: 153472.22,
    purpose: "Procurement of inventory for electronics retail outlet in Ikeja.",
    creditScore: 742,
    riskLevel: "Low-Medium",
    collateral: "Fixed Asset (Commercial Property)",
    documents: [
      { name: "Business_Registration.pdf", size: "1.2MB" },
      { name: "Bank_Statement_6Months.pdf", size: "4.5MB" },
      { name: "Collateral_Valuation.pdf", size: "2.1MB" }
    ]
  };

  const MetricCard = ({ label, value, icon: Icon, color = "teal" }) => (
    <div className="bg-white border border-teal-900/5 p-6 rounded-[32px] hover:shadow-lg transition-all">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 bg-${color}-50 text-${color}-600`}>
        <Icon size={20} />
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-teal-950 mt-1 italic tracking-tighter">{value}</p>
    </div>
  );

  return (
    <CrestlineStaffLayout>
      <div className="max-w-7xl mx-auto space-y-8 text-left pb-20">
        
        {/* --- DYNAMIC HEADER --- */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-teal-950 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          
          <div className="flex items-center gap-6 relative z-10">
            <button 
              onClick={() => navigate(-1)}
              className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-white hover:text-teal-950 transition-all shadow-xl"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Loan Processing</h1>
                <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                  Awaiting Approval
                </div>
              </div>
              <p className="text-xs font-bold text-teal-400/60 uppercase tracking-widest flex items-center gap-2">
                Reference: {loanRequest.id} • Applicant: {loanRequest.customer}
              </p>
            </div>
          </div>

          <div className="text-right relative z-10">
            <p className="text-[9px] font-bold text-teal-400 uppercase tracking-[0.2em] mb-1">Requested Principal</p>
            <h2 className="text-5xl font-black text-white tracking-tighter">
              ₦{loanRequest.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
          </div>
        </div>

        {/* --- ANALYTICS HUD --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard label="Credit Score" value={loanRequest.creditScore} icon={Zap} color="emerald" />
          <MetricCard label="Interest Rate" value={loanRequest.interestRate} icon={Percent} color="teal" />
          <MetricCard label="Tenure Period" value={loanRequest.tenure} icon={Clock} color="orange" />
          <MetricCard label="Monthly EMI" value={`₦${loanRequest.monthlyRepayment.toLocaleString()}`} icon={Wallet} color="blue" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[40px] border border-teal-900/5 shadow-sm">
              <div className="flex items-center gap-2 mb-6 border-b border-teal-50 pb-4">
                <FileText className="text-teal-600" size={18} />
                <h3 className="text-xs font-black uppercase tracking-widest text-teal-900">Application Memorandum</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-teal-900/40 uppercase mb-2">Loan Purpose & Justification</p>
                  <p className="text-sm font-bold text-teal-950 leading-relaxed italic">
                    "{loanRequest.purpose}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-teal-50">
                  <div>
                    <p className="text-[10px] font-black text-teal-900/40 uppercase mb-1">Repayment Source</p>
                    <p className="text-sm font-black text-teal-950 uppercase">Business Cashflow</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-teal-900/40 uppercase mb-1">Collateral Node</p>
                    <p className="text-sm font-black text-teal-950 uppercase">{loanRequest.collateral}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Vault */}
            <div className="bg-white p-8 rounded-[40px] border border-teal-900/5 shadow-sm">
              <div className="flex items-center gap-2 mb-6 border-b border-teal-50 pb-4">
                <ShieldAlert className="text-teal-600" size={18} />
                <h3 className="text-xs font-black uppercase tracking-widest text-teal-900">Document Verification Vault</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {loanRequest.documents.map((doc, idx) => (
                  <div key={idx} className="p-4 bg-teal-50/50 border border-teal-900/5 rounded-2xl group hover:bg-teal-950 transition-all cursor-pointer">
                    <div className="flex flex-col items-center text-center">
                      <FileText size={24} className="text-teal-600 mb-2 group-hover:text-white" />
                      <p className="text-[10px] font-black text-teal-950 uppercase truncate w-full group-hover:text-white">{doc.name}</p>
                      <p className="text-[9px] font-bold text-teal-900/40 group-hover:text-teal-400">{doc.size}</p>
                      <Download size={14} className="mt-3 text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Decision Terminal */}
          <div className="space-y-6">
            <div className="bg-teal-950 p-8 rounded-[40px] shadow-2xl sticky top-6">
              <div className="flex items-center gap-2 mb-8">
                <Scale className="text-teal-400" size={20} />
                <h3 className="text-white text-lg font-black italic uppercase tracking-tighter">Underwriting Terminal</h3>
              </div>
              
              <div className="space-y-4 mb-10">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[9px] font-black text-teal-400 uppercase mb-1">Debt-to-Income Ratio</p>
                  <div className="flex justify-between items-end">
                    <p className="text-2xl font-black text-white">28.4%</p>
                    <p className="text-[10px] font-black text-emerald-400 uppercase">Within Safety Zone</p>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[9px] font-black text-teal-400 uppercase mb-1">Risk Exposure Rating</p>
                  <p className="text-2xl font-black text-white uppercase italic">{loanRequest.riskLevel}</p>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-teal-950 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2"
                  onClick={() => alert("Loan Approved for Disbursement")}
                >
                  <CheckCircle2 size={18} /> Approve Disbursement
                </button>
                <button 
                  className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center gap-2"
                  onClick={() => alert("Modification Requested")}
                >
                  <Clock size={18} /> Request Modification
                </button>
                <button 
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  onClick={() => alert("Loan Declined")}
                >
                  <XCircle size={18} /> Decline Application
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                 <div className="flex items-center justify-center gap-2 text-teal-400/40">
                   <AlertCircle size={12} />
                   <p className="text-[8px] font-black uppercase tracking-[0.2em]">Authorized Underwriter Log Required</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </CrestlineStaffLayout>
  );
};

export default CrestlineLoanProcessing;