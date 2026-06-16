import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Fingerprint,
  User,
  Loader2,
  CheckCircle2,
  X,
  Mail,
  Hash,
  Phone,
  ShieldAlert,
  Activity,
} from "lucide-react";

const CrestlineStaffOnboarding = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    workEmail: "",
    staffId: "",
    accessLevel: "3",
    role: "Ops Analyst",
    phoneNumber: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOnboardSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    }, 2000);
  };

  const FormInput = ({
    label,
    icon: Icon,
    type = "text",
    name,
    value,
    placeholder,
  }) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-teal-900/40 uppercase tracking-[0.15em] ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-900/20 group-focus-within:text-teal-600 transition-colors">
          <Icon size={16} />
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full bg-teal-900/5 border border-teal-900/10 px-12 py-3.5 rounded-xl text-sm font-bold text-teal-950 outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white transition-all font-mono"
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto text-left py-2">
      {/* --- SYSTEM HEADER --- */}
      <header className="mb-10 border-b-2 border-teal-900/5 pb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity size={14} className="text-teal-600 animate-pulse" />
            <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.3em]">
              System Node Initialization
            </p>
          </div>
          <h1 className="text-4xl font-black text-teal-950 tracking-tighter uppercase leading-none">
            Onboard Personnel
          </h1>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-[9px] font-bold text-teal-900/30 uppercase">
            Terminal Status
          </p>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />{" "}
            Encrypted Link Active
          </p>
        </div>
      </header>

      <form
        onSubmit={handleOnboardSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Section 1: Professional */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-7 rounded-[32px] shadow-sm border border-teal-900/5 space-y-6"
        >
          <div className="flex items-center gap-3 mb-2 border-l-4 border-teal-900 pl-3">
            <Briefcase size={18} className="text-teal-900" />
            <h3 className="text-xs font-black uppercase tracking-widest text-teal-900">
              Employment Registry
            </h3>
          </div>
          <FormInput
            label="Staff ID Number"
            icon={Hash}
            name="staffId"
            value={formData.staffId}
            placeholder="STF-X-000"
          />
          <FormInput
            label="Official Domain Email"
            icon={Mail}
            name="workEmail"
            value={formData.workEmail}
            type="email"
            placeholder="user@crestline.com"
          />
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-teal-900/40 uppercase tracking-[0.15em] ml-1">
              Functional Designation
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full bg-teal-900/5 border border-teal-900/10 px-4 py-3.5 rounded-xl text-sm font-bold text-teal-950 outline-none cursor-pointer appearance-none"
            >
              <option>Ops Analyst</option>
              <option>Branch Manager</option>
              <option>Security Auditor</option>
              <option>Loan Officer</option>
            </select>
          </div>
        </motion.section>

        {/* Section 2: Security */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-teal-950 p-7 rounded-[32px] shadow-2xl space-y-6 text-white"
        >
          <div className="flex items-center gap-3 mb-2 border-l-4 border-teal-400 pl-3">
            <Fingerprint size={18} className="text-teal-400" />
            <h3 className="text-xs font-black uppercase tracking-widest text-teal-400">
              Access Protocols
            </h3>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-teal-400/50 uppercase tracking-[0.15em]">
              Clearance Tier
            </label>
            <div className="grid grid-cols-5 gap-2">
              {["1", "2", "3", "4", "5"].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() =>
                    setFormData((p) => ({ ...p, accessLevel: lvl }))
                  }
                  className={`py-3 rounded-xl text-xs font-black transition-all border ${formData.accessLevel === lvl ? "bg-teal-500 border-teal-400 text-teal-950" : "bg-white/5 border-white/10 text-teal-400"}`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex gap-3">
            <ShieldAlert
              size={16}
              className="text-orange-400 mt-1 flex-shrink-0"
            />
            <p className="text-[10px] text-teal-100/60 leading-relaxed font-bold uppercase tracking-tighter">
              Level {formData.accessLevel} clearance permits access to{" "}
              <span className="text-teal-300">sensitive customer vaults</span>{" "}
              and transaction logs.
            </p>
          </div>
        </motion.section>

        {/* Section 3: Personal & Action */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-white p-7 rounded-[32px] shadow-sm border border-teal-900/5 space-y-6">
            <div className="flex items-center gap-3 mb-2 border-l-4 border-teal-900 pl-3">
              <User size={18} className="text-teal-900" />
              <h3 className="text-xs font-black uppercase tracking-widest text-teal-900">
                Personal Data
              </h3>
            </div>
            <FormInput
              label="Legal Full Name"
              icon={User}
              name="fullName"
              value={formData.fullName}
              placeholder="Chidi Okoro"
            />
            <FormInput
              label="Validated Mobile"
              icon={Phone}
              name="phoneNumber"
              value={formData.phoneNumber}
              placeholder="+234..."
            />
          </div>

          <button
            type="submit"
            onClick={handleOnboardSubmit}
            disabled={isLoading}
            className="w-full bg-teal-950 text-white py-6 rounded-[32px] flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-[0.2em] hover:bg-teal-900 transition-all shadow-xl disabled:opacity-50 active:scale-95"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              "Authorize New Personnel"
            )}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </motion.section>
      </form>

      {/* --- SYSTEM TOAST --- */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-10 right-10 bg-teal-950 text-white p-6 rounded-2xl shadow-2xl z-50 flex items-center gap-4 border border-teal-400/30"
          >
            <div className="w-10 h-10 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest">
                Entry Committed
              </p>
              <p className="text-[11px] text-teal-400 font-bold uppercase tracking-tighter">
                Credentials sent to {formData.workEmail}
              </p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="ml-4 text-white/20 hover:text-white"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CrestlineStaffOnboarding;
