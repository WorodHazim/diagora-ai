'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function ReportContent() {
  const searchParams = useSearchParams();
  const decision = searchParams.get('decision') || 'pending';
  const score = parseInt(searchParams.get('score') || '92');
  const note = searchParams.get('note') || '';

  const briefing = searchParams.get('briefing') || '';

  useEffect(() => {
    // Small delay to ensure styles and content are fully rendered before print dialog
    const timer = setTimeout(() => {
      window.print();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white text-black font-sans min-h-screen">
      {/* PAGE 1: IMPRESSION & CERTAINTY */}
      <div className="p-[60px] min-h-[100vh] flex flex-col max-w-[900px] mx-auto" style={{ pageBreakAfter: 'always' }}>
        {/* Header */}
        <div className="border-b-2 border-black pb-10 mb-14 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-black mb-1">DIAGORA</h1>
            <p className="text-[12px] font-bold uppercase tracking-[0.4em] text-gray-500">Clinical Decision Support Report</p>
          </div>
          <div className="text-right text-[11px] font-bold uppercase tracking-widest text-gray-500 space-y-2">
            <div>Report Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div>Case ID: DG-2026-998XX</div>
            <div>Patient: Case Study #123 (64Y / M)</div>
            <div>Clinician: Verified Attending</div>
          </div>
        </div>

        {/* AI Doctor Briefing Section */}
        {briefing && (
          <div className="mb-14 p-10 bg-gray-50 border border-gray-100 rounded-[2.5rem]">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-6 flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              AI Doctor Briefing
            </h2>
            <p className="text-[17px] text-gray-800 leading-relaxed font-medium italic">
              "{briefing}"
            </p>
            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
               <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Synthetic Medical Synthesis • Med-Speech v2</span>
               <span className="text-[9px] font-bold text-gray-300 uppercase">System Verified Protocol</span>
            </div>
          </div>
        )}

        {/* Clinician Review Status Banner */}
        <div className={`mb-12 p-8 border-2 rounded-3xl flex flex-col gap-2 ${
          decision === 'approved' ? 'bg-emerald-50 border-emerald-200' :
          decision === 'rejected' ? 'bg-rose-50 border-rose-200' :
          decision === 'more-evidence' ? 'bg-amber-50 border-amber-200' :
          decision === 'modified' ? 'bg-indigo-50 border-indigo-200' :
          'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex justify-between items-center">
            <h3 className="text-[12px] font-black uppercase tracking-widest text-gray-500">Governance Status</h3>
            <span className={`text-sm font-black uppercase tracking-widest ${
              decision === 'approved' ? 'text-emerald-600' :
              decision === 'rejected' ? 'text-rose-600' :
              decision === 'more-evidence' ? 'text-amber-600' :
              'text-indigo-600'
            }`}>
              {decision === 'approved' ? 'Clinically Approved' :
               decision === 'rejected' ? 'Recommendation Rejected' :
               decision === 'more-evidence' ? 'Decision Pending' :
               decision === 'modified' ? 'Plan Modified' :
               'Pending Clinical Validation'}
            </span>
          </div>
          <p className="text-base font-bold text-gray-900 mt-1">
            {decision === 'approved' ? 'Diagnosis and recommendation verified for patient record.' :
             decision === 'rejected' ? 'Clinician has formally dismissed the AI-suggested diagnosis.' :
             decision === 'more-evidence' ? 'Diagnostic consensus deferred; awaiting requested evidence.' :
             decision === 'modified' ? 'Recommended plan updated by attending clinician.' :
             'Platform recommendation awaiting mandatory human clinician oversight and validation.'}
          </p>
        </div>

        {/* Diagnosis */}
        <div className="mb-16">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Final AI-Supported Clinical Impression</h2>
          <div className="text-6xl font-bold text-black mb-8 leading-tight tracking-tight">
            {decision === 'rejected' ? 'REJECTED' : "Pulmonary Embolism (PE)"}
          </div>
          <p className="text-[17px] text-gray-600 leading-relaxed max-w-4xl italic border-l-4 border-gray-100 pl-8 py-2">
            {decision === 'rejected' ? 'AI recommendation dismissed by clinician — Manual re-evaluation required.' : 
             (decision === 'more-evidence' ? 'Diagnostic consensus deferred — Confidence score temporarily reduced due to data deficiency.' : 
              'Suspected Pulmonary Embolism (PE) with hypoxia and tachycardia — requires clinician confirmation.')}
          </p>
        </div>

        {/* Global Confidence */}
        <div className="mb-16 p-10 border border-gray-100 rounded-[2.5rem] flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Combined Global Confidence</h2>
            <p className="text-[12px] text-gray-500 font-medium leading-relaxed">
              Aggregate weight of multi-agent reasoning, evidence correlation, and risk factor analysis.
            </p>
          </div>
          <div className="text-right">
            <span className="text-7xl font-black text-black tracking-tighter">{decision === 'more-evidence' ? '50' : score}%</span>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Confidence Rating: {score > 80 ? 'HIGH' : 'INTERMEDIATE'}</div>
          </div>
        </div>

        {/* Certainty Matrix */}
        <div className="mb-16">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-10">Diagnostic Certainty Matrix</h2>
          <div className="grid grid-cols-2 gap-x-24 gap-y-12">
            {[
              { label: "Imaging Contribution", val: 92, note: "Structural Signal" },
              { label: "Lab Evidence", val: 85, note: "Biomarker Signal" },
              { label: "Clinical Pattern", val: 78, note: "Symptomatic Signal" },
              { label: "Risk Factors", val: 65, note: "Historical Signal" }
            ].map((c, i) => (
              <div key={i} className="space-y-4">
                <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.1em]">
                  <div>
                    <span className="text-gray-900 block">{c.label}</span>
                    <span className="text-gray-300 text-[9px] block">{c.note}</span>
                  </div>
                  <span className="text-gray-900 font-black">{c.val}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-black rounded-full" style={{ width: `${c.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PAGE 2: ACTIONS & EVIDENCE */}
      <div className="p-[60px] min-h-[100vh] flex flex-col max-w-[900px] mx-auto" style={{ pageBreakAfter: 'always' }}>
        {/* Section Header */}
        <div className="border-b border-gray-200 pb-6 mb-14 flex justify-between items-center">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">Section 02: Clinical Actions & Evidence</h2>
          <span className="text-[11px] font-bold text-gray-300 uppercase">Case ID: DG-2026-998XX</span>
        </div>

        {/* Next Steps */}
        <div className="mb-16">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-10">Recommended Clinical Actions</h2>
          <div className="space-y-6">
            {(decision === 'modified' && note) ? (
              <div className="p-10 bg-gray-50 border-2 border-gray-200 rounded-[2rem]">
                <p className="text-xl text-black font-black italic mb-6">"{note}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-black" />
                  <p className="text-[11px] text-gray-400 uppercase font-black tracking-[0.2em]">Clinician Modification Overriding AI Plan</p>
                </div>
              </div>
            ) : (
              [
                "Immediate anticoagulation therapy (Heparin/LMWH)",
                "Stat pulmonary consult for hemodynamic monitoring",
                "Continuous cardiac and respiratory monitoring",
                "Lower extremity venous Doppler imaging"
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-8 p-8 border border-gray-50 rounded-3xl mb-6">
                  <span className="text-lg font-black text-gray-300 mt-1">{i+1}.</span>
                  <div className="flex-1">
                    <span className="text-xl text-gray-900 font-black block mb-3">{step}</span>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed mb-4">Diagnostic signal indicates STAT prioritization for this clinical protocol.</p>
                    <div className="flex gap-5">
                      <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest border border-gray-200 px-3 py-1 rounded-lg">Priority: Critical</span>
                      <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest border border-gray-200 px-3 py-1 rounded-lg">Action: STAT</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Evidence Summary Cards */}
        <div className="mb-16">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-10">Key Evidence Summary</h2>
          <div className="grid grid-cols-2 gap-10">
            <div className="p-8 border border-gray-100 rounded-[2rem]">
              <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-6">Structural Imaging</div>
              <h4 className="text-xl font-black text-black mb-4">CT Pulmonary Angiography</h4>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[11px] font-bold border-b border-gray-50 pb-2">
                  <span className="text-gray-400 uppercase">Finding</span>
                  <span className="text-gray-900">Filling Defect</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold border-b border-gray-50 pb-2">
                  <span className="text-gray-400 uppercase">Location</span>
                  <span className="text-gray-900">Right Lower Lobe</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed italic">"Direct visual evidence of vascular obstruction confirmed by automated pixel-level analysis."</p>
            </div>
            <div className="p-8 border border-gray-100 rounded-[2rem]">
              <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-6">Biomarker Analysis</div>
              <h4 className="text-xl font-black text-black mb-4">Hematologic Markers</h4>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[11px] font-bold border-b border-gray-50 pb-2">
                  <span className="text-gray-400 uppercase">D-Dimer</span>
                  <span className="text-rose-600">2.4 mg/L (Elevated)</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold border-b border-gray-50 pb-2">
                  <span className="text-gray-400 uppercase">Troponin I</span>
                  <span className="text-gray-900">&lt;0.01 ng/mL (Normal)</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed italic">"Systemic biomarkers indicate high-order thrombotic activity without concomitant myocardial injury."</p>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 3: TRACE & AUDIT */}
      <div className="p-[60px] min-h-[100vh] flex flex-col max-w-[900px] mx-auto">
        {/* Section Header */}
        <div className="border-b border-gray-200 pb-6 mb-14 flex justify-between items-center">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">Section 03: Data Trace & Audit Trail</h2>
          <span className="text-[11px] font-bold text-gray-300 uppercase">Case ID: DG-2026-998XX</span>
        </div>

        {/* FHIR Trace */}
        <div className="mb-16">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8">FHIR Interoperability Trace (Simplified)</h2>
          <div className="border border-gray-100 rounded-[2rem] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Resource Type</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Signal Path</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Diagnostic Interpret</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-600 font-medium">
                {[
                   { resource: 'DiagnosticReport', rawValue: 'Radiology/CTPA-998', interpretation: 'Confirmed Filling Defect' },
                   { resource: 'Observation', rawValue: 'Loinc/D-Dimer: 2.4', interpretation: 'Positive Thrombosis Signal' },
                   { resource: 'Observation', rawValue: 'Loinc/Troponin: <0.01', interpretation: 'Negative Cardiac Signal' },
                   { resource: 'Patient', rawValue: 'Age: 64, Sex: M', interpretation: 'Demographic Risk Matched' },
                   { resource: 'Condition', rawValue: 'History: Smoking', interpretation: 'Risk Multiplier Active' }
                ].map((f, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="p-6 font-mono text-indigo-600 uppercase text-[10px]">{f.resource}</td>
                    <td className="p-6">{f.rawValue}</td>
                    <td className="p-6 font-bold text-gray-900">{f.interpretation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Agent Consensus Summary */}
        <div className="mb-16">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-10">Specialist Agent Consensus Summary</h2>
          <div className="space-y-6">
            {[
              { agent: "Pulmonology Engine", status: "Primary Advocate", weight: "42%", opinion: "Strong correlation with CTA findings and hypoxemia profile." },
              { agent: "Cardiology Engine", status: "Deferred Consensus", weight: "28%", opinion: "Initial ACS hypothesis weakened by negative biomarkers." },
              { agent: "Reasoning Adjudicator", status: "Final Arbiter", weight: "30%", opinion: "Final weight assigned to Pulmonary Embolism based on structural evidence." }
            ].map((a, i) => (
              <div key={i} className="p-8 border border-gray-100 rounded-[2rem] flex items-center gap-8">
                <div className="w-32 shrink-0 text-[12px] font-black text-gray-900 uppercase leading-tight">{a.agent}</div>
                <div className="w-40 shrink-0 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{a.status}</div>
                <div className="flex-1 text-[13px] text-gray-500 italic">"{a.opinion}"</div>
                <div className="text-[12px] font-black text-gray-900">{a.weight}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log */}
        <div className="mt-auto pt-16 border-t-2 border-black">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-10">Secure Diagnostic Audit Trail (Log Snapshot)</h2>
          <div className="space-y-5">
            {[
              "Case initialized by clinician entry",
              "FHIR bundle ingested and validated",
              "Agent debate initiated (Pulmo vs Cardio)",
              "Imaging filling defect detected by vision model",
              "Diagnostic consensus reached at 92.4%",
              "Report exported for clinical review"
            ].map((log, i) => (
              <div key={i} className="text-xs text-gray-600 font-bold flex justify-between items-center border-b border-gray-50 pb-4">
                <span className="uppercase tracking-wider max-w-[600px] leading-relaxed">{log}</span>
                <div className="text-right">
                  <span className="text-gray-300 font-mono text-[10px] block">LOG_SEQ_{i+1000}</span>
                  <span className="text-gray-200 font-mono text-[9px] block">0x82f...{i}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Signature */}
        <div className="mt-16 flex justify-between items-end border-t border-gray-100 pt-16">
          <div>
            <div className="w-96 border-b-2 border-black mb-6" />
            <p className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">Licensed Attending Signature</p>
            <p className="text-[10px] text-gray-300 mt-2 uppercase font-bold">Certification Hash: 0xFF98...E21</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-gray-400 uppercase font-black tracking-[0.4em] mb-2">Diagora Clinical Intelligence Engine</p>
            <p className="text-[10px] text-gray-300 uppercase font-bold">v2.4.0-Stable • Verified Med-Board Protocol</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}

export default function ExportReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center font-sans uppercase tracking-[0.5em] text-gray-300 text-xs">Preparing Clinical Report...</div>}>
      <ReportContent />
    </Suspense>
  );
}
