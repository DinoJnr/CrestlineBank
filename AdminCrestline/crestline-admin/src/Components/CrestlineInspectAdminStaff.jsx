import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, Shield, Edit3, Clock, Loader2,
  User, Mail, CheckCircle2, AlertTriangle, Lock, Terminal
} from "lucide-react";

const CrestlineInspectAdminStaff = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Catches serialDesignation parsed via route params URL string

  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5300/admin';
  const token = localStorage.getItem("admin_crestline_token");

  const fetchAdminDossier = useCallback(async () => {
    if (!id || id === ":id") {
      setError("Matrix fault: Route parsing extracted a literal path string placeholder token instead of an admin data index variable.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      
      const response = await fetch(`${API_URL}/personnel/admin/${id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Failed to locate admin system profile registry entry.");
      setAdminData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, token, API_URL]);

  useEffect(() => {
    fetchAdminDossier();
  }, [fetchAdminDossier]);

  if (loading) {
    return (
      <div className="w-full h-[50vh] flex flex-col items-center justify-center gap-2 text-slate-950 font-bold uppercase tracking-widest text-xs">
        <Loader2 size={32} className="animate-spin text-slate-950" />
        Pulling High-Level System Admin Dossier...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 text-rose-950 rounded-3xl text-left">
        <h3 className="font-black text-sm uppercase tracking-wider">Access Node Link Violation</h3>
        <p className="text-xs mt-1 text-rose-700 font-medium">{error}</p>
        <button onClick={fetchAdminDossier} className="mt-4 px-4 py-2 bg-rose-900 text-white font-bold rounded-xl uppercase tracking-widest text-[10px]">Re-Authenticate Vector</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto text-left space-y-8 animate-in fade-in duration-500">
      
      {/* DOSSIER COMMAND HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b-2 border-slate-900/5 pb-8">
        <div className="flex items-center gap-5">
          <button onClick={() => navigate(-1)} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-950 tracking-tighter uppercase italic">Inspect Admin Node</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
              Directory Reference ID: {adminData?.serialDesignation || adminData?._id || id}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => navigate(`/admin/personnel/modify/${id}`)}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-md"
          >
            <Edit3 size={14} /> Reassign Clearance Matrix
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* STRUCTURAL PROFILE INFRASTRUCTURE */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Admin Full Legal Name", val: adminData?.fullName, icon: User },
              { label: "Serial Designation ID", val: adminData?.serialDesignation || "N/A", icon: Lock },
              { label: "Secure Identity Mail Vector", val: adminData?.email, icon: Mail },
              { label: "Active Communication Endpoint Terminal IP", val: adminData?.terminalIp || "0.0.0.0", icon: Terminal },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-slate-200 p-6 rounded-[32px] shadow-sm">
                 <div className="flex items-center gap-2 mb-2 text-slate-400">
                    <item.icon size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                 </div>
                 <p className="text-sm font-bold text-slate-950 font-mono">{item.val}</p>
              </div>
            ))}
          </div>

          {/* ACCESS CLEARANCE LEVEL DISPLAY */}
          <div className="bg-slate-950 p-8 rounded-[40px] text-white relative overflow-hidden shadow-2xl">
             <Shield size={160} className="absolute -right-10 -bottom-10 text-white/5 -rotate-12" />
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Authority Clearance Level</h4>
                  <p className="text-4xl font-black italic tracking-tighter uppercase">{adminData?.clearanceLevel || "LEVEL 0: GLOBAL ROOT"}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                    <Clock size={12} /> Last Access Footprint: {adminData?.lastLogin || "Never"}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                    <CheckCircle2 size={12} className="text-emerald-400" /> 
                    MFA Core Handshake Vector: {adminData?.mfaEnabled ? "SECURED / ACTIVE" : "UNCONFIGURED"}
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* TELEMETRY ADVISORIES */}
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 p-8 rounded-[40px]">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-950 mb-4 border-l-4 border-slate-950 pl-4">Audit Trace Policy</h3>
            <p className="text-[11px] font-bold text-slate-500 uppercase leading-relaxed mb-4">
              This panel explicitly parses data bound onto high level corporate root administration schemas. Global root profiles evaluate configuration controls rather than basic branch department operational data loops.
            </p>
            <div className="flex items-start gap-3 bg-white p-4 border border-slate-200 rounded-2xl">
              <AlertTriangle className="text-amber-500 flex-shrink-0" size={18} />
              <p className="text-[9px] font-bold text-slate-500 uppercase leading-normal">
                To check action tracks for field staffs (e.g. KYC updates, pin changes), inspect distinct branch staff profiles instead.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CrestlineInspectAdminStaff;