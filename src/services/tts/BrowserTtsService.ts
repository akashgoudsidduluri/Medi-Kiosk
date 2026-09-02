import { TtsService } from "./TtsService";

export class BrowserTtsService implements TtsService {
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private isStopping = false;

  isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
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

  private pickVoice(languageCode: string): SpeechSynthesisVoice | undefined {
    if (!this.isSupported()) return undefined;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((voice) => voice.lang.toLowerCase() === languageCode.toLowerCase());
    if (preferred) return preferred;

    const fallbackOrder = [languageCode, "en-IN", "hi-IN", "te-IN"];
    for (const candidate of fallbackOrder) {
      const match = voices.find((voice) => voice.lang.toLowerCase().startsWith(candidate.toLowerCase().slice(0, 2)));
      if (match) return match;
    }

    return voices[0];
  }

  speak(text: string, language: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        const err = new Error("speechSynthesis is not supported in this browser.");
        console.error("[TTS] error:", err.message);
        reject(err);
        return;
      }

      const normalizedText = (text ?? "").trim();
      if (!normalizedText) {
        console.warn("[TTS] empty text requested");
        resolve();
        return;
      }

      console.log("[TTS] service: browser-synthesis");
      console.log("[TTS] text:", normalizedText);
      console.log("[TTS] language:", language);

      this.isStopping = false;
      this.stop();

      const utterance = new SpeechSynthesisUtterance(normalizedText);
      const languageCode = this.getLanguageCode(language);
      utterance.lang = languageCode;

      const selectedVoice = this.pickVoice(languageCode);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      this.activeUtterance = utterance;

      utterance.onstart = () => {
        console.log("[TTS] speak called");
        console.log("[TTS] started");
      };

      utterance.onend = () => {
        console.log("[TTS] ended");
        this.activeUtterance = null;
        if (this.isStopping) {
          this.isStopping = false;
          resolve();
          return;
        }
        resolve();
      };

      utterance.onerror = (event) => {
        const errorMessage = event.error || "Unknown speech synthesis error";
        if (errorMessage === "interrupted" || errorMessage === "canceled") {
          console.warn("[TTS] interrupted by lifecycle transition; continuing gracefully");
          this.activeUtterance = null;
          this.isStopping = false;
          resolve();
          return;
        }

        console.error("[TTS] error:", errorMessage, event);
        this.activeUtterance = null;
        reject(new Error(`TTS failed: ${errorMessage}`));
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  stop(): void {
    if (!this.isSupported()) return;

    this.isStopping = true;
    this.activeUtterance = null;
    window.speechSynthesis.cancel();
  }
}
