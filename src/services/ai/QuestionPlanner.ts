/**
 * QuestionPlanner — the authoritative interview controller.
 *
 * Groq provides language understanding.
 * The QuestionPlanner provides clinical structure and stop conditions.
 * Groq cannot invent arbitrary questions; it may only suggest a field from the plan.
 */

import { ClinicalState, InterviewQuestion, ClinicalFact } from "@/types";
import {
  ComplaintType,
  detectComplaintType,
  getQuestionPlan,
  ComplaintQuestionPlan,
} from "./clinicalQuestions";
import { documentHintText, getFieldLabel, localizePlanQuestion } from "./interviewI18n";

export interface PlannerResult {
  question: InterviewQuestion | null; // null = interview complete
  complaintType: ComplaintType;
  completeness: number; // 0–1
  missingFields: string[];
  isComplete: boolean;
}

export interface PlannerOptions {
  groqSuggestedField?: string;
  language?: string;
}

export class QuestionPlanner {
  getNextQuestion(state: ClinicalState, groqSuggestedFieldOrOptions?: string | PlannerOptions): PlannerResult {
    const options: PlannerOptions =
      typeof groqSuggestedFieldOrOptions === "string"
        ? { groqSuggestedField: groqSuggestedFieldOrOptions }
        : groqSuggestedFieldOrOptions ?? {};

    const complaint = state.chiefComplaint ?? "";
    const type = detectComplaintType(complaint);
    const plan = getQuestionPlan(type);
    const language = options.language;

    const missingFields = this.getMissingFields(state, plan);
    const completeness = this.calculateCompleteness(state, plan);
    const requiredMissing = plan.required.filter((f) => missingFields.includes(f));

    // Complaint-specific stop: all required fields resolved (answered or unknown),
    // and remaining missing fields are only optional — still ask optional until none left.
    const isComplete = missingFields.length === 0;

    if (isComplete) {
      return { question: null, complaintType: type, completeness: 1, missingFields, isComplete: true };
    }

    let targetField: string | null = null;
    const suggested = options.groqSuggestedField;
    if (suggested && missingFields.includes(suggested) && plan.fields.includes(suggested)) {
      targetField = suggested;
    } else {
      for (const f of plan.fields) {
        if (missingFields.includes(f)) {
          targetField = f;
          break;
        }
      }
    }

    if (!targetField) {
      return {
        question: null,
        complaintType: type,
        completeness,
        missingFields,
        isComplete: requiredMissing.length === 0,
      };
    }

    const baseQuestion = localizePlanQuestion(plan, targetField, language);
    const docHint = this.getDocumentHint(state, targetField, language);

    const question: InterviewQuestion = {
      question: docHint ? `${docHint} ${baseQuestion}` : baseQuestion,
      targetField,
      hint: docHint || undefined,
      fieldLabel: getFieldLabel(targetField, language),
    };

    return {
      question,
      complaintType: type,
      completeness,
      missingFields,
      isComplete: false,
    };
  }

  getMissingFields(state: ClinicalState, plan: ComplaintQuestionPlan): string[] {
    return plan.fields.filter((field) => {
      if (state.unknownFields.includes(field)) return false;

      const value = (state as unknown as Record<string, unknown>)[field];
      if (Array.isArray(value)) return value.length === 0;
      if (value !== null && value !== undefined && value !== "") return false;

      const docFact = state.documentFacts.find((f) => f.field === field && f.verified);
      if (docFact) return false;

      return true;
    });
  }

  calculateCompleteness(state: ClinicalState, plan: ComplaintQuestionPlan): number {
    if (plan.required.length === 0) return 1;

    const answered = plan.required.filter((field) => {
      if (state.unknownFields.includes(field)) return true;

      const value = (state as unknown as Record<string, unknown>)[field];
      if (Array.isArray(value)) return value.length > 0;
      if (value !== null && value !== undefined && value !== "") return true;

      const docFact = state.documentFacts.find((f) => f.field === field && f.verified);
      return !!docFact;
    });

    return answered.length / plan.required.length;
  }

  private getDocumentHint(state: ClinicalState, field: string, language?: string): string | null {
    const fact = state.documentFacts.find((f: ClinicalFact) => f.field === field && !f.verified);
    if (!fact) return null;
    return documentHintText(fact.value, language);
  }

  getDocumentConfirmationQuestions(state: ClinicalState, language?: string): InterviewQuestion[] {
    const highPriorityFields = ["medications", "allergies", "pastMedicalHistory"];
    const result: InterviewQuestion[] = [];
    const type = detectComplaintType(state.chiefComplaint ?? "");
    const plan = getQuestionPlan(type);

    for (const fact of state.documentFacts) {
      if (fact.verified) continue;
      if (!highPriorityFields.includes(fact.field)) continue;
      const patientHasAnswered = state.patientFacts.some((pf) => pf.field === fact.field);
      if (patientHasAnswered) continue;

      result.push({
        question: `${documentHintText(fact.value, language)} ${localizePlanQuestion(plan, fact.field, language)}`,
        targetField: `confirm_${fact.field}`,
        hint: "From uploaded document",
        fieldLabel: getFieldLabel(fact.field, language),
      });
    }

    return result;
  }
}
