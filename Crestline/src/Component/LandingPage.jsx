import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Fingerprint, Activity, TrendingUp, DollarSign } from 'lucide-react';

const CrestlineEliteV2 = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const cardVariants = {
    rest: { rotateY: 0, rotateX: 0, scale: 1 },
    hover: { 
      rotateY: 15, 
      rotateX: -10, 
      scale: 1.05,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  return (
    /* LUXURY UPDATE: Changed background to a subtle gradient and adjusted text color to a softer off-white */
    <div className="min-h-screen bg-gradient-to-br from-[#080808] via-[#0a0f1a] to-[#070707] text-zinc-100 overflow-hidden selection:bg-blue-600/50 font-sans antialiased">
      
      {/* TEXTURE: Increased opacity for a high-end grainy aesthetic */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none"></div>

      {/* LIGHTING: Soft radial glow for depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />

      {/* 1. THE REFINED GLASS NAV */}
      <nav className="fixed top-0 w-full z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/[0.02] backdrop-blur-3xl border border-white/10 px-8 py-3.5 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-6 w-6 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-md shadow-lg shadow-blue-600/40" />
            <span className="text-xl font-extrabold tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
              Crestline
            </span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/user/login')}
              className="px-7 py-2.5 bg-zinc-100 text-black text-xs font-black rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-xl shadow-black/20 uppercase tracking-widest"
            >
              Launch App
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-48 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-8">
                <Activity size={12} className="animate-pulse" /> System Operational: Tier-1 Status
              </div>
              <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter leading-[0.85] mb-10 uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600">
                Banking <br />
                That Feels <br />
                <span className="text-blue-500">Like The Future</span>
              </h1>
              <p className="text-zinc-400 text-xl font-medium max-w-lg mb-12 leading-relaxed text-left">
                Experience high-fidelity asset management. Precision-engineered for the modern architect of wealth.
              </p>
              
              <div className="flex flex-wrap gap-6">
                <button 
                  onClick={() => navigate('/user/register')}
                  className="relative group"
                >
                  {/* Subtle outer glow on hover */}
                  <div className="absolute -inset-1 bg-blue-600/20 rounded-xl blur-lg group-hover:bg-blue-600/40 transition duration-500" />
                  <div className="relative px-12 py-5 bg-[#0a0a0a] border border-white/10 rounded-2xl flex items-center gap-4 hover:border-blue-500/50 transition-colors">
                    <span className="text-white font-black uppercase text-lg italic tracking-tight">Open Your Account</span>
                    <ArrowRight className="text-blue-500 group-hover:translate-x-2 transition-transform" />
                  </div>
                </button>
              </div>
            </motion.div>

            {/* Right Side: IMAGERY */}
            <motion.div 
              className="relative perspective-1000"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 1 }}
              onMouseMove={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Image 1: Phone App Mockup */}
              <motion.div 
                className="absolute -top-16 -left-12 w-64 h-auto rounded-[40px] overflow-hidden border border-white/10 shadow-2xl z-20 hidden md:block"
                style={{ rotate: '-10deg' }}
                whileHover={{ rotate: '-5deg', y: -20 }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop" 
                  alt="Crestline App UI" 
                  className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                />
              </motion.div>

              {/* Image 2: The Physical Card */}
              <motion.div
                variants={cardVariants}
                animate={isHovered ? "hover" : "rest"}
                className="relative aspect-[16/10] w-full max-w-lg mx-auto rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/5 z-10"
              >
                <img 
                  src="https://images.unsplash.com/photo-1613243555988-441166d4d6fd?q=80&w=1200&auto=format&fit=crop" 
                  alt="Crestline Metal Card" 
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-between text-left">
                    <div className="flex justify-between items-start">
                        <DollarSign size={30} className="text-blue-400" />
                        <span className="text-[10px] font-mono tracking-[0.3em] text-zinc-400 uppercase">Elite Member</span>
                    </div>
                    <div>
                        <p className="text-lg font-mono tracking-widest mb-1 text-zinc-300">**** **** **** 4012</p>
                        <p className="text-2xl font-black uppercase italic tracking-tighter text-white">Alex Chen</p>
                    </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. BENTO GRID STATS */}
      <section className="max-w-7xl mx-auto px-6 py-24 relative">
        <div className="absolute inset-0 bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />
        <h2 className="text-center text-4xl font-black italic uppercase tracking-tighter mb-16 text-zinc-200">The Crestline Advantage</h2>
        <div className="grid md:grid-cols-4 gap-6 relative z-10">
          <div className="md:col-span-2 p-10 bg-white/[0.01] border border-white/5 rounded-[2rem] flex items-center gap-8 shadow-xl hover:bg-white/[0.03] transition-all duration-500 group">
            <TrendingUp size={56} className="text-blue-500 group-hover:scale-110 transition-transform duration-500" />
            <div className="text-left">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Growth Capital</p>
              <p className="text-6xl font-black tracking-tighter text-white">5.2% APY</p>
              <p className="text-zinc-500 mt-2 italic">Earn institutional-grade yield.</p>
            </div>
          </div>
          <div className="p-10 bg-white/[0.01] border border-white/5 rounded-[2rem] text-center hover:border-blue-500/20 transition-all duration-500">
            <Fingerprint size={48} className="text-zinc-600 mx-auto mb-6" />
            <p className="text-2xl font-black uppercase italic tracking-tighter mb-3">Vault Pro</p>
            <p className="text-zinc-500 text-sm">Military-grade biometric encryption.</p>
          </div>
          <div className="p-10 bg-zinc-100 border border-white rounded-[2rem] text-center shadow-2xl shadow-blue-900/20 group hover:bg-white transition-all duration-500">
            <DollarSign size={48} className="text-blue-600 mx-auto mb-6 group-hover:rotate-12 transition-transform" />
            <p className="text-2xl font-black uppercase italic tracking-tighter text-black mb-3">Zero Friction</p>
            <p className="text-zinc-600 text-sm">No maintenance. No limits.</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default CrestlineEliteV2;