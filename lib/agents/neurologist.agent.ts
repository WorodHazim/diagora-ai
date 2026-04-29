import { PatientCase } from '../types/case.types';

export const runNeurologistAgent = async (context: any) => {
  return {
    agentId: 'runNeurologistAgent',
    name: 'runNeurologistAgent Agent',
    role: 'Neurologist',
    opinion: 'Placeholder opinion for runNeurologistAgent',
    concerns: [],
    confidence: 0.8
  };
};
