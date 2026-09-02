import { AsrService, TranscriptionResult } from "./AsrService";

export class BrowserAsrService implements AsrService {
  private recognition: any = null;
  private isListening = false;

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

  startListening(language: string, onResult: (result: TranscriptionResult) => void): void {
    if (!this.recognition) {
      console.error("[ASR] available: false");
      return;
    }

    const languageCode = this.getLanguageCode(language);
    console.log("[ASR] service: browser-recognition");
    console.log("[ASR] available:", true);
    console.log("[ASR] language:", languageCode);

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
        onResult({ text: transcript, isFinal: true, languageCode });
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      console.error("[ASR] error:", event?.error, event?.message ?? "");
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log("[ASR] ended");
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

    try {
      this.recognition.stop();
      this.isListening = false;
      console.log("[ASR] stop called");
    } catch (error) {
      console.warn("[ASR] stop warning:", error);
    }
  }
}
