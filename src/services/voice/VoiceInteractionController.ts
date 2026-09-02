/**
 * VoiceInteractionController
 * 
 * Orchestrates the continuous voice conversation flow:
 * Question → TTS (speak) → ASR (listen) → Processing → Next Question → ...
 * 
 * Key responsibilities:
 * - Prevent TTS and ASR from running simultaneously
 * - Manage state transitions
 * - Handle errors and recovery
 * - Cleanup resources on unmount
 */

import { VoiceStateMachine, VoiceState } from "./VoiceStateMachine";
import { AsrService, TranscriptionResult } from "../asr/AsrService";
import { TtsService } from "../tts/TtsService";
import { ClinicalState } from "@/types";

export interface VoiceInteractionConfig {
  language: string;
  onStateChange?: (state: VoiceState) => void;
  onQuestionReady?: () => void;
  onSpeakingStart?: () => void;
  onSpeakingEnd?: () => void;
  onListeningStart?: () => void;
  onListeningEnd?: () => void;
  onProcessingStart?: () => void;
  onProcessingEnd?: () => void;
  onTranscript?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onCompleted?: () => void;
}

export class VoiceInteractionController {
  private stateMachine: VoiceStateMachine;
  private asrService: AsrService;
  private ttsService: TtsService;
  private config: VoiceInteractionConfig;
  private currentQuestion: string = "";
  private isCleanedUp: boolean = false;
  private asrStopTimeout: ReturnType<typeof setTimeout> | null = null;
  private lastFinalTranscript: string = "";

  constructor(
    asrService: AsrService,
    ttsService: TtsService,
    config: VoiceInteractionConfig
  ) {
    this.asrService = asrService;
    this.ttsService = ttsService;
    this.config = config;
    this.stateMachine = new VoiceStateMachine("IDLE");

    // Listen for state changes
    this.stateMachine.onChange((newState, prevState) => {
      this.config.onStateChange?.(newState);
      this.handleStateChange(newState, prevState);
    });
  }

  /**
   * Get current voice state.
   */
  getState(): VoiceState {
    return this.stateMachine.getState();
  }

  /**
   * Check if voice is active (not IDLE).
   */
  isActive(): boolean {
    return !this.stateMachine.isIdle();
  }

  /**
   * Start voice mode with the first question.
   */
  async startVoice(firstQuestion: string): Promise<void> {
    if (!this.stateMachine.transitionTo("QUESTION_READY")) {
      this.config.onError?.("Cannot start voice mode from current state");
      return;
    }

    this.currentQuestion = firstQuestion;
    this.config.onQuestionReady?.();

    // Automatically start speaking the first question
    await this.speakQuestion();
  }

  /**
   * Handle the next question from the clinical engine.
   * Call this when the interview engine provides a next question.
   */
  async handleNextQuestion(question: string): Promise<void> {
    if (this.isCleanedUp) return;

    const currentState = this.stateMachine.getState();
    const canAdvance = currentState === "PROCESSING" || currentState === "QUESTION_READY";

    if (!canAdvance) {
      console.warn("Unexpected state for next question:", currentState);
      return;
    }

    this.currentQuestion = question;

    if (!this.stateMachine.transitionTo("QUESTION_READY")) {
      this.config.onError?.("Cannot process next question");
      return;
    }

    this.config.onQuestionReady?.();

    // Automatically start speaking the next question
    await this.speakQuestion();
  }

  /**
   * Mark interview as completed.
   */
  markCompleted(): void {
    this.stateMachine.transitionTo("COMPLETED");
    this.config.onCompleted?.();
  }

  /**
   * Private: Speak the current question using TTS.
   */
  private async speakQuestion(): Promise<void> {
    if (this.isCleanedUp) return;

    if (!this.stateMachine.transitionTo("SPEAKING")) {
      this.config.onError?.("Cannot transition to SPEAKING state");
      return;
    }

    this.config.onSpeakingStart?.();

    try {
      // Speak the question
      await this.ttsService.speak(this.currentQuestion, this.config.language);

      this.config.onSpeakingEnd?.();

      // After TTS finishes, automatically start listening
      // Add a small delay to prevent capturing tail end of TTS
      await this.delay(500);

      if (!this.isCleanedUp) {
        await this.startListening();
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "TTS failed";
      this.handleVoiceError(errorMsg);
    }
  }

  /**
   * Private: Start listening for patient response.
   */
  private async startListening(): Promise<void> {
    if (this.isCleanedUp) return;

    if (!this.stateMachine.transitionTo("LISTENING")) {
      this.config.onError?.("Cannot transition to LISTENING state");
      return;
    }

    this.config.onListeningStart?.();
    this.lastFinalTranscript = "";

    try {
      // Set a timeout to force stop listening after reasonable duration
      // Typically a patient answer should be < 30 seconds
      const ASR_TIMEOUT = 30000; // 30 seconds
      this.asrStopTimeout = setTimeout(() => {
        if (this.stateMachine.isListening()) {
          console.warn("ASR timeout, stopping listening");
          this.asrService.stopListening();
        }
      }, ASR_TIMEOUT);

      // Start ASR
      this.asrService.startListening(this.config.language, (result) => {
        this.handleAsrResult(result);
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "ASR failed";
      this.handleVoiceError(errorMsg);
    }
  }

  /**
   * Private: Handle ASR result (interim or final transcript).
   */
  private handleAsrResult(result: TranscriptionResult): void {
    if (this.isCleanedUp) return;

    // Emit transcript for UI display
    this.config.onTranscript?.(result.text, result.isFinal);

    if (result.isFinal) {
      // Clear the timeout
      if (this.asrStopTimeout) {
        clearTimeout(this.asrStopTimeout);
        this.asrStopTimeout = null;
      }

      // Don't process empty transcripts
      if (!result.text.trim()) {
        this.config.onError?.("I didn't catch that. Please try again.");
        // Return to listening
        if (!this.isCleanedUp) {
          this.resumeListening();
        }
        return;
      }

      this.lastFinalTranscript = result.text;
      this.stopListening();
    }
  }

  /**
   * Private: Stop listening and transition to processing.
   */
  private stopListening(): void {
    if (this.isCleanedUp) return;

    // Clear the timeout
    if (this.asrStopTimeout) {
      clearTimeout(this.asrStopTimeout);
      this.asrStopTimeout = null;
    }

    this.asrService.stopListening();
    this.config.onListeningEnd?.();

    if (!this.stateMachine.transitionTo("PROCESSING")) {
      this.config.onError?.("Cannot transition to PROCESSING state");
      return;
    }

    this.config.onProcessingStart?.();
  }

  /**
   * Get the final transcript captured from the last ASR result.
   * Call this after ASR has finished to get the patient's response.
   */
  getFinalTranscript(): string {
    return this.lastFinalTranscript;
  }

  /**
   * Mark processing complete and prepare for next question.
   * Call this from the interview component after processing the answer.
   */
  async markProcessingComplete(): Promise<void> {
    if (this.isCleanedUp) return;

    this.config.onProcessingEnd?.();

    if (this.stateMachine.isProcessing()) {
      this.stateMachine.transitionTo("QUESTION_READY");
    }
  }

  /**
   * Resume listening if user wants to retry or if "I didn't catch that" occurred.
   */
  private async resumeListening(): Promise<void> {
    if (this.isCleanedUp || !this.stateMachine.transitionTo("LISTENING")) {
      return;
    }

    this.config.onListeningStart?.();
    this.lastFinalTranscript = "";

    try {
      this.asrService.startListening(this.config.language, (result) => {
        this.handleAsrResult(result);
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "ASR failed";
      this.handleVoiceError(errorMsg);
    }
  }

  /**
   * Stop voice mode entirely and return to idle.
   */
  stopVoice(): void {
    if (this.stateMachine.isIdle() || this.isCleanedUp) return;

    this.ttsService.stop();
    this.asrService.stopListening();

    if (this.asrStopTimeout) {
      clearTimeout(this.asrStopTimeout);
      this.asrStopTimeout = null;
    }

    this.stateMachine.transitionTo("IDLE");
  }

  /**
   * Cleanup all resources. Call on component unmount.
   */
  cleanup(): void {
    if (this.isCleanedUp) return;

    this.isCleanedUp = true;
    this.ttsService.stop();
    this.asrService.stopListening();

    if (this.asrStopTimeout) {
      clearTimeout(this.asrStopTimeout);
      this.asrStopTimeout = null;
    }

    this.stateMachine.reset();
  }

  /**
   * Private: Handle state changes to implement logic.
   */
  private handleStateChange(newState: VoiceState, _prevState: VoiceState): void {
    // Ensure TTS stops when leaving SPEAKING
    if (newState !== "SPEAKING" && _prevState === "SPEAKING") {
      this.ttsService.stop();
    }

    // Ensure ASR stops when leaving LISTENING
    if (newState !== "LISTENING" && _prevState === "LISTENING") {
      this.asrService.stopListening();
    }
  }

  /**
   * Private: Handle voice errors.
   */
  private handleVoiceError(error: string): void {
    const normalized = error.toLowerCase();
    if (normalized.includes("interrupted") || normalized.includes("canceled") || normalized.includes("cancelled")) {
      console.warn("Voice lifecycle interrupted intentionally; continuing gracefully.");
      return;
    }

    console.error("Voice error:", error);
    this.config.onError?.(error);

    if (this.stateMachine.getState() !== "ERROR" && this.stateMachine.transitionTo("ERROR")) {
      // Optionally try to recover
      // setTimeout(() => {
      //   if (!this.isCleanedUp) {
      //     this.stateMachine.transitionTo("QUESTION_READY");
      //   }
      // }, 2000);
    }
  }

  /**
   * Private: Utility delay function.
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
