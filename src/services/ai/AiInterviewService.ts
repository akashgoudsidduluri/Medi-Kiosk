import { ClinicalHistory, AyushAssessment, InterviewQuestion, CaseSummary, ClinicalState } from "@/types";

export interface ProcessAnswerOptions {
  language?: string;
  targetField?: string;
}

export interface ProcessAnswerResult {
  updatedState: ClinicalState;
  nextQuestion: InterviewQuestion | null;
  providerStatus: "LOCAL" | "GROQ" | "GROQ_FALLBACK";
}

export interface AiInterviewService {
  getNextQuestion(
    history: ClinicalHistory,
    complaint: string,
    clinicalState?: ClinicalState,
    language?: string
  ): Promise<InterviewQuestion>;

  processAnswer?(
    patientAnswer: string,
    currentQuestion: string,
    clinicalState: ClinicalState,
    options?: ProcessAnswerOptions
  ): Promise<ProcessAnswerResult>;

  extractDocumentFacts?(
    ocrText: string
  ): Promise<Array<{ field: string; value: string; confidence: number }>>;

  generateSummary(history: ClinicalHistory, ayush: AyushAssessment): Promise<CaseSummary>;

  detectMissingInformation(history: ClinicalHistory): Promise<string[]>;
}
