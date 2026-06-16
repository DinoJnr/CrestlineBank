import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import CrestlineStaffLayout from './CrestlineStaffLayout';
import {
  Search, RefreshCw, ChevronRight, ChevronDown, UserPlus,
  Camera, ShieldCheck, CheckCircle2, XCircle, User, Briefcase,
  Building, AlertCircle, Activity, ArrowUpRight, Wallet,
  TrendingUp, Landmark, Lock, Unlock, Edit3, Eye, EyeOff,
  FileText, Bell, Send, RotateCcw, CreditCard, Slash,
  AlertTriangle, Flag, Download, Upload, Phone, Mail,
  MapPin, Clock, Hash, Shield, Zap, Settings, ChevronLeft,
  MoreVertical, CheckSquare, XSquare, Printer, BookOpen,
  UserCheck, Ban, ArrowLeftRight, DollarSign, Receipt,
  Clipboard, Globe, Star, Info, Plus, Minus, BarChart2
} from 'lucide-react';

// ─── AXIOS INSTANCE ─────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: 'http://localhost:5300/staff',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('staffcrestline_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) =>
  `₦${new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2 }).format(n ?? 0)}`;
const fmtShort = (n) =>
  n >= 1000000
    ? `₦${(n / 1000000).toFixed(2)}M`
    : n >= 1000
    ? `₦${(n / 1000).toFixed(0)}K`
    : `₦${n}`;

const isOverdue = (nextDue) => {
  if (!nextDue) return false;
  return new Date(nextDue) < new Date();
};

const inputCls =
  'w-full px-4 py-3 bg-slate-50 rounded-xl text-xs font-semibold text-slate-900 outline-none border-2 border-transparent focus:border-teal-500 transition-all';
const inputClsDark =
  'w-full px-4 py-3 bg-white/10 rounded-xl text-xs font-semibold text-white placeholder-white/30 outline-none border-2 border-transparent focus:border-teal-400 transition-all';

const Badge = ({ children, color = 'teal' }) => {
  const map = {
    teal: 'bg-teal-100 text-teal-700',
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    orange: 'bg-orange-100 text-orange-700',
    purple: 'bg-purple-100 text-purple-700',
    slate: 'bg-slate-100 text-slate-600',
    yellow: 'bg-yellow-100 text-yellow-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${map[color]}`}>
      {children}
    </span>
  );
};

const Field = ({ label, children, dark }) => (
  <div className="space-y-1.5">
    <label className={`block text-[9px] font-black uppercase tracking-widest ${dark ? 'text-teal-400' : 'text-slate-400'}`}>
      {label}
    </label>
    {children}
  </div>
);

const InfoRow = ({ label, value, mono, highlight }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{label}</span>
    <span className={`text-[11px] font-bold ${mono ? 'font-mono' : ''} ${highlight ? 'text-teal-600' : 'text-slate-800'}`}>
      {value ?? '—'}
    </span>
  </div>
);

const SectionHead = ({ icon, title, sub }) => (
  <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
    <div className="p-2 bg-teal-50 rounded-xl text-teal-600">{icon}</div>
    <div>
      <h4 className="text-base font-black text-slate-900">{title}</h4>
      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{sub}</p>
    </div>
  </div>
);

// ─── NORMALISE DB USER → UI shape ─────────────────────────────────────────
// FIX 1: KYC — always build a complete, merged kyc object from BOTH
//   u.kyc (the stored subdoc) and u.kycMetadata (legacy fields).
//   Previously, `u.kyc ?? { ... }` short-circuited whenever u.kyc existed
//   (even with all-default values), so the real DB status was never used.
const normaliseUser = (u) => {
  // ── BVN / NIN: prefer top-level, fall back to kycMetadata ──
  const bvn = u.bvn ?? u.kycMetadata?.bvn ?? '—';
  const nin = u.nin ?? u.kycMetadata?.nin ?? '—';

  // ── KYC: FIXED — merge stored kyc doc with kycMetadata fallbacks ──
  // We read every field explicitly from u.kyc first, then fall back to
  // what can be derived from kycMetadata + currentComplianceTier.
  const storedKyc = u.kyc ?? {};
  const kyc = {
    status:
      storedKyc.status && storedKyc.status !== 'Pending'
        ? storedKyc.status
        : u.kycMetadata?.verifiedAt
        ? 'Verified'
        : 'Pending',
    level:
      storedKyc.level && storedKyc.level !== 'Basic KYC'
        ? storedKyc.level
        : u.currentComplianceTier === 3
        ? 'Enhanced KYC'
        : u.currentComplianceTier === 2
        ? 'Intermediate KYC'
        : 'Basic KYC',
    completedDate: storedKyc.completedDate ?? u.kycMetadata?.verifiedAt ?? null,
    verifiedBy: storedKyc.verifiedBy ?? null,
    // FIXED: bvnLinked — DB default of `false` made the old `!== undefined`
    // check always true, so it never fell back to checking the actual bvn value.
    bvnLinked: storedKyc.bvnLinked || !!(u.bvn ?? u.kycMetadata?.bvn),
    // FIXED: same issue for ninLinked
    ninLinked: storedKyc.ninLinked || !!(u.nin ?? u.kycMetadata?.nin),
    // faceMatch only reflects an explicit DB value — no fallback source available
    faceMatch: storedKyc.faceMatch ?? false,
    documents:
      storedKyc.documents && storedKyc.documents.length > 0
        ? storedKyc.documents
        : u.kycMetadata?.utilityBill
        ? [
            {
              type: 'Utility Bill',
              status: 'Verified',
              uploaded: u.kycMetadata?.verifiedAt
                ? new Date(u.kycMetadata.verifiedAt).toISOString().split('T')[0]
                : '—',
              expiryDate: null,
            },
          ]
        : [],
  };
  // ── TIER: driven by currentComplianceTier ──
  const tierNum = u.currentComplianceTier ?? 1;
  const tierLabel =
    tierNum === 3 ? 'Tier 3 (Black)' : tierNum === 2 ? 'Tier 2 (Gold)' : 'Tier 1 (Silver)';

  // ── LOAN: map activeLoan → console-expected shape ──
  const loan =
    u.activeLoan?.id
      ? {
          loanRef: u.activeLoan.id,
          amount: u.activeLoan.principal ?? 0,
          amountPaid: (u.activeLoan.principal ?? 0) - (u.activeLoan.balance ?? 0),
          balance: u.activeLoan.balance ?? 0,
          monthlyPayment: u.activeLoan.installment ?? 0,
          nextDue: u.activeLoan.nextDue ?? null,
          textTenure: u.activeLoan.textTenure ?? null,
          tenure: parseInt(u.activeLoan.textTenure) || 12,
          monthsLeft:
            u.activeLoan.installment > 0
              ? Math.ceil((u.activeLoan.balance ?? 0) / u.activeLoan.installment)
              : 0,
          type: 'Term Loan',
          interestRate: u.interestRate ?? 0,
          overdue: isOverdue(u.activeLoan.nextDue),
        }
      : null;

  return {
    _id: u._id,
    name: u.fullName,
    account: u.accountNumber,
    email: u.email,
    phone: u.phone,
    altPhone: u.altPhone ?? null,
    dob: u.dob ? u.dob.split('T')[0] : null,
    gender: u.gender === 'm' ? 'Male' : u.gender === 'f' ? 'Female' : 'Other',
    nationality: 'Nigerian',
    address: u.address,
    state: u.state ?? null,
    lga: u.lga ?? null,
    occupation: u.occupation ?? null,
    employer: u.employer ?? null,
    employerAddress: u.employerAddress ?? null,
    monthlyIncome: u.monthlyIncome ?? 0,
    pep: u.pep ?? false,
    accountType: u.accountType,
    currency: u.currency ?? 'NGN',
    status: u.status === 'active' ? 'Active' : u.status === 'frozen' ? 'Frozen' : u.status,
    balance: u.balance ?? 0,
    ledgerBalance: u.balance ?? 0,
    availableBalance: u.balance ?? 0,
    interestRate: u.interestRate ?? 0,
    interestEarned: u.interestEarned ?? 0,
    branch: u.branch ?? 'Main Branch',
    openingDate: u.createdAt ? u.createdAt.split('T')[0] : null,
    bvn,
    nin,
    cardStatus: u.cardStatus ?? 'none',
    cards: u.card?.cardNumber
      ? [
          {
            id: 'c1',
            type:
              u.card.tier === 'black'
                ? 'Elite Black Card'
                : u.card.tier === 'gold'
                ? 'Gold Card'
                : 'Silver Card',
            number: u.card.cardNumber,
            status: u.cardStatus === 'active' ? 'Active' : 'Blocked',
            expiry: u.card.expiryDate ?? '—',
            issued: u.card.issuedAt ? u.card.issuedAt.split('T')[0] : '—',
            dailyLimit: 150000,
            posLimit: 500000,
            tier: u.card.tier,
          },
        ]
      : [],
    tier: `Tier ${tierNum}`,
    tierLabel,
    frozenReason: u.frozenReason ?? null,
    pndType: u.pndType ?? null,
    watchlist: u.watchlist ?? false,
    amlFlag: u.amlFlag ?? false,
    cbnBlacklist: u.cbnBlacklist ?? false,
    dormant: u.dormant ?? false,
    unclaimed: u.unclaimed ?? false,
    crsFlag: u.crsFlag ?? false,
    fatcaFlag: u.fatcaFlag ?? false,
    failedLogins: u.failedLogins ?? 0,
    lastLogin: u.lastLogin ?? null,
    loginDevice: u.loginDevice ?? null,
    loginIP: u.loginIP ?? null,
    lastTransaction: u.lastTransaction ?? null,
    smsAlert: u.smsAlert ?? true,
    emailAlert: u.emailAlert ?? true,
    pushAlert: u.pushAlert ?? true,
    transactionLimit: u.transactionLimit ?? {
      daily: 500000,
      transfer: 200000,
      pos: 200000,
      atm: 100000,
      ussd: 100000,
      nfc: 20000,
    },
    // FIXED KYC object (always fully populated from DB)
    kyc,
    transactions: [],
    activityLog: [],
    inquiries: [],
    mandates: u.mandates ?? [],
    signatories: u.signatories ?? [
      { name: u.fullName, class: 'Sole Signatory', bvn, status: 'Active' },
    ],
    loan,
    referral: u.referral ?? { code: null, referredBy: null, staffCode: null },
  };
};

// ─── ACCOUNT LOOKUP ────────────────────────────────────────────────────────
const AccountLookup = ({ onSelectUser }) => {
  const [accountNumber, setAccountNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  const handleFetch = async (e) => {
    e.preventDefault();
    if (accountNumber.length !== 10) return;
    setIsProcessing(true);
    setUserData(null);
    setError(null);
    try {
      const { data } = await api.get(`/accounts/${accountNumber}`);
      setUserData(normaliseUser(data.user ?? data));
    } catch (err) {
      if (err.response?.status === 404) {
        setUserData({ notFound: true, account: accountNumber });
      } else {
        setError(err.response?.data?.message ?? 'Server error — please try again');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
          Account <span className="text-teal-500">Registry</span>
        </h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
          Enter 10-Digit NUBAN · CBN Compliant
        </p>
      </div>

      <form onSubmit={handleFetch} className="relative max-w-xl mx-auto">
        <input
          type="text"
          value={accountNumber}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '');
            if (v.length <= 10) setAccountNumber(v);
          }}
          placeholder="0000000000"
          className="w-full pl-8 pr-44 py-6 bg-white border-2 border-slate-200 rounded-2xl text-2xl font-mono font-black tracking-[0.3em] text-slate-900 outline-none focus:border-teal-500 transition-all shadow-lg"
        />
        <button
          disabled={accountNumber.length < 10 || isProcessing}
          className={`absolute right-2 top-2 bottom-2 px-8 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${
            accountNumber.length === 10
              ? 'bg-teal-600 text-white hover:bg-teal-700'
              : 'bg-slate-100 text-slate-400'
          }`}
        >
          {isProcessing ? <RefreshCw className="animate-spin" size={15} /> : <Search size={15} />}
          {accountNumber.length === 10 ? 'Fetch' : `${accountNumber.length}/10`}
        </button>
      </form>

      {error && (
        <div className="max-w-xl mx-auto text-center p-4 bg-red-50 rounded-2xl border border-red-100">
          <p className="text-[11px] font-black text-red-600 uppercase tracking-widest">{error}</p>
        </div>
      )}

      {userData && !userData.notFound && (
        <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4">
          <button
            onClick={() => onSelectUser(userData)}
            className="w-full group bg-white border-2 border-slate-100 rounded-[28px] shadow-xl hover:border-teal-400 transition-all overflow-hidden text-left"
          >
            <div className="flex items-center gap-5 p-7">
              <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black">
                {userData.name[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge color={userData.status === 'Active' ? 'green' : 'red'}>{userData.status}</Badge>
                  <Badge color="purple">{userData.tier}</Badge>
                  {userData.pep && <Badge color="orange">⚠ PEP</Badge>}
                  {userData.amlFlag && <Badge color="red">🚨 AML</Badge>}
                  {userData.loan?.overdue && <Badge color="red">⚠ LOAN OVERDUE</Badge>}
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{userData.name}</h3>
                <p className="text-[10px] font-mono font-bold text-slate-400 tracking-widest mt-0.5">
                  {userData.account} · {userData.accountType} · {userData.branch}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Ledger Balance</p>
                <p className="text-xl font-black text-slate-900">{fmt(userData.balance)}</p>
              </div>
              <div className="bg-teal-600 p-3 rounded-xl text-white group-hover:translate-x-1 transition-transform">
                <ChevronRight size={20} />
              </div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100">
              <div className="p-4 text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">KYC Level</p>
                <p className="text-[11px] font-black text-slate-700">{userData.kyc.level}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Active Loan</p>
                <p className={`text-[11px] font-black ${userData.loan ? (userData.loan.overdue ? 'text-red-600' : 'text-orange-600') : 'text-slate-300'}`}>
                  {userData.loan ? fmt(userData.loan.balance) : '₦0.00'}
                </p>
              </div>
              <div className="p-4 text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Cards</p>
                <p className="text-[11px] font-black text-slate-700">
                  {userData.cards.length} Card{userData.cards.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="bg-teal-50 py-2.5 text-[9px] font-black uppercase tracking-widest text-teal-600 text-center border-t border-teal-100">
              Open Full Management Console →
            </div>
          </button>
        </div>
      )}

      {userData?.notFound && (
        <div className="max-w-xl mx-auto text-center p-8 bg-red-50 rounded-2xl border border-red-100">
          <XCircle size={24} className="text-red-400 mx-auto mb-2" />
          <p className="text-[11px] font-black text-red-600 uppercase tracking-widest">
            No Account Found for {userData.account}
          </p>
          <p className="text-[10px] text-red-400 font-bold mt-1">Verify the NUBAN and try again</p>
        </div>
      )}
    </div>
  );
};

// ─── ENROLLMENT ─────────────────────────────────────────────────────────────
const EnrollUser = () => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [enrollError, setEnrollError] = useState(null);
  const [data, setData] = useState({
    accountType: 'personal', fullName: '', email: '', dob: '', gender: '',
    password: '', confirmPassword: '', bvn: '', nin: '', phone: '',
    altPhone: '', address: '', state: '', lga: '', occupation: '',
    employer: '', monthlyIncome: '', pep: false,
  });
  const [pv, setPv] = useState({ length: false, upper: false, match: false });

  useEffect(() => {
    setPv({
      length: data.password.length >= 8,
      upper: /[A-Z]/.test(data.password) && /[a-z]/.test(data.password),
      match: data.password === data.confirmPassword && data.password.length > 0,
    });
  }, [data.password, data.confirmPassword]);

  const upd = (k, v) => setData((p) => ({ ...p, [k]: v }));
  const numOnly = (v, lim, field) => {
    const c = v.replace(/\D/g, '');
    if (c.length <= lim) upd(field, c);
  };
  const isAdult = (d) => {
    if (!d) return false;
    const t = new Date(), b = new Date(d);
    let a = t.getFullYear() - b.getFullYear();
    if (t.getMonth() - b.getMonth() < 0 || (t.getMonth() - b.getMonth() === 0 && t.getDate() < b.getDate())) a--;
    return a >= 18;
  };

  const genderEnum = { Male: 'm', Female: 'f', Other: 'o' };

  const handleEnroll = async () => {
    setSubmitting(true);
    setEnrollError(null);
    try {
      const payload = {
        fullName: data.fullName, email: data.email, phone: data.phone,
        address: data.address, dob: data.dob, gender: genderEnum[data.gender] ?? 'o',
        accountType: data.accountType, password: data.password, bvn: data.bvn,
        nin: data.nin, altPhone: data.altPhone, state: data.state,
        occupation: data.occupation, employer: data.employer,
        monthlyIncome: Number(data.monthlyIncome), pep: data.pep,
      };
      const { data: res } = await api.post('/accounts', payload);
      setSuccessMsg(`Account created! Account Number: ${res.user?.accountNumber ?? res.accountNumber}`);
      setStep(1);
      setData({
        accountType: 'personal', fullName: '', email: '', dob: '', gender: '',
        password: '', confirmPassword: '', bvn: '', nin: '', phone: '',
        altPhone: '', address: '', state: '', lga: '', occupation: '',
        employer: '', monthlyIncome: '', pep: false,
      });
    } catch (err) {
      setEnrollError(err.response?.data?.message ?? 'Enrollment failed — check inputs and try again');
    } finally {
      setSubmitting(false);
    }
  };

  const STEPS = ['Account Type', 'Personal Info', 'Identity Vault', 'Employment', 'Security'];

  return (
    <div className="space-y-8">
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-[11px] font-black text-emerald-700 flex items-center gap-2">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}
      {enrollError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-[11px] font-black text-red-700 flex items-center gap-2">
          <XCircle size={16} /> {enrollError}
        </div>
      )}

      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <button onClick={() => i + 1 < step && setStep(i + 1)} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black transition-all ${step === i + 1 ? 'bg-teal-600 text-white' : step > i + 1 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {step > i + 1 ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest hidden md:block ${step === i + 1 ? 'text-teal-600' : 'text-slate-400'}`}>{s}</span>
            </button>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${step > i + 1 ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white rounded-[28px] p-8 border border-slate-200 shadow-sm">
        {step === 1 && (
          <div className="space-y-6">
            <SectionHead icon={<Briefcase size={16} />} title="Account Type Selection" sub="Select the customer category for account provisioning" />
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'personal', icon: <User size={20} />, label: 'Personal', sub: 'Individual savings/current' },
                { id: 'business', icon: <Briefcase size={20} />, label: 'Business', sub: 'SME / enterprise' },
                { id: 'corporate', icon: <Building size={20} />, label: 'Corporate', sub: 'Large org / govt' },
              ].map((t) => (
                <button key={t.id} onClick={() => upd('accountType', t.id)} className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${data.accountType === t.id ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className={`p-3 rounded-xl ${data.accountType === t.id ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{t.icon}</div>
                  <div className="text-center">
                    <p className="text-[11px] font-black uppercase tracking-wider">{t.label}</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">{t.sub}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Opening Branch">
                <select className={inputCls}>
                  <option>Lagos Main</option><option>Abuja Central</option>
                  <option>Port Harcourt</option><option>Kano North</option>
                </select>
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <SectionHead icon={<User size={16} />} title="Personal Information" sub="Must match BVN records — CBN KYC Policy 2023" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Legal Full Name (as on NIN/BVN)">
                <input className={inputCls} placeholder="SURNAME FIRSTNAME MIDDLENAME" value={data.fullName} onChange={(e) => upd('fullName', e.target.value)} />
              </Field>
              <Field label="Email Address">
                <input className={inputCls} type="email" placeholder="customer@email.com" value={data.email} onChange={(e) => upd('email', e.target.value)} />
              </Field>
              <Field label="Date of Birth (18+ only)">
                <input className={`${inputCls} ${data.dob && !isAdult(data.dob) ? 'border-red-400' : ''}`} type="date" value={data.dob} onChange={(e) => upd('dob', e.target.value)} />
              </Field>
              <Field label="Gender">
                <select className={inputCls} value={data.gender} onChange={(e) => upd('gender', e.target.value)}>
                  <option value="">Select...</option><option value="Male">Male</option>
                  <option value="Female">Female</option><option value="Other">Other</option>
                </select>
              </Field>
              <Field label="Primary Phone (11 digits)">
                <input className={inputCls} value={data.phone} onChange={(e) => numOnly(e.target.value, 11, 'phone')} placeholder="08012345678" />
              </Field>
              <Field label="Alternate Phone (optional)">
                <input className={inputCls} value={data.altPhone} onChange={(e) => numOnly(e.target.value, 11, 'altPhone')} placeholder="08012345678" />
              </Field>
              <Field label="Residential Address">
                <input className={inputCls} value={data.address} onChange={(e) => upd('address', e.target.value)} placeholder="No. 12, Street Name, Area" />
              </Field>
              <Field label="State of Residence">
                <select className={inputCls} value={data.state} onChange={(e) => upd('state', e.target.value)}>
                  <option value="">Select...</option><option>Lagos</option>
                  <option>FCT (Abuja)</option><option>Rivers</option>
                  <option>Kano</option><option>Ogun</option>
                </select>
              </Field>
              <Field label="Nationality">
                <select className={inputCls}><option>Nigerian</option><option>Non-Nigerian (Expatriate)</option></select>
              </Field>
              <Field label="Is Customer a PEP?">
                <div className="flex gap-3 pt-1">
                  <button onClick={() => upd('pep', true)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${data.pep ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-400'}`}>Yes — PEP</button>
                  <button onClick={() => upd('pep', false)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${!data.pep ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-400'}`}>No</button>
                </div>
              </Field>
            </div>
            {data.pep && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-[10px] font-bold text-orange-700 flex gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" /> Enhanced Due Diligence (EDD) required.
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <SectionHead icon={<Shield size={16} />} title="Identity Verification" sub="BVN + NIN linking mandatory per CBN Circular" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="BVN (11 digits)">
                <input className={inputCls} value={data.bvn} onChange={(e) => numOnly(e.target.value, 11, 'bvn')} placeholder="22234567890" />
              </Field>
              <Field label="NIN (11 digits)">
                <input className={inputCls} value={data.nin} onChange={(e) => numOnly(e.target.value, 11, 'nin')} placeholder="12345678901" />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'BVN Verification', ok: data.bvn.length === 11 },
                { label: 'NIN Verification', ok: data.nin.length === 11 },
                { label: 'Face Match', ok: false },
              ].map((i) => (
                <div key={i.label} className={`flex items-center gap-3 p-4 rounded-2xl border-2 ${i.ok ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200'}`}>
                  {i.ok ? <CheckCircle2 size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-slate-300" />}
                  <span className="text-[10px] font-black text-slate-700">{i.label}</span>
                </div>
              ))}
            </div>
            <div className="bg-teal-950 rounded-2xl p-6 flex flex-col items-center gap-4">
              <div className="w-32 h-32 border-2 border-dashed border-teal-500 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-teal-300 transition-all">
                <Camera size={28} className="text-teal-400" />
                <span className="text-[8px] font-black uppercase text-teal-400 tracking-widest text-center px-2">Capture Live Face ID</span>
              </div>
              <p className="text-[8px] text-teal-400/60 font-bold uppercase tracking-widest">NIN Face Match · Liveness Check Required</p>
            </div>
            <div className="space-y-3">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Supporting Documents</p>
              {['Government-issued Photo ID', 'Proof of Address (Utility/Bank Statement — 3 months)', 'Passport Photograph (white background)'].map((d) => (
                <div key={d} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <FileText size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-700">{d}</span>
                  </div>
                  <button className="text-[9px] font-black text-teal-600 uppercase flex items-center gap-1"><Upload size={11} /> Upload</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <SectionHead icon={<Briefcase size={16} />} title="Employment & Income" sub="Required for tier classification and credit scoring" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Occupation / Job Title">
                <input className={inputCls} value={data.occupation} onChange={(e) => upd('occupation', e.target.value)} placeholder="e.g. Software Engineer" />
              </Field>
              <Field label="Employer / Business Name">
                <input className={inputCls} value={data.employer} onChange={(e) => upd('employer', e.target.value)} placeholder="Company name" />
              </Field>
              <Field label="Monthly Income (NGN)">
                <input className={inputCls} type="number" value={data.monthlyIncome} onChange={(e) => upd('monthlyIncome', e.target.value)} placeholder="0.00" />
              </Field>
              <Field label="Source of Funds">
                <select className={inputCls}><option>Salary / Employment</option><option>Business Income</option><option>Investment Returns</option><option>Pension</option></select>
              </Field>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-[10px] font-bold text-blue-700 flex gap-2">
              <Info size={14} className="shrink-0 mt-0.5" /> Tier classification is automatically assigned based on BVN data, monthly income, and KYC level.
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <SectionHead icon={<Lock size={16} />} title="Security Provisioning" sub="Staff-set temporary credentials — customer must change on first login" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Internet Banking Password">
                <input className={inputCls} type="password" value={data.password} onChange={(e) => upd('password', e.target.value)} />
              </Field>
              <Field label="Confirm Password">
                <input className={inputCls} type="password" value={data.confirmPassword} onChange={(e) => upd('confirmPassword', e.target.value)} />
              </Field>
            </div>
            <div className="flex gap-4">
              {[{ ok: pv.length, t: '8+ Characters' }, { ok: pv.upper, t: 'Case Mix' }, { ok: pv.match, t: 'Passwords Match' }].map((v) => (
                <div key={v.t} className={`flex items-center gap-1.5 text-[9px] font-black uppercase ${v.ok ? 'text-emerald-600' : 'text-slate-300'}`}>
                  {v.ok ? <CheckCircle2 size={12} /> : <XCircle size={12} />}{v.t}
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Alert Channels</p>
              <div className="grid grid-cols-3 gap-3">
                {['SMS Alerts', 'Email Alerts', 'Push Notifications'].map((a) => (
                  <label key={a} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-teal-50 transition-all">
                    <input type="checkbox" defaultChecked className="accent-teal-600" />
                    <span className="text-[10px] font-bold text-slate-700">{a}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button onClick={() => step > 1 && setStep((s) => s - 1)} className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${step > 1 ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'opacity-0 pointer-events-none'}`}>
          <ChevronLeft size={14} />Back
        </button>
        {step < 5 ? (
          <button onClick={() => setStep((s) => s + 1)} className="px-8 py-3 bg-teal-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-700 transition-all flex items-center gap-2">
            Continue<ChevronRight size={14} />
          </button>
        ) : (
          <button onClick={handleEnroll} disabled={submitting || !pv.match} className="px-8 py-3 bg-teal-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {submitting ? <RefreshCw size={12} className="animate-spin" /> : null}
            Activate Account Node →
          </button>
        )}
      </div>
    </div>
  );
};

// ─── MANAGEMENT CONSOLE ───────────────────────────────────────────────────
const ManagementConsole = ({ user: initialUser, onBack }) => {
  const [customer, setCustomer] = useState({ ...initialUser });
  const [activeSection, setActiveSection] = useState('overview');
  const [modal, setModal] = useState({ open: false, type: null });
  const [toast, setToast] = useState(null);
  const [txnFilter, setTxnFilter] = useState('All');
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editBuf, setEditBuf] = useState({});
  const [loadingSection, setLoadingSection] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };
  const openModal = (type, extra = {}) => setModal({ open: true, type, ...extra });
  const closeModal = () => setModal({ open: false, type: null });

  useEffect(() => {
    if (activeSection === 'transactions' && customer.transactions.length === 0) loadTransactions();
    if (activeSection === 'activity' && customer.activityLog.length === 0) loadActivityLog();
  }, [activeSection]);

  const loadTransactions = async () => {
    setLoadingSection(true);
    try {
      const { data } = await api.get(`/accounts/${customer.account}/transactions`);
      const txns = (data.transactions ?? data).map((t) => ({
        id: t._id,
        date: t.createdAt ? t.createdAt.replace('T', ' ').slice(0, 16) : '—',
        type: t.amount > 0 ? 'Credit' : 'Debit',
        description: t.description ?? '—',
        amount: Math.abs(Number(t.amount)),
        balance: t.balanceAfter ?? 0,
        channel: t.channel ?? '—',
        ref: t.reference ?? t._id,
        narration: t.narration ?? '',
        sessionId: t.sessionId ?? '—',
        flagged: t.flagged ?? false,
      }));
      setCustomer((p) => ({ ...p, transactions: txns }));
    } catch (err) {
      showToast('Failed to load transactions', 'error');
    } finally {
      setLoadingSection(false);
    }
  };

  const loadActivityLog = async () => {
    setLoadingSection(true);
    try {
      const { data } = await api.get(`/accounts/${customer._id}/activities`);
      const logs = (data.activities ?? data).map((a) => ({
        date: a.createdAt ? a.createdAt.replace('T', ' ').slice(0, 16) : '—',
        event: a.action,
        detail: a.details ?? '—',
        ip: a.ipAddress ?? '—',
        staff: a.staff ?? null,
      }));
      setCustomer((p) => ({ ...p, activityLog: logs }));
    } catch (err) {
      showToast('Failed to load audit trail', 'error');
    } finally {
      setLoadingSection(false);
    }
  };

  const addAuditEntry = async (action, details) => {
    const entry = {
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      event: action, detail: details, ip: '—', staff: 'Staff',
    };
    setCustomer((p) => ({ ...p, activityLog: [entry, ...p.activityLog] }));
    try {
      await api.post('/activities', { userId: customer._id, action, details });
    } catch (_) {}
  };

  const execAction = async (type, payload = {}) => {
    try {
      switch (type) {
        case 'freeze':
          await api.patch(`/accounts/${customer.account}/status`, { status: 'frozen', frozenReason: payload.reason });
          setCustomer((p) => ({ ...p, status: 'Frozen', frozenReason: payload.reason }));
          showToast('Account frozen — all debits suspended', 'warning');
          break;
        case 'unfreeze':
          await api.patch(`/accounts/${customer.account}/status`, { status: 'active' });
          setCustomer((p) => ({ ...p, status: 'Active', frozenReason: null }));
          showToast('Account restored to Active');
          break;
        case 'pnd_debit':
          await api.patch(`/accounts/${customer.account}/status`, { pndType: 'Debit' });
          setCustomer((p) => ({ ...p, pndType: 'Debit' }));
          showToast('Post-No-Debit instruction applied');
          break;
        case 'pnd_full':
          await api.patch(`/accounts/${customer.account}/status`, { pndType: 'Full' });
          setCustomer((p) => ({ ...p, pndType: 'Full' }));
          showToast('Full PND instruction applied — CBN directive');
          break;
        case 'remove_pnd':
          await api.patch(`/accounts/${customer.account}/status`, { pndType: null });
          setCustomer((p) => ({ ...p, pndType: null }));
          showToast('PND restriction lifted');
          break;
        case 'flag_aml':
          await api.patch(`/accounts/${customer.account}/status`, { amlFlag: true });
          setCustomer((p) => ({ ...p, amlFlag: true }));
          showToast('AML flag raised — STR filed', 'warning');
          break;
        case 'watchlist':
          await api.patch(`/accounts/${customer.account}/status`, { watchlist: true });
          setCustomer((p) => ({ ...p, watchlist: true }));
          showToast('Account added to watchlist');
          break;
        case 'credit':
          await api.post(`/accounts/${customer.account}/credit`, {
            amount: Number(payload.amount),
            description: payload.narration ?? 'Manual Credit',
            channel: payload.channel ?? 'Manual Credit',
          });
          setCustomer((p) => ({ ...p, balance: p.balance + Number(payload.amount) }));
          showToast(`${fmt(payload.amount)} credited successfully`);
          break;
        case 'debit':
          await api.post(`/accounts/${customer.account}/debit`, {
            amount: Number(payload.amount),
            description: payload.narration ?? 'Manual Debit',
            channel: payload.channel ?? 'Manual Debit',
          });
          setCustomer((p) => ({ ...p, balance: p.balance - Number(payload.amount) }));
          showToast(`${fmt(payload.amount)} debited from account`);
          break;

        case 'loan_emi_debit': {
          const loan = customer.loan;
          if (!loan) break;
          const emi = loan.monthlyPayment;
          if (customer.balance < emi) {
            showToast('Insufficient balance for EMI debit', 'error');
            break;
          }
          await api.post(`/accounts/${customer.account}/debit`, {
            amount: emi,
            description: `Loan EMI — ${loan.loanRef}`,
            channel: 'Loan Recovery',
          });
          const newBalance = loan.balance - emi;
          const newAccBal = customer.balance - emi;
          const nextDueDate = new Date(loan.nextDue ?? new Date());
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          setCustomer((p) => ({
            ...p,
            balance: newAccBal,
            loan: newBalance <= 0
              ? null
              : {
                  ...p.loan,
                  balance: newBalance,
                  amountPaid: (p.loan.amount - newBalance),
                  nextDue: nextDueDate.toISOString().split('T')[0],
                  overdue: false,
                },
          }));
          showToast(`EMI of ${fmt(emi)} posted — loan balance updated`);
          break;
        }

        case 'reversal':
          await api.post(`/transactions/${payload.transactionId ?? selectedTxn?.id}/reverse`, { reason: payload.detail ?? 'Staff reversal' });
          showToast('Transaction reversal initiated — pending T+1 settlement');
          break;
        case 'tier_upgrade':
          await api.patch(`/accounts/${customer.account}/status`, { currentComplianceTier: payload.tier === 'black' ? 3 : 2 });
          setCustomer((p) => ({
            ...p,
            tier: payload.tier === 'black' ? 'Tier 3' : 'Tier 2',
            tierLabel: payload.tier === 'black' ? 'Tier 3 (Black)' : 'Tier 2 (Gold)',
          }));
          showToast(`Tier upgraded to ${payload.tier === 'black' ? 'Tier 3 (Black)' : 'Tier 2 (Gold)'} — limits updated`);
          break;
        case 'limit_modify':
          await api.patch(`/accounts/${customer.account}/limits`, { [payload.key]: Number(payload.value) });
          setCustomer((p) => ({ ...p, transactionLimit: { ...p.transactionLimit, [payload.key]: Number(payload.value) } }));
          showToast(`${payload.label} updated`);
          break;
        case 'card_block':
          await api.patch(`/cards/${customer.account}/block`, { cardId: payload.cardId });
          setCustomer((p) => ({ ...p, cards: p.cards.map((c) => c.id === payload.cardId ? { ...c, status: 'Blocked' } : c), cardStatus: 'disabled' }));
          showToast('Card blocked immediately');
          break;
        case 'card_unblock':
          await api.patch(`/cards/${customer.account}/unblock`, { cardId: payload.cardId });
          setCustomer((p) => ({ ...p, cards: p.cards.map((c) => c.id === payload.cardId ? { ...c, status: 'Active' } : c), cardStatus: 'active' }));
          showToast('Card unblocked successfully');
          break;
        case 'card_replace':
          await api.post(`/cards/${customer.account}/replace`, { reason: payload.reason ?? 'Staff request', oldTier: customer.cards[0]?.tier ?? 'silver' });
          showToast('Card replacement request submitted — 5 business days');
          break;
        case 'card_hotlist':
          await api.patch(`/cards/${customer.account}/block`, { cardId: payload.cardId, permanent: true });
          showToast('Card hotlisted — permanent block recorded on switch', 'warning');
          break;
        case 'reset_pin':
          await api.post(`/accounts/${customer.account}/reset-pin`);
          showToast('PIN reset OTP sent to registered number');
          break;
        case 'reset_password':
          await api.post(`/accounts/${customer.account}/reset-password`);
          showToast('Password reset link sent via email');
          break;
        case 'unlock_login':
          await api.patch(`/accounts/${customer.account}/status`, { failedLogins: 0 });
          setCustomer((p) => ({ ...p, failedLogins: 0 }));
          showToast('Login unlocked — failed attempts cleared');
          break;

        // ── FIX 2: MANDATE ACTIONS — now call the backend ──────────────────
        case 'mandate_suspend': {
          await api.patch(`/accounts/${customer.account}/mandates/${payload.id}`, { status: 'Suspended' });
          setCustomer((p) => ({
            ...p,
            mandates: p.mandates.map((m) =>
              m._id?.toString() === payload.id || m.id === payload.id
                ? { ...m, status: 'Suspended' }
                : m
            ),
          }));
          showToast('Standing order suspended');
          break;
        }
        case 'mandate_reactivate': {
          await api.patch(`/accounts/${customer.account}/mandates/${payload.id}`, { status: 'Active' });
          setCustomer((p) => ({
            ...p,
            mandates: p.mandates.map((m) =>
              m._id?.toString() === payload.id || m.id === payload.id
                ? { ...m, status: 'Active' }
                : m
            ),
          }));
          showToast('Mandate reactivated');
          break;
        }
        case 'mandate_cancel': {
          await api.delete(`/accounts/${customer.account}/mandates/${payload.id}`);
          setCustomer((p) => ({
            ...p,
            mandates: p.mandates.filter(
              (m) => m._id?.toString() !== payload.id && m.id !== payload.id
            ),
          }));
          showToast('Standing order cancelled');
          break;
        }
        case 'add_mandate': {
          const { data: res } = await api.post(`/accounts/${customer.account}/mandates`, {
            beneficiary:        payload.beneficiary,
            beneficiaryAccount: payload.beneficiaryAccount,
            amount:             Number(payload.amount),
            frequency:          payload.frequency,
            startDate:          payload.startDate,
            endDate:            payload.endDate || null,
            narration:          payload.narration || '',
          });
          setCustomer((p) => ({ ...p, mandates: [...p.mandates, res.data] }));
          showToast('Standing order created');
          break;
        }

        // ── FIX 3: SIGNATORY ACTIONS — now call the backend ────────────────
        case 'add_signatory': {
          const { data: res } = await api.post(`/accounts/${customer.account}/signatories`, {
            name:            payload.name,
            bvn:             payload.bvn,
            signatoryClass:  payload.signatoryClass || 'Authorized Signatory',
            phone:           payload.phone || null,
          });
          setCustomer((p) => ({ ...p, signatories: [...p.signatories, res.data] }));
          showToast('Signatory added — mandate updated');
          break;
        }
        case 'remove_signatory': {
          await api.delete(`/accounts/${customer.account}/signatories/${payload.signatoryId}`);
          setCustomer((p) => ({
            ...p,
            signatories: p.signatories.filter(
              (s) => s._id?.toString() !== payload.signatoryId && s.id !== payload.signatoryId
            ),
          }));
          showToast('Signatory removed — mandate updated');
          break;
        }

        case 'reactivate_dormant':
          await api.patch(`/accounts/${customer.account}/status`, { dormant: false });
          setCustomer((p) => ({ ...p, dormant: false }));
          showToast('Account reactivated from dormancy');
          break;
        case 'generate_statement':
          await api.get(`/accounts/${customer.account}/statement`);
          showToast('E-statement generated — sent to registered email');
          break;
        case 'sms_toggle':
          await api.patch(`/accounts/${customer.account}`, { smsAlert: !customer.smsAlert });
          setCustomer((p) => ({ ...p, smsAlert: !p.smsAlert }));
          showToast(`SMS alerts ${customer.smsAlert ? 'disabled' : 'enabled'}`);
          break;
        case 'email_toggle':
          await api.patch(`/accounts/${customer.account}`, { emailAlert: !customer.emailAlert });
          setCustomer((p) => ({ ...p, emailAlert: !p.emailAlert }));
          showToast(`Email alerts ${customer.emailAlert ? 'disabled' : 'enabled'}`);
          break;
        case 'save_profile':
          await api.patch(`/accounts/${customer.account}`, {
            phone: editBuf.phone, altPhone: editBuf.altPhone, email: editBuf.email,
            address: editBuf.address, occupation: editBuf.occupation, employer: editBuf.employer,
          });
          setCustomer((p) => ({ ...p, ...editBuf }));
          setEditMode(false);
          showToast('Profile updated — audit trail recorded');
          break;
        case 'link_nin':
          showToast('NIN linkage request submitted to NIMC');
          break;
        case 'kyc_upgrade':
          showToast('KYC upgrade initiated — compliance queue');
          break;
        case 'send_sms':
          await api.post(`/accounts/${customer.account}/notify`, { channel: 'sms', message: payload.message ?? '' });
          showToast('Custom SMS dispatched to customer');
          break;
        case 'send_email':
          await api.post(`/accounts/${customer.account}/notify`, { channel: 'email', subject: payload.subject ?? '', message: payload.message ?? '' });
          showToast('Email sent from noreply@crestlinebank.ng');
          break;
        case 'add_inquiry':
          showToast('Inquiry logged — ticket ID generated');
          break;
        default:
          showToast('Action executed');
          break;
      }
    } catch (err) {
      showToast(err.response?.data?.message ?? `Action failed: ${type.replace(/_/g, ' ')}`, 'error');
    }
    addAuditEntry(type.replace(/_/g, ' ').toUpperCase(), payload.detail ?? `Performed by staff`);
    closeModal();
  };

  const NAV = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'profile', label: 'Profile & Edit', icon: Edit3 },
    { id: 'kyc', label: 'KYC & Compliance', icon: ShieldCheck },
    { id: 'transactions', label: 'Transactions', icon: ArrowUpRight },
    { id: 'cards', label: 'Cards', icon: CreditCard },
    { id: 'loan', label: 'Loan Account', icon: TrendingUp },
    { id: 'limits', label: 'Limits & Channels', icon: Settings },
    { id: 'mandates', label: 'Mandates & SO', icon: RotateCcw },
    { id: 'signatories', label: 'Signatories', icon: UserCheck },
    { id: 'inquiries', label: 'Inquiries & Disputes', icon: AlertCircle },
    { id: 'restrictions', label: 'Restrictions', icon: Ban },
    { id: 'notifications', label: 'Alerts & Comms', icon: Bell },
    { id: 'aml', label: 'AML / Compliance', icon: Flag },
    { id: 'activity', label: 'Audit Trail', icon: Clock },
  ];

  const loanData = customer.loan;

  const renderLoanSection = () => {
    if (!loanData) {
      return (
        <div className="space-y-5">
          <SectionHead icon={<TrendingUp size={16} />} title="Loan Account" sub="Active loan details, repayment schedule and EMI management" />
          <div className="text-center py-16 space-y-3">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
              <TrendingUp size={24} className="text-slate-300" />
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No Active Loan on This Account</p>
            <p className="text-[10px] text-slate-300 font-bold">Customer has no outstanding loan obligation</p>
          </div>
        </div>
      );
    }

    const repaidPct = Math.min(100, Math.round(((loanData.amount - loanData.balance) / loanData.amount) * 100));
    const overdue = loanData.overdue;

    return (
      <div className="space-y-5">
        <SectionHead icon={<TrendingUp size={16} />} title="Loan Account" sub="Active loan details, repayment schedule and EMI management" />

        {overdue && (
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-xl shrink-0">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-black text-red-700 uppercase tracking-wider">
                Repayment Overdue — EMI Due Since {loanData.nextDue}
              </p>
              <p className="text-[9px] text-red-500 font-bold mt-0.5">
                Auto-debit scheduled at midnight · Manual debit available below
              </p>
            </div>
            <button
              onClick={() => execAction('loan_emi_debit', { detail: `Overdue EMI debit — ${loanData.loanRef}` })}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-red-700 transition-all shrink-0"
            >
              Post EMI Now
            </button>
          </div>
        )}

        <div className={`bg-white rounded-2xl border-2 overflow-hidden ${overdue ? 'border-red-200' : 'border-slate-100'}`}>
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Loan Reference</p>
                <p className="text-lg font-mono font-black text-white">{loanData.loanRef}</p>
              </div>
              <div className="flex gap-2">
                <Badge color="orange">Active</Badge>
                {overdue && <Badge color="red">⚠ Overdue</Badge>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Outstanding Balance</p>
                <p className="text-3xl font-black text-white">{fmt(loanData.balance)}</p>
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Next EMI Due</p>
                <p className={`text-xl font-black ${overdue ? 'text-red-400' : 'text-teal-400'}`}>
                  {loanData.nextDue ?? '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[8px] font-black text-slate-400 uppercase">Repayment Progress</span>
              <span className="text-[10px] font-black text-teal-600">{repaidPct}% repaid</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${overdue ? 'bg-gradient-to-r from-red-400 to-orange-400' : 'bg-gradient-to-r from-orange-400 to-teal-500'}`}
                style={{ width: `${repaidPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[8px] font-bold text-slate-400">Paid: {fmt(loanData.amountPaid)}</span>
              <span className="text-[8px] font-bold text-slate-400">Principal: {fmt(loanData.amount)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-slate-100">
            {[
              { l: 'Monthly EMI', v: fmt(loanData.monthlyPayment), color: 'text-slate-900' },
              { l: 'Months Remaining', v: `${loanData.monthsLeft} months`, color: 'text-orange-600' },
              { l: 'Tenure', v: loanData.textTenure ?? `${loanData.tenure} months`, color: 'text-slate-900' },
              { l: 'Interest Rate', v: `${loanData.interestRate}% p.a.`, color: 'text-purple-600' },
            ].map((m) => (
              <div key={m.l} className="p-4">
                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{m.l}</p>
                <p className={`text-sm font-black ${m.color}`}>{m.v}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">EMI & Loan Actions</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => execAction('loan_emi_debit', { detail: `Manual EMI debit — ${loanData.loanRef}` })}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-orange-700 transition-all"
            >
              <DollarSign size={11} />Post EMI Debit
            </button>
            <button
              onClick={() => execAction('debit', {
                amount: loanData.balance,
                narration: `Full loan settlement — ${loanData.loanRef}`,
                channel: 'Loan Recovery',
                detail: `Full loan settlement for ${loanData.loanRef}`,
              })}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-100 text-teal-700 rounded-xl text-[9px] font-black uppercase hover:bg-teal-200 transition-all"
            >
              <CheckCircle2 size={11} />Full Settlement
            </button>
            <button
              onClick={() => setActiveSection('transactions')}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase hover:bg-slate-200 transition-all"
            >
              <ArrowUpRight size={11} />Repayment History
            </button>
            <button
              onClick={() => execAction('generate_statement', { detail: 'Loan statement requested' })}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase hover:bg-slate-200 transition-all"
            >
              <FileText size={11} />Loan Statement
            </button>
          </div>
        </div>

        <div className={`rounded-2xl p-4 border flex items-center gap-3 ${
          customer.balance >= loanData.monthlyPayment
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-red-50 border-red-200'
        }`}>
          {customer.balance >= loanData.monthlyPayment
            ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            : <AlertTriangle size={16} className="text-red-500 shrink-0" />
          }
          <div>
            <p className={`text-[10px] font-black uppercase ${customer.balance >= loanData.monthlyPayment ? 'text-emerald-700' : 'text-red-700'}`}>
              {customer.balance >= loanData.monthlyPayment
                ? `Sufficient balance for next EMI — ${fmt(customer.balance)} available`
                : `Insufficient balance — ${fmt(customer.balance)} available, EMI is ${fmt(loanData.monthlyPayment)}`
              }
            </p>
            <p className={`text-[8px] font-bold mt-0.5 ${customer.balance >= loanData.monthlyPayment ? 'text-emerald-600' : 'text-red-500'}`}>
              {customer.balance >= loanData.monthlyPayment
                ? 'Auto-debit will succeed at next scheduled run'
                : 'Auto-debit will fail at next scheduled run — manual intervention required'
              }
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderSection = () => {
    if (loadingSection) {
      return (
        <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
          <RefreshCw size={18} className="animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-widest">Loading…</span>
        </div>
      );
    }

    switch (activeSection) {
      case 'loan':
        return renderLoanSection();

      case 'overview':
        return (
          <div className="space-y-5">
            {customer.pndType && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
                <AlertTriangle size={16} className="text-red-500" />
                <span className="text-[10px] font-black text-red-700 uppercase">
                  PND ({customer.pndType}) Active — {customer.pndType === 'Debit' ? 'All outgoing transactions blocked' : 'All transactions blocked per CBN directive'}
                </span>
              </div>
            )}
            {customer.amlFlag && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
                <Flag size={16} className="text-orange-500" />
                <span className="text-[10px] font-black text-orange-700 uppercase">⚠ AML Flag Active — Suspicious Transaction Report Filed</span>
              </div>
            )}
            {customer.pep && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
                <Star size={16} className="text-yellow-500" />
                <span className="text-[10px] font-black text-yellow-700 uppercase">Politically Exposed Person (PEP) — Enhanced Due Diligence Required</span>
              </div>
            )}
            {customer.failedLogins >= 2 && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock size={16} className="text-blue-500" />
                  <span className="text-[10px] font-black text-blue-700 uppercase">{customer.failedLogins} Failed Login Attempt(s)</span>
                </div>
                <button onClick={() => execAction('unlock_login')} className="text-[9px] font-black text-blue-700 bg-blue-100 px-3 py-1 rounded-lg hover:bg-blue-200">Unlock</button>
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Ledger Balance', val: fmt(customer.ledgerBalance), color: 'text-teal-600', sub: 'Book balance' },
                { label: 'Available Balance', val: fmt(customer.availableBalance), color: 'text-emerald-600', sub: 'Spendable today' },
                { label: 'Account Status', val: customer.status, color: customer.status === 'Active' ? 'text-emerald-600' : 'text-red-600', sub: customer.status === 'Frozen' ? `Reason: ${customer.frozenReason}` : customer.tierLabel },
                { label: 'Interest Earned', val: `+${fmt(customer.interestEarned)}`, color: 'text-purple-600', sub: `${customer.interestRate}% p.a.` },
              ].map((b) => (
                <div key={b.label} className="bg-white rounded-2xl p-5 border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">{b.label}</p>
                  <p className={`text-lg font-black ${b.color}`}>{b.val}</p>
                  <p className="text-[8px] text-slate-400 font-bold mt-1">{b.sub}</p>
                </div>
              ))}
            </div>

            {loanData && (
              <div className={`bg-white rounded-2xl border-2 overflow-hidden ${loanData.overdue ? 'border-red-300' : 'border-slate-100'}`}>
                {loanData.overdue && (
                  <div className="bg-red-600 px-5 py-2.5 flex items-center gap-2">
                    <AlertTriangle size={13} className="text-white shrink-0" />
                    <span className="text-[9px] font-black text-white uppercase tracking-wider">
                      Repayment Overdue Since {loanData.nextDue} — Auto-debit scheduled at midnight
                    </span>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={14} className="text-orange-500" />
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                      Active Loan — {loanData.loanRef}
                    </span>
                    <Badge color="orange">Active</Badge>
                    {loanData.overdue && <Badge color="red">⚠ Overdue</Badge>}
                    <button
                      onClick={() => setActiveSection('loan')}
                      className="ml-auto text-[9px] font-black text-teal-600 uppercase flex items-center gap-1 hover:text-teal-700"
                    >
                      Full Details →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {[
                      { l: 'Outstanding Balance', v: fmt(loanData.balance), color: loanData.overdue ? 'text-red-600' : 'text-orange-600' },
                      { l: 'Monthly EMI', v: fmt(loanData.monthlyPayment), color: 'text-slate-900' },
                      { l: 'Next Due Date', v: loanData.nextDue ?? '—', color: loanData.overdue ? 'text-red-600' : 'text-slate-900' },
                      { l: 'Months Left', v: `${loanData.monthsLeft} mo`, color: 'text-slate-900' },
                    ].map((m) => (
                      <div key={m.l} className={`rounded-xl p-3 ${loanData.overdue && m.l === 'Next Due Date' ? 'bg-red-50 border border-red-100' : 'bg-slate-50'}`}>
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{m.l}</p>
                        <p className={`text-sm font-black ${m.color}`}>{m.v}</p>
                      </div>
                    ))}
                  </div>

                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full ${loanData.overdue ? 'bg-gradient-to-r from-red-400 to-orange-400' : 'bg-gradient-to-r from-orange-400 to-teal-500'}`}
                      style={{ width: `${Math.min(100, Math.round(((loanData.amount - loanData.balance) / loanData.amount) * 100))}%` }}
                    />
                  </div>
                  <p className="text-[8px] text-slate-400 font-bold">
                    {Math.round(((loanData.amount - loanData.balance) / loanData.amount) * 100)}% repaid
                  </p>

                  {customer.balance < loanData.monthlyPayment && (
                    <div className="mt-3 bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2">
                      <AlertTriangle size={12} className="text-red-500 shrink-0" />
                      <span className="text-[9px] font-black text-red-600">
                        Insufficient balance ({fmt(customer.balance)}) — auto-debit will fail
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 px-5 pb-5">
                  <button
                    onClick={() => execAction('loan_emi_debit', { detail: `EMI debit from overview — ${loanData.loanRef}` })}
                    className="flex items-center gap-1.5 px-4 py-2 bg-orange-100 text-orange-700 rounded-xl text-[9px] font-black uppercase hover:bg-orange-200 transition-all"
                  >
                    <DollarSign size={11} />Post EMI Debit
                  </button>
                  <button
                    onClick={() => setActiveSection('loan')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase hover:bg-slate-200 transition-all"
                  >
                    <ArrowUpRight size={11} />Full Loan Details
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-5 border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Actions</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Credit Account', icon: <DollarSign size={12} />, action: () => openModal('credit'), color: 'bg-emerald-600 text-white' },
                  { label: 'Debit Account', icon: <Minus size={12} />, action: () => openModal('debit'), color: 'bg-red-600 text-white' },
                  { label: customer.status === 'Frozen' ? 'Unfreeze Account' : 'Freeze Account', icon: <Ban size={12} />, action: () => openModal(customer.status === 'Frozen' ? 'unfreeze' : 'freeze'), color: customer.status === 'Frozen' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700' },
                  { label: 'Apply PND', icon: <Slash size={12} />, action: () => openModal('pnd'), color: 'bg-orange-100 text-orange-700' },
                  { label: 'Generate Statement', icon: <FileText size={12} />, action: () => execAction('generate_statement'), color: 'bg-teal-100 text-teal-700' },
                  { label: 'Reset PIN', icon: <Hash size={12} />, action: () => execAction('reset_pin'), color: 'bg-purple-100 text-purple-700' },
                  { label: 'Upgrade Tier', icon: <TrendingUp size={12} />, action: () => openModal('tier_upgrade'), color: 'bg-blue-100 text-blue-700' },
                  { label: 'Flag AML', icon: <Flag size={12} />, action: () => openModal('flag_aml'), color: 'bg-yellow-100 text-yellow-700' },
                ].map((a) => (
                  <button key={a.label} onClick={a.action} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all hover:opacity-80 ${a.color}`}>
                    {a.icon}{a.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Recent Transactions</span>
                <button onClick={() => setActiveSection('transactions')} className="text-[9px] font-black text-teal-600 uppercase">View All →</button>
              </div>
              {customer.transactions.length === 0 ? (
                <div className="p-8 text-center text-[10px] font-bold text-slate-400 uppercase">
                  <button onClick={() => setActiveSection('transactions')} className="text-teal-600 underline">Load transactions</button>
                </div>
              ) : (
                <table className="w-full">
                  <tbody className="divide-y divide-slate-50">
                    {customer.transactions.slice(0, 5).map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <p className="text-[10px] font-bold text-slate-800">{t.description}</p>
                          <p className="text-[8px] font-mono text-slate-400">{t.date} · {t.channel}</p>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {t.flagged && <span className="text-[8px] font-black text-orange-600 mr-2">⚠ Flagged</span>}
                          <span className={`text-sm font-black font-mono ${t.type === 'Credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {t.type === 'Credit' ? '+' : '-'}{fmt(t.amount)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <SectionHead icon={<User size={16} />} title="Customer Profile" sub="CBN-mandated fields — all edits are audit-logged" />
              <button
                onClick={() => {
                  if (editMode) {
                    execAction('save_profile');
                  } else {
                    setEditBuf({ email: customer.email, phone: customer.phone, altPhone: customer.altPhone, address: customer.address, occupation: customer.occupation, employer: customer.employer });
                    setEditMode(true);
                  }
                }}
                className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${editMode ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-700'}`}
              >
                {editMode ? <><CheckCircle2 size={12} />Save Changes</> : <><Edit3 size={12} />Edit Profile</>}
              </button>
            </div>
            {editMode && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[10px] font-bold text-amber-700 flex gap-2">
                <AlertTriangle size={14} className="shrink-0" />Editing mode active — all changes will be timestamped
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { title: 'Personal Information', fields: [
                  { label: 'Full Name', key: 'name', editable: false },
                  { label: 'Date of Birth', key: 'dob', editable: false },
                  { label: 'Gender', key: 'gender', editable: false },
                  { label: 'Nationality', key: 'nationality', editable: false },
                  { label: 'BVN', key: 'bvn', editable: false },
                  { label: 'NIN', key: 'nin', editable: false },
                ]},
                { title: 'Contact Details', fields: [
                  { label: 'Email Address', key: 'email', editable: true },
                  { label: 'Primary Phone', key: 'phone', editable: true },
                  { label: 'Alternate Phone', key: 'altPhone', editable: true },
                  { label: 'Residential Address', key: 'address', editable: true },
                  { label: 'State', key: 'state', editable: false },
                  { label: 'LGA', key: 'lga', editable: false },
                ]},
                { title: 'Account Details', fields: [
                  { label: 'Account Number', key: 'account', editable: false },
                  { label: 'Account Type', key: 'accountType', editable: false },
                  { label: 'Status', key: 'status', editable: false },
                  { label: 'Tier', key: 'tierLabel', editable: false },
                  { label: 'Branch', key: 'branch', editable: false },
                  { label: 'Opening Date', key: 'openingDate', editable: false },
                ]},
                { title: 'Employment', fields: [
                  { label: 'Occupation', key: 'occupation', editable: true },
                  { label: 'Employer', key: 'employer', editable: true },
                  { label: 'Monthly Income', key: 'monthlyIncome', editable: true, fmt: true },
                  { label: 'PEP Status', key: 'pep', editable: false, bool: true },
                ]},
              ].map((sec) => (
                <div key={sec.title} className="bg-white rounded-2xl p-5 border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">{sec.title}</p>
                  <div className="space-y-0">
                    {sec.fields.map((f) => (
                      <div key={f.key} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0 gap-3">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider shrink-0">{f.label}</span>
                        {editMode && f.editable ? (
                          <input className="text-[11px] font-bold text-slate-800 bg-teal-50 border border-teal-200 rounded-lg px-2 py-1 flex-1 text-right outline-none focus:border-teal-500" value={editBuf[f.key] ?? ''} onChange={(e) => setEditBuf((p) => ({ ...p, [f.key]: e.target.value }))} />
                        ) : (
                          <span className="text-[11px] font-bold text-slate-800 font-mono text-right">
                            {f.bool
                              ? customer[f.key] ? <Badge color="orange">Yes</Badge> : <Badge color="slate">No</Badge>
                              : f.fmt ? fmt(customer[f.key])
                              : customer[f.key] ?? '—'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'kyc':
        return (
          <div className="space-y-5">
            <SectionHead icon={<ShieldCheck size={16} />} title="KYC & Compliance" sub="Per CBN KYC/AML Framework 2023 — NFIU Reporting" />

            {/* FIX 1 (UI): KYC status badge now reads the properly merged kyc object */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${customer.kyc.status === 'Verified' ? 'bg-emerald-100' : 'bg-orange-100'}`}>
                  <ShieldCheck size={20} className={customer.kyc.status === 'Verified' ? 'text-emerald-600' : 'text-orange-500'} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{customer.kyc.level}</p>
                  <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                    Status: <span className={customer.kyc.status === 'Verified' ? 'text-emerald-600' : 'text-orange-600'}>{customer.kyc.status}</span>
                    {customer.kyc.completedDate && ` · Verified: ${new Date(customer.kyc.completedDate).toLocaleDateString()}`}
                    {customer.kyc.verifiedBy && ` · By: ${customer.kyc.verifiedBy}`}
                  </p>
                </div>
              </div>
              <Badge color={customer.kyc.status === 'Verified' ? 'green' : 'orange'}>{customer.kyc.status}</Badge>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'KYC Level', val: customer.kyc.level, ok: customer.kyc.status === 'Verified' },
                { label: 'BVN Linked', val: customer.kyc.bvnLinked ? 'Linked' : 'Not Linked', ok: customer.kyc.bvnLinked },
                { label: 'NIN Linked', val: customer.kyc.ninLinked ? 'Linked' : 'Not Linked', ok: customer.kyc.ninLinked },
                { label: 'Face Match', val: customer.kyc.faceMatch ? 'Verified' : 'Pending', ok: customer.kyc.faceMatch },
                { label: 'PEP Status', val: customer.pep ? 'PEP' : 'Not PEP', ok: !customer.pep },
                { label: 'Watchlist', val: customer.watchlist ? 'Listed' : 'Clear', ok: !customer.watchlist },
              ].map((i) => (
                <div key={i.label} className={`flex items-center gap-3 p-4 rounded-2xl border-2 ${i.ok ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                  {i.ok ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> : <XCircle size={16} className="text-red-500 shrink-0" />}
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase">{i.label}</p>
                    <p className={`text-[11px] font-black ${i.ok ? 'text-emerald-700' : 'text-red-700'}`}>{i.val}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">KYC Documents</p>
                <div className="flex gap-2">
                  {!customer.kyc.ninLinked && (
                    <button onClick={() => execAction('link_nin')} className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1">
                      <Plus size={10} />Link NIN
                    </button>
                  )}
                  <button onClick={() => execAction('kyc_upgrade')} className="text-[9px] font-black text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-100 flex items-center gap-1">
                    <TrendingUp size={10} />Upgrade KYC
                  </button>
                </div>
              </div>
              {customer.kyc.documents.length === 0 ? (
                <p className="text-[10px] text-slate-400 font-bold text-center py-4">No documents on file</p>
              ) : (
                <div className="space-y-3">
                  {customer.kyc.documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <FileText size={14} className="text-slate-400" />
                        <div>
                          <p className="text-[11px] font-bold text-slate-800">{doc.type}</p>
                          <p className="text-[8px] text-slate-400 font-bold">
                            {doc.uploaded ? `Uploaded: ${doc.uploaded}` : 'Not submitted'}
                            {doc.expiryDate ? ` · Expires: ${doc.expiryDate}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge color={doc.status === 'Verified' ? 'green' : doc.status === 'Pending Review' ? 'orange' : 'red'}>{doc.status}</Badge>
                        {doc.uploaded && <button className="text-[9px] font-black text-slate-400 hover:text-teal-600"><Eye size={12} /></button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Regulatory Flags</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'CRS Reporting', val: customer.crsFlag, desc: 'Common Reporting Standard' },
                  { label: 'FATCA', val: customer.fatcaFlag, desc: 'US Person indicator' },
                  { label: 'AML Flag', val: customer.amlFlag, desc: 'Suspicious activity flagged' },
                  { label: 'CBN Blacklist', val: customer.cbnBlacklist, desc: 'CBN/EFCC sanction list' },
                ].map((f) => (
                  <div key={f.label} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-[10px] font-black text-slate-700">{f.label}</p>
                      <p className="text-[8px] text-slate-400 font-bold">{f.desc}</p>
                    </div>
                    <Badge color={f.val ? 'red' : 'green'}>{f.val ? 'Yes' : 'Clear'}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'transactions': {
        const filtered = customer.transactions.filter(
          (t) => txnFilter === 'All' || t.type === txnFilter || (txnFilter === 'Flagged' && t.flagged)
        );
        return (
          <div className="space-y-4">
            <SectionHead icon={<ArrowUpRight size={16} />} title="Transaction History" sub="Full ledger · Click any row to view details or take action" />
            <div className="flex items-center gap-2 flex-wrap">
              {['All', 'Credit', 'Debit', 'Flagged'].map((f) => (
                <button key={f} onClick={() => setTxnFilter(f)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${txnFilter === f ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                  {f}
                  {f === 'Flagged' && (
                    <span className="ml-1 bg-orange-500 text-white rounded-full w-4 h-4 inline-flex items-center justify-center text-[7px]">
                      {customer.transactions.filter((t) => t.flagged).length}
                    </span>
                  )}
                </button>
              ))}
              <button onClick={loadTransactions} className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase hover:bg-slate-200">
                <RefreshCw size={11} />Refresh
              </button>
              <button onClick={() => execAction('generate_statement')} className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase hover:bg-slate-200">
                <Download size={11} />Export Statement
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['Date/Time', 'Description', 'Channel', 'Ref', 'Type', 'Amount', 'Balance', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-[10px] font-bold text-slate-400">No transactions found</td></tr>
                  ) : (
                    filtered.map((t) => (
                      <tr key={t.id} className={`hover:bg-slate-50 transition-colors cursor-pointer ${t.flagged ? 'bg-orange-50' : ''}`} onClick={() => setSelectedTxn(t)}>
                        <td className="px-4 py-3 text-[9px] font-mono font-bold text-slate-400 whitespace-nowrap">{t.date}</td>
                        <td className="px-4 py-3 max-w-[180px]">
                          <p className="text-[10px] font-bold text-slate-800 truncate">{t.description}</p>
                          <p className="text-[8px] text-slate-400">{t.narration}</p>
                        </td>
                        <td className="px-4 py-3 text-[9px] font-bold text-slate-500">{t.channel}</td>
                        <td className="px-4 py-3 text-[8px] font-mono text-slate-400">{t.ref}</td>
                        <td className="px-4 py-3"><Badge color={t.type === 'Credit' ? 'green' : 'red'}>{t.type}</Badge></td>
                        <td className={`px-4 py-3 text-sm font-black font-mono ${t.type === 'Credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {t.type === 'Credit' ? '+' : '-'}{fmt(t.amount)}
                        </td>
                        <td className="px-4 py-3 text-[10px] font-mono font-bold text-slate-500">{fmt(t.balance)}</td>
                        <td className="px-4 py-3">{t.flagged && <Flag size={12} className="text-orange-500" />}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {selectedTxn && (
              <div className="bg-white rounded-2xl p-5 border-2 border-teal-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-800 uppercase">Transaction Detail — {selectedTxn.id}</span>
                  <button onClick={() => setSelectedTxn(null)} className="text-slate-400 hover:text-slate-700"><XCircle size={16} /></button>
                </div>
                <div className="grid grid-cols-2 gap-x-8">
                  {[
                    ['Date', selectedTxn.date], ['Amount', `${selectedTxn.type === 'Credit' ? '+' : '-'}${fmt(selectedTxn.amount)}`],
                    ['Type', selectedTxn.type], ['Channel', selectedTxn.channel],
                    ['Reference', selectedTxn.ref], ['Session ID', selectedTxn.sessionId],
                    ['Narration', selectedTxn.narration || '—'], ['Balance After', fmt(selectedTxn.balance)],
                  ].map(([k, v]) => <InfoRow key={k} label={k} value={v} mono />)}
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button onClick={() => { execAction('reversal', { transactionId: selectedTxn.id, detail: `Reversal of ${selectedTxn.ref}` }); setSelectedTxn(null); }} className="flex items-center gap-1.5 px-4 py-2 bg-orange-100 text-orange-700 rounded-xl text-[9px] font-black uppercase hover:bg-orange-200"><RotateCcw size={11} />Post Reversal</button>
                  <button onClick={() => setCustomer((p) => ({ ...p, transactions: p.transactions.map((t) => t.id === selectedTxn.id ? { ...t, flagged: !t.flagged } : t) }))} className="flex items-center gap-1.5 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl text-[9px] font-black uppercase hover:bg-yellow-200"><Flag size={11} />{selectedTxn.flagged ? 'Remove Flag' : 'Flag Transaction'}</button>
                  <button onClick={() => showToast('Dispute logged — NFIU reference generated')} className="flex items-center gap-1.5 px-4 py-2 bg-red-100 text-red-700 rounded-xl text-[9px] font-black uppercase hover:bg-red-200"><AlertTriangle size={11} />Lodge Dispute</button>
                  <button onClick={() => showToast('Transaction receipt sent to registered email')} className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase hover:bg-slate-200"><Send size={11} />Send Receipt</button>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'cards':
        return (
          <div className="space-y-5">
            <SectionHead icon={<CreditCard size={16} />} title="Card Management" sub="Verve / Mastercard / Visa · Instant block/unblock capability" />
            {customer.cards.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-[10px] font-bold uppercase">No cards issued on this account</div>
            ) : (
              customer.cards.map((card) => (
                <div key={card.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <div className="bg-teal-950 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(45,212,191,0.15),transparent)]" />
                    <div className="relative flex justify-between items-start">
                      <div>
                        <p className="text-[8px] font-black text-teal-400 uppercase tracking-widest">{card.type}</p>
                        <p className="text-2xl font-mono font-black text-white tracking-[0.2em] mt-2">{card.number}</p>
                        <p className="text-[9px] font-bold text-teal-400/60 mt-3 uppercase">Expires {card.expiry} · Issued {card.issued}</p>
                      </div>
                      <Badge color={card.status === 'Active' ? 'green' : 'red'}>{card.status}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100">
                    <div className="p-4"><p className="text-[8px] font-black text-slate-400 uppercase">Daily Limit</p><p className="text-sm font-black text-slate-800 mt-1">{fmt(card.dailyLimit)}</p></div>
                    <div className="p-4"><p className="text-[8px] font-black text-slate-400 uppercase">POS Limit</p><p className="text-sm font-black text-slate-800 mt-1">{fmt(card.posLimit)}</p></div>
                  </div>
                  <div className="flex gap-2 p-4 border-t border-slate-100 flex-wrap">
                    {card.status === 'Active'
                      ? <button onClick={() => execAction('card_block', { cardId: card.id, detail: `Card ${card.number} blocked` })} className="flex items-center gap-1.5 px-4 py-2 bg-red-100 text-red-700 rounded-xl text-[9px] font-black uppercase hover:bg-red-200"><Ban size={11} />Block Card</button>
                      : <button onClick={() => execAction('card_unblock', { cardId: card.id, detail: `Card ${card.number} unblocked` })} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-[9px] font-black uppercase hover:bg-emerald-200"><CheckCircle2 size={11} />Unblock Card</button>
                    }
                    <button onClick={() => execAction('card_replace', { detail: `Card ${card.number} replacement requested` })} className="flex items-center gap-1.5 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-[9px] font-black uppercase hover:bg-blue-200"><RotateCcw size={11} />Replace Card</button>
                    <button onClick={() => execAction('card_hotlist', { cardId: card.id, detail: `Card ${card.number} hotlisted` })} className="flex items-center gap-1.5 px-4 py-2 bg-red-100 text-red-700 rounded-xl text-[9px] font-black uppercase hover:bg-red-200"><Slash size={11} />Hotlist</button>
                    <button onClick={() => execAction('reset_pin', { detail: `PIN reset for card ${card.number}` })} className="flex items-center gap-1.5 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl text-[9px] font-black uppercase hover:bg-purple-200"><Hash size={11} />Reset PIN</button>
                    <button onClick={() => openModal('card_limit', { cardId: card.id })} className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase hover:bg-slate-200"><Settings size={11} />Modify Limits</button>
                  </div>
                </div>
              ))
            )}
            <button onClick={() => openModal('issueCard')} className="w-full py-5 border-2 border-dashed border-slate-200 rounded-2xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:border-teal-400 hover:text-teal-600 transition-all flex items-center justify-center gap-2">
              <Plus size={14} />Issue New Card
            </button>
          </div>
        );

      case 'limits':
        return (
          <div className="space-y-5">
            <SectionHead icon={<Settings size={16} />} title="Transaction Limits & Channels" sub="Per CBN maximum thresholds by tier — requires supervisor override" />
            <div className="grid grid-cols-1 gap-3">
              {[
                { key: 'daily', label: 'Daily Cumulative Limit', channel: 'All Channels', cbsMax: '₦10,000,000 (Tier 3 max)' },
                { key: 'transfer', label: 'Single Transfer Limit', channel: 'Mobile / Internet Banking', cbsMax: '₦5,000,000 (Tier 3 max)' },
                { key: 'pos', label: 'POS Transaction Limit', channel: 'Point of Sale', cbsMax: '₦3,000,000 (Tier 3 max)' },
                { key: 'atm', label: 'ATM Withdrawal Limit', channel: 'ATM Withdrawals', cbsMax: '₦150,000 (CBN max per day)' },
                { key: 'ussd', label: 'USSD Transaction Limit', channel: 'USSD (*XXX#)', cbsMax: '₦200,000 per CBN directive' },
                { key: 'nfc', label: 'NFC / Tap-to-Pay Limit', channel: 'Contactless', cbsMax: '₦50,000 per CBN' },
              ].map((l) => (
                <div key={l.key} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-[11px] font-black text-slate-800">{l.label}</p>
                    <p className="text-[8px] text-slate-400 font-bold mt-0.5">{l.channel} · CBN Max: {l.cbsMax}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-xl font-black text-teal-600">{fmtShort(customer.transactionLimit[l.key])}</p>
                    <button onClick={() => openModal('modifyLimit', { limitKey: l.key, limitLabel: l.label, current: customer.transactionLimit[l.key] })} className="flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase hover:bg-teal-50 hover:text-teal-600 transition-all">
                      <Edit3 size={10} />Modify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // ── FIX 2 (UI): Mandates section — reactivate button now calls execAction ──
      case 'mandates':
        return (
          <div className="space-y-5">
            <SectionHead icon={<RotateCcw size={16} />} title="Mandates & Standing Orders" sub="Recurring payment instructions — direct debit authority" />
            <button onClick={() => openModal('newMandate')} className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-teal-700 transition-all"><Plus size={12} />Add New Mandate</button>
            {customer.mandates.length === 0 && <div className="text-center py-10 text-slate-400 text-[10px] font-bold uppercase">No active mandates on this account</div>}
            {customer.mandates.map((m) => {
              // Support both _id (from DB) and id (legacy)
              const mandateId = m._id?.toString() ?? m.id;
              return (
                <div key={mandateId} className="bg-white rounded-2xl p-5 border border-slate-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm font-black text-slate-800">{m.beneficiary}</p>
                      <p className="text-[9px] font-mono text-slate-400 font-bold mt-0.5">{mandateId} · {m.frequency} · Next: {m.nextDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge color={m.status === 'Active' ? 'green' : m.status === 'Suspended' ? 'orange' : 'red'}>{m.status}</Badge>
                      <p className="text-base font-black text-slate-800">{fmt(m.amount)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {m.status === 'Active'
                      ? <button onClick={() => execAction('mandate_suspend', { id: mandateId, detail: `Mandate ${mandateId} suspended` })} className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-[9px] font-black uppercase hover:bg-orange-200"><Slash size={10} />Suspend</button>
                      : <button onClick={() => execAction('mandate_reactivate', { id: mandateId, detail: `Mandate ${mandateId} reactivated` })} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-[9px] font-black uppercase hover:bg-emerald-200"><CheckCircle2 size={10} />Reactivate</button>
                    }
                    <button onClick={() => execAction('mandate_cancel', { id: mandateId, detail: `Mandate ${mandateId} cancelled` })} className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-[9px] font-black uppercase hover:bg-red-200"><XCircle size={10} />Cancel</button>
                  </div>
                </div>
              );
            })}
          </div>
        );

      // ── FIX 3 (UI): Signatories section — Remove button now calls execAction ──
      case 'signatories':
        return (
          <div className="space-y-5">
            <SectionHead icon={<UserCheck size={16} />} title="Account Signatories" sub="Mandate management — required for business and corporate accounts" />
            <button onClick={() => openModal('addSignatory')} className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-teal-700 transition-all"><Plus size={12} />Add Signatory</button>
            {customer.signatories.map((s, i) => {
              // Support both _id (from DB) and index fallback
              const signatoryId = s._id?.toString() ?? s.id ?? `sig-${i}`;
              return (
                <div key={signatoryId} className="bg-white rounded-2xl p-5 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 font-black">{s.name[0]}</div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{s.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-0.5">{s.class} · BVN: {s.bvn}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={s.status === 'Active' ? 'green' : 'red'}>{s.status}</Badge>
                    {/* FIX 3: was just showToast, now calls execAction with real API delete */}
                    <button
                      onClick={() => execAction('remove_signatory', {
                        signatoryId,
                        detail: `Signatory ${s.name} removed`,
                      })}
                      className="text-[9px] font-black text-red-500 hover:text-red-700 uppercase px-3 py-1 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'inquiries':
        return (
          <div className="space-y-5">
            <SectionHead icon={<AlertCircle size={16} />} title="Inquiries, Complaints & Disputes" sub="CBN Consumer Protection Framework — SLA 10 business days" />
            <button onClick={() => openModal('newInquiry')} className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-teal-700 transition-all"><Plus size={12} />Log New Inquiry</button>
            {customer.inquiries.length === 0 && <div className="text-center py-10 text-slate-400 text-[10px] font-bold uppercase">No inquiries on record</div>}
            {customer.inquiries.map((inq) => (
              <div key={inq.id} className="bg-white rounded-2xl p-5 border border-slate-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm font-black text-slate-800">{inq.subject}</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-0.5 font-mono">{inq.id} · {inq.date} · Assigned: {inq.agent}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge color={inq.priority === 'High' ? 'red' : inq.priority === 'Medium' ? 'orange' : 'slate'}>{inq.priority}</Badge>
                    <Badge color={inq.type === 'Complaint' ? 'orange' : 'teal'}>{inq.type}</Badge>
                    <Badge color={inq.status === 'Resolved' || inq.status === 'Completed' ? 'green' : 'orange'}>{inq.status}</Badge>
                  </div>
                </div>
                {inq.resolution && (
                  <div className="bg-slate-50 rounded-xl p-3 text-[10px] font-bold text-slate-600 border border-slate-100">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Resolution</span>
                    {inq.resolution}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'restrictions':
        return (
          <div className="space-y-5">
            <SectionHead icon={<Ban size={16} />} title="Account Restrictions" sub="Freeze · PND · Dormancy · Lien — all actions are CBN-reportable" />
            <div className="grid grid-cols-1 gap-4">
              <div className={`rounded-2xl p-5 border-2 ${customer.status === 'Frozen' ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-start">
                    <div className={`p-2 rounded-xl ${customer.status === 'Frozen' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}><Ban size={16} /></div>
                    <div>
                      <p className="text-[11px] font-black text-slate-800">Account Freeze</p>
                      <p className="text-[9px] text-slate-500 font-bold">Suspends all debit transactions. Credits continue.</p>
                      {customer.status === 'Frozen' && <p className="text-[9px] text-red-600 font-bold mt-1">Reason: {customer.frozenReason}</p>}
                    </div>
                  </div>
                  {customer.status === 'Frozen'
                    ? <button onClick={() => execAction('unfreeze', { detail: 'Account unfrozen' })} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-emerald-700">Unfreeze</button>
                    : <button onClick={() => openModal('freeze')} className="px-4 py-2 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-red-700">Freeze Account</button>
                  }
                </div>
              </div>
              <div className={`rounded-2xl p-5 border-2 ${customer.pndType ? 'border-orange-300 bg-orange-50' : 'border-slate-200 bg-white'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-start">
                    <div className={`p-2 rounded-xl ${customer.pndType ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}><Slash size={16} /></div>
                    <div>
                      <p className="text-[11px] font-black text-slate-800">Post-No-Debit (PND)</p>
                      <p className="text-[9px] text-slate-500 font-bold">Debit PND: blocks transfers. Full PND: per CBN directive.</p>
                      {customer.pndType && <p className="text-[9px] text-orange-600 font-bold mt-1">Active: {customer.pndType} PND</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!customer.pndType && <>
                      <button onClick={() => execAction('pnd_debit', { detail: 'Debit PND applied' })} className="px-3 py-2 bg-orange-100 text-orange-700 rounded-xl text-[9px] font-black uppercase hover:bg-orange-200">Debit PND</button>
                      <button onClick={() => execAction('pnd_full', { detail: 'Full PND applied' })} className="px-3 py-2 bg-red-100 text-red-700 rounded-xl text-[9px] font-black uppercase hover:bg-red-200">Full PND</button>
                    </>}
                    {customer.pndType && <button onClick={() => execAction('remove_pnd', { detail: 'PND restriction lifted' })} className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-[9px] font-black uppercase hover:bg-emerald-200">Remove PND</button>}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-200">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-start">
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-500"><Clock size={16} /></div>
                    <div>
                      <p className="text-[11px] font-black text-slate-800">Dormancy Status</p>
                      <p className="text-[9px] text-slate-500 font-bold">Accounts inactive {'>'} 6 months are flagged dormant per CBN policy.</p>
                    </div>
                  </div>
                  {customer.dormant
                    ? <button onClick={() => execAction('reactivate_dormant', { detail: 'Account reactivated from dormancy' })} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase">Reactivate</button>
                    : <Badge color="green">Active — Not Dormant</Badge>
                  }
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-200">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-start">
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-500"><BookOpen size={16} /></div>
                    <div>
                      <p className="text-[11px] font-black text-slate-800">Lien / Earmark</p>
                      <p className="text-[9px] text-slate-500 font-bold">Reserve funds against loan collateral or court order.</p>
                    </div>
                  </div>
                  <button onClick={() => openModal('lien')} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase hover:bg-slate-200">Place Lien</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-5">
            <SectionHead icon={<Bell size={16} />} title="Alerts & Communications" sub="Manage customer notification preferences and send ad-hoc messages" />
            <div className="bg-white rounded-2xl p-5 border border-slate-100 space-y-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Alert Channel Configuration</p>
              {[
                { label: 'SMS Alerts', desc: `To ${customer.phone}`, key: 'smsAlert' },
                { label: 'Email Alerts', desc: `To ${customer.email}`, key: 'emailAlert' },
                { label: 'Push Notifications', desc: 'Mobile app', key: 'pushAlert' },
              ].map((a) => (
                <div key={a.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-[10px] font-black text-slate-700">{a.label}</p>
                    <p className="text-[8px] text-slate-400 font-bold">{a.desc}</p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await api.patch(`/accounts/${customer.account}`, { [a.key]: !customer[a.key] });
                        setCustomer((p) => ({ ...p, [a.key]: !p[a.key] }));
                        showToast(`${a.label} ${customer[a.key] ? 'disabled' : 'enabled'}`);
                      } catch { showToast('Failed to update alert preference', 'error'); }
                    }}
                    className={`relative w-10 h-5 rounded-full transition-all ${customer[a.key] ? 'bg-teal-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${customer[a.key] ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 space-y-4">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Send Direct Communication</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => openModal('sendSMS')} className="flex items-center gap-2 p-4 bg-blue-50 rounded-xl border border-blue-100 hover:border-blue-300 transition-all">
                  <Phone size={16} className="text-blue-600" />
                  <div className="text-left"><p className="text-[10px] font-black text-slate-700">Send SMS</p><p className="text-[8px] text-slate-400 font-bold">Ad-hoc message</p></div>
                </button>
                <button onClick={() => openModal('sendEmail')} className="flex items-center gap-2 p-4 bg-purple-50 rounded-xl border border-purple-100 hover:border-purple-300 transition-all">
                  <Mail size={16} className="text-purple-600" />
                  <div className="text-left"><p className="text-[10px] font-black text-slate-700">Send Email</p><p className="text-[8px] text-slate-400 font-bold">Formal communication</p></div>
                </button>
              </div>
            </div>
          </div>
        );

      case 'aml':
        return (
          <div className="space-y-5">
            <SectionHead icon={<Flag size={16} />} title="AML / Compliance" sub="NFIU · EFCC · CBN · NDIC — Suspicious Transaction Reporting" />
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => openModal('flag_aml')} className="flex items-center gap-3 p-5 bg-orange-50 border-2 border-orange-200 rounded-2xl hover:border-orange-400 transition-all text-left">
                <AlertTriangle size={20} className="text-orange-500 shrink-0" />
                <div><p className="text-[11px] font-black text-slate-800">Raise STR</p><p className="text-[9px] text-slate-400 font-bold">File Suspicious Transaction Report — NFIU</p></div>
              </button>
              <button onClick={() => execAction('watchlist', { detail: 'Account added to internal watchlist' })} className="flex items-center gap-3 p-5 bg-yellow-50 border-2 border-yellow-200 rounded-2xl hover:border-yellow-400 transition-all text-left">
                <Eye size={20} className="text-yellow-600 shrink-0" />
                <div><p className="text-[11px] font-black text-slate-800">Add to Watchlist</p><p className="text-[9px] text-slate-400 font-bold">Enhanced transaction monitoring</p></div>
              </button>
              <button onClick={() => showToast('CTR filed with NFIU for transactions above ₦5M')} className="flex items-center gap-3 p-5 bg-red-50 border-2 border-red-200 rounded-2xl hover:border-red-400 transition-all text-left">
                <FileText size={20} className="text-red-500 shrink-0" />
                <div><p className="text-[11px] font-black text-slate-800">File CTR</p><p className="text-[9px] text-slate-400 font-bold">Currency Transaction Report {'>'} ₦5M</p></div>
              </button>
              <button onClick={() => showToast('Escalated to compliance officer for review')} className="flex items-center gap-3 p-5 bg-purple-50 border-2 border-purple-200 rounded-2xl hover:border-purple-400 transition-all text-left">
                <Send size={20} className="text-purple-500 shrink-0" />
                <div><p className="text-[11px] font-black text-slate-800">Escalate to Compliance</p><p className="text-[9px] text-slate-400 font-bold">Route to compliance officer</p></div>
              </button>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Risk Profile</p>
              {[
                { label: 'Risk Rating', val: 'Low Risk', color: 'text-emerald-600' },
                { label: 'Transaction Profile', val: 'Consistent with stated income', color: 'text-slate-700' },
                { label: 'Source of Funds', val: 'Employment / Salary', color: 'text-slate-700' },
                { label: 'Avg Monthly Inflow', val: fmt(customer.monthlyIncome), color: 'text-slate-700' },
              ].map((r) => <InfoRow key={r.label} label={r.label} value={<span className={r.color}>{r.val}</span>} />)}
            </div>
          </div>
        );

      case 'activity':
        return (
          <div className="space-y-4">
            <SectionHead icon={<Clock size={16} />} title="Audit Trail" sub="All events logged with timestamp, IP and staff ID — tamper-evident" />
            <button onClick={loadActivityLog} className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase hover:bg-slate-200"><RefreshCw size={11} />Refresh</button>
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="divide-y divide-slate-50">
                {customer.activityLog.length === 0 ? (
                  <div className="px-5 py-10 text-center text-[10px] font-bold text-slate-400">No audit entries found</div>
                ) : (
                  customer.activityLog.map((a, i) => (
                    <div key={i} className="flex gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                      <span className="text-[9px] font-mono font-bold text-slate-400 whitespace-nowrap pt-0.5 w-36 shrink-0">{a.date}</span>
                      <div className="flex-1">
                        <p className="text-[11px] font-black text-slate-800">{a.event}</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">{a.detail}</p>
                        {a.staff && <p className="text-[8px] font-black text-teal-600 mt-0.5">By: {a.staff}</p>}
                      </div>
                      <span className="text-[8px] font-mono text-slate-300">{a.ip}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const [mInput, setMInput] = useState({});
  const mi = (k) => mInput[k] ?? '';
  const sm = (k, v) => setMInput((p) => ({ ...p, [k]: v }));

  const renderModal = () => {
    const M = modal;
    const titles = {
      credit: 'Credit Account', debit: 'Debit Account', freeze: 'Freeze Account',
      unfreeze: 'Unfreeze Account', pnd: 'Apply Post-No-Debit',
      modifyLimit: `Modify ${M.limitLabel}`, newInquiry: 'Log New Inquiry',
      issueCard: 'Issue New Card', lien: 'Place Lien / Earmark',
      tier_upgrade: 'Upgrade Account Tier', flag_aml: 'Raise AML / STR',
      newMandate: 'Add Standing Order', addSignatory: 'Add Signatory',
      sendSMS: 'Send SMS to Customer', sendEmail: 'Send Email to Customer',
      card_limit: 'Modify Card Limit',
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-md rounded-[28px] shadow-2xl flex flex-col max-h-[90vh]">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">{titles[M.type] || 'Action'}</h3>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{customer.account} · {customer.name}</p>
            </div>
            <button onClick={closeModal} className="text-slate-400 hover:text-slate-700 transition-colors"><XCircle size={22} /></button>
          </div>
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {(M.type === 'credit' || M.type === 'debit') && <>
              <Field label={`Amount (NGN) — ${M.type === 'credit' ? 'Credit' : 'Debit'}`}>
                <input type="number" className={inputCls} placeholder="0.00" value={mi('amount')} onChange={(e) => sm('amount', e.target.value)} />
              </Field>
              <Field label={M.type === 'credit' ? 'Credit Channel' : 'Debit Reason'}>
                {M.type === 'credit'
                  ? <select className={inputCls} onChange={(e) => sm('channel', e.target.value)}><option>Manual Credit</option><option>Cash Deposit</option><option>Reversal</option><option>Interest Posting</option><option>Salary Credit</option></select>
                  : <select className={inputCls} onChange={(e) => sm('channel', e.target.value)}><option>Charge / Fee</option><option>Loan Recovery</option><option>Reversal Debit</option></select>
                }
              </Field>
              <Field label="Narration">
                <textarea className={`${inputCls} min-h-[70px]`} placeholder="Transaction narration..." value={mi('narration')} onChange={(e) => sm('narration', e.target.value)} />
              </Field>
              <Field label="Supervisor Override PIN">
                <input type="password" maxLength={4} className={inputCls} placeholder="••••" />
              </Field>
            </>}
            {M.type === 'freeze' && <>
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-[10px] font-bold text-red-700">⚠ This will suspend ALL debit transactions immediately.</div>
              <Field label="Freeze Category">
                <select className={inputCls} onChange={(e) => sm('reason', e.target.value)}><option>Customer Request</option><option>Court Order / EFCC</option><option>CBN Directive</option><option>Suspected Fraud</option><option>Internal Risk — AML</option></select>
              </Field>
              <Field label="Freeze Reason / Reference">
                <textarea className={`${inputCls} min-h-[70px]`} placeholder="Mandatory narrative..." value={mi('reason')} onChange={(e) => sm('reason', e.target.value)} />
              </Field>
              <Field label="Supervisor Override PIN">
                <input type="password" maxLength={4} className={inputCls} placeholder="••••" />
              </Field>
            </>}
            {M.type === 'pnd' && <>
              <Field label="PND Type">
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => sm('pndType', 'Debit')} className={`p-3 rounded-xl border-2 text-[9px] font-black uppercase transition-all ${mi('pndType') === 'Debit' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200'}`}>Debit PND<p className="text-[8px] font-bold text-slate-400 mt-0.5 normal-case">Blocks outgoing only</p></button>
                  <button onClick={() => sm('pndType', 'Full')} className={`p-3 rounded-xl border-2 text-[9px] font-black uppercase transition-all ${mi('pndType') === 'Full' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200'}`}>Full PND<p className="text-[8px] font-bold text-slate-400 mt-0.5 normal-case">CBN/court directive</p></button>
                </div>
              </Field>
              <Field label="Authority / Reference Number"><input className={inputCls} placeholder="e.g. EFCC/2026/00123" /></Field>
              <Field label="Supervisor PIN"><input type="password" maxLength={4} className={inputCls} placeholder="••••" /></Field>
            </>}
            {M.type === 'modifyLimit' && <>
              <div className="bg-slate-50 rounded-xl p-3 text-[10px] font-bold text-slate-600">Current: <span className="text-teal-600 font-black">{fmt(M.current)}</span></div>
              <Field label={`New ${M.limitLabel} (NGN)`}><input type="number" className={inputCls} placeholder="0.00" value={mi('value')} onChange={(e) => sm('value', e.target.value)} /></Field>
              <Field label="Justification"><textarea className={`${inputCls} min-h-[70px]`} placeholder="Business reason..." /></Field>
              <Field label="Supervisor Override PIN"><input type="password" maxLength={4} className={inputCls} placeholder="••••" /></Field>
            </>}
            {M.type === 'newInquiry' && <>
              <Field label="Inquiry Type"><select className={inputCls}><option>Complaint</option><option>Request</option><option>Dispute</option><option>Enquiry</option><option>Fraud Report</option></select></Field>
              <Field label="Priority"><select className={inputCls}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></Field>
              <Field label="Subject"><input type="text" className={inputCls} placeholder="Brief summary..." /></Field>
              <Field label="Full Details"><textarea className={`${inputCls} min-h-[100px]`} placeholder="Full description of issue..." /></Field>
            </>}
            {M.type === 'issueCard' && <>
              <Field label="Card Network"><select className={inputCls}><option>Verve</option><option>Mastercard</option><option>Visa</option></select></Field>
              <Field label="Card Type"><select className={inputCls}><option>Debit Card</option><option>Prepaid Card</option></select></Field>
              <Field label="Delivery Address"><input className={inputCls} defaultValue={customer.address} /></Field>
              <Field label="Card Personalization Name"><input className={inputCls} defaultValue={customer.name} maxLength={26} /></Field>
              <Field label="Reason for Issuance"><select className={inputCls}><option>New Account</option><option>Lost Card</option><option>Stolen Card</option><option>Damaged Card</option><option>Upgrade</option></select></Field>
              <Field label="Supervisor PIN"><input type="password" maxLength={4} className={inputCls} placeholder="••••" /></Field>
            </>}
            {M.type === 'tier_upgrade' && <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-[10px] font-bold text-blue-700">Upgrading from {customer.tierLabel} — ensure all KYC requirements are met.</div>
              <Field label="Target Tier"><select className={inputCls} onChange={(e) => sm('tier', e.target.value)}><option value="gold">Tier 2 (Gold)</option><option value="black">Tier 3 (Black)</option></select></Field>
              <Field label="Supervisor PIN"><input type="password" maxLength={4} className={inputCls} placeholder="••••" /></Field>
            </>}
            {M.type === 'flag_aml' && <>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-[10px] font-bold text-orange-700">⚠ A Suspicious Transaction Report (STR) will be automatically filed with NFIU.</div>
              <Field label="STR Category"><select className={inputCls}><option>Structuring / Smurfing</option><option>Unusual Transaction Pattern</option><option>Unknown Source of Funds</option><option>Sanctions Match</option></select></Field>
              <Field label="Suspicious Transactions"><textarea className={`${inputCls} min-h-[70px]`} placeholder="List transaction IDs and amounts..." /></Field>
              <Field label="Supporting Narrative"><textarea className={`${inputCls} min-h-[80px]`} placeholder="Full AML narrative..." /></Field>
              <Field label="Compliance Officer PIN"><input type="password" maxLength={4} className={inputCls} placeholder="••••" /></Field>
            </>}
            {M.type === 'lien' && <>
              <Field label="Lien Amount (NGN)"><input type="number" className={inputCls} placeholder="0.00" /></Field>
              <Field label="Lien Type"><select className={inputCls}><option>Loan Collateral</option><option>Court Order</option><option>EFCC Directive</option><option>Internal Hold</option></select></Field>
              <Field label="Reference / Order Number"><input className={inputCls} placeholder="e.g. COURT/2026/001" /></Field>
              <Field label="Expiry Date"><input type="date" className={inputCls} /></Field>
              <Field label="Supervisor PIN"><input type="password" maxLength={4} className={inputCls} placeholder="••••" /></Field>
            </>}

            {/* FIX 2: newMandate modal — form fields now wired to mInput state */}
            {M.type === 'newMandate' && <>
              <Field label="Beneficiary Name">
                <input className={inputCls} placeholder="Payee name" value={mi('beneficiary')} onChange={(e) => sm('beneficiary', e.target.value)} />
              </Field>
              <Field label="Beneficiary Account Number">
                <input className={inputCls} placeholder="10-digit NUBAN" value={mi('beneficiaryAccount')} onChange={(e) => sm('beneficiaryAccount', e.target.value.replace(/\D/g, '').slice(0, 10))} />
              </Field>
              <Field label="Amount (NGN)">
                <input type="number" className={inputCls} value={mi('amount')} onChange={(e) => sm('amount', e.target.value)} />
              </Field>
              <Field label="Frequency">
                <select className={inputCls} value={mi('frequency')} onChange={(e) => sm('frequency', e.target.value)}>
                  <option value="">Select...</option>
                  <option>Daily</option><option>Weekly</option><option>Monthly</option><option>Quarterly</option><option>Annually</option>
                </select>
              </Field>
              <Field label="Start Date">
                <input type="date" className={inputCls} value={mi('startDate')} onChange={(e) => sm('startDate', e.target.value)} />
              </Field>
              <Field label="End Date (optional)">
                <input type="date" className={inputCls} value={mi('endDate')} onChange={(e) => sm('endDate', e.target.value)} />
              </Field>
              <Field label="Narration">
                <input className={inputCls} placeholder="Payment description" value={mi('narration')} onChange={(e) => sm('narration', e.target.value)} />
              </Field>
            </>}

            {/* FIX 3: addSignatory modal — form fields now wired to mInput state */}
            {M.type === 'addSignatory' && <>
              <Field label="Signatory Full Name">
                <input className={inputCls} placeholder="As on BVN" value={mi('sigName')} onChange={(e) => sm('sigName', e.target.value)} />
              </Field>
              <Field label="BVN (11 digits)">
                <input className={inputCls} placeholder="22234567890" maxLength={11} value={mi('sigBvn')} onChange={(e) => sm('sigBvn', e.target.value.replace(/\D/g, '').slice(0, 11))} />
              </Field>
              <Field label="Signatory Class">
                <select className={inputCls} value={mi('sigClass')} onChange={(e) => sm('sigClass', e.target.value)}>
                  <option value="">Select...</option>
                  <option>Sole Signatory</option><option>Either to Sign</option><option>Both to Sign</option><option>Authorized Signatory</option>
                </select>
              </Field>
              <Field label="Phone Number">
                <input className={inputCls} placeholder="080XXXXXXXX" value={mi('sigPhone')} onChange={(e) => sm('sigPhone', e.target.value.replace(/\D/g, '').slice(0, 11))} />
              </Field>
            </>}

            {M.type === 'sendSMS' && <>
              <div className="bg-slate-50 rounded-xl p-3 text-[10px] font-bold text-slate-600">Recipient: <span className="font-black text-slate-800">{customer.phone}</span></div>
              <Field label="Message Template"><select className={inputCls}><option>Custom Message</option><option>Account Restriction Notice</option><option>Transaction Alert</option><option>KYC Completion Reminder</option></select></Field>
              <Field label="Message Body (max 160 chars)"><textarea className={`${inputCls} min-h-[80px]`} maxLength={160} placeholder="Type message..." value={mi('message')} onChange={(e) => sm('message', e.target.value)} /></Field>
            </>}
            {M.type === 'sendEmail' && <>
              <div className="bg-slate-50 rounded-xl p-3 text-[10px] font-bold text-slate-600">Recipient: <span className="font-black text-slate-800">{customer.email}</span></div>
              <Field label="Subject"><input className={inputCls} placeholder="Email subject" value={mi('subject')} onChange={(e) => sm('subject', e.target.value)} /></Field>
              <Field label="Body"><textarea className={`${inputCls} min-h-[100px]`} placeholder="Email content..." value={mi('message')} onChange={(e) => sm('message', e.target.value)} /></Field>
            </>}
          </div>
          <div className="p-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                const actions = {
                  credit: () => execAction('credit', { amount: mi('amount'), narration: mi('narration'), channel: mi('channel'), detail: `Manual credit ₦${mi('amount')}` }),
                  debit: () => execAction('debit', { amount: mi('amount'), narration: mi('narration'), channel: mi('channel'), detail: `Manual debit ₦${mi('amount')}` }),
                  freeze: () => execAction('freeze', { reason: mi('reason') || 'Internal risk', detail: `Account frozen: ${mi('reason')}` }),
                  unfreeze: () => execAction('unfreeze', { detail: 'Account unfrozen' }),
                  pnd: () => execAction(`pnd_${(mi('pndType') || 'debit').toLowerCase()}`, { detail: 'PND applied' }),
                  modifyLimit: () => execAction('limit_modify', { key: M.limitKey, value: mi('value'), label: M.limitLabel, detail: 'Limit modified' }),
                  newInquiry: () => execAction('add_inquiry', { detail: 'New inquiry logged' }),
                  issueCard: () => showToast('Card issuance request submitted'),
                  tier_upgrade: () => execAction('tier_upgrade', { tier: mi('tier') || 'gold', detail: 'Tier upgraded' }),
                  flag_aml: () => execAction('flag_aml', { detail: 'AML/STR filed' }),
                  lien: () => showToast('Lien placed — balance earmarked'),
                  // FIX 2: newMandate now calls execAction with form data
                  newMandate: () => execAction('add_mandate', {
                    beneficiary:        mi('beneficiary'),
                    beneficiaryAccount: mi('beneficiaryAccount'),
                    amount:             mi('amount'),
                    frequency:          mi('frequency'),
                    startDate:          mi('startDate'),
                    endDate:            mi('endDate'),
                    narration:          mi('narration'),
                    detail:             `New mandate: ${mi('beneficiary')} ${mi('amount')}`,
                  }),
                  // FIX 3: addSignatory now calls execAction with form data
                  addSignatory: () => execAction('add_signatory', {
                    name:           mi('sigName'),
                    bvn:            mi('sigBvn'),
                    signatoryClass: mi('sigClass') || 'Authorized Signatory',
                    phone:          mi('sigPhone'),
                    detail:         `Signatory added: ${mi('sigName')}`,
                  }),
                  sendSMS: () => execAction('send_sms', { message: mi('message'), detail: 'Custom SMS sent to customer' }),
                  sendEmail: () => execAction('send_email', { subject: mi('subject'), message: mi('message'), detail: 'Email sent to customer' }),
                };
                (actions[M.type] || (() => showToast('Action executed')))();
              }}
              className="py-3 bg-teal-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-teal-700 transition-all"
            >
              Confirm & Execute
            </button>
            <button onClick={closeModal} className="py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <CrestlineStaffLayout>
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="flex items-center gap-2 text-[9px] font-black text-slate-500 hover:text-teal-600 uppercase transition-all"><ChevronLeft size={16} />Registry</button>
            <div className="w-px h-5 bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center text-white font-black text-base">{customer.name[0]}</div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900">{customer.name}</span>
                  <Badge color={customer.status === 'Active' ? 'green' : customer.status === 'Frozen' ? 'red' : 'orange'}>{customer.status}</Badge>
                  {customer.pep && <Badge color="orange">PEP</Badge>}
                  {customer.amlFlag && <Badge color="red">AML</Badge>}
                  {customer.pndType && <Badge color="orange">PND</Badge>}
                  {customer.loan?.overdue && <Badge color="red">LOAN OVERDUE</Badge>}
                </div>
                <p className="text-[9px] font-mono text-slate-400">{customer.account} · {customer.tierLabel} · {customer.branch}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase">
            <span className="hidden md:block">Staff Portal</span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          </div>
        </div>

        <div className="flex">
          <div className="w-52 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-57px)] sticky top-[57px] overflow-y-auto">
            <div className="p-3 space-y-0.5">
              {NAV.map((s) => {
                const Icon = s.icon;
                const hasBadge = s.id === 'loan' && customer.loan?.overdue;
                return (
                  <button key={s.id} onClick={() => setActiveSection(s.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-left ${activeSection === s.id ? 'bg-teal-600 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                    <Icon size={13} />
                    {s.label}
                    {hasBadge && (
                      <span className="ml-auto w-2 h-2 bg-red-500 rounded-full shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 p-6 min-w-0">
            <div className="max-w-4xl">{renderSection()}</div>
          </div>
        </div>

        {toast && (
          <div className={`fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-2xl shadow-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2
            ${toast.type === 'success' ? 'bg-emerald-600 text-white' : toast.type === 'warning' ? 'bg-orange-600 text-white' : 'bg-red-600 text-white'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}{toast.msg}
          </div>
        )}

        {modal.open && renderModal()}
      </div>
    </CrestlineStaffLayout>
  );
};

// ─── ROOT ─────────────────────────────────────────────────────────────────
const CrestlineUserManagement = () => {
  const [view, setView] = useState('main');
  const [activeTab, setActiveTab] = useState('lookup');
  const [selectedUser, setSelectedUser] = useState(null);

  if (view === 'console' && selectedUser) {
    return <ManagementConsole user={selectedUser} onBack={() => setView('main')} />;
  }

  return (
    <CrestlineStaffLayout>
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center"><Landmark size={16} className="text-white" /></div>
            <div>
              <p className="text-sm font-black text-slate-900 tracking-tight">CRESTLINE BANK</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Staff Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />Live Session
          </div>
        </div>

        <div className="max-w-5xl mx-auto py-8 px-6 space-y-8">
          <div className="flex justify-center">
            <div className="bg-white border border-slate-200 p-1 rounded-2xl flex gap-1 shadow-sm">
              {[
                { id: 'lookup', label: 'Account Lookup', icon: <Search size={12} /> },
                { id: 'enroll', label: 'Enroll New User', icon: <UserPlus size={12} /> },
              ].map((t) => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-700'}`}>
                  {t.icon}{t.label}
                </button>
              ))}
            </div>
          </div>
          {activeTab === 'lookup'
            ? <AccountLookup onSelectUser={(u) => { setSelectedUser(u); setView('console'); }} />
            : <EnrollUser />
          }
        </div>
      </div>
    </CrestlineStaffLayout>
  );
};

export default CrestlineUserManagement;