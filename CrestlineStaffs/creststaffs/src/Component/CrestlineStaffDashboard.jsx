import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Wallet, FileText, AlertCircle, 
  ArrowUpRight, ArrowDownLeft, Clock, 
  CheckCircle2, Activity, Zap, ShieldAlert 
} from 'lucide-react';
import CrestlineStaffLayout from './CrestlineStaffLayout';

const CrestlineStaffDashboard = () => {
  // Mock Operational Data
  const stats = [
    { label: "Active Users", val: "12,840", growth: "+12%", icon: Users, color: "teal" },
    { label: "Total Deposits", val: "₦482.5M", growth: "+5.4%", icon: Wallet, color: "emerald" },
    { label: "Loan Volume", val: "₦120.2M", growth: "+2.1%", icon: FileText, color: "blue" },
    { label: "Pending KYC", val: "142", growth: "High Priority", icon: ShieldAlert, color: "orange" },
  ];

  return (
    <CrestlineStaffLayout>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* --- WELCOME & STATUS --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-teal-950 tracking-tighter uppercase italic">
              Operational <span className="text-teal-600/50">Intelligence</span>
            </h2>
            <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-black text-teal-900/40 uppercase tracking-[0.2em]">
                    Branch Node: Lagos_Main // System Status: Nominal
                </p>
            </div>
          </div>
          
          <div className="bg-white px-6 py-3 rounded-2xl border border-teal-900/5 shadow-sm flex items-center gap-4">
             <div className="text-right">
                <p className="text-[8px] font-black text-teal-900/30 uppercase">Local Time</p>
                <p className="text-xs font-mono font-bold text-teal-950">13:42:05</p>
             </div>
             <div className="h-8 w-px bg-teal-900/10" />
             <Activity size={20} className="text-teal-600" />
          </div>
        </div>

        {/* --- CORE METRICS GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div 
              key={i} 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-[32px] border border-teal-900/5 shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-teal-900/5 rounded-2xl text-teal-950 group-hover:bg-teal-950 group-hover:text-white transition-colors">
                  <s.icon size={20} />
                </div>
                <span className="text-[9px] font-black px-2 py-1 bg-teal-50 text-teal-600 rounded-lg uppercase">
                  {s.growth}
                </span>
              </div>
              <p className="text-[9px] font-black text-teal-900/30 uppercase tracking-widest">{s.label}</p>
              <h3 className="text-2xl font-black text-teal-950 italic tracking-tighter">{s.val}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- QUEUE MANAGEMENT (Actionable) --- */}
          <div className="lg:col-span-2 space-y-6">
             <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-teal-950">Pending Approvals Queue</h3>
                <span className="text-[9px] font-black text-teal-600 uppercase border-b-2 border-teal-600 cursor-pointer">View All Tasks</span>
             </div>

             <div className="space-y-4">
                {[
                    { type: 'KYC', user: 'Chidi Benson', time: '12m ago', priority: 'High' },
                    { type: 'LOAN', user: 'Fatima Yusuf', time: '45m ago', priority: 'Medium' },
                    { type: 'SAVINGS', user: 'Emeka Rolands', time: '1h ago', priority: 'Low' },
                ].map((task, i) => (
                    <div key={i} className="bg-white border border-teal-900/5 p-6 rounded-[28px] flex items-center justify-between group hover:border-teal-600 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-teal-900/5 rounded-2xl flex items-center justify-center text-teal-950">
                                {task.type === 'KYC' ? <ShieldAlert size={20}/> : <Zap size={20}/>}
                            </div>
                            <div>
                                <p className="text-xs font-black text-teal-950 uppercase italic">{task.user}</p>
                                <p className="text-[9px] font-bold text-teal-900/30 uppercase">{task.type} Verification Required</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-teal-950 uppercase mb-1">{task.time}</p>
                            <button className="px-4 py-1.5 bg-teal-950 text-white text-[8px] font-black uppercase rounded-lg hover:bg-teal-600 transition-all">Review</button>
                        </div>
                    </div>
                ))}
             </div>
          </div>

          {/* --- SYSTEM INSIGHTS SIDEBAR --- */}
          <div className="space-y-6">
             <div className="bg-teal-950 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Activity size={14} /> Peak Activity
                    </h4>
                    <div className="space-y-6">
                        <div className="flex items-end gap-2 h-20">
                            {[40, 70, 45, 90, 65, 80, 30].map((h, i) => (
                                <div key={i} className="flex-1 bg-teal-400/20 rounded-t-sm relative group cursor-pointer">
                                    <div className="absolute bottom-0 w-full bg-teal-400 rounded-t-sm transition-all duration-500 group-hover:bg-white" style={{ height: `${h}%` }} />
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] font-bold text-teal-100/60 leading-relaxed uppercase">
                            Transaction volume is <span className="text-white font-black">22% higher</span> than the last 24-hour cycle. 
                        </p>
                    </div>
                </div>
             </div>

             <div className="bg-white border border-teal-900/10 p-8 rounded-[40px]">
                <div className="flex items-center gap-2 mb-4">
                    <Clock size={16} className="text-teal-600" />
                    <h4 className="text-[10px] font-black text-teal-950 uppercase tracking-widest">Recent Node Logs</h4>
                </div>
                <div className="space-y-4">
                    {[
                        { msg: "Vault Sync Success", time: "10:00", icon: <CheckCircle2 size={12} className="text-emerald-500"/> },
                        { msg: "NIP Gateway Steady", time: "09:45", icon: <CheckCircle2 size={12} className="text-emerald-500"/> },
                        { msg: "API Load Increase", time: "09:30", icon: <AlertCircle size={12} className="text-orange-500"/> },
                    ].map((log, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {log.icon}
                                <span className="text-[9px] font-bold text-teal-900/60 uppercase">{log.msg}</span>
                            </div>
                            <span className="text-[9px] font-mono text-teal-900/20">{log.time}</span>
                        </div>
                    ))}
                </div>
             </div>
          </div>

        </div>
      </div>
    </CrestlineStaffLayout>
  );
};

export default CrestlineStaffDashboard;