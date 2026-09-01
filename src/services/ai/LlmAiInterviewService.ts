import { ClinicalHistory, AyushAssessment, InterviewQuestion, CaseSummary } from "@/types";
import { AiInterviewService } from "./AiInterviewService";

/**
 * Placeholder for the LLM-backed AI service.
 * For the hackathon prototype, this is not fully implemented unless API keys are provided.
 */
export class LlmAiInterviewService implements AiInterviewService {
  async getNextQuestion(history: ClinicalHistory, complaint: string): Promise<InterviewQuestion> {
    throw new Error("LlmAiInterviewService not implemented. Use LocalAiInterviewService for demo.");
  }

  async generateSummary(history: ClinicalHistory, ayush: AyushAssessment): Promise<CaseSummary> {
    throw new Error("LlmAiInterviewService not implemented. Use LocalAiInterviewService for demo.");
  }

  async detectMissingInformation(history: ClinicalHistory): Promise<string[]> {
    throw new Error("LlmAiInterviewService not implemented. Use LocalAiInterviewService for demo.");
  }
}
