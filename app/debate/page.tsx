"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Brain, FlaskConical, ShieldAlert, Wind, ArrowLeft, ArrowRight, AlertTriangle, ChevronRight, Check, ImageIcon, FileText, Play, Square, Info, History, Database, Lock, ShieldCheck, CheckCircle2, Code, Share2, X, Clock, Zap, AlertCircle, PlayCircle, Quote } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ScanViewerModal } from "@/components/ui/ScanViewerModal";

const AGENTS = [
  { id: "cardio", name: "Cardiologist", icon: Activity, color: "#60A5FA", angle: -90 },
  { id: "pulmo", name: "Pulmonologist", icon: Wind, color: "#818CF8", angle: -18 },
  { id: "labs", name: "Labs Agent", icon: FlaskConical, color: "#C4B5FD", angle: 54 },
  { id: "imaging", name: "Imaging Analyzer", icon: ImageIcon, color: "#A5B4FC", angle: 126 },
  { id: "risk", name: "Risk Analyst", icon: ShieldAlert, color: "#F97316", angle: 198, isAlert: true },
];

const MESSAGES = [
  { id: 1, isSystem: true, phase: 0, text: "FHIR Bundle Parsed. Analyzing DiagnosticReport/ct-chest-001. Extracting structural and vascular data...", fhir: { resource: "DiagnosticReport/ct-chest-001", status: "final" } },
  { id: 2, agentId: "cardio", phase: 0, text: "Initial Hypothesis based on Symptoms & Age: ACS Likely. Referencing Patient/pt-998-xx context for cardiac risk factors.", fhir: { resource: "Condition/suspected-acs", status: "preliminary" } },
  { id: 3, agentId: "pulmo", phase: 1, text: "CHALLENGE: Based on DiagnosticReport/ct-chest-001 findings of 'suspicious filling defect', Pulmonary Embolism is now the prioritized hypothesis. Sudden onset dyspnea exceeds ACS probability.", isConflict: true, evidence: { type: 'imaging', title: 'CT Chest - AI Highlighted', url: '/ct-scan.png', hasHighlight: true, highlightLabel: 'Thrombus Detected' }, fhir: { resource: "DiagnosticReport/ct-chest-001", status: "final" } },
  { id: 4, agentId: "labs", phase: 2, text: "CRITICAL EVIDENCE from FHIR Observation/d-dimer-001: Value 2.4 mg/L (HIGH). Observation/troponin-001 is Normal. Supporting PE over ACS.", evidence: { type: 'document', title: 'Comprehensive Metabolic Panel', url: '/lab-report.png' }, fhir: { resource: "Observation/d-dimer-001", status: "final" } },
  { id: 5, agentId: "risk", phase: 3, text: "Risk Assessment Escalation: Referencing Observation/d-dimer-001 and Condition/suspected-pe. Patient risk level escalated to CRITICAL based on thrombotic load.", fhir: { resource: "Condition/suspected-pe", status: "active" } },
  { id: 6, agentId: "cardio", phase: 4, text: "CONCESSION: Overruled by FHIR-backed evidence (Observation/d-dimer-001 & CT-Chest). ACS ruled out. Applying MedicationStatement/heparin-001 protocol.", fhir: { resource: "MedicationStatement/heparin-001", status: "ordered" } },
];

const FHIR_PROCESSING_TIMELINE = [
  { label: "FHIR Bundle Parsed", status: "complete", time: "T+0.0s" },
  { label: "Data Normalized into Agent Signals", status: "complete", time: "T+0.2s" },
  { label: "Agents Generate Hypotheses", status: "complete", time: "T+0.5s" },
  { label: "Conflict Detected (ACS vs PE)", status: "complete", time: "T+1.2s" },
  { label: "Evidence Cross-Checked (FHIR-backed)", status: "active", time: "T+2.5s" },
  { label: "Final Diagnosis Justified (FHIR-backed)", status: "pending", time: "T+5.0s" },
];

const FHIR_RESOURCES = [
  { type: "Patient", id: "pt-998-xx", value: "Male, 65y", status: "active", json: { resourceType: "Patient", id: "pt-998-xx", gender: "male", age: 65, condition: "Acute Respiratory Distress" } },
  { type: "Observation", id: "d-dimer-001", value: "2.4 mg/L", status: "final", json: { resourceType: "Observation", id: "d-dimer-001", code: "D-dimer", valueQuantity: { value: 2.4, unit: "mg/L" }, status: "final", category: "laboratory" } },
  { type: "Observation", id: "troponin-001", value: "Normal", status: "final", json: { resourceType: "Observation", id: "troponin-001", code: "Troponin", valueString: "Normal", status: "final", category: "laboratory" } },
  { type: "DiagnosticReport", id: "ct-chest-001", value: "Filling defect", status: "final", json: { resourceType: "DiagnosticReport", id: "ct-chest-001", conclusion: "Suspicious pulmonary artery filling defect", status: "final", code: "CT Chest" } },
  { type: "Condition", id: "suspected-pe", value: "High probability", status: "confirmed", json: { resourceType: "Condition", id: "suspected-pe", clinicalStatus: "active", verificationStatus: "confirmed", code: { text: "Pulmonary Embolism" } } },
  { type: "MedicationStatement", id: "metformin-001", value: "500mg BID", status: "active", json: { resourceType: "MedicationStatement", id: "metformin-001", status: "active", medicationCodeableConcept: { text: "Metformin" } } },
];

const FHIR_TRANSFORMATIONS_DETAILED = [
  { resource: "Observation/d-dimer-001", raw: "2.4 mg/L", signal: "LabSignal", details: "{ type: 'coagulation', severity: 'high', supports: 'PE' }" },
  { resource: "Observation/troponin-001", raw: "Normal", signal: "CardiacSignal", details: "{ status: 'normal', weakens: 'ACS' }" },
  { resource: "DiagnosticReport/ct-chest-001", raw: "Suspicious filling defect", signal: "ImagingFinding", details: "{ type: 'vascular obstruction', supports: 'PE' }" },
  { resource: "MedicationStatement/metformin-001", raw: "500mg BID", signal: "MedicationContext", details: "{ diabetesMedication: true, riskReview: true }" },
];

const MCP_EXECUTION_TRACE = [
  { id: 1, input: "DiagnosticReport/ct-chest-001", tool: "Imaging Analyzer", output: "Pulmonary artery filling defect detected", agent: "Imaging", time: "T+0.8s", status: "completed" },
  { id: 2, input: "Observation/d-dimer-001", tool: "Lab Interpreter", output: "D-dimer 2.4 mg/L interpreted as HIGH", agent: "Labs + Risk", time: "T+1.4s", status: "completed" },
  { id: 3, input: "Patient context + Condition/suspected-pe", tool: "Risk Engine", output: "High-risk PE escalation", agent: "Risk Analyst", time: "T+2.1s", status: "completed" },
  { id: 4, input: "All agent messages + clinical signals", tool: "Reasoning Engine", output: "Consensus shifted from ACS to PE", agent: "All Agents", time: "T+4.2s", status: "completed" },
];

const SOURCE_TRACES: Record<string, any> = {
  "D-dimer 2.4 mg/L": { source: "FHIR Observation/d-dimer-001", type: "Observation", raw: "2.4 mg/L", interpretation: "CRITICAL HIGH (Thrombosis risk)", usedBy: "Labs Agent → Pulmonology → Risk Analyst", impact: "↑ Pulmonary Embolism likelihood" },
  "Troponin normal": { source: "FHIR Observation/troponin-001", type: "Observation", raw: "Normal", interpretation: "Cardiac markers normal", usedBy: "Cardiology Agent → Reasoning Engine", impact: "↓ ACS likelihood" },
  "filling defect": { source: "FHIR DiagnosticReport/ct-chest-001", type: "DiagnosticReport", raw: "Suspicious filling defect", interpretation: "Vascular obstruction", usedBy: "Imaging Analyzer → Pulmonology", impact: "Primary hypothesis shift: PE → ACS" },
  "CT filling defect": { source: "FHIR DiagnosticReport/ct-chest-001", type: "DiagnosticReport", raw: "Suspicious filling defect", interpretation: "Vascular obstruction", usedBy: "Imaging Analyzer → Pulmonology", impact: "Primary hypothesis shift: PE → ACS" },
  "PE risk": { source: "FHIR Condition/suspected-pe", type: "Condition", raw: "High probability", interpretation: "Critical escalation", usedBy: "Risk Analyst → All Agents", impact: "Escalated to High Urgency" },
  "Metformin": { source: "FHIR MedicationStatement/metformin-001", type: "MedicationStatement", raw: "500mg BID", interpretation: "Diabetes management context", usedBy: "Risk Agent", impact: "Monitoring for lactic acidosis risk" },
  "ACS": { source: "FHIR Condition/suspected-acs", type: "Condition", raw: "Preliminary", interpretation: "Downgraded based on Labs/Imaging", usedBy: "Cardiology Agent → Pulmonology Agent", impact: "Secondary Differential" },
  "Pulmonary Embolism": { source: "FHIR Condition/suspected-pe", type: "Condition", raw: "High Probability", interpretation: "Structural Obstruction", usedBy: "All Agents", impact: "Primary Diagnosis Confirmed" },
};

const CLINICAL_HYPOTHESES_EVOLUTION: Record<number, any> = {
  0: {
    hypotheses: [
      { name: "Acute Coronary Syndrome", probability: 0.45, confidence_level: "medium", supporting_evidence: ["Chest pain", "Age (65y)"], contradicting_evidence: [], reasoning: "ACS is a high-priority differential given clinical presentation." },
      { name: "Pulmonary Embolism", probability: 0.35, confidence_level: "low", supporting_evidence: ["Dyspnea"], contradicting_evidence: [], reasoning: "PE considered due to sudden onset of shortness of breath." },
      { name: "Pneumonia", probability: 0.20, confidence_level: "low", supporting_evidence: [], contradicting_evidence: [], reasoning: "Baseline differential for respiratory distress." }
    ],
    update_summary: "Initial assessment based on presentation and history."
  },
  2: {
    hypotheses: [
      { name: "Pulmonary Embolism", probability: 0.65, confidence_level: "medium", supporting_evidence: ["CT filling defect", "Sudden dyspnea"], contradicting_evidence: [], reasoning: "Imaging findings strongly favor PE over other causes." },
      { name: "Acute Coronary Syndrome", probability: 0.25, confidence_level: "low", supporting_evidence: ["Chest pain"], contradicting_evidence: ["Imaging suggests PE"], reasoning: "ACS probability decreased as imaging points toward vascular obstruction." },
      { name: "Pneumonia", probability: 0.10, confidence_level: "low", supporting_evidence: [], contradicting_evidence: ["Imaging inconsistent"], reasoning: "Infection less likely given imaging results." }
    ],
    update_summary: "Imaging evidence triggered significant shift toward PE.",
    confidence_shift: { from: "ACS", to: "Pulmonary Embolism", trigger: "CT imaging evidence" }
  },
  3: {
    hypotheses: [
      { name: "Pulmonary Embolism", probability: 0.85, confidence_level: "high", supporting_evidence: ["Elevated D-dimer (2.4)", "CT filling defect"], contradicting_evidence: ["Normal troponin"], reasoning: "Combination of high D-dimer and CT findings is pathognomonic." },
      { name: "Acute Coronary Syndrome", probability: 0.10, confidence_level: "low", supporting_evidence: [], contradicting_evidence: ["Normal troponin", "High D-dimer"], reasoning: "Normal cardiac markers and alternative explanation rule out ACS." },
      { name: "Pneumonia", probability: 0.05, confidence_level: "low", supporting_evidence: [], contradicting_evidence: ["Labs/Imaging inconsistent"], reasoning: "Virtually ruled out by current evidence." }
    ],
    update_summary: "CT imaging confirmed pulmonary artery filling defect while elevated D-dimer supported thrombotic activity, shifting consensus from ACS to PE.",
    confidence_shift: { from: "ACS", to: "Pulmonary Embolism", trigger: "CT Imaging + Elevated D-dimer" }
  }
};

const SourceTooltip = ({ term, children }: { term: string, children: React.ReactNode }) => {
  const [isHovered, setIsHovered] = useState(false);
  const trace = SOURCE_TRACES[term];

  if (!trace) return <>{children}</>;

  return (
    <div 
      className="relative inline-block cursor-help group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`transition-all duration-300 border-b border-indigo-400/40 border-dotted ${isHovered ? 'text-indigo-300 shadow-[0_0_15px_rgba(129,140,248,0.3)]' : ''}`}>
        {children}
      </div>
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-[200] w-72 p-6 rounded-[2rem] bg-[#0A0D20]/90 border border-indigo-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(129,140,248,0.1)] backdrop-blur-2xl pointer-events-none"
          >
            <div className="space-y-4">
               <div className="flex items-center justify-between border-b border-white/5 pb-2">
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em]">Source Trace</span>
                    <span className="text-[10px] font-mono text-white/90">{trace.source}</span>
                 </div>
                 <Database className="w-3 h-3 text-indigo-400/50" />
               </div>

               <div className="grid grid-cols-1 gap-4">
                 <div>
                   <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-1">Raw Value / Finding</span>
                   <p className="text-[11px] text-white/80 font-mono bg-white/5 p-2 rounded-lg border border-white/5">{trace.raw}</p>
                 </div>
                 
                 <div>
                   <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-1">Interpretation</span>
                   <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wide">{trace.interpretation}</p>
                 </div>

                 <div>
                   <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-1">Agent Usage</span>
                   <p className="text-[9px] text-indigo-300/80 leading-relaxed italic">{trace.usedBy}</p>
                 </div>

                 <div className="pt-2 border-t border-white/5">
                   <span className="text-[8px] font-black text-rose-400/50 uppercase tracking-widest block mb-1">Diagnostic Impact</span>
                   <p className="text-[10px] text-rose-300 font-bold">{trace.impact}</p>
                 </div>
               </div>
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0A0D20]/90 border-r border-b border-indigo-500/30 rotate-45 -translate-y-1.5" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const A2A_LOGS = [
  { from: "cardio", to: "pulmo", type: "hypothesis", text: "Initial hypothesis: ACS likely from chest pain pattern. Request pulmonary review.", status: "processed", timestamp: "T+0.4s" },
  { from: "pulmo", to: "labs", type: "challenge", text: "PE suspected due to sudden dyspnea. Request D-dimer and oxygenation evidence.", status: "processed", timestamp: "T+1.2s" },
  { from: "labs", to: "pulmo", type: "evidence", text: "D-dimer elevated at 2.4 mg/L. Troponin normal.", status: "processed", timestamp: "T+2.1s" },
  { from: "pulmo", to: "cardio", type: "update", text: "Evidence favors PE over ACS. CT finding and normal troponin weaken ACS.", status: "processed", timestamp: "T+3.5s" },
  { from: "cardio", to: "risk", type: "update", text: "ACS downgraded. PE risk should be escalated.", status: "processed", timestamp: "T+4.8s" },
  { from: "cardio", to: "all", type: "concession", text: "Based on lab and imaging evidence, ACS likelihood reduced from 0.72 to 0.21. Pulmonary Embolism is now the leading diagnosis.", status: "processed", timestamp: "T+5.2s" },
  { from: "risk", to: "all", type: "escalation", text: "High-risk PE pathway activated. Clinician review required.", status: "processed", timestamp: "T+5.9s" },
];

const AGENT_DECISION_HISTORY: Record<number, any> = {
  0: { cardio: { h: "Analyzing...", c: 0 }, pulmo: { h: "Analyzing...", c: 0 }, labs: { h: "Ready", c: 1 }, risk: { h: "Monitoring", c: 1 } },
  1: { cardio: { h: "ACS Likely", c: 0.72 }, pulmo: { h: "Analyzing...", c: 0 }, labs: { h: "Ready", c: 1 }, risk: { h: "Monitoring", c: 1 } },
  2: { cardio: { h: "ACS Likely", c: 0.72 }, pulmo: { h: "Suspected PE", c: 0.65 }, labs: { h: "Gathering", c: 0.5 }, risk: { h: "Low Alert", c: 0.8 } },
  3: { 
    cardio: { h: "ACS (Questioned)", c: 0.45, prevC: 0.72, delta: "-27%", prevH: "ACS Likely" }, 
    pulmo: { h: "PE (Strengthened)", c: 0.82, prevC: 0.65, delta: "+17%", prevH: "Suspected PE", isLeading: true }, 
    labs: { h: "Evidence Ready", c: 0.95 }, 
    risk: { h: "Medium Alert", c: 0.8 } 
  },
  4: { 
    cardio: { h: "ACS (Unlikely)", c: 0.21, prevC: 0.72, delta: "-51%", prevH: "ACS (Questioned)", status: "Overruled" }, 
    pulmo: { h: "PE (Leading)", c: 0.82, delta: "+17%", isLeading: true, status: "Leading" }, 
    labs: { h: "Evidence Ready", c: 0.95 }, 
    risk: { h: "HIGH ALERT", c: 0.98, status: "Escalated" } 
  },
  5: { 
    cardio: { h: "PE Consensus", c: 0.88, delta: "+67%", updated: true, status: "Overruled" }, 
    pulmo: { h: "PE Consensus", c: 0.88, delta: "+23%", isLeading: true, status: "Leading" }, 
    labs: { h: "Finalized", c: 1 }, 
    risk: { h: "HIGH ALERT", c: 1, status: "Escalated" } 
  },
};

const CONSENSUS_EVOLUTION = [
  { id: 1, title: "Initial State", detail: "Cardiology leads (ACS)" },
  { id: 2, title: "Conflict", detail: "Pulmonology challenges ACS → suggests PE" },
  { id: 3, title: "Evidence Update", detail: "Labs confirms D-dimer high → weakens ACS" },
  { id: 4, title: "Adaptation", detail: "Cardiology updates hypothesis" },
  { id: 5, title: "Escalation", detail: "Risk agent flags high-risk PE" },
  { id: 6, title: "Final", detail: "Consensus on Pulmonary Embolism" },
];

const CONSENSUS_STATES = [
  { step: 0, state: "Initial Evaluation", detail: "Cardiology hypothesis leading" },
  { step: 1, state: "Active Conflict", detail: "Pulmonology challenges ACS hypothesis" },
  { step: 2, state: "Evidence Gathering", detail: "Labs support PE (D-dimer / Troponin)" },
  { step: 3, state: "Synthesis", detail: "Consensus forming around PE diagnosis" },
  { step: 4, state: "Finalization", detail: "Risk escalates PE pathway for confirmation" },
];

const PHASES = [
  "Analyzing clinical presentation...",
  "Generating differential hypotheses...",
  "Evaluating risks & contradictions...",
  "Cross-checking data findings...",
  "Converging to final decision..."
];

const RECOMMENDED_STEPS = [
  {
    title: "Order urgent CT Pulmonary Angiography (CTPA)",
    why: "Confirms or rules out pulmonary embolism using vascular imaging.",
    clinicianReview: "Review renal function, contrast allergy, pregnancy status, and hemodynamic stability.",
    relatedEvidence: "Shortness of breath + elevated D-dimer + CT chest concern.",
    safetyNote: "Do not delay urgent evaluation if patient is unstable."
  },
  {
    title: "Initiate empirical anticoagulation therapy",
    why: "May reduce clot progression while definitive imaging is arranged.",
    clinicianReview: "Check bleeding risk, contraindications, platelet count, recent surgery, and medication interactions.",
    relatedEvidence: "High-risk PE concern + risk analyst escalation.",
    safetyNote: "Only under clinician supervision."
  },
  {
    title: "Continuous cardiac and SpO2 monitoring",
    why: "Tracks deterioration, hypoxia, tachycardia, or cardiac strain.",
    clinicianReview: "Monitor oxygen saturation, heart rate, blood pressure, ECG changes.",
    relatedEvidence: "Shortness of breath and high-risk pathway.",
    safetyNote: "Escalate immediately if SpO2 drops or hemodynamics worsen."
  },
  {
    title: "Prepare for potential hemodynamic support",
    why: "High-risk PE can cause sudden instability.",
    clinicianReview: "Assess need for oxygen, IV access, fluids/vasopressors, ICU escalation.",
    relatedEvidence: "High-risk classification + decompensation warning.",
    safetyNote: "Emergency care required if shock signs appear."
  }
];

export default function DebatePageWrapper() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-[#050711] flex items-center justify-center text-white/20 uppercase tracking-[0.4em] text-[10px] font-black animate-pulse">Initializing Neural Debate...</div>}>
      <DebatePage />
    </Suspense>
  );
}

function DebatePage() {
  const searchParams = useSearchParams();
  const isSharedMode = searchParams.get('shared') === 'true';
  const sharedCaseId = searchParams.get('caseId') || 'vdsvx39';

  const formatPercent = (val: number | undefined | null) => {
    if (val === undefined || val === null) return "0%";
    let num = val;
    // If between 0 and 1 (exclusive of 0 but inclusive of 1 is tricky, usually clinical scores are > 1 if they are % already)
    // Rule: if num is <= 1 and > 0, treat as decimal. If 1, it could be 1% or 100%. Usually 100% is returned as 100.
    if (num <= 1 && num > 0) num = num * 100;
    // Round to 1 decimal place max and remove floating point noise
    return +(Math.round(Number(num + "e+1")) + "e-1") + "%";
  };

  const [shareLink, setShareLink] = useState<string | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  
  const [activeMessageIndex, setActiveMessageIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  const [activePhase, setActivePhase] = useState(0);
  const [isConverged, setIsConverged] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [conflictActive, setConflictActive] = useState(false);
  const [conflictResolved, setConflictResolved] = useState(false);
  const [safetyCheckOpen, setSafetyCheckOpen] = useState(false);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  
  const [reviewDecision, setReviewDecision] = useState<"approved" | "modified" | "more-evidence" | "rejected" | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [evidenceRequested, setEvidenceRequested] = useState<string[]>([]);
  const [auditLogs, setAuditLogs] = useState<string[]>([
    "FHIR Patient resource loaded",
    "Observation resource parsed: D-dimer elevated",
    "DiagnosticReport linked: CT chest imaging",
    "Lab Interpreter tool invoked",
    "Imaging Analyzer tool invoked",
    "Pulmonology Agent challenged Cardiology hypothesis",
    "Risk Agent escalated case to High Risk",
    "Clinician review requested"
  ]);
  const [showReviewPanel, setShowReviewPanel] = useState<"modify" | "evidence" | "reject" | null>(null);

  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [mode, setMode] = useState<"patient" | "doctor">("doctor");
  const [clinicianReviewed, setClinicianReviewed] = useState(false);
  const [clinicalSteps, setClinicalSteps] = useState(RECOMMENDED_STEPS);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [clinicalNote, setClinicalNote] = useState("");
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [showExportToast, setShowExportToast] = useState(false);
  
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleOption, setScheduleOption] = useState<string | null>(null);
  const [scheduledCheckIn, setScheduledCheckIn] = useState<string | null>(null);
  const [showScheduleToast, setShowScheduleToast] = useState(false);
  
  const [selectedStep, setSelectedStep] = useState<typeof RECOMMENDED_STEPS[0] | null>(null);

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [fhirModalOpen, setFhirModalOpen] = useState(false);
  const [selectedFhir, setSelectedFhir] = useState<any>(null);
  const [shareEmail, setShareEmail] = useState("");
  const [missingDataSource, setMissingDataSource] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<any>(null);
  const [isLiveAI, setIsLiveAI] = useState(false);
  const BRIEFING_TEXT = `This 64-year-old male presented with sudden-onset shortness of breath and pleuritic chest pain. While initial clinical suspicion included acute coronary syndrome, the absence of troponin elevation and the definitive detection of a filling defect on CT pulmonary angiography strongly point to a pulmonary embolism. This condition is life-threatening as it obstructs blood flow to the lungs and can lead to right heart failure if left untreated. We recommend immediate initiation of anticoagulation therapy and stabilization of respiratory status. Continuous monitoring is essential to detect any hemodynamic deterioration.`;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const handlePlayBriefing = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(BRIEFING_TEXT);
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'doctor' || view === 'patient') {
      setMode(view as "doctor" | "patient");
    }

    const saved = sessionStorage.getItem('diagora-ai-result');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAiResult(parsed);
        setIsLiveAI(parsed.mode === 'live-ai');
        if (parsed.mode === 'live-ai') {
          console.log("Debate using AI result");
        }
      } catch (e) {
        console.error("Failed to parse AI result from session storage");
      }
    }
  }, []);

  // Use dynamic data if available, otherwise fallback to constants
  const activeMessages = aiResult ? [
    { id: 0, isSystem: true, phase: 0, text: "FHIR Bundle Parsed. Analyzing patient data and initiating specialist debate...", fhir: { resource: "Bundle", status: "parsing" } },
    ...aiResult.agents.map((a: any, i: number) => ({
      id: i + 1,
      agentId: a.name.toLowerCase().includes('pulmo') ? 'pulmo' : 
               a.name.toLowerCase().includes('cardio') ? 'cardio' : 
               a.name.toLowerCase().includes('lab') ? 'labs' : 
               a.name.toLowerCase().includes('risk') ? 'risk' : 'imaging',
      phase: Math.min(i + 1, 4),
      text: a.opinion,
      evidence: i === 1 ? { type: 'imaging', title: 'Diagnostic Evidence', url: '/ct-scan.png' } : null
    }))
  ] : MESSAGES;

  const mcpTrace = aiResult?.mcpToolTrace || MCP_EXECUTION_TRACE;
  const hypothesesData = aiResult?.hypotheses || [];
  const fhirTrace = aiResult?.fhirTrace || FHIR_TRANSFORMATIONS_DETAILED;
  const a2aLog = aiResult?.a2aMessages || [];

  // Advanced Clinical Reasoning State
  const uncertaintyData = (() => {
    const baseData = (() => {
      if (aiResult) {
        const rawScore = aiResult.confidence;
        // If score is between 0 and 1, normalize to 0-100
        const score = rawScore <= 1 ? Math.round(rawScore * 100) : Math.round(rawScore);
        const uncertainty = 100 - score;

        return {
          level: aiResult.diagnosticUncertainty.level.toUpperCase(),
          score,
          uncertainty,
          reason: aiResult.diagnosticUncertainty.drivers[0] || "AI consensus reached.",
          points: aiResult.diagnosticUncertainty.drivers,
          drivers: { 
            imaging: "Strong", 
            labs: "Strong",
            agreement: "High",
            completeness: "Full"
          }
        };
      }
      
      let level = "LOW";
      let score = 94;
      let uncertainty = 6;
      let reason = "Multi-agent consensus reached with complete FHIR dataset.";
      let points = ["Strong imaging evidence", "Consistent lab markers", "Clinician-validated FHIR trace"];
      let drivers = { imaging: "Strong", labs: "Strong", agreement: "High", completeness: "Full" };

      if (missingDataSource === 'imaging') {
        level = "MEDIUM";
        score = 72;
        uncertainty = 28;
        reason = "Critical structural evidence missing. Relying on biomarker signals.";
        points = ["Labs available", "Vascular signals missing", "Reduced agent agreement"];
        drivers = { imaging: "Weak", labs: "Strong", agreement: "Medium", completeness: "Partial" };
      } else if (missingDataSource === 'labs') {
        level = "MEDIUM";
        score = 68;
        uncertainty = 32;
        reason = "Biomarker confirmation unavailable. Relying on structural imaging.";
        points = ["Imaging available", "Biochemical signals missing", "Increased conflict potential"];
        drivers = { imaging: "Strong", labs: "Weak", agreement: "Medium", completeness: "Partial" };
      }

      return { level, score, uncertainty, reason, points, drivers };
    })();

    const getBreakdown = (data: any, decision: string | null) => {
      if (decision === 'rejected') return { imaging: 0, labs: 0, pattern: 0, risk: 0 };
      if (decision === 'more-evidence') return { imaging: 45, labs: 40, pattern: 50, risk: 65 };
      
      return {
        imaging: data.drivers.imaging === "Strong" ? 92 : 45,
        labs: data.drivers.labs === "Strong" ? 85 : 40,
        pattern: data.score > 80 ? 78 : 55,
        risk: 65
      };
    };

    const finalData = (() => {
      if (reviewDecision === 'rejected') {
        return {
          level: "CRITICAL",
          score: 0,
          uncertainty: 100,
          reason: "Clinician rejected recommendation. Manual re-evaluation required.",
          points: ["Clinician override", "Confidence reset", "Awaiting new diagnostic plan"],
          drivers: { imaging: "Invalidated", labs: "Invalidated", agreement: "None", completeness: "None" }
        };
      }

      if (reviewDecision === 'more-evidence') {
        return {
          level: "PENDING",
          score: 50,
          uncertainty: 50,
          reason: "Pending additional evidence requested by clinician.",
          points: ["Evidence Requested", ...evidenceRequested],
          drivers: { imaging: "Pending", labs: "Pending", agreement: "Partial", completeness: "Partial" }
        };
      }

      return baseData;
    })();

    return { ...finalData, breakdown: getBreakdown(finalData, reviewDecision) };
  })();

  const detectTurningPoint = () => {
    if (missingDataSource === 'imaging') return "None - Structural evidence missing";
    if (missingDataSource === 'labs') return "None - Biomarker signals missing";
    return "CT imaging revealed vascular obstruction; D-dimer elevation confirmed thrombosis.";
  };

  const generateShareLink = () => {
    const id = sharedCaseId;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    setShareLink(`${baseUrl}/debate?view=doctor&shared=true&caseId=${id}`);
  };

  const copyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink).then(() => {
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 3000);
      });
    }
  };
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const playNext = async (index: number) => {
      if (index < activeMessages.length) {
        setIsTyping(true);
        setActivePhase(activeMessages[index].phase);
        
        const typingTime = 1500 + Math.random() * 1000;
        await new Promise(r => { timeout = setTimeout(r, typingTime) });
        
        setIsTyping(false);
        setActiveMessageIndex(index);

        if (activeMessages[index].isConflict) {
          setConflictActive(true);
        }
        
        if (activeMessages[index].agentId === "labs") {
          setConflictActive(false);
          setConflictResolved(true);
          setTimeout(() => setConflictResolved(false), 4000);
        }

        const readTime = Math.max(3000, activeMessages[index].text.length * 35);
        timeout = setTimeout(() => playNext(index + 1), readTime);
      } else {
        timeout = setTimeout(() => {
          setActiveMessageIndex(-1);
          setIsSynthesizing(true);
          setTimeout(() => {
            setIsSynthesizing(false);
            setIsConverged(true);
          }, 2500);
        }, 4000);
      }
    };

    timeout = setTimeout(() => playNext(0), 1000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeMessageIndex]);

  const playBriefing = () => {
    if (isPlayingVoice) {
      window.speechSynthesis.cancel();
      setIsPlayingVoice(false);
      return;
    }
    
    const text = "Diagora's medical board reached consensus on high-probability pulmonary embolism. The decision is supported by shortness of breath, elevated D-dimer, and contradiction resolution against ACS. Imaging confirmation is recommended.";
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.name.includes("Siri") || v.name.includes("Samantha") || v.name.includes("Google") || v.name.includes("Daniel"));
    if (premiumVoice) utterance.voice = premiumVoice;
    
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlayingVoice(false);
    
    setIsPlayingVoice(true);
    window.speechSynthesis.speak(utterance);
  };

  const activeAgentId = isConverged || isSynthesizing
    ? null 
    : isTyping && activeMessageIndex + 1 < activeMessages.length 
      ? activeMessages[activeMessageIndex + 1].isSystem ? null : activeMessages[activeMessageIndex + 1].agentId 
      : activeMessageIndex >= 0 && activeMessageIndex < activeMessages.length 
        ? activeMessages[activeMessageIndex].isSystem ? null : activeMessages[activeMessageIndex].agentId 
        : null;

  const visibleMessages = activeMessages.slice(0, activeMessageIndex + 1);

  return (
    <div className="relative w-full h-screen bg-[#050711] overflow-hidden font-sans">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.03)_0%,_#050711_80%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-[radial-gradient(circle_at_center,_rgba(129,140,248,0.05)_0%,_transparent_50%)] rounded-full blur-[100px] pointer-events-none" />

      <AnimatePresence>
        {isSynthesizing && <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 1}} className="absolute inset-0 bg-black/40 z-[5] pointer-events-none" />}
      </AnimatePresence>

      {/* Shared Mode Badge */}
      <AnimatePresence>
        {isSharedMode && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] px-6 py-2 rounded-b-2xl bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center gap-3 print:hidden"
          >
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Shared by patient · View-only · Expires in 24h</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back button */}
      <div className="absolute top-8 w-full px-8 flex justify-between items-center z-50 pointer-events-none print:hidden">
        <Link href="/new-case" className="text-white/50 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium tracking-wider uppercase pointer-events-auto">
          <ArrowLeft className="w-4 h-4" /> Intake
        </Link>
        <div className="flex gap-4 pointer-events-auto">
          {isConverged && (
            <div className="relative flex items-center p-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
              <div 
                className="absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-indigo-500/20 border border-indigo-500/30 rounded-full transition-transform duration-300 ease-out"
                style={{ transform: mode === "doctor" ? "translateX(100%)" : "translateX(0)" }}
              />
              <button 
                onClick={() => setMode("patient")}
                className={`relative z-10 px-4 py-1.5 text-xs font-bold tracking-widest uppercase transition-colors rounded-full ${mode === "patient" ? "text-indigo-200" : "text-white/50 hover:text-white/80"}`}
              >
                Patient View
              </button>
              <button 
                onClick={() => setMode("doctor")}
                className={`relative z-10 px-4 py-1.5 text-xs font-bold tracking-widest uppercase transition-colors rounded-full ${mode === "doctor" ? "text-indigo-200" : "text-white/50 hover:text-white/80"}`}
              >
                Doctor View
              </button>
            </div>
          )}
          {!isConverged && (
            <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 backdrop-blur-md transition-colors ${isLiveAI ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${isLiveAI ? 'bg-indigo-400' : 'bg-emerald-400'}`} />
              <span className={`text-xs font-bold tracking-widest uppercase ${isLiveAI ? 'text-indigo-200' : 'text-emerald-200'}`}>
                {isLiveAI ? "Live Gemini AI Active" : "Simulated Reasoning Mode Active"}
              </span>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isConverged ? (
          <motion.div 
            key="debate-view"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(20px)" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 grid grid-cols-1 lg:grid-cols-[minmax(360px,520px)_minmax(520px,1fr)_minmax(320px,380px)] w-full h-full pt-20"
          >
            {/* LEFT COLUMN: Chat Feed */}
            <div className="relative h-full z-30 flex flex-col px-6 lg:px-10 border-b lg:border-b-0 lg:border-r border-white/5 overflow-y-auto bg-[#050711]/60 backdrop-blur-sm custom-scrollbar pt-6">
              <div className="mb-8 shrink-0">
                <AnimatePresence mode="wait">
                  {isSynthesizing ? (
                    <motion.div key="synthesizing" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-indigo-400/50 bg-indigo-500/20 mb-6">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-300 animate-pulse shadow-[0_0_15px_#A5B4FC]" />
                      <span className="text-xs font-bold tracking-[0.2em] text-indigo-200 uppercase">Synthesizing Decision...</span>
                    </motion.div>
                  ) : (
                    <motion.div key={activePhase} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 mb-6">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_10px_#818CF8]" />
                      <span className="text-xs font-bold tracking-[0.2em] text-indigo-300 uppercase">{PHASES[activePhase]}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-3">{isSynthesizing ? "Energy Convergence" : "Analyzing Case"}</h1>
                <p className="text-white/40 font-light text-lg">Specialists analyze, challenge, and converge on a clinical decision.</p>
                {missingDataSource && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-rose-300 uppercase tracking-widest">Simulation Mode: {missingDataSource} data removed → Reasoning unstable</span>
                  </motion.div>
                )}
              </div>

              {/* Data Sensitivity UI */}
              <div className="mb-8 p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 backdrop-blur-md shrink-0">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em] flex items-center gap-2">
                     <AlertTriangle className="w-3 h-3" /> Data Sensitivity Simulation
                   </h3>
                   <div className="px-2 py-0.5 rounded bg-indigo-500/20 text-[8px] font-bold text-indigo-400 uppercase tracking-widest">Experimental</div>
                 </div>
                 <p className="text-[10px] text-white/40 mb-6 leading-relaxed">De-select FHIR sources to observe how data scarcity impacts AI confidence and diagnostic consensus.</p>
                 <div className="space-y-3">
                   {[{ id: 'imaging', label: 'Imaging (DiagnosticReport)', sub: 'ct-chest-001' }, { id: 'labs', label: 'Laboratory (Observation)', sub: 'd-dimer-001, troponin-001' }].map(source => (
                     <button key={source.id} onClick={() => setMissingDataSource(missingDataSource === source.id ? null : source.id as any)} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${missingDataSource === source.id ? 'bg-rose-500/10 border-rose-500/40 text-rose-300' : 'bg-white/5 border-white/10 text-white/60 hover:border-indigo-500/30'}`}>
                       <div className="flex flex-col items-start">
                         <span className="text-[11px] font-bold uppercase tracking-wider">{source.label}</span>
                         <span className="text-[8px] font-mono opacity-50">{source.sub}</span>
                       </div>
                       <div className={`w-8 h-4 rounded-full relative transition-colors ${missingDataSource === source.id ? 'bg-rose-500' : 'bg-white/10'}`}>
                         <motion.div animate={{ x: missingDataSource === source.id ? 16 : 2 }} className="absolute top-1 left-0 w-2 h-2 bg-white rounded-full shadow-sm" />
                       </div>
                     </button>
                   ))}
                 </div>
              </div>

              <div className="flex-1 space-y-6 pb-20">
                <AnimatePresence initial={false}>
                  {visibleMessages.map((msg, index) => {
                    const agentDef = AGENTS.find(a => a.id === msg.agentId);
                    if (!agentDef) return null;
                    const Icon = agentDef.icon;
                    return (
                      <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`flex flex-col items-start gap-3 p-6 rounded-[2rem] border transition-all relative group ${activeAgentId === msg.agentId ? "bg-white/10 border-indigo-500/40 shadow-[0_0_40px_rgba(129,140,248,0.1)] z-10" : "bg-white/[0.03] border-white/5 hover:bg-white/[0.05]"}`}>
                        <div className="flex items-center gap-3 mb-1">
                          <div className={`p-2 rounded-xl transition-colors ${activeAgentId === msg.agentId ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-white/40"}`}><Icon className="w-4 h-4" /></div>
                          <span className={`text-xs font-bold tracking-[0.2em] uppercase transition-colors ${activeAgentId === msg.agentId ? "text-white" : "text-white/40"}`}>{agentDef.name}</span>
                        </div>
                        <div className="text-white/90 text-lg leading-relaxed font-light">
                          {msg.text.split(/(D-dimer 2.4 mg\/L|Troponin normal|CT filling defect|PE risk|Metformin|ACS|CT-Chest|filling defect)/g).map((part: string, index: number) => SOURCE_TRACES[part] ? <SourceTooltip key={index} term={part}>{part}</SourceTooltip> : part)}
                        </div>
                        {msg.evidence && (
                          <div className="mt-5 pt-5 border-t border-white/10 w-full">
                            <button onClick={() => { if (msg.evidence.type === 'imaging') { setModalData({type: 'imaging', title: msg.evidence.title, url: msg.evidence.url, hasHighlight: msg.evidence.title.includes('CT'), highlightLabel: 'Suspicious Region'}); setModalOpen(true); } }} className="group flex flex-col items-start gap-4 p-4 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/30 transition-all w-full text-left">
                              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/40">
                                {msg.evidence.type === 'imaging' && (
                                  <>
                                    <img src={msg.evidence.url} alt="Evidence" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                    {msg.evidence.title.includes('CT') && (
                                      <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 3 }}>
                                        <div className="absolute top-[50%] left-[60%] w-[35%] h-[50%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,_rgba(217,70,239,0.5)_0%,_rgba(249,115,22,0.15)_50%,_transparent_100%)] rounded-[3rem] blur-sm mix-blend-screen" />
                                        <div className="absolute top-[25%] left-[70%] bg-black/80 border border-fuchsia-500/50 px-2 py-1 rounded-md text-[8px] font-bold text-fuchsia-300 uppercase tracking-wider shadow-[0_0_15px_rgba(217,70,239,0.2)]">Suspicious region detected</div>
                                      </motion.div>
                                    )}
                                  </>
                                )}
                              </div>
                              <div className="p-3 flex items-center justify-between w-full">
                                <div className="flex flex-col items-start gap-1">
                                  <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-300 flex items-center gap-1.5">{msg.evidence.type === 'imaging' ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />} Evidence Attached</span>
                                  <SourceTooltip term={msg.evidence.title.includes('D-Dimer') ? 'D-dimer 2.4 mg/L' : msg.evidence.title.includes('CT') ? 'CT filling defect' : msg.evidence.title}><span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors text-left">{msg.evidence.title}</span></SourceTooltip>
                                </div>
                                <div className="p-1.5 rounded-full bg-white/5 text-white/50 group-hover:text-white group-hover:bg-indigo-500/20 transition-all"><ChevronRight className="w-4 h-4" /></div>
                              </div>
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {isTyping && activeMessageIndex + 1 < MESSAGES.length && !MESSAGES[activeMessageIndex + 1].isSystem && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 text-indigo-300/60">
                    <div className="flex gap-1.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                    </div>
                    <span className="text-sm font-medium tracking-wider uppercase">{AGENTS.find(a => a.id === MESSAGES[activeMessageIndex + 1].agentId)?.name} is reasoning...</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* CENTER COLUMN: Network Visualization */}
            <div className="relative h-full z-10 flex flex-col items-center justify-start min-w-0 overflow-hidden pt-4">
              <div className="w-full flex flex-col items-center gap-4 pt-4 pb-2 z-40 shrink-0">
                <div className="flex gap-4">
                  <div className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-md flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    <span className="text-[10px] font-bold tracking-widest text-indigo-300 uppercase">Agent Message Bus Active</span>
                  </div>
                  <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-widest text-emerald-300 uppercase">A2A Protocol Simulation Active</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 bg-[#0A0D20]/80 px-6 py-3 rounded-3xl border border-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    <div className="flex flex-col items-center gap-1"><Activity className={`w-5 h-5 transition-colors ${activeAgentId === 'cardio' ? 'text-blue-400' : 'text-white/20'}`} /><span className="text-[8px] uppercase tracking-widest text-white/50">Cardio</span></div>
                    <motion.div animate={{ opacity: [0.3, 1, 0.3], x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}><ArrowRight className="w-4 h-4 text-indigo-400/50" /></motion.div>
                    <div className="flex flex-col items-center gap-1"><Wind className={`w-5 h-5 transition-colors ${activeAgentId === 'pulmo' ? 'text-sky-400' : 'text-white/20'}`} /><span className="text-[8px] uppercase tracking-widest text-white/50">Pulmo</span></div>
                    <motion.div animate={{ opacity: [0.3, 1, 0.3], x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}><ArrowRight className="w-4 h-4 text-indigo-400/50" /></motion.div>
                    <div className="flex flex-col items-center gap-1"><ShieldAlert className={`w-5 h-5 transition-colors ${activeAgentId === 'risk' ? 'text-orange-400' : 'text-white/20'}`} /><span className="text-[8px] uppercase tracking-widest text-white/50">Risk</span></div>
                    <motion.div animate={{ opacity: [0.3, 1, 0.3], x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}><ArrowRight className="w-4 h-4 text-indigo-400/50" /></motion.div>
                    <div className="flex flex-col items-center gap-1"><FileText className={`w-5 h-5 transition-colors ${activeAgentId === 'labs' ? 'text-emerald-400' : 'text-white/20'}`} /><span className="text-[8px] uppercase tracking-widest text-white/50">Labs</span></div>
                  </div>

                  <div className="bg-[#0A0D20]/80 px-6 py-4 rounded-3xl border border-white/10 backdrop-blur-md flex flex-col items-start gap-3 min-w-[320px]">
                    <div className="w-full flex justify-between items-center">
                      <span className="text-[8px] font-bold tracking-[0.2em] text-white/40 uppercase">Consensus Evolution</span>
                      <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest animate-pulse">Dynamic Reasoning Active</span>
                    </div>
                    <div className="w-full space-y-2">
                      {CONSENSUS_EVOLUTION.slice(0, activePhase + 1).map((step, i) => (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${i === activePhase ? 'bg-indigo-500/10 border border-indigo-500/20' : 'opacity-40'}`}>
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${i === activePhase ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/50'}`}>{step.id}</div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white/90">{step.title}</span>
                            <span className="text-[9px] text-white/50 font-light">{step.detail}</span>
                          </div>
                          {i < activePhase && <Check className="w-3 h-3 text-emerald-400 ml-auto" />}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Graph Wrapper */}
              <div className="relative flex-1 w-full flex items-center justify-center scale-75 lg:scale-90 xl:scale-100 z-10">
                {/* Conflict Badges */}
                <div className="absolute top-4 right-6 flex flex-col items-end gap-3 z-50">
                  <AnimatePresence>
                    {conflictActive && (
                      <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, scale: 0.9}} className="px-5 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 backdrop-blur-md flex items-center gap-3 shadow-[0_0_30px_rgba(244,63,94,0.15)]">
                        <div className="p-1.5 rounded-full bg-rose-500/20"><AlertTriangle className="w-4 h-4 text-rose-400" /></div>
                        <span className="text-xs font-bold tracking-widest text-rose-300 uppercase">Diagnostic Conflict Detected</span>
                      </motion.div>
                    )}
                    {conflictResolved && (
                      <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, scale: 0.9}} className="px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md flex items-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                        <div className="p-1.5 rounded-full bg-emerald-500/20"><Check className="w-4 h-4 text-emerald-400" /></div>
                        <span className="text-xs font-bold tracking-widest text-emerald-300 uppercase">Conflict Resolved by Objective Data</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="absolute z-20 w-[300px] h-[300px] flex items-center justify-center pointer-events-none">
                  <motion.div animate={{ 
                    scale: isSynthesizing ? [1, 1.4, 1.2] : activeAgentId ? [1, 1.25, 1] : [1, 1.1, 1], 
                    opacity: isSynthesizing ? [0.6, 1, 0.8] : activeAgentId ? [0.6, 1, 0.6] : [0.3, 0.5, 0.3],
                    filter: missingDataSource ? ["blur(50px)", "blur(70px)", "blur(50px)"] : "blur(50px)"
                  }} transition={{ duration: isSynthesizing ? 1.5 : activeAgentId ? 2 : 4, repeat: Infinity, ease: "easeInOut" }} className={`absolute inset-0 rounded-full blur-[50px] transition-colors duration-700 ${conflictActive ? 'bg-rose-600/30' : isSynthesizing ? 'bg-indigo-400/40' : activeAgentId === 'risk' ? 'bg-orange-600/30' : 'bg-indigo-500/20'}`} />
                  <motion.div animate={{ 
                    boxShadow: isSynthesizing ? "0 0 150px -10px rgba(129,140,248,1)" : conflictActive ? "0 0 120px -10px rgba(244,63,94,0.8)" : activeAgentId ? activeAgentId === 'risk' ? "0 0 100px -10px rgba(249,115,22,0.8)" : "0 0 100px -10px rgba(129,140,248,0.8)" : "0 0 60px -10px rgba(129,140,248,0.4)",
                    x: missingDataSource ? [0, -2, 2, -1, 0] : 0,
                    y: missingDataSource ? [0, 1, -1, 2, 0] : 0
                  }} transition={{ repeat: Infinity, duration: 0.5 }} className="absolute w-40 h-40 rounded-full bg-[#03040A] border border-white/10 flex items-center justify-center backdrop-blur-3xl transition-all duration-700">
                    <motion.div animate={{ 
                      scale: isSynthesizing ? [1, 1.5, 1.2] : activeAgentId ? [1, 1.3, 1] : 1,
                      opacity: missingDataSource ? [0.4, 0.8, 0.4] : 1
                    }} transition={{ duration: isSynthesizing ? 1.5 : 1.5, repeat: Infinity }} className={`w-16 h-16 rounded-full blur-[12px] transition-colors duration-700 ${conflictActive ? 'bg-rose-400/60' : isSynthesizing ? 'bg-indigo-300/80' : activeAgentId === 'risk' ? 'bg-orange-400/50' : 'bg-indigo-400/50'}`} />
                  </motion.div>
                </div>

                <svg className="absolute w-[1200px] h-[1200px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible pointer-events-none opacity-40 lg:opacity-100 z-10">
                  <defs>
                    <filter id="glowPath"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                    <filter id="activeGlowPath"><feGaussianBlur stdDeviation="8" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                  </defs>
                  <motion.circle cx="600" cy="600" r="350" fill="none" stroke="rgba(165, 180, 252, 0.05)" strokeWidth="1" strokeDasharray="2 12" animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "600px 600px" }} />
                  {AGENTS.map((agent) => {
                    const decision = AGENT_DECISION_HISTORY[activeMessageIndex] ? AGENT_DECISION_HISTORY[activeMessageIndex][agent.id] : null;
                    const isActive = activeAgentId === agent.id;
                    const isClashing = conflictActive && (agent.id === "cardio" || agent.id === "pulmo");
                    const isLeading = decision?.isLeading;
                    const isSyn = isSynthesizing;
                    const radius = 350;
                    const rad = (agent.angle * Math.PI) / 180;
                    const startX = 600 + Math.cos(rad) * radius;
                    const startY = 600 + Math.sin(rad) * radius;
                    const cx = 600 + Math.cos(rad) * 150;
                    const cy = 600 + Math.sin(rad) * 150;
                    const pathD = `M ${startX} ${startY} Q ${cx} ${cy} 600 600`;
                    return (
                      <g key={`path-${agent.id}`}>
                        <motion.path d={pathD} fill="none" stroke={isLeading ? "#818CF8" : isClashing ? "rgba(244, 63, 94, 0.5)" : (isActive || isSyn ? "#818CF8" : "rgba(129, 140, 248, 0.2)")} strokeWidth={isLeading ? 10 : isActive || isClashing || isSyn ? 4 : 2} filter={isLeading || isActive || isClashing || isSyn ? "url(#activeGlowPath)" : "url(#glowPath)"} className="transition-all duration-1000" />
                      </g>
                    );
                  })}
                </svg>

                {AGENTS.map((agent) => {
                  const isActive = activeAgentId === agent.id;
                  const isClashing = conflictActive && (agent.id === "cardio" || agent.id === "pulmo");
                  const isSyn = isSynthesizing;
                  const rad = (agent.angle * Math.PI) / 180;
                  const x = Math.cos(rad) * 350;
                  const y = Math.sin(rad) * 350;
                  const Icon = agent.icon;
                  const decision = AGENT_DECISION_HISTORY[activeMessageIndex] ? AGENT_DECISION_HISTORY[activeMessageIndex][agent.id] : null;
                  const isDowngraded = decision?.status === "Overruled" || decision?.status === "Downgraded";
                  const isLeading = decision?.isLeading;

                  return (
                    <div key={agent.id} className="absolute z-30 flex items-center justify-center" style={{ transform: `translate(${x}px, ${y}px)` }}>
                      <div className="relative group">
                        {decision && decision.h !== "Ready" && decision.h !== "Monitoring" && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`absolute -top-24 left-1/2 -translate-x-1/2 w-40 px-4 py-3 rounded-2xl bg-[#0A0D20]/95 border ${isLeading ? 'border-indigo-400 shadow-[0_0_30px_rgba(129,140,248,0.3)]' : 'border-white/10'} backdrop-blur-md flex flex-col items-center gap-2 z-[60]`}>
                            <div className="flex justify-between items-center w-full">
                              <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">{isLeading ? 'Leading' : 'Confidence'}</span>
                              <span className={`text-[10px] font-bold ${isLeading ? 'text-indigo-400' : 'text-white'}`}>{Math.round(decision.c * 100)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${decision.c * 100}%` }} className={`h-full transition-colors duration-1000 ${isLeading ? 'bg-indigo-400' : 'bg-indigo-500'}`} />
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-center text-white/70">{decision.h}</span>
                            {isLeading && <div className="absolute -bottom-2 px-2 py-0.5 rounded bg-indigo-500 text-[6px] font-bold text-white uppercase tracking-widest">Leading</div>}
                          </motion.div>
                        )}
                        <motion.div animate={{ y: (isActive || isSyn) ? -10 : 0, scale: isDowngraded ? 0.85 : (isActive || isClashing || isSyn || isLeading) ? 1.25 : 1, opacity: isDowngraded ? 0.35 : 1 }} className={`w-20 h-20 rounded-full border backdrop-blur-2xl flex flex-col items-center justify-center relative transition-all duration-1000 ${isDowngraded ? 'bg-slate-900/40 border-slate-800 grayscale' : isLeading ? 'border-indigo-400 shadow-[0_0_60px_rgba(129,140,248,0.4)] bg-indigo-500/15' : 'bg-white/[0.03] border-white/20 shadow-xl'}`}>
                          <Icon className="w-7 h-7 mb-1 transition-colors duration-1000 text-white" />
                          <span className="text-[10px] font-bold tracking-widest uppercase text-white/60">{agent.id}</span>
                        </motion.div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: Technical Panels */}
            <aside className="sticky top-24 h-[calc(100vh-120px)] overflow-y-auto z-50 p-6 space-y-6 lg:border-l border-white/5 bg-[#050711]/40 backdrop-blur-xl custom-scrollbar">
               {missingDataSource && (
                 <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-2">
                    <div className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">Data Gaps Detected</div>
                    <div className="text-[10px] text-white/60 leading-relaxed italic">Confidence and uncertainty metrics are currently recalculated based on the absence of {missingDataSource} evidence.</div>
                 </div>
               )}
               <div className="bg-black/40 border border-white/5 rounded-3xl p-6 backdrop-blur-md pointer-events-auto">
                  <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Zap className="w-3 h-3" /> MCP Execution Trace</h3>
                  <div className="space-y-4">
                    {mcpTrace.map((trace: any, i: number) => {
                      const isVisible = activeMessageIndex >= i;
                      return (
                        <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: isVisible ? 1 : 0.1, x: isVisible ? 0 : 20 }} className="space-y-2">
                          <div className="flex justify-between items-center">
                             <span className="text-[8px] font-mono text-white/30 uppercase">{trace.tool}</span>
                             <span className={`text-[7px] font-bold uppercase px-1.5 py-0.5 rounded ${trace.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/20 text-indigo-300 animate-pulse'}`}>{trace.status}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-[9px]">
                             <div className="text-white/70">Input: <span className="font-mono text-indigo-300">{trace.input}</span></div>
                             <div className="text-white/70">Output: <span className="text-white font-medium">{trace.output}</span></div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
               </div>

               <div className="bg-black/40 border border-white/5 rounded-3xl p-6 backdrop-blur-md">
                  <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Brain className="w-3 h-3" /> Advanced Clinical Reasoning</h3>
                  <div className="space-y-6">
                    {aiResult ? (
                      <div className="space-y-6">
                        <div className="space-y-4">
                          {hypothesesData.map((h: any, i: number) => (
                            <div key={i} className="space-y-2">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="font-bold text-white/90">{h.name}</span>
                                <span className={`font-mono ${h.probability > 0.5 ? 'text-indigo-400' : 'text-white/40'}`}>{formatPercent(h.probability)}</span>
                              </div>
                              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${h.probability <= 1 ? h.probability * 100 : h.probability}%` }}
                                  className={`h-full ${h.probability > 0.5 ? 'bg-indigo-500' : 'bg-white/20'}`}
                                />
                              </div>
                              {activeMessageIndex >= i && h.reasoning && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-[9px] text-indigo-300/80 leading-relaxed italic">
                                  "{h.reasoning}"
                                </motion.div>
                              )}
                            </div>
                          ))}
                        </div>
                        {aiResult.criticalTurningPoint && activeMessageIndex >= 2 && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
                            <div className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-2">Confidence Shift Triggered</div>
                            <div className="text-[10px] font-bold text-white mb-1">{aiResult.criticalTurningPoint.trigger}</div>
                            <div className="text-[9px] text-white/50 leading-relaxed">{aiResult.criticalTurningPoint.explanation}</div>
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      (() => {
                        const latestIndex = Object.keys(CLINICAL_HYPOTHESES_EVOLUTION)
                          .map(Number)
                          .filter(idx => activeMessageIndex >= idx)
                          .sort((a, b) => b - a)[0] ?? 0;
                        
                        const data = CLINICAL_HYPOTHESES_EVOLUTION[latestIndex];
                        if (!data) return null;

                        return (
                          <>
                            <div className="space-y-4">
                              {data.hypotheses.map((h: any, i: number) => (
                                <div key={i} className="space-y-2">
                                  <div className="flex justify-between items-center text-[10px]">
                                    <span className="font-bold text-white/90">{h.name}</span>
                                    <span className={`font-mono ${h.probability > 0.5 ? 'text-indigo-400' : 'text-white/40'}`}>{formatPercent(h.probability)}</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${h.probability <= 1 ? h.probability * 100 : h.probability}%` }}
                                      className={`h-full ${h.probability > 0.5 ? 'bg-indigo-500' : 'bg-white/20'}`}
                                    />
                                  </div>
                                  {h.probability > 0.5 && (
                                    <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-[9px] text-indigo-300/80 leading-relaxed italic">
                                      "{h.reasoning}"
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {data.confidence_shift && (
                              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
                                <div className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-2">Confidence Shift Detected</div>
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] text-white/40 line-through">{data.confidence_shift.from}</span>
                                  <ArrowRight className="w-3 h-3 text-indigo-400" />
                                  <span className="text-[10px] font-bold text-white">{data.confidence_shift.to}</span>
                                </div>
                                <div className="mt-2 text-[8px] text-indigo-300/60 uppercase tracking-tighter">Trigger: {data.confidence_shift.trigger}</div>
                              </motion.div>
                            )}

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                               <div className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Update Summary</div>
                               <p className="text-[9px] text-white/60 leading-relaxed">{data.update_summary}</p>
                            </div>
                          </>
                        );
                      })()
                    )}
                  </div>
               </div>

               <div className="bg-black/40 border border-white/5 rounded-3xl p-6 backdrop-blur-md">
                  <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Database className="w-3 h-3" /> FHIR Clinical Signal</h3>
                  <div className="space-y-3">
                    {FHIR_TRANSFORMATIONS_DETAILED.map((trans, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1.5">
                         <div className="text-[8px] font-mono text-white/30">{trans.resource}</div>
                         <div className="flex items-center gap-2 text-[9px] font-bold">
                            <span className="text-white/50">{trans.raw}</span>
                            <ArrowRight className="w-2.5 h-2.5 text-white/10" />
                            <span className="text-emerald-400 uppercase tracking-widest">{trans.signal}</span>
                         </div>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="bg-black/40 border border-white/5 rounded-3xl p-6 backdrop-blur-md">
                  <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Clock className="w-3 h-3" /> Processing Timeline</h3>
                  <div className="space-y-3">
                    {FHIR_PROCESSING_TIMELINE.map((step, i) => {
                      const isVisible = activeMessageIndex >= i;
                      const isActuallyComplete = isConverged || isVisible;
                      return (
                        <div key={i} className={`flex items-center gap-3 transition-opacity ${isActuallyComplete ? 'opacity-100' : 'opacity-20'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${isActuallyComplete ? 'bg-indigo-400 shadow-[0_0_8px_#818cf8]' : 'bg-white/10'}`} />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-white/80">{step.label}</span>
                          {isActuallyComplete && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 ml-auto" />}
                        </div>
                      );
                    })}
                  </div>
               </div>

               {a2aLog.length > 0 && (
                 <div className="bg-black/40 border border-white/5 rounded-3xl p-6 backdrop-blur-md">
                    <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Share2 className="w-3 h-3" /> Specialist Discourse Feed</h3>
                    <div className="space-y-4">
                      {a2aLog.map((log: any, i: number) => {
                        const isVisible = activeMessageIndex >= i;
                        return (
                          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: isVisible ? 1 : 0.05, y: isVisible ? 0 : 10 }} className="p-3 rounded-xl bg-white/5 border border-white/5 relative group">
                            <div className="flex justify-between items-center mb-2">
                               <div className="flex items-center gap-2">
                                 <span className="text-[8px] font-bold uppercase text-indigo-400">{log.from}</span>
                                 <ArrowRight className="w-2 h-2 text-white/20" />
                                 <span className="text-[8px] font-bold uppercase text-white/60">{log.to}</span>
                               </div>
                               <span className="text-[7px] font-mono text-white/20 uppercase">{log.type}</span>
                            </div>
                            <p className="text-[9px] text-white/70 leading-relaxed italic">"{log.message}"</p>
                          </motion.div>
                        );
                      })}
                    </div>
                 </div>
               )}
            </aside>
          </motion.div>
        ) : (
          <motion.div
            key="report-view"
            initial={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
            className="absolute inset-0 z-40 overflow-y-auto pt-24 pb-24 px-6 lg:px-12 scrollbar-thin scrollbar-thumb-white/10"
          >
            <div className="w-full max-w-7xl mx-auto">
              
              <div className="flex flex-col items-center justify-center gap-4 mb-12">
                <div className="flex gap-4">
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1 }} className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
                    <span className="text-xs font-bold tracking-[0.2em] text-emerald-300 uppercase">Consensus Reached</span>
                  </motion.div>
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.1 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10">
                    <span className="text-xs font-bold tracking-[0.2em] text-indigo-300 uppercase">Data synchronized via FHIR</span>
                  </motion.div>
                </div>
                <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2 }} className="text-4xl md:text-5xl font-semibold tracking-tight text-white text-center">
                  {mode === "patient" ? "Health Assessment Summary" : "Clinical Decision Report"}
                </motion.h1>
                {mode === "doctor" && (
                  <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} onClick={() => setMode("patient")} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors mt-2">
                    View Patient Version →
                  </motion.button>
                )}
              </div>

              {mode === "patient" ? (
                // --- PATIENT MODE FULL GRID ---
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-7 flex flex-col gap-8">
                    {/* Health Alert */}
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.4 }} className="bg-[#0A0D20]/90 border border-orange-500/30 rounded-[2rem] p-8 md:p-10 backdrop-blur-2xl shadow-[0_0_50px_rgba(249,115,22,0.15)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[60px] rounded-full pointer-events-none" />
                      
                      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                        <div className="relative z-10">
                          <h2 className="text-sm font-bold tracking-[0.2em] text-orange-300 uppercase mb-3">Important Medical Alert</h2>
                          <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight leading-snug">There are signs that may indicate a serious condition affecting breathing or circulation.</h1>
                        </div>
                      </div>

                      <div className="pt-8 border-t border-white/10 relative z-10">
                        <div className="flex items-center gap-4 p-5 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                          <div className="p-3 rounded-full bg-orange-500/20"><AlertTriangle className="w-6 h-6 text-orange-400" /></div>
                          <div>
                            <p className="text-orange-300 font-bold uppercase tracking-wider text-sm mb-1">Risk Level</p>
                            <p className="text-white/90 font-medium">High risk — medical attention is needed.</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* What You Should Do */}
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.6 }} className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 md:p-10 backdrop-blur-md">
                      <h2 className="text-sm font-bold tracking-[0.2em] text-white/50 uppercase mb-8">What You Should Do</h2>
                      <ul className="space-y-6">
                        <li className="flex gap-5 items-center">
                          <div className="p-2 rounded-full bg-rose-500/20 shrink-0"><Check className="w-5 h-5 text-rose-400" /></div>
                          <p className="text-white/90 text-lg font-medium">Seek urgent medical care now.</p>
                        </li>
                        <li className="flex gap-5 items-center">
                          <div className="p-2 rounded-full bg-rose-500/20 shrink-0"><Check className="w-5 h-5 text-rose-400" /></div>
                          <p className="text-white/90 text-lg font-medium">Go to the emergency department if symptoms continue or worsen.</p>
                        </li>
                        <li className="flex gap-5 items-center">
                          <div className="p-2 rounded-full bg-rose-500/20 shrink-0"><Check className="w-5 h-5 text-rose-400" /></div>
                          <p className="text-white/90 text-lg font-medium">Do not delay medical evaluation.</p>
                        </li>
                        <li className="flex gap-5 items-center">
                          <div className="p-2 rounded-full bg-rose-500/20 shrink-0"><Check className="w-5 h-5 text-rose-400" /></div>
                          <p className="text-white/90 text-lg font-medium">Bring your lab results and scan images with you.</p>
                        </li>
                      </ul>
                    </motion.div>
                  </div>

                  <div className="lg:col-span-5 flex flex-col gap-8">
                    {/* Simple Explanation */}
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.8 }} className="bg-indigo-500/10 border border-indigo-500/30 rounded-[2rem] p-8 md:p-10 backdrop-blur-md relative overflow-hidden group">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.15)_0%,_transparent_70%)] pointer-events-none" />
                      <h2 className="text-sm font-bold tracking-[0.2em] text-indigo-300 uppercase mb-6 relative z-10">Simple Explanation</h2>
                      <p className="text-white/80 font-light leading-relaxed text-lg relative z-10">
                        Diagora reviewed the symptoms, lab results, and uploaded scan. The system found warning signs that should be checked by a clinician.
                      </p>
                    </motion.div>

                    {/* What This Does NOT Mean */}
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 2.0 }} className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 md:p-10 backdrop-blur-md">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-xl bg-white/5 shrink-0"><Info className="w-5 h-5 text-white/50" /></div>
                        <div>
                          <p className="text-white/80 font-medium mb-1.5">What This Does NOT Mean</p>
                          <p className="text-sm text-white/40 font-light">This does not confirm a diagnosis. A licensed doctor must review the case.</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Patient Evidence Summary */}
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 2.2 }} className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 md:p-10 backdrop-blur-md">
                      <h2 className="text-sm font-bold tracking-[0.2em] text-white/50 uppercase mb-6">Patient Evidence Summary</h2>
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                          <Activity className="w-5 h-5 text-indigo-400" />
                          <div>
                            <p className="text-white/90 text-sm font-medium">Symptoms</p>
                            <p className="text-white/50 text-xs">Shortness of breath, chest discomfort</p>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                          <FlaskConical className="w-5 h-5 text-indigo-400" />
                          <div>
                            <p className="text-white/90 text-sm font-medium">Labs</p>
                            <p className="text-white/50 text-xs">One result may be abnormal</p>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                          <ImageIcon className="w-5 h-5 text-indigo-400" />
                          <div>
                            <p className="text-white/90 text-sm font-medium">Imaging</p>
                            <p className="text-white/50 text-xs">Scan needs clinician review</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* CTAs */}
                    <div className="flex flex-col gap-4 mt-2">
                      <button 
                        onClick={() => { setShareLink(null); setShareEmail(""); setShareModalOpen(true); }}
                        className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                      >
                        Share With Doctor
                      </button>
                      <button onClick={() => setMode("doctor")} className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold tracking-widest uppercase transition-all">
                        View Doctor Report
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // --- DOCTOR MODE FULL GRID ---
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column (Diagnosis & Reasoning) */}
                <div className="lg:col-span-7 flex flex-col gap-8">
                  
                  {/* NEW: Decision Justification (FHIR-Backed) */}
                  <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.5 }} className="bg-[#0A0D20]/90 border border-indigo-500/30 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-2xl shadow-[0_0_50px_rgba(129,140,248,0.1)] relative overflow-hidden mb-8">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[60px] rounded-full pointer-events-none" />
                      <div className="flex items-center gap-4 mb-8">
                        <div className="p-4 rounded-[1.5rem] bg-indigo-500/10 border border-indigo-500/20"><Brain className="w-8 h-8 text-indigo-400" /></div>
                        <div>
                          <h2 className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em] mb-1">Decision Justification</h2>
                          <h1 className="text-3xl font-semibold text-white tracking-tight">FHIR-Backed Logic Path</h1>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div>
                          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Check className="w-3 h-3" /> Primary Supporting Evidence
                          </h3>
                          <div className="space-y-3">
                            {[
                              { ref: "DiagnosticReport/ct-chest-001", val: "Filling defect in right main pulmonary artery", agent: "Imaging Analyzer" },
                              { ref: "Observation/d-dimer-001", val: "2.4 mg/L (Reference: < 0.5 mg/L)", agent: "Labs Agent" }
                            ].map((item, i) => (
                              <div key={i} className={`p-4 rounded-2xl border flex flex-col gap-1 transition-all ${missingDataSource === (item.ref.includes('ct-chest') ? 'imaging' : 'labs') ? 'bg-rose-500/10 border-rose-500/30 opacity-40 grayscale' : 'bg-white/5 border-white/10'}`}>
                                <span className="text-[9px] font-mono text-indigo-300">{item.ref} {missingDataSource === (item.ref.includes('ct-chest') ? 'imaging' : 'labs') && '(MISSING)'}</span>
                                <span className="text-sm font-medium text-white/90">{item.val}</span>
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">Sourced by: {item.agent}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <X className="w-3 h-3" /> Contradicting Evidence Adjudicated
                          </h3>
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1">
                            <span className="text-[9px] font-mono text-indigo-300">Observation/troponin-001</span>
                            <span className="text-sm font-medium text-white/90">Value: Normal (0.01 ng/mL)</span>
                            <p className="text-[10px] text-white/40 mt-2 leading-relaxed">System adjudicated: Normal troponin weakens ACS hypothesis but does not rule out PE. Evidence weight shifted toward PE based on CT-Chest findings.</p>
                          </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                           <h3 className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-2">Synthesis Logic</h3>
                           <p className="text-xs text-white/70 leading-relaxed italic">"The confluence of structural vascular obstruction (CT) and elevated D-dimer (Labs) creates a high-probability clinical signal for Pulmonary Embolism, overriding initial cardiac symptoms."</p>
                        </div>

                        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                           <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-4">Why NOT Other Diagnoses</h3>
                           <div className="space-y-4">
                             <div>
                               <h4 className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider mb-1">Acute Coronary Syndrome (ACS)</h4>
                               <ul className="space-y-1">
                                 <li className="text-[10px] text-white/40 flex items-start gap-2"><div className="w-1 h-1 rounded-full bg-indigo-400 mt-1" /> Normal troponin</li>
                                 <li className="text-[10px] text-white/40 flex items-start gap-2"><div className="w-1 h-1 rounded-full bg-indigo-400 mt-1" /> No ischemic pattern</li>
                               </ul>
                             </div>
                             <div>
                               <h4 className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider mb-1">Pneumonia</h4>
                               <ul className="space-y-1">
                                 <li className="text-[10px] text-white/40 flex items-start gap-2"><div className="w-1 h-1 rounded-full bg-indigo-400 mt-1" /> CT negative</li>
                                 <li className="text-[10px] text-white/40 flex items-start gap-2"><div className="w-1 h-1 rounded-full bg-indigo-400 mt-1" /> No fever</li>
                               </ul>
                             </div>
                           </div>
                        </div>
                      </div>
                  </motion.div>

                  {/* Diagnosis Card */}
                  <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.4 }} className="bg-[#0A0D20]/90 border border-indigo-500/30 rounded-[2rem] p-8 md:p-10 backdrop-blur-2xl shadow-[0_0_50px_rgba(99,102,241,0.15)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-3">
                            <h2 className="text-sm font-bold tracking-[0.2em] text-indigo-300 uppercase">AI-Supported Clinical Impression</h2>
                            {!clinicianReviewed && reviewDecision !== 'more-evidence' && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-300 uppercase tracking-widest animate-pulse">Clinician confirmation required</span>
                            )}
                            {reviewDecision === 'more-evidence' && (
                              <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-300 uppercase tracking-widest">Pending Additional Evidence</span>
                            )}
                          </div>
                          <SourceTooltip term={reviewDecision === 'rejected' ? 'Recommendation Rejected' : (aiResult?.primaryClinicalImpression || "Pulmonary Embolism")}>
                            <div className={`text-4xl md:text-5xl font-semibold tracking-tight transition-colors ${reviewDecision === 'rejected' ? 'text-rose-500' : 'text-white'}`}>
                              {reviewDecision === 'rejected' ? 'REJECTED' : (aiResult?.primaryClinicalImpression || "Pulmonary Embolism")}
                            </div>
                          </SourceTooltip>
                          {reviewDecision === 'rejected' ? (
                            <p className="text-xl text-rose-300/60 mt-3 font-light">AI recommendation dismissed by clinician — Please re-evaluate patient case manually</p>
                          ) : reviewDecision === 'more-evidence' ? (
                            <p className="text-xl text-amber-300/60 mt-3 font-light">Diagnostic consensus deferred — Awaiting requested laboratory/imaging evidence</p>
                          ) : (
                            <p className="text-xl text-white/60 mt-3 font-light">
                              Suspected {(aiResult?.primaryClinicalImpression || "Pulmonary Embolism").replace(/^Suspected\s+/i, '')} with hypoxia and tachycardia — requires clinician confirmation
                            </p>
                          )}
                        </div>
                      <div className={`px-5 py-3 rounded-2xl border flex items-center gap-3 relative z-10 shrink-0 ${aiResult?.riskLevel === 'critical' ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-rose-500/15 border-rose-500/30 text-rose-300'}`}>
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-bold uppercase tracking-wider text-sm">{aiResult?.riskLevel ? `${aiResult.riskLevel.toUpperCase()} RISK` : "High Risk"}</span>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-white/10 relative z-10">
                      <div className="flex flex-col items-end gap-2 mb-4">
                        <button 
                          onClick={playBriefing}
                          className="mb-2 px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all flex items-center gap-2 group"
                        >
                          {isPlayingVoice ? <Square className="w-4 h-4 text-indigo-400 fill-indigo-400" /> : <Play className="w-4 h-4 text-indigo-400 fill-indigo-400 group-hover:scale-110 transition-transform" />}
                          <span className="text-xs font-bold tracking-widest uppercase text-indigo-300">{isPlayingVoice ? "Stop Briefing" : "Play Doctor Briefing"}</span>
                        </button>
                        
                        <div className="flex justify-between items-end w-full">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold tracking-widest text-white/50 uppercase">System Confidence Score</span>
                            {missingDataSource && (
                              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-1">Confidence Degraded — Data Simulation Active</span>
                            )}
                          </div>
                          <motion.span key={uncertaintyData.score} initial={{ scale: 1.2, color: '#f43f5e' }} animate={{ scale: 1, color: '#10b981' }} className="text-5xl font-bold">{formatPercent(uncertaintyData.score)}</motion.span>
                        </div>
                      </div>
                      <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden mb-8">
                        <motion.div 
                          initial={{ width: 0 }} animate={{ width: `${uncertaintyData.score}%` }} transition={{ duration: 1.2, ease: "easeOut" }} 
                          className={`h-full rounded-full relative ${uncertaintyData.score < 80 ? 'bg-gradient-to-r from-amber-500 to-amber-300' : 'bg-gradient-to-r from-emerald-500 to-emerald-300'}`}
                        >
                           <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </motion.div>
                      </div>

                      {/* Diagnostic Uncertainty Panel */}
                      <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: 2.5}} className={`p-6 rounded-[2rem] border backdrop-blur-md ${uncertaintyData.level === 'LOW' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
                        <div className="flex justify-between items-start mb-6">
                           <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl ${uncertaintyData.level === 'LOW' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}><ShieldCheck className="w-5 h-5" /></div>
                              <div>
                                 <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Diagnostic Uncertainty</h3>
                                 <div className={`text-lg font-bold tracking-tight ${uncertaintyData.level === 'LOW' ? 'text-emerald-400' : 'text-amber-400'}`}>{uncertaintyData.level}</div>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Reliability Score</div>
                              <div className="text-lg font-mono text-white/90">{formatPercent(100 - uncertaintyData.uncertainty)}</div>
                           </div>
                        </div>
                        
                        <div className="space-y-6">
                           <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-white/70 leading-relaxed italic">
                              "{uncertaintyData.reason}"
                           </div>

                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-white/5">
                              {Object.entries(uncertaintyData.drivers).map(([key, val], i) => (
                                 <div key={i} className="flex flex-col gap-1">
                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{key}</span>
                                    <span className={`text-[10px] font-bold ${val === 'Strong' || val === 'High' || val === 'Full' ? 'text-emerald-400' : val === 'Weak' ? 'text-rose-400' : 'text-amber-400'}`}>{val}</span>
                                 </div>
                              ))}
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                               {uncertaintyData.points.map((p: string, i: number) => (
                                 <div key={i} className="px-3 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                                    <div className={`w-1 h-1 rounded-full ${uncertaintyData.level === 'LOW' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{p}</span>
                                 </div>
                              ))}
                           </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Critical Turning Point */}
                  <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.5 }} className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/20 backdrop-blur-md relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4"><Zap className="w-5 h-5 text-indigo-400/30" /></div>
                     <h2 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4">Critical Turning Point</h2>
                     <p className="text-xl font-medium text-white/90 leading-tight mb-2">{aiResult?.criticalTurningPoint?.trigger || detectTurningPoint()}</p>
                     <p className="text-sm text-white/40 mb-4">{aiResult?.criticalTurningPoint?.explanation}</p>
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        <span className="text-[8px] font-bold text-indigo-300 uppercase tracking-[0.1em]">Diagnosis Shift Triggered by FHIR Evidence</span>
                     </div>
                  </motion.div>

                    {/* AI Doctor Briefing Section */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.1 }} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-md mb-8 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[60px] rounded-full pointer-events-none" />
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h2 className="text-sm font-bold tracking-[0.2em] text-indigo-300 uppercase mb-2">AI Doctor Briefing</h2>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Spoken Case Summary • Med-Speech v2</p>
                        </div>
                        <button 
                          onClick={handlePlayBriefing}
                          className={`flex items-center gap-2 px-6 py-2.5 rounded-full border transition-all ${isSpeaking ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-white/5 border-white/10 text-indigo-300 hover:bg-white/10'}`}
                        >
                          {isSpeaking ? (
                            <div className="flex gap-1 items-center">
                              <div className="flex gap-0.5">
                                <div className="w-1 h-3 bg-white animate-bounce" style={{animationDelay: '0.1s'}}/>
                                <div className="w-1 h-4 bg-white animate-bounce" style={{animationDelay: '0.2s'}}/>
                                <div className="w-1 h-2 bg-white animate-bounce" style={{animationDelay: '0.3s'}}/>
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest">Briefing...</span>
                            </div>
                          ) : (
                            <div className="flex gap-2 items-center">
                              <PlayCircle className="w-4 h-4" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Play Briefing</span>
                            </div>
                          )}
                        </button>
                      </div>
                      <div className="p-8 rounded-[2rem] bg-black/40 border border-white/5 relative">
                        <div className="absolute top-4 left-4"><Quote className="w-8 h-8 text-white/5" /></div>
                        <p className="text-lg text-white/90 leading-relaxed font-light italic relative z-10 pl-6">
                          {BRIEFING_TEXT}
                        </p>
                        <div className="mt-6 flex items-center gap-3 pl-6">
                          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                          <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest">Synthetic Medical Synthesis • Certified Logic</span>
                        </div>
                      </div>
                    </motion.div>

                  {/* Primary Diagnosis Justification */}
                  <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.55 }} className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 md:p-10 backdrop-blur-md">
                    <h2 className="text-sm font-bold tracking-[0.2em] text-white/50 uppercase mb-8">Primary Diagnosis Justification</h2>
                    <ul className="space-y-4">
                      {(aiResult?.hypotheses[0]?.supportingEvidence?.filter((e: any) => typeof e === 'string' && e.length > 5).map((e: string) => ({ text: e, type: "confirmed" })) || [
                        { text: "Imaging confirms vascular obstruction in right main pulmonary artery", type: "confirmed" },
                        { text: "Elevated D-dimer (2.4 mg/L) supports acute thrombotic event", type: "confirmed" },
                        { text: "Pulmonology and Risk agents reached high-confidence consensus", type: "consensus" },
                        { text: "Cardiology hypothesis deprioritized after normal Troponin & imaging", type: "rejected" }
                      ]).map((item: any, i: number) => (
                        <li key={i} className="flex gap-4 items-center p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                          <div className={`p-1.5 rounded-lg ${item.type === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' : item.type === 'consensus' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-white/10 text-white/40'}`}>
                            {item.type === 'confirmed' ? <Check className="w-3.5 h-3.5" /> : item.type === 'consensus' ? <Brain className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                    {/* Clinical Reasoning */}
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.6 }} className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 md:p-10 backdrop-blur-md mt-6">
                      <h2 className="text-sm font-bold tracking-[0.2em] text-white/50 uppercase mb-8">Clinical Reasoning</h2>
                      <ul className="space-y-6">
                        <li className="flex gap-5 items-start">
                          <div className="mt-1 p-1 rounded-full bg-indigo-500/20 shrink-0"><Check className="w-4 h-4 text-indigo-400" /></div>
                          <div>
                            <p className="text-white/90 text-lg font-medium mb-1">Presentation Profile</p>
                            <p className="text-white/50 font-light leading-relaxed">Sudden onset shortness of breath paired with clear lung fields is highly specific for pulmonary vascular obstruction.</p>
                          </div>
                        </li>
                        <li className="flex gap-5 items-start">
                          <div className="mt-1 p-1 rounded-full bg-indigo-500/20 shrink-0"><Check className="w-4 h-4 text-indigo-400" /></div>
                          <div>
                            <SourceTooltip term="D-dimer 2.4 mg/L">
                              <div className="text-white/90 text-lg font-medium mb-1">Biomarker Confirmation</div>
                            </SourceTooltip>
                            <div className="text-white/50 font-light leading-relaxed">Significantly elevated D-dimer (2.4 mg/L) confirms active thrombosis, supporting the PE hypothesis.</div>
                          </div>
                        </li>
                        <li className="flex gap-5 items-start">
                          <div className="mt-1 p-1 rounded-full bg-indigo-500/20 shrink-0"><Check className="w-4 h-4 text-indigo-400" /></div>
                          <div>
                            <p className="text-white/90 text-lg font-medium mb-1">Contradiction Resolution</p>
                            <p className="text-white/50 font-light leading-relaxed">Normal Troponin levels rule out primary myocardial infarction, safely overriding the initial Cardiac hypothesis.</p>
                          </div>
                        </li>
                      </ul>
                    </motion.div>

                    {/* Differentials & Must Not Miss */}
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.7 }} className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 md:p-10 backdrop-blur-md mt-6">
                      <h2 className="text-sm font-bold tracking-[0.2em] text-white/50 uppercase mb-8">Differential & Must-Not-Miss</h2>
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-xs font-bold text-indigo-300 uppercase mb-3">Top Differentials</h3>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm">Acute Coronary Syndrome (Ruled out)</span>
                            <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm">Aortic Dissection (Unlikely)</span>
                            <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm">Pneumothorax (Ruled out by CT)</span>
                          </div>
                        </div>

                        {/* Alternative Critical Considerations Section */}
                        <div className="p-6 rounded-[1.5rem] bg-amber-500/5 border border-amber-500/20">
                           <h3 className="text-xs font-bold text-amber-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" /> Alternative Critical Considerations
                           </h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {[
                                { name: "Aortic Dissection", risk: "High risk if missed", status: "Deprioritized", reason: "Absence of structural widening on initial scan & stable blood pressure profile." },
                                { name: "Severe Pneumonia", risk: "Overlapping symptoms", status: "Deprioritized", reason: "Normal inflammatory markers and inconsistent imaging patterns." }
                              ].map((item, i) => (
                                <div key={i} className="p-4 rounded-xl bg-black/20 border border-white/5">
                                   <div className="flex justify-between items-start mb-2">
                                      <span className="text-[11px] font-bold text-white/90">{item.name}</span>
                                      <span className="text-[7px] font-black uppercase bg-white/10 text-white/40 px-1.5 py-0.5 rounded tracking-widest">{item.status}</span>
                                   </div>
                                   <div className="text-[9px] text-amber-400/60 font-bold uppercase tracking-tighter mb-2">{item.risk}</div>
                                   <p className="text-[10px] text-white/40 leading-relaxed">{item.reason}</p>
                                </div>
                              ))}
                           </div>
                        </div>

                        <div>
                          <h3 className="text-xs font-bold text-rose-300 uppercase mb-3">Must-Not-Miss</h3>
                          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-sm font-medium">
                            Massive PE with Right Ventricular Strain
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Right Column (Agents & Actions) */}
                  <div className="lg:col-span-5 flex flex-col">
                    
                    {/* Clinician Control */}
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.2 }} className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 backdrop-blur-md relative overflow-hidden mb-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-indigo-400" />
                          <h2 className="text-sm font-bold tracking-[0.2em] text-white/50 uppercase">Clinician Review Gate</h2>
                        </div>
                        <div className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${
                          reviewDecision === 'approved' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                          reviewDecision === 'modified' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' :
                          reviewDecision === 'more-evidence' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                          reviewDecision === 'rejected' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                          'bg-white/5 border-white/10 text-white/20 animate-pulse'
                        }`}>
                          {reviewDecision ? reviewDecision.replace('-', ' ') : 'Pending Review'}
                        </div>
                      </div>
                      
                      <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="mt-1 w-4 h-4 text-indigo-500/50 shrink-0" />
                          <p className="text-white/70 text-sm font-light leading-relaxed">AI generated this recommendation based on synthesis of multi-agent debate and clinical evidence.</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="mt-1 w-4 h-4 text-indigo-500/50 shrink-0" />
                          <p className="text-white/70 text-sm font-light leading-relaxed">Review all underlying evidence, including diagnostic images and lab results, before taking action.</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="mt-1 w-4 h-4 text-indigo-500/50 shrink-0" />
                          <p className="text-white/70 text-sm font-light leading-relaxed">Licensed clinician must confirm, modify, or reject the recommendation for the patient record.</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        {reviewDecision === "approved" ? (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold tracking-[0.1em] uppercase text-xs flex flex-col items-center justify-center gap-3 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                            <ShieldCheck className="w-8 h-8" />
                            <span className="text-center">Recommendation approved by clinician. Audit trail updated.</span>
                            <div className="text-[10px] text-emerald-500/60 font-mono mt-2">Record Hash: 0x82f...3a9</div>
                          </motion.div>
                        ) : reviewDecision === "modified" ? (
                           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold tracking-[0.1em] uppercase text-xs flex flex-col items-center justify-center gap-3 shadow-[0_0_40px_rgba(99,102,241,0.1)]">
                             <CheckCircle2 className="w-8 h-8" />
                             <span className="text-center">Plan modified by clinician. AI recommendation preserved for audit.</span>
                             {reviewNote && <p className="text-[9px] font-light text-white/50 lowercase mt-2 italic px-4">"{reviewNote}"</p>}
                           </motion.div>
                        ) : reviewDecision === "more-evidence" ? (
                           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold tracking-[0.1em] uppercase text-xs flex flex-col items-center justify-center gap-3 shadow-[0_0_40px_rgba(245,158,11,0.1)]">
                             <FlaskConical className="w-8 h-8" />
                             <span className="text-center">Additional evidence requested. Case remains pending.</span>
                             <div className="flex flex-wrap gap-2 justify-center mt-2">
                               {evidenceRequested.map((e, idx) => <span key={idx} className="bg-amber-500/20 px-2 py-1 rounded-md text-[8px]">{e}</span>)}
                             </div>
                           </motion.div>
                        ) : reviewDecision === "rejected" ? (
                           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold tracking-[0.1em] uppercase text-xs flex flex-col items-center justify-center gap-3 shadow-[0_0_40px_rgba(244,63,94,0.1)]">
                             <ShieldAlert className="w-8 h-8" />
                             <span className="text-center">Recommendation rejected by clinician. Reason recorded.</span>
                             {reviewNote && <p className="text-[9px] font-light text-rose-300/50 lowercase mt-2 italic px-4">"{reviewNote}"</p>}
                           </motion.div>
                        ) : (
                          <>
                            {showReviewPanel === "modify" ? (
                              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 mb-4">
                                 <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Modify Clinical Plan</h4>
                                 <textarea 
                                   value={reviewNote}
                                   onChange={(e) => setReviewNote(e.target.value)}
                                   placeholder="Enter modified clinical plan..."
                                   className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-colors"
                                 />
                                 <div className="flex gap-2">
                                   <button onClick={() => setShowReviewPanel(null)} className="flex-1 py-2 rounded-lg bg-white/5 text-white/40 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Cancel</button>
                                   <button 
                                     onClick={() => {
                                       setReviewDecision("modified"); setClinicianReviewed(true);
                                       setAuditLogs([...auditLogs, "Clinician modified plan"]);
                                     }}
                                     disabled={!reviewNote.trim()}
                                     className="flex-[2] py-2 rounded-lg bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-400 transition-all disabled:opacity-50 disabled:pointer-events-none"
                                   >
                                     Save Modified Plan
                                   </button>
                                 </div>
                              </motion.div>
                            ) : showReviewPanel === "evidence" ? (
                              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 mb-4">
                                 <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Request More Evidence</h4>
                                 <div className="space-y-2">
                                   {[
                                     "Repeat troponin in 3 hours",
                                     "CT Pulmonary Angiography confirmation",
                                     "Echocardiography for RV strain",
                                     "ABG / oxygenation trend"
                                   ].map((item, i) => (
                                     <label key={i} className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5 hover:bg-white/5 transition-all cursor-pointer group">
                                       <input 
                                         type="checkbox" 
                                         checked={evidenceRequested.includes(item)}
                                         onChange={(e) => {
                                           if (e.target.checked) setEvidenceRequested([...evidenceRequested, item]);
                                           else setEvidenceRequested(evidenceRequested.filter(x => x !== item));
                                         }}
                                         className="w-4 h-4 rounded border-white/10 bg-white/5 text-amber-500 focus:ring-amber-500 focus:ring-offset-0" 
                                       />
                                       <span className="text-[11px] text-white/60 group-hover:text-white transition-colors">{item}</span>
                                     </label>
                                   ))}
                                 </div>
                                 <div className="flex gap-2">
                                   <button onClick={() => setShowReviewPanel(null)} className="flex-1 py-2 rounded-lg bg-white/5 text-white/40 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Cancel</button>
                                   <button 
                                     onClick={() => {
                                       setReviewDecision("more-evidence");
                                       setAuditLogs([...auditLogs, "Clinician requested more evidence"]);
                                     }}
                                     disabled={evidenceRequested.length === 0}
                                     className="flex-[2] py-2 rounded-lg bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-400 transition-all disabled:opacity-50 disabled:pointer-events-none"
                                   >
                                     Submit Evidence Request
                                   </button>
                                 </div>
                              </motion.div>
                            ) : showReviewPanel === "reject" ? (
                              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-4 mb-4">
                                 <div className="flex items-center gap-2">
                                   <AlertTriangle className="w-4 h-4 text-rose-400" />
                                   <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Reject AI Recommendation</h4>
                                 </div>
                                 <p className="text-[10px] text-rose-300/60 leading-relaxed font-light italic">Rejection requires a clinician-provided reason for the permanent audit trail.</p>
                                 <textarea 
                                   value={reviewNote}
                                   onChange={(e) => setReviewNote(e.target.value)}
                                   placeholder="Enter clinical rationale for rejection..."
                                   className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-rose-500/50 transition-colors"
                                 />
                                 <div className="flex gap-2">
                                   <button onClick={() => setShowReviewPanel(null)} className="flex-1 py-2 rounded-lg bg-white/5 text-white/40 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Cancel</button>
                                   <button 
                                     onClick={() => {
                                       setReviewDecision("rejected"); setClinicianReviewed(true);
                                       setAuditLogs([...auditLogs, "Clinician rejected recommendation"]);
                                     }}
                                     disabled={!reviewNote.trim()}
                                     className="flex-[2] py-2 rounded-lg bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-rose-400 transition-all disabled:opacity-50 disabled:pointer-events-none"
                                   >
                                     Confirm Rejection
                                   </button>
                                 </div>
                              </motion.div>
                            ) : (
                              <>
                                <button 
                                  onClick={() => {
                                    setReviewDecision("approved"); setClinicianReviewed(true);
                                    setAuditLogs([...auditLogs, "Clinician approved recommendation"]);
                                  }} 
                                  className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-widest uppercase text-xs transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)]"
                                >
                                  Approve Recommendation
                                </button>
                                <div className="grid grid-cols-1 gap-2 mt-1">
                                  <button onClick={() => setShowReviewPanel("modify")} className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-[10px] font-bold tracking-widest uppercase transition-all">Modify Plan</button>
                                  <button onClick={() => setShowReviewPanel("evidence")} className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-[10px] font-bold tracking-widest uppercase transition-all">Request More Evidence</button>
                                  <button onClick={() => setShowReviewPanel("reject")} className="w-full py-3 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-bold tracking-widest uppercase transition-all">Reject Recommendation</button>
                                </div>
                              </>
                            )}
                          </>
                        )}
                        
                        <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
                          <button onClick={() => setNoteModalOpen(true)} className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white text-[9px] font-bold tracking-widest uppercase transition-all">
                            {savedNote ? "Edit Clinical Note" : "Add Clinical Note"}
                          </button>
                          <button 
                            onClick={() => {
                              setShowExportToast(true);
                              const params = new URLSearchParams({
                                decision: reviewDecision || '',
                                score: uncertaintyData.score.toString(),
                                note: reviewNote || '',
                                briefing: BRIEFING_TEXT
                              });
                              setTimeout(() => {
                                setShowExportToast(false);
                                window.open(`/report/export?${params.toString()}`, '_blank');
                              }, 1000);
                            }}
                            className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white text-[9px] font-bold tracking-widest uppercase transition-all"
                          >
                            Export Clinical Report
                          </button>
                        </div>
                      </div>

                      {savedNote && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 pt-6 border-t border-white/10">
                          <h3 className="text-[10px] font-bold text-indigo-300 uppercase mb-3">Clinician Review Summary</h3>
                          <div className="p-4 rounded-xl bg-white/5 border border-white/10 relative">
                            <p className="text-white/80 font-light text-sm italic">"{savedNote}"</p>
                            <p className="absolute bottom-2 right-4 text-[8px] font-medium text-white/20 uppercase tracking-[0.2em]">Validated at {new Date().toLocaleTimeString()}</p>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Actions */}
                  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.8 }} className="bg-indigo-500/10 border border-indigo-500/30 rounded-[2rem] p-8 md:p-10 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.15)_0%,_transparent_70%)] pointer-events-none transition-opacity group-hover:opacity-70" />
                    <h2 className="text-sm font-bold tracking-[0.2em] text-indigo-300 uppercase mb-8 relative z-10">
                      {reviewDecision === 'modified' ? 'Modified Clinical Plan' : 'Recommended Next Steps'}
                    </h2>
                    <div className="space-y-4 relative z-10">
                      {(reviewDecision === 'modified' && reviewNote) ? (
                        <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                          <p className="text-sm text-white/90 leading-relaxed italic">"{reviewNote}"</p>
                          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                            <ShieldCheck className="w-3 h-3" /> Overriding AI Plan
                          </div>
                        </div>
                      ) : (
                        clinicalSteps.map((step, i) => (
                          <button 
                            key={i} 
                            onClick={() => setSelectedStep(step)}
                            className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#0A0D20]/50 border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer group/item text-left"
                          >
                            <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-colors ${selectedStep?.title === step.title ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-white/40 group-hover/item:bg-indigo-500/20 group-hover/item:text-indigo-300'}`}>{i+1}</div>
                            <span className={`font-medium transition-colors ${selectedStep?.title === step.title ? 'text-white' : 'text-white/80 group-hover/item:text-white'}`}>{step.title}</span>
                            <ChevronRight className={`w-4 h-4 shrink-0 ml-auto transition-colors ${selectedStep?.title === step.title ? 'text-indigo-400' : 'text-white/20 group-hover/item:text-indigo-400'}`} />
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>

                  {/* Safety Check Simulation */}
                  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 2.2 }} className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 md:p-10 backdrop-blur-md">
                    {!safetyCheckOpen ? (
                      <button onClick={() => setSafetyCheckOpen(true)} className="w-full py-4 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all flex items-center justify-center gap-3 group">
                        <ShieldAlert className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold tracking-widest text-indigo-300 uppercase text-sm">Run Safety Check Simulation</span>
                      </button>
                    ) : (
                      <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: "auto"}} className="overflow-hidden">
                        <h2 className="text-sm font-bold tracking-[0.2em] text-orange-300 uppercase mb-6 flex items-center gap-3">
                          <AlertTriangle className="w-4 h-4" /> What if the wrong pathway is followed?
                        </h2>
                        <ul className="space-y-4 mb-6">
                          <li className="flex gap-4 items-start">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500/50 shrink-0" />
                            <p className="text-white/70 text-sm font-light">If treated as ACS only, PE may be missed entirely.</p>
                          </li>
                          <li className="flex gap-4 items-start">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500/50 shrink-0" />
                            <p className="text-white/70 text-sm font-light">Delayed anticoagulation significantly increases deterioration risk.</p>
                          </li>
                          <li className="flex gap-4 items-start">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500/50 shrink-0" />
                            <p className="text-white/70 text-sm font-light">Immediate respiratory collapse risk remains unmitigated.</p>
                          </li>
                        </ul>
                        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                          <p className="text-orange-200 text-sm font-medium">Safety Guardrail: Pulmonary Embolism must be ruled out before discharge.</p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Agent Consensus */}
                  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 2.4 }} className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 md:p-10 backdrop-blur-md flex-1">
                    <h2 className="text-sm font-bold tracking-[0.2em] text-white/50 uppercase mb-8">Agent Consensus Map</h2>
                    <div className="space-y-4">
                      {[
                        { agent: "Pulmonologist", icon: Wind, status: "Primary Support", color: "emerald", active: true },
                        { agent: "Labs Agent", icon: FlaskConical, status: "Biomarker Confirmed", color: "emerald", active: true },
                        { agent: "Imaging Analyzer", icon: ImageIcon, status: "Structural Scans Verified", color: "emerald", active: true },
                        { agent: "Risk Analyst", icon: ShieldAlert, status: "Escalated Priority", color: "rose", active: true },
                        { agent: "Cardiologist", icon: Activity, status: "Hypothesis Conceded", color: "slate", active: false },
                      ].map((a, i) => {
                        const Icon = a.icon;
                        return (
                          <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                            <div className={`p-3 shrink-0 rounded-xl ${a.active ? (a.color === 'emerald' ? 'bg-emerald-500/20' : 'bg-rose-500/20') : 'bg-white/5'}`}>
                              <Icon className={`w-5 h-5 ${a.active ? (a.color === 'emerald' ? 'text-emerald-400' : 'text-rose-400') : 'text-white/30'}`} />
                            </div>
                            <div>
                              <p className={`font-medium ${a.active ? 'text-white' : 'text-white/40'}`}>{a.agent}</p>
                              <p className={`text-sm ${a.active ? (a.color === 'emerald' ? 'text-emerald-400/80' : 'text-rose-400/80') : 'text-white/30'}`}>{a.status}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>

                  {/* Visual Evidence Summary */}
                  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 2.6 }} className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 md:p-10 backdrop-blur-md flex-1 mt-2">
                    <h2 className="text-sm font-bold tracking-[0.2em] text-white/50 uppercase mb-8">Evidence Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {/* CT Scan */}
                       <div onClick={() => { setModalData({type: 'imaging', title: 'CT Chest - AI Highlighted', url: '/ct-scan.png', hasHighlight: true, highlightLabel: 'Thrombus Detected'}); setModalOpen(true); }} className="p-3 bg-black/40 border border-white/10 rounded-2xl cursor-pointer hover:border-indigo-400/50 transition-all group">
                         <div className="w-full h-24 rounded-xl bg-[#050711] relative overflow-hidden mb-3">
                            <img src="/ct-scan.png" alt="CT Scan" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-500" />
                            <div className="absolute top-[50%] left-[60%] w-[30%] h-[50%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,_rgba(217,70,239,0.5)_0%,_transparent_100%)] mix-blend-screen" />
                         </div>
                         <p className="text-xs font-bold tracking-wider text-white/80 uppercase">CT Chest</p>
                         <p className="text-[10px] text-fuchsia-300 mt-1 uppercase font-semibold">Suspicious Region Detected</p>
                       </div>
                       {/* Labs */}
                       <div onClick={() => { setModalData({type: 'document', title: 'Comprehensive Metabolic Panel', url: '/lab-report.png'}); setModalOpen(true); }} className="p-3 bg-black/40 border border-white/10 rounded-2xl cursor-pointer hover:border-indigo-400/50 transition-all group">
                         <div className="w-full h-24 rounded-xl bg-[#050711] relative overflow-hidden mb-3 flex items-center justify-center">
                            <img src="/lab-report.png" alt="Lab Report" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-500" />
                         </div>
                         <p className="text-xs font-bold tracking-wider text-white/80 uppercase">Metabolic Panel</p>
                         <p className="text-[10px] text-emerald-400 mt-1 uppercase font-semibold">D-Dimer Elevated (2.4)</p>
                       </div>
                    </div>
                  </motion.div>

                    {/* Clinical Safety Controls */}
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 2.7 }} className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 md:p-10 backdrop-blur-md flex-1 mt-6">
                      <h2 className="text-sm font-bold tracking-[0.2em] text-white/50 uppercase mb-6 flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" /> Clinical Safety Controls
                      </h2>
                      <div className="grid grid-cols-1 gap-3">
                         {[
                          "AI does not provide final diagnosis",
                          "Clinician approval required before action",
                          "Emergency escalation supported",
                          "Evidence sources attached",
                          "FHIR data trace available",
                          "Audit log recorded"
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-[11px] font-medium text-white/70 uppercase tracking-wider">{item}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Audit Trail */}
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 2.8 }} className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 md:p-10 backdrop-blur-md flex-1 mt-6">
                      <h2 className="text-sm font-bold tracking-[0.2em] text-white/50 uppercase mb-6 flex items-center gap-3">
                        <History className="w-4 h-4 text-indigo-400" /> Audit Trail
                      </h2>
                      <div className="space-y-4 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                        {auditLogs.map((log, i) => (
                          <div key={i} className="relative flex items-start gap-3 pl-6">
                            <div className="absolute left-0 top-[6px] h-3.5 w-3.5 rounded-full border border-indigo-400/40 bg-indigo-500/20">
                              <div className="m-auto mt-[5px] h-1.5 w-1.5 rounded-full bg-indigo-300" />
                            </div>
                            <p className="text-xs leading-relaxed text-white/70">{log}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* NEW: Confidence Breakdown (FHIR-Driven) */}
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.7 }} className="bg-indigo-500/5 border border-indigo-500/20 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-md">
                       <h2 className="text-sm font-bold tracking-[0.2em] text-indigo-300 uppercase mb-8 flex items-center gap-3">
                         <ShieldCheck className="w-4 h-4" /> Diagnostic Certainty
                       </h2>
                       
                       <div className="space-y-6">
                         {[
                           { label: "Imaging Contribution", val: uncertaintyData.breakdown.imaging, icon: ImageIcon, ref: "ct-chest-001" },
                           { label: "Lab Evidence", val: uncertaintyData.breakdown.labs, icon: FlaskConical, ref: "d-dimer-001" },
                           { label: "Clinical Pattern", val: uncertaintyData.breakdown.pattern, icon: Activity, ref: "Symptom Logic" },
                           { label: "Risk Factors", val: uncertaintyData.breakdown.risk, icon: AlertCircle, ref: "pt-998-xx" }
                         ].map((c, i) => (
                           <div key={i} className="space-y-2">
                             <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                               <span className="flex items-center gap-2 text-white/60"><c.icon className="w-3 h-3" /> {c.label}</span>
                               <span className={c.val < 30 ? 'text-rose-400' : 'text-indigo-400'}>{formatPercent(c.val)}</span>
                             </div>
                             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${c.val <= 1 ? c.val * 100 : c.val}%` }} transition={{ duration: 1, delay: 2 + i * 0.1 }} className={`h-full rounded-full ${c.val < 30 ? 'bg-rose-500' : 'bg-indigo-500'}`} />
                             </div>
                             <span className="text-[7px] font-mono text-white/20 uppercase tracking-tighter">Source: {c.ref}</span>
                           </div>
                         ))}
                       </div>

                       <div className="mt-8 pt-8 border-t border-white/5">
                          <div className="flex flex-col items-center gap-2">
                             <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] font-medium">Combined Global Confidence</span>
                             <span className={`text-5xl font-black ${missingDataSource ? 'text-rose-500' : 'text-white'}`}>{formatPercent(uncertaintyData.score)}</span>
                             {missingDataSource && <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-2 animate-pulse">⚠ Critical Data Deficiency: {missingDataSource}</span>}
                          </div>
                       </div>
                    </motion.div>

                    {/* NEW: Decision Trace (Technical Audit) */}
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 2.8 }} className="bg-black/20 border border-white/10 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-md mt-6">
                       <h2 className="text-sm font-bold tracking-[0.2em] text-white/50 uppercase mb-8 flex items-center gap-3">
                         <History className="w-4 h-4" /> Technical Decision Trace
                       </h2>
                       <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/5">
                          {[
                            { from: "DiagnosticReport/ct-chest-001", tool: "Imaging Analyzer", result: "ImagingFinding: vascular obstruction", outcome: "Pulmonology hypothesis strengthened" },
                            { from: "Observation/d-dimer-001", tool: "Lab Interpreter", result: "LabSignal: coagulation high", outcome: "PE confidence increased" },
                            { from: "Observation/troponin-001", tool: "Lab Interpreter", result: "CardiacSignal: normal troponin", outcome: "ACS confidence reduced" },
                            { from: "Multi-Agent Consensus", tool: "Reasoning Engine", result: "Final Synthesis", outcome: "Primary Diagnosis: Pulmonary Embolism" }
                          ].map((step, i) => (
                            <div key={i} className="pl-8 relative group">
                               <div className="absolute left-0 top-[6px] w-[24px] h-[24px] rounded-full bg-[#0A0D20] border border-indigo-500/30 flex items-center justify-center group-hover:border-indigo-400 transition-colors">
                                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                               </div>
                               <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                     <span className="text-[9px] font-mono text-indigo-300">{step.from}</span>
                                     <ArrowRight className="w-2.5 h-2.5 text-white/10" />
                                     <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">{step.tool}</span>
                                  </div>
                                  <p className="text-[10px] text-white font-medium">{step.result}</p>
                                  <p className="text-[9px] text-emerald-400/80 italic">→ {step.outcome}</p>
                               </div>
                            </div>
                          ))}
                        </div>
                    </motion.div>

                    {/* FHIR Trace Panel */}
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 2.9 }} className="bg-indigo-500/5 border border-indigo-500/20 rounded-[2rem] p-8 md:p-10 backdrop-blur-md flex-1 mt-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-bold tracking-[0.2em] text-white/50 uppercase flex items-center gap-3">
                          <Database className="w-4 h-4 text-indigo-400" /> FHIR Interoperability Trace
                        </h2>
                        <button 
                          onClick={() => setFhirModalOpen(true)}
                          className="text-[8px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                        >
                          <Code className="w-3 h-3" /> View Raw FHIR Bundle
                        </button>
                      </div>
                      <div className="space-y-4">
                        {[
                          { label: "Patient/pt-998-xx", val: "65y Male", interpretation: "Risk Factors Mapped", agent: "Risk Analyst", term: "Metformin" },
                          { label: "Observation/d-dimer-001", val: "2.4 mg/L", interpretation: "CRITICAL HIGH", agent: "Labs → Pulmonology", term: "D-dimer 2.4 mg/L" },
                          { label: "Observation/troponin-001", val: "Normal", interpretation: "Normal", agent: "Labs → Cardiology", term: "Troponin normal" },
                          { label: "DiagnosticReport/ct-chest-001", val: "Filling Defect", interpretation: "Pathognomonic for PE", agent: "Imaging → All Agents", term: "CT filling defect" },
                          { label: "Condition/suspected-pe", val: "Confirmed", interpretation: "Primary Diagnosis", agent: "Reasoning Engine", term: "Pulmonary Embolism" }
                        ].map((item, i) => (
                          <SourceTooltip key={i} term={item.term}>
                            <div className="flex flex-col gap-2 p-4 rounded-xl bg-black/20 border border-white/5 hover:border-indigo-500/30 transition-all group cursor-pointer">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-mono text-indigo-300">{item.label}</span>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${item.interpretation.includes('CRITICAL') ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{item.interpretation}</span>
                              </div>
                              <div className="flex justify-between items-center text-[9px] uppercase tracking-wider">
                                <span className="text-white/30">Value: <span className="text-white/60">{item.val}</span></span>
                                <span className="text-indigo-400/60 font-bold italic">Used by: {item.agent}</span>
                              </div>
                            </div>
                          </SourceTooltip>
                        ))}
                      </div>
                      <div className="mt-6 flex items-center justify-center gap-4">
                        <div className="flex items-center gap-2">
                           <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                           <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">FHIR → Structured Signals</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-white/10" />
                        <div className="flex items-center gap-2">
                           <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                           <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Multi-Agent Reasoning</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* A2A Communication Log */}
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 3.0 }} className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 md:p-10 backdrop-blur-md flex-1 mt-6 mb-8">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-bold tracking-[0.2em] text-white/50 uppercase flex items-center gap-3">
                          <Activity className="w-4 h-4 text-indigo-400" /> Agent Communication Log
                        </h2>
                        <span className="text-[8px] font-bold text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-widest">A2A Protocol Validated</span>
                      </div>
                      <div className="space-y-4">
                        {A2A_LOGS.map((log, i) => (
                          <div key={i} className="p-4 rounded-xl bg-black/20 border border-white/5 group hover:border-indigo-500/30 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-indigo-300 uppercase">{log.from}</span>
                                <ArrowRight className="w-3 h-3 text-white/20" />
                                <span className="text-[10px] font-bold text-indigo-300 uppercase">{log.to}</span>
                              </div>
                              <span className="text-[9px] text-white/20 font-mono">{log.timestamp}</span>
                            </div>
                            <p className="text-xs text-white/70 font-light leading-relaxed">{log.text}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-[8px] font-bold text-indigo-400/60 uppercase tracking-widest">{log.type}</span>
                              <span className="w-1 h-1 rounded-full bg-white/10" />
                              <span className="text-[8px] font-bold text-emerald-400/60 uppercase tracking-widest">State Updated</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}

              {/* Follow-up Monitoring Card */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 2.8 }} className="mt-8 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] p-8 md:p-10 backdrop-blur-md relative overflow-hidden group w-full print:hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(99,102,241,0.15)_0%,_transparent_70%)] pointer-events-none transition-opacity group-hover:opacity-70" />
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                  <div>
                    <h2 className="text-xl font-bold text-indigo-100 tracking-tight mb-2">Follow-up Monitoring</h2>
                    <p className="text-white/60 font-light text-sm">Track patient condition after the initial decision.</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <button 
                        onClick={() => setScheduleModalOpen(true)}
                        className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold tracking-widest uppercase text-xs transition-all"
                      >
                        {scheduledCheckIn ? "Reschedule Check-in" : "Schedule Check-in"}
                      </button>
                      <Link href="/follow-up/case-123" className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-widest uppercase text-xs transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] text-center">
                        Start Follow-up
                      </Link>
                    </div>
                    {scheduledCheckIn && (
                      <div className="flex items-center gap-3 mt-2 pt-4 border-t border-white/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        <span className="text-sm text-white/80 font-medium">Follow-up scheduled ({scheduledCheckIn.toLowerCase()})</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              <div className="mt-12 text-center pb-12 max-w-2xl mx-auto">
                <p className="text-[10px] font-medium text-white/30 tracking-[0.15em] uppercase leading-relaxed">Diagora is a clinical decision-support tool. It does not replace licensed clinicians. All recommendations require clinician review and approval before action.</p>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ScanViewerModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        imageSrc={modalData?.url || ""} 
        title={modalData?.title || ""} 
        hasHighlight={modalData?.hasHighlight} 
        highlightLabel={modalData?.highlightLabel} 
      />

      {/* Note Modal */}
      <AnimatePresence>
        {noteModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0A0D20] border border-white/10 rounded-[2rem] p-8 w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <h2 className="text-lg font-bold tracking-widest text-white uppercase mb-6">Add Clinical Note</h2>
              <textarea 
                value={clinicalNote}
                onChange={(e) => setClinicalNote(e.target.value)}
                placeholder="Add clinician assessment, override rationale, or action plan..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-colors min-h-[150px] resize-none mb-6"
                autoFocus
              />
              <div className="flex gap-4 justify-end">
                <button onClick={() => setNoteModalOpen(false)} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold tracking-widest uppercase text-xs transition-all">
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setSavedNote(clinicalNote);
                    setNoteModalOpen(false);
                  }}
                  disabled={!clinicalNote.trim()}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-white/20 disabled:cursor-not-allowed text-white font-bold tracking-widest uppercase text-xs transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                >
                  Save Note
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Toast */}
      <AnimatePresence>
        {showExportToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-12 left-1/2 z-[100] px-6 py-4 rounded-2xl bg-[#0A0D20] border border-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.2)] flex items-center gap-4 print:hidden"
          >
            <div className="w-4 h-4 border-2 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin" />
            <p className="text-sm font-bold tracking-widest text-white uppercase">Preparing report for export...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Check-in Modal */}
      <AnimatePresence>
        {scheduleModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0A0D20] border border-white/10 rounded-[2rem] p-8 w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <h2 className="text-lg font-bold tracking-widest text-white uppercase mb-6 text-center">Schedule Follow-up</h2>
              <div className="flex flex-col gap-3 mb-8">
                {["Tomorrow", "In 2 days", "In 1 week"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setScheduleOption(opt)}
                    className={`py-4 px-6 rounded-xl border transition-all text-sm font-bold tracking-widest uppercase text-left ${
                      scheduleOption === opt 
                        ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                        : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setScheduleModalOpen(false)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold tracking-widest uppercase text-xs transition-all">
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (scheduleOption) {
                      setScheduledCheckIn(scheduleOption);
                      setScheduleModalOpen(false);
                      setShowScheduleToast(true);
                      setTimeout(() => setShowScheduleToast(false), 3000);
                    }
                  }}
                  disabled={!scheduleOption}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-white/20 disabled:cursor-not-allowed text-white font-bold tracking-widest uppercase text-xs transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                >
                  Confirm Schedule
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Toast */}
      <AnimatePresence>
        {showScheduleToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-12 left-1/2 z-[100] px-6 py-4 rounded-2xl bg-[#0A0D20] border border-emerald-500/30 shadow-[0_0_30px_rgba(52,211,153,0.2)] flex items-center gap-4 print:hidden"
          >
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <p className="text-sm font-bold tracking-widest text-emerald-300 uppercase">Follow-up scheduled successfully</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step Details Modal */}
      <AnimatePresence>
        {selectedStep && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0A0D20] border border-white/10 rounded-[2rem] p-8 w-full max-w-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />
              
              <h2 className="text-xl font-bold tracking-tight text-white leading-snug mb-8 pr-8 relative z-10">{selectedStep.title}</h2>
              
              <div className="space-y-6 relative z-10">
                <div>
                  <h3 className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-2">Why This Matters</h3>
                  <p className="text-white/80 font-light text-sm">{selectedStep.why}</p>
                </div>
                
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-xs font-bold tracking-widest text-white/50 uppercase mb-2">Clinician Review Required</h3>
                  <p className="text-white/80 font-light text-sm">{selectedStep.clinicianReview}</p>
                </div>

                <div>
                  <h3 className="text-xs font-bold tracking-widest text-emerald-400 uppercase mb-2">Related Evidence</h3>
                  <p className="text-white/80 font-light text-sm">{selectedStep.relatedEvidence}</p>
                </div>
                
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <h3 className="text-xs font-bold tracking-widest text-rose-400 uppercase mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Safety Note
                  </h3>
                  <p className="text-rose-200/80 font-light text-sm">{selectedStep.safetyNote}</p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end relative z-10">
                <button 
                  onClick={() => setSelectedStep(null)} 
                  className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold tracking-widest uppercase text-xs transition-all"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share with Doctor Modal */}
      <AnimatePresence>
        {shareModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              className="bg-[#0A0D20] border border-white/10 rounded-[2rem] p-8 w-full max-w-md shadow-[0_0_60px_rgba(0,0,0,0.6)] overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none" />

              <h2 className="text-lg font-bold tracking-widest text-white uppercase mb-2 relative z-10">Share Clinical Report</h2>
              <p className="text-white/40 text-xs font-medium tracking-widest uppercase mb-8 relative z-10">Secure · View-only · Expires in 24h</p>

              <div className="space-y-5 relative z-10">
                {/* Email input */}
                <div>
                  <label className="block text-xs font-bold tracking-widest text-white/50 uppercase mb-2">Doctor Email</label>
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="doctor@hospital.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all text-sm"
                  />
                </div>

                {/* Generate button */}
                {!shareLink ? (
                  <button
                    onClick={generateShareLink}
                    className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-widest uppercase text-xs transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                  >
                    Generate Secure Link
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Success state */}
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-xs font-bold tracking-widest text-emerald-300 uppercase">Secure link generated</span>
                      </div>
                      <div className="flex gap-3 text-[10px] text-white/40 font-medium uppercase tracking-widest mb-3">
                        <span>Expires in 24 hours</span>
                        <span>•</span>
                        <span>View-only access</span>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-indigo-300 font-mono break-all">
                        {shareLink}
                      </div>
                    </div>

                    {/* Copy button */}
                    <button
                      onClick={copyLink}
                      className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold tracking-widest uppercase text-xs transition-all mb-2"
                    >
                      Copy Link
                    </button>

                    {/* Open Doctor View button */}
                    <button
                      onClick={() => {
                        setShareModalOpen(false);
                        window.location.href = `/debate?view=doctor&shared=true&caseId=${sharedCaseId}`;
                      }}
                      className="w-full py-3.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold tracking-widest uppercase text-xs transition-all flex items-center justify-center gap-2"
                    >
                      <Brain className="w-4 h-4" />
                      Open Doctor View
                    </button>
                  </motion.div>
                )}
              </div>

              <div className="mt-8 flex justify-end relative z-10">
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white font-bold tracking-widest uppercase text-xs transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copy Link Toast */}
      <AnimatePresence>
        {showCopyToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-12 left-1/2 z-[110] px-6 py-4 rounded-2xl bg-[#0A0D20] border border-emerald-500/30 shadow-[0_0_30px_rgba(52,211,153,0.2)] flex items-center gap-4 print:hidden"
          >
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <p className="text-sm font-bold tracking-widest text-emerald-300 uppercase">Link copied successfully</p>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Raw FHIR Preview Modal */}
      <AnimatePresence>
        {fhirModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#050711] border border-white/10 rounded-[2.5rem] w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />
               <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#050711]/50 backdrop-blur-md relative z-10">
                 <div className="flex items-center gap-4">
                   <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20"><Code className="w-6 h-6 text-indigo-400" /></div>
                   <div>
                     <h2 className="text-xl font-bold text-white tracking-tight leading-none mb-1">Raw FHIR Payload</h2>
                     <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Interoperability Bundle Snapshot</p>
                   </div>
                 </div>
                 <button onClick={() => setFhirModalOpen(false)} className="p-2 rounded-xl hover:bg-white/5 transition-colors text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-white/10 relative z-10">
                 {FHIR_RESOURCES.map((res, i) => (
                   <div key={i} className="space-y-3">
                     <div className="flex items-center justify-between">
                       <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">{res.type}/{res.id}</span>
                       <span className="text-[9px] font-mono text-white/20">Source: EMR Connector</span>
                     </div>
                     <div className="p-6 rounded-2xl bg-black/40 border border-white/5 font-mono text-[11px] leading-relaxed text-white/70 overflow-hidden relative">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(res.json, null, 2)}</pre>
                        <div className="absolute top-2 right-2 p-1.5 rounded bg-white/5 border border-white/5 text-[8px] font-bold text-white/30 uppercase">Read-Only</div>
                     </div>
                   </div>
                 ))}
               </div>
               
               <div className="p-8 border-t border-white/5 flex items-center justify-between bg-black/20 shrink-0">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Validation Status: <span className="text-emerald-400">Validated</span></span>
                  <button onClick={() => setFhirModalOpen(false)} className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest transition-all">Close Payload</button>
               </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
           <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
