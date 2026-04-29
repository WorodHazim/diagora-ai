import { PatientCase } from '../types/case.types';

export const runVisionAgent = async (context: any) => {
  return {
    agentId: 'runVisionAgent',
    name: 'runVisionAgent Agent',
    role: 'Imaging Specialist',
    opinion: 'Placeholder opinion for runVisionAgent',
    concerns: [],
    confidence: 0.8
  };
};
