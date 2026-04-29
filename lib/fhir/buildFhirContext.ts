import { PatientCase } from '../types/case.types';

export function buildFhirContext(patientCase: PatientCase) {
  return {
    Patient: {
      resourceType: "Patient",
      id: patientCase.id,
      gender: patientCase.patient.gender,
    },
    Conditions: patientCase.symptoms.map((s) => ({
      resourceType: "Condition",
      code: s.name,
      severity: s.severity,
      onset: s.duration,
    })),
    Observations: Object.entries(patientCase.labs || {}).map(([key, value]) => ({
      resourceType: "Observation",
      code: key,
      value,
    })),
    ImagingStudy: patientCase.imaging ? {
      resourceType: "ImagingStudy",
      modality: patientCase.imaging.type,
      url: patientCase.imaging.url,
    } : null,
  };
}
