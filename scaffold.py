import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

page_content = """export default function Page() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  );
}
"""

component_content = """import React from 'react';

export function {name}() {
  return (
    <div className="p-4 border rounded">
      {name} Component
    </div>
  );
}
"""

agent_content = """import { PatientCase } from '../types/case.types';

export const {name} = async (context: any) => {
  return {
    agentId: '{name}',
    name: '{name} Agent',
    role: '{role}',
    opinion: 'Placeholder opinion for {name}',
    concerns: [],
    confidence: 0.8
  };
};
"""

type_content = """// Placeholder types
export type PatientCase = {
  id: string;
  patient: {
    age: number;
    gender: string;
    medicalHistory: string[];
    medications: string[];
  };
  symptoms: {
    name: string;
    severity: number;
    duration: string;
  }[];
  labs?: Record<string, string | number>;
  imaging?: {
    type: "xray" | "ct" | "mri" | "ultrasound";
    url: string;
    observation?: string;
  };
};

export type AgentResponse = {
  agentId: string;
  name: string;
  role: string;
  opinion: string;
  concerns: string[];
  confidence: number;
  requestedData?: string[];
  respondsTo?: string[];
};
"""

files = {
    # App Pages
    "app/dashboard/page.tsx": page_content.replace("{title}", "Dashboard"),
    "app/new-case/page.tsx": page_content.replace("{title}", "New Case"),
    "app/labs-imaging/page.tsx": page_content.replace("{title}", "Labs & Imaging"),
    "app/debate/page.tsx": page_content.replace("{title}", "Debate"),
    "app/results/page.tsx": page_content.replace("{title}", "Results"),
    "app/timeline/page.tsx": page_content.replace("{title}", "Timeline"),
    
    # API Routes
    "app/api/analyze-case/route.ts": "import { NextResponse } from 'next/server';\nexport async function POST(req: Request) { return NextResponse.json({ riskLevel: 'MEDIUM', agents: [], finalDecision: {}, evidence: [] }); }",
    "app/api/follow-up/route.ts": "import { NextResponse } from 'next/server';\nexport async function POST(req: Request) { return NextResponse.json({ success: true }); }",
    "app/api/upload/route.ts": "import { NextResponse } from 'next/server';\nexport async function POST(req: Request) { return NextResponse.json({ success: true }); }",

    # Components - Layout
    "components/layout/AppShell.tsx": component_content.replace("{name}", "AppShell"),
    "components/layout/Sidebar.tsx": component_content.replace("{name}", "Sidebar"),
    "components/layout/Topbar.tsx": component_content.replace("{name}", "Topbar"),

    # Components - Case
    "components/case/PatientSummaryCard.tsx": component_content.replace("{name}", "PatientSummaryCard"),
    "components/case/SymptomsForm.tsx": component_content.replace("{name}", "SymptomsForm"),
    "components/case/LabInputPanel.tsx": component_content.replace("{name}", "LabInputPanel"),
    "components/case/ImagingUploadPanel.tsx": component_content.replace("{name}", "ImagingUploadPanel"),

    # Components - Agents
    "components/agents/AgentCard.tsx": component_content.replace("{name}", "AgentCard"),
    "components/agents/DebateMessage.tsx": component_content.replace("{name}", "DebateMessage"),
    "components/agents/AgentNetwork.tsx": component_content.replace("{name}", "AgentNetwork"),
    "components/agents/AgentStatus.tsx": component_content.replace("{name}", "AgentStatus"),

    # Components - Results
    "components/results/RiskMeter.tsx": component_content.replace("{name}", "RiskMeter"),
    "components/results/DecisionPanel.tsx": component_content.replace("{name}", "DecisionPanel"),
    "components/results/DiagnosisList.tsx": component_content.replace("{name}", "DiagnosisList"),
    "components/results/EvidenceCard.tsx": component_content.replace("{name}", "EvidenceCard"),
    "components/results/DoctorReport.tsx": component_content.replace("{name}", "DoctorReport"),

    # Components - Timeline
    "components/timeline/TimelineView.tsx": component_content.replace("{name}", "TimelineView"),
    "components/timeline/FollowUpForm.tsx": component_content.replace("{name}", "FollowUpForm"),

    # Components - UI
    "components/ui/GlassCard.tsx": component_content.replace("{name}", "GlassCard"),
    "components/ui/GlowButton.tsx": component_content.replace("{name}", "GlowButton"),
    "components/ui/PageTransition.tsx": component_content.replace("{name}", "PageTransition"),
    "components/ui/NeuralBackground.tsx": component_content.replace("{name}", "NeuralBackground"),

    # Lib - Types
    "lib/types/case.types.ts": type_content,
    "lib/types/agent.types.ts": "export type AgentResponse = {\n  agentId: string;\n  name: string;\n  role: string;\n  opinion: string;\n  concerns: string[];\n  confidence: number;\n  requestedData?: string[];\n  respondsTo?: string[];\n};\n",
    "lib/types/result.types.ts": "export type Result = { riskLevel: string };",
    "lib/types/timeline.types.ts": "export type Timeline = { events: any[] };",

    # Lib - Agents
    "lib/agents/general.agent.ts": agent_content.replace("{name}", "runGeneralAgent").replace("{role}", "General Practitioner"),
    "lib/agents/cardiologist.agent.ts": agent_content.replace("{name}", "runCardiologistAgent").replace("{role}", "Cardiologist"),
    "lib/agents/pulmonologist.agent.ts": agent_content.replace("{name}", "runPulmonologistAgent").replace("{role}", "Pulmonologist"),
    "lib/agents/neurologist.agent.ts": agent_content.replace("{name}", "runNeurologistAgent").replace("{role}", "Neurologist"),
    "lib/agents/lab.agent.ts": agent_content.replace("{name}", "runLabAgent").replace("{role}", "Lab Specialist"),
    "lib/agents/vision.agent.ts": agent_content.replace("{name}", "runVisionAgent").replace("{role}", "Imaging Specialist"),
    "lib/agents/rare.agent.ts": agent_content.replace("{name}", "runRareAgent").replace("{role}", "Rare Disease Specialist"),
    "lib/agents/risk.agent.ts": agent_content.replace("{name}", "runRiskAgent").replace("{role}", "Risk Analyst"),
    "lib/agents/evidence.agent.ts": agent_content.replace("{name}", "runEvidenceAgent").replace("{role}", "Evidence Gatherer"),
    "lib/agents/followup.agent.ts": agent_content.replace("{name}", "runFollowupAgent").replace("{role}", "Followup Specialist"),
    "lib/agents/orchestrator.agent.ts": agent_content.replace("{name}", "runOrchestratorAgent").replace("{role}", "Lead Physician"),

    # Lib - Engine
    "lib/engine/runMedicalBoard.ts": """import { PatientCase } from '../types/case.types';
import { buildFhirContext } from '../fhir/buildFhirContext';
import { retrieveEvidence } from '../rag/retrieveEvidence';
import { runLabAgent } from '../agents/lab.agent';
import { runVisionAgent } from '../agents/vision.agent';
import { runGeneralAgent } from '../agents/general.agent';
import { runCardiologistAgent } from '../agents/cardiologist.agent';
import { runPulmonologistAgent } from '../agents/pulmonologist.agent';
import { runRareAgent } from '../agents/rare.agent';
import { runRiskAgent } from '../agents/risk.agent';
import { runOrchestratorAgent } from '../agents/orchestrator.agent';

export async function runMedicalBoard(patientCase: PatientCase) {
  const fhirContext = buildFhirContext(patientCase);
  const evidence = await retrieveEvidence(patientCase);

  const lab = await runLabAgent({ patientCase, fhirContext, evidence });
  const vision = await runVisionAgent({ patientCase, fhirContext, evidence });

  const general = await runGeneralAgent({ patientCase, fhirContext, evidence, previousAgentResponses: [lab, vision] });
  const cardio = await runCardiologistAgent({ patientCase, fhirContext, evidence, previousAgentResponses: [lab, vision, general] });
  const pulmo = await runPulmonologistAgent({ patientCase, fhirContext, evidence, previousAgentResponses: [lab, vision, general, cardio] });
  const rare = await runRareAgent({ patientCase, fhirContext, evidence, previousAgentResponses: [general, cardio, pulmo, lab, vision] });
  const risk = await runRiskAgent({ patientCase, fhirContext, evidence, previousAgentResponses: [general, cardio, pulmo, rare, lab, vision] });

  const final = await runOrchestratorAgent({ patientCase, fhirContext, evidence, previousAgentResponses: [general, cardio, pulmo, lab, vision, rare, risk] });

  return { fhirContext, evidence, agents: [lab, vision, general, cardio, pulmo, rare, risk], final };
}
""",
    "lib/engine/runDebate.ts": "export const runDebate = async () => { return []; };",
    "lib/engine/decisionEngine.ts": "export const decisionEngine = () => { return {}; };",
    "lib/engine/riskRules.ts": """import { PatientCase } from '../types/case.types';

export function applyRiskRules(patientCase: PatientCase) {
  const symptoms = patientCase.symptoms.map((s) => s.name.toLowerCase());
  const labs = patientCase.labs || {};

  if (symptoms.includes("chest pain") && (symptoms.includes("dizziness") || symptoms.includes("shortness of breath"))) {
    return { risk: "HIGH", reason: "Chest pain with dizziness or shortness of breath is a red flag." };
  }

  if (String(labs.troponin).toLowerCase() === "high") {
    return { risk: "EMERGENCY", reason: "Elevated troponin with chest pain may indicate cardiac injury." };
  }

  return { risk: "MEDIUM", reason: "Symptoms require clinical evaluation." };
}
""",
    "lib/engine/followUpEngine.ts": """export function updateRiskFromFollowUp(previousRisk: string, update: string) {
  if (update === "worse") {
    return { risk: "EMERGENCY", message: "Symptoms worsened. Immediate medical evaluation is recommended." };
  }

  if (update === "better") {
    return { risk: "LOWER", message: "Symptoms improved. Continue monitoring and follow medical advice." };
  }

  return { risk: previousRisk, message: "No major change. Follow-up with a clinician is recommended." };
}
""",

    # Lib - FHIR
    "lib/fhir/buildFhirContext.ts": """import { PatientCase } from '../types/case.types';

export function buildFhirContext(patientCase: PatientCase) {
  return {
    Patient: {
      resourceType: "Patient",
      id: patientCase.id,
      gender: patientCase.patient.gender,
    },
    Conditions: patientCase.symptoms.map((s) => ({
      resourceType: "Condition",
      code: s.name,
      severity: s.severity,
      onset: s.duration,
    })),
    Observations: Object.entries(patientCase.labs || {}).map(([key, value]) => ({
      resourceType: "Observation",
      code: key,
      value,
    })),
    ImagingStudy: patientCase.imaging ? {
      resourceType: "ImagingStudy",
      modality: patientCase.imaging.type,
      url: patientCase.imaging.url,
    } : null,
  };
}
""",
    "lib/fhir/fhirTypes.ts": "export type FhirContext = any;",
    "lib/fhir/sampleFhirPatient.ts": "export const sampleFhirPatient = {};",

    # Lib - MCP Tools
    "lib/mcp-tools/getPatientContext.ts": "export const getPatientContext = async () => { return {}; };",
    "lib/mcp-tools/getLabs.ts": """import { PatientCase } from '../types/case.types';
export async function getLabs(caseContext: PatientCase) {
  return caseContext.labs || {};
}
""",
    "lib/mcp-tools/getImaging.ts": "export const getImaging = async () => { return {}; };",
    "lib/mcp-tools/searchEvidence.ts": "export const searchEvidence = async () => { return []; };",
    "lib/mcp-tools/updateTimeline.ts": "export const updateTimeline = async () => { return {}; };",

    # Lib - RAG
    "lib/rag/knowledgeBase.ts": "export const knowledgeBase = {};",
    "lib/rag/retrieveEvidence.ts": "import { PatientCase } from '../types/case.types';\nexport const retrieveEvidence = async (patientCase: PatientCase) => { return []; };",
    "lib/rag/trustedSources.ts": "export const trustedSources = [];",

    # Lib - Prompts
    "lib/prompts/systemPrompt.ts": "export const systemPrompt = '';",
    "lib/prompts/agentPrompts.ts": "export const agentPrompts = {};",
    "lib/prompts/safetyPrompt.ts": "export const safetyPrompt = '';",

    # Lib - Mock
    "lib/mock/demoCases.ts": """import { PatientCase } from '../types/case.types';

export const demoChestPainCase: PatientCase = {
  id: "case-001",
  patient: {
    age: 52,
    gender: "male",
    medicalHistory: ["Hypertension", "Type 2 Diabetes"],
    medications: ["Metformin", "Lisinopril"],
  },
  symptoms: [
    { name: "Chest pain", severity: 8, duration: "2 hours" },
    { name: "Dizziness", severity: 5, duration: "1 hour" },
    { name: "Shortness of breath", severity: 7, duration: "2 hours" }
  ],
  labs: {
    troponin: "high",
    cholesterol: 240
  },
  imaging: {
    type: "xray",
    url: "/demo/chest-xray.png",
    observation: "Clear lungs, slight cardiomegaly"
  }
};
""",
    "lib/mock/mockDebate.ts": "export const mockDebate = [];",
    "lib/mock/mockResults.ts": "export const mockResults = {};",

    # Store
    "store/caseStore.ts": "export const useCaseStore = () => { return {}; };",
}

for path, content in files.items():
    create_file(path, content)

print("Scaffolding completed successfully.")
