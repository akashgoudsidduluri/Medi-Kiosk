import { AsrService, TranscriptionResult } from "./AsrService";

/**
 * Internal ASR error type carried through TranscriptionResult.error.
 * The controller uses this to distinguish recoverable errors (no-speech)
 * from fatal ones (not-allowed, network, etc.).
 */
export type AsrErrorKind = "no-speech" | "not-allowed" | "network" | "aborted" | "unknown";

export class BrowserAsrService implements AsrService {
  private recognition: any = null;
  private isListening = false;
  private onResultCallback: ((result: TranscriptionResult) => void) | null = null;
  /** Monotonically increasing counter so onend from an old stop() cycle
   *  cannot corrupt the isListening flag of the current cycle. */
  private cycleCounter = 0;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
    }
  }

  isSupported(): boolean {
    return typeof window !== "undefined" && (!!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition);
  }

  private getLanguageCode(language?: string): string {
    const normalized = (language ?? "English").trim();
    const langMap: Record<string, string> = {
      English: "en-IN",
      Hindi: "hi-IN",
      Telugu: "te-IN",
      Tamil: "ta-IN",
      Marathi: "mr-IN",
      Kannada: "kn-IN",
      Gujarati: "gu-IN",
      Bengali: "bn-IN",
    };

    return langMap[normalized] ?? "en-IN";
  }

  private mapError(error: string | undefined): AsrErrorKind {
    switch (error) {
      case "no-speech":
        return "no-speech";
      case "not-allowed":
      case "service-not-allowed":
        return "not-allowed";
      case "network":
        return "network";
      case "aborted":
        return "aborted";
      default:
        return "unknown";
    }
  }

  startListening(language: string, onResult: (result: TranscriptionResult) => void): void {
    if (!this.recognition) {
      console.error("[ASR] available: false");
      onResult({ text: "", isFinal: false, languageCode: "en-IN", error: "not-allowed" });
      return;
    }

    const languageCode = this.getLanguageCode(language);
    console.log("[ASR] service: browser-recognition");
    console.log("[ASR] available:", true);
    console.log("[ASR] language:", languageCode);

    this.onResultCallback = onResult;

    if (this.isListening) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.warn("[ASR] stop before restart warning:", error);
      }
    }

    this.recognition.lang = languageCode;
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onstart = () => {
      this.isListening = true;
      console.log("[ASR] started");
    };

    this.recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcriptPart = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart;
        }
      }

      if (finalTranscript.trim()) {
        const transcript = finalTranscript.trim();
        console.log("[ASR] result:", transcript);
        this.onResultCallback?.({ text: transcript, isFinal: true, languageCode });
      }
    };

    this.recognition.onerror = (event: any) => {
      const errorKind = this.mapError(event?.error);
      console.error("[ASR] error:", event?.error, event?.message ?? "");

      // Report recoverable errors (especially no-speech) through the callback
      // so the controller can retry listening instead of getting stuck.
      if (errorKind === "no-speech") {
        console.warn("[ASR] no-speech detected; notifying controller for retry");
        this.onResultCallback?.({ text: "", isFinal: false, languageCode, error: "no-speech" });
      } else if (errorKind === "not-allowed" || errorKind === "network") {
        this.onResultCallback?.({ text: "", isFinal: false, languageCode, error: errorKind });
      }
    };

    const myCycle = ++this.cycleCounter;
    this.recognition.onend = () => {
      // Only update isListening if this onend belongs to the current cycle.
      // An old cycle's stop() → onend() must not reset the flag of a
      // newer cycle that has already started listening.
      if (myCycle === this.cycleCounter) {
        this.isListening = false;
        console.log("[ASR] ended");
      } else {
        console.log("[ASR] ended (stale cycle, ignoring)");
      }
    };

    try {
      console.log("[ASR] start called");
      this.recognition.start();
    } catch (error) {
      console.error("[ASR] start failed:", error);
      this.isListening = false;
    }
  }

  stopListening(): void {
    if (!this.recognition) return;

    this.onResultCallback = null;
    try {
      this.recognition.stop();
      this.isListening = false;
      console.log("[ASR] stop called");
    } catch (error) {
      console.warn("[ASR] stop warning:", error);
    }
  }
}
