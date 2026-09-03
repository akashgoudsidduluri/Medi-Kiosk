export interface TranscriptionResult {
  text: string;
  isFinal: boolean;
  languageCode: string;
  /**
   * ASR error signal (e.g. "no-speech", "not-allowed", "network").
   * The controller uses this to distinguish recoverable errors from fatal ones.
   * Absent when the result is a valid transcript.
   */
  error?: "no-speech" | "not-allowed" | "network" | "aborted" | "unknown";
}

export interface AsrService {
  /**
   * Starts listening for audio input and returns transcribed text.
   * Calls the onResult callback as partial results come in.
   */
  startListening(language: string, onResult: (result: TranscriptionResult) => void): void;
  
  /**
   * Stops listening.
   */
  stopListening(): void;
  
  /**
   * Returns true if the service is currently supported in this environment.
   */
  isSupported(): boolean;
}
