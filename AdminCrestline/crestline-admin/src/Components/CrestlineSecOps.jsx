import React, { useState } from "react";
import { 
  ShieldAlert, ShieldCheck, Fingerprint, Eye, 
  Terminal, Lock, Unlock, Zap, 
  Radar, AlertTriangle, Activity, Database
} from "lucide-react";
import CrestlineAdminLayout from "./CrestlineAdminLayout";

const CrestlineSecOps = () => {
  const [threatLevel, setThreatLevel] = useState("Low");


  const securityLogs = [
    { id: 1, event: "Unauthorized Access Attempt", node: "Node-44", time: "12:04:22", status: "Blocked", severity: "High" },
    { id: 2, event: "L5 Admin Auth", node: "Admin-Main", time: "11:50:01", status: "Success", severity: "Low" },
    { id: 3, event: "Database Sync", node: "Vault-Alpha", time: "11:45:10", status: "Encrypted", severity: "Low" },
    { id: 4, event: "Brute Force Warning", node: "Gateway-02", time: "10:30:55", status: "Rate-Limited", severity: "Medium" },
  ];

  return (
    
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
        
        {/* --- SEC-OPS HEADER --- */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b-2 border-teal-900/5 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-teal-950 p-2 rounded-xl shadow-lg relative">
                <Radar size={24} className="text-teal-400 animate-spin-slow" />
                <div className="absolute inset-0 bg-teal-400/20 blur-lg rounded-full animate-pulse" />
              </div>
              <h1 className="text-4xl font-black text-teal-950 tracking-tighter uppercase italic">
                Sec-<span className="text-teal-600/50">Ops</span> Center
              </h1>
            </div>
            <p className="text-[10px] font-black text-teal-700/50 uppercase tracking-[0.3em]">
                Crestline MFB // Threat Intelligence Terminal
            </p>
          </div>

          <div className="flex gap-4">
             <div className="bg-white border border-teal-900/10 px-6 py-3 rounded-2xl shadow-sm">
                <p className="text-[8px] font-black text-teal-900/40 uppercase tracking-widest mb-1">System Integrity</p>
                <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span className="text-xs font-black text-teal-950 uppercase italic">99.98% Secure</span>
                </div>
             </div>
             <div className="bg-teal-950 px-6 py-3 rounded-2xl shadow-xl border border-teal-400/20">
                <p className="text-[8px] font-black text-teal-400/50 uppercase tracking-widest mb-1">Active Protocols</p>
                <span className="text-xs font-black text-white uppercase italic">E2EE-V4 Active</span>
             </div>
          </div>
        </div>

        {/* --- THREAT LEVEL & METRICS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-white border-2 border-teal-950 p-8 rounded-[40px] flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500" />
             <p className="text-[10px] font-black text-teal-900/30 uppercase tracking-[0.2em] mb-4">Current Threat Level</p>
             <h2 className={`text-5xl font-black italic tracking-tighter uppercase ${
               threatLevel === "Low" ? "text-emerald-500" : "text-orange-500"
             }`}>
               {threatLevel}
             </h2>
             <button onClick={() => setThreatLevel(threatLevel === "Low" ? "Elevated" : "Low")} className="mt-4 text-[9px] font-black text-teal-950/40 hover:text-teal-950 underline decoration-teal-400 decoration-2 underline-offset-4 uppercase transition-all">
                Manual Override
             </button>
          </div>

          {[
            { label: "Blocked Requests", val: "1,402", icon: Lock, color: "text-blue-500" },
            { label: "Active Sessions", val: "14", icon: Activity, color: "text-teal-600" },
            { label: "Vault Queries", val: "89", icon: Database, color: "text-purple-600" },
          ].map((stat, i) => (
            <div key={i} className="bg-white/50 border border-teal-900/5 p-8 rounded-[40px] shadow-sm flex flex-col justify-between">
               <stat.icon size={24} className={`${stat.color} mb-6`} />
               <div>
                  <p className="text-[9px] font-black text-teal-900/30 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-3xl font-black text-teal-950 italic">{stat.val}</p>
               </div>
            </div>
          ))}
        </div>

        {/* --- LIVE SECURITY FEED --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white border border-teal-900/10 rounded-[48px] overflow-hidden shadow-sm">
            <div className="bg-teal-950 p-6 flex justify-between items-center">
               <div className="flex items-center gap-2">
                  <Terminal size={16} className="text-teal-400" />
                  <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Live Security Logs</h3>
               </div>
               <span className="text-[8px] font-mono text-teal-400/50 animate-pulse">SYSTEM_LISTENING_ACTIVE...</span>
            </div>
            <div className="divide-y divide-teal-900/5">
               {securityLogs.map((log) => (
                 <div key={log.id} className="p-6 flex items-center justify-between hover:bg-teal-50 transition-all">
                    <div className="flex items-center gap-4">
                       <div className={`p-2 rounded-lg ${
                         log.severity === 'High' ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-teal-600'
                       }`}>
                          {log.severity === 'High' ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                       </div>
                       <div>
                          <p className="text-xs font-black text-teal-950 uppercase tracking-tight">{log.event}</p>
                          <p className="text-[10px] font-mono text-teal-900/40 uppercase">{log.node} • {log.time}</p>
                       </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      log.status === 'Blocked' ? 'border-red-100 text-red-600 bg-red-50' : 'border-teal-100 text-teal-600 bg-teal-50'
                    }`}>
                       {log.status}
                    </span>
                 </div>
               ))}
            </div>
          </div>

          {/* --- SECURITY CONSOLE SIDEBAR --- */}
          <div className="space-y-6">
            <div className="bg-white border border-teal-900/10 p-8 rounded-[40px] shadow-sm relative overflow-hidden group">
               <Fingerprint size={100} className="absolute -right-4 -bottom-4 text-teal-900/5 group-hover:rotate-12 transition-transform duration-700" />
               <h4 className="text-xs font-black text-teal-950 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Lock size={14} /> Global Lockdown
               </h4>
               <p className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed mb-6">
                 Initiate total system freeze. All active sessions will be terminated and vault nodes encrypted.
               </p>
               <button className="w-full py-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm">
                 Kill System Node
               </button>
            </div>

            <div className="bg-teal-950 p-8 rounded-[40px] text-white shadow-xl">
               <h4 className="text-xs font-black text-teal-400 uppercase tracking-widest mb-4">Security Insights</h4>
               <div className="space-y-4">
                  <div className="flex gap-3">
                     <AlertTriangle size={16} className="text-yellow-500 shrink-0" />
                     <p className="text-[10px] font-bold text-teal-100/60 uppercase leading-tight">
                       Multiple failed login attempts from IP node 192.168.0.44 (Lagos, NG).
                     </p>
                  </div>
                  <div className="flex gap-3">
                     <Zap size={16} className="text-teal-400 shrink-0" />
                     <p className="text-[10px] font-bold text-teal-100/60 uppercase leading-tight">
                       System optimized: New encryption keys rotated 4 hours ago.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

  );
};

export default CrestlineSecOps;