import { ClinicalHistory, AyushAssessment, InterviewQuestion, CaseSummary, ClinicalState, defaultClinicalState } from "@/types";
import { AiInterviewService, ProcessAnswerOptions, ProcessAnswerResult } from "./AiInterviewService";
import { QuestionPlanner } from "./QuestionPlanner";
import { detectComplaintType, getQuestionPlan } from "./clinicalQuestions";
import {
  applyExtractedFields,
  extractFactsFromAnswer,
  isAnswerCompatibleWithField,
  isGreetingLike,
  isUnknownAnswer,
  markUnknown,
} from "./answerExtraction";
import { chiefComplaintPrompt, interviewCompleteMessage, clarificationMessage, greetingRetryMessage, severityClarificationMessage } from "./interviewI18n";

export class LocalAiInterviewService implements AiInterviewService {
  private planner = new QuestionPlanner();

  async getNextQuestion(
    history: ClinicalHistory,
    complaint: string,
    clinicalState?: ClinicalState,
    language?: string
  ): Promise<InterviewQuestion> {
    await new Promise((resolve) => setTimeout(resolve, 80));

    if (!complaint) {
      return {
        question: chiefComplaintPrompt(language),
        targetField: "chiefComplaint",
      };
    }

    const state: ClinicalState = clinicalState ?? this.historyToClinicalState(history, complaint);
    const result = this.planner.getNextQuestion(state, { language });

    if (result.isComplete || !result.question) {
      return {
        question: interviewCompleteMessage(language),
        targetField: "complete",
      };
    }

    return result.question;
  }

  async processAnswer(
    patientAnswer: string,
    _currentQuestion: string,
    clinicalState: ClinicalState,
    options?: ProcessAnswerOptions
  ): Promise<ProcessAnswerResult> {
    await new Promise((resolve) => setTimeout(resolve, 80));

    const language = options?.language;
    const plannerBefore = this.planner.getNextQuestion(clinicalState, { language });
    const targetField = options?.targetField ?? plannerBefore.question?.targetField;

    let updated = { ...clinicalState };

    if (targetField === "chiefComplaint" && isGreetingLike(patientAnswer)) {
      return {
        updatedState: updated,
        nextQuestion: {
          question: greetingRetryMessage(language),
          targetField: "chiefComplaint",
        },
        providerStatus: "LOCAL",
      };
    }

    if (isUnknownAnswer(patientAnswer) && targetField) {
      updated = markUnknown(updated, targetField);
    } else {
      const extracted = extractFactsFromAnswer(patientAnswer, targetField);
      if (targetField && !isAnswerCompatibleWithField(targetField, patientAnswer, extracted, updated)) {
        return {
          updatedState: updated,
          nextQuestion: {
            question: targetField === "severity"
              ? severityClarificationMessage(language)
              : clarificationMessage(language),
            targetField,
          },
          providerStatus: "LOCAL",
        };
      }
      updated = applyExtractedFields(updated, extracted, { answerText: patientAnswer });
    }

    const complaint = updated.chiefComplaint ?? "";
    const plan = getQuestionPlan(detectComplaintType(complaint));
    const after = this.planner.getNextQuestion(updated, { language });
    updated.completeness = this.planner.calculateCompleteness(updated, plan);

    return {
      updatedState: updated,
      nextQuestion: after.question,
      providerStatus: "LOCAL",
    };
  }

  async extractDocumentFacts(
    ocrText: string
  ): Promise<Array<{ field: string; value: string; confidence: number }>> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const facts: Array<{ field: string; value: string; confidence: number }> = [];
    const lines = ocrText.split("\n").filter((l) => l.trim());

    for (const line of lines) {
      const lc = line.toLowerCase();
      if (/mg\b|tablet|capsule|syrup|injection|\brx\b/i.test(line)) {
        facts.push({ field: "medications", value: line.trim(), confidence: 0.6 });
      } else if (/allerg|reaction to/i.test(lc)) {
        facts.push({ field: "allergies", value: line.trim(), confidence: 0.6 });
      } else if (/diabetes|hypertension|cardiac|surgery|appendect|cancer|thyroid/i.test(lc)) {
        facts.push({ field: "pastMedicalHistory", value: line.trim(), confidence: 0.55 });
      }
    }

    return facts;
  }

  async generateSummary(history: ClinicalHistory, _ayush: AyushAssessment): Promise<CaseSummary> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    let summary = `Patient presents with ${history.chiefComplaint}. `;
    if (history.onset) summary += `Started ${history.onset}. `;
    if (history.site) summary += `Located at ${history.site}. `;
    if (history.severity) summary += `Severity ${history.severity}/10.`;
    return { summary, redFlags: [] };
  }

  async detectMissingInformation(history: ClinicalHistory): Promise<string[]> {
    const fields = ["site", "onset", "character", "severity", "associatedSymptoms"];
    return fields.filter((f) => !(history as Record<string, unknown>)[f]);
  }

  private historyToClinicalState(history: ClinicalHistory, complaint: string): ClinicalState {
    const base = defaultClinicalState();
    return {
      ...base,
      chiefComplaint: complaint || history.chiefComplaint,
      site: history.site,
      onset: history.onset,
      character: history.character,
      radiation: history.radiation,
      severity: history.severity ? parseFloat(history.severity) : null,
      associatedSymptoms: history.associatedSymptoms ? [history.associatedSymptoms] : [],
      timing: history.timing,
      aggravatingFactors: history.exacerbatingFactors,
      relievingFactors: history.relievingFactors,
    };
  }
}
