import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { 
  ChevronLeft, TrendingUp, Wallet, PieChart, 
  ArrowUpRight, XCircle, Calculator, ArrowRight, CheckCircle2, 
  Briefcase, ShieldCheck, PlusCircle, ArrowDownCircle
} from "lucide-react";

// --- Custom Crestline Shared Global Layout Core UI Components ---
import CrestlineNavbar from "./CrestlineNavbar";
import CrestlineTransactionPinModal from "./CrestlineTransactionPinModal";

const CrestlineInvestV2 = () => {
  const [activeTab, setActiveTab] = useState("portfolio"); 
  const [showPinModal, setShowPinModal] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false); 
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [actionType, setActionType] = useState(""); 
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [withdrawAmounts, setWithdrawAmounts] = useState({});
  const [fundAmount, setFundAmount] = useState(""); 
  const [poolWithdrawAmount, setPoolWithdrawAmount] = useState(""); // Isolated pool withdrawal input state
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState(12);

  // ── CORE FINANCIAL ACCOUNT BALANCE POOL STATES ──
  const [userAccountBalance, setUserAccountBalance] = useState(0);
  const [myInvestments, setMyInvestments] = useState([]);
  const [completedInvestments, setCompletedInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // STATIC ASSET TREE VAULT DESIGN RULES
  const vaults = [
    { id: 'fixed', name: 'Fixed Income', roi: '14%', risk: 'Low', desc: 'Secure government backed bonds.', color: 'text-emerald-500' },
    { id: 'realestate', name: 'Real Estate', roi: '22%', risk: 'Medium', desc: 'Prime fractional assets.', color: 'text-blue-500' },
    { id: 'stocks', name: 'Global Tech', roi: '35%', risk: 'High', desc: 'High-growth equities.', color: 'text-purple-500' },
  ];

  const getAuthToken = () => localStorage.getItem('token') || localStorage.getItem('crestline_token');

  const fetchPortfolioAndBalanceData = async () => {
    const token = getAuthToken();
    try {
      const portfolioResponse = await axios.get('http://localhost:5300/invest/invest-portfolio', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      
      if (portfolioResponse.data.success) {
        setMyInvestments(portfolioResponse.data.myInvestments || []);
        setCompletedInvestments(portfolioResponse.data.completedInvestments || []);
        setTransactions(portfolioResponse.data.investmentTransactions || []);
        
        const currentLiquidPool = portfolioResponse.data.balance !== undefined 
          ? portfolioResponse.data.balance 
          : (portfolioResponse.data.investLiquidityBalance || 0);
          
        setUserAccountBalance(Number(currentLiquidPool));
        
        if (!portfolioResponse.data.myInvestments || portfolioResponse.data.myInvestments.length === 0) {
          setActiveTab("explore");
        }
      }
    } catch (error) {
      console.error("Critical Crestline sync failure parsing user liquidity matrix streams:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchPortfolioAndBalanceData();
  }, []);

  const selectedVaultData = selectedPlan && typeof selectedPlan === 'object' 
    ? selectedPlan 
    : vaults.find(v => v.id === selectedPlan);

  const currentROI = selectedVaultData?.roi ? parseFloat(selectedVaultData.roi.replace('%', '')) / 100 : 0;
  const principal = amount ? parseFloat(amount) : 0;
  const profit = principal * currentROI * (duration / 12);
  const projectedReturn = principal + profit;

  const totalInvested = myInvestments.reduce((acc, inv) => acc + (inv.principal || 0), 0);
  const totalInterest = myInvestments.reduce((acc, inv) => acc + (inv.interest || 0), 0);
  const grandTotal = totalInvested + totalInterest;

  const handleOpenFundingModal = () => {
    setActionType("fund_pool");
    setFundAmount("");
    setShowFundModal(true);
  };

  const handleOpenPoolWithdrawModal = () => {
    setActionType("withdraw_pool");
    setPoolWithdrawAmount("");
    setShowFundModal(true);
  };

  const handleForwardToPinAuth = (type, plan = null) => {
    if (type === 'fund_pool') {
      if (!fundAmount || parseFloat(fundAmount) <= 0) {
        alert("Please enter a valid amount to fund.");
        return;
      }
      setShowFundModal(false); 
    }
    if (type === 'withdraw_pool') {
      if (!poolWithdrawAmount || parseFloat(poolWithdrawAmount) <= 0) {
        alert("Please enter a valid amount to withdraw.");
        return;
      }
      if (parseFloat(poolWithdrawAmount) > userAccountBalance) {
        alert("Insolvent operations: Amount exceeds pool balances.");
        return;
      }
      setShowFundModal(false);
    }
    if (type === 'withdraw') {
      setSelectedPlan(plan);
      const targetDrawAmount = withdrawAmounts[plan._id] || "";
      const drawVal = targetDrawAmount ? parseFloat(targetDrawAmount) : (plan.principal + plan.interest);
      if (drawVal <= 0 || drawVal > (plan.principal + plan.interest)) {
        alert("Invalid withdrawal parameters.");
        return;
      }
    }
    if (type === 'terminate') {
      setSelectedPlan(plan);
    }
    setActionType(type);
    setShowPinModal(true);
  };

  const handleFinalVerify = async (pin) => {
    setIsProcessing(true);
    const token = getAuthToken(); 
    let endpoint = "";
    let payload = { transactionPin: pin };

    if (actionType === 'fund_pool') {
      endpoint = "http://localhost:5300/invest/invest-fund";
      payload = { ...payload, fundAmount: parseFloat(fundAmount) };
    } else if (actionType === 'withdraw_pool') {
      endpoint = "http://localhost:5300/invest/invest-pool-withdraw";
      payload = { ...payload, withdrawAmount: parseFloat(poolWithdrawAmount) };
    } else if (actionType === 'new_invest') {
      endpoint = "http://localhost:5300/invest/invest-commit";
      payload = {
        ...payload,
        planName: selectedVaultData?.name,
        principalAmount: principal,
        rate: selectedVaultData?.roi,
        duration: Number(duration)
      };
    } else if (actionType === 'withdraw') {
      endpoint = "http://localhost:5300/invest/invest-withdraw";
      const specificAmount = withdrawAmounts[selectedPlan?._id];
      payload = { 
        ...payload, 
        assetId: selectedPlan?._id, 
        drawAmount: specificAmount ? parseFloat(specificAmount) : null 
      };
    } else if (actionType === 'terminate') {
      endpoint = "http://localhost:5300/invest/invest-terminate";
      payload = { ...payload, assetId: selectedPlan?._id };
    }

    try {
      const response = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      if (response.data.success) {
        setShowPinModal(false);
        setSuccessMsg(response.data.message || "Ledger Updated Successfully");
        setIsSuccess(true);
        
        await fetchPortfolioAndBalanceData();

        setTimeout(() => { 
          setIsSuccess(false); 
          setSelectedPlan(null); 
          setWithdrawAmounts(prev => ({ ...prev, [selectedPlan?._id]: "" })); 
          setFundAmount("");
          setPoolWithdrawAmount("");
          setAmount("");
        }, 2000);
      }
    } catch (error) {
      alert(error.response?.data?.message || "An asset ledger sync exception occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <CrestlineNavbar>
        <div className="min-h-[90vh] flex flex-col items-center justify-center bg-black text-zinc-500 font-black tracking-widest uppercase italic text-[11px]">
          Syncing Unified Liquidity Matrix Parameters...
        </div>
      </CrestlineNavbar>
    );
  }

  return (
    <CrestlineNavbar>
      <div className="p-4 md:p-10 max-w-2xl mx-auto min-h-[90vh] flex flex-col text-left text-white bg-black">
        
        <AnimatePresence>
          {isSuccess && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-black px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl"
            >
              <CheckCircle2 size={18} />
              <span className="text-[11px] font-black uppercase tracking-widest italic">{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <button onClick={() => window.history.back()} className="group flex items-center gap-2 text-zinc-600 hover:text-white transition-colors mb-4">
              <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-emerald-600 transition-all">
                <ChevronLeft size={14} className="text-zinc-400 group-hover:text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest italic text-zinc-400">Wealth Terminal</span>
            </button>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
              Crestline<span className="text-emerald-500">Invest</span>
            </h1>
          </div>

          <div className="flex bg-zinc-900 p-1 rounded-2xl border border-white/5 overflow-x-auto">
            {['portfolio', 'explore', 'history'].map((tab) => (
              <button key={tab} onClick={() => { setActiveTab(tab); setSelectedPlan(null); }}
                className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap ${
                  activeTab === tab ? "bg-emerald-600 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab === 'portfolio' ? 'My Portfolio' : tab === 'explore' ? 'New Plans' : 'History Log'}
              </button>
            ))}
          </div>
        </div>

        {/* LIQUID BALANCES DEPLOYMENT INTERFACE CONTROLS */}
        <div className="bg-zinc-950 px-6 py-5 rounded-2xl border border-white/10 mb-6 flex flex-col sm:flex-row sm:items-center justify-between shadow-xl gap-4">
          <div className="flex items-center gap-3">
            <Wallet size={18} className="text-emerald-500" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Liquid Wallet Cash Balance</span>
              <span className="font-mono text-lg font-bold text-white tracking-tight mt-0.5">₦{userAccountBalance.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleOpenPoolWithdrawModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 border border-white/5 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md font-bold"
            >
              <ArrowDownCircle size={13} className="text-zinc-400" /> Withdraw Pool
            </button>
            <button 
              onClick={handleOpenFundingModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md font-bold"
            >
              <PlusCircle size={13} /> Fund Pool
            </button>
          </div>
        </div>

        {/* TAB 1: PORTFOLIO SCREEN */}
        {activeTab === "portfolio" && (
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-950 border border-white/10 rounded-[40px] p-8 relative overflow-hidden shadow-2xl"
            >
              <div className="relative z-10 space-y-8 text-left">
                <div className="flex justify-between items-center">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 italic">Live Portfolio Value</p>
                      <h2 className="text-5xl font-black italic tracking-tighter text-white">₦{grandTotal.toLocaleString()}</h2>
                   </div>
                   <div className="h-14 w-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                      <TrendingUp size={28} />
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                   <div>
                      <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-1">Total Invested</p>
                      <p className="text-xl font-black italic text-white">₦{totalInvested.toLocaleString()}</p>
                   </div>
                   <div>
                      <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-1">Accrued Interest</p>
                      <p className="text-xl font-black italic text-emerald-500">+₦{totalInterest.toLocaleString()}</p>
                   </div>
                </div>
              </div>
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-600/10 blur-[100px] rounded-full" />
            </motion.div>

            <div className="space-y-4">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic px-2">Live Assets ({myInvestments.length})</h3>
               {myInvestments.length === 0 ? (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center flex flex-col items-center opacity-30 grayscale italic">
                    <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mb-4"><ShieldCheck size={40} /></div>
                    <p className="text-[10px] font-black uppercase tracking-widest">No active asset allocations running</p>
                    <button onClick={() => setActiveTab('explore')} className="mt-6 text-emerald-500 font-black uppercase text-[10px] underline underline-offset-4 tracking-widest italic opacity-100 grayscale-0">Deploy New Asset Capital</button>
                 </motion.div>
               ) : (
                 myInvestments.map((plan) => (
                   <div key={plan._id} className="bg-zinc-900/40 border border-white/5 rounded-[32px] p-6 hover:border-emerald-500/30 transition-all group">
                      <div className="flex justify-between items-start mb-6">
                         <div className="flex items-center gap-4 text-left">
                            <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-500"><PieChart size={20} /></div>
                            <div>
                               <h4 className="text-sm font-black uppercase italic text-white">{plan.name}</h4>
                               <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{plan.rate} P.A • {plan.duration} Mos</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-sm font-black italic text-white">₦{((plan.principal || 0) + (plan.interest || 0)).toLocaleString()}</p>
                            <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Earning Yield</p>
                         </div>
                      </div>

                      <div className="mb-4">
                        <input 
                          type="number" 
                          placeholder="Withdrawal Target (Leave blank for full cashout)"
                          value={withdrawAmounts[plan._id] || ""}
                          onChange={(e) => {
                            setWithdrawAmounts(prev => ({
                              ...prev,
                              [plan._id]: e.target.value
                            }));
                          }}
                          className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs font-mono text-white outline-none focus:border-zinc-500 transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                         <button onClick={() => handleForwardToPinAuth('withdraw', plan)} className="py-3 bg-zinc-800 hover:bg-white hover:text-black rounded-xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 text-white font-bold">
                            <ArrowUpRight size={14} /> Emergency Draw
                         </button>
                         <button onClick={() => handleForwardToPinAuth('terminate', plan)} className="py-3 bg-red-500/5 border border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white rounded-xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 font-bold">
                            <XCircle size={14} /> Terminate Plan
                         </button>
                      </div>
                   </div>
                 ))
               )}
            </div>
          </div>
        )}

        {/* TAB 2: EXPLORE VAULTS */}
        {activeTab === "explore" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 text-left">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2 italic">Select Asset Allocation Profile</label>
              {vaults.map((v) => (
                <button key={v.id} onClick={() => { setSelectedPlan(v); setActionType('new_invest'); }}
                  className={`p-6 rounded-[28px] border text-left transition-all flex items-center justify-between ${
                    selectedVaultData?.id === v.id ? 'bg-emerald-500/10 border-emerald-500 shadow-xl' : 'bg-zinc-900 border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`p-3 bg-black/40 rounded-2xl ${selectedVaultData?.id === v.id ? 'text-emerald-500' : 'text-zinc-500'}`}><Briefcase size={22} /></div>
                    <div>
                      <h4 className="text-sm font-black italic uppercase tracking-tight text-white">{v.name}</h4>
                      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{v.risk} Risk Bracket</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-black italic ${v.color}`}>{v.roi}</p>
                    <p className="text-[8px] font-black text-zinc-600 uppercase italic">ROI</p>
                  </div>
                </button>
              ))}
            </div>

            <AnimatePresence>
              {selectedPlan && actionType === 'new_invest' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-6 pt-6 border-t border-white/5 overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Capital Injection (₦)</label>
                      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="₦ 0.00"
                        className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-5 text-xl font-black italic text-white outline-none focus:border-emerald-500" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Lock-in Vault Period</label>
                      <div className="relative">
                        <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}
                          className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-5 text-sm font-bold text-white outline-none appearance-none cursor-pointer">
                          <option value={6}>6 Months Lock</option>
                          <option value={12}>12 Months Lock</option>
                          <option value={24}>24 Months Lock</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 flex justify-between items-center relative overflow-hidden">
                    <div className="relative z-10">
                      <span className="text-[9px] font-black uppercase text-zinc-500 block mb-1">Projected Return Value</span>
                      <h3 className="text-3xl font-black italic text-white">₦{projectedReturn.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h3>
                    </div>
                    <div className="h-14 w-14 bg-emerald-500 rounded-full flex items-center justify-center text-black shadow-2xl"><Calculator size={24} /></div>
                  </div>

                  <button 
                    type="button"
                    onClick={() => handleForwardToPinAuth('new_invest')} 
                    disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > userAccountBalance}
                    className="w-full py-6 bg-white text-black rounded-[28px] font-black italic uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-20 font-bold"
                  >
                    {parseFloat(amount) > userAccountBalance ? "Insolvent Liquidity Balance" : "Commit Capital"} <ArrowRight size={20} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* TAB 3: HISTORY LOG */}
        {activeTab === "history" && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic px-2">Fully Closed Positions</h3>
              {completedInvestments.length === 0 ? (
                <div className="p-12 border border-dashed border-white/5 rounded-[32px] text-center text-zinc-600 text-xs italic font-bold uppercase tracking-wider">No closed positions.</div>
              ) : (
                completedInvestments.map((plan, i) => (
                  <div key={i} className="bg-zinc-950 border border-white/5 rounded-3xl p-5 flex justify-between items-center opacity-70">
                    <div>
                      <h4 className="text-xs font-black uppercase italic text-white">{plan.name}</h4>
                      <p className="text-[8px] text-zinc-500 font-bold uppercase">Cap: ₦{plan.principal?.toLocaleString()}</p>
                    </div>
                    <span className="px-2 py-1 text-[7px] font-black uppercase tracking-wider rounded-md bg-zinc-900 text-zinc-400">{plan.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── UNIFIED BALANCING DYNAMIC MODAL (HANDLES BOTH CREDIT AND DEBIT INTERFACES) ── */}
        <AnimatePresence>
          {showFundModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-zinc-950 border border-white/10 w-full max-w-sm rounded-[32px] p-6 text-left"
              >
                <div className={`flex items-center gap-3 mb-4 ${actionType === 'fund_pool' ? 'text-emerald-500' : 'text-zinc-400'}`}>
                  <Wallet size={20} />
                  <h3 className="text-md font-black uppercase italic tracking-tight text-white">
                    {actionType === 'fund_pool' ? "Fund Liquidity Pool" : "Withdraw From Pool"}
                  </h3>
                </div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide mb-4">
                  {actionType === 'fund_pool' 
                    ? "Specify the funding capitalization value below:" 
                    : "Specify how much to transfer back to your main account balance:"}
                </p>
                <input 
                  type="number" 
                  placeholder="₦ Enter Amount" 
                  value={actionType === 'fund_pool' ? fundAmount : poolWithdrawAmount}
                  onChange={(e) => actionType === 'fund_pool' ? setFundAmount(e.target.value) : setPoolWithdrawAmount(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl p-4 text-lg font-mono text-white outline-none focus:border-emerald-500 mb-6"
                />
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setShowFundModal(false)} className="py-3 bg-zinc-900 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-800 font-bold">Cancel</button>
                  <button onClick={() => handleForwardToPinAuth(actionType)} className="py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 hover:text-white transition-all font-bold">Confirm</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* GLOBAL TRANSACTION PIN AUTH VALIDATOR SCREEN */}
        <CrestlineTransactionPinModal 
          isOpen={showPinModal}
          onClose={() => setShowPinModal(false)}
          onConfirm={handleFinalVerify}
          isProcessing={isProcessing}
          title={
            actionType === 'fund_pool' 
              ? "Verify Liquidity Funding" 
              : actionType === 'withdraw_pool'
              ? "Verify Pool Extraction"
              : actionType === 'new_invest' 
              ? "Confirm Investment Asset" 
              : "Verify Payout Access"
          }
          subtitle="Security Clearance Gateway"
          confirmLabel="Execute Order"
          summaryItems={
            actionType === 'fund_pool' ? [
              { label: "Target Route", value: "Crestline Liquidity Pool Balance Injection" },
              { label: "Funding Injection", value: fundAmount ? `₦${parseFloat(fundAmount).toLocaleString()}` : "₦0", highlight: true }
            ] : actionType === 'withdraw_pool' ? [
              { label: "Target Route", value: "Extract to Main Checking Balance" },
              { label: "Extraction Payout", value: poolWithdrawAmount ? `₦${parseFloat(poolWithdrawAmount).toLocaleString()}` : "₦0", highlight: true }
            ] : actionType === 'new_invest' ? [
              { label: "Asset Selected", value: selectedVaultData?.name || "N/A" },
              { label: "Target Commit", value: `₦${principal.toLocaleString()}` }
            ] : [
              { label: "Target Asset", value: selectedPlan?.name || "N/A" },
              { label: "Draw Amount", value: withdrawAmounts[selectedPlan?._id] ? `₦${parseFloat(withdrawAmounts[selectedPlan?._id]).toLocaleString()}` : "Full Cashout" }
            ]
          }
        />
      </div>
    </CrestlineNavbar>
  );
};

export default CrestlineInvestV2;