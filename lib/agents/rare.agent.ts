import { PatientCase } from '../types/case.types';

export const runRareAgent = async (context: any) => {
  return {
    agentId: 'runRareAgent',
    name: 'runRareAgent Agent',
    role: 'Rare Disease Specialist',
    opinion: 'Placeholder opinion for runRareAgent',
    concerns: [],
    confidence: 0.8
  };
};
