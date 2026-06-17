import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Search, Calendar, Download, ShoppingBag, 
  User, Zap, CreditCard, ChevronRight, Share2, 
  ShieldCheck, Copy, CheckCircle2, X, ArrowDownLeft
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// --- Navbar Wrapper ---
import CrestlineNavbar from './CrestlineNavbar'; 

// ==========================================
// 1. DYNAMIC CATEGORY TO ICON MATRIX MAPPER
// ==========================================
const getTransactionIcon = (category) => {
  switch (category?.toLowerCase()) {
    case 'entertainment': return <Zap />;
    case 'deposit': return <ArrowDownLeft />;
    case 'transfer': return <User />;
    case 'betting': return <ShoppingBag />;
    case 'investment': return <CreditCard />;
    default: return <CreditCard />;
  }
};

// ==========================================
// 2. CHILD RECEIPT INTERFACE VIEW Component
// ==========================================
const CrestlineReceiptView = ({ tx, onBack }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Reference ID: ${text} copied to clipboard`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Crestline Transaction Receipt',
          text: `Transaction of ₦${Number(tx.amount).toLocaleString()} to ${tx.title} was successful.`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      alert("Sharing not supported on this device natively.");
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
          <ChevronLeft size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest italic">Back to Ledger</span>
        </button>
        <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
          <CheckCircle2 size={12} />
          <span className="text-[9px] font-black uppercase tracking-widest">Success</span>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full bg-white text-black rounded-t-[40px] p-8 md:p-12 relative shadow-2xl"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl">
            {getTransactionIcon(tx.category)}
          </div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Official Receipt</h2>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mt-1">CRESTLINE</h1>
        </div>

        <div className="text-center mb-10 pb-10 border-b border-dashed border-zinc-200">
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Transaction Volume</p>
          <h3 className="text-5xl font-black italic tracking-tighter">
            {tx.type === 'credit' ? '+' : '-'}₦{Number(tx.amount).toLocaleString()}
          </h3>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Description Target</span>
            <span className="text-xs font-black uppercase text-right italic max-w-[170px]">{tx.title}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Destination Platform</span>
            <span className="text-xs font-black uppercase italic">{tx.bank || 'Crestline Core System'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Timestamp Matrix</span>
            <span className="text-xs font-black uppercase italic">{tx.date} | {tx.rawTime || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Allocation Reference</span>
            <span className="text-xs font-black uppercase text-right italic max-w-[170px]">{tx.reference || 'N/A'}</span>
          </div>
          
          <div className="pt-6 border-t border-zinc-100 space-y-2">
            <div className="flex justify-between items-center group cursor-pointer" onClick={() => copyToClipboard(tx.id)}>
              <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Reference ID</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-zinc-600">{tx.id}</span>
                <Copy size={12} className="text-zinc-300 group-hover:text-blue-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-3 left-0 right-0 flex justify-around overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="w-4 h-6 bg-white rounded-full -mb-3 shadow-inner" />
          ))}
        </div>
      </motion.div>

      <div className="w-full bg-zinc-900 rounded-b-[40px] p-6 flex flex-col items-center border-t border-white/5 shadow-xl">
         <div className="flex items-center gap-2 mb-4 opacity-50">
           <ShieldCheck size={14} className="text-blue-500" />
           <span className="text-[8px] font-black uppercase tracking-widest text-white">Verified by Crestline Security</span>
         </div>
         
         <div className="grid grid-cols-2 gap-4 w-full">
            <button 
              onClick={() => window.print()} 
              className="flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all active:scale-95"
            >
              <Download size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Print / Save</span>
            </button>
            
            <button 
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-4 bg-blue-600 rounded-2xl text-white hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
            >
              <Share2 size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Share Entry</span>
            </button>
         </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. MAIN INTEGRATED MASTER CORE LEDGER PAGE
// ==========================================
const CrestlineLedger = () => {
  const [transactions, setTransactions] = useState([]);
  const [accountHolder, setAccountHolder] = useState({ name: '', accountType: '', accountNumber: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  // Date Picker States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const printTemplateRef = useRef(null);

  // FETCHING TRANSACTIONS DATA ENGINE FROM THE NEW ENDPOINT
  useEffect(() => {
    const fetchLedgerData = async () => {
      try {
        setLoading(true);
        // Points exactly to your live 5300 express port setup
        const response = await fetch('http://localhost:5300/reciept/ledger-data', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('crestline_token')}` 
          }
        });

        if (!response.ok) {
          throw new Error('Failed to synchronize backend transaction arrays.');
        }

        const resData = await response.json();
        setTransactions(resData.transactions || []);
        setAccountHolder(resData.accountHolder);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLedgerData();
  }, []);

  // Advanced Filtering Engine: Handles Search, Category Tabs, and Range Dates
  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter = filter === 'all' || tx.type === filter;
    
    const matchesSearch = (tx.title?.toLowerCase().includes(searchQuery.toLowerCase())) || 
                          (tx.category?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (tx.id?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && tx.date >= startDate;
    }
    if (endDate) {
      matchesDate = matchesDate && tx.date <= endDate;
    }

    return matchesFilter && matchesSearch && matchesDate;
  });

  // Calculate dynamic meta metrics totals based on incoming real database values
  let totalCredit = 0;
  let totalDebit = 0;
  filteredTransactions.forEach(tx => {
    const numValue = typeof tx.amount === 'string' 
      ? parseFloat(tx.amount.replace(/,/g, '')) 
      : Number(tx.amount);
    
    if (!isNaN(numValue)) {
      if (tx.type === 'credit') totalCredit += numValue;
      if (tx.type === 'debit') totalDebit += numValue;
    }
  });

  // Bulletproof Canvas-to-PDF Downloader Mechanism
  const handleExportPDFStatement = async () => {
    if (filteredTransactions.length === 0) {
      alert("No data available to print inside this current view filter.");
      return;
    }

    const element = printTemplateRef.current;
    element.style.display = 'block';

    try {
      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190; 
      const pageHeight = 295;  
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Crestline_Statement_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("PDF generation failure sequence:", error);
      alert("Export blocked by runtime environment framework.");
    } finally {
      element.style.display = 'none';
    }
  };

  const clearDateRange = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <CrestlineNavbar>
      <div className="p-4 md:p-10 max-w-2xl mx-auto min-h-[90vh]">
        
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-32 space-y-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 animate-pulse">Syncing Core Vault...</p>
            </div>
          ) : error ? (
            <div className="p-8 border border-red-500/20 bg-red-500/5 rounded-3xl text-center space-y-4">
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Error: {error}</p>
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10">
                Retry Connection
              </button>
            </div>
          ) : !selectedTransaction ? (
            <motion.div
              key="ledger-board"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-0"
            >
              {/* HEADER CONTAINER */}
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                  <button onClick={() => window.history.back()} className="group flex items-center gap-2 text-zinc-600 hover:text-white transition-colors mb-4">
                    <ChevronLeft size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Return to Terminal</span>
                  </button>
                  <h1 className="text-4xl font-black italic uppercase tracking-tighter">
                    Crestline<span className="text-blue-500">Ledger</span>
                  </h1>
                </div>
                <button 
                  onClick={handleExportPDFStatement}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white border border-blue-500 px-5 py-3 rounded-2xl hover:bg-blue-500 transition-all font-bold shadow-lg shadow-blue-600/20"
                >
                  <Download size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Export PDF Statement</span>
                </button>
              </div>

              {/* SEARCH ENGINE & DYNAMIC DATE RANGE CONTROLLER */}
              <div className="space-y-3 mb-8">
                <div className="flex gap-3">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search ledger records..."
                      className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all placeholder:text-zinc-700"
                    />
                  </div>
                  <button 
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className={`p-4 border rounded-2xl transition-all flex items-center gap-2 ${
                      showDatePicker || startDate || endDate
                      ? 'bg-blue-600/10 border-blue-500 text-blue-500' 
                      : 'bg-zinc-950 border-white/5 text-zinc-500 hover:text-blue-500'
                    }`}
                  >
                    <Calendar size={20} />
                  </button>
                </div>

                {/* DATE EXPANSION PANEL DRAWER */}
                {showDatePicker && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-zinc-950 border border-white/5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 relative"
                  >
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-wider text-zinc-500 mb-2">Start Constraint Date</label>
                      <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/5 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-wider text-zinc-500 mb-2">Termination End Date</label>
                      <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/5 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-blue-500" 
                      />
                    </div>
                    {(startDate || endDate) && (
                      <button 
                        onClick={clearDateRange}
                        className="absolute right-4 top-4 text-zinc-600 hover:text-red-400 transition-colors"
                        title="Reset Date Ranges"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </motion.div>
                )}
              </div>

              {/* TABS FILTERS */}
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {['all', 'credit', 'debit'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                      filter === t 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'bg-white/5 text-zinc-500 border border-white/5 hover:text-zinc-300'
                    }`}
                  >
                    {t} Accounts
                  </button>
                ))}
              </div>

              {/* LIST LOGICAL HISTORY ENTRIES */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 ml-2 mb-2 italic">Active History Stream</p>
                
                {filteredTransactions.length === 0 ? (
                  <div className="p-16 border border-dashed border-white/5 rounded-[32px] text-center text-zinc-600 text-xs italic font-bold uppercase tracking-wider">
                    No records exist inside parameters.
                  </div>
                ) : (
                  filteredTransactions.map((tx, index) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="group bg-zinc-950/50 border border-white/5 p-5 rounded-[28px] flex items-center justify-between hover:bg-white/5 hover:border-blue-500/30 transition-all cursor-pointer"
                      onClick={() => setSelectedTransaction(tx)}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`p-4 rounded-2xl ${
                          tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-600/10 text-blue-500'
                        }`}>
                          {getTransactionIcon(tx.category)}
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm font-black uppercase italic tracking-tight text-zinc-200 group-hover:text-white transition-colors">{tx.title}</h4>
                          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{tx.date} {tx.rawTime ? `• ${tx.rawTime}` : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-lg font-black italic tracking-tighter ${
                            tx.type === 'credit' ? 'text-emerald-500' : 'text-white'
                          }`}>
                            {tx.type === 'credit' ? '+' : '-'}₦{Number(tx.amount).toLocaleString()}
                          </p>
                          <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest italic">{tx.category}</p>
                        </div>
                        <ChevronRight size={16} className="text-zinc-800 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div key="receipt-view" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="w-full">
              <CrestlineReceiptView tx={selectedTransaction} onBack={() => setSelectedTransaction(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* =======================================================
          HIDDEN ARCHIVAL PRINT PRINT-TEMPLATE (Render Engine Target)
         ======================================================= */}
      <div 
        ref={printTemplateRef} 
        style={{ display: 'none', width: '210mm', padding: '20mm', backgroundColor: '#ffffff', color: '#000000' }}
        className="font-sans text-black"
      >
        {/* Document Banner */}
        <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', borderBottom: '3px solid #18181b', paddingBottom: '6mm', marginBottom: '8mm' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '-0.05em', color: '#111111', margin: 0 }}>CRESTLINE DIGITAL BANK</h1>
            <p style={{ fontSize: '10px', fontWeight: '800', tracking: '0.2em', color: '#3b82f6', margin: '1mm 0 0 0' }}>OFFICIAL STATEMENT OF ACCOUNT</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '9px', color: '#71717a' }}>
            <p style={{ margin: 0 }}>Report Run: {new Date().toLocaleDateString()}</p>
            <p style={{ margin: 0 }}>System Node ID: CL-9942</p>
          </div>
        </div>

        {/* Dynamic Context Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10mm', marginBottom: '8mm', fontSize: '11px', lineHeight: '1.6' }}>
          <div style={{ border: '1px solid #e4e4e7', padding: '4mm', borderRadius: '4mm' }}>
            <p style={{ margin: 0, fontWeight: '800', color: '#71717a', fontSize: '9px' }}>ACCOUNT HOLDER META</p>
            <p style={{ margin: '1mm 0 0 0', fontSize: '13px', fontWeight: '900' }}>{accountHolder.name || 'N/A'}</p>
            <p style={{ margin: 0 }}><strong>Number:</strong> {accountHolder.accountNumber || 'N/A'}</p>
            <p style={{ margin: 0 }}><strong>Tier Type:</strong> {accountHolder.accountType || 'N/A'}</p>
          </div>
          <div style={{ border: '1px solid #e4e4e7', padding: '4mm', borderRadius: '4mm', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ margin: 0, fontWeight: '800', color: '#71717a', fontSize: '9px' }}>STATEMENT BALANCE MATRIX SCOPE</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1mm' }}>
              <span>Total Stream Credits:</span>
              <span style={{ color: '#10b981', fontWeight: '900' }}>+₦{totalCredit.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Stream Debits:</span>
              <span style={{ color: '#dc2626', fontWeight: '900' }}>-₦{totalDebit.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Structured Table Layout */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#18181b', color: '#ffffff', fontWeight: 'bold' }}>
              <th style={{ padding: '3mm', border: '1px solid #18181b' }}>Transaction ID</th>
              <th style={{ padding: '3mm', border: '1px solid #18181b' }}>Date Stamp</th>
              <th style={{ padding: '3mm', border: '1px solid #18181b' }}>Description Target</th>
              <th style={{ padding: '3mm', border: '1px solid #18181b' }}>Allocation</th>
              <th style={{ padding: '3mm', border: '1px solid #18181b', textAlign: 'right' }}>Volume Amount (NGN)</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx, i) => (
              <tr key={tx.id} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f4f4f5' }}>
                <td style={{ padding: '3mm', border: '1px solid #e4e4e7', fontFamily: 'monospace' }}>{tx.id}</td>
                <td style={{ padding: '3mm', border: '1px solid #e4e4e7' }}>{tx.date}</td>
                <td style={{ padding: '3mm', border: '1px solid #e4e4e7', fontWeight: '700' }}>{tx.title?.toUpperCase()}</td>
                <td style={{ padding: '3mm', border: '1px solid #e4e4e7', fontSize: '9px', color: '#52525b' }}>{tx.category?.toUpperCase()}</td>
                <td style={{ padding: '3mm', border: '1px solid #e4e4e7', textAlign: 'right', fontWeight: '900', color: tx.type === 'credit' ? '#10b981' : '#111111' }}>
                  {tx.type === 'credit' ? '+' : '-'}₦{Number(tx.amount).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Certification validation notice footer */}
        <div style={{ marginTop: '15mm', borderTop: '1px dashed #e4e4e7', paddingTop: '4mm', textAlign: 'center', fontSize: '9px', color: '#a1a1aa' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>SYSTEM VERIFIED RECORD • VALID SEAL SECURITY ASSURED BY CRESTLINE CRYPTOGRAPHIC CORE</p>
        </div>
      </div>
    </CrestlineNavbar>
  );
};

export default CrestlineLedger;