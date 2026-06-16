import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  UserPlus,
  Eye,
  UserMinus,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import CrestlineAdminLayout from "./CrestlineAdminLayout";

const CrestlineCustomerTable = () => {
  const navigate = useNavigate();

  
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  
  useEffect(() => {
    const fetchCustomerLedger = async () => {
      try {
        const token = localStorage.getItem("admin_crestline_token");
        const API_URL =
          import.meta.env?.VITE_API_URL || "http://localhost:5300/admin";

        const response = await fetch(`${API_URL}/personnel/users`, {
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
            result.message || "Database ledger handshake failure.",
          );
        }

        setCustomers(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerLedger();
  }, [navigate]);

 
  const filteredCustomers = customers.filter((client) => {
   
    const statusLabel =
      client.kyc?.status === "Pending"
        ? "Pending"
        : client.status === "active"
          ? "Verified"
          : "Flagged";
    const matchesFilter =
      filter === "All" || statusLabel.toLowerCase() === filter.toLowerCase();

  
    const matchesSearch = client.accountNumber.includes(searchQuery.trim());

    return matchesFilter && matchesSearch;
  });

  
  if (loading) {
    return (
      <div className="w-full h-[50vh] flex flex-col items-center justify-center gap-3 text-teal-900/60 font-medium">
        <Loader2 className="animate-spin text-teal-800" size={32} />
        <p className="text-xs uppercase tracking-widest font-bold">
          Querying Central Ledger Registry...
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
          Retry Protocol Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
      {/* --- NAVIGATION & TITLE BREADCRUMB --- */}
      <div className="flex items-center justify-between border-b border-teal-900/10 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/personnel")}
            className="group flex items-center justify-center w-12 h-12 bg-white/50 backdrop-blur-md border border-white rounded-2xl text-teal-900 hover:bg-teal-900 hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
          </button>
          <div>
            <p className="text-[10px] font-black text-teal-700/50 uppercase tracking-[0.3em] leading-none mb-1">
              Personnel / Directory
            </p>
            <h2 className="text-3xl font-black text-teal-950 tracking-tighter italic uppercase">
              Customer Registry
            </h2>
          </div>
        </div>

        <button
          onClick={() => navigate("/admin/personnel/onboarding")}
          className="flex items-center gap-2 bg-teal-900 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all active:scale-95"
        >
          <UserPlus size={16} />
          Add New Customer
        </button>
      </div>

      {/* --- FILTER & SEARCH BAR --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white/40 p-1.5 rounded-2xl border border-white/60 backdrop-blur-md shadow-sm">
          {["All", "Verified", "Pending", "Flagged"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === t
                  ? "bg-teal-900 text-white shadow-lg"
                  : "text-teal-900/40 hover:text-teal-900"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-900/30"
            size={16}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by Account Number..."
            className="bg-white/40 border border-white/60 backdrop-blur-md pl-11 pr-6 py-3.5 rounded-2xl outline-none text-xs font-bold text-teal-950 w-72 focus:ring-2 ring-teal-500/20 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* --- CUSTOMER LEDGER TABLE --- */}
      <div className="bg-white/30 backdrop-blur-2xl rounded-[40px] border border-white/60 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/20 border-b border-white/40">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-teal-900/40 italic">
                Holder Name
              </th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-teal-900/40 italic">
                Account No.
              </th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-teal-900/40 italic">
                Net Balance
              </th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-teal-900/40 italic">
                Status
              </th>
              <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-teal-900/40 italic">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-8 py-12 text-center text-xs font-bold uppercase tracking-widest text-teal-900/30 italic"
                >
                  No directory configurations match current query parameters
                </td>
              </tr>
            ) : (
              filteredCustomers.map((user, i) => {
                // Re-calculate visual parameters out of properties
                const uiStatus =
                  user.kyc?.status === "Pending"
                    ? "Pending"
                    : user.status === "active"
                      ? "Verified"
                      : "Flagged";

                return (
                  <motion.tr
                    key={user._id || user.accountNumber}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-white/50 transition-all group cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-teal-950 text-white flex items-center justify-center font-black text-[10px] shadow-lg italic select-none">
                          {user.fullName
                            ? user.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()
                            : "CU"}
                        </div>
                        <div>
                          <p className="text-sm font-black text-teal-950 leading-none mb-1 uppercase tracking-tighter">
                            {user.fullName}
                          </p>
                          <p className="text-[10px] font-bold text-teal-700/40 uppercase">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-mono text-[11px] font-black text-teal-900 bg-white/60 px-3 py-1.5 rounded-lg border border-white shadow-sm tracking-widest">
                        {user.accountNumber}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-teal-950 tracking-tighter italic">
                        {user.currency === "NGN" || !user.currency ? "₦" : "$"}
                        {user.balance?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                          uiStatus === "Verified"
                            ? "bg-emerald-500 text-white border-emerald-400"
                            : uiStatus === "Flagged"
                              ? "bg-red-500 text-white border-red-400"
                              : "bg-orange-500 text-white border-orange-400"
                        }`}
                      >
                        {uiStatus}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/personnel/users/details`, {
                              state: { targetCustomer: user },
                            });
                          }}
                          className="p-2.5 bg-white rounded-xl text-teal-900 shadow-md hover:bg-teal-900 hover:text-white transition-all border border-white"
                        >
                          <Eye size={16} />
                        </button>
                        <button className="p-2.5 bg-white rounded-xl text-red-500 shadow-md hover:bg-red-500 hover:text-white transition-all border border-white">
                          <UserMinus size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CrestlineCustomerTable;
