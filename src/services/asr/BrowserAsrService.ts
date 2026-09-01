import { AsrService, TranscriptionResult } from "./AsrService";

export class BrowserAsrService implements AsrService {
  private recognition: any = null;

  constructor() {
    // Attempt to access the browser's SpeechRecognition API (Chrome/Safari)
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  startListening(language: string, onResult: (result: TranscriptionResult) => void): void {
    if (!this.recognition) return;

    // Map common languages to BCP-47 tags expected by SpeechRecognition
    const langMap: Record<string, string> = {
      "English": "en-IN",
      "Hindi": "hi-IN",
      "Telugu": "te-IN",
      "Marathi": "mr-IN",
      "Tamil": "ta-IN",
      "Gujarati": "gu-IN",
      "Urdu": "ur-IN",
      "Kannada": "kn-IN",
      "Odia": "or-IN",
      "Malayalam": "ml-IN",
      "Punjabi": "pa-IN",
    };

    this.recognition.lang = langMap[language] || "en-IN";

    this.recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        onResult({ text: finalTranscript, isFinal: true, languageCode: this.recognition.lang });
      } else if (interimTranscript) {
        onResult({ text: interimTranscript, isFinal: false, languageCode: this.recognition.lang });
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.error("Error starting speech recognition", e);
    }
  }

  stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore if already stopped
      }
    }
  }
}
