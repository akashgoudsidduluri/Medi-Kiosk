import { AppMode } from "@/types";
import { AiInterviewService } from "./ai/AiInterviewService";
import { LocalAiInterviewService } from "./ai/LocalAiInterviewService";
import { LlmAiInterviewService } from "./ai/LlmAiInterviewService";
import { CaseSheetService } from "./casesheet/CaseSheetService";
import { LocalCaseSheetService } from "./casesheet/LocalCaseSheetService";
import { AsrService } from "./asr/AsrService";
import { BrowserAsrService } from "./asr/BrowserAsrService";
import { MockAsrService } from "./asr/MockAsrService";
import { TtsService } from "./tts/TtsService";
import { BrowserTtsService } from "./tts/BrowserTtsService";
import { MockTtsService } from "./tts/MockTtsService";
import { OcrService } from "./ocr/OcrService";
import { TesseractOcrService } from "./ocr/TesseractOcrService";
import { MockOcrService } from "./ocr/MockOcrService";
import { TriageService } from "./triage/TriageService";
import { LocalTriageService } from "./triage/LocalTriageService";
import { FhirService } from "./fhir/FhirService";
import { LocalFhirService } from "./fhir/LocalFhirService";
import { AbdmService } from "./abdm/AbdmService";
import { MockAbdmService } from "./abdm/MockAbdmService";
// Helper to safely get the app mode, defaulting to 'demo' if not set
export const getAppMode = (): AppMode => {
  const mode = import.meta.env.VITE_APP_MODE;
  if (mode === "hybrid" || mode === "production") {
    return mode as AppMode;
  }
  return "demo";
};

// --- AI Service Resolver ---
let aiServiceInstance: AiInterviewService | null = null;

export const getAiService = (): AiInterviewService => {
  if (aiServiceInstance) return aiServiceInstance;

  const mode = getAppMode();
  if (mode === "production") {
    // Attempt to use LLM if configured, else fallback
    if (import.meta.env.VITE_LLM_API_KEY) {
      aiServiceInstance = new LlmAiInterviewService();
      return aiServiceInstance;
    }
  }
  
  // For 'demo' and 'hybrid' (without keys), use local deterministic AI
  aiServiceInstance = new LocalAiInterviewService();
  return aiServiceInstance;
};

// --- Case Sheet Service Resolver ---
let caseSheetServiceInstance: CaseSheetService | null = null;

export const getCaseSheetService = (): CaseSheetService => {
  if (caseSheetServiceInstance) return caseSheetServiceInstance;
  
  caseSheetServiceInstance = new LocalCaseSheetService();
  return caseSheetServiceInstance;
};

// --- ASR Service Resolver ---
let asrServiceInstance: AsrService | null = null;

export const getAsrService = (): AsrService => {
  if (asrServiceInstance) return asrServiceInstance;

  const mode = getAppMode();
  if (mode === "hybrid" || mode === "production") {
    const browserAsr = new BrowserAsrService();
    if (browserAsr.isSupported()) {
      asrServiceInstance = browserAsr;
      return asrServiceInstance;
    }
  }
  
  // Fallback to mock for demo or unsupported environments
  asrServiceInstance = new MockAsrService();
  return asrServiceInstance;
};

// --- TTS Service Resolver ---
let ttsServiceInstance: TtsService | null = null;

export const getTtsService = (): TtsService => {
  if (ttsServiceInstance) return ttsServiceInstance;

  const mode = getAppMode();
  if (mode === "hybrid" || mode === "production") {
    const browserTts = new BrowserTtsService();
    if (browserTts.isSupported()) {
      ttsServiceInstance = browserTts;
      return ttsServiceInstance;
    }
  }
  
  // Fallback to mock
  ttsServiceInstance = new MockTtsService();
  return ttsServiceInstance;
};

// --- OCR Service Resolver ---
let ocrServiceInstance: OcrService | null = null;

export const getOcrService = (): OcrService => {
  if (ocrServiceInstance) return ocrServiceInstance;

  const mode = getAppMode();
  if (mode === "hybrid" || mode === "production") {
    const tesseractOcr = new TesseractOcrService();
    if (tesseractOcr.isSupported()) {
      ocrServiceInstance = tesseractOcr;
      return ocrServiceInstance;
    }
  }
  
  // Fallback to mock
  ocrServiceInstance = new MockOcrService();
  return ocrServiceInstance;
};

// --- Triage Service Resolver ---
let triageServiceInstance: TriageService | null = null;

export const getTriageService = (): TriageService => {
  if (triageServiceInstance) return triageServiceInstance;
  triageServiceInstance = new LocalTriageService();
  return triageServiceInstance;
};

// --- FHIR Service Resolver ---
let fhirServiceInstance: FhirService | null = null;

export const getFhirService = (): FhirService => {
  if (fhirServiceInstance) return fhirServiceInstance;
  fhirServiceInstance = new LocalFhirService();
  return fhirServiceInstance;
};

// --- ABDM Service Resolver ---
let abdmServiceInstance: AbdmService | null = null;

export const getAbdmService = (): AbdmService => {
  if (abdmServiceInstance) return abdmServiceInstance;
  abdmServiceInstance = new MockAbdmService();
  return abdmServiceInstance;
};
