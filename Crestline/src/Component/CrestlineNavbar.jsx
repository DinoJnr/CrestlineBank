import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, User, Lock, Fingerprint, ShieldAlert, 
  Headset, Menu, X, LogOut, ChevronRight, Bell
} from 'lucide-react';

const CrestlineNavbar = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', icon: <Home size={22} />, path: '/user/dashboard' },
    { name: 'Profile', icon: <User size={22} />, path: '/user/profile' },
    { name: 'Security PIN', icon: <Lock size={22} />, path: '/user/transaction-pin' },
    { name: 'Biometric Settings', icon: <Fingerprint size={22} />, path: '/user/bio-metrics' },
    { name: 'Transaction Limit', icon: <ShieldAlert size={22} />, path: '/user/transaction-limit' },
    { name: 'Contact Us', icon: <Headset size={22} />, path: '/user/contact-us' },
  ];

  const handleLogout = () => {
    localStorage.removeItem("crestline_token");
    navigate('/user/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex overflow-hidden w-full">
      
      <aside className="hidden lg:flex w-64 flex-col bg-black border-r border-white/5 p-6 sticky top-0 h-screen z-50 transition-all duration-300 ease-in-out overflow-hidden shrink-0">
        
        <div 
          className="flex items-center gap-4 mb-12 px-2 cursor-pointer whitespace-nowrap overflow-hidden" 
          onClick={() => navigate('/user/dashboard')}
        >
          <div className="h-8 w-8 bg-blue-600 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] shrink-0" />
          <span className="text-2xl font-black italic tracking-tighter uppercase transition-opacity duration-200 ease-in-out">
            Crestline
          </span>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`w-full flex items-center justify-between px-3.5 py-4 rounded-2xl transition-all ${
                  isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-zinc-500 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-4 font-bold uppercase italic text-xs tracking-widest whitespace-nowrap overflow-hidden">
                  <div className="shrink-0">{item.icon}</div>
                  <span className="transition-opacity duration-200 ease-in-out">
                    {item.name}
                  </span>
                </div>
                {isActive && (
                  <motion.div 
                    layoutId="activeInd" 
                    className="w-1.5 h-1.5 bg-white rounded-full shrink-0" 
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/5 pt-6 overflow-hidden">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-3.5 py-4 text-red-500 font-black italic uppercase text-xs tracking-widest hover:bg-red-500/10 rounded-2xl transition-all whitespace-nowrap"
          >
            <LogOut size={22} className="shrink-0" />
            <span className="transition-opacity duration-200 ease-in-out inline">
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        <header className="lg:hidden flex justify-between items-center p-6 bg-black/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/user/dashboard')}>
            <div className="h-6 w-6 bg-blue-600 rounded" />
            <span className="font-black italic uppercase tracking-tighter">Crestline</span>
          </div>
          <div className="flex items-center gap-4">
             <Bell size={20} className="text-zinc-400" />
             <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-white/5 rounded-lg">
               <Menu size={24} />
             </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-24 lg:pb-0">
          {children}
        </main>

        <nav className="lg:hidden fixed bottom-0 w-full bg-black/80 backdrop-blur-2xl border-t border-white/10 px-6 py-4 flex justify-around items-center z-40">
          <MobileBottomTab to="/user/dashboard" active={location.pathname === '/user/dashboard'} icon={<Home />} />
          <MobileBottomTab to="/user/profile" active={location.pathname === '/user/profile'} icon={<User />} />
          <div className="relative -top-6">
             <button 
              onClick={() => navigate('/user/addmoney')}
              className="h-14 w-14 bg-blue-600 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center rotate-45 border-none outline-none"
             >
                <div className="-rotate-45 font-black text-xl text-white">+</div>
             </button>
          </div>
          <MobileBottomTab to="/user/transaction-limit" active={location.pathname === '/user/transaction-limit'} icon={<ShieldAlert />} />
          <MobileBottomTab to="/user/contact-us" active={location.pathname === '/user/contact-us'} icon={<Headset />} />
        </nav>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] lg:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-4/5 bg-zinc-950 z-[60] p-8 lg:hidden border-l border-white/10 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="font-black italic text-xl uppercase tracking-tighter">Menu Terminal</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white"><X size={24}/></button>
              </div>
              
              <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar">
                {navItems.map((item) => (
                  <Link 
                    key={item.name} 
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between w-full p-4 rounded-2xl border ${
                      location.pathname === item.path 
                      ? 'bg-blue-600 border-transparent text-white' 
                      : 'bg-white/5 border-white/5 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-4 font-bold uppercase italic text-xs tracking-widest">
                      {item.icon} {item.name}
                    </div>
                    <ChevronRight size={16} className={location.pathname === item.path ? 'text-white' : 'text-zinc-600'} />
                  </Link>
                ))}
              </div>

              <div className="pt-4 mt-auto">
                <button 
                  onClick={handleLogout}
                  className="w-full py-4 border border-red-500/20 text-red-500 font-black italic uppercase text-xs tracking-widest rounded-2xl bg-red-500/5 block text-center"
                >
                  Logout System
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const MobileBottomTab = ({ active, icon, to }) => (
  <Link to={to} className={`p-2 transition-colors shrink-0 ${active ? 'text-blue-500' : 'text-zinc-600'}`}>
    {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 2 })}
  </Link>
);

export default CrestlineNavbar;