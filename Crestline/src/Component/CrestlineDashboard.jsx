import React, { useState, useEffect } from 'react'; // Added useEffect
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Added axios for data fetching
import { 
  Home, User, Lock, Fingerprint, ShieldAlert, 
  Headset, Menu, X, LogOut, ChevronRight, Bell,
  Plus, Send, Phone, Trophy, Receipt, 
  Banknote, TrendingUp, History, Copy, 
  CreditCard, Landmark, Wallet, Globe, Loader2 
} from 'lucide-react';

// --- 1. THE NAVIGATION WRAPPER ---
const CrestlineLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Function to clear session
  const handleSignOut = () => {
    localStorage.removeItem('crestline_token');
    localStorage.removeItem('user_info');
    navigate('/user/login');
  };

  const navItems = [
    { name: 'Home', icon: <Home size={20} />, path: '/user/dashboard' },
    { name: 'Profile', icon: <User size={20} />, path: '/user/profile' },
    { name: 'Change PIN', icon: <Lock size={20} />, path: '/user/transaction-pin' },
    { name: 'Biometric Settings', icon: <Fingerprint size={20} />, path: '/user/bio-metrics' },
    { name: 'Transaction Limit', icon: <ShieldAlert size={20} />, path: '/user/transaction-limit' },
    { name: 'Contact Us', icon: <Headset size={20} />, path: '/user/contact-us' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex overflow-hidden">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-72 flex-col bg-black border-r border-white/5 p-6 sticky top-0 h-screen text-left">
        <div className="flex items-center gap-3 mb-12 px-2 cursor-pointer" onClick={() => navigate('/user/dashboard')}>
          <div className="h-8 w-8 bg-blue-600 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.4)]" />
          <span className="text-2xl font-black italic tracking-tighter uppercase">Crestline</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all group ${
                location.pathname === item.path 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-zinc-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-4 font-bold uppercase italic text-[10px] tracking-widest">
                {item.icon} {item.name}
              </div>
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/5 pt-6 text-center">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 text-red-500 font-black italic uppercase text-[10px] tracking-widest mx-auto hover:opacity-70 transition-opacity"
          >
            <LogOut size={18} /> Sign Out System
          </button>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* MOBILE HEADER */}
        <header className="lg:hidden flex justify-between items-center p-6 bg-black/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
          <div className="flex items-center gap-2" onClick={() => navigate('/user/dashboard')}>
            <div className="h-6 w-6 bg-blue-600 rounded" />
            <span className="font-black italic uppercase tracking-tighter">Crestline</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-white/5 rounded-lg"><Menu size={24} /></button>
        </header>

        {/* SCROLLABLE DASHBOARD BODY */}
        <main className="flex-1 overflow-y-auto pb-32 lg:pb-10 custom-scrollbar text-left">
          {children}
        </main>

        {/* MOBILE BOTTOM NAV */}
        <nav className="lg:hidden fixed bottom-0 w-full bg-black/80 backdrop-blur-2xl border-t border-white/10 px-8 py-4 flex justify-between items-center z-40">
          <Link to="/user/dashboard"><Home className={location.pathname === '/user/dashboard' ? 'text-blue-500' : 'text-zinc-600'} /></Link>
          <Link to="/user/profile"><User className={location.pathname === '/user/profile' ? 'text-blue-500' : 'text-zinc-600'} /></Link>
          <div className="relative -top-6">
             <button onClick={() => navigate('/user/addmoney')} className="h-14 w-14 bg-blue-600 rounded-2xl shadow-xl flex items-center justify-center rotate-45 text-white">
                <Plus className="-rotate-45" size={28} />
             </button>
          </div>
          <Link to="/user/transaction-limit"><ShieldAlert className={location.pathname === '/user/transaction-limit' ? 'text-blue-500' : 'text-zinc-600'} /></Link>
          <Link to="/user/contact-us"><Headset className={location.pathname === '/user/contact-us' ? 'text-blue-500' : 'text-zinc-600'} /></Link>
        </nav>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 bg-zinc-950 z-[60] p-8 lg:hidden text-left">
              <div className="flex justify-between mb-12"><span className="font-black italic tracking-widest uppercase">Menu Terminal</span><X onClick={() => setIsMobileMenuOpen(false)}/></div>
              <div className="space-y-4">
                {navItems.map(item => (
                  <Link 
                    key={item.name} 
                    to={item.path} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`p-5 rounded-2xl flex items-center gap-4 font-bold italic text-[10px] uppercase tracking-widest ${location.pathname === item.path ? 'bg-blue-600 text-white' : 'bg-white/5 text-zinc-400'}`}
                  >
                    {item.icon} {item.name}
                  </Link>
                ))}
              </div>
              <button 
                onClick={handleSignOut}
                className="absolute bottom-10 left-8 right-8 py-5 border border-red-500/20 text-red-500 font-black italic uppercase text-[10px] tracking-widest rounded-2xl"
              >
                Logout System
              </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- 2. THE DASHBOARD CONTENT ---
const DashboardMain = ({ userData }) => {
  const navigate = useNavigate();

  const services = [
    { label: 'Transfer', icon: <Send />, path: '/user/transfer' },
    { label: 'Top Up', icon: <Phone />, path: '/user/topup' },
    { label: 'Internet', icon: <Globe />, path: '/user/internet' },
    { label: 'Sporty', icon: <Trophy />, path: '/user/bet' },
    { label: 'Bills', icon: <Receipt />, path: '/user/billpay' },
    { label: 'Loan', icon: <Banknote />, path: '/user/loanV2' },
    { label: 'Invest', icon: <TrendingUp />, path: '/user/investV2' },
    { label: 'Card Request', icon: <CreditCard />, path: '/user/card-request' },
    { label: 'Ledger', icon: <History />, path: '/user/ledger' },
    // { label: 'Receipts', icon: <Receipt />, path: '/user/receipt' },
  ];

  return (
    <div className="p-4 md:p-10 space-y-8">
      {/* Identity Card */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-950 rounded-[35px] p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 md:items-end">
          <div className="text-left">
            <p className="text-blue-200 text-[9px] font-black uppercase tracking-[0.3em] mb-2 italic">Official Account Holder</p>
            {/* Dynamic Name */}
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">{userData?.fullName || "Loading..."}</h2>
            <div className="mt-8">
              <p className="text-blue-200 text-[9px] font-black uppercase tracking-[0.3em] italic">Account Number</p>
              <div className="flex items-center gap-3">
                {/* Dynamic Account Number */}
                <span className="text-2xl font-mono tracking-widest">{userData?.accountNumber || "----------"}</span>
                <Copy size={14} className="opacity-50 hover:opacity-100 cursor-pointer" onClick={() => navigator.clipboard.writeText(userData?.accountNumber)}/>
              </div>
            </div>
          </div>
          <div className="bg-black/20 p-6 rounded-2xl border border-white/5 text-right min-w-[200px]">
            <p className="text-blue-100 text-[8px] font-black uppercase tracking-widest mb-1">Available Balance</p>
            {/* Dynamic Balance */}
            <p className="text-3xl font-black italic tracking-tighter text-white">
               ₦{userData?.balance?.toLocaleString() || "0.00"}
            </p>
            <div className="mt-4 pt-2 border-t border-white/10">
               <p className="text-blue-100 text-[8px] font-black uppercase tracking-widest">Account Class</p>
               <p className="text-lg font-black italic uppercase tracking-tight">{userData?.accountType || "Premium Corporate"}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => navigate('/user/addmoney')}
          className="p-8 rounded-[30px] bg-white text-black flex justify-between items-center group cursor-pointer hover:bg-blue-600 hover:text-white transition-all shadow-lg"
        >
          <div className="text-left"><h4 className="text-xl font-black italic uppercase tracking-tighter">Add Money</h4><p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Fund via Card or Wire</p></div>
          <div className="p-4 bg-black/5 rounded-xl group-hover:bg-white/10"><Plus size={24} /></div>
        </div>
        <div 
          onClick={() => navigate('/user/transfer')}
          className="p-8 rounded-[30px] bg-zinc-900 border border-white/5 flex justify-between items-center group cursor-pointer hover:border-blue-500 transition-all"
        >
          <div className="text-left"><h4 className="text-xl font-black italic uppercase tracking-tighter">Transfer</h4><p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Global Bank Delivery</p></div>
          <div className="p-4 bg-white/5 rounded-xl group-hover:bg-blue-500"><Send size={22} /></div>
        </div>
      </div>

      {/* Services Bento Grid */}
      <div className="bg-zinc-950 border border-white/5 rounded-[40px] p-8 md:p-12">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-10 italic text-left">Financial Services Terminal</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {services.map((s) => (
            <motion.div 
              key={s.label} 
              whileHover={{ y: -5 }} 
              onClick={() => navigate(s.path)}
              className="flex flex-col items-center justify-center gap-4 p-8 rounded-[28px] border border-white/5 bg-zinc-900/20 group cursor-pointer hover:bg-white/5 transition-all"
            >
              <div className={`p-4 rounded-2xl bg-white/5 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all text-zinc-400`}>{s.icon}</div>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white text-center italic">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- 3. EXPORT COMPONENT ---
export default function CrestlineDashboard() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('crestline_token');
        if (!token) {
          navigate('/user/login'); // No token? Back to login.
          return;
        }

        // Fetching real user data using the token
        const response = await axios.get('http://localhost:5300/user/dashboard-data', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUserData(response.data.user);
      } catch (error) {
        console.error("Session Error:", error);
        navigate('/user/login'); // Token expired or invalid? Back to login.
      }
    };

    fetchUserData();
  }, [navigate]);

  return (
    <CrestlineLayout>
      <DashboardMain userData={userData} />
    </CrestlineLayout>
  );
}