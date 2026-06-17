import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  ChevronLeft, MessageSquare, Phone, Mail, 
  Globe, ShieldQuestion, Send, CheckCircle2, 
  Clock, Headset, Zap
} from 'lucide-react';
import CrestlineNavbar from './CrestlineNavbar'; 

const CrestlineSupport = () => {
  const [subject, setSubject] = useState('Transaction Dispute');
  const [message, setMessage] = useState('');
  const [formSent, setFormSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const token = localStorage.getItem('crestline_token'); 
      
      await axios.post(
        'http://localhost:5300/user/support/ticket', 
        { subject, message },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setIsLoading(false);
      setFormSent(true);
      setMessage('');
      setTimeout(() => setFormSent(false), 5000);
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(
        error.response?.data?.message || 'Failed to dispatch ticket protocol.'
      );
    }
  };

  return (
    <CrestlineNavbar>
      <div className="p-4 md:p-10 max-w-2xl mx-auto min-h-[90vh] flex flex-col">
        
        <div className="flex justify-between items-center mb-10">
          <button onClick={() => window.history.back()} className="group flex items-center gap-2 text-zinc-600 hover:text-white transition-colors">
            <ChevronLeft size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Return to Base</span>
          </button>
          <h1 className="text-xl font-black italic uppercase tracking-tighter">
            Crestline<span className="text-blue-500">Care</span>
          </h1>
        </div>

        <div className="bg-zinc-950 border border-white/5 rounded-[40px] p-6 mb-8 flex items-center justify-between shadow-2xl overflow-hidden relative">
          <div className="flex items-center gap-4 z-10">
            <div className="relative">
              <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
                <Headset size={24} />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-950 animate-pulse" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-black italic uppercase tracking-tight">Concierge Online</h3>
              <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                <Clock size={10} /> Avg. Response: ~2 Minutes
              </p>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-blue-600/5 to-transparent" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <a href="https://wa.me/2340000000000" className="bg-zinc-950 border border-white/5 p-6 rounded-[32px] flex flex-col items-center gap-3 hover:border-emerald-500/30 transition-all group">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:scale-110 transition-transform">
              <MessageSquare size={20} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">WhatsApp</span>
          </a>
          <a href="tel:+2340000000000" className="bg-zinc-950 border border-white/5 p-6 rounded-[32px] flex flex-col items-center gap-3 hover:border-blue-500/30 transition-all group">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl group-hover:scale-110 transition-transform">
              <Phone size={20} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">Direct Line</span>
          </a>
        </div>

        <div className="bg-zinc-950 border border-white/5 rounded-[40px] p-8 md:p-10 relative">
          <div className="flex items-center gap-2 mb-8 italic">
            <Zap size={14} className="text-blue-500" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Open Priority Ticket</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-1">Inquiry Subject</label>
              <select 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-500 appearance-none text-zinc-300"
              >
                <option value="Transaction Dispute">Transaction Dispute</option>
                <option value="Tier Upgrade Issue">Tier Upgrade Issue</option>
                <option value="Card Management">Card Management</option>
                <option value="Security/Recovery">Security/Recovery</option>
                <option value="Other Feedback">Other Feedback</option>
              </select>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-1">Message Protocol</label>
              <textarea 
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your request in detail..."
                className="w-full bg-black border border-white/5 rounded-3xl py-4 px-6 text-xs font-bold outline-none focus:border-blue-500 resize-none transition-all placeholder:text-zinc-800"
                required
              />
            </div>

            {errorMessage && (
              <div className="text-[10px] font-black uppercase tracking-widest text-red-500 text-center bg-red-500/5 border border-red-500/10 py-3 rounded-xl">
                {errorMessage}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading || formSent}
              className={`w-full py-6 rounded-[28px] font-black italic uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl ${
                formSent ? 'bg-emerald-500 text-black' : 'bg-white text-black hover:bg-blue-600 hover:text-white'
              }`}
            >
              {isLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                  <Zap size={20} />
                </motion.div>
              ) : formSent ? (
                <> <CheckCircle2 size={20} /> Ticket Dispatched </>
              ) : (
                <> Dispatch Ticket <Send size={18} /> </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-12 flex justify-center gap-8 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
          <Globe size={18} className="cursor-pointer hover:text-blue-500" />
          <Mail size={18} className="cursor-pointer hover:text-blue-500" />
          <ShieldQuestion size={18} className="cursor-pointer hover:text-blue-500" />
        </div>
        
        <p className="mt-8 mb-20 text-[7px] font-black uppercase tracking-[0.5em] text-zinc-800 text-center">
          Terminal ID: CS-ALPHA-99-2026
        </p>
      </div>
    </CrestlineNavbar>
  );
};

export default CrestlineSupport;