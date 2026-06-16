// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { 
//   ChevronLeft, MessageSquare, Mail, Phone, 
//   Send, ShieldCheck, Globe, Clock, 
//   ArrowRight, CheckCircle2, Headphones,
//   ExternalLink, Twitter, Instagram
// } from "lucide-react";

// // --- Navbar Wrapper ---
// import CrestlineNavbar from "./CrestlineNavbar";

// const CrestlineContact = () => {
//   const [formData, setFormData] = useState({ subject: "", message: "" });
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);

//   const contactMethods = [
//     { id: 'whatsapp', name: 'Priority WhatsApp', value: '+234 800 CREST', icon: <MessageSquare size={20} />, color: 'text-emerald-500', link: 'https://wa.me/#' },
//     { id: 'email', name: 'Concierge Email', value: 'wealth@crestline.com', icon: <Mail size={20} />, color: 'text-blue-500', link: 'mailto:wealth@crestline.com' },
//     { id: 'call', name: '24/7 Hotline', value: '0800-CAPITAL', icon: <Phone size={20} />, color: 'text-purple-500', link: 'tel:#' },
//   ];

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setIsProcessing(true);
//     // Simulate API call
//     setTimeout(() => {
//       setIsProcessing(false);
//       setIsSuccess(true);
//       setFormData({ subject: "", message: "" });
//       setTimeout(() => setIsSuccess(false), 3000);
//     }, 2000);
//   };

//   return (
//     <CrestlineNavbar>
//       <div className="p-4 md:p-10 max-w-2xl mx-auto min-h-[90vh] flex flex-col text-left">
        
//         {/* SUCCESS NOTIFICATION */}
//         <AnimatePresence>
//           {isSuccess && (
//             <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
//               className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-white text-black px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl"
//             >
//               <CheckCircle2 size={18} className="text-emerald-500" />
//               <span className="text-[11px] font-black uppercase tracking-widest italic">Message Vaulted Successfully</span>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* BRANDED HEADER */}
//         <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
//           <div>
//             <button onClick={() => window.history.back()} className="group flex items-center gap-2 text-zinc-600 hover:text-white transition-colors mb-4 text-white">
//               <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-zinc-600 transition-all">
//                 <ChevronLeft size={14} />
//               </div>
//               <span className="text-[10px] font-black uppercase tracking-widest italic text-zinc-400">Back to Terminal</span>
//             </button>
//             <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">
//               Crestline<span className="text-zinc-500">Concierge</span>
//             </h1>
//           </div>
//           <div className="flex items-center gap-2 bg-zinc-900 border border-white/5 px-4 py-2 rounded-2xl text-emerald-500">
//             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
//             <span className="text-[9px] font-black uppercase tracking-widest">Support Online</span>
//           </div>
//         </div>

//         <div className="space-y-6">
//           {/* SUPPORT ASSET LIST */}
//           <div className="grid grid-cols-1 gap-3">
//             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic px-2">Communication Assets</h3>
//             {contactMethods.map((method) => (
//               <a key={method.id} href={method.link} target="_blank" rel="noreferrer"
//                 className="bg-zinc-900/40 border border-white/5 p-5 rounded-[28px] flex items-center justify-between hover:border-white/20 transition-all group"
//               >
//                 <div className="flex items-center gap-4">
//                   <div className={`p-3 bg-black/40 rounded-2xl ${method.color}`}>{method.icon}</div>
//                   <div>
//                     <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{method.name}</h4>
//                     <p className="text-sm font-black italic text-white uppercase">{method.value}</p>
//                   </div>
//                 </div>
//                 <div className="text-zinc-700 group-hover:text-white transition-colors">
//                   <ExternalLink size={18} />
//                 </div>
//               </a>
//             ))}
//           </div>

//           {/* MESSAGE VAULT (FORM) */}
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }} 
//             animate={{ opacity: 1, y: 0 }}
//             className="bg-zinc-950 border border-white/10 rounded-[40px] p-8 relative overflow-hidden shadow-2xl"
//           >
//             <div className="relative z-10 space-y-6">
//               <div className="flex items-center gap-3 mb-2">
//                 <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
//                   <Headphones size={20} />
//                 </div>
//                 <h3 className="text-sm font-black uppercase italic text-white tracking-widest">Secure Inquiry</h3>
//               </div>

//               <div className="space-y-4">
//                 <div className="space-y-2 text-left">
//                   <label className="text-[9px] font-black uppercase text-zinc-500 ml-2 tracking-widest">Subject</label>
//                   <input 
//                     type="text" 
//                     value={formData.subject}
//                     onChange={(e) => setFormData({...formData, subject: e.target.value})}
//                     placeholder="e.g. Investment Liquidation"
//                     className="w-full bg-zinc-900 border border-white/5 rounded-2xl p-4 text-[12px] font-bold text-white outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-700"
//                   />
//                 </div>

//                 <div className="space-y-2 text-left">
//                   <label className="text-[9px] font-black uppercase text-zinc-500 ml-2 tracking-widest">Message Details</label>
//                   <textarea 
//                     rows="4"
//                     value={formData.message}
//                     onChange={(e) => setFormData({...formData, message: e.target.value})}
//                     placeholder="Briefly describe your request..."
//                     className="w-full bg-zinc-900 border border-white/5 rounded-[28px] p-5 text-[12px] font-bold text-white outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-700 resize-none"
//                   />
//                 </div>
//               </div>

//               <button 
//                 onClick={handleSubmit}
//                 disabled={!formData.message || isProcessing}
//                 className="w-full py-6 bg-white text-black rounded-[28px] font-black italic uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-10"
//               >
//                 {isProcessing ? "Transmitting..." : "Send Secure Message"}
//                 {!isProcessing && <Send size={18} />}
//               </button>
//             </div>
//             {/* Background Glow */}
//             <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-zinc-800/20 blur-[100px] rounded-full" />
//           </motion.div>

//           {/* SOCIAL TERMINAL */}
//           <div className="flex justify-center gap-4 py-4">
//             {[<Twitter size={18}/>, <Instagram size={18}/>, <Globe size={18}/>].map((icon, i) => (
//               <button key={i} className="p-4 bg-zinc-900 border border-white/5 rounded-2xl text-zinc-500 hover:text-white hover:border-white/20 transition-all">
//                 {icon}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* COMPLIANCE FOOTER */}
//         <div className="mt-8 flex items-center justify-center gap-6 opacity-20 text-white">
//           <div className="flex items-center gap-2">
//             <ShieldCheck size={14} />
//             <span className="text-[8px] font-black uppercase tracking-widest">End-to-End Encrypted</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <Clock size={14} />
//             <span className="text-[8px] font-black uppercase tracking-widest">Response Avg: 15m</span>
//           </div>
//         </div>
//       </div>
//     </CrestlineNavbar>
//   );
// };

// export default CrestlineContact;