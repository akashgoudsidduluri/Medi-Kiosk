import { ClinicalHistory, AyushAssessment, InterviewQuestion, CaseSummary } from "@/types";

export interface AiInterviewService {
  /**
   * Generates the next logical question based on current history.
   * Deterministic for Local AI, dynamic for LLM.
   */
  getNextQuestion(history: ClinicalHistory, complaint: string): Promise<InterviewQuestion>;

  /**
   * Generates a final structured summary of the patient's case.
   */
  generateSummary(history: ClinicalHistory, ayush: AyushAssessment): Promise<CaseSummary>;

  /**
   * Identifies any missing critical information.
   */
  detectMissingInformation(history: ClinicalHistory): Promise<string[]>;
}
