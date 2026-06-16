import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, ShieldCheck, RefreshCcw, 
  AlertTriangle, X, Loader2, ShieldAlert
} from "lucide-react";

const CrestlineModifyAdminStaff = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Admin serialDesignation (e.g., CL-2001)
  
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [adminDetails, setAdminDetails] = useState({
    name: "",
    clearance: "LEVEL 0: GLOBAL ROOT",
  });

  const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5300/admin';
  const token = localStorage.getItem("admin_crestline_token");

  const fetchCurrentDetails = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/personnel/admin/${id}`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const result = await response.json();
      
      if (response.ok && result.data) {
        setAdminDetails({
          name: result.data.fullName || result.data.name || "Unknown Operator",
          clearance: result.data.clearanceLevel || "LEVEL 0: GLOBAL ROOT"
        });
      } else {
        console.error("Failed to parse registry: ", result.message);
      }
    } catch (err) {
      console.error("Error linking to administrative index:", err);
    } finally {
      setLoading(false);
    }
  }, [id, token, API_URL]);

  useEffect(() => {
    if (id) fetchCurrentDetails();
  }, [id, fetchCurrentDetails]);


  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_URL}/personnel/admin/${id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          clearanceLevel: adminDetails.clearance
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Reassignment protocol rejected by backend engine configuration.");
      }
      
      alert("Admin security level credentials reassigned clean.");
      navigate(-1);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[50vh] flex flex-col items-center justify-center gap-2 text-slate-950 font-bold uppercase tracking-widest text-xs">
        <Loader2 size={32} className="animate-spin text-slate-950" />
        Pulling Administrative Profile Matrix...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto text-left space-y-8 animate-in fade-in duration-500">
      
      {/* MODIFICATION HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b-2 border-slate-200 pb-8">
        <div className="flex items-center gap-5">
          <button onClick={() => navigate(-1)} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <RefreshCcw size={28} className="text-slate-950" /> 
              <h1 className="text-3xl font-black text-slate-950 tracking-tighter uppercase italic">Reassign Admin Clearance</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Modifying Node ID: {id}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate(-1)} className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-red-600 transition-all flex items-center gap-2">
            <X size={14} /> Abort
          </button>
          <button onClick={handleUpdate} disabled={isUpdating} className="px-8 py-3 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50">
            {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} className="text-emerald-400" />}
            {isUpdating ? "Updating Token Hashing..." : "Confirm Reassignment"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          {/* CURRENT PROFILE SUMMARY */}
          <div className="p-6 bg-slate-100 border border-slate-200 rounded-[32px] flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white font-black text-lg italic shadow-lg select-none">
                      {adminDetails.name ? adminDetails.name.charAt(0).toUpperCase() : "A"}
                  </div>
                  <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Core Operator</p>
                      <p className="text-lg font-black text-slate-950 uppercase italic tracking-tight">{adminDetails.name}</p>
                  </div>
              </div>
              <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Level</p>
                  <p className="text-sm font-black text-slate-600 uppercase italic font-mono">{adminDetails.clearance}</p>
              </div>
          </div>

          {/* ALTER MATRIX FORM */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <ShieldAlert size={14} className="text-slate-900" />
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adjust Authority Matrix Level</label>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {[
                      "LEVEL 0: GLOBAL ROOT",
                      "LEVEL 5: EMERGENCY BACKUP TIER",
                      "LEVEL 6: AUDIT ACCESS NODE"
                    ].map((tierString) => (
                        <button
                            key={tierString}
                            type="button"
                            onClick={() => setAdminDetails({ ...adminDetails, clearance: tierString })}
                            className={`py-4 px-4 text-left rounded-xl font-black text-xs transition-all flex justify-between items-center outline-none ${
                                adminDetails.clearance === tierString
                                ? "bg-slate-950 text-white shadow-xl scale-[1.01]"
                                : "bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100"
                            }`}
                        >
                            <span className="font-mono tracking-wide">{tierString}</span>
                            {adminDetails.clearance === tierString && (
                              <span className="text-[10px] text-emerald-400 font-mono animate-pulse">
                                [ACTIVE SELECTION]
                              </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
          </div>
        </div>

        {/* POLICY NOTICES */}
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-100 p-8 rounded-[40px] shadow-sm">
              <AlertTriangle size={32} className="text-amber-600 mb-4" />
              <h4 className="text-xs font-black text-amber-950 uppercase tracking-widest mb-2">System Policy Advisory</h4>
              <p className="text-[11px] font-bold text-amber-800 leading-relaxed uppercase tracking-tight">
                  Altering high level parameters updates token profiles across network databases instantly. Handle with caution.
              </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CrestlineModifyAdminStaff;