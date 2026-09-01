import { PatientState } from "@/store/patientStore";
import { CaseSheetService, StructuredCaseSheet } from "./CaseSheetService";

export class LocalCaseSheetService implements CaseSheetService {
  async generateCaseSheet(patientState: PatientState): Promise<StructuredCaseSheet> {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate generation time

    // Calculate red flags based on triage and history
    const redFlags: string[] = [];
    if (patientState.triage?.priority === "urgent") {
      redFlags.push(...patientState.triage.reasons);
    }
    
    // Add simple deterministic red flags if they exist in chief complaint or socrates
    const allText = `${patientState.chiefComplaint} ${Object.values(patientState.socrates).join(" ")}`.toLowerCase();
    if (allText.includes("chest pain") && allText.includes("breathless")) {
      if (!redFlags.includes("Chest pain + breathlessness")) {
        redFlags.push("Chest pain + breathlessness");
      }
    }

    // Detect missing information
    const missingInformation: string[] = [];
    const requiredSocrates = ["site", "onset", "character", "severity"] as const;
    requiredSocrates.forEach(field => {
      if (!patientState.socrates[field]) {
        missingInformation.push(`SOCRATES: ${field}`);
      }
    });

    if (!patientState.ayush.prakriti) {
      missingInformation.push("AYUSH: Prakriti not assessed");
    }

    return {
      patientInfo: {
        name: patientState.name,
        age: patientState.age,
        gender: patientState.gender,
        abhaId: patientState.abhaId,
        mobileNumber: patientState.mobileNumber,
      },
      clinicalHistory: {
        chiefComplaint: patientState.chiefComplaint,
        ...patientState.socrates,
      },
      ayushAssessment: patientState.ayush,
      documents: patientState.documents,
      timeline: patientState.timeline,
      triage: patientState.triage,
      redFlags,
      missingInformation,
      generatedAt: new Date().toISOString(),
    };
  }
}
