import { PatientCase } from '../types/case.types';

export function applyRiskRules(patientCase: PatientCase) {
  const symptoms = patientCase.symptoms.map((s) => s.name.toLowerCase());
  const labs = patientCase.labs || {};

  if (symptoms.includes("chest pain") && (symptoms.includes("dizziness") || symptoms.includes("shortness of breath"))) {
    return { risk: "HIGH", reason: "Chest pain with dizziness or shortness of breath is a red flag." };
  }

  if (String(labs.troponin).toLowerCase() === "high") {
    return { risk: "EMERGENCY", reason: "Elevated troponin with chest pain may indicate cardiac injury." };
  }

  return { risk: "MEDIUM", reason: "Symptoms require clinical evaluation." };
}
