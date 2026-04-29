import { PatientCase } from '../types/case.types';

export const runFollowupAgent = async (context: any) => {
  return {
    agentId: 'runFollowupAgent',
    name: 'runFollowupAgent Agent',
    role: 'Followup Specialist',
    opinion: 'Placeholder opinion for runFollowupAgent',
    concerns: [],
    confidence: 0.8
  };
};
