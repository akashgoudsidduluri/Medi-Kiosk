/**
 * QuestionPlanner — the authoritative interview controller.
 *
 * The planner is responsible for:
 * 1. Determining which field to ask next based on ClinicalState.
 * 2. Consulting document facts to avoid asking already-known information redundantly.
 * 3. Calculating interview completeness.
 * 4. Providing a stopping condition.
 * 5. Validating/overriding Groq's field suggestion.
 *
 * Groq provides language understanding.
 * The QuestionPlanner provides clinical structure.
 */

import { ClinicalState, InterviewQuestion, ClinicalFact } from "@/types";
import {
  ComplaintType,
  detectComplaintType,
  getQuestionPlan,
  ComplaintQuestionPlan,
} from "./clinicalQuestions";

export interface PlannerResult {
  question: InterviewQuestion | null; // null = interview complete
  complaintType: ComplaintType;
  completeness: number; // 0–1
  missingFields: string[];
  isComplete: boolean;
}

// Threshold: if completeness ≥ this, the interview may stop
const COMPLETION_THRESHOLD = 0.85;

export class QuestionPlanner {
  /**
   * Determine the next question to ask.
   * Returns null when the interview is considered complete.
   */
  getNextQuestion(
    state: ClinicalState,
    groqSuggestedField?: string
  ): PlannerResult {
    const complaint = state.chiefComplaint ?? "";
    const type = detectComplaintType(complaint);
    const plan = getQuestionPlan(type);

    const missingFields = this.getMissingFields(state, plan);
    const completeness = this.calculateCompleteness(state, plan);

    // Interview complete if threshold met
    if (completeness >= COMPLETION_THRESHOLD && missingFields.length === 0) {
      return { question: null, complaintType: type, completeness, missingFields, isComplete: true };
    }

    // Select next field: prefer Groq's suggestion if it's in the allowed list
    let targetField: string | null = null;

    if (groqSuggestedField && missingFields.includes(groqSuggestedField)) {
      targetField = groqSuggestedField;
    } else {
      // Use the plan's ordered list to pick the first missing field
      for (const f of plan.fields) {
        if (missingFields.includes(f)) {
          targetField = f;
          break;
        }
      }
    }

    if (!targetField) {
      return { question: null, complaintType: type, completeness, missingFields, isComplete: true };
    }

    // Build the question, optionally annotating with document context
    const baseQuestion = plan.questions[targetField] ?? `Please tell me about your ${targetField}.`;
    const docHint = this.getDocumentHint(state, targetField);

    const question: InterviewQuestion = {
      question: docHint ? `${docHint} ${baseQuestion}` : baseQuestion,
      targetField,
      hint: docHint || undefined,
    };

    return {
      question,
      complaintType: type,
      completeness,
      missingFields,
      isComplete: completeness >= COMPLETION_THRESHOLD,
    };
  }

  /**
   * Compute the list of fields still missing for the complaint's required set.
   * A field is considered answered if:
   * - It has a non-empty value in ClinicalState, OR
   * - It is in unknownFields (patient said they don't know — still counts as answered)
   */
  getMissingFields(state: ClinicalState, plan: ComplaintQuestionPlan): string[] {
    return plan.fields.filter((field) => {
      // Already answered by patient or marked unknown
      if (state.unknownFields.includes(field)) return false;

      const value = (state as unknown as Record<string, unknown>)[field];
      if (Array.isArray(value)) return value.length === 0;
      if (value !== null && value !== undefined && value !== "") return false;

      // Check document facts — if verified, treat as answered
      const docFact = state.documentFacts.find((f) => f.field === field && f.verified);
      if (docFact) return false;

      return true;
    });
  }

  /**
   * Calculate completeness as a ratio of required fields answered.
   */
  calculateCompleteness(state: ClinicalState, plan: ComplaintQuestionPlan): number {
    if (plan.required.length === 0) return 1;

    const answered = plan.required.filter((field) => {
      if (state.unknownFields.includes(field)) return true; // counts as resolved

      const value = (state as unknown as Record<string, unknown>)[field];
      if (Array.isArray(value)) return value.length > 0;
      if (value !== null && value !== undefined && value !== "") return true;

      const docFact = state.documentFacts.find((f) => f.field === field && f.verified);
      return !!docFact;
    });

    return answered.length / plan.required.length;
  }

  /**
   * If a document fact exists for the target field and is unverified,
   * return a hint string to prepend to the question.
   */
  private getDocumentHint(state: ClinicalState, field: string): string | null {
    const fact = state.documentFacts.find(
      (f: ClinicalFact) => f.field === field && !f.verified
    );
    if (!fact) return null;

    return `Your medical records mention "${fact.value}" regarding this.`;
  }

  /**
   * Generate document-confirmation questions.
   * Returns a list of unverified document facts that warrant confirmation.
   * The planner will insert these at appropriate points.
   */
  getDocumentConfirmationQuestions(state: ClinicalState): InterviewQuestion[] {
    const highPriorityFields = ["medications", "allergies", "pastMedicalHistory"];
    const result: InterviewQuestion[] = [];

    for (const fact of state.documentFacts) {
      if (fact.verified) continue;
      if (!highPriorityFields.includes(fact.field)) continue;

      // Only ask if patient hasn't answered this field yet
      const patientHasAnswered = state.patientFacts.some(
        (pf) => pf.field === fact.field
      );
      if (patientHasAnswered) continue;

      result.push({
        question: `Your medical records mention "${fact.value}" for ${fact.field}. Is that still current?`,
        targetField: `confirm_${fact.field}`,
        hint: `From uploaded document`,
      });
    }

    return result;
  }
}
