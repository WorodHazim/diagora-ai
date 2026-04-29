import { PatientCase } from '../types/case.types';
export async function getLabs(caseContext: PatientCase) {
  return caseContext.labs || {};
}
