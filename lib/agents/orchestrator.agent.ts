import { PatientCase } from '../types/case.types';

export const runOrchestratorAgent = async (context: any) => {
  return {
    agentId: 'runOrchestratorAgent',
    name: 'runOrchestratorAgent Agent',
    role: 'Lead Physician',
    opinion: 'Placeholder opinion for runOrchestratorAgent',
    concerns: [],
    confidence: 0.8
  };
};
