import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, X, Lock, Loader2 } from 'lucide-react';
import axios from 'axios'; // Added axios for direct modal-to-db logic

const CrestlineTransactionPinModal = ({
  isOpen,
  onClose,
  onConfirm, // This now acts as the final "Success" callback
  title = 'Authorize Transaction',
  subtitle = 'Enter your 4-digit security PIN',
  confirmLabel = 'Confirm',
  isProcessing = false,
  summaryItems = [],
  // NEW PROPS FOR MODEL ROUTING
  transactionType = 'activity', // 'payment' or 'activity'
  payload = {} // Data to be saved (price, cardTier, etc.)
}) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  const processing = isProcessing || loading;
  const filledCount = pin.filter(d => d !== '').length;

  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', '']);
      setError('');
      setLoading(false);
      setShowPin(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 120);
    }
  }, [isOpen]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...pin];
    next[index] = value;
    setPin(next);
    setError('');
    if (value && index < 3) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

const handleConfirm = async () => {
  const fullPin = pin.join('');
  if (fullPin.length < 4) {
    setError('Please complete your 4-digit PIN.');
    return;
  }

  setLoading(true);
  setError('');

  try {
    const token = localStorage.getItem('crestline_token');

    // ✅ Skip verify-pin — go straight to the right endpoint
    const endpoint = transactionType === 'payment'
      ? 'http://localhost:5300/user/save-transaction'
      : 'http://localhost:5300/user/save-activity';

    console.log(`Sending to: ${endpoint} because type is ${transactionType}`);

      const finalRes = await axios.post(
        endpoint,
        { ...payload, authPin: fullPin }, // For activity, payload is {action, details}
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (finalRes.data.success) {
        onConfirm(fullPin);
      }
    } catch (err) {
      // If you hit save-transaction by mistake, it returns 400 "Price missing"
      setError(err.response?.data?.message || 'Authorization Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!processing ? onClose : undefined}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <div className="w-full max-w-sm bg-zinc-950 border border-white/10 rounded-[36px] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-blue-600/20 blur-[80px] rounded-full pointer-events-none" />

              {!processing && (
                <button
                  onClick={onClose}
                  className="absolute top-5 right-5 w-8 h-8 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors"
                >
                  <X size={14} className="text-zinc-400" />
                </button>
              )}

              <div className="relative z-10 space-y-6">
                <div className="text-center space-y-3">
                  <div className="mx-auto w-14 h-14 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center">
                    <Lock size={22} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black italic uppercase tracking-tight text-white">{title}</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">{subtitle}</p>
                  </div>
                </div>

                {summaryItems.length > 0 && (
                  <div className="bg-white/5 border border-white/5 rounded-2xl px-5 py-4 space-y-2">
                    {summaryItems.map(({ label, value, highlight }, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{label}</span>
                        <span className={highlight ? 'text-lg font-black italic text-blue-400' : 'text-[11px] font-black italic uppercase text-zinc-300'}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex gap-3 justify-center">
                    {pin.map((digit, i) => (
                      <div key={i} className="relative">
                        <input
                          ref={el => inputRefs.current[i] = el}
                          type={showPin ? 'text' : 'password'}
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleChange(i, e.target.value)}
                          onKeyDown={e => handleKeyDown(i, e)}
                          disabled={processing}
                          className={`
                            w-14 h-16 text-center text-2xl font-black rounded-2xl outline-none transition-all
                            bg-zinc-900 border-2
                            ${digit ? 'border-blue-500 text-white' : 'border-white/10 text-zinc-600'}
                            ${error ? '!border-red-500/60' : ''}
                            focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
                            disabled:opacity-50
                          `}
                        />
                        {!showPin && digit && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-3 h-3 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowPin(v => !v)}
                    disabled={processing}
                    className="flex items-center gap-1.5 mx-auto text-zinc-600 hover:text-zinc-400 transition-colors disabled:opacity-40"
                  >
                    {showPin ? <EyeOff size={12} /> : <Eye size={12} />}
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      {showPin ? 'Hide PIN' : 'Show PIN'}
                    </span>
                  </button>

                  <AnimatePresence>
                    {error && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="text-center text-[10px] font-bold text-red-400 uppercase tracking-widest"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex gap-1.5 justify-center">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i < filledCount ? 'bg-blue-500 w-6' : 'bg-white/10 w-3'}`} />
                  ))}
                </div>

                <button
                  onClick={handleConfirm}
                  disabled={filledCount < 4 || processing}
                  className="w-full py-5 bg-white text-black rounded-[22px] font-black italic uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all shadow-xl group active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <><Loader2 size={18} className="animate-spin" /> Processing...</>
                  ) : (
                    <>{confirmLabel} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CrestlineTransactionPinModal;