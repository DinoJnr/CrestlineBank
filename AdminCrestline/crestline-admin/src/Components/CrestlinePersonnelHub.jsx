import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCircle,
  ShieldCheck,
  ArrowRight,
  UserCog,
  Loader2,
} from "lucide-react";

export default function CrestlinePersonnelHub() {
  const navigate = useNavigate();

  // ─── SYSTEM STATE ENGINE ───────────────────────────────────────────────────
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHubData = async () => {
      try {
        const token = localStorage.getItem("admin_crestline_token");

        const API_URL =
          import.meta.env?.VITE_API_URL || "http://localhost:5300/admin";

        const response = await fetch(`${API_URL}/personnel/hub-metrics`, {
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
            result.message || "Transmission handshaking failure.",
          );
        }

        setMetrics(result.metrics);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHubData();
  }, [navigate]);

  const hubs = [
    {
      title: "Client Assets",
      subtitle: "Customer Database",
      description: "Manage KYC, account limits, and user-level restrictions.",
      count: metrics
        ? `${metrics.customers.count.toLocaleString()} Users`
        : "--- Users",
      status: metrics ? metrics.customers.subtext : "Querying records...",
      icon: <Users className="text-blue-600" size={32} />,
      color: "from-blue-500/20 to-cyan-500/10",
      path: "/admin/personnel/users",
    },
    {
      title: "Operations Team",
      subtitle: "Staff Registry",
      description: "Monitor CS agents, tellers, and departmental access.",
      count: metrics
        ? `${metrics.staff.count.toLocaleString()} Active Staff`
        : "--- Staff",
      status: metrics ? metrics.staff.subtext : "Syncing node...",
      icon: <UserCircle className="text-teal-600" size={32} />,
      color: "from-teal-500/20 to-emerald-500/10",
      path: "/admin/personnel/staffs",
    },
    {
      title: "Command Level",
      subtitle: "Admin Privileges",
      description: "Manage root access, audit logs, and security clearance.",
      count: metrics
        ? `${metrics.admins.count.toLocaleString()} Super Admins`
        : "--- Admins",
      status: metrics ? metrics.admins.subtext : "Verifying clearance...",
      icon: <ShieldCheck className="text-purple-600" size={32} />,
      color: "from-purple-500/20 to-indigo-500/10",
      path: "/admin/personnel/admin",
    },
  ];

  if (loading) {
    return (
      <div className="w-full h-[50vh] flex flex-col items-center justify-center gap-3 text-teal-900/60 font-medium">
        <Loader2 className="animate-spin text-teal-800" size={32} />
        <p className="text-xs uppercase tracking-widest font-bold">
          Synchronizing Terminal Matrix...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 bg-rose-50 border border-rose-200/60 rounded-[32px] text-left">
        <h4 className="text-rose-900 font-black uppercase text-sm tracking-wide">
          Interface Connection Lost
        </h4>
        <p className="text-xs text-rose-700/80 font-medium mt-1">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-rose-900 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all hover:bg-rose-800"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 text-left animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
      {/* SECTION BANNER HEADINGS */}
      <div className="max-w-2xl">
        <p className="text-[11px] font-black text-teal-700 uppercase tracking-[0.3em] mb-2">
          Personnel Management
        </p>
        <h3 className="text-3xl font-black text-teal-950 italic uppercase tracking-tighter leading-tight">
          Select a <span className="text-teal-600">Database Sector</span> to
          audit records.
        </h3>
      </div>

      {/* THREE INTERACTIVE DATA HUB SECTOR OBJECTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {hubs.map((hub, i) => (
          <motion.button
            key={i}
            whileHover={{ y: -10 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(hub.path)}
            className="relative group bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[48px] shadow-sm flex flex-col items-start overflow-hidden transition-all hover:shadow-2xl hover:bg-white/60 text-left w-full"
          >
            {/* Visual Flare Blobs */}
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${hub.color} blur-[40px] opacity-50 group-hover:opacity-100 transition-opacity`}
            />

            <div className="mb-8 p-5 bg-white rounded-3xl shadow-inner relative z-10">
              {hub.icon}
            </div>

            <div className="relative z-10 space-y-1 mb-8">
              <p className="text-[10px] font-black text-teal-700/50 uppercase tracking-widest">
                {hub.subtitle}
              </p>
              <h4 className="text-2xl font-black text-teal-950 uppercase italic tracking-tighter leading-none">
                {hub.title}
              </h4>
            </div>

            <p className="text-xs font-medium text-teal-900/60 leading-relaxed mb-8 relative z-10">
              {hub.description}
            </p>

            <div className="w-full pt-6 border-t border-teal-900/5 flex justify-between items-end mt-auto relative z-10">
              <div>
                <p className="text-[14px] font-black text-teal-950 leading-none">
                  {hub.count}
                </p>
                <p className="text-[10px] font-bold text-teal-600 uppercase tracking-tighter mt-1 italic">
                  {hub.status}
                </p>
              </div>
              <div className="p-3 bg-teal-950 text-white rounded-2xl group-hover:bg-teal-600 transition-colors">
                <ArrowRight size={20} />
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* LOWER FOOTER ENROLLMENT BANNER COMPONENT */}
      <div className="bg-teal-950 rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl text-teal-400">
            <UserCog size={24} />
          </div>
          <div>
            <h5 className="text-white font-black italic uppercase tracking-widest text-sm">
              Rapid Enrollment
            </h5>
            <p className="text-teal-400/60 text-[10px] font-bold uppercase tracking-tighter">
              Add new personnel to the system immediately
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/admin/personnel/onboarding")}
          className="bg-teal-500 hover:bg-teal-400 text-teal-950 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all whitespace-nowrap"
        >
          Initialize Onboarding
        </button>
      </div>
    </div>
  );
}
