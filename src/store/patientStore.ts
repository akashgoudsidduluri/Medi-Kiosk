import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SOCRATESResponse {
  [key: string]: string;
  site: string;
  onset: string;
  character: string;
  radiation: string;
  associatedSymptoms: string;
  timing: string;
  exacerbatingFactors: string;
  relievingFactors: string;
  severity: string;
}

export interface AYUSHAssessment {
  [key: string]: string;
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
}

export interface DocumentExtraction {
  id: string;
  fileName: string;
  fileType: string;
  extractedData: {
    date?: string;
    medication?: string;
    observation?: string;
    diagnosis?: string;
    notes?: string;
  };
  confidence: {
    date?: number;
    medication?: number;
    observation?: number;
  };
  [key: string]: unknown;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: "consultation" | "medication" | "investigation" | "assessment";
}

export interface TriageResult {
  priority: "routine" | "priority" | "urgent";
  reasons: string[];
  confidence: number;
  timestamp?: string;
}

export interface DoctorVerification {
  status: "pending" | "confirmed" | "edited" | "rejected";
  overridePriority?: "routine" | "priority" | "urgent";
  overrideReason?: string;
  verifiedAt?: string;
}

export interface PatientState {
  // Patient Info
  id: string;
  name: string;
  age: number;
  gender: string;
  language: string;
  abhaId: string;
  mobileNumber: string;

  // Interview
  chiefComplaint: string;
  socrates: SOCRATESResponse;
  interviewComplete: boolean;

  // AYUSH
  ayush: AYUSHAssessment;
  ayushComplete: boolean;

  // Documents
  documents: DocumentExtraction[];

  // Timeline
  timeline: TimelineEvent[];

  // Triage
  triage: TriageResult | null;

  // Doctor
  verification: DoctorVerification;

  // Auth state
  isAuthenticated: boolean;
  isDoctor: boolean;
  currentStep: string;
  consentGiven: boolean;

  // Actions
  setPatient: (data: Partial<PatientState>) => void;
  setChiefComplaint: (complaint: string) => void;
  setSOCRATES: (data: Partial<SOCRATESResponse>) => void;
  setAYUSH: (data: Partial<AYUSHAssessment>) => void;
  addDocument: (doc: DocumentExtraction) => void;
  setTriage: (triage: TriageResult) => void;
  setVerification: (verification: DoctorVerification) => void;
  setConsent: (consent: boolean) => void;
  setLanguage: (lang: string) => void;
  setStep: (step: string) => void;
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

      // Interview
      chiefComplaint: "",
      socrates: defaultSOCRATES,
      interviewComplete: false,

      // AYUSH
      ayush: defaultAYUSH,
      ayushComplete: false,

      // Documents
      documents: [],

      // Timeline
      timeline: [],

      // Triage
      triage: null,

      // Doctor
      verification: { status: "pending" },

      // Auth
      isAuthenticated: false,
      isDoctor: false,
      currentStep: "landing",
      consentGiven: false,

      // Actions
      setPatient: (data) => set((state) => ({ ...state, ...data })),
      setChiefComplaint: (complaint) => set({ chiefComplaint: complaint }),
      setSOCRATES: (data: Partial<SOCRATESResponse>) =>
        set((state) => ({ socrates: { ...state.socrates, ...data } as SOCRATESResponse })),
      setAYUSH: (data: Partial<AYUSHAssessment>) =>
        set((state) => ({ ayush: { ...state.ayush, ...data } as AYUSHAssessment })),
      addDocument: (doc) =>
        set((state) => ({ documents: [...state.documents, doc] })),
      setTriage: (triage) => set({ triage }),
      setVerification: (verification) => set({ verification }),
      setConsent: (consent) => set({ consentGiven: consent }),
      setLanguage: (lang) => set({ language: lang }),
      setStep: (step) => set({ currentStep: step }),
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
          ayush: defaultAYUSH,
          ayushComplete: false,
          documents: [],
          timeline: [],
          triage: null,
          verification: { status: "pending" },
          isAuthenticated: false,
          isDoctor: false,
          currentStep: "landing",
          consentGiven: false,
        }),
    }),
    {
      name: "medikiosk-patient-store",
    }
  )
);
