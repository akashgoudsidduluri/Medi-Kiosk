/**
 * GroqAiInterviewService
 *
 * Implements the AiInterviewService interface using Groq as the language
 * understanding backend. Groq extracts structured clinical information from
 * patient answers. The QuestionPlanner then decides what to ask next.
 *
 * SECURITY: The Groq API key is NEVER in this file.
 * All requests go through the Vite dev-server proxy at /api/groq,
 * which reads GROQ_API_KEY from the server-side .env file.
 *
 * AI PROVIDER STATUS: track with aiProviderStatus.
 */

import { ClinicalHistory, AyushAssessment, InterviewQuestion, CaseSummary, ClinicalState } from "@/types";
import { AiInterviewService } from "./AiInterviewService";
import { LocalAiInterviewService } from "./LocalAiInterviewService";
import { parseGroqInterviewResponse, parseGroqDocumentExtraction } from "./aiSchemas";
import { QuestionPlanner } from "./QuestionPlanner";
import { detectComplaintType, getQuestionPlan } from "./clinicalQuestions";

export type AiProviderStatus = "LOCAL" | "GROQ" | "GROQ_FALLBACK";

// Module-level status, exported for UI consumption
let _status: AiProviderStatus = "LOCAL";
export const getAiProviderStatus = (): AiProviderStatus => _status;

declare const __GROQ_MODEL__: string | undefined;

const DEFAULT_MODEL = "qwen/qwen3.6-27b";
const MODEL = typeof __GROQ_MODEL__ !== "undefined" && __GROQ_MODEL__ ? __GROQ_MODEL__ : DEFAULT_MODEL;

const SYSTEM_PROMPT = `You are the language-understanding component of a patient pre-consultation clinical history system called MediKiosk.

Your role:
1. Understand ONLY what the patient explicitly said.
2. Extract structured clinical information into JSON.
3. Identify what information is still missing.
4. Suggest the next relevant field to ask about (from the allowed fields list).
5. Flag possible contradictions with existing information.

STRICT RULES:
- NEVER invent or infer information not explicitly stated by the patient.
- NEVER diagnose conditions.
- NEVER prescribe medications.
- NEVER fabricate dates, symptoms, or medications.
- If the patient is uncertain, mark the field as null.
- Ask only ONE question at a time (reflected in nextQuestionSuggestion).
- Use plain, patient-friendly language in your question suggestion.
- Return ONLY valid JSON. No prose, no markdown, no code fences.

You are NOT the doctor. You are NOT making clinical decisions.
The QuestionPlanner application layer controls what actually gets asked.
Your nextQuestionSuggestion is a hint, not an override.`;

function buildInterviewPrompt(
  patientAnswer: string,
  currentQuestion: string,
  chiefComplaint: string,
  currentState: Partial<ClinicalState>,
  documentFacts: Array<{ field: string; value: string }>,
  allowedFields: string[],
  unknownFields: string[]
): string {
  return `Current question asked: "${currentQuestion}"

Patient's answer: "${patientAnswer}"

Chief complaint: "${chiefComplaint}"

Current known information:
${JSON.stringify(
  {
    site: currentState.site,
    onset: currentState.onset,
    duration: currentState.duration,
    character: currentState.character,
    severity: currentState.severity,
    radiation: currentState.radiation,
    associatedSymptoms: currentState.associatedSymptoms,
    timing: currentState.timing,
    aggravatingFactors: currentState.aggravatingFactors,
    relievingFactors: currentState.relievingFactors,
    pastMedicalHistory: currentState.pastMedicalHistory,
    medications: currentState.medications,
    allergies: currentState.allergies,
  },
  null,
  2
)}

Fields already marked as unknown by patient: ${JSON.stringify(unknownFields)}

Document-reported information (NOT verified by patient):
${documentFacts.length > 0 ? JSON.stringify(documentFacts) : "None"}

Allowed fields for next question: ${JSON.stringify(allowedFields)}

Respond ONLY with valid JSON matching this exact structure:
{
  "extracted": {
    "chiefComplaint": null,
    "site": null,
    "onset": null,
    "duration": null,
    "character": null,
    "radiation": null,
    "severity": null,
    "associatedSymptoms": [],
    "timing": null,
    "aggravatingFactors": null,
    "relievingFactors": null,
    "pastMedicalHistory": [],
    "medications": [],
    "allergies": []
  },
  "missingFields": [],
  "documentRelatedFindings": [],
  "possibleContradictions": [],
  "nextQuestionSuggestion": {
    "field": "",
    "reason": ""
  },
  "confidence": 0.0
}

Rules for extracted fields:
- Only fill fields that the patient EXPLICITLY mentioned in this answer.
- severity must be a number 0-10 or null.
- associatedSymptoms, pastMedicalHistory, medications, allergies must be arrays.
- All other fields are strings or null.
- confidence is 0.0 to 1.0 reflecting extraction confidence.`;
}

function buildDocumentExtractionPrompt(ocrText: string): string {
  return `You are analyzing OCR-extracted text from a patient's medical document.

OCR text:
"${ocrText.substring(0, 3000)}"

Extract structured clinical facts from this text.

Rules:
- Only extract information explicitly present in the text.
- Do NOT infer diagnoses.
- Do NOT invent information.
- Assign confidence 0.0 to 1.0 based on clarity of the text.
- Valid field names: medications, allergies, pastMedicalHistory, pastSurgicalHistory, labResults, diagnoses, observations

Respond ONLY with valid JSON:
{
  "facts": [
    { "field": "medications", "value": "...", "confidence": 0.9 }
  ],
  "rawSummary": "Brief plain-English summary of the document"
}`;
}

async function callGroqProxy(messages: Array<{ role: string; content: string }>): Promise<string> {
  const response = await fetch("/api/groq", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, model: MODEL }),
    signal: AbortSignal.timeout(15000), // 15s timeout
  });

  if (!response.ok) {
    throw new Error(`Groq proxy returned ${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty Groq response");
  return content;
}

export class GroqAiInterviewService implements AiInterviewService {
  private fallback = new LocalAiInterviewService();
  private planner = new QuestionPlanner();

  /**
   * Get next interview question using Groq + QuestionPlanner.
   * Falls back to LocalAiInterviewService on any failure.
   */
  async getNextQuestion(
    history: ClinicalHistory,
    complaint: string,
    clinicalState?: ClinicalState
  ): Promise<InterviewQuestion> {
    const state = clinicalState ?? this.historyToClinicalState(history, complaint);
    const plannerResult = this.planner.getNextQuestion(state);

    if (plannerResult.isComplete || !plannerResult.question) {
      _status = "GROQ";
      return {
        question: "Thank you. I have gathered the information needed for your doctor. Please proceed to the next step.",
        targetField: "complete",
      };
    }

    return plannerResult.question;
  }

  /**
   * Process a patient answer through Groq, update clinical state, return next question.
   * This is the main entry point for the interview loop.
   */
  async processAnswer(
    patientAnswer: string,
    currentQuestion: string,
    clinicalState: ClinicalState
  ): Promise<{ updatedState: ClinicalState; nextQuestion: InterviewQuestion | null; providerStatus: AiProviderStatus }> {
    const complaint = clinicalState.chiefComplaint ?? "";
    const complaintType = detectComplaintType(complaint);
    const plan = getQuestionPlan(complaintType);
    const plannerResult = this.planner.getNextQuestion(clinicalState);
    const allowedFields = plannerResult.missingFields;

    const documentFacts = clinicalState.documentFacts.map((f) => ({
      field: f.field,
      value: f.value,
    }));

    try {
      const rawResponse = await callGroqProxy([
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: buildInterviewPrompt(
            patientAnswer,
            currentQuestion,
            complaint,
            clinicalState,
            documentFacts,
            allowedFields,
            clinicalState.unknownFields
          ),
        },
      ]);

      const parsed = parseGroqInterviewResponse(rawResponse);
      if (!parsed) throw new Error("Groq response failed validation");

      _status = "GROQ";

      // Merge extracted fields into ClinicalState
      const updatedState = this.mergeExtractionIntoClinicalState(
        clinicalState,
        parsed.extracted,
        patientAnswer,
        parsed.possibleContradictions
      );

      // Handle "I don't know" type answers
      const isUnknown = /don't know|not sure|can't remember|haven't noticed|no idea/i.test(patientAnswer);
      if (isUnknown && plannerResult.question?.targetField) {
        const field = plannerResult.question.targetField;
        if (!updatedState.unknownFields.includes(field)) {
          updatedState.unknownFields = [...updatedState.unknownFields, field];
        }
      }

      // Update completeness
      const newPlannerResult = this.planner.getNextQuestion(updatedState, parsed.nextQuestionSuggestion.field);
      updatedState.completeness = newPlannerResult.completeness;

      return {
        updatedState,
        nextQuestion: newPlannerResult.question,
        providerStatus: "GROQ",
      };
    } catch (err) {
      console.warn("[GroqAiInterviewService] Groq failed, falling back to local:", err);
      _status = "GROQ_FALLBACK";

      const fallbackResult = await this.fallback.processAnswer(
        patientAnswer,
        currentQuestion,
        clinicalState,
        { targetField: plannerResult.question?.targetField }
      );
      return {
        updatedState: fallbackResult.updatedState,
        nextQuestion: fallbackResult.nextQuestion,
        providerStatus: "GROQ_FALLBACK",
      };
    }
  }

  /**
   * Extract structured facts from OCR text using Groq.
   */
  async extractDocumentFacts(ocrText: string): Promise<Array<{ field: string; value: string; confidence: number }>> {
    try {
      const rawResponse = await callGroqProxy([
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildDocumentExtractionPrompt(ocrText) },
      ]);

      const parsed = parseGroqDocumentExtraction(rawResponse);
      if (!parsed) throw new Error("Document extraction failed validation");

      _status = "GROQ";
      return parsed.facts;
    } catch (err) {
      console.warn("[GroqAiInterviewService] Document extraction via Groq failed:", err);
      _status = "GROQ_FALLBACK";
      return this.localDocumentExtraction(ocrText);
    }
  }

  /**
   * Local fallback for document extraction — simple regex heuristics.
   */
  private localDocumentExtraction(ocrText: string): Array<{ field: string; value: string; confidence: number }> {
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

  async generateSummary(history: ClinicalHistory, ayush: AyushAssessment): Promise<CaseSummary> {
    return this.fallback.generateSummary(history, ayush);
  }

  async detectMissingInformation(history: ClinicalHistory): Promise<string[]> {
    return this.fallback.detectMissingInformation(history);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private historyToClinicalState(history: ClinicalHistory, complaint: string): ClinicalState {
    return {
      chiefComplaint: complaint || history.chiefComplaint,
      site: history.site,
      onset: history.onset,
      duration: undefined,
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
      ayush: {
        prakriti: "",
        vikriti: "",
        sara: "",
        samhanana: "",
        pramana: "",
        satmya: "",
        satva: "",
        aharaShakti: "",
        vyayamaShakti: "",
        vaya: "",
      },
      aharaVihara: {
        diet: "",
        sleep: "",
        bowelHabits: "",
        dailyRoutine: "",
        substances: "",
      },
      ayushUnknownFields: [],
      ayushComplete: false,
      ayushPhysicianVerified: false,
      patientFacts: [],
      documentFacts: [],
      verifiedFacts: [],
      unknownFields: [],
      contradictions: [],
      documentReferences: [],
      completeness: 0,
    };
  }

  private mergeExtractionIntoClinicalState(
    state: ClinicalState,
    extracted: Record<string, unknown>,
    patientAnswer: string,
    contradictions: Array<{ field: string; existingValue: string; newValue: string; message: string }>
  ): ClinicalState {
    const updated = { ...state };
    const now = new Date().toISOString();

    const simpleFields = ["chiefComplaint", "site", "onset", "duration", "character", "radiation", "timing", "aggravatingFactors", "relievingFactors", "familyHistory", "personalHistory"] as const;

    for (const field of simpleFields) {
      const val = extracted[field];
      if (val !== null && val !== undefined && typeof val === "string" && val.trim()) {
        (updated as Record<string, unknown>)[field] = val;
        updated.patientFacts = [
          ...updated.patientFacts,
          { field, value: val, source: "PATIENT" as const, confidence: 0.9, verified: false, timestamp: now },
        ];
      }
    }

    const sev = extracted.severity;
    if (sev !== null && typeof sev === "number") {
      updated.severity = sev;
      updated.patientFacts = [
        ...updated.patientFacts,
        { field: "severity", value: String(sev), source: "PATIENT" as const, confidence: 0.95, verified: false, timestamp: now },
      ];
    }

    const arrayFields = ["associatedSymptoms", "pastMedicalHistory", "medications", "allergies"] as const;
    for (const field of arrayFields) {
      const arr = extracted[field];
      if (Array.isArray(arr) && arr.length > 0) {
        (updated as Record<string, unknown>)[field] = [
          ...(((updated as Record<string, unknown>)[field] as string[]) ?? []),
          ...arr.filter((v): v is string => typeof v === "string"),
        ];
      }
    }

    // Merge contradictions
    for (const c of contradictions) {
      updated.contradictions = [
        ...updated.contradictions,
        {
          field: c.field,
          sourceA: "DOCUMENT" as const,
          valueA: c.existingValue,
          sourceB: "PATIENT" as const,
          valueB: c.newValue,
          message: c.message,
        },
      ];
    }

    return updated;
  }
}
