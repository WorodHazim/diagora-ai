// Placeholder types
export type PatientCase = {
  id: string;
  patient: {
    age: number;
    gender: string;
    medicalHistory: string[];
    medications: string[];
  };
  symptoms: {
    name: string;
    severity: number;
    duration: string;
  }[];
  labs?: Record<string, string | number>;
  imaging?: {
    type: "xray" | "ct" | "mri" | "ultrasound";
    url: string;
    observation?: string;
  };
};

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
