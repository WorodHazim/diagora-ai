import { PatientCase } from '../types/case.types';

export const runPulmonologistAgent = async (context: any) => {
  return {
    agentId: 'runPulmonologistAgent',
    name: 'runPulmonologistAgent Agent',
    role: 'Pulmonologist',
    opinion: 'Placeholder opinion for runPulmonologistAgent',
    concerns: [],
    confidence: 0.8
  };
};
