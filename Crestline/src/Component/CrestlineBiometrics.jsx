import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Fingerprint, ScanFace, 
  ShieldCheck, Cpu, CheckCircle2, 
  Info, Loader2 
} from 'lucide-react';

// --- Navbar Wrapper ---
import CrestlineNavbar from './CrestlineNavbar'; 

const CrestlineBiometrics = () => {
  const [isLoginBio, setIsLoginBio] = useState(true);
  const [isTxBio, setIsTxBio] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const toggleBiometric = (type) => {
    if (type === 'login') {
        setIsLoginBio(!isLoginBio);
    }
    
    if (type === 'tx') {
      if (!isTxBio) {
        // Trigger the "Neural Scan" simulation
        setIsScanning(true);
        setTimeout(() => {
          setIsScanning(false);
          setIsTxBio(true);
        }, 2500);
      } else {
        setIsTxBio(false);
      }
    }
  };

  return (
    <CrestlineNavbar>
      <div className="p-4 md:p-10 max-w-2xl mx-auto min-h-[90vh] flex flex-col">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <button 
            onClick={() => window.history.back()} 
            className="group flex items-center gap-2 text-zinc-600 hover:text-white transition-colors"
          >
            <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-blue-600 transition-all">
              <ChevronLeft size={14} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest italic text-zinc-500">Vault Home</span>
          </button>
          <h1 className="text-xl font-black italic uppercase tracking-tighter">
            Crestline<span className="text-blue-500">Bio</span>
          </h1>
        </div>

        {/* VISUAL SCANNER BOX */}
        <div className="bg-zinc-950 border border-white/5 rounded-[40px] p-12 mb-8 flex flex-col items-center relative overflow-hidden shadow-2xl">
          <div className="relative mb-6">
            <motion.div 
              animate={isScanning ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`p-8 rounded-[32px] border-2 transition-all duration-700 ${
                isScanning ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 bg-white/5'
              }`}
            >
              <Fingerprint 
                size={64} 
                className={`transition-colors duration-500 ${isScanning ? 'text-blue-500' : 'text-zinc-700'}`} 
              />
            </motion.div>
            
            {/* Animated Laser Scan Line */}
            <AnimatePresence>
              {isScanning && (
                <motion.div 
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10"
                />
              )}
            </AnimatePresence>
          </div>

          <div className="text-center z-10">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">
              {isScanning ? "Neural Sync..." : "Biometric Vault"}
            </h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2 italic">
              {isScanning ? "Authenticating hardware signature" : "AES-256 Local Encryption Active"}
            </p>
          </div>
        </div>

        {/* TOGGLE OPTIONS */}
        <div className="space-y-4">
          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2 italic">Authorization Nodes</p>
          
          {/* Login Toggle */}
          <div className="bg-zinc-950 border border-white/5 p-6 rounded-3xl flex items-center justify-between transition-all hover:border-white/10">
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 bg-white/5 rounded-2xl text-zinc-400">
                <ScanFace size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black italic uppercase tracking-tight">Login Protocol</h4>
                <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Biometric Terminal Access</p>
              </div>
            </div>
            <button 
              onClick={() => toggleBiometric('login')}
              className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${isLoginBio ? 'bg-blue-600' : 'bg-zinc-800'}`}
            >
              <motion.div 
                animate={{ x: isLoginBio ? 24 : 0 }}
                className="w-6 h-6 bg-white rounded-full shadow-md" 
              />
            </button>
          </div>

          {/* Transaction Toggle */}
          <div className="bg-zinc-950 border border-white/5 p-6 rounded-3xl flex items-center justify-between transition-all hover:border-white/10">
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 bg-white/5 rounded-2xl text-zinc-400">
                <Cpu size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black italic uppercase tracking-tight">Execution Shield</h4>
                <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Approve Transfers & Payments</p>
              </div>
            </div>
            <button 
              onClick={() => toggleBiometric('tx')}
              disabled={isScanning}
              className={`w-14 h-8 rounded-full p-1 transition-all duration-300 flex items-center ${
                isTxBio ? 'bg-emerald-500' : 'bg-zinc-800'
              } ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <motion.div 
                animate={{ x: isTxBio ? 24 : 0 }}
                className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center"
              >
                 {isScanning && <Loader2 size={10} className="text-blue-500 animate-spin" />}
              </motion.div>
            </button>
          </div>
        </div>

        {/* LEGAL FOOTER */}
        <div className="mt-auto pt-10 pb-20 md:pb-10">
          <div className="bg-blue-600/5 border border-blue-600/10 rounded-2xl p-4 flex items-start gap-4">
             <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
             <p className="text-left text-[8px] font-black uppercase tracking-widest text-zinc-500 leading-normal">
               Biometric identifiers are managed by your device OS. Crestline does not have access to, nor stores, your raw fingerprint or facial data on external servers.
             </p>
          </div>
        </div>
      </div>
    </CrestlineNavbar>
  );
};

export default CrestlineBiometrics;