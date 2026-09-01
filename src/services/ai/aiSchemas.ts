/**
 * Zod schemas for validating Groq AI responses.
 * Every response from Groq MUST pass these schemas before touching the application state.
 */
import { z } from "zod";

// ── Extracted fields from patient answer ─────────────────────────────────────
export const GroqExtractedFieldsSchema = z.object({
  chiefComplaint: z.string().nullable(),
  site: z.string().nullable(),
  onset: z.string().nullable(),
  duration: z.string().nullable(),
  character: z.string().nullable(),
  radiation: z.string().nullable(),
  severity: z.number().min(0).max(10).nullable(),
  associatedSymptoms: z.array(z.string()),
  timing: z.string().nullable(),
  aggravatingFactors: z.string().nullable(),
  relievingFactors: z.string().nullable(),
  pastMedicalHistory: z.array(z.string()),
  medications: z.array(z.string()),
  allergies: z.array(z.string()),
});

// ── Next question suggestion ──────────────────────────────────────────────────
export const GroqNextQuestionSuggestionSchema = z.object({
  field: z.string(),
  reason: z.string(),
});

// ── Contradiction ─────────────────────────────────────────────────────────────
export const GroqContradictionSchema = z.object({
  field: z.string(),
  existingValue: z.string(),
  newValue: z.string(),
  message: z.string(),
});

// ── Full interview response ───────────────────────────────────────────────────
export const GroqInterviewResponseSchema = z.object({
  extracted: GroqExtractedFieldsSchema,
  missingFields: z.array(z.string()),
  documentRelatedFindings: z.array(z.string()),
  possibleContradictions: z.array(GroqContradictionSchema),
  nextQuestionSuggestion: GroqNextQuestionSuggestionSchema,
  confidence: z.number().min(0).max(1),
});

export type ValidatedGroqResponse = z.infer<typeof GroqInterviewResponseSchema>;

// ── Document extraction response ──────────────────────────────────────────────
export const GroqDocumentFactSchema = z.object({
  field: z.string(),
  value: z.string(),
  confidence: z.number().min(0).max(1).optional().default(0.7),
});

export const GroqDocumentExtractionSchema = z.object({
  facts: z.array(GroqDocumentFactSchema),
  rawSummary: z.string().optional(),
});

export type ValidatedDocumentExtraction = z.infer<typeof GroqDocumentExtractionSchema>;

/**
 * Parse and validate a Groq interview response string.
 * Returns null if parsing fails.
 */
export function parseGroqInterviewResponse(raw: string): ValidatedGroqResponse | null {
  try {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const json = JSON.parse(cleaned);
    const result = GroqInterviewResponseSchema.safeParse(json);
    if (result.success) return result.data;
    console.warn("[Groq] Schema validation failed:", result.error.issues);
    return null;
  } catch (e) {
    console.warn("[Groq] JSON parse failed:", e);
    return null;
  }
}

/**
 * Parse and validate a Groq document extraction response string.
 * Returns null if parsing fails.
 */
export function parseGroqDocumentExtraction(raw: string): ValidatedDocumentExtraction | null {
  try {
    const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const json = JSON.parse(cleaned);
    const result = GroqDocumentExtractionSchema.safeParse(json);
    if (result.success) return result.data;
    console.warn("[Groq] Document schema validation failed:", result.error.issues);
    return null;
  } catch (e) {
    console.warn("[Groq] Document JSON parse failed:", e);
    return null;
  }
}
