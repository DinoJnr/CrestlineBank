import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Users, Wallet, FileText, AlertCircle, 
  Clock, CheckCircle2, Activity, Inbox,
  ChevronRight, RefreshCw, ShieldAlert 
} from 'lucide-react';
import CrestlineStaffLayout from './CrestlineStaffLayout';

// Base Axios Configuration Instance
const api = axios.create({
  baseURL: 'http://localhost:5300/staff',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('staffcrestline_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) : '—';

const CrestlineStaffDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeUsers: { val: "0", growth: "0%" },
    totalDeposits: { val: "₦0.00", growth: "0%" },
    loanVolume: { val: "₦0.00", growth: "0%" },
    pendingKyc: { val: "0", growth: "Nominal" }
  });
  const [pendingInquiries, setPendingInquiries] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-NG'));

  // Live Local Time Tracking Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-NG'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Execute parallel calls to your active infrastructure endpoints
      const [statsRes, inquiriesRes] = await Promise.all([
        api.get('/dashboard-stats').catch(() => ({ data: null })), // Graceful fallback if stat metrics are incomplete
        api.get('/pending')
      ]);

      if (statsRes && statsRes.data) {
        setStats(statsRes.data.data ?? statsRes.data);
      }
      
      if (inquiriesRes && inquiriesRes.data) {
        // Safe check for data wrapping patterns out of controller response bodies
        const rawInquiries = inquiriesRes.data.data ?? inquiriesRes.data;
        setPendingInquiries(rawInquiries.slice(0, 4)); // Only pull top 4 active tasks onto the landing matrix
      }
    } catch (err) {
      console.error("❌ Operational Dashboard Sync Failure:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Structural mapping engine tracking operational metric tiles
  const metricCards = [
    { label: "Active Users", val: stats.activeUsers.val, growth: stats.activeUsers.growth, icon: Users },
    { label: "Total Deposits", val: stats.totalDeposits.val, growth: stats.totalDeposits.growth, icon: Wallet },
    { label: "Loan Volume", val: stats.loanVolume.val, growth: stats.loanVolume.growth, icon: FileText },
    { label: "Pending KYC", val: stats.pendingKyc.val, growth: stats.pendingKyc.growth, icon: ShieldAlert },
  ];

  return (
    <CrestlineStaffLayout>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* --- WELCOME & STATUS PANEL --- */}
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
            <button 
              onClick={fetchDashboardData}
              className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-teal-600 rounded-lg transition-colors mr-1"
              title="Refresh Interface Data Logs"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            <div className="h-8 w-px bg-teal-900/10" />
            <div className="text-right">
              <p className="text-[8px] font-black text-teal-900/30 uppercase">Local Time</p>
              <p className="text-xs font-mono font-bold text-teal-950 tracking-wider">{currentTime}</p>
            </div>
            <div className="h-8 w-px bg-teal-900/10" />
            <Activity size={20} className="text-teal-600" />
          </div>
        </div>

        {/* --- CORE METRICS DYNAMIC GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricCards.map((s, i) => (
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
                <span className="text-[9px] font-black px-2 py-1 bg-teal-55 text-teal-600 rounded-lg uppercase">
                  {s.growth}
                </span>
              </div>
              <p className="text-[9px] font-black text-teal-900/30 uppercase tracking-widest">{s.label}</p>
              <h3 className="text-2xl font-black text-teal-950 italic tracking-tighter">{loading ? "..." : s.val}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LIVE PENDING INQUIRIES ROUTE QUEUE --- */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-teal-950">
                Live Customer Support Queue
              </h3>
              <button 
                onClick={() => navigate('/staff/inquiries')}
                className="text-[9px] font-black text-teal-600 uppercase border-b-2 border-teal-600 hover:text-teal-800 hover:border-teal-800 transition-all cursor-pointer bg-transparent border-0"
              >
                Open Processing Terminal
              </button>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="bg-white border border-teal-900/5 p-12 rounded-[28px] flex flex-col items-center justify-center text-slate-400 gap-2">
                  <RefreshCw size={18} className="animate-spin text-teal-600" />
                  <p className="text-[9px] font-black uppercase tracking-wider">Syncing Terminal Records...</p>
                </div>
              ) : pendingInquiries.length === 0 ? (
                <div className="bg-white border border-teal-900/5 p-12 rounded-[28px] text-center space-y-2">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 size={20} />
                  </div>
                  <p className="text-xs font-black text-slate-700 uppercase">Queue Completely Clear</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">No active pending support tickets exist.</p>
                </div>
              ) : (
                pendingInquiries.map((task) => (
                  <div 
                    key={task._id} 
                    onClick={() => navigate('/staff/inquiries')}
                    className="bg-white border border-teal-900/5 p-6 rounded-[28px] flex items-center justify-between group hover:border-teal-600 transition-all cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
                      <div className="w-12 h-12 bg-teal-900/5 rounded-2xl flex items-center justify-center text-teal-950 shrink-0 group-hover:bg-teal-950 group-hover:text-white transition-colors">
                        <Inbox size={20}/>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-teal-950 uppercase italic truncate">
                          {task.userId?.fullName || "Unregistered Account Node"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-black text-teal-600 uppercase tracking-wide bg-teal-50 px-1.5 py-0.5 rounded">
                            {task.subject}
                          </span>
                          <span className="text-[11px] text-slate-600 font-medium truncate hidden sm:inline">
                            — {task.message}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock size={11} />
                        <span className="text-[10px] font-mono font-bold text-teal-950 uppercase">
                          {fmtTime(task.createdAt)}
                        </span>
                      </div>
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-teal-950 text-white text-[8px] font-black uppercase rounded-lg group-hover:bg-teal-600 transition-all">
                        Review <ChevronRight size={10} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* --- SYSTEM INSIGHTS SIDEBAR MODULE --- */}
          <div className="space-y-6">
            <div className="bg-teal-950 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Activity size={14} /> Peak System Activity
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
                    Transaction payload volumes are tracking <span className="text-white font-black">22% higher</span> than the baseline 24-hour cycle. 
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