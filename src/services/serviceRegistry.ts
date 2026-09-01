import { AppMode } from "@/types";
import { AiInterviewService } from "./ai/AiInterviewService";
import { LocalAiInterviewService } from "./ai/LocalAiInterviewService";
import { GroqAiInterviewService } from "./ai/GroqAiInterviewService";
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

// NOTE: VITE_APP_MODE is safe to expose — it is NOT a secret.
// It only controls which service implementation is used.
export const getAppMode = (): AppMode => {
  const mode = (import.meta.env.APP_MODE ?? import.meta.env.VITE_APP_MODE ?? "demo") as string;
  if (mode === "hybrid" || mode === "production") return mode as AppMode;
  return "demo";
};

// --- AI Service Resolver ---
// hybrid/production → GroqAiInterviewService (with local fallback built-in)
// demo → LocalAiInterviewService (no external calls)
let aiServiceInstance: AiInterviewService | null = null;

export const getAiService = (): AiInterviewService => {
  if (aiServiceInstance) return aiServiceInstance;

  const mode = getAppMode();
  if (mode === "hybrid" || mode === "production") {
    // GroqAiInterviewService handles its own fallback to Local if Groq is unavailable
    aiServiceInstance = new GroqAiInterviewService();
    return aiServiceInstance;
  }

  // demo — deterministic, no external calls
  aiServiceInstance = new LocalAiInterviewService();
  return aiServiceInstance;
};

// Reset singleton (useful for testing / mode switching)
export const resetAiService = () => {
  aiServiceInstance = null;
};

// --- Case Sheet Service ---
let caseSheetServiceInstance: CaseSheetService | null = null;
export const getCaseSheetService = (): CaseSheetService => {
  if (caseSheetServiceInstance) return caseSheetServiceInstance;
  caseSheetServiceInstance = new LocalCaseSheetService();
  return caseSheetServiceInstance;
};

// --- ASR Service ---
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

  asrServiceInstance = new MockAsrService();
  return asrServiceInstance;
};

// --- TTS Service ---
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

  ttsServiceInstance = new MockTtsService();
  return ttsServiceInstance;
};

// --- OCR Service ---
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

  ocrServiceInstance = new MockOcrService();
  return ocrServiceInstance;
};

// --- Triage Service ---
let triageServiceInstance: TriageService | null = null;
export const getTriageService = (): TriageService => {
  if (triageServiceInstance) return triageServiceInstance;
  triageServiceInstance = new LocalTriageService();
  return triageServiceInstance;
};

// --- FHIR Service ---
let fhirServiceInstance: FhirService | null = null;
export const getFhirService = (): FhirService => {
  if (fhirServiceInstance) return fhirServiceInstance;
  fhirServiceInstance = new LocalFhirService();
  return fhirServiceInstance;
};

// --- ABDM Service ---
let abdmServiceInstance: AbdmService | null = null;
export const getAbdmService = (): AbdmService => {
  if (abdmServiceInstance) return abdmServiceInstance;
  abdmServiceInstance = new MockAbdmService();
  return abdmServiceInstance;
};
