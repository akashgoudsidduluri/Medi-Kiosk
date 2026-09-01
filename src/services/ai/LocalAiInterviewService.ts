import { ClinicalHistory, AyushAssessment, InterviewQuestion, CaseSummary } from "@/types";
import { AiInterviewService } from "./AiInterviewService";

const socratesOrder: (keyof ClinicalHistory)[] = [
  "site",
  "onset",
  "character",
  "radiation",
  "associatedSymptoms",
  "timing",
  "exacerbatingFactors",
  "relievingFactors",
  "severity",
];

const socratesQuestions: Record<keyof ClinicalHistory, string> = {
  chiefComplaint: "What brings you here today?",
  site: "Where exactly is the problem located?",
  onset: "When did this start?",
  character: "How would you describe the feeling (e.g., sharp, dull, burning)?",
  radiation: "Does the feeling spread anywhere else?",
  associatedSymptoms: "Are you experiencing any other symptoms?",
  timing: "Is it constant, or does it come and go?",
  exacerbatingFactors: "Does anything make it worse?",
  relievingFactors: "Does anything make it better?",
  severity: "On a scale of 0 to 10, how severe is it?",
};

export class LocalAiInterviewService implements AiInterviewService {
  async getNextQuestion(history: ClinicalHistory, complaint: string): Promise<InterviewQuestion> {
    await new Promise((resolve) => setTimeout(resolve, 600)); // Simulate processing

    if (!complaint) {
      return {
        question: "What brings you here today?",
        targetField: "chiefComplaint",
      };
    }

    for (const field of socratesOrder) {
      if (!history[field]) {
        return {
          question: socratesQuestions[field],
          targetField: field,
        };
      }
    }

    return {
      question: "Thank you. I have all the information I need.",
      targetField: "chiefComplaint" as any,
    };
  }

  async generateSummary(history: ClinicalHistory, ayush: AyushAssessment): Promise<CaseSummary> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    let summary = `Patient presents with ${history.chiefComplaint}. `;
    if (history.onset) summary += `Started ${history.onset}. `;
    if (history.site) summary += `Located at ${history.site}. `;
    if (history.severity) summary += `Severity is ${history.severity}.`;

    return {
      summary,
      redFlags: [], // Triage engine handles real red flags
    };
  }

  async detectMissingInformation(history: ClinicalHistory): Promise<string[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const missing: string[] = [];
    for (const field of socratesOrder) {
      if (!history[field]) {
        missing.push(field as string);
      }
    }
    return missing;
  }
}
