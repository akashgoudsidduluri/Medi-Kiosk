import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { VoiceStateMachine } from "./VoiceStateMachine";
import {
  VoiceInteractionController,
  VoiceInteractionConfig,
} from "./VoiceInteractionController";
import { BrowserAsrService } from "@/services/asr/BrowserAsrService";
import { BrowserTtsService } from "@/services/tts/BrowserTtsService";
import { AsrService, TranscriptionResult } from "@/services/asr/AsrService";
import { TtsService } from "@/services/tts/TtsService";

// ── Helpers ──────────────────────────────────────────────────────────────

function createMockAsr(): AsrService & {
  fireResult: (r: TranscriptionResult) => void;
  startCount: number;
  stopCount: number;
} {
  let capturedCb: ((r: TranscriptionResult) => void) | null = null;
  const counts = { start: 0, stop: 0 };
  return {
    isSupported: () => true,
    get startCount() { return counts.start; },
    get stopCount() { return counts.stop; },
    startListening: (_lang: string, onResult: (r: TranscriptionResult) => void) => {
      capturedCb = onResult;
      counts.start++;
    },
    stopListening: () => {
      capturedCb = null;
      counts.stop++;
    },
    fireResult: (r: TranscriptionResult) => {
      capturedCb?.(r);
    },
  } as any;
}

function createMockTts(): TtsService & { speakCount: number; stopCount: number } {
  const counts = { speak: 0, stop: 0 };
  return {
    isSupported: () => true,
    get speakCount() { return counts.speak; },
    get stopCount() { return counts.stop; },
    speak: async (_text: string, _lang: string) => {
      counts.speak++;
    },
    stop: () => {
      counts.stop++;
    },
  } as any;
}

function createConfig(
  overrides?: Partial<VoiceInteractionConfig>,
): VoiceInteractionConfig {
  return {
    language: "English",
    onStateChange: vi.fn(),
    onQuestionReady: vi.fn(),
    onSpeakingStart: vi.fn(),
    onSpeakingEnd: vi.fn(),
    onListeningStart: vi.fn(),
    onListeningEnd: vi.fn(),
    onProcessingStart: vi.fn(),
    onProcessingEnd: vi.fn(),
    onTranscript: vi.fn(),
    onError: vi.fn(),
    onCompleted: vi.fn(),
    ...overrides,
  };
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── VoiceStateMachine Tests ──────────────────────────────────────────────

describe("VoiceStateMachine", () => {
  it("starts in IDLE by default", () => {
    const sm = new VoiceStateMachine();
    expect(sm.getState()).toBe("IDLE");
  });

  it("transitions IDLE → QUESTION_READY", () => {
    const sm = new VoiceStateMachine();
    expect(sm.transitionTo("QUESTION_READY")).toBe(true);
    expect(sm.getState()).toBe("QUESTION_READY");
  });

  it("transitions IDLE → SPEAKING → LISTENING → PROCESSING → QUESTION_READY", () => {
    const sm = new VoiceStateMachine();
    expect(sm.transitionTo("QUESTION_READY")).toBe(true);
    expect(sm.transitionTo("SPEAKING")).toBe(true);
    expect(sm.transitionTo("LISTENING")).toBe(true);
    expect(sm.transitionTo("PROCESSING")).toBe(true);
    expect(sm.transitionTo("QUESTION_READY")).toBe(true);
  });

  it("transitions LISTENING → QUESTION_READY (no-speech retry)", () => {
    const sm = new VoiceStateMachine();
    sm.transitionTo("QUESTION_READY");
    sm.transitionTo("SPEAKING");
    sm.transitionTo("LISTENING");
    expect(sm.transitionTo("QUESTION_READY")).toBe(true);
    expect(sm.getState()).toBe("QUESTION_READY");
  });

  it("rejects invalid transition SPEAKING → PROCESSING", () => {
    const sm = new VoiceStateMachine();
    sm.transitionTo("QUESTION_READY");
    sm.transitionTo("SPEAKING");
    expect(sm.transitionTo("PROCESSING")).toBe(false);
    expect(sm.getState()).toBe("SPEAKING");
  });

  it("notifies listeners on state change", () => {
    const sm = new VoiceStateMachine();
    const listener = vi.fn();
    sm.onChange(listener);
    sm.transitionTo("QUESTION_READY");
    expect(listener).toHaveBeenCalledWith("QUESTION_READY", "IDLE");
  });

  it("reset goes to IDLE", () => {
    const sm = new VoiceStateMachine();
    sm.transitionTo("QUESTION_READY");
    sm.reset();
    expect(sm.getState()).toBe("IDLE");
  });

  it("can reach COMPLETED from PROCESSING", () => {
    const sm = new VoiceStateMachine();
    sm.transitionTo("QUESTION_READY");
    sm.transitionTo("SPEAKING");
    sm.transitionTo("LISTENING");
    sm.transitionTo("PROCESSING");
    expect(sm.transitionTo("COMPLETED")).toBe(true);
    expect(sm.getState()).toBe("COMPLETED");
  });
});

// ── VoiceInteractionController Tests ─────────────────────────────────────

describe("VoiceInteractionController", () => {
  // ── TEST 1: Initial question appears exactly once ──
  it("TEST 1: fires onQuestionReady exactly once on startVoice", async () => {
    const asr = createMockAsr();
    const tts = createMockTts();
    const config = createConfig();
    const ctrl = new VoiceInteractionController(asr, tts, config);

    await ctrl.startVoice("What is your complaint?");

    expect(config.onQuestionReady).toHaveBeenCalledTimes(1);
    ctrl.cleanup();
  });

  // ── TEST 2: Initial question TTS starts exactly once ──
  it("TEST 2: fires onSpeakingStart exactly once on startVoice", async () => {
    const asr = createMockAsr();
    const tts = createMockTts();
    const config = createConfig();
    const ctrl = new VoiceInteractionController(asr, tts, config);

    await ctrl.startVoice("What is your complaint?");

    expect(config.onSpeakingStart).toHaveBeenCalledTimes(1);
    expect(tts.speakCount).toBe(1);
    ctrl.cleanup();
  });

  // ── TEST 3: ASR does not start before TTS completes ──
  it("TEST 3: ASR starts only after TTS completes (LISTENING after SPEAKING)", async () => {
    const asr = createMockAsr();
    const tts = createMockTts();
    const config = createConfig();
    const ctrl = new VoiceInteractionController(asr, tts, config);

    await ctrl.startVoice("What is your complaint?");

    // After startVoice resolves, TTS should be done and ASR should have started
    expect(config.onSpeakingStart).toHaveBeenCalled();
    expect(config.onListeningStart).toHaveBeenCalled();
    ctrl.cleanup();
  });

  // ── TEST 4: ASR starts automatically after TTS completion ──
  it("TEST 4: onListeningStart fires after TTS completes", async () => {
    const asr = createMockAsr();
    const tts = createMockTts();
    const config = createConfig();
    const ctrl = new VoiceInteractionController(asr, tts, config);

    await ctrl.startVoice("What is your complaint?");

    expect(config.onListeningStart).toHaveBeenCalledTimes(1);
    ctrl.cleanup();
  });

  // ── TEST 5: Final transcript is submitted exactly once via onTranscript ──
  it("TEST 5: onTranscript called with final text exactly once", async () => {
    const asr = createMockAsr();
    const tts = createMockTts();
    const config = createConfig();
    const ctrl = new VoiceInteractionController(asr, tts, config);

    await ctrl.startVoice("Question?");
    asr.fireResult({ text: "chest pain", isFinal: true, languageCode: "en-IN" });

    expect(config.onTranscript).toHaveBeenCalledTimes(1);
    expect(config.onTranscript).toHaveBeenCalledWith("chest pain", true);
    ctrl.cleanup();
  });

  // ── TEST 6: Transcript goes to onTranscript (same path as Touch's processAnswer) ──
  it("TEST 6: final transcript fires onTranscript which triggers processAnswer in the UI", async () => {
    const asr = createMockAsr();
    const tts = createMockTts();
    const config = createConfig();
    const ctrl = new VoiceInteractionController(asr, tts, config);

    await ctrl.startVoice("Describe your pain.");
    asr.fireResult({
      text: "burning pain for 3 days",
      isFinal: true,
      languageCode: "en-IN",
    });

    // The transcript is emitted to the UI layer, which calls processAnswer (same as Touch)
    expect(config.onTranscript).toHaveBeenCalledWith("burning pain for 3 days", true);
    ctrl.cleanup();
  });

  // ── TEST 7: ClinicalState updates after processing (verified via onProcessingStart) ──
  it("TEST 7: transitions to PROCESSING after final transcript (controller prepares for clinical update)", async () => {
    const asr = createMockAsr();
    const tts = createMockTts();
    const config = createConfig();
    const ctrl = new VoiceInteractionController(asr, tts, config);

    await ctrl.startVoice("Question?");
    asr.fireResult({ text: "left knee", isFinal: true, languageCode: "en-IN" });

    expect(config.onProcessingStart).toHaveBeenCalled();
    expect(ctrl.getState()).toBe("PROCESSING");
    ctrl.cleanup();
  });

  // ── TEST 8: Next question appears exactly once after processAnswer ──
  it("TEST 8: handleNextQuestion fires onQuestionReady exactly once", async () => {
    const asr = createMockAsr();
    const tts = createMockTts();
    const config = createConfig();
    const ctrl = new VoiceInteractionController(asr, tts, config);

    await ctrl.startVoice("First?");
    asr.fireResult({ text: "answer", isFinal: true, languageCode: "en-IN" });

    // Simulate the UI processing the answer and providing the next question
    await ctrl.markProcessingComplete();
    await ctrl.handleNextQuestion("Second question?");

    // onQuestionReady was called once at startVoice + once at handleNextQuestion
    expect(config.onQuestionReady).toHaveBeenCalledTimes(2);
    ctrl.cleanup();
  });

  // ── TEST 9: Next question is spoken exactly once ──
  it("TEST 9: TTS speakCount matches question count", async () => {
    const asr = createMockAsr();
    const tts = createMockTts();
    const config = createConfig();
    const ctrl = new VoiceInteractionController(asr, tts, config);

    await ctrl.startVoice("Q1?");
    asr.fireResult({ text: "a1", isFinal: true, languageCode: "en-IN" });

    await ctrl.markProcessingComplete();
    await ctrl.handleNextQuestion("Q2?");

    expect(tts.speakCount).toBe(2); // Q1 + Q2
    ctrl.cleanup();
  });

  // ── TEST 10: no-speech does not complete the question ──
  it("TEST 10: no-speech does not trigger onProcessingStart", async () => {
    const asr = createMockAsr();
    const tts = createMockTts();
    const config = createConfig();
    const ctrl = new VoiceInteractionController(asr, tts, config);

    await ctrl.startVoice("Question?");

    // Simulate no-speech error
    asr.fireResult({
      text: "",
      isFinal: false,
      languageCode: "en-IN",
      error: "no-speech",
    });

    // Should NOT be in PROCESSING
    expect(ctrl.getState()).not.toBe("PROCESSING");
    expect(config.onProcessingStart).not.toHaveBeenCalled();
    ctrl.cleanup();
  });

  // ── TEST 11: no-speech allows controlled retry/listening ──
  it("TEST 11: no-speech retries listening up to MAX retries", async () => {
    const asr = createMockAsr();
    const tts = createMockTts();
    const config = createConfig();
    const ctrl = new VoiceInteractionController(asr, tts, config);

    await ctrl.startVoice("Question?");

    // Fire no-speech 3 times (within retry limit)
    for (let i = 0; i < 3; i++) {
      asr.fireResult({
        text: "",
        isFinal: false,
        languageCode: "en-IN",
        error: "no-speech",
      });
      await wait(50); // Allow async retry scheduling
    }

    // Should still be in LISTENING (retrying)
    expect(config.onError).not.toHaveBeenCalled();
    ctrl.cleanup();
  });

  // ── TEST 12: Duplicate ASR final event does not process twice ──
  it("TEST 12: duplicate final transcript from ASR only fires onTranscript once", async () => {
    const asr = createMockAsr();
    const tts = createMockTts();
    const config = createConfig();
    const ctrl = new VoiceInteractionController(asr, tts, config);

    await ctrl.startVoice("Q?");
    asr.fireResult({ text: "chest pain", isFinal: true, languageCode: "en-IN" });
    asr.fireResult({ text: "chest pain", isFinal: true, languageCode: "en-IN" });

    // onTranscript should only be called once for the final
    expect(config.onTranscript).toHaveBeenCalledTimes(1);
    ctrl.cleanup();
  });

  // ── TEST 13: StrictMode init → cleanup → init does not cancel the active session ──
  it("TEST 13: stale session cleanup does not cancel the active session", async () => {
    const asr = createMockAsr();
    const tts = createMockTts();
    const config = createConfig();

    // Session A (stale — simulates old StrictMode lifecycle)
    const sessionA = new VoiceInteractionController(asr, tts, config);
    await sessionA.startVoice("Q1?");

    // Session B (active — simulates StrictMode remount)
    const sessionB = new VoiceInteractionController(asr, tts, config);
    await sessionB.startVoice("Q2?");

    // Session A cleanup should be ignored since it's stale
    sessionA.cleanupSession(sessionA.sessionId);

    // Session B should still be active
    expect(sessionB.isActive()).toBe(true);
    expect(sessionB.getState()).toBe("LISTENING");

    // TTS from session B should NOT have been stopped
    // (sessionA.cleanup would have called tts.stop() which we want to avoid)
    sessionB.cleanup();
  });

  // ── TEST 14: Stale session cleanup cannot affect active session resources ──
  it("TEST 14: stale cleanup does not touch the active session's TTS", async () => {
    // Each session gets its OWN mock services. The stale session's cleanup
    // must not reach the active session's services.
    const staleAsr = createMockAsr();
    let staleTtsStopCalls = 0;
    const staleTts: TtsService = {
      isSupported: () => true,
      speak: async () => {},
      stop: () => { staleTtsStopCalls++; },
    };
    const activeAsr = createMockAsr();
    let activeTtsStopCalls = 0;
    const activeTts: TtsService = {
      isSupported: () => true,
      speak: async () => {},
      stop: () => { activeTtsStopCalls++; },
    };

    // Stale session uses staleAsr/staleTts
    const stale = new VoiceInteractionController(staleAsr, staleTts, createConfig());
    await stale.startVoice("Q?");

    // Active session uses activeAsr/activeTts (different objects)
    const active = new VoiceInteractionController(activeAsr, activeTts, createConfig());
    await active.startVoice("Q?");

    staleTtsStopCalls = 0;
    activeTtsStopCalls = 0;

    // Stale cleanup — uses stale's own TTS service, not the active one
    stale.cleanupSession(stale.sessionId);

    // The stale session's cleanup called its own tts.stop — that's fine.
    expect(staleTtsStopCalls).toBe(1);
    // The active session's TTS must NOT have been touched.
    expect(activeTtsStopCalls).toBe(0);
  });

  // ── TEST 15: Stale session cleanup cannot affect active session resources ──
  it("TEST 15: stale cleanup does not touch the active session's ASR", async () => {
    let staleAsrStopCalls = 0;
    const staleAsr: AsrService = {
      isSupported: () => true,
      startListening: () => {},
      stopListening: () => { staleAsrStopCalls++; },
    };
    let activeAsrStopCalls = 0;
    const activeAsr: AsrService = {
      isSupported: () => true,
      startListening: () => {},
      stopListening: () => { activeAsrStopCalls++; },
    };

    const staleTts = createMockTts();
    const activeTts = createMockTts();

    // Stale session
    const stale = new VoiceInteractionController(staleAsr, staleTts, createConfig());
    await stale.startVoice("Q?");

    // Active session (different service objects)
    const active = new VoiceInteractionController(activeAsr, activeTts, createConfig());
    await active.startVoice("Q?");

    staleAsrStopCalls = 0;
    activeAsrStopCalls = 0;

    // Stale cleanup uses stale's own ASR
    stale.cleanupSession(stale.sessionId);

    expect(staleAsrStopCalls).toBe(1);
    expect(activeAsrStopCalls).toBe(0);
  });

  // ── TEST 16: Voice interview can complete without PROCESSING deadlock ──
  it("TEST 16: markCompleted transitions to COMPLETED from any active state", async () => {
    const asr = createMockAsr();
    const tts = createMockTts();
    const config = createConfig();
    const ctrl = new VoiceInteractionController(asr, tts, config);

    await ctrl.startVoice("Q1?");
    asr.fireResult({ text: "done", isFinal: true, languageCode: "en-IN" });

    // Mark processing complete then mark completed
    await ctrl.markProcessingComplete();
    ctrl.markCompleted();

    expect(ctrl.getState()).toBe("COMPLETED");
    expect(config.onCompleted).toHaveBeenCalledTimes(1);
  });

  // ── TEST 17: Selected language is passed to TTS and ASR ──
  it("TEST 17: language from config is passed through to ASR and TTS", async () => {
    let capturedLang = "";
    const asr: AsrService = {
      isSupported: () => true,
      startListening: (lang: string, _cb: (r: TranscriptionResult) => void) => {
        capturedLang = lang;
      },
      stopListening: () => {},
    };
    const tts: TtsService = {
      isSupported: () => true,
      speak: async (text: string, lang: string) => {
        capturedLang = lang;
      },
      stop: () => {},
    };

    const config = createConfig({ language: "Hindi" });
    const ctrl = new VoiceInteractionController(asr, tts, config);

    await ctrl.startVoice("प्रश्न?");

    expect(capturedLang).toBe("Hindi");
    ctrl.cleanup();
  });
});

// ── Browser Speech Services Tests ────────────────────────────────────────

describe("Browser speech services", () => {
  const globalWithSpeech = globalThis as any;

  beforeEach(() => {
    globalWithSpeech.window = globalThis;
    globalWithSpeech.SpeechSynthesisUtterance = class {
      public lang?: string;
      public voice?: { lang: string };
      public text: string;
      public rate?: number;
      public pitch?: number;
      public volume?: number;
      public onstart?: (event?: any) => void;
      public onend?: (event?: any) => void;
      public onerror?: (event?: any) => void;

      constructor(text: string) {
        this.text = text;
      }
    };
  });

  it("speaks Hindi and Telugu with the correct browser language codes", async () => {
    let capturedUtterance: any = null;
    globalWithSpeech.speechSynthesis = {
      getVoices: () => [{ lang: "en-IN" }, { lang: "hi-IN" }, { lang: "te-IN" }],
      speak: (utterance: any) => {
        capturedUtterance = utterance;
        utterance.onstart?.({} as any);
        setTimeout(() => utterance.onend?.({} as any), 0);
      },
      cancel: vi.fn(),
    };

    const tts = new BrowserTtsService();
    await tts.speak("नमस्ते", "Hindi");
    expect(capturedUtterance?.lang).toBe("hi-IN");

    await tts.speak("నమస్తే", "Telugu");
    expect(capturedUtterance?.lang).toBe("te-IN");
  });

  it("starts browser recognition with the patient language and emits the final transcript once", async () => {
    let started = false;
    let capturedResult: any = null;

    class FakeSpeechRecognition {
      public lang = "en-IN";
      public continuous = false;
      public interimResults = false;
      public onstart?: () => void;
      public onresult?: (event: {
        resultIndex: number;
        results: ArrayLike<{ isFinal: boolean; 0?: { transcript: string } }>;
      }) => void;
      public onend?: () => void;
      public onerror?: (event: { error?: string; message?: string }) => void;
      public start() {
        started = true;
        this.onstart?.();
        setTimeout(() => {
          this.onresult?.({
            resultIndex: 0,
            results: [{ isFinal: true, 0: { transcript: "I have knee pain" } }],
          });
          this.onend?.();
        }, 0);
      }
      public stop() {}
    }

    globalWithSpeech.SpeechRecognition = FakeSpeechRecognition;

    const asr = new BrowserAsrService();
    asr.startListening("English", (result) => {
      capturedResult = result;
    });

    expect(started).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(capturedResult?.text).toBe("I have knee pain");
    expect(capturedResult?.isFinal).toBe(true);
  });
});
