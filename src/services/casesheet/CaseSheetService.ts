import { PatientState } from "@/store/patientStore";

export interface StructuredCaseSheet {
  patientInfo: {
    name: string;
    age: number;
    gender: string;
    abhaId?: string;
    mobileNumber?: string;
  };
  clinicalHistory: PatientState["socrates"] & { chiefComplaint: string };
  ayushAssessment: PatientState["ayush"];
  documents: PatientState["documents"];
  timeline: PatientState["timeline"];
  triage: PatientState["triage"];
  redFlags: string[];
  missingInformation: string[];
  generatedAt: string;
}

export interface CaseSheetService {
  /**
   * Assembles all patient data into a final structured case sheet.
   */
  generateCaseSheet(patientState: PatientState): Promise<StructuredCaseSheet>;
}
