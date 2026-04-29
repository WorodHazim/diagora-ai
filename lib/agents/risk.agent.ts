import { PatientCase } from '../types/case.types';

export const runRiskAgent = async (context: any) => {
  return {
    agentId: 'runRiskAgent',
    name: 'runRiskAgent Agent',
    role: 'Risk Analyst',
    opinion: 'Placeholder opinion for runRiskAgent',
    concerns: [],
    confidence: 0.8
  };
};
