import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom'; 
import axios from 'axios'; // Integrated for backend connection
import { Eye, EyeOff, Lock, Mail, ArrowRight, Fingerprint, ShieldCheck, Loader2 } from 'lucide-react';

const SignInCrestline = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // New state for login transition
  const navigate = useNavigate(); 

  // Capture input data
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Connecting to your backend login endpoint
      const response = await axios.post('http://localhost:5300/user/login', loginData);

      if (response.data.token) {
        // Store the "Key" (JWT) in local storage to access other components
        localStorage.setItem('crestline_token', response.data.token);
        localStorage.setItem('user_info', JSON.stringify(response.data.user));

        navigate('/user/dashboard');
      }
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Authorization failed. Check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans">
      
      {/* LEFT SIDE: SHARP VISUALS */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-zinc-900 border-r border-white/5">
        <img 
          src="https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?q=80&w=2500&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale hover:scale-105 transition-transform duration-[10s]"
          alt="Fintech Security"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-transparent" />
        
        <div className="relative z-10 p-20 flex flex-col justify-between h-full">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-8 w-8 bg-blue-600 rounded-lg shadow-[0_0_25px_rgba(37,99,235,0.4)]" />
            <span className="text-3xl font-black italic tracking-tighter uppercase">Crestline</span>
          </div>
          
          <div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl max-w-sm mb-8">
              <ShieldCheck className="text-blue-500 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-2 uppercase italic tracking-tight text-left">Verified Access</h3>
              <p className="text-zinc-500 text-sm italic leading-relaxed text-left">
                Your session is protected by end-to-end AES-256 encryption and multi-factor hardware authentication.
              </p>
            </div>
            <h2 className="text-5xl font-black italic uppercase leading-[0.9] tracking-tighter text-left">
              Welcome back <br />
              <span className="text-blue-500">to the peak.</span>
            </h2>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: THE LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-16 lg:p-24 relative">
        
        <div className="max-w-md w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-left">Sign In</h1>
            <p className="text-zinc-500 mb-10 font-medium text-left">Enter your credentials to access your vault.</p>

            <form className="space-y-6" onSubmit={handleSignIn}>
              {/* Email Field */}
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Account Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="email" 
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    placeholder="name@company.com"
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl p-4 pl-12 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-zinc-700 text-white"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Vault Password</label>
                  <button type="button" className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors">
                    Forgot Key?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    placeholder="••••••••••••"
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl p-4 pl-12 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-zinc-700 text-white"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Toggle */}
              <div className="flex items-center gap-3 px-1">
                <button 
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${rememberMe ? 'bg-blue-600' : 'bg-zinc-800'}`}
                >
                  <motion.div 
                    animate={{ x: rememberMe ? 22 : 2 }}
                    className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                  />
                </button>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Trust this device</span>
              </div>

              {/* Submit Action */}
              <div className="pt-4 space-y-4">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-5 bg-white text-black rounded-2xl font-black italic uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>Authorize Access <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} /></>
                  )}
                </button>
                
                <div className="flex items-center gap-4 py-2">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Or Secure Login</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>

                <button 
                  type="button" 
                  onClick={() => navigate('/user/bio-metrics')}
                  className="w-full py-4 bg-zinc-900 border border-white/5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white"
                >
                  <Fingerprint size={20} className="text-blue-500" />
                  Use Biometric Passkey
                </button>
              </div>
            </form>

            <div className="mt-12 text-center">
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">New to the ecosystem?</p>
              <Link 
                to="/user/register" 
                className="text-white font-black italic text-sm hover:text-blue-500 transition-colors underline underline-offset-8 decoration-blue-600/50"
              >
                CREATE YOUR CRESTLINE ACCOUNT
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating status footer */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-20 whitespace-nowrap">
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">PCI DSS Compliant</span>
          <div className="w-1 h-1 bg-zinc-700 rounded-full" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">ISO 27001 Certified</span>
        </div>
      </div>
    </div>
  );
};

export default SignInCrestline;