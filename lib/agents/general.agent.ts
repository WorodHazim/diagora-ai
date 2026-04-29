import { PatientCase } from '../types/case.types';

export const runGeneralAgent = async (context: any) => {
  return {
    agentId: 'runGeneralAgent',
    name: 'runGeneralAgent Agent',
    role: 'General Practitioner',
    opinion: 'Placeholder opinion for runGeneralAgent',
    concerns: [],
    confidence: 0.8
  };
};
