/**
 * VoiceModeInterface
 *
 * Complete hands-free voice conversation experience.
 *
 * Session-safety under React StrictMode:
 * - Each mount gets its own sessionId; cleanup only affects that session.
 * - processPatientResponse reads state from refs (never stale closures).
 * - Duplicate transcripts / messages are deduplicated per session.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatientStore } from "@/store/patientStore";
import { Header } from "@/components/shared/Header";
import { StepProgress } from "@/components/shared/StepProgress";
import { VoiceOrb } from "./VoiceOrb";
import { VoiceInteractionController } from "@/services/voice/VoiceInteractionController";
import { VoiceState } from "@/services/voice/VoiceStateMachine";
import { getAsrService, getTtsService, getAiService } from "@/services/serviceRegistry";
import { ClinicalState, defaultClinicalState, SOCRATESResponse } from "@/types";
import {
  FileText,
  Touchpad,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "ai" | "patient";
  content: string;
  timestamp: string;
}

/** Generate a stable question ID from the target field name. */
function makeQuestionId(field: string | null | undefined): string {
  return field ? `q-${field}` : `q-${Date.now()}`;
}

const socratesLabels: Record<string, string> = {
  site: "Where",
  onset: "When",
  character: "Quality",
  radiation: "Radiation",
  associatedSymptoms: "Symptoms",
  timing: "Pattern",
  aggravatingFactors: "Worse with",
  relievingFactors: "Better with",
  severity: "Severity",
};

const socratesOrder = [
  "site",
  "onset",
  "character",
  "radiation",
  "associatedSymptoms",
  "timing",
  "aggravatingFactors",
  "relievingFactors",
  "severity",
];

const toLegacySocrates = (state: Partial<ClinicalState>): SOCRATESResponse => ({
  site: state.site ?? "",
  onset: state.onset ?? "",
  character: state.character ?? "",
  radiation: state.radiation ?? "",
  associatedSymptoms: state.associatedSymptoms?.join(", ") ?? "",
  timing: state.timing ?? "",
  exacerbatingFactors: state.aggravatingFactors ?? "",
  relievingFactors: state.relievingFactors ?? "",
  severity: state.severity != null ? String(state.severity) : "",
});

// ── Component ─────────────────────────────────────────────────────────────

export default function VoiceModeInterface() {
  const navigate = useNavigate();
  const {
    chiefComplaint,
    clinicalState,
    updateClinicalState,
    setChiefComplaint,
    setSOCRATES,
    language,
    setInputMode,
    interviewMessages,
    setInterviewMessages,
    setInterviewComplete,
    setInterviewProgress,
    activeInterviewQuestion,
    activeInterviewTargetField,
  } = usePatientStore();

  // ── UI state (for rendering only) ────────────────────────────────────
  const [voiceState, setVoiceState] = useState<VoiceState>("IDLE");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(interviewMessages);
  const [errorMessage, setErrorMessage] = useState("");

  // ── Refs for Stable Identity & Session Guarding ───────────────────────
  const voiceControllerRef = useRef<VoiceInteractionController | null>(null);
  const sessionCounterRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Refs for latest mutable state (avoids stale closures) ─────────────
  const currentQuestionRef = useRef(activeInterviewQuestion);
  const clinicalStateRef = useRef(clinicalState);
  const languageRef = useRef(language);
  const targetFieldRef = useRef(activeInterviewTargetField);
  const chiefComplaintRef = useRef(chiefComplaint);
  const isProcessingRef = useRef(false);
  const lastFinalTranscriptRef = useRef("");
  const lastAddedMessageIdRef = useRef("");
  const completionHandledRef = useRef(false);
  const processingCounterRef = useRef(0);

  // Keep refs in sync with store on every render.
  currentQuestionRef.current = activeInterviewQuestion;
  clinicalStateRef.current = clinicalState;
  languageRef.current = language;
  targetFieldRef.current = activeInterviewTargetField;
  chiefComplaintRef.current = chiefComplaint;

  // ── Auto-scroll ──────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Stable addMessage ────────────────────────────────────────────────
  // NOTE: setInterviewMessages is called OUTSIDE the setMessages updater
  // to avoid triggering a Zustand store update during React's commit phase,
  // which causes the "Cannot update a component while rendering" warning
  // for DemoSelector (which subscribes to the full store).
  const addMessage = useCallback(
    (role: "ai" | "patient", content: string): string => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const msg: ChatMessage = {
        id,
        role,
        content,
        timestamp: new Date().toISOString(),
      };

      let nextMessages: ChatMessage[] | null = null;
      setMessages((prev) => {
        // Deduplicate: if the same content was just added, skip.
        const last = prev[prev.length - 1];
        if (last && last.role === role && last.content === content) {
          return prev;
        }
        nextMessages = [...prev, msg];
        return nextMessages;
      });

      // Persist to Zustand store OUTSIDE the updater to avoid
      // triggering store subscribers during React's commit phase.
      if (nextMessages) {
        setInterviewMessages(nextMessages);
      }

      return id;
    },
    [setInterviewMessages],
  );

  // ── processPatientResponse (purely ref-based for closure stability) ───
  //
  // This is the clinical processing path shared with Touch mode.
  // Voice → processAnswer(...) → ClinicalState  (same as Touch)
  //
  const processPatientResponse = useCallback(
    async (transcript: string, questionId: string) => {
      const normalized = transcript.trim();
      if (!normalized) return;

      console.log(`[VOICE TRACE 1] ASR final transcript received: "${normalized}" (${questionId})`);

      // Guard: no duplicate processing (same speech event firing twice)
      if (isProcessingRef.current) {
        console.warn(`[VOICE] duplicate answer blocked (isProcessing=true): ${normalized}`);
        return;
      }

      const processingId = ++processingCounterRef.current;
      const q = currentQuestionRef.current;

      console.log(`[VOICE PROCESS ${processingId}] START session=${sessionCounterRef.current} questionId=${questionId} transcript="${normalized}"`);
      console.log(`[VOICE PROCESS ${processingId}] currentQuestion="${q}" targetField="${targetFieldRef.current}"`);
      console.log(`[VOICE PROCESS ${processingId}] clinicalState BEFORE:`, {
        chiefComplaint: clinicalStateRef.current.chiefComplaint,
        site: clinicalStateRef.current.site,
      });

      lastFinalTranscriptRef.current = normalized;
      isProcessingRef.current = true;

      try {
        const aiService = getAiService();
        const baseState = clinicalStateRef.current;

        console.log(`[VOICE PROCESS ${processingId}] calling processAnswer`, {
          transcript: normalized.substring(0, 40),
          question: q.substring(0, 40),
          targetField: targetFieldRef.current || undefined,
          language: languageRef.current,
        });

        // Timeout safeguard: if processAnswer hangs (e.g. Groq proxy),
        // recover after 20 seconds so the interview doesn't get stuck.
        const PROCESS_ANSWER_TIMEOUT_MS = 20_000;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const result = await Promise.race([
          // Suppress unhandled rejection if timeout wins the race
          (aiService.processAnswer?.(normalized, q, baseState, {
            language: languageRef.current,
            targetField: targetFieldRef.current || undefined,
          }) ?? Promise.resolve({
            updatedState: baseState,
            nextQuestion: null,
            providerStatus: "LOCAL" as const,
          })).catch(() => null),
          new Promise<null>((resolve) => {
            timeoutId = setTimeout(() => {
              console.error(`[VOICE PROCESS ${processingId}] processAnswer TIMED OUT after ${PROCESS_ANSWER_TIMEOUT_MS}ms — this is a REAL timeout`);
              resolve(null);
            }, PROCESS_ANSWER_TIMEOUT_MS);
          }),
        ]) ?? {
          updatedState: baseState,
          nextQuestion: null,
          providerStatus: "LOCAL" as const,
        };

        // Cancel timeout if processAnswer resolved first — prevents false timeout log
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        console.log(`[VOICE PROCESS ${processingId}] processAnswer RESOLVED`);
        console.log(`[VOICE PROCESS ${processingId}] processAnswer result:`, {
          hasUpdatedState: !!result.updatedState,
          chiefComplaint: result.updatedState?.chiefComplaint,
          nextQuestion: result.nextQuestion?.question?.substring(0, 60),
          nextField: result.nextQuestion?.targetField,
        });

        // Update clinical state
        updateClinicalState(result.updatedState);
        setSOCRATES(toLegacySocrates(result.updatedState));
        setChiefComplaint(
          result.updatedState.chiefComplaint || chiefComplaintRef.current,
        );

        console.log(`[VOICE PROCESS ${processingId}] clinicalState UPDATED`, {
          chiefComplaint: result.updatedState.chiefComplaint,
          site: result.updatedState.site,
          onset: result.updatedState.onset,
        });

        // Check completion
        if (!result.nextQuestion || result.nextQuestion.targetField === "complete") {
          const completionMsg =
            result.nextQuestion?.question ||
            "Thank you. Your medical history is complete.";
          console.log(`[VOICE PROCESS ${processingId}] INTERVIEW COMPLETE`);
          addMessage("ai", completionMsg);
          setInterviewComplete(true);
          completionHandledRef.current = true;
          if (voiceControllerRef.current) {
            voiceControllerRef.current.markCompleted();
          }
          return;
        }

        // Next question
        const nextQ = result.nextQuestion;
        const nextField = nextQ.targetField;
        const nextQId = makeQuestionId(nextField);

        currentQuestionRef.current = nextQ.question;
        targetFieldRef.current = nextField;
        setInterviewProgress(nextQ.question, nextField);

        console.log(`[VOICE PROCESS ${processingId}] NEXT QUESTION: ${nextQId}`, {
          field: nextField,
          question: nextQ.question.substring(0, 60),
        });

        addMessage("ai", nextQ.question);

        // Advance controller: PROCESSING → QUESTION_READY → SPEAKING
        console.log(`[VOICE PROCESS ${processingId}] PROCESSING -> QUESTION_READY`);
        if (voiceControllerRef.current) {
          await voiceControllerRef.current.markProcessingComplete();
          console.log(`[VOICE PROCESS ${processingId}] calling handleNextQuestion for TTS`);
          await voiceControllerRef.current.handleNextQuestion(nextQ.question);
        }
      } catch (error) {
        console.error(`[VOICE PROCESS ${processingId}] ERROR:`, error);
        const msg =
          error instanceof Error ? error.message : "Failed to process response";
        addMessage("ai", `Sorry, there was an error: ${msg}`);
        setErrorMessage(msg);

        // Recover: go back to question ready so patient can try again
        if (voiceControllerRef.current) {
          await voiceControllerRef.current.markProcessingComplete();
        }
      } finally {
        lastFinalTranscriptRef.current = "";
        isProcessingRef.current = false;
        console.log(`[VOICE PROCESS ${processingId}] DONE — isProcessing=false`);
      }
    },
    [
      addMessage,
      updateClinicalState,
      setChiefComplaint,
      setInterviewComplete,
      setInterviewProgress,
      setSOCRATES,
    ],
  );

  // ── Voice mode initialization (session-safe under StrictMode) ────────
  useEffect(() => {
    const sessionId = ++sessionCounterRef.current;

    console.log(`[VOICE] session initialized: ${sessionId}`);

    // Reset session-scoped refs so stale values from a previous StrictMode
    // session cannot block processing in the new session.
    lastFinalTranscriptRef.current = "";
    isProcessingRef.current = false;
    completionHandledRef.current = false;

    const initializeVoiceMode = async () => {
      const asrService = getAsrService();
      const ttsService = getTtsService();

      const controller = new VoiceInteractionController(asrService, ttsService, {
        language: languageRef.current,
        onStateChange: setVoiceState,
        onTranscript: (text, isFinal) => {
          // Session guard: ignore transcripts from a superseded session.
          if (sessionId !== sessionCounterRef.current) return;

          setInterimTranscript(isFinal ? "" : text);

          if (isFinal) {
            const normalized = text.trim();
            if (!normalized) return;

            // Deduplicate within this session
            if (lastFinalTranscriptRef.current === normalized) return;
            lastFinalTranscriptRef.current = normalized;

            // Add patient message to chat
            const qId = makeQuestionId(targetFieldRef.current);
            addMessage("patient", normalized);

            // Process through SAME clinical path as Touch mode
            void processPatientResponse(normalized, qId);
          }
        },
        onError: (error) => {
          if (sessionId !== sessionCounterRef.current) return;
          setErrorMessage(error);
          addMessage("ai", error);
        },
      });

      voiceControllerRef.current = controller;

      // Display first question message (only on first mount)
      const startQuestion = currentQuestionRef.current || "What brings you in today?";
      if (messages.length === 0) {
        addMessage("ai", startQuestion);
      }

      // CRITICAL: sync currentQuestionRef with the actual first question
      // so processPatientResponse reads the real question text, not ""
      currentQuestionRef.current = startQuestion;
      targetFieldRef.current = targetFieldRef.current || "chiefComplaint";

      console.log(`[VOICE] first question synced: "${startQuestion}" field="${targetFieldRef.current}"`);

      // Start voice interaction
      await controller.startVoice(startQuestion);
    };

    initializeVoiceMode();

    return () => {
      console.log(`[VOICE] cleanup for session: ${sessionId} (active: ${sessionCounterRef.current})`);
      if (sessionId === sessionCounterRef.current) {
        // This is the active session — clean it up.
        voiceControllerRef.current?.cleanupSession(sessionId);
        voiceControllerRef.current = null;
      } else {
        // Stale session — do NOT stop the active session's resources.
        console.warn(`[VOICE] stale session cleanup ignored: ${sessionId}`);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Mode switching ───────────────────────────────────────────────────
  const switchToTouchMode = useCallback(() => {
    const controller = voiceControllerRef.current;
    if (controller) {
      controller.stopVoice();
      controller.cleanup();
      voiceControllerRef.current = null;
    }
    setInputMode("touch");
  }, [setInputMode]);

  const handleExit = useCallback(() => {
    const controller = voiceControllerRef.current;
    if (controller) {
      controller.cleanup();
      voiceControllerRef.current = null;
    }
    navigate(-1);
  }, [navigate]);

  // ── Derived display data ─────────────────────────────────────────────
  const answeredCount = socratesOrder.filter(
    (field) => clinicalState[field as keyof ClinicalState],
  ).length;

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen vintage-texture flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 py-4">
        {/* Progress */}
        <div className="mb-4">
          <StepProgress
            currentStep="interview"
            completedSteps={["login", "consent", "language", "inputMode"]}
          />
        </div>

        {/* Two-panel layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-0">
          {/* Left: Voice Interaction */}
          <div className="lg:col-span-3 flex flex-col">
            <Card className="vintage-card flex-1 flex flex-col min-h-[600px]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle
                    className="text-lg"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Voice Interview
                  </CardTitle>
                  <span className="text-xs font-semibold text-vintage-blue">
                    {answeredCount}/9 SOCRATES
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto px-4 pb-4 space-y-6 flex flex-col">
                {/* Voice Orb */}
                <div className="flex-1 flex items-center justify-center">
                  <VoiceOrb
                    state={voiceState}
                    isActive={
                      voiceState !== "IDLE" && voiceState !== "COMPLETED"
                    }
                    interimTranscript={interimTranscript}
                  />
                </div>

                {/* Messages */}
                <div className="max-h-[200px] overflow-y-auto space-y-2">
                  {messages.slice(-6).map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-sm px-3 py-2 rounded ${
                        msg.role === "ai"
                          ? "bg-vintage-blue/5 text-foreground"
                          : "bg-vintage-teal/10 text-foreground text-right"
                      }`}
                    >
                      {msg.content}
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Error Display */}
                <AnimatePresence>
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">
                          {errorMessage}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setErrorMessage("")}
                          className="mt-2 text-red-700 hover:text-red-800"
                        >
                          Dismiss
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Controls */}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={switchToTouchMode}
                    className="flex-1"
                  >
                    <Touchpad className="w-4 h-4 mr-2" />
                    Switch to Touch
                  </Button>
                  <Button variant="ghost" onClick={handleExit}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Exit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: SOCRATES Panel */}
          <div className="lg:col-span-2 flex flex-col">
            <Card className="vintage-card flex-1 flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle
                  className="text-sm"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Live SOCRATES
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
                {/* Chief Complaint */}
                {chiefComplaint && (
                  <div className="p-3 rounded-lg bg-vintage-blue/5 border border-vintage-blue/10">
                    <p className="text-[10px] font-bold text-vintage-blue uppercase">
                      Complaint
                    </p>
                    <p className="text-sm text-foreground mt-1">
                      {chiefComplaint}
                    </p>
                  </div>
                )}

                {/* SOCRATES Fields */}
                {socratesOrder.map((field) => {
                  const value = clinicalState[field as keyof ClinicalState];
                  if (!value) return null;

                  return (
                    <div key={field} className="p-2 rounded-lg bg-muted/30">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                        {socratesLabels[field] || field}
                      </p>
                      <p className="text-sm text-foreground mt-1">
                        {Array.isArray(value)
                          ? value.join(", ")
                          : String(value)}
                      </p>
                    </div>
                  );
                })}

                {answeredCount === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-4">
                    Responses will appear here...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
