import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, ShieldAlert, Power, RefreshCw, 
  UserMinus, Terminal, Database, Key, 
  History, AlertCircle, CheckCircle2, Loader2
} from "lucide-react";

const CrestlineStaffManagement = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Captured from your dynamic App.jsx route parameter
  const [isProcessing, setIsProcessing] = useState(null);
  const [systemMessage, setSystemMessage] = useState(null);

  // --- CORE TERMINAL SYSTEM COMMAND DISPATCH MATRIX ---
  const performAction = async (actionName) => {
    setIsProcessing(actionName);
    setSystemMessage(null);

    const token = localStorage.getItem("admin_crestline_token");
    const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5300/admin';
    
    let endpoint = `${API_URL}/personnel/staffs/${id}`;
    let options = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    try {
      switch (actionName) {
        case "Kill Session":
          options.method = "POST";
          endpoint += "/terminate-sessions";
          break;
        case "Reset MFA":
          options.method = "POST";
          endpoint += "/reset-mfa";
          break;
        case "Database Sync":
          options.method = "POST";
          endpoint += "/sync-ledger";
          break;
        case "Flag Profile":
          options.method = "PATCH";
          endpoint += "/flag-audit";
          options.body = JSON.stringify({ auditReason: "Manual administrative flag" });
          break;
        case "Restrict Access":
          options.method = "PATCH";
          endpoint += "/suspend";
          options.body = JSON.stringify({ isSuspended: true });
          break;
        case "Offboard Staff":
          options.method = "DELETE"; 
          break;
        default:
          throw new Error("Unknown terminal system command code mapping.");
      }

      const response = await fetch(endpoint, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Execution failure on operation: ${actionName}`);
      }

      setSystemMessage({
        type: "success",
        text: result.message || `System Command [${actionName}] deployed successfully.`
      });

      if (actionName === "Offboard Staff") {
        setTimeout(() => navigate("/admin/personnel/staffs"), 2000);
      }

    } catch (error) {
      setSystemMessage({ type: "error", text: error.message });
    } finally {
      setIsProcessing(null);
    }
  };

  const CommandCard = ({ title, desc, icon: Icon, variant = "default" }) => (
    <div className={`p-6 rounded-[32px] border transition-all flex flex-col justify-between h-full ${
      variant === "danger" 
      ? "bg-red-50 border-red-100 hover:border-red-200" 
      : "bg-white border-teal-900/5 hover:border-teal-900/20 shadow-sm"
    }`}>
      <div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
          variant === "danger" ? "bg-red-100 text-red-600" : "bg-teal-950 text-white"
        }`}>
          <Icon size={20} />
        </div>
        <h4 className={`text-sm font-black uppercase tracking-tight mb-2 ${variant === "danger" ? "text-red-900" : "text-teal-950"}`}>
          {title}
        </h4>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
          {desc}
        </p>
      </div>
      <button 
        onClick={() => performAction(title)}
        disabled={isProcessing !== null}
        className={`mt-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2 ${
          variant === "danger" 
          ? "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200" 
          : "bg-teal-950 text-white hover:bg-black shadow-lg"
        } disabled:opacity-40 disabled:pointer-events-none`}
      >
        {isProcessing === title ? <Loader2 size={14} className="animate-spin" /> : "Execute Command"}
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto text-left space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* --- TELEMETRY NOTIFICATION LAYER --- */}
      {systemMessage && (
        <div className={`p-5 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center gap-3 ${
          systemMessage.type === "success" 
          ? "bg-emerald-50 border-emerald-200 text-emerald-950" 
          : "bg-rose-50 border-rose-200 text-rose-950"
        }`}>
          {systemMessage.type === "success" ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertCircle size={16} className="text-rose-600" />}
          <span>{systemMessage.text}</span>
        </div>
      )}

      {/* --- MANAGEMENT HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b-2 border-teal-900/5 pb-8">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white border border-teal-900/10 rounded-xl hover:bg-teal-900 hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <Terminal size={14} className="text-teal-600" />
               <h1 className="text-3xl font-black text-teal-950 tracking-tighter uppercase italic">Manage Node</h1>
            </div>
            <p className="text-[10px] font-black text-teal-700/50 uppercase tracking-[0.3em]">Direct Command Interface: {id}</p>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 px-6 py-3 rounded-2xl flex items-center gap-3">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
           <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Node Heartbeat: Stable</p>
        </div>
      </div>

      {/* --- CRITICAL ACTIONS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CommandCard title="Kill Session" desc="Instantly terminate all active terminal sessions for this user." icon={Power} />
        <CommandCard title="Reset MFA" desc="Invalidate current authenticator and trigger new enrollment." icon={Key} />
        <CommandCard title="Database Sync" desc="Force re-sync of staff permissions with the central ledger." icon={Database} />
        <CommandCard title="Flag Profile" desc="Mark node for immediate internal compliance audit." icon={AlertCircle} />
      </div>

      {/* --- DANGER ZONE SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <div className="flex items-center gap-3 mb-4 border-l-4 border-red-600 pl-4">
              <ShieldAlert size={18} className="text-red-600" />
              <h3 className="text-xs font-black uppercase tracking-widest text-red-950 italic">Danger Zone / Permanent Decommissioning</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CommandCard title="Restrict Access" desc="Place a temporary block on all banking operations for this node." icon={ShieldAlert} variant="danger" />
              <CommandCard title="Offboard Staff" desc="Permanent removal of institutional credentials and record archiving." icon={UserMinus} variant="danger" />
           </div>
        </div>

        {/* --- SYSTEM LOG MINI-BOARD --- */}
        <div className="lg:col-span-1 bg-teal-950 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
           <History size={120} className="absolute -right-10 -bottom-10 text-white/5 -rotate-12" />
           <h3 className="text-sm font-black uppercase tracking-widest text-teal-400 mb-6 flex items-center gap-2">
              <History size={16} /> Recent Command Logs
           </h3>
           <div className="space-y-4 relative z-10">
              <div className="border-l border-teal-700 pl-4 py-1">
                 <p className="text-[10px] font-black uppercase text-teal-100">Auth Token Refresh</p>
                 <p className="text-[9px] text-teal-400 font-bold uppercase tracking-tighter">Admin-01 • 2h ago</p>
              </div>
              <div className="border-l border-teal-700 pl-4 py-1">
                 <p className="text-[10px] font-black uppercase text-teal-100">IP-Whitelist Added</p>
                 <p className="text-[9px] text-teal-400 font-bold uppercase tracking-tighter">System • 5h ago</p>
              </div>
              <div className="border-l border-teal-700 pl-4 py-1">
                 <p className="text-[10px] font-black uppercase text-teal-100">Login Failure (3x)</p>
                 <p className="text-[9px] text-orange-400 font-bold uppercase tracking-tighter">Terminal-04 • 1d ago</p>
              </div>
           </div>
           
           <button className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10 transition-all">
              Download Full Log
           </button>
        </div>
      </div>

      {/* --- COMPLIANCE FOOTER --- */}
      <div className="bg-teal-900/5 p-6 rounded-[32px] border border-teal-900/10 flex items-center gap-4">
         <div className="w-10 h-10 bg-teal-900 text-white rounded-full flex items-center justify-center">
            <CheckCircle2 size={18} />
         </div>
         <div>
            <p className="text-[10px] font-black text-teal-950 uppercase tracking-widest mb-0.5">Authorized Administrative Action</p>
            <p className="text-[11px] font-bold text-teal-700/60 leading-tight">
                All management commands executed on this page are cryptographically signed and irreversible without Super-Admin clearance.
            </p>
         </div>
      </div>

    </div>
  );
};

export default CrestlineStaffManagement;