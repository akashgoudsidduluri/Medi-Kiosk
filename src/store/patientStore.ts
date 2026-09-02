import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  SOCRATESResponse,
  AYUSHAssessment,
  AharaVihara,
  DocumentExtraction,
  TimelineEvent,
  TriageResult,
  DoctorVerification,
  OcrResult,
  CaseSheetData,
  ClinicalState,
  ClinicalFact,
  PatientIdentity,
  AuthProvider,
  VerificationStatus,
  defaultAharaVihara,
  defaultClinicalState,
} from "@/types";

export interface PatientState {
  // Patient Info
  id: string;
  name: string;
  age: number;
  gender: string;
  language: string;
  abhaId: string;
  mobileNumber: string;

  // Legacy interview fields (kept for backward compat with existing pages)
  chiefComplaint: string;
  socrates: SOCRATESResponse;
  interviewComplete: boolean;

  // ── NEW: Centralized ClinicalState ──────────────────────────────────────
  clinicalState: ClinicalState;

  // AYUSH
  ayush: AYUSHAssessment;
  aharaVihara: AharaVihara;
  ayushComplete: boolean;

  // Documents & OCR
  documents: DocumentExtraction[];
  ocrResults: OcrResult | null;

  // Timeline
  timeline: TimelineEvent[];

  // Triage
  triage: TriageResult | null;

  // Case Sheet
  caseSheet: CaseSheetData | null;

  // Doctor
  verification: DoctorVerification;

  // Auth / flow state
  isAuthenticated: boolean;
  authenticationProvider: AuthProvider;
  verificationStatus: VerificationStatus;
  currentPatient: PatientIdentity | null;
  isDoctor: boolean;
  currentStep: string;
  consentGiven: boolean;
  inputMode: "voice" | "touch" | null;

  // ── Actions ──────────────────────────────────────────────────────────────
  setPatient: (data: Partial<PatientState>) => void;
  setChiefComplaint: (complaint: string) => void;
  setSOCRATES: (data: Partial<SOCRATESResponse>) => void;
  setAYUSH: (data: Partial<AYUSHAssessment>) => void;
  setAharaVihara: (data: Partial<AharaVihara>) => void;
  addDocument: (doc: DocumentExtraction) => void;
  setOcrResults: (results: OcrResult) => void;
  setTriage: (triage: TriageResult) => void;
  setCaseSheet: (data: CaseSheetData) => void;
  setVerification: (verification: DoctorVerification) => void;
  setConsent: (consent: boolean) => void;
  setLanguage: (lang: string) => void;
  setInputMode: (mode: "voice" | "touch") => void;
  setStep: (step: string) => void;
  setInterviewComplete: (complete: boolean) => void;

  // ── ClinicalState actions ─────────────────────────────────────────────────
  updateClinicalState: (updates: Partial<ClinicalState>) => void;
  addDocumentFact: (fact: ClinicalFact) => void;
  addPatientFact: (fact: ClinicalFact) => void;
  markFieldUnknown: (field: string) => void;
  verifyDocumentFact: (field: string, value: string) => void;
  denyDocumentFact: (field: string, value: string) => void;

  reset: () => void;
}

const defaultSOCRATES: SOCRATESResponse = {
  site: "",
  onset: "",
  character: "",
  radiation: "",
  associatedSymptoms: "",
  timing: "",
  exacerbatingFactors: "",
  relievingFactors: "",
  severity: "",
};

const defaultAYUSH: AYUSHAssessment = {
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
};

export const usePatientStore = create<PatientState>()(
  persist(
    (set) => ({
      // Patient Info
      id: "",
      name: "",
      age: 0,
      gender: "",
      language: "English",
      abhaId: "",
      mobileNumber: "",

      // Legacy interview
      chiefComplaint: "",
      socrates: defaultSOCRATES,
      interviewComplete: false,

      // ClinicalState
      clinicalState: defaultClinicalState(),

      // AYUSH
      ayush: defaultAYUSH,
      aharaVihara: defaultAharaVihara(),
      ayushComplete: false,

      // Documents & OCR
      documents: [],
      ocrResults: null,

      // Timeline
      timeline: [],

      // Triage
      triage: null,

      // Case Sheet
      caseSheet: null,

      // Doctor
      verification: { status: "pending" },

      // Auth
      isAuthenticated: false,
      authenticationProvider: "demo",
      verificationStatus: "pending",
      currentPatient: null,
      isDoctor: false,
      currentStep: "landing",
      consentGiven: false,
      inputMode: null,

      // ── Actions ────────────────────────────────────────────────────────────
      setPatient: (data) => set((state) => ({ ...state, ...data })),

      setChiefComplaint: (complaint) =>
        set((state) => ({
          chiefComplaint: complaint,
          clinicalState: { ...state.clinicalState, chiefComplaint: complaint },
        })),

      setSOCRATES: (data) =>
        set((state) => ({
          socrates: { ...state.socrates, ...data } as SOCRATESResponse,
        })),

      setAYUSH: (data) =>
        set((state) => {
          const nextAyush = { ...state.ayush, ...data } as AYUSHAssessment;
          const nextClinicalState = {
            ...state.clinicalState,
            ayush: nextAyush,
            ayushComplete: Object.values(nextAyush).every((value) => Boolean(value && String(value).trim())),
          };
          return {
            ayush: nextAyush,
            ayushComplete: nextClinicalState.ayushComplete,
            clinicalState: nextClinicalState,
          };
        }),

      setAharaVihara: (data) =>
        set((state) => {
          const nextAhara = { ...state.aharaVihara, ...data } as AharaVihara;
          const nextClinicalState = {
            ...state.clinicalState,
            aharaVihara: nextAhara,
          };
          return {
            aharaVihara: nextAhara,
            clinicalState: nextClinicalState,
          };
        }),

      addDocument: (doc) =>
        set((state) => {
          const exists = state.documents.some((item) => item.id === doc.id || item.fileName === doc.fileName);
          if (exists) return state;
          return { documents: [...state.documents, doc] };
        }),

      setOcrResults: (results) => set({ ocrResults: results }),
      setTriage: (triage) => set({ triage }),
      setCaseSheet: (data) => set({ caseSheet: data }),
      setVerification: (verification) => set({ verification }),
      setConsent: (consent) => set({ consentGiven: consent }),
      setLanguage: (lang) => set({ language: lang }),
      setInputMode: (mode) => set({ inputMode: mode }),
      setStep: (step) => set({ currentStep: step }),
      setInterviewComplete: (complete) => set({ interviewComplete: complete }),

      // ── ClinicalState actions ───────────────────────────────────────────────
      updateClinicalState: (updates) =>
        set((state) => ({
          clinicalState: { ...state.clinicalState, ...updates },
        })),

      addDocumentFact: (fact) =>
        set((state) => ({
          clinicalState: {
            ...state.clinicalState,
            documentFacts: [...state.clinicalState.documentFacts, fact],
          },
        })),

      addPatientFact: (fact) =>
        set((state) => ({
          clinicalState: {
            ...state.clinicalState,
            patientFacts: [...state.clinicalState.patientFacts, fact],
          },
        })),

      markFieldUnknown: (field) =>
        set((state) => ({
          clinicalState: {
            ...state.clinicalState,
            unknownFields: state.clinicalState.unknownFields.includes(field)
              ? state.clinicalState.unknownFields
              : [...state.clinicalState.unknownFields, field],
          },
        })),

      verifyDocumentFact: (field, value) =>
        set((state) => ({
          clinicalState: {
            ...state.clinicalState,
            documentFacts: state.clinicalState.documentFacts.map((f) =>
              f.field === field && f.value === value ? { ...f, verified: true } : f
            ),
            verifiedFacts: [
              ...state.clinicalState.verifiedFacts,
              {
                field,
                value,
                source: "PATIENT" as const,
                confidence: 1.0,
                verified: true,
                timestamp: new Date().toISOString(),
              },
            ],
          },
        })),

      denyDocumentFact: (field, value) =>
        set((state) => ({
          clinicalState: {
            ...state.clinicalState,
            // Keep doc fact but add contradiction
            contradictions: [
              ...state.clinicalState.contradictions,
              {
                field,
                sourceA: "DOCUMENT" as const,
                valueA: value,
                sourceB: "PATIENT" as const,
                valueB: "Patient denied",
                message: `Patient denied document-reported information for ${field}`,
              },
            ],
          },
        })),

      reset: () =>
        set({
          id: "",
          name: "",
          age: 0,
          gender: "",
          language: "English",
          abhaId: "",
          mobileNumber: "",
          chiefComplaint: "",
          socrates: defaultSOCRATES,
          interviewComplete: false,
          clinicalState: defaultClinicalState(),
          ayush: defaultAYUSH,
          aharaVihara: defaultAharaVihara(),
          ayushComplete: false,
          documents: [],
          ocrResults: null,
          timeline: [],
          triage: null,
          caseSheet: null,
          verification: { status: "pending" },
          isAuthenticated: false,
          authenticationProvider: "demo",
          verificationStatus: "pending",
          currentPatient: null,
          isDoctor: false,
          currentStep: "landing",
          consentGiven: false,
          inputMode: null,
        }),
    }),
    {
      name: "medikiosk-patient-store",
    }
  )
);
