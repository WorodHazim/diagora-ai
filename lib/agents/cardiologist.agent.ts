import { PatientCase } from '../types/case.types';

export const runCardiologistAgent = async (context: any) => {
  return {
    agentId: 'runCardiologistAgent',
    name: 'runCardiologistAgent Agent',
    role: 'Cardiologist',
    opinion: 'Placeholder opinion for runCardiologistAgent',
    concerns: [],
    confidence: 0.8
  };
};
