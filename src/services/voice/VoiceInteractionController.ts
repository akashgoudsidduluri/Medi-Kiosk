/**
 * VoiceInteractionController
 *
 * Orchestrates the continuous voice conversation flow:
 * Question → TTS (speak) → ASR (listen) → Processing → Next Question → ...
 *
 * Key fixes for React StrictMode:
 * - Each controller instance has a unique sessionId.
 * - Cleanup() marks itself as stale; cleanupSession(id) only cleans up
 *   if the session still owns the active resources.
 * - A stale cleanup can never stop the active session's TTS or ASR.
 */

import { VoiceStateMachine, VoiceState } from "./VoiceStateMachine";
import { AsrService, TranscriptionResult } from "../asr/AsrService";
import { TtsService } from "../tts/TtsService";
import { ClinicalState } from "@/types";

/** Monotonically increasing controller counter for session identity. */
let controllerCounter = 0;

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
  /** Unique per-instance id used for session ownership checks. */
  readonly sessionId: number;

  private stateMachine: VoiceStateMachine;
  private asrService: AsrService;
  private ttsService: TtsService;
  private config: VoiceInteractionConfig;
  private currentQuestion: string = "";

  /** When true, this session has been superseded and must not touch ASR/TTS. */
  private isStale: boolean = false;

  private asrStopTimeout: ReturnType<typeof setTimeout> | null = null;
  private noSpeechRetryCount: number = 0;
  private readonly MAX_NO_SPEECH_RETRIES = 3;
  private readonly NO_SPEECH_RETRY_DELAY_MS = 1500;

  constructor(
    asrService: AsrService,
    ttsService: TtsService,
    config: VoiceInteractionConfig,
  ) {
    this.sessionId = ++controllerCounter;
    this.asrService = asrService;
    this.ttsService = ttsService;
    this.config = config;
    this.stateMachine = new VoiceStateMachine("IDLE");

    this.stateMachine.onChange((newState, prevState) => {
      this.config.onStateChange?.(newState);
      this.handleStateChange(newState, prevState);
    });
  }

  getState(): VoiceState {
    return this.stateMachine.getState();
  }

  isActive(): boolean {
    return !this.stateMachine.isIdle();
  }

  // ── Public API ──────────────────────────────────────────────────────────

  async startVoice(firstQuestion: string): Promise<void> {
    if (this.isStale) return;

    if (!this.stateMachine.transitionTo("QUESTION_READY")) {
      this.config.onError?.("Cannot start voice mode from current state");
      return;
    }

    this.currentQuestion = firstQuestion;
    this.config.onQuestionReady?.();
    await this.speakQuestion();
  }

  async handleNextQuestion(question: string): Promise<void> {
    if (this.isStale) {
      console.warn(`[VOICE CTRL] handleNextQuestion: stale, ignoring`);
      return;
    }

    const currentState = this.stateMachine.getState();
    const canAdvance =
      currentState === "PROCESSING" || currentState === "QUESTION_READY";

    if (!canAdvance) {
      console.warn(
        `[VOICE CTRL] handleNextQuestion called in unexpected state: ${currentState}; ignoring.`,
      );
      return;
    }

    console.log(`[VOICE CTRL] handleNextQuestion: state=${currentState} → QUESTION_READY`, { question: question.substring(0, 60) });
    this.currentQuestion = question;
    this.noSpeechRetryCount = 0;

    if (!this.stateMachine.transitionTo("QUESTION_READY")) {
      this.config.onError?.("Cannot process next question");
      return;
    }

    this.config.onQuestionReady?.();
    console.log(`[VOICE CTRL] handleNextQuestion: calling speakQuestion`);
    await this.speakQuestion();
  }

  markCompleted(): void {
    if (this.isStale) return;
    this.stateMachine.transitionTo("COMPLETED");
    this.config.onCompleted?.();
  }

  async markProcessingComplete(): Promise<void> {
    if (this.isStale) return;
    this.config.onProcessingEnd?.();
    if (this.stateMachine.isProcessing()) {
      this.stateMachine.transitionTo("QUESTION_READY");
    }
  }

  getFinalTranscript(): string {
    return "";
  }

  stopVoice(): void {
    if (this.stateMachine.isIdle()) return;
    this.isStale = true;
    this.clearAsrTimeout();
    this.ttsService.stop();
    this.asrService.stopListening();
    this.stateMachine.transitionTo("IDLE");
  }

  /**
   * Legacy cleanup — marks this session stale and stops resources.
   * Prefer cleanupSession(sessionId) from the component for StrictMode safety.
   */
  cleanup(): void {
    if (this.isStale) return;
    this.isStale = true;
    this.clearAsrTimeout();
    this.ttsService.stop();
    this.asrService.stopListening();
    this.stateMachine.reset();
  }

  /**
   * Only clean up if the caller's sessionId still matches this instance.
   * If a newer session has been created (StrictMode remount), the old
   * session's cleanup is safely ignored.
   */
  cleanupSession(callerSessionId: number): void {
    if (this.sessionId !== callerSessionId) {
      console.warn(
        `[VOICE] stale session ignored: ${this.sessionId} (caller owns ${callerSessionId})`,
      );
      return;
    }
    this.cleanup();
  }

  // ── Private: TTS ────────────────────────────────────────────────────────

  private async speakQuestion(): Promise<void> {
    if (this.isStale) {
      console.warn(`[VOICE CTRL] speakQuestion: stale, returning`);
      return;
    }

    if (!this.stateMachine.transitionTo("SPEAKING")) {
      console.error(`[VOICE CTRL] speakQuestion: cannot transition to SPEAKING from ${this.stateMachine.getState()}`);
      this.config.onError?.("Cannot transition to SPEAKING state");
      return;
    }

    console.log(`[VOICE CTRL] speakQuestion: SPEAKING "${this.currentQuestion.substring(0, 50)}"`);
    this.config.onSpeakingStart?.();

    try {
      await this.ttsService.speak(this.currentQuestion, this.config.language);
      if (this.isStale) {
        console.warn(`[VOICE CTRL] speakQuestion: stale after TTS, returning`);
        return;
      }

      console.log(`[VOICE CTRL] speakQuestion: TTS done, waiting 400ms before ASR`);
      this.config.onSpeakingEnd?.();

      // Small gap so ASR doesn't capture the tail end of TTS output.
      await this.delay(400);

      if (!this.isStale) {
        console.log(`[VOICE CTRL] speakQuestion: calling startListening`);
        await this.startListening();
      }
    } catch (error) {
      if (this.isStale) return;
      const msg = error instanceof Error ? error.message : "TTS failed";
      // "interrupted" / "canceled" are normal when a newer session replaces us.
      if (/interrupted|canceled|cancelled/i.test(msg)) {
        console.warn("[VOICE] TTS lifecycle interrupted; continuing gracefully.");
        return;
      }
      this.handleVoiceError(msg);
    }
  }

  // ── Private: ASR ────────────────────────────────────────────────────────

  private async startListening(): Promise<void> {
    if (this.isStale) {
      console.warn(`[VOICE CTRL] startListening: stale, returning`);
      return;
    }

    if (!this.stateMachine.transitionTo("LISTENING")) {
      console.error(`[VOICE CTRL] startListening: cannot transition to LISTENING from ${this.stateMachine.getState()}`);
      this.config.onError?.("Cannot transition to LISTENING state");
      return;
    }

    console.log(`[VOICE CTRL] startListening: ASR starting for question "${this.currentQuestion.substring(0, 40)}"`);
    this.config.onListeningStart?.();

    this.asrStopTimeout = setTimeout(() => {
      if (this.stateMachine.isListening() && !this.isStale) {
        console.warn("[VOICE] ASR timeout — re-speaking question");
        this.asrService.stopListening();
        this.config.onListeningEnd?.();
        // Transition LISTENING → QUESTION_READY → SPEAKING to re-ask
        this.stateMachine.transitionTo("QUESTION_READY");
        void this.speakQuestion();
      }
    }, 30_000);

    try {
      this.asrService.startListening(this.config.language, (result) => {
        this.handleAsrResult(result);
      });
    } catch (error) {
      if (this.isStale) return;
      const msg = error instanceof Error ? error.message : "ASR failed";
      this.handleVoiceError(msg);
    }
  }

  private handleAsrResult(result: TranscriptionResult): void {
    if (this.isStale) {
      console.warn(`[VOICE CTRL] handleAsrResult: stale, ignoring`);
      return;
    }

    // ── Handle ASR errors (e.g. no-speech) ────────────────────────────
    if (result.error) {
      console.log(`[VOICE CTRL] handleAsrResult: error=${result.error}`);
      this.handleAsrError(result.error);
      return;
    }

    // ── Normal transcript ─────────────────────────────────────────────
    console.log(`[VOICE CTRL] handleAsrResult: text="${result.text}" isFinal=${result.isFinal}`);
    this.config.onTranscript?.(result.text, result.isFinal);

    if (result.isFinal) {
      this.clearAsrTimeout();

      if (!result.text.trim()) {
        // Empty final — treat as no-speech
        this.handleAsrError("no-speech");
        return;
      }

      console.log(`[VOICE CTRL] handleAsrResult: final transcript, transitioning to PROCESSING`);
      this.stopListeningAndTransitionToProcessing();
    }
  }

  private handleAsrError(errorKind: string): void {
    if (this.isStale) return;

    if (errorKind === "no-speech") {
      this.noSpeechRetryCount++;
      console.log(
        `[VOICE] no-speech: attempt ${this.noSpeechRetryCount}/${this.MAX_NO_SPEECH_RETRIES}`,
      );

      if (this.noSpeechRetryCount <= this.MAX_NO_SPEECH_RETRIES) {
        // Retry: restart ASR after a brief pause.
        // NOTE: We intentionally do NOT guard on stateMachine.isListening().
        // The state may have already transitioned away from LISTENING (e.g.
        // PROCESSING) if onTranscript fired before onerror.  In that case,
        // the next cycle's speakQuestion() will start ASR anyway.  But if
        // the state IS still LISTENING (ASR died silently), we must restart
        // ASR now so the patient can answer.
        this.clearAsrTimeout();
        setTimeout(() => {
          if (this.isStale) return;
          try {
            this.asrService.startListening(this.config.language, (r) => {
              this.handleAsrResult(r);
            });
          } catch {
            this.handleVoiceError("ASR restart failed");
          }
        }, this.NO_SPEECH_RETRY_DELAY_MS);
      } else {
        // Exhausted retries — go back to QUESTION_READY so the patient can retry
        console.warn("[VOICE] no-speech retries exhausted; returning to QUESTION_READY");
        this.noSpeechRetryCount = 0;
        this.clearAsrTimeout();
        this.asrService.stopListening();
        this.config.onListeningEnd?.();
        this.stateMachine.transitionTo("QUESTION_READY");
        // Re-speak the question so the patient knows to try again
        void this.speakQuestion();
      }
    } else if (errorKind === "not-allowed") {
      this.handleVoiceError("Microphone permission denied. Please allow microphone access and try again.");
    } else if (errorKind === "network") {
      this.handleVoiceError("Network error during speech recognition. Please check your connection.");
    }
    // "aborted" is normal when stop() is called; ignore it.
  }

  private stopListeningAndTransitionToProcessing(): void {
    if (this.isStale) return;

    this.clearAsrTimeout();
    this.asrService.stopListening();
    this.config.onListeningEnd?.();

    if (!this.stateMachine.transitionTo("PROCESSING")) {
      this.config.onError?.("Cannot transition to PROCESSING state");
      return;
    }

    this.config.onProcessingStart?.();
  }

  // ── Private: State change side-effects ──────────────────────────────────

  private handleStateChange(newState: VoiceState, prevState: VoiceState): void {
    if (this.isStale) return;

    // Safety: ensure TTS stops when leaving SPEAKING (e.g. ERROR → cleanup)
    if (newState !== "SPEAKING" && prevState === "SPEAKING") {
      this.ttsService.stop();
    }

    // Safety: ensure ASR stops when leaving LISTENING
    if (newState !== "LISTENING" && prevState === "LISTENING") {
      this.asrService.stopListening();
    }
  }

  // ── Private: Error handling ─────────────────────────────────────────────

  private handleVoiceError(error: string): void {
    if (this.isStale) return;

    const normalized = error.toLowerCase();
    if (
      normalized.includes("interrupted") ||
      normalized.includes("canceled") ||
      normalized.includes("cancelled")
    ) {
      console.warn("[VOICE] lifecycle interrupted intentionally; continuing gracefully.");
      return;
    }

    console.error("[VOICE] error:", error);
    this.config.onError?.(error);

    if (
      this.stateMachine.getState() !== "ERROR" &&
      this.stateMachine.transitionTo("ERROR")
    ) {
      // Intentionally not auto-recovering here; the UI can trigger a retry.
    }
  }

  // ── Private: Utilities ──────────────────────────────────────────────────

  private clearAsrTimeout(): void {
    if (this.asrStopTimeout !== null) {
      clearTimeout(this.asrStopTimeout);
      this.asrStopTimeout = null;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
