import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Copy, ShieldCheck, MapPin, 
  User, Landmark, AlertTriangle, Edit3, Save, X 
} from "lucide-react";
// import CrestlineAdminLayout from "./CrestlineAdminLayout";
import CrestlineStaffLayout from "./CrestlineStaffLayout";

const CrestlineCustomerView = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  // State management for editability
  const [customer, setCustomer] = useState({
    personal: {
      fullName: "Chidi Okoro",
      email: "chidi@example.com",
      phoneNumber: "+2348012345678",
      gender: "Male",
      dob: "1994-05-12",
    },
    identity: {
      bvn: "22234567890",
      nin: "12345678901",
      kycLevel: 3,
      isVerified: true,
    },
    banking: {
      accountNumber: "0123456789",
      accountBalance: 5025000.75,
      status: "Active",
    },
    address: { 
      street: "12 Admiralty Way", 
      lga: "Eti-Osa", 
      state: "Lagos" 
    },
    emergency: {
      nextOfKinName: "Amaka Okoro",
      nextOfKinPhone: "+2348098765432",
    },
  });

  const handleUpdate = (section, field, value) => {
    setCustomer(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const SectionHeader = ({ title, icon: Icon }) => (
    <div className="flex items-center gap-2 mb-4 border-b border-teal-900/10 pb-2">
      <Icon size={14} className="text-teal-600" />
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-900/60">{title}</h3>
    </div>
  );

  const DataField = ({ label, section, field, value, copyable = false }) => (
    <div className={`group transition-all p-4 rounded-2xl border ${isEditing ? 'bg-white border-teal-500 shadow-sm' : 'bg-white/50 border-white/80'}`}>
      <p className="text-[9px] font-bold text-gray-400 uppercase mb-1 tracking-wider">{label}</p>
      <div className="flex justify-between items-center">
        {isEditing ? (
          <input 
            type="text"
            value={value}
            onChange={(e) => handleUpdate(section, field, e.target.value)}
            className="w-full bg-transparent text-sm font-black text-teal-950 font-mono outline-none focus:ring-0"
          />
        ) : (
          <p className="text-sm font-black text-teal-950 font-mono">{value}</p>
        )}
        {copyable && !isEditing && <Copy size={12} className="text-gray-300 group-hover:text-teal-600 cursor-pointer" />}
      </div>
    </div>
  );

  return (
    <CrestlineStaffLayout>
      <div className="max-w-7xl mx-auto space-y-8 text-left pb-20">
        
        {/* --- HEADER HUD --- */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/30 p-8 rounded-[40px] border border-white/60 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate(-1)} className="w-14 h-14 bg-teal-950 text-white rounded-2xl flex items-center justify-center hover:bg-black shadow-xl transition-all">
              <ArrowLeft size={24} />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-4xl font-black text-teal-950 tracking-tighter uppercase italic">{customer.personal.fullName}</h1>
                <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                  <ShieldCheck size={10} /> Verified
                </div>
              </div>
              <p className="text-xs font-bold text-teal-700/60 uppercase tracking-widest">NUBAN: {customer.banking.accountNumber} • {customer.banking.status}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-8 py-4 bg-teal-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-xl"
              >
                <Edit3 size={16} /> Edit Node Info
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                >
                  <X size={16} /> Cancel
                </button>
                <button 
                  onClick={() => {
                    // Logic to save changes would go here
                    setIsEditing(false);
                  }}
                  className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20"
                >
                  <Save size={16} /> Update Node
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- DATA GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Identity */}
          <div className="space-y-4">
            <SectionHeader title="Compliance Node" icon={ShieldCheck} />
            <DataField label="BVN" section="identity" field="bvn" value={customer.identity.bvn} copyable />
            <DataField label="NIN" section="identity" field="nin" value={customer.identity.nin} copyable />
            <DataField label="KYC Level" section="identity" field="kycLevel" value={customer.identity.kycLevel} />
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <SectionHeader title="Bio-Data Registry" icon={User} />
            <DataField label="Email" section="personal" field="email" value={customer.personal.email} copyable />
            <DataField label="Phone" section="personal" field="phoneNumber" value={customer.personal.phoneNumber} />
            <div className="grid grid-cols-2 gap-3">
              <DataField label="Gender" section="personal" field="gender" value={customer.personal.gender} />
              <DataField label="DOB" section="personal" field="dob" value={customer.personal.dob} />
            </div>
          </div>

          {/* Location & Emergency */}
          <div className="space-y-4">
            <SectionHeader title="Security & Recovery" icon={MapPin} />
            <DataField label="Address" section="address" field="street" value={customer.address.street} />
            
            <div className={`p-5 rounded-2xl border transition-all ${isEditing ? 'bg-white border-teal-500 shadow-sm' : 'bg-teal-950/5 border-teal-900/5'}`}>
                <div className="flex items-center gap-2 mb-3">
                   <AlertTriangle size={14} className="text-teal-700" />
                   <p className="text-[9px] font-black uppercase text-teal-900/40 tracking-widest">Next of Kin</p>
                </div>
                {isEditing ? (
                  <div className="space-y-3">
                    <input 
                      className="w-full bg-teal-50 p-2 rounded text-sm font-black uppercase outline-none"
                      value={customer.emergency.nextOfKinName}
                      onChange={(e) => handleUpdate('emergency', 'nextOfKinName', e.target.value)}
                    />
                    <input 
                      className="w-full bg-teal-50 p-2 rounded text-xs font-bold font-mono outline-none"
                      value={customer.emergency.nextOfKinPhone}
                      onChange={(e) => handleUpdate('emergency', 'nextOfKinPhone', e.target.value)}
                    />
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-black text-teal-950 uppercase mb-1">{customer.emergency.nextOfKinName}</p>
                    <p className="text-xs font-bold text-teal-700">{customer.emergency.nextOfKinPhone}</p>
                  </>
                )}
            </div>
          </div>

        </div>

        {/* --- FOOTER STATUS --- */}
        <div className="bg-teal-950 p-8 rounded-[32px] flex items-center justify-between">
           <div>
              <p className="text-teal-400 text-[10px] font-black uppercase tracking-widest">System Integrity Check</p>
              <p className="text-white text-xs font-bold">Node CRST-{customer.banking.accountNumber} is currently operational.</p>
           </div>
           <Landmark size={32} className="text-white/20" />
        </div>

      </div>
    </CrestlineStaffLayout>
  );
};

export default CrestlineCustomerView;