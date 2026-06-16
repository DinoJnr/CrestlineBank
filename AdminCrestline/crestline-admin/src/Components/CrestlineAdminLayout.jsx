import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // ✅ Added Router Hooks
import { 
  LayoutDashboard, Users, ShieldAlert, 
  BarChart3, Settings, Zap, 
  Menu, X, LogOut, Bell, 
  Cpu, ChevronRight, Search
} from 'lucide-react';

const CrestlineAdminLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

 
  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Personnel', path: '/admin/personnel', icon: <Users size={18} /> },
    { name: 'Liquidity', path: '/admin/liquidity', icon: <BarChart3 size={18} /> },
    { name: 'Sec-Ops', path: '/admin/sec-ops', icon: <ShieldAlert size={18} /> },
    { name: 'Fees & APIs', path: '/admin/fees-api', icon: <Zap size={18} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> },
  ];


  const isTabActive = (itemPath) => {
    if (itemPath === '/admin/dashboard') {
      return location.pathname === itemPath;
    }
    
    return location.pathname.startsWith(itemPath);
  };

  
  const getActiveHeaderTitle = () => {
    const currentItem = menuItems.find(item => isTabActive(item.path));
    if (currentItem) return currentItem.name;
    if (location.pathname === '/admin/profile') return 'Admin Profile';
    return 'Control Panel';
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_crestline_token");
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex overflow-hidden font-sans relative" 
      style={{ 
        background: `linear-gradient(135deg, #f0f7f9 0%, #e2eef1 40%, #d5e5e9 100%)`,
      }}>
      
      {/* BACKGROUND BLOBS */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-300/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-teal-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-blue-200/20 rounded-full blur-[80px] pointer-events-none" />

      {/* --- SIDEBAR --- */}
      <aside className="hidden lg:flex flex-col w-64 bg-white/30 backdrop-blur-xl border-r border-white/40 p-6 h-screen sticky top-0 z-50 shadow-xl">
        
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-8 h-8 bg-teal-800 rounded-lg flex items-center justify-center shadow-lg">
            <Cpu size={18} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase text-teal-900">
            Crestline
          </span>
        </div>

        {/* Desktop Sidebar Navigation Matrix */}
        <nav className="flex-1 space-y-1.5">
          {menuItems.map((item) => {
            const active = isTabActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path} // ✅ Swapped handler execution out for clean Link destinations
                className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 ${
                  active 
                    ? 'bg-teal-900 text-white shadow-[0_10px_20px_rgba(15,60,55,0.2)]' 
                    : 'text-teal-900/50 hover:bg-white/50 hover:text-teal-900'
                }`}
              >
                <span className="transition-transform group-hover:scale-110">
                  {item.icon}
                </span>
                <span className="text-[12px] font-bold tracking-wide uppercase">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* PROFILE BUTTON AT BOTTOM (Sidebar) */}
        <div className="mt-auto pt-6 border-t border-teal-900/5 flex flex-col gap-3">
          <Link 
            to="/admin/profile" // ✅ Added clean navigation redirect targeting your Profile component view
            className={`flex items-center gap-3 w-full p-2 rounded-2xl transition-all ${
              location.pathname === '/admin/profile' ? 'bg-white/60 shadow-sm' : 'hover:bg-white/40'
            }`}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Andrea" 
                alt="Admin" 
                className="w-full h-full bg-teal-50"
              />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-black text-teal-900">A. Pirlo</p>
              <p className="text-[9px] text-teal-700 font-bold uppercase opacity-60">Master Admin</p>
            </div>
          </Link>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-2 pl-4 rounded-2xl text-red-600/70 hover:text-red-600 hover:bg-red-50/50 text-[10px] font-bold uppercase tracking-wider transition-all"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 h-screen overflow-y-auto relative z-10 flex flex-col">
        
        {/* TOP NAVBAR (Floating Glass) */}
        <header className="px-10 py-8 flex justify-between items-center bg-transparent">
          <div className="text-left">
             <motion.p 
               initial={{ opacity: 0, y: -10 }} 
               animate={{ opacity: 1, y: 0 }}
               className="text-[11px] font-black text-teal-700 uppercase tracking-[0.2em] mb-1"
             >
               System Protocol Active
             </motion.p>
             <h2 className="text-4xl font-black text-teal-950 tracking-tighter italic uppercase">
               {getActiveHeaderTitle()} {/* ✅ Dynamic context mapping update */}
             </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Slot */}
            <div className="hidden md:flex items-center bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl px-4 py-2 text-teal-900/40">
              <Search size={16} />
              <input type="text" placeholder="Search data..." className="bg-transparent border-none outline-none px-3 text-xs font-bold placeholder:text-teal-900/30" />
            </div>

            {/* Notification Badge */}
            <button className="p-3 bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl text-teal-900 shadow-sm hover:bg-white/60 transition-all relative">
              <Bell size={18} />
              <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-[#e2eef1]" />
            </button>

            {/* Mobile Menu */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-3 bg-teal-900 text-white rounded-2xl shadow-lg"
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <motion.div 
          key={location.pathname} // ✅ Updated animation index to key off exact paths for flawless sub-page transition renders
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-10 pb-10"
        >
          {children}
        </motion.div>
      </main>

      {/* --- MOBILE OVERLAY --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-teal-950/20 backdrop-blur-md z-[100] lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 w-[80%] bg-white/90 backdrop-blur-3xl z-[110] p-8 shadow-2xl lg:hidden flex flex-col"
            >
               <div className="flex justify-between items-center mb-12">
                 <span className="font-black text-2xl italic uppercase text-teal-900">Crestline</span>
                 <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-teal-900/5 rounded-full"><X size={24} /></button>
               </div>
               <nav className="space-y-2 flex-1">
                 {menuItems.map((item) => {
                   const active = isTabActive(item.path);
                   return (
                     <Link
                       key={item.name}
                       to={item.path}
                       onClick={() => setIsMobileMenuOpen(false)} // ✅ Safely dismiss overlay panel on tap routing
                       className={`w-full flex items-center gap-5 p-5 rounded-[24px] font-black uppercase text-[11px] tracking-widest ${
                         active ? 'bg-teal-900 text-white' : 'text-teal-900/40'
                       }`}
                     >
                       {item.icon} {item.name}
                     </Link>
                   );
                 })}
               </nav>

               <div className="pt-4 border-t border-teal-900/10 space-y-3">
                 <Link 
                   to="/admin/profile"
                   onClick={() => setIsMobileMenuOpen(false)}
                   className="flex items-center gap-3 w-full p-2"
                 >
                   <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                     <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Andrea" alt="Admin" className="w-full h-full bg-teal-50" />
                   </div>
                   <div className="text-left">
                     <p className="text-[11px] font-black text-teal-900">A. Pirlo</p>
                     <p className="text-[9px] text-teal-700 font-bold uppercase opacity-60">Master Admin</p>
                   </div>
                 </Link>
                 <button 
                   onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                   className="w-full py-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-wider"
                 >
                   Log Out
                 </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CrestlineAdminLayout;