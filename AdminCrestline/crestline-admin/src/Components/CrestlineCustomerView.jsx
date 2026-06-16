import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  ShieldCheck,
  MapPin,
  User,
  AlertTriangle,
  Loader2,
  ShieldAlert
} from "lucide-react";

const CrestlineCustomerView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [customerData, setCustomerData] = useState(location.state?.targetCustomer || null);
  const [isLoading, setIsLoading] = useState(!location.state?.targetCustomer);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5300/admin';
  const token = localStorage.getItem("admin_crestline_token") || localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchFullCustomerPayload = async () => {
      const targetId = id || location.state?.targetCustomer?._id || location.state?.targetCustomer?.id;
      
      if (!targetId) {
        setError("Missing trace identifier parameters.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/personnel/users/${targetId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const result = await response.json();

        if (response.ok && (result.data || result.user)) {
          setCustomerData(result.data || result.user);
        } else {
          throw new Error(result.message || "Failed to stream complete profile matrices.");
        }
      } catch (err) {
        console.error("Database compilation mapping fault:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFullCustomerPayload();
  }, [id, API_URL, token]);

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-3 text-teal-900/60 font-medium">
        <Loader2 className="animate-spin text-teal-800" size={32} />
        <p className="text-xs uppercase tracking-widest font-bold">Querying Active Database Clusters...</p>
      </div>
    );
  }

  if (error && !customerData) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-3 text-red-700 font-medium p-6 text-center">
        <ShieldAlert className="text-red-600" size={32} />
        <p className="text-xs uppercase tracking-widest font-bold">Ledger Synchronization Failure</p>
        <span className="text-[10px] text-gray-400 font-mono">{error}</span>
        <button 
          onClick={() => navigate("/admin/personnel/users")}
          className="mt-4 px-5 py-2.5 bg-teal-900 text-white text-[10px] font-black uppercase tracking-wider rounded-xl"
        >
          Return to Registry Directory
        </button>
      </div>
    );
  }

  const customer = {
    personal: {
      fullName: customerData.fullName || `${customerData.firstname || ""} ${customerData.lastname || ""}`.trim() || "N/A",
      email: customerData.email || "N/A",
      phoneNumber: customerData.phone || customerData.phoneNumber || "N/A",
      gender: customerData.gender === "m" ? "Male" : customerData.gender === "f" ? "Female" : "Other",
      dob: customerData.dob ? new Date(customerData.dob).toISOString().split('T')[0] : "N/A",
    },
    identity: {
      bvn: customerData.bvn || customerData.kycMetadata?.bvn || "NOT LINKED",
      nin: customerData.nin || customerData.kycMetadata?.nin || "NOT LINKED",
      kycLevel: customerData.currentComplianceTier || customerData.kyc?.level || 1,
      isVerified: customerData.kyc?.status === "Verified" || customerData.status === "active",
    },
    banking: {
      accountNumber: customerData.accountNumber || "0000000000",
      accountBalance: customerData.balance ?? 0.00,
      status: customerData.status === "active" ? "Active" : customerData.status || "Flagged",
    },
    address: {
      street: customerData.address || "No Registered Street Node",
      lga: customerData.lga || "N/A",
      state: customerData.state || "N/A",
    },
    emergency: {
      nextOfKinName: customerData.mandates?.[0]?.name || "NOT SET",
      nextOfKinPhone: customerData.mandates?.[0]?.phone || "NOT SET",
    },
  };

  const SectionHeader = ({ title, icon: Icon }) => (
    <div className="flex items-center gap-2 mb-4 border-b border-teal-900/10 pb-2">
      <Icon size={14} className="text-teal-600" />
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-900/60">
        {title}
      </h3>
    </div>
  );

  const DataField = ({ label, value, copyable = false, isStatus = false }) => (
    <div className="group bg-white/50 border border-white/80 p-4 rounded-2xl hover:shadow-md transition-all">
      <p className="text-[9px] font-bold text-gray-400 uppercase mb-1 tracking-wider">
        {label}
      </p>
      <div className="flex justify-between items-center">
        <p className={`text-sm font-black ${isStatus ? "text-emerald-600" : "text-teal-950"} font-mono`}>
          {value}
        </p>
        {copyable && value !== "NOT LINKED" && value !== "N/A" && (
          <Copy
            size={12}
            className="text-gray-300 group-hover:text-teal-600 cursor-pointer"
            onClick={() => navigator.clipboard.writeText(value)}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-left pb-20 animate-in fade-in duration-300">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/30 p-8 rounded-[40px] border border-white/60 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/admin/personnel/users")}
            className="w-14 h-14 bg-teal-900 text-white rounded-2xl flex items-center justify-center hover:bg-teal-800 shadow-xl transition-transform active:scale-95"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-4xl font-black text-teal-950 tracking-tighter uppercase italic">
                {customer.personal.fullName}
              </h1>
              {customer.identity.isVerified && (
                <div className="flex items-center gap-1 bg-emerald-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                  <ShieldCheck size={10} /> Verified Asset
                </div>
              )}
            </div>
            <p className="text-xs font-bold text-teal-700/60 uppercase tracking-widest flex items-center gap-2 italic">
              NUBAN: {customer.banking.accountNumber} • Status: {customer.banking.status}
            </p>
          </div>
        </div>

        <div className="bg-teal-900 p-6 px-10 rounded-[30px] shadow-2xl text-right">
          <p className="text-[9px] font-bold text-teal-100/50 uppercase tracking-[0.2em] mb-1">
            Ledger Balance (NGN)
          </p>
          <h2 className="text-4xl font-black text-white tracking-tighter">
            ₦{customer.banking.accountBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <SectionHeader title="Compliance Node" icon={ShieldCheck} />
          <DataField label="Government Registration (ID/BVN)" value={customer.identity.bvn} copyable />
          <DataField label="National Identity Number (NIN)" value={customer.identity.nin} copyable />
          <DataField label="KYC Level" value={`Level ${customer.identity.kycLevel}`} />
          <DataField label="Transaction PIN Status" value="SYSTEM ENCRYPTED" />
        </div>

        <div className="space-y-4">
          <SectionHeader title="Bio-Data Registry" icon={User} />
          <DataField label="Email Address" value={customer.personal.email} copyable />
          <DataField label="Mobile Number" value={customer.personal.phoneNumber} />
          <div className="grid grid-cols-2 gap-3">
            <DataField label="Gender" value={customer.personal.gender} />
            <DataField label="Date of Birth" value={customer.personal.dob} />
          </div>
        </div>

        <div className="space-y-4">
          <SectionHeader title="Security & Recovery" icon={MapPin} />
          <DataField
            label="Residential Node"
            value={customer.address.lga !== "N/A" ? `${customer.address.street}, ${customer.address.lga}, ${customer.address.state}` : customer.address.street}
          />
          <div className="p-5 bg-teal-50 rounded-2xl border border-teal-100">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} className="text-teal-700" />
              <p className="text-[9px] font-black uppercase text-teal-700 tracking-widest">
                Next of Kin Contact
              </p>
            </div>
            <p className="text-sm font-black text-teal-950 uppercase mb-1">
              {customer.emergency.nextOfKinName}
            </p>
            <p className="text-xs font-bold text-teal-700">
              {customer.emergency.nextOfKinPhone}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrestlineCustomerView;