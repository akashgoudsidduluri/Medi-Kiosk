import { TtsService } from "./TtsService";

export class BrowserTtsService implements TtsService {
  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  speak(text: string, language: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isSupported()) {
        resolve();
        return;
      }

      this.stop(); // Stop any currently playing speech

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Basic language mapping for TTS
      const langMap: Record<string, string> = {
        "English": "en-IN",
        "Hindi": "hi-IN",
        // Fallbacks for missing local voices
        "Telugu": "te-IN",
        "Tamil": "ta-IN",
      };

      utterance.lang = langMap[language] || "en-IN";
      
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve(); // Resolve even on error to not block UI

      window.speechSynthesis.speak(utterance);
    });
  }

  stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  }
}
