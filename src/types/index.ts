export type AppMode = "demo" | "hybrid" | "production";

// ============================================================
// PATIENT
// ============================================================
export interface Patient {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  abhaId?: string;
  mobileNumber?: string;
}

// ============================================================
// PROVENANCE — every clinical fact must carry its source
// ============================================================
export type ClinicalFactSource = "PATIENT" | "DOCUMENT" | "DOCTOR" | "SYSTEM";

export interface ClinicalFact {
  field: string;
  value: string;
  source: ClinicalFactSource;
  confidence: number; // 0–1
  verified: boolean;
  timestamp?: string;
}

export interface ClinicalContradiction {
  field: string;
  sourceA: ClinicalFactSource;
  valueA: string;
  sourceB: ClinicalFactSource;
  valueB: string;
  message: string;
}

// ============================================================
// CLINICAL STATE — authoritative, centralized, provenance-aware
// ============================================================
export interface ClinicalState {
  chiefComplaint?: string;

  // SOCRATES
  site?: string;
  onset?: string;
  duration?: string;
  character?: string;
  radiation?: string;
  severity?: number | null; // numeric 0–10
  associatedSymptoms: string[];
  timing?: string;
  aggravatingFactors?: string;
  relievingFactors?: string;

  // History
  pastMedicalHistory: string[];
  medications: string[];
  allergies: string[];
  familyHistory?: string;
  personalHistory?: string;

  // Review of systems (keyed by system name)
  reviewOfSystems: Record<string, string>;

  // Provenance layers
  patientFacts: ClinicalFact[];
  documentFacts: ClinicalFact[];
  verifiedFacts: ClinicalFact[];

  // Meta
  unknownFields: string[];
  contradictions: ClinicalContradiction[];
  documentReferences: string[]; // filenames / doc IDs processed
  completeness: number; // 0–1
}

export const defaultClinicalState = (): ClinicalState => ({
  associatedSymptoms: [],
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
});

// ============================================================
// LEGACY SOCRATES (preserved for backward compat with existing store/pages)
// ============================================================
export interface SOCRATESResponse {
  site: string;
  onset: string;
  character: string;
  radiation: string;
  associatedSymptoms: string;
  timing: string;
  exacerbatingFactors: string;
  relievingFactors: string;
  severity: string;
  [key: string]: string;
}

export interface ClinicalHistory {
  chiefComplaint?: string;
  site?: string;
  onset?: string;
  duration?: string;
  character?: string;
  radiation?: string;
  associatedSymptoms?: string;
  timing?: string;
  exacerbatingFactors?: string;
  relievingFactors?: string;
  severity?: string;
  pastMedicalHistory?: string;
  medications?: string;
  allergies?: string;
  familyHistory?: string;
  personalHistory?: string;
  [key: string]: string | undefined;
}

// ============================================================
// AYUSH
// ============================================================
export interface AyushAssessment {
  prakriti?: string;
  vikriti?: string;
  sara?: string;
  samhanana?: string;
  pramana?: string;
  satmya?: string;
  satva?: string;
  aharaShakti?: string;
  vyayamaShakti?: string;
  vaya?: string;
  [key: string]: string | undefined;
}

export interface AYUSHAssessment {
  prakriti: string;
  vikriti: string;
  sara: string;
  samhanana: string;
  pramana: string;
  satmya: string;
  satva: string;
  aharaShakti: string;
  vyayamaShakti: string;
  vaya: string;
  [key: string]: string;
}

// ============================================================
// TRIAGE
// ============================================================
export interface TriageResult {
  priority: "urgent" | "priority" | "routine" | "";
  reasons: string[];
  confidence: number;
  timestamp: string;
}

// ============================================================
// TIMELINE
// ============================================================
export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: "encounter" | "lab" | "medication" | "observation";
  source?: ClinicalFactSource; // NEW: provenance for timeline events
}

// ============================================================
// DOCUMENTS & OCR
// ============================================================
export interface DocumentExtraction {
  id: string;
  filename?: string;
  fileName?: string;
  type?: string;
  fileType?: string;
  extractedData: Record<string, string>;
  confidence?: Record<string, number>;
  rawText?: string;
  timestamp?: string;
  documentFacts?: ClinicalFact[]; // NEW: structured facts from this doc
  [key: string]: unknown;
}

export interface OcrResult {
  text: string;
  confidence: number;
  entities: Record<string, unknown>;
}

// ============================================================
// CASE SHEET
// ============================================================
export interface CaseSheetData {
  summary?: string;
  clinicalAlerts?: string[];
  missingInfo?: string[];
  generatedAt?: string;
  // NEW: provenance-aware sections
  patientReported?: Record<string, string>;
  documentReported?: Record<string, string>;
  contradictions?: ClinicalContradiction[];
}

// ============================================================
// AI INTERVIEW
// ============================================================
export interface InterviewQuestion {
  question: string;
  targetField: string; // loosened from keyof ClinicalHistory
  options?: string[];
  hint?: string;      // e.g. "from your uploaded document"
}

export interface CaseSummary {
  summary: string;
  redFlags: string[];
}

// ============================================================
// AI RESPONSE TYPES (validated by Zod in aiSchemas.ts)
// ============================================================
export interface GroqExtractedFields {
  chiefComplaint: string | null;
  site: string | null;
  onset: string | null;
  duration: string | null;
  character: string | null;
  radiation: string | null;
  severity: number | null;
  associatedSymptoms: string[];
  timing: string | null;
  aggravatingFactors: string | null;
  relievingFactors: string | null;
  pastMedicalHistory: string[];
  medications: string[];
  allergies: string[];
}

export interface GroqNextQuestionSuggestion {
  field: string;
  reason: string;
}

export interface GroqContradiction {
  field: string;
  existingValue: string;
  newValue: string;
  message: string;
}

export interface GroqInterviewResponse {
  extracted: GroqExtractedFields;
  missingFields: string[];
  documentRelatedFindings: string[];
  possibleContradictions: GroqContradiction[];
  nextQuestionSuggestion: GroqNextQuestionSuggestion;
  confidence: number;
}

// ============================================================
// DOCTOR
// ============================================================
export interface DoctorVerification {
  status: "pending" | "confirmed" | "edited" | "rejected";
  overridePriority?: "routine" | "priority" | "urgent";
  overrideReason?: string;
  verifiedAt?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  available: boolean;
}

// ============================================================
// FHIR / ABDM
// ============================================================
export interface FHIRBundle {
  resourceType: "Bundle";
  type: string;
  entry: unknown[];
}

// ============================================================
// EXPLAINABILITY (triage)
// ============================================================
export interface Explainability {
  factors: Array<{
    factor: string;
    impact: "high" | "medium" | "low";
    description: string;
    detected: boolean;
  }>;
  overallConfidence: number;
  disclaimer: string;
}
