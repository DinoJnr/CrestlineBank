import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, UserPlus, ShieldAlert, 
  Fingerprint, Zap, ShieldCheck, 
  Mail, Phone, User, Briefcase, 
  Save, X, Loader2 
} from "lucide-react";
import CrestlineAdminLayout from "./CrestlineAdminLayout";

const CrestlineAddAdminStaff = () => {
  const navigate = useNavigate();
  const [isProvisioning, setIsProvisioning] = useState(false);

  
  const [formData, setFormData] = useState({
    name: "",
    role: "Ops Analyst",
    email: "",
    phone: "",
    clearance: "Level 1",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProvision = () => {
    setIsProvisioning(true);
  
    setTimeout(() => {
      setIsProvisioning(false);
      navigate("/admin/staff");
    }, 2500);
  };

  const InputWrapper = ({ label, name, placeholder, icon: Icon, type = "text" }) => (
    <div className="bg-white border border-teal-900/10 p-5 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-teal-600" />
        <label className="text-[10px] font-black text-teal-900/40 uppercase tracking-widest">{label}</label>
      </div>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={formData[name]}
        onChange={handleChange}
        className="w-full bg-transparent text-sm font-bold text-teal-950 font-mono outline-none placeholder:text-teal-900/10"
      />
    </div>
  );

  return (
    
      <div className="max-w-6xl mx-auto text-left space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* --- ONBOARDING HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b-2 border-teal-900/5 pb-8">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => navigate(-1)}
              className="p-3 bg-white border border-teal-900/10 rounded-xl hover:bg-teal-900 hover:text-white transition-all shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-teal-950 tracking-tighter uppercase italic flex items-center gap-3">
                <UserPlus size={32} className="text-teal-600" /> Onboard Admin
              </h1>
              <p className="text-[10px] font-black text-teal-700/50 uppercase tracking-[0.3em]">Crestline Node Provisioning System</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-white border border-teal-900/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-red-600 transition-all flex items-center gap-2"
            >
              <X size={14} /> Cancel
            </button>
            <button 
              onClick={handleProvision}
              disabled={isProvisioning}
              className="px-8 py-3 bg-teal-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isProvisioning ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} className="text-teal-400" />}
              {isProvisioning ? "Encrypting Node..." : "Provision Admin"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Primary Form */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2 border-l-4 border-teal-900 pl-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-teal-950">Primary Credentials</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputWrapper label="Legal Name" name="name" placeholder="E.G. OLUMIDE JOHNSON" icon={User} />
                <InputWrapper label="Work Email" name="email" placeholder="O.JOHNSON@CRESTLINE.COM" icon={Mail} type="email" />
                <InputWrapper label="Secure Phone" name="phone" placeholder="+234..." icon={Phone} type="tel" />
                
                <div className="bg-white border border-teal-900/10 p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase size={14} className="text-teal-600" />
                    <label className="text-[10px] font-black text-teal-900/40 uppercase tracking-widest">Initial Designation</label>
                  </div>
                  <select 
                    name="role" 
                    value={formData.role} 
                    onChange={handleChange}
                    className="w-full bg-transparent text-sm font-bold text-teal-950 uppercase outline-none cursor-pointer"
                  >
                    <option>Ops Analyst</option>
                    <option>Branch Manager</option>
                    <option>Security Officer</option>
                    <option>System Administrator</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Clearance Table Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2 border-l-4 border-teal-900 pl-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-teal-950">Set Initial Authority Level</h3>
              </div>
              <div className="bg-white border border-teal-900/5 rounded-[32px] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-teal-900/5">
                    {[
                      { level: "1", title: "Observer", desc: "View-only access." },
                      { level: "2", title: "Associate", desc: "Update customer records." },
                      { level: "3", title: "Manager", desc: "Authorize transfers." },
                      { level: "4", title: "Director", desc: "Full branch overrides." },
                      { level: "5", title: "Super-Admin", desc: "Master system control." },
                    ].map((item) => (
                      <tr 
                        key={item.level}
                        onClick={() => setFormData({...formData, clearance: `Level ${item.level}`})}
                        className={`cursor-pointer transition-all ${
                          formData.clearance === `Level ${item.level}` ? 'bg-teal-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                            formData.clearance === `Level ${item.level}` ? 'bg-teal-950 text-white shadow-md' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {item.level}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-black uppercase text-teal-950 tracking-tight">{item.title}</td>
                        <td className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-tight">{item.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Security Context */}
          <div className="space-y-6">
            <div className="bg-teal-950 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                <Fingerprint size={120} className="absolute -right-10 -bottom-10 text-white/5" />
                <div className="relative z-10">
                  <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <ShieldCheck size={14} /> Provisioning Protocol
                  </h4>
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1" />
                      <p className="text-[10px] font-bold text-teal-100/60 uppercase leading-tight">Biometric link will be sent to the registered email.</p>
                    </li>
                    <li className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1" />
                      <p className="text-[10px] font-bold text-teal-100/60 uppercase leading-tight">Temporary access keys expire in 24 hours.</p>
                    </li>
                  </ul>
                </div>
            </div>

            <div className="bg-orange-50 border border-orange-100 p-6 rounded-[32px] flex gap-4">
                <ShieldAlert className="text-orange-600 flex-shrink-0" size={20} />
                <p className="text-[10px] font-bold text-orange-800 leading-tight uppercase">
                  Onboarding a new administrator requires a secure connection. This action is logged under the <span className="text-orange-950 font-black underline">Crestline Compliance Act</span>.
                </p>
            </div>
          </div>

        </div>
      </div>
    
  );
};

export default CrestlineAddAdminStaff;