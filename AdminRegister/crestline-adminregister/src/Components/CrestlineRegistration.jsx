import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, UserPlus, Key, 
  BadgeCheck, Briefcase, Mail, 
  Cpu, ShieldAlert, FileDigit,
  Hash, Globe, ArrowRight, Fingerprint
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CrestlineRegistration = () => {
  const navigate = useNavigate();
  const [regType, setRegType] = useState('admin'); // 'admin' or 'staff'
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    govId: '',
    email: '',
    privilegeDept: regType === 'admin' ? 'LEVEL 0: GLOBAL ROOT' : 'KYC / ONBOARDING',
    password: '',
    serialDesignation: ''
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeChange = (type) => {
    setRegType(type);
    setErrorMessage('');
    setFormData((prev) => ({
      ...prev,
      privilegeDept: type === 'admin' ? 'LEVEL 0: GLOBAL ROOT' : 'KYC / ONBOARDING'
    }));
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage('');
    
    try {
      
      const payload = {
        fullName: formData.fullName,
        govId: formData.govId,
        email: formData.email,
        regType: regType, // 'admin' or 'staff'
        privilegeDept: formData.privilegeDept, 
        password: formData.password,
        serialDesignation: formData.serialDesignation
      };

      const response = await axios.post('http://localhost:5300/admin/register', payload);

      if (response.data.success) {
        setIsProcessing(false);
        setSuccess(true);
        setTimeout(() => navigate('/admin/login'), 2000);
      }
    } catch (err) {
      setIsProcessing(false);
      setErrorMessage(err.response?.data?.message || 'Uplink failed. Network or server error.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFA] p-4 md:p-10 flex flex-col items-center justify-center font-sans overflow-hidden relative">
      
      {/* BACKGROUND DECOR */}
      <div className="absolute top-0 right-0 p-20 opacity-[0.03] pointer-events-none">
        <ShieldAlert size={600} className="text-teal-900" />
      </div>

      <div className="w-full max-w-3xl relative z-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-teal-950">
              Personnel <span className="text-teal-600">Enrollment</span>
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <p className="text-[9px] font-black text-teal-900/40 uppercase tracking-[0.3em]">
                Crestline MFB // Secure Node Provisioning
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-teal-900/5 shadow-sm">
             <Fingerprint size={18} className="text-teal-600" />
             <span className="text-[10px] font-black uppercase tracking-widest text-teal-950">Biometric Ready</span>
          </div>
        </div>

        {/* --- TOGGLE SWITCHER --- */}
        <div className="grid grid-cols-2 gap-3 p-2 bg-teal-900/5 rounded-[32px] mb-8 border border-teal-900/5">
          <button 
            type="button"
            onClick={() => handleTypeChange('admin')}
            className={`py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
              regType === 'admin' 
              ? 'bg-teal-950 text-white shadow-xl' 
              : 'text-teal-900/40 hover:text-teal-950'
            }`}
          >
            <Key size={14} className={regType === 'admin' ? 'text-teal-400' : ''} /> Admin Access
          </button>
          <button 
            type="button"
            onClick={() => handleTypeChange('staff')}
            className={`py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
              regType === 'staff' 
              ? 'bg-teal-950 text-white shadow-xl' 
              : 'text-teal-900/40 hover:text-teal-950'
            }`}
          >
            <Briefcase size={14} className={regType === 'staff' ? 'text-teal-400' : ''} /> Staff Access
          </button>
        </div>

        {/* --- FORM CARD --- */}
        <motion.div 
          layout
          className="bg-white border border-teal-900/10 rounded-[48px] p-8 md:p-14 shadow-[0_40px_80px_rgba(4,47,46,0.06)] relative overflow-hidden"
        >
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl">
              {errorMessage}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.form 
              key={regType}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleRegistration} 
              className="space-y-8 relative z-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                
                {/* 1. Legal Identity */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-teal-900/40 uppercase tracking-widest ml-1">Legal Identity</label>
                  <input 
                    type="text" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="SURNAME GIVEN-NAME" 
                    required 
                    className="w-full bg-teal-900/5 border-b-2 border-transparent rounded-2xl py-5 px-6 text-xs font-bold text-teal-950 outline-none focus:border-teal-600 focus:bg-white transition-all placeholder:text-teal-900/20" 
                  />
                </div>

                {/* 2. Verification ID */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-teal-900/40 uppercase tracking-widest ml-1">Govt ID (NIN/BVN)</label>
                  <div className="relative">
                    <FileDigit size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-teal-900/20" />
                    <input 
                      type="text" 
                      name="govId"
                      value={formData.govId}
                      onChange={handleInputChange}
                      maxLength={11} 
                      placeholder="00000000000" 
                      required 
                      className="w-full bg-teal-900/5 border-b-2 border-transparent rounded-2xl py-5 px-6 text-xs font-mono font-bold text-teal-950 outline-none focus:border-teal-600 focus:bg-white transition-all" 
                    />
                  </div>
                </div>

                {/* 3. Work Email */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-teal-900/40 uppercase tracking-widest ml-1">Official Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-teal-900/20" />
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@crestline.com" 
                      required 
                      className="w-full bg-teal-900/5 border-b-2 border-transparent rounded-2xl py-5 px-6 text-xs font-bold text-teal-950 outline-none focus:border-teal-600 focus:bg-white transition-all" 
                    />
                  </div>
                </div>

                {/* 4. Privilege / Department */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-teal-900/40 uppercase tracking-widest ml-1">
                    {regType === 'admin' ? 'Clearance Level' : 'Assign Department'}
                  </label>
                  <select 
                    name="privilegeDept"
                    value={formData.privilegeDept}
                    onChange={handleInputChange}
                    className="w-full bg-teal-900/5 border-b-2 border-transparent rounded-2xl py-5 px-6 text-xs font-bold text-teal-900/60 outline-none focus:border-teal-600 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    {regType === 'admin' ? (
                      <>
                        <option value="LEVEL 0: GLOBAL ROOT">LEVEL 0: GLOBAL ROOT</option>
                        <option value="LEVEL 1: FINANCIAL AUDITOR">LEVEL 1: FINANCIAL AUDITOR</option>
                        <option value="LEVEL 2: COMPLIANCE LEAD">LEVEL 2: COMPLIANCE LEAD</option>
                      </>
                    ) : (
                      <>
                        <option value="KYC / ONBOARDING">KYC / ONBOARDING</option>
                        <option value="TRANSACTION OPS">TRANSACTION OPS</option>
                        <option value="SECURITY / FRAUD">SECURITY / FRAUD</option>
                      </>
                    )}
                  </select>
                </div>

                {/* 5. Access Credentials */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-teal-900/40 uppercase tracking-widest ml-1">Security Key</label>
                  <div className="relative">
                    <Key size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-teal-900/20" />
                    <input 
                      type="password" 
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••" 
                      required 
                      className="w-full bg-teal-900/5 border-b-2 border-transparent rounded-2xl py-5 px-6 text-xs font-bold text-teal-950 outline-none focus:border-teal-600 focus:bg-white transition-all" 
                    />
                  </div>
                </div>

                {/* 6. Staff Serial */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-teal-900/40 uppercase tracking-widest ml-1">Serial Designation</label>
                  <div className="relative">
                    <Hash size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-teal-900/20" />
                    <input 
                      type="text" 
                      name="serialDesignation"
                      value={formData.serialDesignation}
                      onChange={handleInputChange}
                      placeholder="CL-2026-000" 
                      required 
                      className="w-full bg-teal-900/5 border-b-2 border-transparent rounded-2xl py-5 px-6 text-xs font-mono font-bold text-teal-950 outline-none focus:border-teal-600 focus:bg-white transition-all" 
                    />
                  </div>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button 
                type="submit"
                disabled={isProcessing}
                className={`w-full py-6 rounded-[24px] font-black italic uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all ${
                  success 
                  ? 'bg-emerald-500 text-white shadow-lg' 
                  : 'bg-teal-950 text-white hover:bg-black shadow-2xl hover:-translate-y-1 active:translate-y-0'
                }`}
              >
                {isProcessing ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Cpu size={20} className="text-teal-400" />
                  </motion.div>
                ) : success ? (
                  <><BadgeCheck size={20} /> Identity Synced</>
                ) : (
                  <>Establish {regType} Node <ArrowRight size={18} /></>
                )}
              </button>
            </motion.form>
          </AnimatePresence>
        </motion.div>

        {/* --- FOOTER --- */}
        <div className="mt-10 flex flex-col items-center gap-4">
           <div className="flex items-center gap-6 opacity-40">
              <Globe size={14} className="text-teal-900" />
              <div className="h-px w-20 bg-teal-900" />
              <ShieldCheck size={14} className="text-teal-900" />
           </div>
           <p className="text-[9px] font-black uppercase tracking-[0.5em] text-teal-950/30">
              Crestline Ledger Protocol Established // {new Date().getFullYear()}
           </p>
        </div>
      </div>
    </div>
  );
};

export default CrestlineRegistration;