import { PatientCase } from '../types/case.types';

export const demoChestPainCase: PatientCase = {
  id: "case-001",
  patient: {
    age: 52,
    gender: "male",
    medicalHistory: ["Hypertension", "Type 2 Diabetes"],
    medications: ["Metformin", "Lisinopril"],
  },
  symptoms: [
    { name: "Chest pain", severity: 8, duration: "2 hours" },
    { name: "Dizziness", severity: 5, duration: "1 hour" },
    { name: "Shortness of breath", severity: 7, duration: "2 hours" }
  ],
  labs: {
    troponin: "high",
    cholesterol: 240
  },
  imaging: {
    type: "xray",
    url: "/demo/chest-xray.png",
    observation: "Clear lungs, slight cardiomegaly"
  }
};
