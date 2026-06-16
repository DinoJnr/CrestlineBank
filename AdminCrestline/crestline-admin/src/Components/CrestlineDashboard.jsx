import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  Users, Activity, CreditCard, Wallet, 
  TrendingUp, Scale, Loader2, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';

const API_BASE = "http://localhost:5300/admin"; 

const CrestlineDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("admin_crestline_token"); 
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};
        
        const res = await axios.get(`${API_BASE}/dashboard-metrics`, { headers });
        if (res.data && res.data.success) {
          setDashboardData(res.data.data || res.data);
        }
      } catch (err) {
        console.error("Dashboard synchronization error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading || !dashboardData) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center text-teal-950/40">
        <Loader2 className="animate-spin text-teal-900 mb-2" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest italic">Synchronizing Metric Matrix...</p>
      </div>
    );
  }

  const { metrics, recentFlux } = dashboardData;

  const stats = [
    { label: "Total Liquidity", value: `₦${Number(metrics?.totalLiquidity || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, change: "+12.5%", icon: <Wallet className="text-teal-600" />, trend: "up" },
    { label: "Active Users", value: Number(metrics?.activeUsers || 0).toLocaleString(), change: "+802", icon: <Users className="text-blue-600" />, trend: "up" },
    { label: "Daily Volume", value: `₦${Number(metrics?.dailyVolume || 0).toLocaleString()}`, change: "-2.1%", icon: <Activity className="text-purple-600" />, trend: "down" },
    { label: "Aggregate Revenue", value: `₦${Number(metrics?.revenue?.total || 0).toLocaleString()}`, change: "+5.4%", icon: <TrendingUp className="text-orange-600" />, trend: "up" },
  ];

  return (
    <div className="space-y-8 p-6 text-left">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-[32px] shadow-sm flex flex-col justify-between min-h-[160px]"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/80 rounded-2xl shadow-inner">{stat.icon}</div>
                <span className={`flex items-center text-[10px] font-black px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {stat.trend === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownLeft size={10} />} {stat.change}
                </span>
              </div>
              <p className="text-[11px] font-black text-teal-900/40 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-teal-950 mt-1 tracking-tighter leading-tight">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts & Flux Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-2 bg-teal-950 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h4 className="text-sm font-bold opacity-60">Transaction Flow</h4>
                <p className="text-3xl font-black italic tracking-tighter">Real-time Metrics</p>
              </div>
            </div>
            <div className="h-48 flex items-end gap-2 px-2">
              {[40, 70, 45, 90, 65, 80, 50, 100, 85, 40].map((h, i) => (
                <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.5 + (i * 0.05) }} className="flex-1 bg-gradient-to-t from-teal-500 to-emerald-300 rounded-t-lg opacity-80" />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/50 backdrop-blur-2xl border border-white/60 rounded-[40px] p-8 flex flex-col shadow-sm">
          <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-teal-900 mb-6">Recent Flux</h4>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[350px]">
            {recentFlux?.map((tx, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-white/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <ArrowUpRight size={18} />
                  </div>
                  <div>
                    <p className="text-[12px] font-black text-teal-950 leading-tight">{tx.user}</p>
                    <p className="text-[10px] font-bold text-teal-700/50 uppercase">{tx.type} • {tx.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-black text-teal-950">{tx.amount}</p>
                  <p className="text-[8px] font-black uppercase text-emerald-500">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CrestlineDashboard;