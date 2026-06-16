import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, Filter, Plus, ChevronRight, Loader2,
  Shield, UserCheck, Activity, HardDrive, Download, Cpu
} from "lucide-react";

const CrestlineAdminStaff = () => {
  const navigate = useNavigate();

  const [staffRegistry, setStaffRegistry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const fetchLiveRegistry = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("admin_crestline_token");
      const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5300/admin';

      const response = await fetch(`${API_URL}/personnel/admin?filter=All`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("admin_crestline_token");
          navigate('/');
          return;
        }
        throw new Error(result.message || 'Database link error.');
      }

  
      setStaffRegistry(result.data || result.admins || result.staffs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchLiveRegistry();
  }, [fetchLiveRegistry]);

 
  const filteredRegistry = staffRegistry.filter((admin) => {
    const targetId = (admin.serialDesignation || admin.id || admin._id || '').toLowerCase();
    const targetName = (admin.fullName || admin.name || '').toLowerCase();
    const cleanQuery = searchQuery.trim().toLowerCase();
    
    return targetId.includes(cleanQuery) || targetName.includes(cleanQuery);
  });

 
  if (loading && staffRegistry.length === 0) {
    return (
      <div className="w-full h-[50vh] flex flex-col items-center justify-center gap-3 text-slate-700 font-medium">
        <Loader2 className="animate-spin text-slate-900" size={32} />
        <p className="text-xs uppercase tracking-widest font-bold">Synchronizing Live System Registry...</p>
      </div>
    );
  }

 
  if (error) {
    return (
      <div className="w-full p-8 bg-rose-50 border border-rose-200 rounded-[32px] text-left">
        <h4 className="text-rose-900 font-black uppercase text-sm tracking-wide">Registry Synchronization Fault</h4>
        <p className="text-xs text-rose-700/80 font-medium mt-1">{error}</p>
        <button 
          onClick={fetchLiveRegistry} 
          className="mt-4 px-4 py-2 bg-rose-900 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all hover:bg-rose-800"
        >
          Reconnect Vector Database
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 text-left">
      
    
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-slate-950 p-2 rounded-lg shadow-lg">
              <Cpu size={24} className="text-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              Crestline <span className="text-slate-500">Admin Staff</span>
            </h1>
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
              Crestline Microfinance Bank • Security & Node Directory
          </p>
        </div>

        <div className="flex gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="SEARCH CRESTLINE REGISTRY..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none text-slate-900 focus:ring-2 focus:ring-slate-500/20 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-800 shadow-sm">
            <Filter size={18} />
          </button>
          <button 
            onClick={() => navigate('/admin/staff/onboard')}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-2"
          >
            <Plus size={14} /> Onboard Node
          </button>
        </div>
      </div>

      {/* SYSTEM METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
              { label: "Crestline Nodes", val: filteredRegistry.length.toString(), icon: HardDrive, color: "text-slate-600" },
              { label: "Active Sessions", val: "14", icon: Activity, color: "text-emerald-500" },
              { label: "Auth Success", val: "100%", icon: UserCheck, color: "text-blue-500" },
              { label: "Global Roots", val: filteredRegistry.length.toString(), icon: Shield, color: "text-purple-600" },
          ].map((stat, i) => (
              <div key={i} className="bg-white border border-slate-200 p-5 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                  <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                      <p className="text-2xl font-black text-slate-900 italic block">{stat.val}</p>
                  </div>
                  <div className="p-2 bg-slate-100 rounded-lg">
                     <stat.icon size={20} className={stat.color} />
                  </div>
              </div>
          ))}
      </div>

      {/* REGISTRY TABLE */}
      <div className="bg-white border border-slate-200 rounded-[40px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Node Identity</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Serial Designation</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Authority Tier</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Routing Endpoint</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Last Login</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase text-slate-500 tracking-widest">Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRegistry.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-12 text-center text-xs font-bold uppercase tracking-widest text-slate-400 italic">
                    No matching records located in administrative index.
                  </td>
                </tr>
              ) : (
                filteredRegistry.map((admin) => {
                  const currentId = admin.serialDesignation || admin.id || admin._id || "ADM-2026-N/A";
                  const currentName = admin.fullName || admin.name || "Unassigned Operator";
                  const currentClearance = admin.clearanceLevel || "LEVEL 0: GLOBAL ROOT";
                  const terminalIp = admin.terminalIp || "0.0.0.0";
                  const lastLogin = admin.lastLogin || "Never";

                  return (
                    <tr key={currentId} className="hover:bg-slate-50/80 transition-all group">
                      
                      {/* NODE IDENTITY */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs italic shadow-md group-hover:scale-110 transition-transform select-none">
                            {currentName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-950 uppercase tracking-tight block">{currentName}</p>
                            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-tighter block">{admin.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* SERIAL DESIGNATION COLUMN ADDED */}
                      <td className="px-8 py-6 text-xs font-mono font-black tracking-wider text-slate-900">
                        {currentId}
                      </td>

                      {/* AUTHORITY TIER */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                            <span className="px-2 py-1 rounded-md text-[9px] font-black text-white shadow-sm bg-slate-950">
                                {currentId.split('-')[0] || "ADM"}
                            </span>
                            <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest block">{currentClearance}</p>
                        </div>
                      </td>

                      {/* ROUTING ENDPOINT IP */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <p className="text-[11px] font-mono font-bold uppercase tracking-widest block text-emerald-700">
                            {terminalIp}
                          </p>
                        </div>
                      </td>

                      {/* LAST LOGIN */}
                      <td className="px-8 py-6 text-[10px] font-mono font-bold text-slate-500 uppercase">
                        {lastLogin}
                      </td>

                      {/* ACTIONS ROW CONTROL */}
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => navigate(`/admin/personnel/insecption/${currentId}`)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-800 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95"
                        >
                          Inspect <ChevronRight size={12} />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* FOOTER */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
              Crestline Secure Terminal • Registry V1.04
           </p>
           <button className="flex items-center gap-2 text-[9px] font-black text-slate-800 uppercase tracking-widest hover:text-slate-600 transition-colors">
              <Download size={14} /> Export Crestline Records
           </button>
        </div>
      </div>
    </div>
  );
};

export default CrestlineAdminStaff;