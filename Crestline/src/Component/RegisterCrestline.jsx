import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // 1. IMPORT AXIOS
import { User, Briefcase, Building, CheckCircle2, XCircle, ChevronLeft, ArrowRight, Shield, Loader2 } from 'lucide-react';

const RegisterCrestline = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false); // 2. ADD LOADING STATE
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    accountType: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dob: '',
    gender: '',
    password: '',
    confirmPassword: ''
  });

  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    upperLower: false,
    hasString: false,
    matches: false
  });

  useEffect(() => {
    const { password, confirmPassword } = formData;
    setPasswordValidation({
      length: password.length >= 8,
      upperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
      hasString: /[a-zA-Z]/.test(password),
      matches: password === confirmPassword && password.length > 0
    });
  }, [formData.password, formData.confirmPassword]);

  const isAdult = (date) => {
    if (!date) return false;
    const today = new Date();
    const birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 18;
  };

  const generateAccountNumber = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };

  // 3. AXIOS BACKEND CONNECTION
  const handleFinishRegistration = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const generatedAccount = generateAccountNumber();
    
    const payload = {
      accountType: formData.accountType,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      dob: formData.dob,
      gender: formData.gender,
      password: formData.password,
      accountNumber: generatedAccount,
      balance: 0.00,
      currency: "USD",
      status: 'active'
    };

    try {
      // Replace URL with your actual endpoint
      const response = await axios.post('http://localhost:5300/user/register', payload);

      if (response.status === 201 || response.status === 200) {
        alert(`Welcome to Crestline! Your Account Number: ${generatedAccount}`);
        navigate('/user/login');
      }
    } catch (error) {
      console.error("Axios Error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-600/30">
      
      {/* LEFT SIDE: BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-zinc-900">
        <img 
          src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale"
          alt="Fintech Background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        <div className="relative z-10 p-20 self-end">
          <div className="flex items-center gap-3 mb-6 cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-8 w-8 bg-blue-600 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.5)]" />
            <span className="text-3xl font-black italic tracking-tighter uppercase">Crestline</span>
          </div>
          <h2 className="text-5xl font-black italic uppercase leading-none mb-4 text-left">Securing the <br/><span className="text-blue-500">Wealth of Tomorrow.</span></h2>
          <p className="text-gray-400 text-lg max-w-md italic text-left">Join over 2 million users managing assets with military-grade precision.</p>
        </div>
      </div>

      {/* RIGHT SIDE: THE FORM AREA */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-16 lg:p-24 overflow-y-auto bg-[#080808]">
        
        <div className="flex justify-between items-center mb-12">
          {step > 1 ? (
            <button 
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold uppercase text-xs tracking-widest"
            >
              <ChevronLeft size={16} /> Back
            </button>
          ) : <div />}
          
          <div className="text-right">
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1 text-right">Already a member?</p>
            <Link to="/user/login" className="text-blue-500 font-black italic text-sm hover:text-blue-400 underline underline-offset-4 block text-right">
              SIGN IN TO ACCOUNT
            </Link>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="st1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-left">Account Type</h1>
                <p className="text-zinc-500 mb-8 text-left">Choose your infrastructure.</p>
                <div className="space-y-4 text-left">
                  <AccountTypeBtn active={formData.accountType === 'personal'} onClick={() => { setFormData({...formData, accountType: 'personal'}); setStep(2); }} icon={<User />} label="Personal" desc="For individuals" />
                  <AccountTypeBtn active={formData.accountType === 'business'} onClick={() => { setFormData({...formData, accountType: 'business'}); setStep(2); }} icon={<Briefcase />} label="Business" desc="For startups" />
                  <AccountTypeBtn active={formData.accountType === 'corporate'} onClick={() => { setFormData({...formData, accountType: 'corporate'}); setStep(2); }} icon={<Building />} label="Corporate" desc="For enterprise" />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="st2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-left">Details</h1>
                <p className="text-zinc-500 mb-8 text-left">Identity verification starts here.</p>
                <div className="space-y-5">
                  <InputBlock label="Full Name" placeholder="Jane Cooper" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                  <InputBlock label="Email Address" type="email" placeholder="jane@crestline.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  <InputBlock label="Phone Number" type="tel" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  <InputBlock label="Physical Address" placeholder="123 Elite Way, Suite 500" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-left">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block mb-2">DOB (18+)</label>
                      <input type="date" className={`w-full bg-zinc-900/30 border ${formData.dob && !isAdult(formData.dob) ? 'border-red-500' : 'border-white/10'} rounded-xl p-4 text-white outline-none focus:border-blue-500`} onChange={(e) => setFormData({...formData, dob: e.target.value})} />
                    </div>
                    <div className="text-left">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block mb-2">Gender</label>
                      <select className="w-full bg-zinc-900/30 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, gender: e.target.value})} value={formData.gender}>
                        <option value="">Select...</option>
                        <option value="m">Male</option>
                        <option value="f">Female</option>
                        <option value="o">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <button 
                    disabled={!formData.fullName || !formData.email || !formData.phone || !formData.address || !isAdult(formData.dob)}
                    onClick={() => setStep(3)}
                    className="w-full py-5 bg-blue-600 rounded-2xl font-black italic uppercase tracking-widest mt-4 hover:bg-blue-500 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                  >
                    CONTINUE <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="st3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-left">Security</h1>
                <p className="text-zinc-500 mb-8 text-left">Set your vault access codes.</p>
                <form className="space-y-5" onSubmit={handleFinishRegistration}>
                  <InputBlock label="Password" type="password" placeholder="••••••••" onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  <InputBlock label="Confirm Password" type="password" placeholder="••••••••" onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
                  
                  <div className="p-5 bg-zinc-900/30 border border-white/5 rounded-2xl grid grid-cols-2 gap-y-3 gap-x-1">
                    <ValCheck active={passwordValidation.length} text="8+ Chars" />
                    <ValCheck active={passwordValidation.upperLower} text="Case Mix" />
                    <ValCheck active={passwordValidation.hasString} text="Has Letters" />
                    <ValCheck active={passwordValidation.matches} text="Match" />
                  </div>

                  <button 
                    type="submit"
                    disabled={Object.values(passwordValidation).includes(false) || isLoading}
                    className="w-full py-5 bg-white text-black rounded-2xl font-black italic uppercase tracking-widest mt-4 hover:bg-blue-500 hover:text-white transition-all disabled:opacity-30 flex items-center justify-center"
                  >
                    {isLoading ? <Loader2 className="animate-spin text-blue-600" /> : "FINISH REGISTRATION"}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-auto pt-10 flex items-center gap-2 text-zinc-600">
           <Shield size={14} />
           <span className="text-[10px] font-bold tracking-widest uppercase">AES-256 Bit Encrypted Environment</span>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const AccountTypeBtn = ({ active, onClick, icon, label, desc }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-5 p-5 rounded-2xl border transition-all text-left ${active ? 'bg-blue-600 border-blue-400' : 'bg-zinc-900/30 border-white/5 hover:border-white/20'}`}>
    <div className={`p-3 rounded-xl ${active ? 'bg-white/20' : 'bg-white/5'}`}>{icon}</div>
    <div>
      <h3 className="font-black italic text-sm uppercase tracking-tight">{label} Account</h3>
      <p className={`text-xs ${active ? 'text-white/70' : 'text-zinc-500'}`}>{desc}</p>
    </div>
  </button>
);

const InputBlock = ({ label, type = "text", placeholder, value, onChange }) => (
  <div className="text-left">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block mb-2 ml-1">{label}</label>
    <input 
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      className="w-full bg-zinc-900/30 border border-white/10 rounded-xl p-4 outline-none focus:border-blue-500 transition-all text-white"
    />
  </div>
);

const ValCheck = ({ active, text }) => (
  <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${active ? 'text-blue-500' : 'text-zinc-700'}`}>
    {active ? <CheckCircle2 size={12} /> : <XCircle size={12} />} {text}
  </div>
);

export default RegisterCrestline;