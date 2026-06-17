import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CrestlineStaffLayout from "./CrestlineStaffLayout";
import {
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle2,
  XCircle,
  User,
  Mail,
  Send,
  Clock,
  Archive,
  ChevronRight,
  ArrowLeft,
  Tag,
  MessageSquare,
  Filter,
  BarChart2,
  FileText,
  AlertTriangle,
  Inbox,
  Copy,
  Check,
} from "lucide-react";

const api = axios.create({
  baseURL: "http://localhost:5300/staff",
  withCredentials: true,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("staffcrestline_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const fmt = (d) =>
  d
    ? new Date(d).toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

const Badge = ({ children, color = "teal" }) => {
  const map = {
    teal: "bg-teal-100 text-teal-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
    orange: "bg-orange-100 text-orange-700",
    purple: "bg-purple-100 text-purple-700",
    slate: "bg-slate-100 text-slate-600",
    yellow: "bg-yellow-100 text-yellow-700",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${map[color]}`}
    >
      {children}
    </span>
  );
};

const CopyableAccNum = ({ accountNumber }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard
      .writeText(accountNumber)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => {});
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy account number"
      className="flex items-center gap-1 group/copy"
    >
      <span className="text-[9px] font-mono text-slate-400 group-hover/copy:text-teal-600 transition-colors">
        {accountNumber}
      </span>
      {copied ? (
        <Check size={9} className="text-emerald-500 shrink-0" />
      ) : (
        <Copy
          size={9}
          className="text-slate-300 group-hover/copy:text-teal-500 transition-colors shrink-0"
        />
      )}
    </button>
  );
};

const subjectColor = (s) => {
  if (s === "Transaction Dispute") return "red";
  if (s === "Tier Upgrade Issue") return "purple";
  if (s === "Card Management") return "orange";
  if (s === "Security/Recovery") return "yellow";
  return "slate";
};

const SUBJECTS = [
  "All",
  "Transaction Dispute",
  "Tier Upgrade Issue",
  "Card Management",
  "Security/Recovery",
  "Other Feedback",
];

const CrestlineInquiries = () => {
  const navigate = useNavigate();

  const [tab, setTab] = useState("pending");
  const [pending, setPending] = useState([]);
  const [archived, setArchived] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolution, setResolution] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleOpenAccount = (accountNumber) => {
    navigate("/staff/user-management", {
      state: { autoLookup: accountNumber },
    });
  };

  const loadPending = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/pending");
      setPending(data.data ?? data);
    } catch {
      showToast("Failed to load pending inquiries", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadArchived = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/archived");
      setArchived(data.data ?? data);
    } catch {
      showToast("Failed to load archived inquiries", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "pending") loadPending();
    if (tab === "archived") loadArchived();
  }, [tab]);

  const handleResolve = async () => {
    if (!resolution.trim()) {
      showToast("Resolution notes are required", "error");
      return;
    }
    setResolving(true);
    try {
      await api.post(`${selected._id}/resolve`, {
        resolutionNotes: resolution,
      });
      setPending((p) => p.filter((i) => i._id !== selected._id));
      setSelected(null);
      setResolution("");
      showToast("Inquiry resolved — customer notified via email");
    } catch (err) {
      showToast(
        err.response?.data?.message ?? "Failed to resolve inquiry",
        "error",
      );
    } finally {
      setResolving(false);
    }
  };

  const displayList = (tab === "pending" ? pending : archived).filter((i) => {
    const matchSubject = filter === "All" || i.subject === filter;
    const matchSearch =
      !search ||
      i.userId?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      i.userId?.accountNumber?.includes(search) ||
      i.userId?.email?.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchSearch;
  });

  return (
    <CrestlineStaffLayout>
      <div className="min-h-screen bg-slate-50">
        {selected ? (
          <div className="max-w-3xl mx-auto py-8 px-6 space-y-6">
            <button
              onClick={() => {
                setSelected(null);
                setResolution("");
              }}
              className="flex items-center gap-2 text-[9px] font-black text-slate-500 hover:text-teal-600 uppercase transition-all"
            >
              <ArrowLeft size={14} />
              Back to Inquiries
            </button>

            <div className="bg-white rounded-[28px] border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Ticket #{selected._id?.toString().slice(-6).toUpperCase()}
                    </p>
                    <h3 className="text-lg font-black text-white">
                      {selected.subject}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">
                      Submitted {fmt(selected.createdAt)}
                    </p>
                  </div>
                  <Badge color={subjectColor(selected.subject)}>
                    {selected.subject}
                  </Badge>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white font-black text-base">
                      {(selected.userId?.fullName ?? "?")[0]}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">
                        {selected.userId?.fullName ?? "—"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {selected.userId?.accountNumber ? (
                          <CopyableAccNum
                            accountNumber={selected.userId.accountNumber}
                          />
                        ) : (
                          <span className="text-[9px] font-mono text-slate-400">
                            —
                          </span>
                        )}
                        <span className="text-slate-300 text-[9px]">·</span>
                        <span className="text-[9px] font-mono text-slate-400">
                          {selected.userId?.email ?? "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {selected.userId?.accountNumber && (
                    <button
                      onClick={() =>
                        handleOpenAccount(selected.userId.accountNumber)
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-teal-700 transition-all"
                    >
                      <User size={12} />
                      Open Account Console
                      <ChevronRight size={12} />
                    </button>
                  )}
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                  <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <MessageSquare size={10} />
                    Customer Message
                  </p>
                  <p className="text-[13px] text-slate-800 font-semibold leading-relaxed">
                    {selected.message}
                  </p>
                </div>

                {tab === "archived" && selected.resolutionNotes && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <CheckCircle2 size={10} />
                      Resolution Notes — Sent to Customer
                    </p>
                    <p className="text-[13px] text-slate-800 font-semibold leading-relaxed">
                      {selected.resolutionNotes}
                    </p>
                    <p className="text-[8px] text-emerald-600 font-bold mt-3">
                      Resolved {fmt(selected.resolvedAt)}
                    </p>
                  </div>
                )}

                {tab === "pending" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                        Resolution / Reply to Customer
                      </label>
                      <textarea
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        rows={5}
                        placeholder="Write your response here — this will be sent to the customer via email..."
                        className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm font-semibold text-slate-900 outline-none border-2 border-transparent focus:border-teal-500 transition-all resize-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleResolve}
                        disabled={resolving || !resolution.trim()}
                        className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-teal-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {resolving ? (
                          <RefreshCw size={13} className="animate-spin" />
                        ) : (
                          <Send size={13} />
                        )}
                        Resolve & Send Email
                      </button>
                      <button
                        onClick={() => {
                          setSelected(null);
                          setResolution("");
                        }}
                        className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto py-8 px-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black text-teal-700 uppercase tracking-[0.2em] mb-1">
                  Support Queue
                </p>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                  Customer <span className="text-teal-500">Inquiries</span>
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 flex items-center gap-2 text-slate-400 shadow-sm">
                  <Search size={14} />
                  <input
                    type="text"
                    placeholder="Search name, account, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent outline-none text-[11px] font-bold text-slate-700 placeholder:text-slate-400 w-52"
                  />
                </div>
                <button
                  onClick={() =>
                    tab === "pending" ? loadPending() : loadArchived()
                  }
                  className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-teal-600 hover:border-teal-300 transition-all shadow-sm"
                >
                  <RefreshCw
                    size={15}
                    className={loading ? "animate-spin" : ""}
                  />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "Pending",
                  val: pending.length,
                  color: "text-orange-600",
                  icon: <Inbox size={16} />,
                  bg: "bg-orange-50",
                },
                {
                  label: "Resolved",
                  val: archived.length,
                  color: "text-emerald-600",
                  icon: <Archive size={16} />,
                  bg: "bg-emerald-50",
                },
                {
                  label: "Disputes",
                  val: pending.filter(
                    (i) => i.subject === "Transaction Dispute",
                  ).length,
                  color: "text-red-600",
                  icon: <AlertTriangle size={16} />,
                  bg: "bg-red-50",
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="bg-white rounded-2xl p-5 border border-slate-100 flex items-center gap-4"
                >
                  <div className={`p-3 rounded-xl ${m.bg} ${m.color}`}>
                    {m.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900">
                      {m.val}
                    </p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {m.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-white border border-slate-200 p-1 rounded-2xl flex gap-1 shadow-sm">
                {["pending", "archived"].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTab(t);
                      setSelected(null);
                    }}
                    className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${tab === t ? "bg-teal-600 text-white shadow" : "text-slate-400 hover:text-slate-700"}`}
                  >
                    {t === "pending" ? (
                      <span className="flex items-center gap-1.5">
                        <Inbox size={11} />
                        Pending
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Archive size={11} />
                        Archived
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                <Filter size={12} className="text-slate-400" />
                {SUBJECTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${filter === s ? "bg-slate-800 text-white" : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"}`}
                  >
                    {s === "All" ? "All Types" : s}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[28px] border border-slate-200 overflow-hidden shadow-sm">
              {loading ? (
                <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
                  <RefreshCw size={18} className="animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Loading…
                  </span>
                </div>
              ) : displayList.length === 0 ? (
                <div className="text-center py-20 space-y-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                    {tab === "pending" ? (
                      <Inbox size={24} className="text-slate-300" />
                    ) : (
                      <Archive size={24} className="text-slate-300" />
                    )}
                  </div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    {tab === "pending"
                      ? "No Pending Inquiries"
                      : "No Archived Inquiries"}
                  </p>
                  {filter !== "All" && (
                    <button
                      onClick={() => setFilter("All")}
                      className="text-[10px] font-black text-teal-600 underline"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {[
                        "Customer",
                        "Subject",
                        "Message Preview",
                        "Submitted",
                        tab === "archived" ? "Resolved" : "Status",
                        "",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-4 text-[8px] font-black text-slate-400 uppercase tracking-widest"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {displayList.map((inq) => (
                      <tr
                        key={inq._id}
                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                        onClick={() => setSelected(inq)}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0">
                              {(inq.userId?.fullName ?? "?")[0]}
                            </div>
                            <div>
                              <p className="text-[12px] font-black text-slate-800">
                                {inq.userId?.fullName ?? "—"}
                              </p>
                              {inq.userId?.accountNumber ? (
                                <CopyableAccNum
                                  accountNumber={inq.userId.accountNumber}
                                />
                              ) : (
                                <span className="text-[9px] font-mono text-slate-400">
                                  —
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <Badge color={subjectColor(inq.subject)}>
                            {inq.subject}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 max-w-[260px]">
                          <p className="text-[11px] text-slate-600 font-bold truncate">
                            {inq.message}
                          </p>
                        </td>
                        <td className="px-6 py-5 text-[10px] font-mono font-bold text-slate-400 whitespace-nowrap">
                          {fmt(inq.createdAt)}
                        </td>
                        <td className="px-6 py-5">
                          {tab === "pending" ? (
                            <Badge color="orange">Pending</Badge>
                          ) : (
                            <Badge color="green">Resolved</Badge>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            {inq.userId?.accountNumber && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenAccount(inq.userId.accountNumber);
                                }}
                                title="Open Account Console"
                                className="p-2 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-100 transition-all opacity-0 group-hover:opacity-100"
                              >
                                <User size={13} />
                              </button>
                            )}
                            <button className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all opacity-0 group-hover:opacity-100">
                              <ChevronRight size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-2xl shadow-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2
            ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={14} />
            ) : (
              <AlertTriangle size={14} />
            )}
            {toast.msg}
          </div>
        )}
      </div>
    </CrestlineStaffLayout>
  );
};

export default CrestlineInquiries;
