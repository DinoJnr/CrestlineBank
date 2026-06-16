import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Loader2,
  Fingerprint,
  AlertCircle,
} from "lucide-react";

const CrestlineAdminLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(false);
    setErrorMessage("");

    try {
      setIsLoading(true);

      const res = await axios.post("http://localhost:5300/admin/admin-login", {
        email: formData.email,
        password: formData.password,
      });

      if (res.data && res.data.success) {
        localStorage.setItem("admin_crestline_token", res.data.token);
        localStorage.setItem("admin_profile", JSON.stringify(res.data.admin));

        navigate("/admin/dashboard");
      }
    } catch (err) {
      console.error("Authentication Sequence Blocked:", err);

      if (err.response && err.response.data && err.response.data.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage("Network Failure: Connection to Vault Node refused.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFA] flex items-center justify-center p-6 font-sans">
      {/* Background Decorative Element */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-teal-900/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-teal-900/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* --- LOGO / HEADER --- */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-950 rounded-[24px] shadow-2xl mb-6 relative overflow-hidden group">
            <Cpu
              size={32}
              className="text-teal-400 relative z-10 group-hover:scale-110 transition-transform"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 to-transparent" />
          </div>
          <h1 className="text-4xl font-black text-teal-950 tracking-tighter uppercase italic">
            Crestline{" "}
            <span className="text-teal-600/40 font-normal">Vault</span>
          </h1>
          <p className="text-[10px] font-black text-teal-900/30 uppercase tracking-[0.4em] mt-2">
            Authorized Personnel Only
          </p>
        </div>

        {/* --- LOGIN FORM --- */}
        <div className="bg-white border border-teal-900/10 rounded-[40px] p-10 shadow-[0_20px_50px_rgba(4,47,46,0.05)] relative overflow-hidden">
          {/* Dynamic Error Messaging Output */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-left animate-shake">
              <AlertCircle
                size={16}
                className="text-red-600 mt-0.5 flex-shrink-0"
              />
              <div>
                <p className="text-[11px] font-black uppercase text-red-700 tracking-wide">
                  Handshake Rejected
                </p>
                <p className="text-[11px] font-bold text-red-600 mt-0.5">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-teal-900/40 uppercase tracking-widest ml-2">
                Administrative ID
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-teal-900/20 group-focus-within:text-teal-600 transition-colors"
                  size={18}
                />
                <input
                  required
                  type="email"
                  placeholder="admin@crestline.com"
                  className="w-full pl-14 pr-6 py-4 bg-teal-900/5 border border-transparent rounded-2xl text-sm font-bold text-teal-950 outline-none focus:bg-white focus:border-teal-900/10 focus:ring-4 focus:ring-teal-500/5 transition-all font-mono"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black text-teal-900/40 uppercase tracking-widest">
                  Access Key
                </label>
                <button
                  type="button"
                  className="text-[9px] font-black text-teal-600 uppercase tracking-widest hover:underline"
                >
                  Reset Key
                </button>
              </div>
              <div className="relative group">
                <Lock
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-teal-900/20 group-focus-within:text-teal-600 transition-colors"
                  size={18}
                />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  className="w-full pl-14 pr-14 py-4 bg-teal-900/5 border border-transparent rounded-2xl text-sm font-bold text-teal-950 outline-none focus:bg-white focus:border-teal-900/10 focus:ring-4 focus:ring-teal-500/5 transition-all font-mono"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
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

            {/* Login Button */}
            <button
              disabled={isLoading}
              className="w-full py-5 bg-teal-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 group disabled:opacity-70 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Encrypting Session...
                </>
              ) : (
                <>
                  Establish Connection
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>
          </form>

          {/* Biometric Prompt Placeholder */}
          <div className="mt-8 pt-8 border-t border-teal-900/5 text-center">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-teal-900/30 hover:text-teal-600 transition-colors"
            >
              <Fingerprint size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Use Biometric Bypass
              </span>
            </button>
          </div>
        </div>

        {/* --- SECURITY NOTICE --- */}
        <div className="mt-8 flex items-start gap-4 px-6">
          <ShieldCheck className="text-teal-600 flex-shrink-0" size={20} />
          <div>
            <p className="text-[9px] font-black text-teal-950/40 uppercase leading-relaxed tracking-wider">
              Secure Terminal Protocol Active. This session is monitored and
              end-to-end encrypted. Unauthorised access attempts are
              automatically reported to the Compliance Node.
            </p>
          </div>
        </div>

        {/* --- SYSTEM VERSION --- */}
        <div className="absolute -bottom-16 left-0 right-0 text-center">
          <p className="text-[9px] font-mono font-bold text-teal-900/20 uppercase tracking-[0.3em]">
            Crestline Core • Build 2026.4.18 • Status: Secure
          </p>
        </div>
      </div>
    </div>
  );
};

export default CrestlineAdminLogin;
