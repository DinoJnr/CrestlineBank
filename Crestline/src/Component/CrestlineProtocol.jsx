import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Lock, X, Upload, Camera, 
  Fingerprint, ShieldCheck, FileCheck, Loader2 
} from 'lucide-react';
import CrestlineNavbar from './CrestlineNavbar'; 

const CrestlineProtocol = () => {
  const [currentTier, setCurrentTier] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [componentLoading, setComponentLoading] = useState(true);
  
  // Operational Feedback Strings
  const [actionError, setActionError] = useState('');

  // Form States
  const [bvn, setBvn] = useState('');
  const [nin, setNin] = useState('');
  const [utilityFile, setUtilityFile] = useState(null);
  const fileInputRef = useRef(null);

  const BASE_API_URL = 'http://localhost:5300';

  // Sync compliance tier data on mounting lifecycle initialization
  useEffect(() => {
    const fetchCurrentComplianceState = async () => {
      try {
        const token = localStorage.getItem('crestline_token');
        if (!token) {
          window.location.href = '/user/login';
          return;
        }

        const res = await fetch(`${BASE_API_URL}/user/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (res.ok && data.user) {
          // Sync with either direct numerical model tier index property or logical mapping
          setCurrentTier(data.user.currentComplianceTier || 1);
        }
      } catch (err) {
        console.error("Failed syncing profile tier mapping state context:", err);
      } finally {
        setComponentLoading(false);
      }
    };

    fetchCurrentComplianceState();
  }, []);

  const tierData = [
    { level: 1, name: "Basic Entry", limit: "₦50,000" },
    { level: 2, name: "Standard Level", limit: "₦2,000,000" },
    { level: 3, name: "Executive Suite", limit: "₦10,000,000" }
  ];

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setUtilityFile(file);
  };

  const triggerUpgrade = (level) => {
    setSelectedTier(level);
    setActionError('');
    setShowModal(true);
  };

  const finalizeUpgrade = async () => {
    setIsVerifying(true);
    setActionError('');
    try {
      const token = localStorage.getItem('crestline_token');
      
      // Build package object structures
      const payload = { targetTier: selectedTier };
      if (selectedTier === 2) {
        payload.bvn = bvn;
        payload.nin = nin;
      }
      if (selectedTier === 3) {
        payload.utilityBillUrl = utilityFile ? `uploads/${utilityFile.name}` : null;
      }

      const res = await fetch(`${BASE_API_URL}/user/kyc-upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'System verification faulted.');

      setCurrentTier(data.currentTier);
      setShowModal(false);
      setUtilityFile(null);
      setBvn('');
      setNin('');
    } catch (err) {
      setActionError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  if (componentLoading) {
    return (
      <CrestlineNavbar>
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 size={32} className="animate-spin text-blue-500" />
        </div>
      </CrestlineNavbar>
    );
  }

  return (
    <CrestlineNavbar>
      <div className="p-4 md:p-10 max-w-2xl mx-auto min-h-[90vh]">
        
        <div className="mb-12 text-left">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
            Account<span className="text-blue-500">Tiering</span>
          </h1>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">Personal Infrastructure Protocol</p>
        </div>

        {/* TIER SELECTION LIST */}
        <div className="space-y-4">
          {tierData.map((tier) => {
            const isCompleted = currentTier >= tier.level;
            const canUpgrade = currentTier === tier.level - 1;
            const isLocked = tier.level > currentTier + 1;

            return (
              <div key={tier.level} className={`p-6 rounded-[32px] border flex items-center justify-between transition-all ${
                isCompleted ? 'bg-zinc-950 border-emerald-500/20' : 
                canUpgrade ? 'bg-zinc-950 border-blue-500/30 shadow-lg' : 'bg-zinc-950/40 border-white/5 opacity-40'
              }`}>
                <div className="flex items-center gap-5">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black italic ${
                    isCompleted ? 'bg-emerald-500 text-black' : 'bg-white/5 text-zinc-500'
                  }`}>
                    {isCompleted ? <CheckCircle2 size={24} /> : tier.level}
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-black italic uppercase tracking-tight">{tier.name}</h4>
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Limit: {tier.limit}</p>
                  </div>
                </div>
                {canUpgrade && (
                  <button onClick={() => triggerUpgrade(tier.level)} className="px-6 py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                    Upgrade
                  </button>
                )}
                {isLocked && <Lock size={16} className="text-zinc-800 mr-4" />}
                {isCompleted && currentTier === tier.level && <span className="text-[9px] font-black text-emerald-500 uppercase italic mr-4">Active Status</span>}
              </div>
            );
          })}
        </div>

        {/* UPGRADE MODAL */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => !isVerifying && setShowModal(false)} />
              
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-[40px] p-8 relative z-10 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-black italic uppercase tracking-tighter">Tier {selectedTier} <span className="text-blue-500">Validation</span></h2>
                  <button onClick={() => !isVerifying && setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full text-zinc-500"><X size={20}/></button>
                </div>

                <div className="space-y-6">
                  {selectedTier === 2 ? (
                    /* TIER 2 FORM */
                    <div className="space-y-4">
                      <div className="space-y-2 text-left">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1 italic">BVN (11 Digits)</label>
                        <div className="relative">
                          <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                          <input type="text" maxLength="11" value={bvn} onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))} className="w-full bg-black border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none focus:border-blue-500 text-white" />
                        </div>
                      </div>
                      <div className="space-y-2 text-left">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1 italic">NIN (11 Digits)</label>
                        <div className="relative">
                          <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                          <input type="text" maxLength="11" value={nin} onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))} className="w-full bg-black border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none focus:border-blue-500 text-white" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* TIER 3 FORM (UTILITY UPLOAD) */
                    <div className="space-y-4">
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".jpg,.png,.pdf" />
                      
                      <div 
                        onClick={handleUploadClick}
                        className={`p-8 border-2 border-dashed rounded-[32px] flex flex-col items-center gap-4 cursor-pointer transition-all ${
                          utilityFile ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/5 hover:border-blue-500/50 bg-black'
                        }`}
                      >
                        <div className={`p-4 rounded-2xl ${utilityFile ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-600/10 text-blue-500'}`}>
                          {utilityFile ? <FileCheck size={24}/> : <Upload size={24}/>}
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-black uppercase tracking-widest italic text-white">
                            {utilityFile ? utilityFile.name : "Upload Utility Bill"}
                          </p>
                          <p className="text-[8px] text-zinc-500 font-bold mt-1 uppercase tracking-tight">
                            {utilityFile ? "Tap to change file" : "Electricity or Water bill (PDF/JPG)"}
                          </p>
                        </div>
                      </div>

                      <button className="w-full py-4 bg-zinc-800 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest italic text-zinc-400">
                        <Camera size={16}/> Start Facial Recognition
                      </button>
                    </div>
                  )}

                  {actionError && (
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest italic text-center">
                      ✕ {actionError}
                    </p>
                  )}

                  <button 
                    onClick={finalizeUpgrade}
                    disabled={isVerifying || (selectedTier === 2 && (bvn.length !== 11 || nin.length !== 11)) || (selectedTier === 3 && !utilityFile)}
                    className="w-full py-6 bg-white text-black rounded-[28px] font-black italic uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all shadow-2xl disabled:opacity-20 text-sm"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Validating Registry...</span>
                      </>
                    ) : "Commit Upgrade"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </CrestlineNavbar>
  );
};

export default CrestlineProtocol;