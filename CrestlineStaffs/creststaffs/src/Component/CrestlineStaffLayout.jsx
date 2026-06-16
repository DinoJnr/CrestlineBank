import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CreditCard, 
  ShieldCheck, Settings, LogOut, 
  Menu, X, Bell, Search, 
  CircleDot, ChevronRight, Briefcase,
  Wallet, UserCheck, Database, FileText,
  TrendingUp, CheckCircle2, Clock, MessageSquare
} from 'lucide-react';

const CrestlineStaffLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/staff/dashboard' },
    { name: 'User Management', icon: <Users size={20} />, path: '/staff/user-management' },
    { name: 'Pending Inquiries', icon: <Clock size={20} />, path: '/staff/pending-inquiries' },
    { name: 'Sorted Inquiries', icon: <MessageSquare size={20} />, path: '/staff/sorted-inquiries' },
  ];

  const handleSignOut = () => {
    localStorage.removeItem("crestline_token");
    localStorage.removeItem("staff_profile");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#F4F7F7] text-teal-950 font-sans flex overflow-hidden w-full">
      
      {/* --- DESKTOP SIDEBAR (HOVER EXPANSION ENGINE) --- */}
      <aside className="hidden lg:flex w-[76px] hover:w-72 flex-col bg-teal-950 p-4 hover:p-6 h-screen sticky top-0 shadow-[10px_0_40px_rgba(4,47,46,0.1)] shrink-0 z-50 transition-all duration-300 ease-in-out group/sidebar overflow-hidden">
        
        {/* Brand Section */}
        <div className="flex items-center gap-4 mb-10 px-1 hover:px-2">
          <div className="h-10 w-10 bg-teal-400 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.3)] shrink-0">
            <Briefcase size={22} className="text-teal-950" />
          </div>
          <div className="flex flex-col opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 ease-in-out overflow-hidden whitespace-nowrap">
            <span className="text-2xl font-black italic tracking-tighter uppercase text-white block leading-none">Crestline</span>
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-teal-400 mt-1">Staff Portal</span>
          </div>
        </div>

        {/* Navigation Wrapper */}
        <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`w-full flex items-center justify-between px-3.5 py-3.5 rounded-2xl transition-all ${
                  isActive 
                  ? 'bg-teal-400 text-teal-950 shadow-xl' 
                  : 'text-teal-100/40 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-4 font-black uppercase italic text-[10px] tracking-[0.15em] whitespace-nowrap overflow-hidden">
                  <div className="shrink-0">{item.icon}</div>
                  <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 ease-in-out">
                    {item.name}
                  </span>
                </div>
                {isActive && (
                  <CircleDot size={12} className="animate-pulse shrink-0 hidden group-hover/sidebar:block" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Staff Footer Card */}
        <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
          <div className="bg-white/5 rounded-[20px] p-3 group-hover/sidebar:p-4 transition-all duration-300 overflow-hidden whitespace-nowrap">
            <p className="text-[8px] font-black text-teal-400 uppercase tracking-widest mb-1 hidden group-hover/sidebar:block">Session ID</p>
            <p className="text-[10px] font-mono text-white/60 truncate text-center group-hover/sidebar:text-left">
              <span className="group-hover/sidebar:hidden">PROD</span>
              <span className="hidden group-hover/sidebar:inline">STF-8820-X9-PROD</span>
            </p>
          </div>
          <button 
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500/10 text-red-400 rounded-2xl font-black italic uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all overflow-hidden whitespace-nowrap"
          >
            <LogOut size={16} className="shrink-0" /> 
            <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 ease-in-out hidden group-hover/sidebar:inline">
              Terminate Session
            </span>
          </button>
        </div>
      </aside>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* TOP COMMAND BAR */}
        <header className="flex justify-between items-center px-6 md:px-10 py-5 bg-white border-b border-teal-900/5 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-3 bg-teal-900/5 rounded-xl text-teal-950">
              <Menu size={20} />
            </button>
            
            <div className="hidden md:flex items-center gap-3 bg-teal-900/5 px-5 py-3 rounded-2xl w-96 group focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-500/20 transition-all border border-transparent focus-within:border-teal-500/20">
              <Search size={18} className="text-teal-900/20 group-focus-within:text-teal-500" />
              <input 
                type="text" 
                placeholder="Search accounts, NIN, or ticket IDs..." 
                className="bg-transparent border-none outline-none text-[11px] font-bold text-teal-950 w-full placeholder:text-teal-900/20 uppercase tracking-wider"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-3 bg-teal-900/5 text-teal-900/40 rounded-xl hover:text-teal-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-10 w-px bg-teal-900/5 mx-2 hidden sm:block" />
            <div className="flex items-center gap-3 pl-2">
               <div className="hidden sm:block text-right">
                  <p className="text-[10px] font-black text-teal-950 uppercase leading-none mb-1">O. Adeyemi</p>
                  <p className="text-[8px] font-black text-teal-500 uppercase tracking-widest">Ops Lead</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-teal-950 text-white flex items-center justify-center font-black italic text-xs border-2 border-white shadow-lg">
                  OA
               </div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE BODY */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative bg-[#F4F7F7]">
          {children}
        </main>
      </div>

      {/* --- MOBILE OVERLAY --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-teal-950/60 backdrop-blur-md z-[60] lg:hidden"
          >
            <motion.div 
              initial={{ x: '-100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '-100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-4/5 h-full bg-teal-950 p-8 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="font-black italic tracking-[0.3em] text-teal-400 text-xs">MENU</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/5 rounded-xl text-white">
                  <X size={20}/>
                </button>
              </div>
              
              <div className="space-y-3 flex-1 overflow-y-auto">
                {navItems.map(item => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link 
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`w-full p-5 rounded-2xl flex items-center gap-4 font-black italic text-[10px] uppercase tracking-widest border ${
                        isActive 
                        ? 'bg-teal-400 text-teal-950 border-teal-400 shadow-xl' 
                        : 'bg-white/5 text-white border-white/5'
                      }`}
                    >
                      {item.icon} {item.name}
                    </Link>
                  );
                })}
              </div>
              
              <div className="mt-auto pt-8 border-t border-white/5">
                <button 
                  type="button"
                  onClick={handleSignOut}
                  className="w-full py-5 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest"
                >
                  Secure Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CrestlineStaffLayout;