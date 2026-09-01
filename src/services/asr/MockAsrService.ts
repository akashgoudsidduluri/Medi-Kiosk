import { AsrService, TranscriptionResult } from "./AsrService";

export class MockAsrService implements AsrService {
  private timer: NodeJS.Timeout | null = null;

  isSupported(): boolean {
    return true; // Mock is always supported
  }

  startListening(language: string, onResult: (result: TranscriptionResult) => void): void {
    // Simulate someone speaking after a brief delay
    this.timer = setTimeout(() => {
      onResult({
        text: "This is a simulated voice response for demo purposes.",
        isFinal: true,
        languageCode: language,
      });
    }, 2500);
  }

  stopListening(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
