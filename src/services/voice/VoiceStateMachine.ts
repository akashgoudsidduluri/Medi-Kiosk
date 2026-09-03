/**
 * Voice State Machine for continuous voice conversation flow.
 * 
 * Prevents TTS and ASR from running simultaneously.
 * Manages the flow: QUESTION_READY → SPEAKING → LISTENING → PROCESSING → QUESTION_READY
 */

export type VoiceState = 
  | "IDLE"           // Not active, no voice mode
  | "QUESTION_READY" // Next question available, ready to speak
  | "SPEAKING"       // TTS is currently speaking
  | "LISTENING"      // ASR is listening for patient response
  | "PROCESSING"     // Processing patient answer through clinical engine
  | "ERROR"          // Error state
  | "COMPLETED";     // Interview completed

export interface VoiceStateTransition {
  from: VoiceState;
  to: VoiceState;
  trigger: string;
}

export class VoiceStateMachine {
  private currentState: VoiceState = "IDLE";
  private listeners: Set<(state: VoiceState, prevState: VoiceState) => void> = new Set();

  constructor(initialState: VoiceState = "IDLE") {
    this.currentState = initialState;
  }

  /**
   * Get the current state.
   */
  getState(): VoiceState {
    return this.currentState;
  }

  /**
   * Transition to a new state if valid.
   * Returns true if transition was successful, false if invalid.
   */
  transitionTo(newState: VoiceState): boolean {
    if (!this.isValidTransition(this.currentState, newState)) {
      console.warn(
        `Invalid transition: ${this.currentState} → ${newState}. Ignoring.`
      );
      return false;
    }

    const prevState = this.currentState;
    this.currentState = newState;

    // Notify all listeners
    this.listeners.forEach((listener) => listener(newState, prevState));
    return true;
  }

  /**
   * Listen for state changes.
   */
  onChange(listener: (state: VoiceState, prevState: VoiceState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Check if a transition is valid.
   * This is the core of the state machine logic.
   */
  private isValidTransition(from: VoiceState, to: VoiceState): boolean {
    if (from === to) return true; // Stay in same state is always valid

    const validTransitions: Record<VoiceState, VoiceState[]> = {
      IDLE: ["QUESTION_READY", "LISTENING", "SPEAKING", "PROCESSING", "COMPLETED", "IDLE"],
      QUESTION_READY: ["SPEAKING", "IDLE", "ERROR", "COMPLETED"],
      SPEAKING: ["LISTENING", "IDLE", "ERROR"],
      LISTENING: ["PROCESSING", "IDLE", "ERROR", "QUESTION_READY"], // QUESTION_READY allows no-speech retry without entering PROCESSING
      PROCESSING: ["QUESTION_READY", "IDLE", "ERROR", "COMPLETED"],
      ERROR: ["QUESTION_READY", "IDLE", "LISTENING"],
      COMPLETED: ["IDLE"],
    };

    return validTransitions[from]?.includes(to) ?? false;
  }

  /**
   * Reset to IDLE state.
   */
  reset(): void {
    this.transitionTo("IDLE");
  }

  /**
   * Check if currently speaking (TTS active).
   */
  isSpeaking(): boolean {
    return this.currentState === "SPEAKING";
  }

  /**
   * Check if currently listening (ASR active).
   */
  isListening(): boolean {
    return this.currentState === "LISTENING";
  }

  /**
   * Check if currently processing.
   */
  isProcessing(): boolean {
    return this.currentState === "PROCESSING";
  }

  /**
   * Check if in error state.
   */
  isError(): boolean {
    return this.currentState === "ERROR";
  }

  /**
   * Check if completed.
   */
  isCompleted(): boolean {
    return this.currentState === "COMPLETED";
  }

  /**
   * Check if idle (not active).
   */
  isIdle(): boolean {
    return this.currentState === "IDLE";
  }
}
