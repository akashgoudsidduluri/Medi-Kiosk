import { TtsService } from "./TtsService";

export class MockTtsService implements TtsService {
  private timer: NodeJS.Timeout | null = null;
  private resolveFn: (() => void) | null = null;

  isSupported(): boolean {
    return true; // Mock is always supported
  }

  speak(text: string, language: string): Promise<void> {
    this.stop();
    
    return new Promise((resolve) => {
      this.resolveFn = resolve;
      
      // Simulate reading time based on text length, max 3 seconds for demo
      const readingTime = Math.min(text.length * 50, 3000);
      
      this.timer = setTimeout(() => {
        if (this.resolveFn) {
          this.resolveFn();
          this.resolveFn = null;
        }
      }, readingTime);
    });
  }

  stop(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.resolveFn) {
      this.resolveFn();
      this.resolveFn = null;
    }
  }
}
