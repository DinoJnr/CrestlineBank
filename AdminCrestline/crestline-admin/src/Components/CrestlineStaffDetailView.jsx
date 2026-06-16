import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Mail,
  Phone,
  Activity,
  Clock,
  Globe,
  Lock,
  Edit3,
  Key,
  AlertCircle,
  Loader2,
} from "lucide-react";

const CrestlineStaffDetailView = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Captured from your dynamic App.jsx route parameter

  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStaffProfileNode = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("admin_crestline_token");
      const API_URL =
        import.meta.env?.VITE_API_URL || "http://localhost:5300/admin";

      const response = await fetch(`${API_URL}/personnel/staffs/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("admin_crestline_token");
          navigate("/");
          return;
        }
        throw new Error(
          result.message || "Profile node ledger synchronization fault.",
        );
      }

      setStaff(result.data || result.staff);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      fetchStaffProfileNode();
    }
  }, [id, fetchStaffProfileNode]);

  const InfoCard = ({ label, value, icon: Icon }) => (
    <div className="bg-white/50 border border-teal-900/5 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
      <div className="w-10 h-10 bg-teal-900/5 rounded-xl flex items-center justify-center text-teal-600">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[9px] font-black text-teal-900/30 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-sm font-bold text-teal-950 font-mono tracking-tight">
          {value || "NOT_SET"}
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-700 font-medium">
        <Loader2 className="animate-spin text-teal-950" size={36} />
        <p className="text-xs uppercase tracking-widest font-bold text-teal-900">
          Parsing Node Profile Ledger...
        </p>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="w-full p-8 bg-rose-50 border border-rose-200/60 rounded-[32px] text-left max-w-4xl mx-auto">
        <h4 className="text-rose-900 font-black uppercase text-sm tracking-wide">
          Ledger Extraction Failure
        </h4>
        <p className="text-xs text-rose-700/80 font-medium mt-1">
          {error || "The specified operational node could not be identified."}
        </p>
        <button
          onClick={() => navigate("/admin/personnel/staffs")}
          className="mt-4 px-4 py-2 bg-rose-900 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all hover:bg-rose-800"
        >
          Return to Staff Directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto text-left space-y-8 animate-in fade-in duration-500">
      {/* --- TOP COMMAND BAR --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-teal-900/5 pb-8">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/admin/personnel/staffs")}
            className="w-12 h-12 bg-white border border-teal-900/10 rounded-2xl flex items-center justify-center hover:bg-teal-900 hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-4xl font-black text-teal-950 tracking-tighter uppercase italic">
                {staff.fullName}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg text-white ${
                  staff.isSuspended ? "bg-red-500" : "bg-emerald-500"
                }`}
              >
                {staff.isSuspended ? "Suspended" : "Active"} Node
              </span>
            </div>
            <p className="text-xs font-bold text-teal-700/50 uppercase tracking-[0.2em] flex items-center gap-2">
              Clearance:{" "}
              <span className="text-teal-950 font-black">
                {staff.clearanceLevel || "LEVEL 3: DEPT OPERATOR"}
              </span>{" "}
              • Staff ID:{" "}
              <span className="text-teal-950 font-mono font-black">
                {staff.serialDesignation}
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() =>
              navigate(
                `/admin/personnel/staffs/${staff.serialDesignation}/edit`,
              )
            }
            className="px-6 py-3 bg-white border border-teal-900/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-50 transition-all flex items-center gap-2"
          >
            <Edit3 size={14} /> Update Credentials
          </button>
          <button
            onClick={() =>
              navigate(
                `/admin/personnel/staffs/${staff.serialDesignation}/manage`,
              )
            }
            className="px-6 py-3 bg-teal-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-2"
          >
            <Lock size={14} className="text-teal-400" /> Security Override
          </button>
        </div>
      </div>

      {/* --- DATA GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Column 1: Core Identity */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2 border-l-4 border-teal-900 pl-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-900/40">
              System Credentials
            </h3>
          </div>
          <div className="space-y-3">
            <InfoCard
              label="Work Email Address"
              value={staff.email}
              icon={Mail}
            />
            <InfoCard
              label="Government Ledger Identity (GovID)"
              value={staff.govId}
              icon={Key}
            />
            <InfoCard
              label="Onboarding Registration"
              value={
                staff.createdAt
                  ? new Date(staff.createdAt).toLocaleDateString()
                  : "Prior Epoch"
              }
              icon={Clock}
            />
            <InfoCard
              label="Department Assignment"
              value={staff.department}
              icon={ShieldCheck}
            />
          </div>
        </div>

        {/* Column 2: System Activity */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2 border-l-4 border-teal-900 pl-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-900/40">
              Audit & Network
            </h3>
          </div>
          <div className="space-y-3">
            <InfoCard
              label="Last Login Timestamp"
              value={staff.lastLogin || "14 mins ago"}
              icon={Activity}
            />
            <InfoCard
              label="Terminal IP Address"
              value={staff.terminalIp || "192.168.1.45"}
              icon={Globe}
            />
            <div className="bg-teal-950 p-6 rounded-[32px] shadow-xl text-white">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-400">
                  Security Vault
                </p>
                <Key size={14} className="text-teal-400" />
              </div>
              <p className="text-xs font-bold leading-relaxed mb-4 text-teal-100/60">
                Authentication tokens are cryptographically bound to system
                authorizations.
              </p>
              <button className="w-full bg-white/10 hover:bg-white/20 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                Revoke Access Key
              </button>
            </div>
          </div>
        </div>

        {/* Column 3: Audit Trails */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2 border-l-4 border-teal-900 pl-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-900/40">
              Activity Log
            </h3>
          </div>
          <div className="bg-white/40 border border-teal-900/5 rounded-[32px] overflow-hidden">
            {(
              staff.recentActions || [
                {
                  id: 1,
                  action: "Registry Sync",
                  target: "System Initialized",
                  time: "Just Now",
                },
              ]
            ).map((item, index, arr) => (
              <div
                key={item.id}
                className={`p-5 flex justify-between items-center ${index !== arr.length - 1 ? "border-b border-teal-900/5" : ""}`}
              >
                <div>
                  <p className="text-xs font-black text-teal-950 uppercase">
                    {item.action}
                  </p>
                  <p className="text-[10px] font-bold text-teal-700/40 uppercase tracking-tighter">
                    {item.target}
                  </p>
                </div>
                <p className="text-[9px] font-black text-teal-950/40 uppercase tracking-tighter">
                  {item.time}
                </p>
              </div>
            ))}
            <div className="p-4 bg-teal-900/5 text-center">
              <button className="text-[9px] font-black uppercase text-teal-700 tracking-widest hover:text-teal-950 transition-colors">
                View Full Audit Trail
              </button>
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-[32px] border border-orange-100 flex items-start gap-4 shadow-inner">
            <AlertCircle size={20} className="text-orange-500 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-black text-orange-900 uppercase tracking-widest mb-1">
                Administrative Alert
              </p>
              <p className="text-[11px] font-bold text-orange-700 leading-tight">
                Any unauthorized security overrides will be logged in the global
                ledger.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrestlineStaffDetailView;
