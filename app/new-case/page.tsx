"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Activity, Brain, Wind, Stethoscope, Plus, X, ArrowRight, ArrowLeft, AlertCircle, Clock, Zap, Upload, File, CheckCircle2, Database, Share2, Code } from "lucide-react";
import Link from "next/link";

const CASE_TYPES = [
  { id: "cardiac", label: "Cardiac", icon: Activity, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  { id: "neuro", label: "Neurological", icon: Brain, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/30" },
  { id: "pulmo", label: "Pulmonary", icon: Wind, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/30" },
  { id: "general", label: "General", icon: Stethoscope, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
];

const URGENCIES = [
  { id: "routine", label: "Routine", icon: Clock, color: "text-emerald-400", border: "border-emerald-500/30", activeBg: "bg-emerald-500/20" },
  { id: "urgent", label: "Urgent", icon: Zap, color: "text-amber-400", border: "border-amber-500/30", activeBg: "bg-amber-500/20" },
  { id: "emergency", label: "Emergency", icon: AlertCircle, color: "text-rose-400", border: "border-rose-500/30", activeBg: "bg-rose-500/20" },
];

const FHIR_RESOURCES = [
  { type: "Patient", id: "pt-998-xx", value: "Male, 65y", status: "active" },
  { type: "Observation", id: "d-dimer-001", value: "2.4 mg/L", status: "final" },
  { type: "Observation", id: "troponin-001", value: "Normal", status: "final" },
  { type: "DiagnosticReport", id: "ct-chest-001", value: "Filling defect", status: "final" },
  { type: "Condition", id: "suspected-pe", value: "High probability", status: "active" },
  { type: "MedicationStatement", id: "metformin-001", value: "500mg BID", status: "active" },
];

const FHIR_ROUTING = [
  { resource: "Patient", target: "Risk Agent", icon: AlertCircle },
  { resource: "Observation", target: "Labs Agent", icon: Database },
  { resource: "DiagnosticReport", target: "Imaging Analyzer", icon: Activity },
  { resource: "Condition", target: "Reasoning Engine", icon: Brain },
  { resource: "MedicationStatement", target: "Risk Agent", icon: Stethoscope },
];

const FHIR_TRANSFORMATIONS = [
  { from: "Observation/d-dimer-001", to: "LabSignal", details: "{ type: coagulation, severity: high }" },
  { from: "Observation/troponin-001", to: "CardiacSignal", details: "{ status: normal }" },
  { from: "DiagnosticReport/ct-chest-001", to: "ImagingFinding", details: "{ type: vascular obstruction }" },
];

const SUGGESTED_HISTORY = ["Hypertension", "Diabetes Type 2", "Asthma", "Hyperlipidemia", "Previous MI", "Smoker"];
const SUGGESTED_SYMPTOMS = ["Chest Pain", "Headache", "Shortness of Breath", "Fever", "Dizziness"];

interface Symptom {
  id: string;
  name: string;
  severity: number;
  duration: string;
}

export default function NewCasePage() {
  const router = useRouter();
  
  // Multi-step state
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for prev
  const [error, setError] = useState("");

  // Form Data
  const [caseType, setCaseType] = useState<string | null>(null);
  const [urgency, setUrgency] = useState<string | null>(null);
  
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyInput, setHistoryInput] = useState("");
  const [meds, setMeds] = useState("");

  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [symptomInput, setSymptomInput] = useState("");
  
  const [vitals, setVitals] = useState({ bp: "", hr: "", o2: "", temp: "" });
  const [files, setFiles] = useState<{name: string, type: string, url?: string}[]>([]);
  const [notes, setNotes] = useState("");

  // Step Navigation & Validation
  const nextStep = () => {
    setError("");
    if (step === 1) {
      if (!caseType) return setError("Please select a primary focus.");
      if (!urgency) return setError("Please select an urgency level.");
    }
    if (step === 2) {
      if (!age) return setError("Please enter patient age.");
      if (!gender) return setError("Please select patient gender.");
    }
    if (step === 3) {
      if (symptoms.length === 0) return setError("Please add at least one symptom.");
    }

    setDirection(1);
    setStep(s => s + 1);
  };

  const prevStep = () => {
    setError("");
    setDirection(-1);
    setStep(s => s - 1);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const caseData = {
        patient: { age, gender, history, meds },
        symptoms,
        vitals,
        notes,
        fhirBundle: FHIR_RESOURCES,
        diagnosticReports: files.filter(f => f.type === 'imaging'),
        observations: FHIR_RESOURCES.filter(r => r.type === 'Observation')
      };

      console.log("Calling /api/analyze-case");
      const response = await fetch('/api/analyze-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(caseData)
      });

      const result = await response.json();
      console.log("AI response mode:", result.mode);
      if (result.mode === "simulated-reasoning") {
        console.log("Reasoning mode source:", result.reasoningModeSource);
      }
      
      sessionStorage.setItem('diagora-ai-result', JSON.stringify(result));
      router.push("/debate");
    } catch (err) {
      console.error("Submission error:", err);
      setError("Analysis engine unavailable. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helpers
  const addHistory = (item: string) => {
    if (item.trim() && !history.includes(item.trim())) {
      setHistory([...history, item.trim()]);
    }
    setHistoryInput("");
  };

  const addSymptom = (name: string) => {
    if (name.trim() && !symptoms.find(s => s.name === name.trim())) {
      setSymptoms([...symptoms, { id: Math.random().toString(), name: name.trim(), severity: 5, duration: "" }]);
    }
    setSymptomInput("");
  };

  const updateSymptom = (id: string, key: keyof Symptom, value: any) => {
    setSymptoms(symptoms.map(s => s.id === id ? { ...s, [key]: value } : s));
  };

  const handleFileUpload = (type: string) => {
    // Mock upload
    if (type === 'imaging') {
       setFiles([...files, { name: `CT_Chest_High_Res.png`, type, url: '/ct-scan.png' }]);
    } else {
       setFiles([...files, { name: `Complete_Blood_Count.pdf`, type }]);
    }
  };

  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 40 : -40,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 40 : -40,
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.3 }
    })
  };

  return (
    <div className="min-h-screen bg-[#050711] flex flex-col items-center justify-center p-6 md:p-12 font-sans relative overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.05)_0%,_#050711_80%)] pointer-events-none" />
      <div className="fixed -top-[20%] -right-[10%] w-[70vw] h-[70vw] bg-[radial-gradient(circle_at_center,_rgba(129,140,248,0.03)_0%,_transparent_50%)] rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed -bottom-[20%] -left-[10%] w-[70vw] h-[70vw] bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.02)_0%,_transparent_50%)] rounded-full blur-[100px] pointer-events-none" />

      {/* Top Bar */}
      <div className="absolute top-8 w-full max-w-4xl px-8 flex justify-between items-center z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-white/50 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium tracking-wider uppercase">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="hidden md:flex px-3 py-1 rounded-full bg-white/5 border border-white/10 items-center gap-2 backdrop-blur-md">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_#818cf8]" />
            <span className="text-[10px] font-bold tracking-widest text-indigo-200 uppercase">Clinician Input Mode</span>
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`w-12 h-1 rounded-full transition-colors duration-500 ${step >= i ? 'bg-indigo-500' : 'bg-white/10'}`} />
          ))}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-3xl z-10 mt-12"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
            Clinical Intake
          </h1>
          <p className="text-lg text-white/50 font-light max-w-xl mx-auto">
            {step === 1 && "Establish the primary clinical focus and triage urgency."}
            {step === 2 && "Enter patient demographics and baseline medical history."}
            {step === 3 && "Detail the clinical presentation and objective vitals."}
            {step === 4 && "Provide supporting data for the AI agents to analyze."}
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-[#0A0D20]/80 border border-white/10 rounded-[2rem] p-8 md:p-12 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] min-h-[500px] flex flex-col">
          
          <div className="flex-1 relative">
            <AnimatePresence mode="wait" custom={direction}>
              
              {/* STEP 1: Focus & Urgency */}
              {step === 1 && (
                <motion.div key="step1" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-10">
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold tracking-widest text-white/70 uppercase">
                      Primary Focus
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {CASE_TYPES.map((type) => {
                        const isActive = caseType === type.id;
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.id} type="button" onClick={() => setCaseType(type.id)}
                            className={`relative p-5 rounded-2xl border text-left transition-all duration-300 overflow-hidden group
                              ${isActive ? `${type.bg} ${type.border} shadow-[0_0_30px_rgba(0,0,0,0.2)]` : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'}`}
                          >
                            {isActive && <motion.div layoutId="case-glow" className={`absolute inset-0 ${type.bg} blur-2xl opacity-50`} />}
                            <div className="relative z-10 flex items-center gap-4">
                              <div className={`p-3 rounded-xl ${isActive ? type.bg : 'bg-white/5'} transition-colors`}>
                                <Icon className={`w-6 h-6 ${isActive ? type.color : 'text-white/40 group-hover:text-white/70'}`} />
                              </div>
                              <span className={`font-medium text-lg ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{type.label}</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-semibold tracking-widest text-white/70 uppercase">
                      Triage Urgency
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {URGENCIES.map((u) => {
                        const isActive = urgency === u.id;
                        const Icon = u.icon;
                        return (
                          <button
                            key={u.id} type="button" onClick={() => setUrgency(u.id)}
                            className={`flex-1 flex items-center justify-center gap-3 px-6 py-5 rounded-2xl border transition-all duration-300
                              ${isActive ? `${u.activeBg} ${u.border} ${u.color}` : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:border-white/20 hover:text-white'}`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium tracking-wide text-lg">{u.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Patient Profile */}
              {step === 2 && (
                <motion.div key="step2" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-8">
                  {/* FHIR Integration Badge */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xs font-bold tracking-widest text-white/50 uppercase mb-1">Patient Data Source</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">#PT-998-XX</span>
                        <span className="text-white/30">•</span>
                        <span className="text-white/70 font-light text-sm">Hospital EHR</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                      <span className="text-[10px] font-bold tracking-widest text-emerald-300 uppercase">FHIR Connected</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold tracking-widest text-white/70 uppercase">Age</label>
                      <input 
                        type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Years"
                        className="w-full bg-[#050711]/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all text-xl"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold tracking-widest text-white/70 uppercase">Gender</label>
                      <div className="flex gap-2 h-[60px]">
                        {["M", "F", "Other"].map(g => (
                          <button 
                            key={g} type="button" onClick={() => setGender(g)}
                            className={`flex-1 rounded-xl border transition-all ${gender === g ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-semibold tracking-widest text-white/70 uppercase">Past Medical History</label>
                    <div className="relative">
                      <input 
                        type="text" value={historyInput} onChange={(e) => setHistoryInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addHistory(historyInput)}
                        placeholder="Type condition and press enter..."
                        className="w-full bg-[#050711]/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {history.map(h => (
                        <span key={h} className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-200 text-sm">
                          {h} <button type="button" onClick={() => setHistory(history.filter(i => i !== h))}><X className="w-3 h-3 hover:text-white" /></button>
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {SUGGESTED_HISTORY.filter(h => !history.includes(h)).map(h => (
                        <button key={h} type="button" onClick={() => addHistory(h)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-white/40 hover:text-white/80 text-sm transition-all">
                          + {h}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-semibold tracking-widest text-white/70 uppercase">Current Medications</label>
                    <textarea 
                      value={meds} onChange={(e) => setMeds(e.target.value)} placeholder="List medications and dosages..." rows={2}
                      className="w-full bg-[#050711]/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Presentation */}
              {step === 3 && (
                <motion.div key="step3" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-8">
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold tracking-widest text-white/70 uppercase">Chief Complaints & Symptoms</label>
                    <div className="relative">
                      <input 
                        type="text" value={symptomInput} onChange={(e) => setSymptomInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSymptom(symptomInput)}
                        placeholder="Type a symptom and press Enter..."
                        className="w-full bg-[#050711]/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_SYMPTOMS.filter(s => !symptoms.find(sym => sym.name === s)).map(s => (
                        <button key={s} type="button" onClick={() => addSymptom(s)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-white/40 hover:text-white/80 text-sm transition-all">
                          + {s}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3 mt-4">
                      {symptoms.map(sym => (
                        <motion.div key={sym.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center">
                          <div className="flex-1 flex justify-between w-full">
                            <span className="font-medium text-white text-lg">{sym.name}</span>
                            <button type="button" onClick={() => setSymptoms(symptoms.filter(s => s.id !== sym.id))} className="text-white/30 hover:text-red-400 md:hidden"><X className="w-5 h-5" /></button>
                          </div>
                          
                          <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="flex flex-col gap-1 w-full md:w-32">
                              <span className="text-[10px] text-white/40 uppercase tracking-wider">Severity: {sym.severity}/10</span>
                              <input 
                                type="range" min="1" max="10" value={sym.severity} onChange={(e) => updateSymptom(sym.id, 'severity', parseInt(e.target.value))}
                                className="w-full accent-indigo-500"
                              />
                            </div>
                            <div className="w-full md:w-32">
                              <input 
                                type="text" placeholder="Duration (e.g. 2h)" value={sym.duration} onChange={(e) => updateSymptom(sym.id, 'duration', e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
                              />
                            </div>
                            <button type="button" onClick={() => setSymptoms(symptoms.filter(s => s.id !== sym.id))} className="text-white/30 hover:text-red-400 hidden md:block"><X className="w-5 h-5" /></button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <label className="block text-sm font-semibold tracking-widest text-white/70 uppercase">Vitals (Optional)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
                        <span className="text-xs text-white/40">BP (mmHg)</span>
                        <input type="text" placeholder="120/80" value={vitals.bp} onChange={(e) => setVitals({...vitals, bp: e.target.value})} className="bg-transparent text-white focus:outline-none text-lg w-full" />
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
                        <span className="text-xs text-white/40">HR (bpm)</span>
                        <input type="number" placeholder="72" value={vitals.hr} onChange={(e) => setVitals({...vitals, hr: e.target.value})} className="bg-transparent text-white focus:outline-none text-lg w-full" />
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
                        <span className="text-xs text-white/40">SpO2 (%)</span>
                        <input type="number" placeholder="98" value={vitals.o2} onChange={(e) => setVitals({...vitals, o2: e.target.value})} className="bg-transparent text-white focus:outline-none text-lg w-full" />
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
                        <span className="text-xs text-white/40">Temp (°C)</span>
                        <input type="number" placeholder="37.0" value={vitals.temp} onChange={(e) => setVitals({...vitals, temp: e.target.value})} className="bg-transparent text-white focus:outline-none text-lg w-full" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Data & Uploads */}
              {step === 4 && (
                <motion.div key="step4" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-8">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Labs Upload */}
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold tracking-widest text-white/70 uppercase">Lab Reports</label>
                      <button type="button" onClick={() => handleFileUpload('lab')} className="w-full h-32 border-2 border-dashed border-indigo-500/30 hover:border-indigo-400/60 rounded-[2rem] flex flex-col items-center justify-center gap-3 bg-indigo-500/[0.02] hover:bg-indigo-500/[0.05] transition-all text-indigo-300/50 hover:text-indigo-300 group">
                        <div className="p-3 rounded-full bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors"><Upload className="w-5 h-5" /></div>
                        <span className="text-sm font-medium">Click to Upload PDF</span>
                      </button>
                    </div>
                    {/* Imaging Upload */}
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold tracking-widest text-cyan-500/70 uppercase flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Imaging (DICOM/JPEG)
                      </label>
                      <button type="button" onClick={() => handleFileUpload('imaging')} className="w-full h-32 border-2 border-dashed border-cyan-500/30 hover:border-cyan-400/60 rounded-[2rem] flex flex-col items-center justify-center gap-3 bg-cyan-500/[0.02] hover:bg-cyan-500/[0.05] transition-all text-cyan-300/50 hover:text-cyan-300 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,211,238,0.1)_0%,_transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="p-3 rounded-full bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors relative z-10"><Upload className="w-5 h-5" /></div>
                        <span className="text-sm font-medium relative z-10">Click to Upload Scans</span>
                      </button>
                    </div>
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold tracking-widest text-white/70 uppercase flex items-center gap-2">
                        Attached Files <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-bold">{files.length}</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {files.map((f, i) => (
                          <motion.div initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}} key={i} className="flex items-center gap-4 bg-[#0A0D20]/50 border border-white/10 rounded-2xl p-4 relative overflow-hidden group hover:border-white/20 transition-colors">
                            {f.url ? (
                              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 relative bg-black">
                                 <img src={f.url} alt={f.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shrink-0 flex items-center justify-center">
                                <File className="w-6 h-6 text-indigo-400" />
                              </div>
                            )}
                            <div className="flex flex-col truncate pr-6">
                              <span className="text-sm font-semibold text-white/90 truncate">{f.name}</span>
                              <span className="text-xs text-white/40 uppercase tracking-wider mt-0.5">{f.type === 'imaging' ? 'DICOM / JPEG' : 'Lab Report'}</span>
                            </div>
                            <button type="button" onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="absolute top-1/2 -translate-y-1/2 right-3 p-1.5 rounded-lg bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/20 hover:text-rose-400 text-rose-500/50">
                               <X className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <label className="block text-sm font-semibold tracking-widest text-white/70 uppercase">Clinical Notes & Instructions</label>
                    <textarea 
                      value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any specific context or instructions for the AI agents..." rows={3}
                      className="w-full bg-[#050711]/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-6 pt-8 border-t border-white/10">
                    <div className="flex items-center justify-between">
                       <h2 className="text-sm font-bold tracking-[0.2em] text-indigo-400 uppercase flex items-center gap-3">
                         <Database className="w-4 h-4" /> FHIR Interoperability Layer
                       </h2>
                       <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">FHIR Bundle Parsed</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* FHIR Bundle Card */}
                      <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl">
                        <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <Share2 className="w-3 h-3" /> FHIR Bundle Imported
                        </h3>
                        <div className="space-y-2">
                          {FHIR_RESOURCES.map((res, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 group hover:border-indigo-500/30 transition-all">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-indigo-300">{res.type}/{res.id}</span>
                                <span className="text-[9px] text-white/40 uppercase tracking-tighter">Value: {res.value}</span>
                              </div>
                              <span className="text-[8px] font-bold text-emerald-400/70 border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase tracking-widest">{res.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Data Routing Card */}
                      <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl">
                        <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <Code className="w-3 h-3" /> FHIR Data Routing
                        </h3>
                        <div className="space-y-2">
                          {FHIR_ROUTING.map((route, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-black/20 border border-white/5">
                              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-indigo-300">
                                <route.icon className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-white/80">{route.resource} Resource</span>
                                <span className="text-[9px] text-indigo-400 uppercase tracking-widest">→ Routed to {route.target}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5">
                           <p className="text-[9px] text-white/30 italic uppercase tracking-wider text-center">Agent Context Generated from FHIR Payload</p>
                        </div>
                      </div>
                    </div>

                    {/* Transformation Panel */}
                    <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-[2rem] p-6 backdrop-blur-xl">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                           <Zap className="w-3 h-3" /> FHIR → Agent Context Transformation
                        </h3>
                        <span className="text-[8px] font-mono text-white/40">Technical Schema: AGENT_SIGNAL_V1</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {FHIR_TRANSFORMATIONS.map((trans, i) => (
                          <div key={i} className="bg-black/30 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 relative group overflow-hidden">
                             <div className="absolute top-0 right-0 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                               <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                             </div>
                             <span className="text-[9px] font-mono text-white/40">{trans.from}</span>
                             <div className="flex items-center gap-2">
                               <ArrowRight className="w-3 h-3 text-indigo-400" />
                               <span className="text-[10px] font-bold text-white tracking-widest uppercase">{trans.to}</span>
                             </div>
                             <code className="text-[8px] text-indigo-300/70 bg-indigo-500/5 px-2 py-1 rounded border border-indigo-500/10 font-mono mt-1">{trans.details}</code>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 pt-4 border-t border-white/5 flex justify-center">
                         <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">FHIR → Structured Clinical Signals → Multi-Agent Reasoning</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-center gap-3 text-red-200"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-10 pt-6 border-t border-white/10 flex justify-between items-center">
            <button
              type="button"
              onClick={prevStep}
              className={`px-6 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors flex items-center gap-2 ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-8 py-3 bg-white text-black rounded-xl font-semibold hover:bg-white/90 transition-colors flex items-center gap-2"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(99, 102, 241, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-8 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-400 transition-colors flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Start AI Analysis <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            )}
          </div>

        </div>
      </motion.div>
    </div>
  );
}
