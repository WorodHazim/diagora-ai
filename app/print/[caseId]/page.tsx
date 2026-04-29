"use client";

import React, { useEffect } from "react";
import { Activity, ShieldAlert, HeartPulse, FileText, Stethoscope } from "lucide-react";

export default function PrintPage() {
  useEffect(() => {
    // Trigger print automatically after a short delay to ensure rendering is complete
    const timer = setTimeout(() => {
      window.print();
    }, 800);
    
    // Attempt to close the tab after printing is done or cancelled
    window.onafterprint = () => {
      window.close();
    };

    return () => clearTimeout(timer);
  }, []);

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

  return (
    <div className="w-full min-h-screen bg-white text-black font-sans p-8 md:p-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-200 pb-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-6 h-6 text-black" />
            <h1 className="text-2xl font-bold tracking-tight text-black">DIAGORA</h1>
          </div>
          <p className="text-gray-500 font-medium tracking-widest text-xs uppercase">Clinical Decision Report</p>
        </div>
        <div className="text-right text-sm text-gray-500 flex flex-col gap-1">
          <p><strong>Case ID:</strong> #123-PE-902</p>
          <p><strong>Generated:</strong> {new Date().toLocaleDateString()}</p>
          <p><strong>Patient Age/Sex:</strong> 65 M</p>
        </div>
      </div>

      {/* Primary Diagnosis & Risk */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div className="p-6 border border-gray-300 rounded-lg bg-gray-50">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Final Diagnosis Consensus</h2>
          <p className="text-3xl font-bold text-black mb-1">Pulmonary Embolism</p>
          <p className="text-gray-600 font-medium">Acute, Central, High-Risk</p>
        </div>
        
        <div className="p-6 border border-gray-300 rounded-lg flex flex-col justify-center bg-gray-50">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="w-5 h-5 text-black" />
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">System Confidence</h2>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-black">94.8%</p>
            <p className="text-gray-600 font-medium text-sm">High</p>
          </div>
        </div>
      </div>

      {/* Clinical Reasoning */}
      <div className="mb-10">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest border-b border-gray-200 pb-2 mb-4">Clinical Reasoning</h2>
        <div className="text-gray-700 leading-relaxed space-y-4">
          <p>Initial presentation suggested Acute Coronary Syndrome (ACS) due to age, left-sided chest pain, and diaphoresis. However, isolated review of the lack of radiating pain and the specific pattern of sudden-onset shortness of breath led to re-evaluation.</p>
          <p>A negative troponin effectively ruled out acute myocardial infarction. Concurrent elevated D-Dimer (2.4 mg/L FEU) combined with the patient's presentation strongly indicates acute pulmonary embolism. Tachycardia (HR 115) and mild hypoxia (SpO2 92% on RA) further support hemodynamic strain associated with PE.</p>
        </div>
      </div>

      {/* Recommended Next Steps */}
      <div className="mb-10">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest border-b border-gray-200 pb-2 mb-4">Recommended Next Steps</h2>
        <div className="space-y-6">
          {RECOMMENDED_STEPS.map((step, idx) => (
            <div key={idx} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 shrink-0">
                {idx + 1}
              </div>
              <div>
                <h3 className="font-bold text-lg text-black mb-2">{step.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <p className="font-bold text-gray-900 mb-1">Why this matters:</p>
                    <p>{step.why}</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 mb-1">Clinician Review:</p>
                    <p>{step.clinicianReview}</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 mb-1">Related Evidence:</p>
                    <p>{step.relatedEvidence}</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 mb-1">Safety Note:</p>
                    <p>{step.safetyNote}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer Footer */}
      <div className="mt-16 pt-8 border-t-2 border-gray-200 text-center text-xs text-gray-500 font-medium tracking-widest uppercase">
        <p>Clinical decision support only. Diagora does not replace licensed medical professionals.</p>
        <p className="mt-1">In emergencies, seek immediate medical care.</p>
      </div>

    </div>
  );
}
