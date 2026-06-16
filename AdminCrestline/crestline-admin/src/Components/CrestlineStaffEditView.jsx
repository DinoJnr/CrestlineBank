import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Mail,
  Phone,
  Save,
  X,
  User,
  Hash,
  AlertCircle,
  Loader2,
  Award,
} from "lucide-react";

const CrestlineStaffEditView = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    department: "",
    clearanceLevel: "LEVEL 3: DEPT OPERATOR",
  });
  const fetchStaffProfileToEdit = useCallback(async () => {
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
        throw new Error(result.message || "Failed to sync data ledger.");
      }

      const activeNode = result.data || result.staff;

      setFormData({
        fullName: activeNode?.fullName || "",
        email: activeNode?.email || "",
        department: activeNode?.department || "",
        clearanceLevel: activeNode?.clearanceLevel || "LEVEL 3: DEPT OPERATOR",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      fetchStaffProfileToEdit();
    }
  }, [id, fetchStaffProfileToEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem("admin_crestline_token");
      const API_URL =
        import.meta.env?.VITE_API_URL || "http://localhost:5300/admin";

      const response = await fetch(`${API_URL}/personnel/staffs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Cryptographic transaction commit failure.",
        );
      }

      navigate(-1);
    } catch (err) {
      setError(err.message);
      setIsSaving(false);
    }
  };

  const EditField = ({
    label,
    name,
    value,
    icon: Icon,
    type = "text",
    disabled = false,
  }) => (
    <div
      className={`bg-white border border-teal-900/10 p-5 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-teal-500/20 transition-all ${disabled ? "opacity-60 select-none" : ""}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-teal-600" />
        <label className="text-[10px] font-black text-teal-900/40 uppercase tracking-widest">
          {label}
        </label>
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="w-full bg-transparent text-sm font-bold text-teal-950 font-mono outline-none"
      />
    </div>
  );

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-700 font-medium">
        <Loader2 className="animate-spin text-teal-950" size={36} />
        <p className="text-xs uppercase tracking-widest font-bold text-teal-900">
          Isolating Registry Profile Node...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto text-left space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* --- ERROR MESSAGE DISPLAY --- */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs font-bold uppercase tracking-wide flex items-center gap-3">
          <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
          <span>Error Matrix Fault: {error}</span>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b-2 border-teal-900/5 pb-8">
        <div className="flex items-center gap-5">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white border border-teal-900/10 rounded-xl hover:bg-teal-900 hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-teal-950 tracking-tighter uppercase italic">
              Modify Credentials
            </h1>
            <p className="text-[10px] font-black text-teal-700/50 uppercase tracking-[0.3em]">
              Authorized Session ID: {id}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            disabled={isSaving}
            className="px-6 py-3 bg-white border border-teal-900/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all flex items-center gap-2 disabled:opacity-40"
          >
            <X size={14} /> Discard
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 bg-teal-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {isSaving ? "Encrypting Matrix..." : "Commit Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2 border-l-4 border-teal-900 pl-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-teal-950">
                Identity Registry
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EditField
                label="Legal Full Name"
                name="fullName"
                value={formData.fullName}
                icon={User}
              />
              <EditField
                label="Official Staff Serial Designation"
                name="id"
                value={id || "UNASSIGNED"}
                icon={Hash}
                disabled={true}
              />
              <EditField
                label="Corporate Email"
                name="email"
                value={formData.email}
                icon={Mail}
                type="email"
              />
              <EditField
                label="Operational Department"
                name="department"
                value={formData.department}
                icon={Award}
              />
            </div>
          </div>

          {/* --- CLEARANCE SELECTION MATRIX --- */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2 border-l-4 border-teal-900 pl-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-teal-950">
                Clearance Level Matrix
              </h3>
            </div>

            <div className="bg-white border border-teal-900/5 rounded-[32px] overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-teal-900/5 border-b border-teal-900/10">
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-teal-900/40 tracking-widest">
                      Tier
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-teal-900/40 tracking-widest">
                      Authority Title
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-teal-900/40 tracking-widest">
                      Access Scope
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-900/5">
                  {[
                    {
                      token: "LEVEL 1: OBSERVER",
                      display: "1",
                      title: "Observer",
                      desc: "View-only access to basic transaction logs.",
                    },
                    {
                      token: "LEVEL 2: ASSOCIATE",
                      display: "2",
                      title: "Associate",
                      desc: "Update KYC and customer contact profiles.",
                    },
                    {
                      token: "LEVEL 3: DEPT OPERATOR",
                      display: "3",
                      title: "Manager",
                      desc: "Authorize fund transfers and fee waivers.",
                    },
                    {
                      token: "LEVEL 4: DIRECTOR",
                      display: "4",
                      title: "Director",
                      desc: "Staff management and branch vault overrides.",
                    },
                    {
                      token: "LEVEL 5: GLOBAL ROOT",
                      display: "5",
                      title: "Super-Admin",
                      desc: "Full terminal architecture and system config.",
                    },
                  ].map((item) => (
                    <tr
                      key={item.token}
                      onClick={() =>
                        setFormData({ ...formData, clearanceLevel: item.token })
                      }
                      className={`cursor-pointer transition-all group ${
                        formData.clearanceLevel === item.token
                          ? "bg-teal-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all ${
                            formData.clearanceLevel === item.token
                              ? "bg-teal-950 text-white scale-110 shadow-lg"
                              : "bg-gray-100 text-gray-400 group-hover:bg-teal-900/10"
                          }`}
                        >
                          {item.display}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p
                          className={`text-sm font-black uppercase ${
                            formData.clearanceLevel === item.token
                              ? "text-teal-950"
                              : "text-gray-400"
                          }`}
                        >
                          {item.title}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[11px] font-bold text-gray-500 uppercase leading-relaxed tracking-tight">
                          {item.desc}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Column 2: Audit & Info */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2 border-l-4 border-teal-900 pl-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-teal-950">
              System Notice
            </h3>
          </div>

          <div className="bg-orange-50 p-7 rounded-[40px] space-y-4 border border-orange-200">
            <AlertCircle size={24} className="text-orange-600" />
            <h4 className="text-xs font-black uppercase text-orange-950">
              Audit Requirement
            </h4>
            <p className="text-[11px] font-bold text-orange-800/70 leading-relaxed uppercase tracking-tight">
              Modifying system credentials will trigger an automated
              notification to the{" "}
              <span className="text-orange-900 font-black underline">
                Compliance Department
              </span>
              .
            </p>
            <div className="pt-2">
              <p className="text-[9px] font-black text-orange-950/40 uppercase">
                Action will be logged as:
              </p>
              <p className="text-[10px] font-mono font-bold text-orange-900">
                EVT_STAFF_MOD_2026
              </p>
            </div>
          </div>

          <div className="bg-teal-950 p-6 rounded-[32px] text-white shadow-xl flex items-start gap-4">
            <ShieldCheck size={20} className="text-teal-400 mt-1" />
            <div>
              <h4 className="text-[10px] font-black uppercase text-teal-400 tracking-widest mb-1">
                Active Selection
              </h4>
              <p className="text-[12px] font-black italic text-white leading-tight uppercase">
                {formData.clearanceLevel} <br />
                <span className="text-teal-300 font-medium font-sans not-italic text-[11px] tracking-wide block mt-1">
                  {formData.department || "No Department Assigned"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrestlineStaffEditView;
