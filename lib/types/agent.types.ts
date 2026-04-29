export type AgentResponse = {
  agentId: string;
  name: string;
  role: string;
  opinion: string;
  concerns: string[];
  confidence: number;
  requestedData?: string[];
  respondsTo?: string[];
};
