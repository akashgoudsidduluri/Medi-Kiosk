/**
 * AI Service Abstraction
 * 
 * TODO: Replace MockAIService with RealAIService when
 * actual LLM API (Llama-3/OpenHathi) credentials are available.
 * 
 * Current implementation: MockAIService
 * Interface: AIService
 */

export interface AIService {
  generateFollowUpQuestion(
    complaint: string,
    socrates: Record<string, string>
  ): Promise<string>;
  analyzeSymptoms(socrates: Record<string, string>): Promise<SymptomAnalysis>;
  generateCaseSummary(patientData: PatientCaseData): Promise<CaseSummary>;
}

export interface SymptomAnalysis {
  redFlags: string[];
  clinicalNotes: string[];
  suggestedQuestions: string[];
}

export interface PatientCaseData {
  patient: {
    name: string;
    age: number;
    gender: string;
  };
  chiefComplaint: string;
  socrates: Record<string, string>;
  ayush: Record<string, string>;
  documents: Array<{
    extractedData: Record<string, string>;
  }>;
  timeline: Array<{
    title: string;
    description: string;
  }>;
}

export interface CaseSummary {
  summary: string;
  redFlags: string[];
  missingInformation: string[];
  clinicalAlerts: string[];
}

// SOCRATES question flow for different complaints
const socratesFlow: Record<string, string[]> = {
  "chest pain": [
    "Where exactly is the pain located? Is it on one side or in the center?",
    "When did this pain start? Was it sudden or gradual?",
    "What does the pain feel like? Is it sharp, dull, crushing, or burning?",
    "Does the pain spread anywhere else? Your arm, jaw, or back?",
    "Are you experiencing any other symptoms alongside the pain? Breathlessness, sweating, nausea?",
    "Is the pain constant or does it come and go? What makes it worse or better?",
    "How would you rate the severity on a scale of 1-10?",
  ],
  "stomach": [
    "Where in your abdomen is the discomfort? Upper, lower, left, or right?",
    "When did this start? How long have you had it?",
    "Is the pain constant or does it come and go?",
    "Does eating make it better or worse? What about specific foods?",
    "Have you noticed any changes in your bowel movements? Diarrhea, constipation, or blood?",
    "Do you have any nausea, vomiting, or bloating?",
    "Have you had similar episodes before? Any previous diagnoses?",
  ],
  "joint pain": [
    "Which joint is affected? Is it on one side or both?",
    "When did the pain start? Was there an injury or did it develop gradually?",
    "Is there any swelling, redness, or warmth around the joint?",
    "How does it affect your movement? Can you bend/straighten fully?",
    "Is there stiffness? If so, how long does it last, especially in the morning?",
    "What makes it worse? Activity, rest, or certain positions?",
    "How severe is the pain on a scale of 1-10?",
  ],
  default: [
    "Can you describe your main symptom in more detail?",
    "When did this symptom first appear?",
    "How has it progressed since it started?",
    "Are there any other symptoms you've noticed?",
    "What makes it better or worse?",
    "Have you experienced this before?",
    "On a scale of 1-10, how severe would you rate this?",
  ],
};

class MockAIService implements AIService {
  private questionIndex: Record<string, number> = {};

  async generateFollowUpQuestion(
    complaint: string,
    socrates: Record<string, string>
  ): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const lowerComplaint = complaint.toLowerCase();
    let flow = socratesFlow.default;

    if (lowerComplaint.includes("chest")) {
      flow = socratesFlow["chest pain"];
    } else if (lowerComplaint.includes("stomach") || lowerComplaint.includes("abdomen") || lowerComplaint.includes("abdominal")) {
      flow = socratesFlow["stomach"];
    } else if (lowerComplaint.includes("joint") || lowerComplaint.includes("knee")) {
      flow = socratesFlow["joint pain"];
    }

    const key = lowerComplaint.includes("chest")
      ? "chest"
      : lowerComplaint.includes("stomach") || lowerComplaint.includes("abdomen")
        ? "stomach"
        : lowerComplaint.includes("joint")
          ? "joint"
          : "default";

    if (!this.questionIndex[key]) {
      this.questionIndex[key] = 0;
    }

    const answeredCount = Object.values(socrates).filter((v) => v !== "").length;
    const questionIdx = Math.min(answeredCount, flow.length - 1);

    return flow[questionIdx];
  }

  async analyzeSymptoms(socrates: Record<string, string>): Promise<SymptomAnalysis> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const redFlags: string[] = [];
    const clinicalNotes: string[] = [];
    const suggestedQuestions: string[] = [];

    if (socrates.severity?.includes("8/10") || socrates.severity?.includes("9/10") || socrates.severity?.includes("10/10")) {
      redFlags.push("High severity rating detected");
    }
    if (socrates.radiation && !socrates.radiation.toLowerCase().includes("no")) {
      clinicalNotes.push("Radiation pattern noted — further evaluation recommended");
    }
    if (socrates.associatedSymptoms) {
      clinicalNotes.push("Associated symptoms documented");
    }
    if (!socrates.exacerbatingFactors) {
      suggestedQuestions.push("Exacerbating factors not yet documented");
    }

    return { redFlags, clinicalNotes, suggestedQuestions };
  }

  async generateCaseSummary(patientData: PatientCaseData): Promise<CaseSummary> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const missingInformation: string[] = [];
    const clinicalAlerts: string[] = [];

    if (!patientData.socrates.severity) {
      missingInformation.push("Severity assessment incomplete");
    }
    if (!patientData.socrates.associatedSymptoms) {
      missingInformation.push("Associated symptoms not documented");
    }

    const summary = `${patientData.patient.name}, ${patientData.patient.age}y ${patientData.patient.gender}. ` +
      `Chief complaint: ${patientData.chiefComplaint}. ` +
      `SOCRATES assessment completed with ${Object.values(patientData.socrates).filter((v) => v !== "").length}/9 fields documented.`;

    return {
      summary,
      redFlags: [],
      missingInformation,
      clinicalAlerts,
    };
  }
}

export const aiService: AIService = new MockAIService();
