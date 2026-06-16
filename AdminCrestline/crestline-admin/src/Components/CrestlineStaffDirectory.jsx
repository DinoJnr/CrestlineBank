import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  UserPlus,
  ShieldCheck,
  Edit3,
  Eye,
  ChevronRight,
  Loader2,
} from "lucide-react";

const CrestlineStaffDirectory = () => {
  const navigate = useNavigate();

  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const syncStaffNodeRegistry = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("admin_crestline_token");
      const API_URL =
        import.meta.env?.VITE_API_URL || "http://localhost:5300/admin";

      const response = await fetch(
        `${API_URL}/personnel/staffs?filter=${filter}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("admin_crestline_token");
          navigate("/");
          return;
        }
        throw new Error(
          result.message || "Staff matrix data parsing execution fault.",
        );
      }

      setStaffMembers(result.staffs || result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter, navigate]);

  useEffect(() => {
    syncStaffNodeRegistry();
  }, [syncStaffNodeRegistry]);

  const filteredStaff = staffMembers.filter((staff) => {
    const targetId = (staff.serialDesignation || staff._id || "").toLowerCase();
    const targetName = (staff.fullName || "").toLowerCase();
    const cleanQuery = searchQuery.trim().toLowerCase();
    return targetId.includes(cleanQuery) || targetName.includes(cleanQuery);
  });

  if (loading && staffMembers.length === 0) {
    return (
      <div className="w-full h-[50vh] flex flex-col items-center justify-center gap-3 text-slate-700 font-medium">
        <Loader2 className="animate-spin text-teal-900" size={32} />
        <p className="text-xs uppercase tracking-widest font-bold">
          Synchronizing Active Operator Nodes...
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
          onClick={syncStaffNodeRegistry}
          className="mt-4 px-4 py-2 bg-rose-900 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all hover:bg-rose-800"
        >
          Reconnect Terminal Matrix
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 text-left">
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
            Staff Personnel
          </h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">
            Institutional Access Management
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/staff/onboard")}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-95"
        >
          <UserPlus size={16} />
          Onboard New Staff
        </button>
      </div>

      {/* --- CONTROL BAR --- */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white/40 p-4 rounded-[30px] border border-slate-200 backdrop-blur-md">
        <div className="flex items-center gap-2 p-1 bg-slate-900/5 rounded-xl border border-slate-200">
          {["All", "Active", "On Leave", "Suspended"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                filter === tab
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-96 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by Staff ID or Name..."
            className="w-full bg-white/80 border border-slate-200 pl-12 pr-6 py-3.5 rounded-xl outline-none text-xs font-bold text-slate-900 focus:ring-2 ring-slate-500/20 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* --- STAFF TABLE --- */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-[40px] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">
                Staff Credentials
              </th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">
                Department
              </th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">
                Clearance
              </th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">
                Status
              </th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic text-right">
                Operations
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStaff.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-8 py-12 text-center text-xs font-bold uppercase tracking-widest text-slate-400 italic"
                >
                  No active operator credentials match current system queries.
                </td>
              </tr>
            ) : (
              filteredStaff.map((staff) => {
                // Exact properties mapped directly to your Mongoose Schema structure
                const currentId = staff.serialDesignation || staff._id;
                const currentName = staff.fullName || "Unknown User";
                const currentDept = staff.department || "Operations";
                const currentAccess =
                  staff.clearanceLevel || "LEVEL 3: DEPT OPERATOR";
                const currentStatus = staff.isSuspended
                  ? "Suspended"
                  : "Active";

                // Prevent routing crashes if data serialization isn't ready
                if (!currentId) return null;

                const calculatedInitials = currentName
                  .split(" ")
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <tr
                    key={currentId}
                    className="hover:bg-slate-50/80 transition-all group border-b border-slate-100"
                  >
                    {/* --- STAFF CREDENTIALS --- */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-[10px] italic shadow-lg select-none">
                          {calculatedInitials || "ST"}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-950 leading-none mb-1 uppercase tracking-tighter block">
                            {currentName}
                          </p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase font-mono block">
                            {currentId}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* --- DEPARTMENT --- */}
                    <td className="px-8 py-6">
                      <span className="text-xs font-black text-slate-800 uppercase italic bg-slate-200/60 px-3 py-1 rounded-lg border border-slate-300">
                        {currentDept}
                      </span>
                    </td>

                    {/* --- CLEARANCE --- */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-900">
                        <ShieldCheck
                          size={14}
                          className="text-amber-600 fill-amber-50"
                        />
                        <span className="text-[10px] font-black uppercase text-[11px] tracking-tight">
                          {currentAccess}
                        </span>
                      </div>
                    </td>

                    {/* --- STATUS --- */}
                    <td className="px-8 py-6">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          currentStatus === "Active"
                            ? "bg-emerald-500 text-white border-emerald-400"
                            : "bg-red-500 text-white border-red-400"
                        }`}
                      >
                        {currentStatus}
                      </span>
                    </td>

                    {/* --- OPERATIONS --- */}
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() =>
                            navigate(`/admin/personnel/staffs/${currentId}`)
                          }
                          className="p-2.5 bg-white rounded-xl text-slate-800 shadow-sm border border-slate-200 hover:bg-slate-900 hover:text-white transition-all"
                          title="View Full Profile"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/personnel/staffs/${currentId}/edit`,
                            )
                          }
                          className="p-2.5 bg-white rounded-xl text-slate-800 shadow-sm border border-slate-200 hover:bg-slate-900 hover:text-white transition-all"
                          title="Edit Permissions"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/personnel/staffs/${currentId}/manage`,
                            )
                          }
                          className="hidden group-hover:flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl transition-all hover:bg-black active:scale-95 ml-2"
                        >
                          Manage <ChevronRight size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* --- FOOTER --- */}
        <div className="bg-slate-50 px-8 py-5 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Authorized Personnel Directory • Terminal ID: CS-ALPHA
          </p>
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 text-white text-[10px] font-black">
              1
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrestlineStaffDirectory;
