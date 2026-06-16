import React, { useState, useEffect } from "react";
import { 
  Code2, Percent, Terminal, Copy, 
  ExternalLink, CheckCircle2, Settings2, 
  Plus, DollarSign, Globe, ShieldCheck, 
  Zap, Key, Lock, Eye, EyeOff, Loader2
} from "lucide-react";

const CrestlineFeesAndApi = () => {
  const [activeTab, setActiveTab] = useState('fees'); 
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  
  
  const [fees, setFees] = useState([]);
  const [apiConfig, setApiConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState(null); // Tracks copy text status
  
  
  const [editingFee, setEditingFee] = useState(null);
  const [webhookInput, setWebhookInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  
  const API_BASE = "http://localhost:5300/ops"; 

  
  useEffect(() => {
    const fetchOpsData = async () => {
      try {
        setLoading(true);
        const [feesRes, apiRes] = await Promise.all([
          fetch(`${API_BASE}/fees`).then(r => r.json()),
          fetch(`${API_BASE}/api-config`).then(r => r.json())
        ]);
        
        if (feesRes.success) setFees(feesRes.data);
        if (apiRes.success) {
          setApiConfig(apiRes.data);
          setWebhookInput(apiRes.data.webhookUrl);
        }
      } catch (err) {
        console.error("Error loading operational profiles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOpsData();
  }, []);

  
  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRotateKeys = async () => {
    if (!window.confirm("WARNING: Rotating production credentials will immediately deprecate your live gateway connection pipelines. Proceed?")) return;
    try {
      setIsSaving(true);
      const res = await fetch(`${API_BASE}/api-config/rotate`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setApiConfig(data.data);
        alert("Production routing credentials systematically cycled.");
      }
    } catch (err) {
      alert("Pipeline error cycling production credentials.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateWebhook = async () => {
    try {
      setIsSaving(true);
      const res = await fetch(`${API_BASE}/api-config/webhook`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl: webhookInput })
      });
      const data = await res.json();
      if (data.success) {
        setApiConfig(data.data);
        alert("Webhook delivery endpoint updated.");
      }
    } catch (err) {
      alert("Failed to write updated webhook configurations.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFee = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await fetch(`${API_BASE}/fees/${editingFee._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingFee)
      });
      const data = await res.json();
      if (data.success) {
        setFees(fees.map(f => f._id === editingFee._id ? data.data : f));
        setEditingFee(null);
      }
    } catch (err) {
      alert("Error saving fee adjustments.");
    } finally {
      setIsSaving(false);
    }
  };

  
  const formatFeeValue = (fee) => {
    if (fee.type === "Flat") return `₦${fee.flatAmount.toLocaleString()}`;
    if (fee.type === "Percentage") return `${fee.percentageAmount}%`;
    return `₦${fee.flatAmount.toLocaleString()} + ${fee.percentageAmount}%`;
  };

  if (loading) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center gap-3 text-teal-950 font-black uppercase text-xs tracking-widest">
        <Loader2 className="animate-spin text-teal-600" size={20} />
        Syncing Crestline Ledger Rules...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* --- DUAL HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-teal-900/5 pb-8">
        <div>
          <h1 className="text-4xl font-black text-teal-950 tracking-tighter uppercase italic flex items-center gap-3">
            Monetization <span className="text-teal-600/50">&</span> Ops
          </h1>
          <p className="text-[10px] font-black text-teal-700/50 uppercase tracking-[0.3em] mt-1">
            Crestline MFB // Fee Ledger & API Gateway
          </p>
        </div>

        <div className="flex bg-teal-900/5 p-1.5 rounded-[20px] border border-teal-900/5">
          <button 
            onClick={() => setActiveTab('fees')}
            className={`px-6 py-2.5 rounded-[15px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'fees' ? 'bg-teal-950 text-white shadow-lg' : 'text-teal-900/40 hover:text-teal-900'}`}
          >
            Fee Structure
          </button>
          <button 
            onClick={() => setActiveTab('api')}
            className={`px-6 py-2.5 rounded-[15px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'api' ? 'bg-teal-950 text-white shadow-lg' : 'text-teal-900/40 hover:text-teal-900'}`}
          >
            API Console
          </button>
        </div>
      </div>

      {activeTab === 'fees' ? (
        /* --- FEE MANAGEMENT VIEW --- */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-teal-950">Active Revenue Rules</h3>
            </div>

            {/* Inline Editor Drawer Utility */}
            {editingFee && (
              <form onSubmit={handleSaveFee} className="p-6 bg-teal-50 border border-teal-900/10 rounded-[32px] space-y-4 animate-in fade-in duration-200">
                <h4 className="text-[10px] font-black text-teal-950 uppercase tracking-wider">Modify Rule: {editingFee.name}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[9px] font-black uppercase text-teal-900/60 mb-1">Metric Type</label>
                    <select 
                      className="w-full bg-white border border-teal-900/10 p-2.5 rounded-xl font-bold text-xs uppercase"
                      value={editingFee.type}
                      onChange={(e) => setEditingFee({...editingFee, type: e.target.value})}
                    >
                      <option value="Flat">Flat</option>
                      <option value="Percentage">Percentage</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>
                  {(editingFee.type === "Flat" || editingFee.type === "Mixed") && (
                    <div>
                      <label className="block text-[9px] font-black uppercase text-teal-900/60 mb-1">Flat Rate (₦)</label>
                      <input 
                        type="number" 
                        className="w-full bg-white border border-teal-900/10 p-2 rounded-xl font-mono text-xs font-bold"
                        value={editingFee.flatAmount}
                        onChange={(e) => setEditingFee({...editingFee, flatAmount: Number(e.target.value)})}
                      />
                    </div>
                  )}
                  {(editingFee.type === "Percentage" || editingFee.type === "Mixed") && (
                    <div>
                      <label className="block text-[9px] font-black uppercase text-teal-900/60 mb-1">Percentage Rate (%)</label>
                      <input 
                        type="number" step="0.01"
                        className="w-full bg-white border border-teal-900/10 p-2 rounded-xl font-mono text-xs font-bold"
                        value={editingFee.percentageAmount}
                        onChange={(e) => setEditingFee({...editingFee, percentageAmount: Number(e.target.value)})}
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setEditingFee(null)} className="px-4 py-2 text-[10px] font-black uppercase rounded-xl border border-teal-900/10 text-teal-950">Cancel</button>
                  <button type="submit" disabled={isSaving} className="px-4 py-2 text-[10px] font-black uppercase rounded-xl bg-teal-950 text-white flex items-center gap-2">
                    {isSaving && <Loader2 size={12} className="animate-spin" />} Commit Changes
                  </button>
                </div>
              </form>
            )}

            <div className="bg-white border border-teal-900/5 rounded-[40px] overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-teal-950 text-white">
                  <tr>
                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest">Service Name</th>
                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest">Metric</th>
                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest">Rate</th>
                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-900/5">
                  {fees.map((fee) => (
                    <tr key={fee._id} className="hover:bg-teal-50 transition-colors group">
                      <td className="px-8 py-6">
                         <p className="text-sm font-black text-teal-950 uppercase italic tracking-tight">{fee.name}</p>
                      </td>
                      <td className="px-8 py-6">
                         <span className="text-[10px] font-bold text-teal-900/40 uppercase">{fee.type}</span>
                      </td>
                      <td className="px-8 py-6">
                         <p className="text-sm font-mono font-black text-teal-600">{formatFeeValue(fee)}</p>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${fee.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="text-[10px] font-black text-teal-950 uppercase">{fee.status}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                          onClick={() => setEditingFee(fee)}
                          className="p-2 hover:bg-teal-900 hover:text-white rounded-lg transition-colors"
                         >
                            <Settings2 size={14} />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[40px]">
               <Percent className="text-emerald-600 mb-4" size={32} />
               <h4 className="text-xs font-black text-emerald-950 uppercase tracking-widest mb-2">Revenue Impact</h4>
               <p className="text-[11px] font-bold text-emerald-800 leading-relaxed uppercase tracking-tight">
                  Adjusting NIP fees dynamically directly updates downstream accounting registers instantly. Ensure compliance parameters align with current regulatory frameworks.
               </p>
            </div>
            <div className="bg-teal-950 p-8 rounded-[40px] text-white">
              <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-6">Global Overrides</h4>
              <div className="space-y-4">
                <button type="button" onClick={() => alert("Global promo trigger linked via routing profile proxy.")} className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Enable Zero-Fee Promo</button>
                <button type="button" onClick={() => alert("System default VAT rates mapped directly via runtime environment values.")} className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Apply VAT Increase (7.5%)</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* --- API DEVELOPER VIEW --- */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-teal-900/10 p-10 rounded-[48px] shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-teal-900 rounded-2xl text-teal-400">
                     <Key size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-teal-950 uppercase">Production API Keys</h3>
                    <p className="text-[9px] font-bold text-teal-900/40 uppercase tracking-widest">
                      Last rotated: {apiConfig?.lastRotated ? new Date(apiConfig.lastRotated).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleRotateKeys}
                  disabled={isSaving}
                  className="text-[10px] font-black text-teal-600 uppercase border-b-2 border-teal-600 tracking-wider disabled:opacity-50"
                >
                  Rotate Keys
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-6 bg-teal-900/5 rounded-[24px] border border-teal-900/5">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[9px] font-black text-teal-900/30 uppercase tracking-widest">Public Client ID</p>
                    {copiedField === 'clientId' && <span className="text-[9px] font-black text-emerald-600 uppercase">Copied!</span>}
                  </div>
                  <div className="flex items-center justify-between font-mono text-xs font-bold text-teal-950">
                    <span>{apiConfig?.clientId}</span>
                    <button type="button" onClick={() => handleCopy(apiConfig?.clientId, 'clientId')}>
                      <Copy size={14} className="text-teal-900/20 hover:text-teal-950 transition-colors" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 bg-teal-900/5 rounded-[24px] border border-teal-900/5">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[9px] font-black text-teal-900/30 uppercase tracking-widest">Secret Encryption Key</p>
                    {copiedField === 'secretKey' && <span className="text-[9px] font-black text-emerald-600 uppercase">Copied!</span>}
                  </div>
                  <div className="flex items-center justify-between font-mono text-xs font-bold text-teal-950">
                    <span className="truncate mr-4">
                      {apiKeyVisible ? apiConfig?.rawSecretKeyView : "••••••••••••••••••••••••••••••••••••••••"}
                    </span>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button type="button" onClick={() => setApiKeyVisible(!apiKeyVisible)}>
                        {apiKeyVisible ? <EyeOff size={14} className="text-teal-600" /> : <Eye size={14} className="text-teal-900/20" />}
                      </button>
                      <button type="button" onClick={() => handleCopy(apiConfig?.rawSecretKeyView, 'secretKey')}>
                        <Copy size={14} className="text-teal-900/20 hover:text-teal-950 transition-colors" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ENDPOINT MONITOR */}
            <div className="bg-teal-950 p-10 rounded-[48px] text-white">
               <div className="flex items-center gap-3 mb-8">
                  <Terminal size={20} className="text-teal-400" />
                  <h3 className="text-sm font-black uppercase tracking-widest">Endpoint Health</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { path: "/v1/transfers", status: "99ms", health: "Optimal" },
                    { path: "/v1/kyc/verify", status: "240ms", health: "Steady" },
                    { path: "/v1/ledger/balance", status: "45ms", health: "Optimal" },
                  ].map((end, i) => (
                    <div key={i} className="bg-white/5 p-5 rounded-2xl border border-white/5">
                      <p className="text-[9px] font-mono text-teal-400 mb-2">{end.path}</p>
                      <div className="flex justify-between items-center">
                         <span className="text-xs font-black italic">{end.status}</span>
                         <span className="text-[8px] font-black uppercase px-2 py-1 bg-teal-400 text-teal-950 rounded-md">{end.health}</span>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-teal-900/10 p-8 rounded-[40px] shadow-sm">
               <Globe size={24} className="text-teal-600 mb-4" />
               <h4 className="text-xs font-black text-teal-950 uppercase tracking-widest mb-4">Webhooks</h4>
               <div className="space-y-3">
                  <div className="p-4 bg-teal-900/5 rounded-xl border border-teal-900/5">
                     <p className="text-[9px] font-black text-teal-900/40 uppercase mb-1">Primary Endpoint URL</p>
                     <input 
                      type="text"
                      className="w-full bg-transparent font-mono text-[10px] font-bold border-b border-teal-900/10 focus:border-teal-950 outline-none pb-1"
                      value={webhookInput}
                      onChange={(e) => setWebhookInput(e.target.value)}
                     />
                  </div>
                  <button 
                    type="button" 
                    onClick={handleUpdateWebhook}
                    disabled={isSaving}
                    className="w-full py-3 bg-teal-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                  >
                     {isSaving && <Loader2 size={12} className="animate-spin" />} Save Callback Configuration
                  </button>
               </div>
            </div>
            <div className="bg-teal-100/30 border border-teal-100 p-6 rounded-[32px] flex gap-4">
              <ShieldCheck className="text-teal-700 flex-shrink-0" size={20} />
              <p className="text-[10px] font-bold text-teal-900 leading-relaxed uppercase">
                Production API Access is restricted to <span className="font-black italic">Whitelisted IPs</span>. Key rotation is mandatory every 90 days.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrestlineFeesAndApi;