export interface TtsService {
  /**
   * Speaks the given text aloud.
   */
  speak(text: string, language: string): Promise<void>;
  
  /**
   * Stops any ongoing speech.
   */
  stop(): void;
  
  /**
   * Returns true if the service is currently supported.
   */
  isSupported(): boolean;
}
