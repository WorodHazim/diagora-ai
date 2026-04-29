"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ArrowLeft, HeartPulse, Stethoscope, AlertTriangle, CheckCircle2, ChevronRight, Check } from "lucide-react";
import Link from "next/link";

type Status = "idle" | "analyzing" | "complete";
type SymptomStatus = "Improved" | "Same" | "Worse" | null;

export default function FollowUpPage() {
  const [symptomStatus, setSymptomStatus] = useState<SymptomStatus>(null);
  const [newSymptoms, setNewSymptoms] = useState("");
  const [medicationTaken, setMedicationTaken] = useState<boolean | null>(null);
  const [notes, setNotes] = useState("");
  const [vitals, setVitals] = useState({ bp: "", hr: "", spo2: "", temp: "" });
  
  const [status, setStatus] = useState<Status>("idle");

  const [timeline, setTimeline] = useState([
    { title: "Initial Decision", subtitle: "High Risk — Pulmonary Embolism", time: "2 days ago", type: "high" },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomStatus) return;
    
    setStatus("analyzing");
    
    setTimeout(() => {
      setStatus("complete");
      
      let timelineType = "neutral";
      let timelineSubtitle = "";
      
      if (symptomStatus === "Improved") {
        timelineSubtitle = "Risk trending down";
        timelineType = "good";
      } else if (symptomStatus === "Same") {
        timelineSubtitle = "Risk unchanged";
        timelineType = "warning";
      } else {
        timelineSubtitle = "Risk increased";
        timelineType = "high";
      }
      
      setTimeline(prev => [...prev, {
        title: `Follow-up ${prev.length}`,
        subtitle: timelineSubtitle,
        time: "Just now",
        type: timelineType
      }]);
      
    }, 1500);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#050711] overflow-x-hidden font-sans pb-24">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.03)_0%,_#050711_80%)] pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-[radial-gradient(circle_at_center,_rgba(129,140,248,0.05)_0%,_transparent_50%)] rounded-full blur-[100px] pointer-events-none" />

      {/* Navbar */}
      <div className="absolute top-8 w-full px-8 flex justify-between items-center z-50">
        <Link href="/debate" className="text-white/50 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium tracking-wider uppercase">
          <ArrowLeft className="w-4 h-4" /> Back to Report
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto pt-32 px-4 sm:px-8">
        
        <div className="flex flex-col items-center justify-center gap-4 mb-16">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_10px_#818cf8]" />
            <span className="text-xs font-bold tracking-[0.2em] text-indigo-300 uppercase">Active Monitoring</span>
          </motion.div>
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-semibold tracking-tight text-white text-center">
            Patient Follow-up Assessment
          </motion.h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Form & Result */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            <AnimatePresence mode="wait">
              {status === "idle" && (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  onSubmit={handleSubmit}
                  className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 md:p-10 backdrop-blur-md flex flex-col gap-8"
                >
                  {/* Symptom Status */}
                  <div>
                    <label className="block text-sm font-bold tracking-[0.2em] text-white/50 uppercase mb-4">Overall Symptom Status *</label>
                    <div className="grid grid-cols-3 gap-4">
                      {["Improved", "Same", "Worse"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSymptomStatus(opt as SymptomStatus)}
                          className={`py-4 rounded-2xl border transition-all text-sm font-bold tracking-widest uppercase ${
                            symptomStatus === opt 
                              ? opt === "Improved" ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                              : opt === "Same" ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                              : "bg-orange-500/20 border-orange-500/50 text-orange-300"
                              : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* New Symptoms */}
                  <div>
                    <label className="block text-sm font-bold tracking-[0.2em] text-white/50 uppercase mb-4">New Symptoms</label>
                    <textarea 
                      value={newSymptoms}
                      onChange={(e) => setNewSymptoms(e.target.value)}
                      placeholder="e.g., Dizziness, swelling in legs..."
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-colors min-h-[100px] resize-none"
                    />
                  </div>

                  {/* Medication */}
                  <div>
                    <label className="block text-sm font-bold tracking-[0.2em] text-white/50 uppercase mb-4">Medication Taken As Prescribed?</label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setMedicationTaken(true)}
                        className={`flex-1 py-3 rounded-xl border transition-all text-sm font-bold tracking-widest uppercase ${
                          medicationTaken === true ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setMedicationTaken(false)}
                        className={`flex-1 py-3 rounded-xl border transition-all text-sm font-bold tracking-widest uppercase ${
                          medicationTaken === false ? "bg-rose-500/20 border-rose-500/50 text-rose-300" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {/* Vitals */}
                  <div>
                    <label className="block text-sm font-bold tracking-[0.2em] text-white/50 uppercase mb-4">Vitals (Optional)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-xs text-white/30 ml-2 mb-1 block">BP (mmHg)</span>
                        <input value={vitals.bp} onChange={e => setVitals({...vitals, bp: e.target.value})} placeholder="120/80" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 text-center" />
                      </div>
                      <div>
                        <span className="text-xs text-white/30 ml-2 mb-1 block">HR (bpm)</span>
                        <input value={vitals.hr} onChange={e => setVitals({...vitals, hr: e.target.value})} placeholder="80" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 text-center" />
                      </div>
                      <div>
                        <span className="text-xs text-white/30 ml-2 mb-1 block">SpO2 (%)</span>
                        <input value={vitals.spo2} onChange={e => setVitals({...vitals, spo2: e.target.value})} placeholder="98" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 text-center" />
                      </div>
                      <div>
                        <span className="text-xs text-white/30 ml-2 mb-1 block">Temp (°C)</span>
                        <input value={vitals.temp} onChange={e => setVitals({...vitals, temp: e.target.value})} placeholder="37.0" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 text-center" />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-bold tracking-[0.2em] text-white/50 uppercase mb-4">Free Text Notes</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional clinical context..."
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-colors min-h-[100px] resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button 
                    disabled={!symptomStatus}
                    type="submit" 
                    className="w-full py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-white/20 disabled:cursor-not-allowed text-white font-bold tracking-widest uppercase text-sm transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] mt-4"
                  >
                    Re-analyze Case
                  </button>
                </motion.form>
              )}

              {status === "analyzing" && (
                <motion.div 
                  key="analyzing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-16 backdrop-blur-md flex flex-col items-center justify-center min-h-[500px]"
                >
                  <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                    <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full animate-[spin_3s_linear_infinite]" />
                    <div className="absolute inset-2 border-2 border-fuchsia-500/30 rounded-full animate-[spin_2s_linear_infinite_reverse]" />
                    <div className="absolute inset-4 border-2 border-cyan-500/40 rounded-full animate-[spin_1.5s_linear_infinite]" />
                    <Activity className="w-8 h-8 text-indigo-400 animate-pulse" />
                  </div>
                  <h2 className="text-xl font-bold tracking-[0.2em] text-indigo-300 uppercase mb-4 text-center">Re-analyzing patient condition...</h2>
                  <p className="text-white/50 font-light text-center">Cross-referencing new symptoms and vitals against initial baseline.</p>
                </motion.div>
              )}

              {status === "complete" && (
                <motion.div 
                  key="complete"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-8"
                >
                  {symptomStatus === "Improved" && (
                    <div className="bg-teal-500/10 border border-teal-500/30 rounded-[2rem] p-10 backdrop-blur-md relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 blur-[60px] rounded-full pointer-events-none" />
                      <div className="flex gap-4 items-start relative z-10">
                        <div className="p-3 rounded-full bg-teal-500/20 shrink-0 mt-1"><CheckCircle2 className="w-6 h-6 text-teal-400" /></div>
                        <div>
                          <h2 className="text-sm font-bold tracking-[0.2em] text-teal-300 uppercase mb-3">Condition Improving</h2>
                          <h1 className="text-3xl font-semibold text-white tracking-tight leading-snug mb-4">Continue monitoring and follow clinician guidance.</h1>
                          <p className="text-white/70 font-light leading-relaxed">Risk trending down</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {symptomStatus === "Same" && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-[2rem] p-10 backdrop-blur-md relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none" />
                      <div className="flex gap-4 items-start relative z-10">
                        <div className="p-3 rounded-full bg-amber-500/20 shrink-0 mt-1"><Stethoscope className="w-6 h-6 text-amber-400" /></div>
                        <div>
                          <h2 className="text-sm font-bold tracking-[0.2em] text-amber-300 uppercase mb-3">No Significant Improvement</h2>
                          <h1 className="text-3xl font-semibold text-white tracking-tight leading-snug mb-4">Clinical review is recommended.</h1>
                          <p className="text-white/70 font-light leading-relaxed">Risk unchanged</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {symptomStatus === "Worse" && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-[2rem] p-10 backdrop-blur-md relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.15)]">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[60px] rounded-full pointer-events-none" />
                      <div className="flex gap-4 items-start relative z-10">
                        <div className="p-3 rounded-full bg-red-500/20 shrink-0 mt-1"><AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" /></div>
                        <div>
                          <h2 className="text-sm font-bold tracking-[0.2em] text-red-300 uppercase mb-3">Condition Worsening</h2>
                          <h1 className="text-3xl font-semibold text-white tracking-tight leading-snug mb-4">Seek emergency medical care immediately.</h1>
                          <p className="text-white/70 font-light leading-relaxed">Risk increased</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 justify-center mt-4">
                    <Link href="/debate" className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold tracking-widest uppercase text-xs transition-all">
                      Back to Report
                    </Link>
                    <button onClick={() => {setStatus("idle"); setSymptomStatus(null);}} className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-widest uppercase text-xs transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                      Add Another Follow-up
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN: Timeline */}
          <div className="lg:col-span-4">
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 backdrop-blur-md sticky top-32">
              <h2 className="text-sm font-bold tracking-[0.2em] text-white/50 uppercase mb-8">Case Timeline</h2>
              
              <div className="relative border-l border-white/10 ml-4 space-y-8 pb-4">
                {timeline.map((node, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={idx} 
                    className="relative pl-8"
                  >
                    {/* Node Dot */}
                    <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${
                      node.type === "high" ? "bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]" 
                      : node.type === "warning" ? "bg-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                      : node.type === "good" ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                      : "bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]"
                    }`} />
                    
                    <p className="text-xs font-bold text-white/40 tracking-widest uppercase mb-1">{node.time}</p>
                    <p className="text-white font-medium mb-1">{node.title}</p>
                    <p className={`text-sm font-light ${
                      node.type === "high" ? "text-rose-300" 
                      : node.type === "warning" ? "text-orange-300"
                      : node.type === "good" ? "text-emerald-300"
                      : "text-white/60"
                    }`}>
                      {node.subtitle}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

        </div>

        <div className="mt-24 text-center pb-12">
          <p className="text-xs font-medium text-white/30 tracking-widest uppercase">Clinical decision support only. Diagora does not replace licensed medical professionals. In emergencies, seek immediate medical care.</p>
        </div>

      </div>
    </div>
  );
}
