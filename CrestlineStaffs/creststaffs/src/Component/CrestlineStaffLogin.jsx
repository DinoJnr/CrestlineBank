import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Lock, Mail, Eye, EyeOff, 
  Briefcase, Cpu, ArrowRight, Loader2,
  ScanFace, ShieldCheck
} from "lucide-react";
import axios from "axios";

const CrestlineStaffLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleInputChange = (e) => {
    const { type, value } = e.target;
    // Clear error messages as user starts typing again
    setErrorMessage(""); 
    setFormData((prev) => ({
      ...prev,
      [type === "email" ? "email" : "password"]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const response = await axios.post("http://localhost:5300/admin/staff-login", {
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        // Save the JSON Web Token securely for middleware verification
        localStorage.setItem("staffcrestline_token", response.data.token);
        localStorage.setItem("staff_profile", JSON.stringify(response.data.staff));
        
        setIsLoading(false);
        navigate("/staff/dashboard");
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.response?.data?.message || "Operational uplink error. Core verification timed out.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F4] flex items-center justify-center p-6 font-sans overflow-hidden">
      {/* Background Grid Pattern - Subtle Industrial feel */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(circle, #042f2e 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />

      <div className="w-full max-w-md relative">
        {/* --- BRANDING --- */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-800 rounded-[28px] shadow-xl mb-6 relative group border-4 border-white">
            <Briefcase size={32} className="text-teal-100 group-hover:rotate-12 transition-transform duration-500" />
          </div>
          <h1 className="text-4xl font-black text-teal-950 tracking-tighter uppercase italic">
            Crestline <span className="text-teal-600/60 font-normal">Staff</span>
          </h1>
          <p className="text-[10px] font-black text-teal-900/30 uppercase tracking-[0.4em] mt-2">
            Operations Management Portal
          </p>
        </div>

        {/* --- LOGIN BOX --- */}
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[44px] p-10 shadow-[0_30px_60px_rgba(4,47,46,0.08)]">
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl tracking-wide">
              ⚠ SYSTEM ERROR: {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Staff Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-teal-900/40 uppercase tracking-widest ml-2">Staff ID / Email</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-teal-900/20 group-focus-within:text-teal-600 transition-colors" size={18} />
                <input 
                  required
                  type="email"
                  value={formData.email}
                  placeholder="name@crestline.com"
                  className="w-full pl-14 pr-6 py-4 bg-white border border-teal-900/5 rounded-2xl text-sm font-bold text-teal-950 outline-none focus:ring-4 focus:ring-teal-500/10 transition-all font-mono"
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black text-teal-900/40 uppercase tracking-widest">Security Passphrase</label>
                <button type="button" className="text-[9px] font-black text-teal-600 uppercase tracking-widest hover:underline">Forgot?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-teal-900/20 group-focus-within:text-teal-600 transition-colors" size={18} />
                <input 
                  required
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  placeholder="••••••••••••"
                  className="w-full pl-14 pr-14 py-4 bg-white border border-teal-900/5 rounded-2xl text-sm font-bold text-teal-950 outline-none focus:ring-4 focus:ring-teal-500/10 transition-all font-mono"
                  onChange={handleInputChange}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-teal-900/20 hover:text-teal-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button 
              disabled={isLoading}
              className="w-full py-5 bg-teal-800 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-teal-950 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 group disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Authenticating Node...
                </>
              ) : (
                <>
                  Initiate Session
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Face ID / Alternative Auth */}
          <div className="mt-8 pt-8 border-t border-teal-900/5 text-center flex flex-col items-center gap-4">
            <button type="button" className="flex items-center gap-2 px-6 py-2 bg-teal-900/5 rounded-full text-teal-900/40 hover:text-teal-600 transition-all border border-transparent hover:border-teal-100">
              <ScanFace size={18} />
              <span className="text-[9px] font-black uppercase tracking-widest">Staff Biometric Login</span>
            </button>
          </div>
        </div>

        {/* --- SECURITY FOOTER --- */}
        <div className="mt-10 flex items-center justify-center gap-6 opacity-30">
            <ShieldCheck size={16} className="text-teal-950" />
            <div className="h-px w-12 bg-teal-950" />
            <p className="text-[9px] font-black uppercase tracking-widest text-teal-950">
                Encrypted Staff Line 02
            </p>
            <div className="h-px w-12 bg-teal-950" />
            <Cpu size={16} className="text-teal-950" />
        </div>
      </div>
    </div>
  );
};

export default CrestlineStaffLogin;