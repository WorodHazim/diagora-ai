export function updateRiskFromFollowUp(previousRisk: string, update: string) {
  if (update === "worse") {
    return { risk: "EMERGENCY", message: "Symptoms worsened. Immediate medical evaluation is recommended." };
  }

  if (update === "better") {
    return { risk: "LOWER", message: "Symptoms improved. Continue monitoring and follow medical advice." };
  }

  return { risk: previousRisk, message: "No major change. Follow-up with a clinician is recommended." };
}
