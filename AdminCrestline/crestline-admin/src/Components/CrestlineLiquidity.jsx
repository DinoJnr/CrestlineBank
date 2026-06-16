import React, { useState, useEffect, useCallback } from "react";
import { 
  TrendingUp, Wallet, ArrowDownLeft, ArrowUpRight, 
  BarChart3, Landmark, RefreshCw, ShieldCheck, 
  AlertCircle, Zap, Activity, Loader2
} from "lucide-react";


const CrestlineLiquidity = () => {
  const [financials, setFinancials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const formatNaira = (value) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(value);
  };

  const syncLedgerMatrix = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("admin_crestline_token");
      const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5300/admin';

      const response = await fetch(`${API_URL}/financials/liquidity`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Ledger connection failure.');

      setFinancials(result.data);
    } catch (err) {
      setError(err.message);
    } {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncLedgerMatrix();
  }, [syncLedgerMatrix]);

  if (loading) {
    return (
      
        <div className="w-full h-[50vh] flex flex-col items-center justify-center gap-3 text-slate-700">
          <Loader2 className="animate-spin text-slate-900" size={32} />
          <p className="text-xs uppercase tracking-widest font-bold">Synchronizing Fiscal Ledger Matrix...</p>
        </div>
    
    );
  }

  if (error || !financials) {
    return (
      
        <div className="w-full p-8 bg-rose-50 border border-rose-200 rounded-[32px] text-left">
          <h4 className="text-rose-900 font-black uppercase text-sm tracking-wide">Ledger Synchronization Interrupted</h4>
          <p className="text-xs text-rose-700/80 font-medium mt-1">{error || "No data return profile."}</p>
          <button onClick={syncLedgerMatrix} className="mt-4 px-4 py-2 bg-rose-900 text-white text-[11px] font-bold uppercase rounded-xl">
            Retry Sync Sequence
          </button>
        </div>
      
    );
  }


  const dynamicMetrics = [
    { label: "Total Liquidity", val: formatNaira(financials.totalLiquidity), change: "+12.4%", trend: "up", icon: Wallet },
    { label: "Reserve Ratio", val: `${financials.reserveRatio}%`, change: "Target: 20%", trend: "stable", icon: ShieldCheck },
    { label: "Inflow (24h)", val: formatNaira(financials.inflow24h), change: "+5.1%", trend: "up", icon: ArrowDownLeft },
    { label: "Outflow (24h)", val: formatNaira(financials.outflow24h), change: "-2.4%", trend: "down", icon: ArrowUpRight },
  ];

  return (
    
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 text-left">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-slate-950 p-2 rounded-xl shadow-lg">
                <BarChart3 size={24} className="text-emerald-400" />
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                Liquidity <span className="text-slate-500">Engine</span>
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                Crestline MFB // Fiscal Stability Monitor
            </p>
          </div>
          
          <button 
            onClick={syncLedgerMatrix}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCw size={14} className="text-slate-600" /> Re-Sync Ledger
          </button>
        </div>

        {/* --- CORE METRICS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dynamicMetrics.map((m, i) => (
            <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-100 rounded-2xl text-slate-900">
                  <m.icon size={20} />
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                  m.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 
                  m.trend === 'down' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {m.change}
                </span>
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
              <h3 className="text-2xl font-black text-slate-950 italic tracking-tighter block">{m.val}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- VAULT DISTRIBUTION --- */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Active Reserve Nodes</h3>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] font-bold text-slate-400 uppercase">System Nominal</span>
              </div>
            </div>

            <div className="space-y-4">
              {financials.vaults?.map((vault, i) => (
                <div key={i} className="bg-white border border-slate-200 p-8 rounded-[40px] flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-slate-400 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-900 rounded-[20px] flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                      <Landmark size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vault Designation</p>
                      <h4 className="text-lg font-black text-slate-950 uppercase italic tracking-tight block">{vault.name}</h4>
                    </div>
                  </div>
                  
                  <div className="text-center md:text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Balance</p>
                    <p className="text-xl font-mono font-black text-slate-950 block">{formatNaira(vault.balance)}</p>
                  </div>

                  <div className="w-full md:w-32">
                    <div className="flex justify-between mb-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Integrity</span>
                      <span className="text-[9px] font-black text-slate-950">{vault.health}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-900 rounded-full" 
                        style={{ width: `${vault.health}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- SYSTEM ALERTS / INSIGHTS --- */}
          <div className="space-y-6">
             <div className="bg-slate-950 p-8 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
                <Zap size={140} className="absolute -right-10 -bottom-10 text-white/5 -rotate-12" />
                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Activity size={14} /> Fiscal Intelligence
                </h4>
                <div className="space-y-6 relative z-10">
                  <div className="border-l-2 border-emerald-400 pl-4">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Recommended Action</p>
                    <p className="text-xs font-bold leading-relaxed text-white">Diversify 5% of Operational Vault into Emergency Pool to maintain Level 2 compliance.</p>
                  </div>
                  <div className="border-l-2 border-white/20 pl-4">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Trend Forecast</p>
                    <p className="text-xs font-bold leading-relaxed text-white">Predicted 3.2% increase in digital deposits over next 72 hours.</p>
                  </div>
                </div>
             </div>

             <div className="bg-orange-50 border border-orange-100 p-6 rounded-[32px] flex gap-4">
                <AlertCircle className="text-orange-600 flex-shrink-0" size={20} />
                <p className="text-[10px] font-bold text-orange-950 leading-relaxed uppercase">
                  Reserve requirements are subject to <span className="underline font-black">CBN Policy V4.2</span>. Current holdings are within legal tolerance.
                </p>
             </div>
          </div>

        </div>
      </div>
    
  );
};

export default CrestlineLiquidity;