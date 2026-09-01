import { ClinicalHistory, AyushAssessment, InterviewQuestion, CaseSummary, ClinicalState } from "@/types";
import { AiInterviewService } from "./AiInterviewService";
import { QuestionPlanner } from "./QuestionPlanner";
import { detectComplaintType, getQuestionPlan } from "./clinicalQuestions";

export class LocalAiInterviewService implements AiInterviewService {
  private planner = new QuestionPlanner();

  async getNextQuestion(
    history: ClinicalHistory,
    complaint: string,
    clinicalState?: ClinicalState
  ): Promise<InterviewQuestion> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (!complaint) {
      return {
        question: "What brings you here today? Please describe your main concern.",
        targetField: "chiefComplaint",
      };
    }

    // Use ClinicalState if provided, otherwise build a simple one from history
    const state: ClinicalState = clinicalState ?? this.historyToClinicalState(history, complaint);
    const result = this.planner.getNextQuestion(state);

    if (result.isComplete || !result.question) {
      return {
        question: "Thank you. I have gathered the information needed for your doctor. Please proceed to the next step.",
        targetField: "complete",
      };
    }

    return result.question;
  }

  async processAnswer(
    patientAnswer: string,
    currentQuestion: string,
    clinicalState: ClinicalState
  ): Promise<{
    updatedState: ClinicalState;
    nextQuestion: InterviewQuestion | null;
    providerStatus: "LOCAL" | "GROQ" | "GROQ_FALLBACK";
  }> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const updated = { ...clinicalState };

    // Detect "I don't know" type answers
    const isUnknown = /don't know|not sure|can't remember|haven't noticed|no idea/i.test(patientAnswer);

    // Find the current target field from the planner
    const plannerResult = this.planner.getNextQuestion(clinicalState);
    const targetField = plannerResult.question?.targetField;

    if (targetField && targetField !== "complete") {
      if (isUnknown) {
        if (!updated.unknownFields.includes(targetField)) {
          updated.unknownFields = [...updated.unknownFields, targetField];
        }
      } else {
        // Simple assignment based on field type
        const arrayFields = ["associatedSymptoms", "pastMedicalHistory", "medications", "allergies"];
        if (arrayFields.includes(targetField)) {
          (updated as Record<string, unknown>)[targetField] = [
            ...(((updated as Record<string, unknown>)[targetField] as string[]) ?? []),
            patientAnswer.trim(),
          ];
        } else if (targetField === "severity") {
          const match = patientAnswer.match(/\b(\d+)\b/);
          if (match) updated.severity = Math.min(10, parseInt(match[1]));
        } else {
          (updated as Record<string, unknown>)[targetField] = patientAnswer.trim();
        }

        updated.patientFacts = [
          ...updated.patientFacts,
          {
            field: targetField,
            value: patientAnswer.trim(),
            source: "PATIENT" as const,
            confidence: 0.8,
            verified: false,
            timestamp: new Date().toISOString(),
          },
        ];
      }
    }

    // Recalculate completeness
    const complaint = updated.chiefComplaint ?? "";
    const complaintType = detectComplaintType(complaint);
    const plan = getQuestionPlan(complaintType);
    updated.completeness = this.planner.calculateCompleteness(updated, plan);

    const newPlannerResult = this.planner.getNextQuestion(updated);

    return {
      updatedState: updated,
      nextQuestion: newPlannerResult.question,
      providerStatus: "LOCAL",
    };
  }

  async extractDocumentFacts(
    ocrText: string
  ): Promise<Array<{ field: string; value: string; confidence: number }>> {
    await new Promise((resolve) => setTimeout(resolve, 100));
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
    await new Promise((resolve) => setTimeout(resolve, 400));
    let summary = `Patient presents with ${history.chiefComplaint}. `;
    if (history.onset) summary += `Started ${history.onset}. `;
    if (history.site) summary += `Located at ${history.site}. `;
    if (history.severity) summary += `Severity ${history.severity}/10.`;
    return { summary, redFlags: [] };
  }

  async detectMissingInformation(history: ClinicalHistory): Promise<string[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const fields = ["site", "onset", "character", "severity", "associatedSymptoms"];
    return fields.filter((f) => !(history as Record<string, unknown>)[f]);
  }

  private historyToClinicalState(history: ClinicalHistory, complaint: string): ClinicalState {
    return {
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
      pastMedicalHistory: [],
      medications: [],
      allergies: [],
      reviewOfSystems: {},
      patientFacts: [],
      documentFacts: [],
      verifiedFacts: [],
      unknownFields: [],
      contradictions: [],
      documentReferences: [],
      completeness: 0,
    };
  }
}
