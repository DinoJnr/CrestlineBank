import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  CreditCard,
  ShieldCheck,
  Zap,
  ArrowRight,
  Landmark,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CrestlineNavbar from "./CrestlineNavbar";

const AddMoneyPage = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

const user = JSON.parse(localStorage.getItem("user_info"));
const email = user?.email || "";
const userId = user?.id || "";   // ← id not _id
const handleFinalDeposit = async (paystackResponse, depositAmount) => {
  setLoading(true);
  
  // ✅ Get token from localStorage
  const token = localStorage.getItem('crestline_token');

  try {
    const res = await axios.post("http://localhost:5300/user/add", {
      reference: paystackResponse.reference,
      userId,
      amount: depositAmount,
      description: "Wallet Top-Up via Paystack",
    }, {
      headers: {
        Authorization: `Bearer ${token}`  // ✅ Send token here
      }
    });

    if (res.data.success) {
      alert(res.data.message);
      navigate("/user/dashboard");
    }
  } catch (err) {
    console.error("❌ Wallet funding error:", err.response?.data || err.message);
    alert("Payment received but wallet update failed. Keep your ref: " + paystackResponse.reference);
  } finally {
    setLoading(false);
  }
};

  const payNow = () => {
    const parsedAmount = parseFloat(amount);
      console.log("=== PAYSTACK DEBUG ===");
  console.log("email:", email);
  console.log("userId:", userId);
  console.log("amount state:", amount);
  console.log("parsedAmount:", parsedAmount);
  console.log("parsedAmount * 100:", parsedAmount * 100);
  console.log("user from localStorage:", user);
  console.log("=====================");

  if (!parsedAmount || parsedAmount <= 0) {
    console.log("❌ BLOCKED: invalid amount");
    return;
  }
  if (!email) {
    console.log("❌ BLOCKED: no email");
    return;
  }
    if (!parsedAmount || parsedAmount <= 0) return;

    // ✅ Config built HERE so amount/email are fresh at click time
    const config = {
      key: "pk_test_85146938a69f012b0b557560fe071c3bc90073b0",
      email,
      amount: parsedAmount * 100, // ✅ guaranteed valid number
      currency: "NGN",
      ref: "CRST-" + new Date().getTime(),

      callback: function (response) {
        console.log("✅ PAYSTACK CALLBACK FIRED:", response);
        if (response && response.reference) {
          handleFinalDeposit(
            { reference: response.reference, status: response.status },
            parsedAmount, // ✅ pass the clean amount through
          );
        } else {
          console.error("❌ No reference returned");
        }
      },

      onClose: function () {
        console.log("🟠 Paystack closed");
      },
    };

    const handler = window.PaystackPop.setup(config);
    handler.openIframe();
  };
  return (
    <CrestlineNavbar>
      <div className="p-4 md:p-10 max-w-2xl mx-auto min-h-[80vh] flex flex-col justify-center">
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
          >
            <div className="p-2 bg-white/5 rounded-xl group-hover:bg-blue-600 transition-all">
              <ChevronLeft size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">
              Back to Terminal
            </span>
          </button>
          <div className="h-px flex-1 mx-6 bg-white/5" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950 border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
          <div className="relative z-10">
            <header className="mb-10 text-center">
              <div className="inline-flex p-4 bg-blue-600/10 text-blue-500 rounded-3xl mb-4">
                <CreditCard size={32} />
              </div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter">
                Fund Your Vault
              </h1>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">
                Secure Deposit via Paystack
              </p>
            </header>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-2">
                  Enter Amount (NGN)
                </label>
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black italic text-zinc-700 group-focus-within:text-blue-500 transition-colors">
                    ₦
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-[24px] py-6 pl-14 pr-8 text-3xl font-black italic tracking-tighter outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all placeholder:text-zinc-800"
                  />
                </div>
              </div>

              <div className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center gap-5">
                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black italic uppercase tracking-tight">
                    Instant Processing
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    Funds reflect in &lt; 60 seconds
                  </p>
                </div>
              </div>

              <button
                disabled={!amount || parseFloat(amount) <= 0 || loading}
                onClick={payNow}
                className="w-full py-6 bg-white text-black rounded-[24px] font-black italic uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white disabled:opacity-20 disabled:grayscale transition-all shadow-xl shadow-white/5 group"
              >
                {loading ? (
                  "Processing..."
                ) : (
                  <>
                    Initialize Secure Deposit{" "}
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-6 pt-4 opacity-30 grayscale">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} />
                  <span className="text-[8px] font-black uppercase tracking-widest">
                    PCI-DSS Level 1
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Landmark size={14} />
                  <span className="text-[8px] font-black uppercase tracking-widest">
                    NDPR Compliant
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />
        </motion.div>
      </div>
    </CrestlineNavbar>
  );
};

export default AddMoneyPage;
