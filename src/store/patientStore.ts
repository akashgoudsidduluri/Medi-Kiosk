import { create } from "zustand";
import { persist } from "zustand/middleware";
import { 
  SOCRATESResponse, 
  AYUSHAssessment, 
  DocumentExtraction, 
  TimelineEvent, 
  TriageResult, 
  DoctorVerification,
  OcrResult,
  CaseSheetData
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

  // Interview
  chiefComplaint: string;
  socrates: SOCRATESResponse;
  interviewComplete: boolean;

  // AYUSH
  ayush: AYUSHAssessment;
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

  // Auth state
  isAuthenticated: boolean;
  isDoctor: boolean;
  currentStep: string;
  consentGiven: boolean;
  inputMode: "voice" | "touch" | null;

  // Actions
  setPatient: (data: Partial<PatientState>) => void;
  setChiefComplaint: (complaint: string) => void;
  setSOCRATES: (data: Partial<SOCRATESResponse>) => void;
  setAYUSH: (data: Partial<AYUSHAssessment>) => void;
  addDocument: (doc: DocumentExtraction) => void;
  setOcrResults: (results: OcrResult) => void;
  setTriage: (triage: TriageResult) => void;
  setCaseSheet: (data: CaseSheetData) => void;
  setVerification: (verification: DoctorVerification) => void;
  setConsent: (consent: boolean) => void;
  setLanguage: (lang: string) => void;
  setInputMode: (mode: "voice" | "touch") => void;
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
      isDoctor: false,
      currentStep: "landing",
      consentGiven: false,
      inputMode: null,

      // Actions
      setPatient: (data) => set((state) => ({ ...state, ...data })),
      setChiefComplaint: (complaint) => set({ chiefComplaint: complaint }),
      setSOCRATES: (data: Partial<SOCRATESResponse>) =>
        set((state) => ({ socrates: { ...state.socrates, ...data } as SOCRATESResponse })),
      setAYUSH: (data: Partial<AYUSHAssessment>) =>
        set((state) => ({ ayush: { ...state.ayush, ...data } as AYUSHAssessment })),
      addDocument: (doc) =>
        set((state) => ({ documents: [...state.documents, doc] })),
      setOcrResults: (results) => set({ ocrResults: results }),
      setTriage: (triage) => set({ triage }),
      setCaseSheet: (data) => set({ caseSheet: data }),
      setVerification: (verification) => set({ verification }),
      setConsent: (consent) => set({ consentGiven: consent }),
      setLanguage: (lang) => set({ language: lang }),
      setInputMode: (mode) => set({ inputMode: mode }),
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
          ocrResults: null,
          timeline: [],
          triage: null,
          caseSheet: null,
          verification: { status: "pending" },
          isAuthenticated: false,
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
