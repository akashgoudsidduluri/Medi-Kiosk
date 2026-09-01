export type AppMode = "demo" | "hybrid" | "production";

export interface Patient {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  abhaId?: string;
  mobileNumber?: string;
}

export interface ClinicalHistory {
  chiefComplaint: string;
  site?: string;
  onset?: string;
  character?: string;
  radiation?: string;
  associatedSymptoms?: string;
  timing?: string;
  exacerbatingFactors?: string;
  relievingFactors?: string;
  severity?: string;
  [key: string]: string | undefined;
}

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

export interface TriageResult {
  priority: "urgent" | "priority" | "routine" | "";
  reasons: string[];
  confidence: number;
  timestamp: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: "encounter" | "lab" | "medication" | "observation";
}

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
  [key: string]: unknown;
}

export interface OcrResult {
  text: string;
  confidence: number;
  entities: Record<string, any>;
}

export interface CaseSheetData {
  summary?: string;
  clinicalAlerts?: string[];
  missingInfo?: string[];
  generatedAt?: string;
}

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

export interface FHIRBundle {
  resourceType: "Bundle";
  type: string;
  entry: any[];
}

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

export interface InterviewQuestion {
  question: string;
  targetField: keyof ClinicalHistory;
  options?: string[];
}

export interface CaseSummary {
  summary: string;
  redFlags: string[];
}
