import { PatientCase } from '../types/case.types';
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
