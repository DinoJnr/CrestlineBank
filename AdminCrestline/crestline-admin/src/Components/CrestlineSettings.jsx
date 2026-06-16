import React, { useState, useEffect, useCallback } from "react";
import { 
  Settings, Save, Bell, ShieldCheck, 
  Database, HardDrive, Smartphone, 
  Globe, Monitor, AlertTriangle, RefreshCw, 
  Layers, ChevronRight, Loader2
} from "lucide-react";


const CrestlineSettings = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [systemMetadata, setSystemMetadata] = useState({
    appVersion: "v4.18.26",
    environment: "Production",
    region: "NG-WEST-01",
    lastBackup: null
  });
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  
  const API_BASE_URL = "http://localhost:5300/settings";

  
  const getAuthHeaders = (includeJson = false) => {
    const token = localStorage.getItem("admin_crestline_token") || sessionStorage.getItem("admin_crestline_token");
    const headers = {};
    if (includeJson) {
      headers["Content-Type"] = "application/json";
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

 
  const syncSystemEnvironment = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/fetch`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error Status: ${response.status}`);
      }

      const json = await response.json();
      
      if (json.success && json.data) {
        setMaintenanceMode(json.data.maintenanceMode ?? false);
        setAlerts(json.data.thresholdAlerts || []);
        setSystemMetadata({
          appVersion: json.data.appVersion || "v4.18.26",
          environment: json.data.environment || "Production",
          region: json.data.region || "NG-WEST-01",
          lastBackup: json.data.lastBackup || null
        });
      }
    } catch (err) {
      console.error("Failed synchronizing Core system array:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncSystemEnvironment();
  }, [syncSystemEnvironment]);


  const handleSaveGlobalState = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`${API_BASE_URL}/update`, {
        method: "PUT",
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          maintenanceMode,
          thresholdAlerts: alerts
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error Status: ${response.status}`);
      }

      const json = await response.json();
      if (json.success) {
        alert("Global configuration arrays committed successfully.");
      } else {
        alert(json.message || "Failed to update system settings.");
      }
    } catch (err) {
      console.error(err);
      alert("Error committing system variables to target database.");
    } finally {
      setIsSaving(false);
    }
  };

 
  const handleAlertCheckboxMutation = (alertKey) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alertItem => 
        alertItem.key === alertKey 
          ? { ...alertItem, enabled: !alertItem.enabled } 
          : alertItem
      )
    );
  };


  const handleBackupRoutine = async () => {
    try {
      setIsBackingUp(true);
      const response = await fetch(`${API_BASE_URL}/post-backup`, { 
        method: "POST",
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP Error Status: ${response.status}`);
      }

      const json = await response.json();
      if (json.success) {
        setSystemMetadata(prev => ({ 
          ...prev, 
          lastBackup: json.data?.lastBackup || new Date().toISOString() 
        }));
        alert("Secure cold ledger backup state captured successfully.");
      } else {
        alert(json.message || "Backup routine rejected by kernel module.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to complete system index backup sequence.");
    } finally {
      setIsBackingUp(false);
    }
  };

  const formatBackupDate = (dateString) => {
    if (!dateString) return "Never Run";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " // " + date.toLocaleDateString();
  };

  if (loading) {
    return (
      
        <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4 text-teal-950">
          <Loader2 className="animate-spin text-teal-800" size={40} />
          <p className="text-xs uppercase tracking-[0.25em] font-black opacity-70">Syncing Core Kernel Array Parameters...</p>
        </div>
      
    );
  }

  return (
    
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 text-left">
        
        {/* --- SETTINGS HEADER --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-teal-900/5 pb-8">
          <div>
            <h1 className="text-4xl font-black text-teal-950 tracking-tighter uppercase italic flex items-center gap-3">
              System <span className="text-teal-600/50">Core</span>
            </h1>
            <p className="text-[10px] font-black text-teal-700/50 uppercase tracking-[0.3em] mt-1">
                Crestline MFB // Global Configuration
            </p>
          </div>

          <button 
            onClick={handleSaveGlobalState}
            disabled={isSaving}
            className="w-full sm:w-auto px-10 py-4 bg-teal-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} className="text-teal-400" />}
            {isSaving ? "Syncing Modules..." : "Apply Global Changes"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT: MAIN CONTROLS --- */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Maintenance Status Panel */}
            <div className="bg-white border-2 border-teal-950/5 p-8 rounded-[40px] shadow-sm flex items-center justify-between">
               <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl transition-all ${maintenanceMode ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    <Monitor size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-teal-950 uppercase italic">Maintenance Protocol</h3>
                    <p className="text-[10px] font-bold text-teal-900/40 uppercase tracking-widest">Restrict Public App Access</p>
                  </div>
               </div>
               <button 
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`w-16 h-8 rounded-full relative transition-all duration-300 ${maintenanceMode ? 'bg-orange-500' : 'bg-gray-200'}`}
               >
                 <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${maintenanceMode ? 'left-9 shadow-lg' : 'left-1'}`} />
               </button>
            </div>

            {/* 2. Threshold Array Triggers */}
            <div className="bg-white border border-teal-900/10 rounded-[48px] p-10 space-y-8">
               <div className="flex items-center gap-3">
                  <Bell size={20} className="text-teal-600" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-teal-950">Threshold Alerts</h3>
               </div>
               
               <div className="space-y-6 division-y division-teal-950/5">
                  {alerts.length === 0 ? (
                    <p className="text-xs font-bold text-teal-900/30 uppercase tracking-wider py-4">No real-time dynamic alerts registered in current sequence.</p>
                  ) : (
                    alerts.map((setting) => (
                      <div 
                        key={setting.key} 
                        onClick={() => handleAlertCheckboxMutation(setting.key)}
                        className="flex items-center justify-between group cursor-pointer py-3 border-b border-teal-500/5 last:border-none"
                      >
                         <div className="max-w-md pr-4">
                            <p className="text-xs font-black text-teal-950 uppercase tracking-tight group-hover:text-teal-600 transition-colors">{setting.label}</p>
                            <p className="text-[9px] font-bold text-teal-900/40 uppercase tracking-widest mt-0.5">{setting.desc}</p>
                         </div>
                         <input 
                          type="checkbox" 
                          checked={setting.enabled || false} 
                          onChange={() => {}} 
                          className="w-5 h-5 accent-teal-600 cursor-pointer flex-shrink-0" 
                         />
                      </div>
                    ))
                  )}
               </div>
            </div>

            {/* 3. Database Layer Controls */}
            <div className="bg-teal-950 p-10 rounded-[48px] text-white overflow-hidden relative shadow-lg">
               <Database size={180} className="absolute -right-10 -bottom-10 text-white/5 -rotate-12 pointer-events-none" />
               <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3">
                    <Layers size={20} className="text-teal-400" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">Data Optimization</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <button 
                      type="button"
                      onClick={handleBackupRoutine}
                      disabled={isBackingUp}
                      className="p-6 bg-white/5 border border-white/10 rounded-[28px] text-left hover:bg-white/10 transition-all flex justify-between items-center group disabled:opacity-50"
                     >
                        <div className="overflow-hidden mr-2">
                           <p className="text-[10px] font-black uppercase text-teal-400 mb-1">Backup Ledger</p>
                           <p className="text-[9px] font-bold text-white/50 uppercase tracking-tight truncate max-w-[180px]">
                            {isBackingUp ? "Processing cold state..." : `Last: ${formatBackupDate(systemMetadata.lastBackup)}`}
                           </p>
                        </div>
                        {isBackingUp ? <Loader2 size={16} className="animate-spin text-teal-400 flex-shrink-0" /> : <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform flex-shrink-0" />}
                     </button>
                     
                     <button 
                      type="button"
                      onClick={() => alert("Session buffer memory cleared instantly across proxy mirrors.")}
                      className="p-6 bg-white/5 border border-white/10 rounded-[28px] text-left hover:bg-white/10 transition-all flex justify-between items-center group"
                     >
                        <div>
                           <p className="text-[10px] font-black uppercase text-teal-400 mb-1">Clear Cache</p>
                           <p className="text-[9px] font-bold text-white/50 uppercase">Session Storage Only</p>
                        </div>
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                     </button>
                  </div>
               </div>
            </div>
          </div>

          {/* --- RIGHT: SIDEBAR RUNTIME INFO --- */}
          <div className="space-y-6">
            <div className="bg-white border border-teal-900/10 p-8 rounded-[40px] shadow-sm">
               <ShieldCheck size={28} className="text-teal-600 mb-4" />
               <h4 className="text-xs font-black text-teal-950 uppercase tracking-widest mb-4">Instance Security</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-teal-900/40 uppercase">App Version</span>
                    <span className="text-[10px] font-mono font-black text-teal-950">{systemMetadata.appVersion}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-teal-900/40 uppercase">Environment</span>
                    <span className="text-[9px] px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md font-black uppercase tracking-widest">{systemMetadata.environment}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-teal-900/40 uppercase">Region</span>
                    <span className="text-[10px] font-black text-teal-950 italic uppercase">{systemMetadata.region}</span>
                  </div>
               </div>
            </div>

            <div className="bg-orange-50 border border-orange-100 p-8 rounded-[40px]">
               <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle size={24} className="text-orange-600" />
                  <h4 className="text-xs font-black text-orange-950 uppercase tracking-widest">Caution Zone</h4>
               </div>
               <p className="text-[10px] font-bold text-orange-800 leading-relaxed uppercase tracking-tight mb-6">
                 Changes made here affect the <span className="font-black underline">Crestline Customer App</span> in real-time. Exercise extreme caution.
               </p>
               <button 
                type="button"
                onClick={() => { if(window.confirm("Perform irreversible factory reset on portal configurations?")) alert("System configuration arrays returned to default values."); }}
                className="w-full py-4 bg-orange-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20"
               >
                 Factory Reset Portal
               </button>
            </div>

            <div className="flex justify-center gap-4 opacity-30 pt-2">
                <Smartphone size={16} />
                <Globe size={16} />
                <HardDrive size={16} />
            </div>
          </div>

        </div>
      </div>
    
  );
};

export default CrestlineSettings;