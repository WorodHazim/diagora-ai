import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Simulated reasoning mode response for Demo/Testing
const getDemoResponse = (reason: string) => ({
  mode: "simulated-reasoning",
  reasoningModeSource: reason,
  clinicianSafetyWarning: "Simulated Clinical Reasoning Mode Active — Analyzing high-fidelity case patterns.",
  primaryClinicalImpression: "Pulmonary Embolism",
  confidence: 94,
  confidenceReliability: 94,
  riskLevel: "high",
  diagnosticUncertainty: {
    level: "low",
    drivers: ["Strong imaging evidence", "Consistent lab markers", "Clinician-validated FHIR trace"]
  },
  hypotheses: [
    {
      name: "Pulmonary Embolism",
      probability: 0.85,
      supportingEvidence: ["Elevated D-dimer (2.4)", "CT filling defect"],
      contradictingEvidence: ["Normal troponin"],
      reasoning: "Combination of high D-dimer and CT findings is pathognomonic."
    },
    {
      name: "Acute Coronary Syndrome",
      probability: 0.10,
      supportingEvidence: [],
      contradictingEvidence: ["Normal troponin", "High D-dimer"],
      reasoning: "Normal cardiac markers and alternative explanation rule out ACS."
    }
  ],
  agents: [
    { name: "Pulmonologist", role: "Specialist", opinion: "Evidence favors PE over ACS. CT finding and normal troponin weaken ACS.", confidence: 0.82, evidenceUsed: ["ct-chest-001", "d-dimer-001"] },
    { name: "Cardiologist", role: "Specialist", opinion: "Based on lab and imaging evidence, ACS likelihood reduced. Pulmonary Embolism is now leading.", confidence: 0.21, evidenceUsed: ["d-dimer-001", "troponin-001"] }
  ],
  a2aMessages: [
    { from: "pulmo", to: "labs", type: "challenge", message: "PE suspected due to sudden dyspnea. Request D-dimer and oxygenation evidence.", evidence: ["pt-998-xx"] },
    { from: "labs", to: "pulmo", type: "evidence", message: "D-dimer elevated at 2.4 mg/L. Troponin normal.", evidence: ["d-dimer-001", "troponin-001"] }
  ],
  mcpToolTrace: [
    { input: "DiagnosticReport/ct-chest-001", tool: "Imaging Analyzer", output: "Pulmonary artery filling defect detected", usedBy: "Pulmonology", status: "completed" },
    { input: "Observation/d-dimer-001", tool: "Lab Interpreter", output: "D-dimer 2.4 mg/L interpreted as HIGH", usedBy: "Labs + Risk", status: "completed" }
  ],
  fhirTrace: [
    { resource: "Observation/d-dimer-001", rawValue: "2.4 mg/L", interpretation: "CRITICAL HIGH (Thrombosis risk)", usedBy: ["Labs Agent", "Pulmonology"] },
    { resource: "DiagnosticReport/ct-chest-001", rawValue: "Suspicious filling defect", interpretation: "Vascular obstruction", usedBy: ["Imaging Analyzer", "Pulmonology"] }
  ],
  criticalTurningPoint: {
    trigger: "CT imaging + D-dimer elevation",
    explanation: "CT imaging revealed vascular obstruction; D-dimer elevation confirmed thrombosis. This overruled initial ACS hypothesis."
  },
  alternativeCriticalConsiderations: [
    { name: "Aortic Dissection", riskIfMissed: "High risk if missed", whyDeprioritized: "Absence of structural widening on initial scan & stable blood pressure profile." },
    { name: "Severe Pneumonia", riskIfMissed: "Overlapping symptoms", whyDeprioritized: "Normal inflammatory markers and inconsistent imaging patterns." }
  ],
  recommendedNextSteps: ["Order urgent CT Pulmonary Angiography (CTPA)", "Initiate empirical anticoagulation therapy"]
});

const SYSTEM_PROMPT = `
You are a clinical decision-support AI within the Diagora platform. You are NOT a doctor.
Your role is to analyze clinical data and simulate a multi-agent medical board debate.

PROMPT RULES:
1. Do not provide final medical diagnosis. Use "Suspected" or "Likely".
2. Simulate multiple specialist agents: Cardiologist, Pulmonologist, Lab Interpreter, Imaging Analyzer, Risk Analyst, Reasoning Engine.
3. Use ONLY provided patient/FHIR data.
4. Do not invent missing labs, imaging, vitals, or history.
5. Always include uncertainty and alternative diagnoses.
6. Always require clinician review.
7. Return STRICT JSON ONLY. No markdown, no conversational text.
8. Ensure no duplicate words or redundant phrasing (e.g., NEVER use "Suspected suspected"). Use clean medical language.
9. For "Why NOT Other Diagnoses" reasoning, use concise, evidence-based ruling out logic.

FHIR MAPPING:
- Use the provided patient, symptoms, and FHIR resources to build the logic path.
- Map evidence to specific FHIR resource IDs.

OUTPUT JSON SCHEMA:
{
  "mode": "live-ai",
  "primaryClinicalImpression": "string",
  "confidence": 85, // Integer 0-100
  "confidenceReliability": 85, // Integer 0-100
  "riskLevel": "low | medium | high | critical",
  "diagnosticUncertainty": {
    "level": "low | medium | high",
    "drivers": ["string (descriptive reason)"]
  },
  "hypotheses": [
    {
      "name": "string",
      "probability": 0.85, // 0-1
      "supportingEvidence": ["string (descriptive clinical finding)"],
      "contradictingEvidence": ["string (descriptive clinical finding)"],
      "reasoning": "string"
    }
  ],
  "agents": [
    {
      "name": "string",
      "role": "string",
      "opinion": "string",
      "confidence": 0.85,
      "evidenceUsed": ["FHIR resource ids"]
    }
  ],
  "a2aMessages": [
    {
      "from": "string",
      "to": "string",
      "type": "hypothesis | challenge | evidence | update | escalation | consensus",
      "message": "string",
      "evidence": ["FHIR resource ids"]
    }
  ],
  "mcpToolTrace": [
    {
      "input": "string",
      "tool": "string",
      "output": "string",
      "usedBy": "string",
      "status": "completed"
    }
  ],
  "fhirTrace": [
    {
      "resource": "string",
      "rawValue": "string",
      "interpretation": "string",
      "usedBy": ["string"]
    }
  ],
  "criticalTurningPoint": {
    "trigger": "string",
    "explanation": "string"
  },
  "alternativeCriticalConsiderations": [
    {
      "name": "string",
      "riskIfMissed": "string",
      "whyDeprioritized": "string"
    }
  ],
  "recommendedNextSteps": ["string"],
  "clinicianSafetyWarning": "string"
}

IMPORTANT: All evidence strings must be descriptive clinical notes, not raw IDs or scores.
IMPORTANT: confidence and confidenceReliability MUST be integers between 0 and 100.
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.trim() === "") {
      console.warn("GEMINI_API_KEY missing or empty. Using fallback demo data.");
      return NextResponse.json(getDemoResponse("missing-api-key"));
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
    SYSTEM PROMPT: ${SYSTEM_PROMPT}

    INPUT CLINICAL DATA:
    ${JSON.stringify(body, null, 2)}

    Analyze the case and return the structured JSON output.
    `;

    // 10s timeout protection
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      clearTimeout(timeoutId);

      const response = result.response;
      const text = response.text();
      
      try {
        const json = JSON.parse(text);
        return NextResponse.json({ ...json, mode: "live-ai" });
      } catch (e) {
        console.error("Failed to parse Gemini JSON:", e);
        return NextResponse.json(getDemoResponse("invalid-ai-response"));
      }
    } catch (e: any) {
      clearTimeout(timeoutId);
      console.error("Gemini API error:", e);
      
      let reason = "api-error";
      const errMsg = e?.message?.toLowerCase() || "";
      
      if (e?.name === 'AbortError' || errMsg.includes('deadline') || errMsg.includes('timeout')) {
        reason = "timeout";
      } else if (errMsg.includes('key not valid') || errMsg.includes('invalid api key')) {
        reason = "invalid-api-key";
      } else if (errMsg.includes('quota') || errMsg.includes('429') || errMsg.includes('403')) {
        reason = "quota-exceeded";
      }
      
      return NextResponse.json(getDemoResponse(reason));
    }

  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(getDemoResponse("api-error"));
  }
}