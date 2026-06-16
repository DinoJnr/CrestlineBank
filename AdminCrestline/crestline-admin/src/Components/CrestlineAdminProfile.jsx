import React, { useState, useEffect } from "react";
import { 
  User, ShieldCheck, Key, Mail, 
  MapPin, Clock, Smartphone, Edit3, 
  LogOut, Fingerprint, Camera, ShieldAlert,
  Activity, CheckCircle2, Loader2, Save, X
} from "lucide-react";

const CrestlineAdminProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Real Admin State variables
  const [admin, setAdmin] = useState(null);
  
  // Edit Form Fields State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    location: ""
  });

  // ── CENTRALIZED RUNTIME HOST GATEWAY ──
  const API_BASE_URL = "http://localhost:5300/admin/profile";

  // 1. Fetch live administrative profile parameters on mount
  // 1. Fetch live administrative profile parameters on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("admin_crestline_token") || localStorage.getItem("adminToken");

        const response = await fetch(API_BASE_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP Error Status: ${response.status}`);
        }

        const json = await response.json();
        if (json.success && json.data) {
          const profileData = json.data;
          setAdmin(profileData);
          setFormData({
            name: profileData.name || profileData.fullName || "",
            email: profileData.email || "",
            role: profileData.role || profileData.clearanceLevel || "",
            location: profileData.location || "Lagos, NG"
          });
        }
      } catch (err) {
        console.error("Failed to map dynamic administrative context node:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const token = localStorage.getItem("admin_crestline_token") || localStorage.getItem("adminToken");

      const response = await fetch(`${API_BASE_URL}/update`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error Status: ${response.status}`);
      }

      const json = await response.json();
      
      if (json.success) {
        const updatedProfile = json.data || json.profile;
        setAdmin(updatedProfile);
        setFormData({
          name: updatedProfile.name || updatedProfile.fullName || "",
          email: updatedProfile.email || "",
          role: updatedProfile.role || updatedProfile.clearanceLevel || "",
          location: updatedProfile.location || "Lagos, NG"
        });
        setIsEditing(false);
        alert("Administrative profile ledger synchronized safely.");
      } else {
        alert("Operation failed: " + json.message);
      }
    } catch (err) {
      console.error(err);
      alert("Network routing frame breakdown saving profile updates.");
    } finally {
      setIsSaving(false);
    }
  };

 
  const handleTerminateSessions = () => {
    if (window.confirm("Are you sure you want to invalidate all active administrative session keys?")) {
      localStorage.removeItem("admin_crestline_token");
      localStorage.removeItem("adminToken");
      alert("Access authorization footprints wiped clean.");
      window.location.reload();
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 w-full flex items-center justify-center gap-2 text-teal-950 font-black uppercase text-[10px] tracking-widest">
        <Loader2 className="animate-spin text-teal-600" size={16} />
        Syncing Secure Administrative Dossier...
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="h-96 w-full flex flex-col items-center justify-center gap-2 text-red-700 font-bold uppercase text-xs p-8 text-center">
        <ShieldAlert size={24} className="mb-2" />
        Failed to establish administrative core context interface.
        <span className="text-[10px] text-gray-400 block mt-1 font-mono normal-case">Verify backend route mounts at /admin/profile</span>
      </div>
    );
  }

  
  const currentDisplayName = admin.name || admin.fullName || "Admin Operator";
  const avatarInitials = currentDisplayName
    ? currentDisplayName.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left garments-canvas animate-in fade-in duration-700">
      
      {/* --- PROFILE HEADER --- */}
      <div className="relative group">
        <div className="h-48 w-full bg-teal-950 rounded-[48px] overflow-hidden relative shadow-2xl">
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
           <div className="absolute -bottom-10 -right-10 text-white/5 rotate-12 select-none pointer-events-none">
              <ShieldCheck size={280} />
           </div>
        </div>

        <div className="absolute -bottom-12 left-12 flex flex-col md:flex-row items-end gap-6 w-full pr-24">
          <div className="relative flex-shrink-0">
              <div className="w-32 h-32 rounded-[32px] bg-white p-1.5 shadow-2xl">
                  <div className="w-full h-full bg-teal-100 rounded-[24px] flex items-center justify-center text-teal-900 font-black text-4xl italic border-4 border-white select-none">
                      {avatarInitials}
                  </div>
              </div>
              <button type="button" className="absolute -bottom-2 -right-2 p-2 bg-teal-600 text-white rounded-xl shadow-lg border-2 border-white hover:bg-black transition-all">
                  <Camera size={16} />
              </button>
          </div>
          
          <div className="pb-4 w-full">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-black text-teal-950 tracking-tighter uppercase italic">{currentDisplayName}</h1>
              <span className="px-3 py-1 bg-teal-950 text-teal-400 text-[9px] font-black uppercase tracking-widest rounded-lg">
                  {admin.tier || admin.clearanceLevel || "LEVEL 0: GLOBAL ROOT"}
              </span>
            </div>
            <p className="text-[10px] font-black text-teal-900/40 uppercase tracking-[0.3em] mt-1">Personnel ID: {admin.serial || admin.serialDesignation || admin._id || "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-12">
        
        {/* --- LEFT: CORE INFO AND FORM MATRIX --- */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-teal-900/10 rounded-[48px] p-10 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-teal-950">Credential Dossier</h3>
                  {!isEditing ? (
                    <button 
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 text-[10px] font-black uppercase text-teal-600 hover:text-teal-950 transition-colors"
                    >
                        <Edit3 size={14} /> Update Details
                    </button>
                  ) : (
                    <button 
                        type="button"
                        onClick={() => { 
                          setIsEditing(false); 
                          setFormData({ 
                            name: admin.name || admin.fullName || "", 
                            email: admin.email || "", 
                            role: admin.role || admin.clearanceLevel || "", 
                            location: admin.location || "Lagos, NG" 
                          }); 
                        }}
                        className="flex items-center gap-1.5 text-[10px] font-black uppercase text-gray-400 hover:text-black transition-colors"
                    >
                        <X size={14} /> Cancel
                    </button>
                  )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveChanges} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-teal-900/40 uppercase tracking-widest">Full Name</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 border border-teal-900/10 rounded-xl font-bold text-sm text-teal-950 focus:outline-none focus:border-teal-600"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-teal-900/40 uppercase tracking-widest">Primary Email</label>
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 border border-teal-900/10 rounded-xl font-bold text-sm text-teal-950 focus:outline-none focus:border-teal-600"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-teal-900/40 uppercase tracking-widest">Assigned Role / Level</label>
                      <input 
                        type="text" 
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="w-full px-4 py-3 border border-teal-900/10 rounded-xl font-bold text-sm text-teal-950 bg-slate-50 border-dashed cursor-not-allowed select-none"
                        disabled
                        readOnly
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-teal-900/40 uppercase tracking-widest">Access Location</label>
                      <input 
                        type="text" 
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full px-4 py-3 border border-teal-900/10 rounded-xl font-bold text-sm text-teal-950 focus:outline-none focus:border-teal-600"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-teal-950 hover:bg-teal-900 text-white font-black uppercase text-[9px] tracking-widest rounded-xl transition-all disabled:opacity-50 shadow-md"
                  >
                    {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                    {isSaving ? "Saving Ledger..." : "Commit Parameters"}
                  </button>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-8">
                    {[
                        { label: "Primary Email", val: admin.email || "None Configured", icon: Mail },
                        { label: "Assigned Role", val: admin.role || admin.clearanceLevel || "Global Infrastructure Operator", icon: ShieldCheck },
                        { label: "Access Location", val: admin.location || "Lagos, NG", icon: MapPin },
                        { label: "Last Session", val: admin.lastLogin || "Recent Active Session", icon: Clock },
                    ].map((item, i) => (
                        <div key={i} className="space-y-1 border-l-2 border-teal-900/5 pl-4 group hover:border-teal-600 transition-all">
                            <p className="text-[9px] font-black text-teal-900/30 uppercase tracking-widest flex items-center gap-2">
                                <item.icon size={12} /> {item.label}
                            </p>
                            <p className="text-sm font-bold text-teal-950">{item.val}</p>
                        </div>
                    ))}
                </div>
              )}
          </div>

          {/* RERECENT ACTIONS LOG */}
          <div className="bg-teal-900/5 border border-teal-900/10 rounded-[48px] p-10">
              <div className="flex items-center gap-3 mb-8">
                  <Activity size={18} className="text-teal-950" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-teal-950">Personal Activity Log</h3>
              </div>
              <div className="space-y-4">
                  {[
                      "Modified Interest Rates on Savings Node",
                      "Authorized Staff Enrollment: STF-2026-092",
                      "Updated Liquidity Threshold Policy",
                      "Performed Global System Sync"
                  ].map((log, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-teal-900/5 shadow-sm">
                         <p className="text-[10px] font-bold text-teal-950 uppercase tracking-tight">{log}</p>
                         <span className="text-[8px] font-mono text-teal-900/30">JUN 15, 2026</span>
                      </div>
                  ))}
              </div>
          </div>
        </div>

        {/* --- RIGHT: SECURITY CENTER --- */}
        <div className="space-y-6">
          <div className="bg-teal-950 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
              <Key size={120} className="absolute -right-10 -bottom-10 text-white/5 -rotate-12 select-none pointer-events-none" />
              <h4 className="text-xs font-black text-teal-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Fingerprint size={16} /> Auth Settings
              </h4>
              
              <div className="space-y-4 relative z-10">
                  <button type="button" className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-white/10 transition-all outline-none">
                      <p className="text-[10px] font-black uppercase text-white mb-1">Two-Factor Auth</p>
                      <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <p className="text-[9px] font-bold text-white/40 uppercase">Encrypted & Enabled</p>
                      </div>
                  </button>
                  <button type="button" className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-white/10 transition-all outline-none">
                      <p className="text-[10px] font-black uppercase text-white mb-1">Passphrase</p>
                      <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Last changed: 32 days ago</p>
                  </button>
              </div>
          </div>

          <div className="bg-white border border-teal-900/10 p-8 rounded-[40px] shadow-sm">
              <h4 className="text-[10px] font-black text-teal-900/30 uppercase tracking-widest mb-6">Device Sessions</h4>
              <div className="space-y-4">
                  <div className="flex items-center gap-4">
                      <Smartphone size={20} className="text-teal-600" />
                      <div>
                          <p className="text-[10px] font-black text-teal-950 uppercase italic">MacBook Pro M3</p>
                          <p className="text-[9px] font-bold text-teal-900/40 uppercase tracking-widest">Active Now • Lagos, NG</p>
                      </div>
                  </div>
              </div>
          </div>

          <button 
            type="button"
            onClick={handleTerminateSessions}
            className="w-full py-5 bg-red-50 text-red-600 border border-red-100 rounded-[28px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-3 outline-none"
          >
              <LogOut size={16} /> Terminate All Sessions
          </button>
        </div>

      </div>
    </div>
  );
};

export default CrestlineAdminProfile;