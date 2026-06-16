import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Filter,
  Search,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  ChevronLeft,
  ChevronRight,
  Printer,
  Share2,
  Landmark
} from "lucide-react";
import CrestlineStaffLayout from "./CrestlineStaffLayout";

const CrestlineUserFullstatement = () => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState("all");

  const customer = {
    name: "Chidi Okoro",
    account: "0123456789",
    balance: 5025000.75,
    currency: "NGN",
  };

  const transactions = [
    { id: "TXN-99201", date: "2024-03-15", desc: "ATM Withdrawal - Lekki Phase 1", type: "debit", amount: 20000.00, balance: 5025000.75 },
    { id: "TXN-99198", date: "2024-03-14", desc: "POS Purchase - Spar Supermarket", type: "debit", amount: 45200.50, balance: 5045000.75 },
    { id: "TXN-99150", date: "2024-03-12", desc: "Inbound Transfer - Zenith Bank / From: Tunde", type: "credit", amount: 150000.00, balance: 5090201.25 },
    { id: "TXN-99142", date: "2024-03-10", desc: "Web Payment - Netflix Subscription", type: "debit", amount: 4500.00, balance: 4940201.25 },
    { id: "TXN-99130", date: "2024-03-08", desc: "Maintenance Fee", type: "debit", amount: 50.00, balance: 4944701.25 },
    { id: "TXN-99125", date: "2024-03-05", desc: "Salary Credit - TechCorp Solutions", type: "credit", amount: 850000.00, balance: 4944751.25 },
  ];

  return (
    <CrestlineStaffLayout>
      <div className="max-w-[1600px] mx-auto p-6 space-y-6 text-left">
        
        {/* --- HEADER HUD: SUMMARY & PRIMARY ACTIONS --- */}
        <div className="bg-teal-950 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate(-1)}
                className="w-12 h-12 bg-white/10 hover:bg-white text-white hover:text-teal-950 rounded-2xl flex items-center justify-center transition-all"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
                  Transaction Ledger
                </h1>
                <p className="text-[10px] font-mono text-teal-400 font-bold uppercase mt-1 tracking-[0.2em]">
                  {customer.name} • {customer.account}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-teal-950 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20">
                <Download size={16} /> Download Statement
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border border-white/10">
                <Printer size={16} /> Print
              </button>
              <button className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all border border-white/10">
                <Share2 size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 pt-8 border-t border-white/5">
            <div>
              <p className="text-[9px] font-black text-teal-400 uppercase tracking-widest mb-1">Available Balance</p>
              <h2 className="text-4xl font-black italic">₦{customer.balance.toLocaleString()}</h2>
            </div>
            <div>
              <p className="text-[9px] font-black text-teal-400 uppercase tracking-widest mb-1">Period Inflow</p>
              <p className="text-2xl font-black text-emerald-400">+₦1,000,000.00</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-teal-400 uppercase tracking-widest mb-1">Period Outflow</p>
              <p className="text-2xl font-black text-red-400">-₦69,750.50</p>
            </div>
          </div>
        </div>

        {/* --- FILTER TERMINAL --- */}
        <div className="bg-white rounded-[32px] p-4 border border-teal-900/5 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-teal-50 p-2 rounded-2xl">
            {['all', 'credit', 'debit'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filterType === type ? "bg-teal-950 text-white shadow-md" : "text-teal-900/40 hover:text-teal-900"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex flex-1 max-w-md items-center gap-3 px-4 py-2 bg-teal-50 rounded-2xl border border-transparent focus-within:border-teal-500 transition-all">
            <Search size={16} className="text-teal-900/30" />
            <input 
              type="text" 
              placeholder="Search by Narration, ID or Amount..."
              className="bg-transparent border-none outline-none w-full text-xs font-bold text-teal-950 placeholder:text-teal-900/30"
            />
          </div>

          <button className="flex items-center gap-2 px-6 py-3 bg-teal-900/5 hover:bg-teal-900 hover:text-white text-teal-950 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
            <Calendar size={14} /> Date Range
          </button>
        </div>

        {/* --- LEDGER TABLE --- */}
        <div className="bg-white rounded-[40px] border border-teal-900/5 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-teal-50/50">
                <th className="p-6 text-[10px] font-black text-teal-900 uppercase tracking-widest">Transaction Date</th>
                <th className="p-6 text-[10px] font-black text-teal-900 uppercase tracking-widest">Reference / Narration</th>
                <th className="p-6 text-[10px] font-black text-teal-900 uppercase tracking-widest">Type</th>
                <th className="p-6 text-[10px] font-black text-teal-900 uppercase tracking-widest text-right">Amount</th>
                <th className="p-6 text-[10px] font-black text-teal-900 uppercase tracking-widest text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-900/5">
              {transactions.map((txn, index) => (
                <tr key={index} className="hover:bg-teal-50/30 transition-colors group">
                  <td className="p-6">
                    <p className="text-xs font-black text-teal-950">{txn.date}</p>
                    <p className="text-[9px] font-mono font-bold text-teal-900/40 mt-1 uppercase">{txn.id}</p>
                  </td>
                  <td className="p-6 max-w-xs">
                    <p className="text-xs font-bold text-teal-900 uppercase leading-relaxed">{txn.desc}</p>
                  </td>
                  <td className="p-6">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                      txn.type === 'credit' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}>
                      {txn.type === 'credit' ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                      {txn.type}
                    </div>
                  </td>
                  <td className={`p-6 text-right font-mono text-sm font-black ${
                    txn.type === 'credit' ? "text-emerald-600" : "text-red-600"
                  }`}>
                    {txn.type === 'credit' ? "+" : "-"}₦{txn.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </td>
                  <td className="p-6 text-right font-mono text-sm font-black text-teal-950">
                    ₦{txn.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* --- PAGINATION --- */}
          <div className="p-6 bg-teal-50/30 border-t border-teal-900/5 flex items-center justify-between">
            <p className="text-[10px] font-black text-teal-900/40 uppercase tracking-widest">
              Showing 1 - 6 of 1,240 Entries
            </p>
            <div className="flex gap-2">
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-teal-900/10 text-teal-900 hover:bg-teal-950 hover:text-white transition-all">
                <ChevronLeft size={18} />
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-teal-950 text-white shadow-lg">
                1
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-teal-900/10 text-teal-900 hover:bg-teal-950 hover:text-white transition-all">
                2
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-teal-900/10 text-teal-900 hover:bg-teal-950 hover:text-white transition-all">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </CrestlineStaffLayout>
  );
};

export default CrestlineUserFullstatement;