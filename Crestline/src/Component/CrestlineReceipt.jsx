import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Download, Share2, ShieldCheck, 
  Copy, CheckCircle2, FileText, Landmark, Zap
} from 'lucide-react';

// --- Navbar Wrapper ---
import CrestlineNavbar from './CrestlineNavbar'; 

const CrestlineReceipt = ({ transaction }) => {
  // Mock data for display if no transaction is passed via props
  const tx = transaction || {
    id: "TXN-9920445120",
    status: "Success",
    amount: "12,000.00",
    date: "April 16, 2026",
    time: "10:44 AM",
    type: "Transfer",
    recipient: "JESSICA O. ADEBAYO",
    bank: "Crestline Digital Bank",
    reference: "Services Rendered / Project Alpha",
    sessionID: "000013260416104403451208842"
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Reference ID copied to clipboard");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Crestline Transaction Receipt',
          text: `Transaction of ₦${tx.amount} to ${tx.recipient} was successful.`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      alert("Sharing not supported on this browser.");
    }
  };

  return (
    <CrestlineNavbar>
      <div className="p-4 md:p-10 max-w-xl mx-auto min-h-[90vh] flex flex-col items-center">
        
        {/* TOP NAVIGATION */}
        <div className="w-full flex justify-between items-center mb-8">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
            <ChevronLeft size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Back to Ledger</span>
          </button>
          <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
            <CheckCircle2 size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">{tx.status}</span>
          </div>
        </div>

        {/* THE RECEIPT CARD */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-white text-black rounded-t-[40px] p-8 md:p-12 relative shadow-2xl"
        >
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl">
              <Zap size={32} fill="currentColor" />
            </div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Official Receipt</h2>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter mt-1">CRESTLINE</h1>
          </div>

          {/* Amount Display */}
          <div className="text-center mb-10 pb-10 border-b border-dashed border-zinc-200">
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Transaction Volume</p>
            <h3 className="text-5xl font-black italic tracking-tighter">₦{tx.amount}</h3>
          </div>

          {/* Data Grid */}
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Recipient</span>
              <span className="text-xs font-black uppercase text-right italic max-w-[150px]">{tx.recipient}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Destination</span>
              <span className="text-xs font-black uppercase italic">{tx.bank}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Timestamp</span>
              <span className="text-xs font-black uppercase italic">{tx.date} | {tx.time}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Reference</span>
              <span className="text-xs font-black uppercase text-right italic max-w-[150px]">{tx.reference}</span>
            </div>
            
            <div className="pt-6 border-t border-zinc-100 space-y-2">
              <div className="flex justify-between items-center group cursor-pointer" onClick={() => copyToClipboard(tx.id)}>
                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Reference ID</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-zinc-600">{tx.id}</span>
                  <Copy size={12} className="text-zinc-300 group-hover:text-blue-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Perforated Edge Decoration */}
          <div className="absolute -bottom-3 left-0 right-0 flex justify-around overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-4 h-6 bg-white rounded-full -mb-3 shadow-inner" />
            ))}
          </div>
        </motion.div>

        {/* RECEIPT FOOTER (The Dark Part) */}
        <div className="w-full bg-zinc-900 rounded-b-[40px] p-6 flex flex-col items-center border-t border-white/5">
           <div className="flex items-center gap-2 mb-4 opacity-50">
             <ShieldCheck size={14} className="text-blue-500" />
             <span className="text-[8px] font-black uppercase tracking-widest text-white">Verified by Crestline Security</span>
           </div>
           
           {/* ACTION BUTTONS */}
           <div className="grid grid-cols-2 gap-4 w-full">
              <button 
                onClick={() => window.print()} 
                className="flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all active:scale-95"
              >
                <Download size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Download</span>
              </button>
              
              <button 
                onClick={handleShare}
                className="flex items-center justify-center gap-2 py-4 bg-blue-600 rounded-2xl text-white hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
              >
                <Share2 size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Share</span>
              </button>
           </div>
        </div>

        <p className="mt-8 text-[8px] font-black uppercase tracking-[0.5em] text-zinc-800 text-center">
          Session Hash: {tx.sessionID}
        </p>
      </div>
    </CrestlineNavbar>
  );
};

export default CrestlineReceipt;