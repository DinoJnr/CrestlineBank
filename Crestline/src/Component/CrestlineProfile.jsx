import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft, Camera, Lock, Smartphone,
  ShieldCheck, User, Mail, CalendarDays,
  MapPin, LogOut, CheckCircle2, ShieldAlert,
  Building2, Briefcase, Crown, Loader2
} from 'lucide-react';
import CrestlineNavbar from './CrestlineNavbar';

const CrestlineProfile = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileImg,  setProfileImg]  = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [successMsg,  setSuccessMsg]  = useState('');
  const [errorMsg,    setErrorMsg]    = useState('');
  const [user,        setUser]        = useState(null);
  const fileInputRef = useRef(null);

  // Global environment address configuration pointer targeting port 5300
  const BASE_API_URL = 'http://localhost:5300'; 

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('crestline_token');

        if (!token) {
          window.location.href = '/user/login';
          return;
        }

        const res = await fetch(`${BASE_API_URL}/user/profile`, {
          method: 'GET',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.status === 401) {
          localStorage.removeItem('crestline_token');
          window.location.href = '/user/login';
          return;
        }

        if (!res.ok) throw new Error(data.message || 'Failed to load profile');

        setUser(data.user);
        setPhoneNumber(data.user?.phone || '');
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfileImg(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSync = async () => {
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const token = localStorage.getItem('crestline_token');
      const res = await fetch(`${BASE_API_URL}/user/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: phoneNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      setSuccessMsg(data.message || 'Identity parameters verified & synced.');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('crestline_token');
    window.location.href = '/user/login';
  };

  // ── Dynamic Mapping Synchronizer Matrix ───────────────────
  const activeComplianceTier = user?.currentComplianceTier || 1;
  
  const tierLabels = { 1: 'Tier 1', 2: 'Tier 2', 3: 'Tier 3' };
  const tierLimits = { 1: 50000, 2: 2000000, 3: 10000000 };

  const resolvedTierName = tierLabels[activeComplianceTier] || 'Tier 1';
  const resolvedMaxLimit = tierLimits[activeComplianceTier] || 50000;

  const accountLabel = {
    personal:  'Personal Account',
    business:  'Business Account',
    corporate: 'Corporate Account',
  }[user?.accountType?.toLowerCase()] || 'Personal Account';

  const cardTier       = user?.card?.tier || 'silver';
  const cardLabel      = { silver: 'Silver Grade Card', gold: 'Gold Grade Card', black: 'Black Grade Card' }[cardTier?.toLowerCase()] || 'Silver Grade Card';
  const cardColorClass = { silver: 'bg-zinc-100/10 text-zinc-100', gold: 'bg-yellow-500/10 text-yellow-500', black: 'bg-zinc-800 text-zinc-400' }[cardTier?.toLowerCase()] || 'bg-zinc-100/10 text-zinc-100';
  const cardTextClass  = { silver: 'text-zinc-400', gold: 'text-yellow-500', black: 'text-zinc-200' }[cardTier?.toLowerCase()] || 'text-zinc-400';

  const formattedDob = user?.dob
    ? new Date(user.dob).toLocaleDateString('en-GB')
    : '—';

  if (loading) {
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

        {/* TOP INTERFACE MODULE NAVIGATION BAR */}
        <div className="flex justify-between items-center mb-10">
          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-2 text-zinc-600 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Terminal Home</span>
          </button>
          <h1 className="text-xl font-black italic uppercase tracking-tighter">
            Crestline<span className="text-blue-500">ID</span>
          </h1>
        </div>

        <div className="space-y-6">

          {/* IDENTITY CARD HERO BLOCK */}
          <div className="bg-zinc-950 border border-white/5 rounded-[40px] p-10 flex flex-col items-center shadow-2xl">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
              <div className="w-32 h-32 rounded-[40px] bg-zinc-900 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-500">
                {profileImg
                  ? <img src={profileImg} alt="Profile Vector Canvas" className="w-full h-full object-cover" />
                  : <User size={48} className="text-zinc-700" />}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-blue-600 p-3 rounded-2xl text-white shadow-xl group-hover:scale-110 transition-transform">
                <Camera size={18} />
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>

            <div className="mt-6 text-center">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                {user?.fullName || 'CRESTLINE INVESTOR'}
              </h2>
              <div className="flex items-center gap-2 mt-1 justify-center">
                <CheckCircle2 size={12} className="text-blue-500" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  {resolvedTierName} Verified Account Signature
                </span>
              </div>
            </div>
          </div>

          {/* META DATA PILLARS WIDGET LAYOUTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-950/50 border border-white/5 p-6 rounded-[32px] flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-2xl text-zinc-500">
                {user?.accountType?.toLowerCase() === 'corporate' ? <Building2 size={20} /> : <Briefcase size={20} />}
              </div>
              <div className="text-left">
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">Account Architecture Model</p>
                <p className="text-sm font-black text-zinc-200 uppercase italic">{accountLabel}</p>
              </div>
              <Lock size={12} className="ml-auto text-zinc-800" />
            </div>

            <div className="bg-zinc-950/50 border border-white/5 p-6 rounded-[32px] flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${cardColorClass}`}>
                <Crown size={20} />
              </div>
              <div className="text-left">
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">Issued Physical Card Asset</p>
                <p className={`text-sm font-black uppercase italic ${cardTextClass}`}>{cardLabel}</p>
              </div>
              <Lock size={12} className="ml-auto text-zinc-800" />
            </div>
          </div>

          {/* LIMIT ANALYTICS FRAME */}
          <div className="bg-zinc-950/80 border border-white/5 p-8 rounded-[40px] flex items-center justify-between">
            <div className="text-left">
              <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2 italic">
                <ShieldAlert size={12} className="text-blue-500" /> Institutional Limit Allocation Matrix
              </label>
              <h3 className="text-2xl font-black italic tracking-tighter text-white">
                ₦{resolvedMaxLimit.toLocaleString()}
              </h3>
              <p className="text-[7px] font-bold text-zinc-600 uppercase tracking-widest mt-1">
                Contact your primary terminal node admin desk to modify parameters
              </p>
            </div>
            <div className="p-4 bg-blue-600/5 rounded-2xl border border-blue-600/10">
              <ShieldCheck size={20} className="text-blue-600" />
            </div>
          </div>

          {/* SECURE USER REGISTRY FORMS FIELDSET */}
          <div className="bg-zinc-950 border border-white/5 rounded-[40px] p-8 md:p-10 space-y-8">

            {/* Phone */}
            <div className="space-y-4 text-left">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2 italic block">
                Mobile Authentication Link
              </label>
              <div className="relative group">
                <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-black italic outline-none focus:border-blue-500 transition-all text-white"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-4 text-left">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2 italic block">
                Registry Verification Email
              </label>
              <div className="relative opacity-50 grayscale">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                <input
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-black italic cursor-not-allowed text-zinc-400"
                />
              </div>
            </div>

            {/* Date Of Birth */}
            <div className="space-y-4 text-left">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2 italic block">
                Date of Birth
              </label>
              <div className="relative opacity-50 grayscale">
                <CalendarDays className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                <input
                  disabled
                  value={formattedDob}
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-black italic cursor-not-allowed text-zinc-400"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4 text-left">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2 italic block">
                Registered Physical Residential Address
              </label>
              <div className="relative opacity-50 grayscale">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                <input
                  disabled
                  value={user?.address || '—'}
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-black italic cursor-not-allowed text-zinc-400"
                />
              </div>
            </div>

            {/* FEEDBACK STATUS PRINTS */}
            {successMsg && (
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 text-center italic">
                ✓ {successMsg}
              </p>
            )}
            {errorMsg && (
              <p className="text-[10px] font-black uppercase tracking-widest text-red-400 text-center italic">
                ✕ {errorMsg}
              </p>
            )}

            <button
              onClick={handleSync}
              disabled={saving}
              className="w-full py-6 bg-white text-black rounded-[28px] font-black italic uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
            >
              {saving && <Loader2 size={18} className="animate-spin" />}
              {saving ? 'Syncing Profile Data...' : 'Sync Profile Data'}
            </button>
          </div>

          {/* SESSION DISCONNECT BUTTON */}
          <button
            onClick={handleLogout}
            className="w-full py-5 flex items-center justify-center gap-3 text-red-500 font-black uppercase tracking-widest text-[10px] italic hover:bg-red-500/5 rounded-2xl transition-all"
          >
            <LogOut size={16} /> Terminate Terminal Session
          </button>

        </div>
      </div>
    </CrestlineNavbar>
  );
};

export default CrestlineProfile;