import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Lock, ShieldCheck, KeyRound, 
  Hash, Eye, EyeOff, CheckCircle2, 
  RefreshCcw, ArrowRight, ShieldAlert 
} from 'lucide-react';
import CrestlineNavbar from './CrestlineNavbar'; 

const CrestlineSecurity = () => {
  const [activeTab, setActiveTab] = useState('password'); 
  const [showPass, setShowPass] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [stepSuccess, setStepSuccess] = useState(false);
  const [hasExistingPin, setHasExistingPin] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
    oldPin: '', newPin: '', confirmPin: ''
  });

  // Check PIN status on load
  useEffect(() => {
    const checkSecurityStatus = async () => {
      try {
        const token = localStorage.getItem('crestline_token');
        const res = await axios.get('http://localhost:5300/user/dashboard-data', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHasExistingPin(res.data.user.hasPin); // Backend should return !!user.transactionPin
      } catch (err) { console.error("Status check failed"); }
    };
    checkSecurityStatus();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Validations
    if (activeTab === 'password') {
      if (formData.newPassword !== formData.confirmPassword) return alert("Passwords do not match!");
    } else {
      if (formData.newPin !== formData.confirmPin) return alert("PINs do not match!");
      if (formData.newPin.length !== 4) return alert("PIN must be 4 digits");
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('crestline_token');
      const payload = activeTab === 'password' 
        ? { type: 'password', currentPassword: formData.currentPassword, newPassword: formData.newPassword }
        : { type: 'pin', oldPin: formData.oldPin, newPin: formData.newPin };

      await axios.put('http://localhost:5300/user/update-security', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStepSuccess(true);
      if(activeTab === 'pin') setHasExistingPin(true);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '', oldPin: '', newPin: '', confirmPin: '' });
      setTimeout(() => setStepSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  // ... (Your Existing Strength Logic)
  const getStrength = (pass) => {
    if (!pass) return { label: 'Empty', color: 'bg-zinc-800', width: '0%' };
    let s = 0;
    if (pass.length > 7) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/[0-9]/.test(pass)) s++;
    if (/[^A-Za-z0-9]/.test(pass)) s++;
    if (s < 2) return { label: 'Weak', color: 'bg-red-500', width: '33%' };
    if (s === 3) return { label: 'Medium', color: 'bg-yellow-500', width: '66%' };
    return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
  };
  const strength = getStrength(formData.newPassword);

  return (
    <CrestlineNavbar>
      <div className="p-4 md:p-10 max-w-2xl mx-auto min-h-[90vh] text-left">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <button onClick={() => window.history.back()} className="group flex items-center gap-2 text-zinc-600 hover:text-white transition-colors">
            <ChevronLeft size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Security Home</span>
          </button>
          <h1 className="text-xl font-black italic uppercase tracking-tighter">Crestline<span className="text-blue-500">Vault</span></h1>
        </div>

        {/* TABS */}
        <div className="flex gap-2 p-1.5 bg-zinc-950 border border-white/5 rounded-2xl mb-8">
          <button onClick={() => setActiveTab('password')} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'password' ? 'bg-white text-black' : 'text-zinc-500'}`}>
            <KeyRound size={16} /> Password
          </button>
          <button onClick={() => setActiveTab('pin')} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'pin' ? 'bg-white text-black' : 'text-zinc-500'}`}>
            <Hash size={16} /> Transaction PIN
          </button>
        </div>

        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-950 border border-white/5 rounded-[40px] p-8 md:p-10 shadow-2xl relative">
          <form onSubmit={handleUpdate} className="space-y-6 relative z-10">
            {activeTab === 'password' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={16} />
                    <input name="currentPassword" value={formData.currentPassword} type={showPass ? "text" : "password"} onChange={handleInputChange} className="w-full bg-black border border-white/5 rounded-2xl py-4 pl-12 text-sm outline-none focus:border-blue-500" placeholder="Verify old password" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between px-1"><label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic">New Password</label><span className={`text-[8px] font-black ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span></div>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={16} />
                    <input name="newPassword" value={formData.newPassword} type={showPass ? "text" : "password"} onChange={handleInputChange} className="w-full bg-black border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm outline-none focus:border-blue-500" placeholder="New strong password" required />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                  <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden"><motion.div animate={{ width: strength.width }} className={`h-full ${strength.color}`} /></div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic">Confirm New Password</label>
                  <input name="confirmPassword" value={formData.confirmPassword} type={showPass ? "text" : "password"} onChange={handleInputChange} className={`w-full bg-black border rounded-2xl py-4 px-6 text-sm outline-none ${formData.confirmPassword && formData.newPassword !== formData.confirmPassword ? 'border-red-500' : 'border-white/5'}`} placeholder="Repeat new password" required />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border flex items-start gap-3 mb-6 ${hasExistingPin ? 'bg-zinc-900/50 border-white/5' : 'bg-blue-600/5 border-blue-500/20'}`}>
                  {hasExistingPin ? <ShieldCheck size={16} className="text-zinc-500" /> : <ShieldAlert size={16} className="text-blue-500" />}
                  <p className="text-[8px] font-bold text-zinc-400 uppercase leading-relaxed tracking-widest">
                    {hasExistingPin ? "Verify your old PIN to authorize a security rotation." : "Account initialized. Establish your 4-digit transaction authorization PIN."}
                  </p>
                </div>

                {hasExistingPin && (
                  <div className="space-y-2 text-center">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic">Old Security PIN</label>
                    <input name="oldPin" value={formData.oldPin} type="password" maxLength="4" onChange={handleInputChange} className="w-64 mx-auto block bg-black border border-white/5 rounded-2xl py-4 text-center text-xl tracking-[1em] outline-none" placeholder="••••" required />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic">New 4-Digit PIN</label>
                    <input name="newPin" value={formData.newPin} type="password" maxLength="4" onChange={handleInputChange} className="w-full bg-black border border-white/5 rounded-2xl py-4 text-center text-xl tracking-[1em] outline-none focus:border-blue-500" placeholder="••••" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic">Confirm PIN</label>
                    <input name="confirmPin" value={formData.confirmPin} type="password" maxLength="4" onChange={handleInputChange} className={`w-full bg-black border rounded-2xl py-4 text-center text-xl tracking-[1em] outline-none ${formData.confirmPin && formData.newPin !== formData.confirmPin ? 'border-red-500' : 'border-white/5'}`} placeholder="••••" required />
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={isUpdating} className={`w-full py-6 rounded-[28px] font-black italic uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${stepSuccess ? 'bg-emerald-500 text-black' : 'bg-white text-black hover:bg-blue-600 hover:text-white'}`}>
              {isUpdating ? <RefreshCcw size={20} className="animate-spin" /> : stepSuccess ? <><CheckCircle2 size={20}/> Updated</> : <>{hasExistingPin || activeTab === 'password' ? 'Update Credentials' : 'Create PIN'} <ArrowRight size={20}/></>}
            </button>
          </form>
        </motion.div>
      </div>
    </CrestlineNavbar>
  );
};

export default CrestlineSecurity;