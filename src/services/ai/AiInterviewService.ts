import { ClinicalHistory, AyushAssessment, InterviewQuestion, CaseSummary, ClinicalState } from "@/types";

export interface AiInterviewService {
  /**
   * Get the next question based on current history + optional ClinicalState.
   * Deterministic for Local AI, dynamic for LLM.
   */
  getNextQuestion(
    history: ClinicalHistory,
    complaint: string,
    clinicalState?: ClinicalState
  ): Promise<InterviewQuestion>;

  /**
   * Process a patient answer and return updated state + next question.
   * Used by the GroqAiInterviewService to do extraction in one pass.
   * LocalAiInterviewService provides a simple passthrough implementation.
   */
  processAnswer?(
    patientAnswer: string,
    currentQuestion: string,
    clinicalState: ClinicalState
  ): Promise<{
    updatedState: ClinicalState;
    nextQuestion: InterviewQuestion | null;
    providerStatus: "LOCAL" | "GROQ" | "GROQ_FALLBACK";
  }>;

  /**
   * Extract structured facts from OCR text.
   */
  extractDocumentFacts?(
    ocrText: string
  ): Promise<Array<{ field: string; value: string; confidence: number }>>;

  /**
   * Generate a final structured summary of the patient's case.
   */
  generateSummary(history: ClinicalHistory, ayush: AyushAssessment): Promise<CaseSummary>;

  /**
   * Identify missing critical information.
   */
  detectMissingInformation(history: ClinicalHistory): Promise<string[]>;
}
