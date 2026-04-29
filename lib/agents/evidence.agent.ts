import { PatientCase } from '../types/case.types';

export const runEvidenceAgent = async (context: any) => {
  return {
    agentId: 'runEvidenceAgent',
    name: 'runEvidenceAgent Agent',
    role: 'Evidence Gatherer',
    opinion: 'Placeholder opinion for runEvidenceAgent',
    concerns: [],
    confidence: 0.8
  };
};
