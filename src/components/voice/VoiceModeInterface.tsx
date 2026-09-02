/**
 * VoiceMode Interface
 * 
 * Complete hands-free voice conversation experience.
 * - Large central microphone orb
 * - Automatic TTS → ASR → Processing loop
 * - Live transcript and SOCRATES display
 * - Error recovery
 * - Exit/mode switch buttons
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
  Loader2,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "ai" | "patient";
  content: string;
  timestamp: string;
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

  // Voice state management
  const [voiceState, setVoiceState] = useState<VoiceState>("IDLE");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(interviewMessages);
  const [currentQuestion, setCurrentQuestion] = useState(activeInterviewQuestion);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [completionHandled, setCompletionHandled] = useState(false);

  const voiceControllerRef = useRef<VoiceInteractionController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const isProcessingRef = useRef(false);
  const lastFinalTranscriptRef = useRef<string>("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add message to chat
  const addMessage = useCallback(
    (role: "ai" | "patient", content: string) => {
      const newMsg: ChatMessage = {
        id: `${Date.now()}-${Math.random()}`,
        role,
        content,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => {
        const next = [...prev, newMsg];
        setInterviewMessages(next);
        return next;
      });
    },
    [setInterviewMessages]
  );

  // Process patient response through clinical engine
  const processPatientResponse = useCallback(
    async (transcript: string) => {
      const normalizedTranscript = transcript.trim();
      if (!normalizedTranscript) return;
      if (isProcessingRef.current) {
        console.warn("[VOICE] duplicate answer submission blocked:", normalizedTranscript);
        return;
      }
      if (lastFinalTranscriptRef.current === normalizedTranscript) {
        console.warn("[VOICE] repeated final transcript suppressed:", normalizedTranscript);
        return;
      }
      const isLikelyQuestionEcho = currentQuestion && normalizedTranscript.toLowerCase() === currentQuestion.toLowerCase();
      if (isLikelyQuestionEcho) {
        console.warn("[VOICE] transcript matched the spoken question; ignoring probable echo:", normalizedTranscript);
        return;
      }
      lastFinalTranscriptRef.current = normalizedTranscript;
      isProcessingRef.current = true;
      setIsProcessing(true);

      try {
        console.log("[VOICE] ANSWER_SUBMIT", { transcript: normalizedTranscript, question: currentQuestion });
        const aiService = getAiService();
        const result = await aiService.processAnswer?.(
          transcript,
          currentQuestion,
          clinicalState,
          {
            language,
            targetField: activeInterviewTargetField || undefined,
          }
        ) ?? {
          updatedState: clinicalState,
          nextQuestion: null,
          providerStatus: "LOCAL" as const,
        };

        // Update clinical state
        updateClinicalState(result.updatedState);
        setSOCRATES(toLegacySocrates(result.updatedState));
        setChiefComplaint(result.updatedState.chiefComplaint || chiefComplaint);

        // Check if interview is complete
        if (!result.nextQuestion || result.nextQuestion.targetField === "complete") {
          const completionMsg =
            result.nextQuestion?.question ||
            "Thank you. Your medical history is complete.";
          addMessage("ai", completionMsg);
          setInterviewComplete(true);
          if (voiceControllerRef.current) {
            voiceControllerRef.current.markCompleted();
          }
          setCompletionHandled(true);
          return;
        }

        // Move to next question
        setCurrentQuestion(result.nextQuestion.question);
        setInterviewProgress(result.nextQuestion.question, result.nextQuestion.targetField);
        addMessage("ai", result.nextQuestion.question);

        // Signal controller to handle next question
        if (voiceControllerRef.current) {
          await voiceControllerRef.current.markProcessingComplete();
          await voiceControllerRef.current.handleNextQuestion(
            result.nextQuestion.question
          );
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Failed to process response";
        addMessage("ai", `Sorry, there was an error: ${errorMsg}`);
        setErrorMessage(errorMsg);

        // Recover by going back to question ready
        if (voiceControllerRef.current) {
          await voiceControllerRef.current.markProcessingComplete();
        }
      } finally {
        lastFinalTranscriptRef.current = "";
        isProcessingRef.current = false;
        setIsProcessing(false);
      }
    },
    [
      currentQuestion,
      clinicalState,
      language,
      activeInterviewTargetField,
      updateClinicalState,
      setChiefComplaint,
      chiefComplaint,
      addMessage,
      setInterviewComplete,
      setInterviewProgress,
      setSOCRATES,
    ]
  );

  // Initialize voice mode
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initializeVoiceMode = async () => {
      const asrService = getAsrService();
      const ttsService = getTtsService();

      const controller = new VoiceInteractionController(asrService, ttsService, {
        language,
        onStateChange: setVoiceState,
        onTranscript: (text, isFinal) => {
          setInterimTranscript(text);
          if (isFinal) {
            const normalized = text.trim();
            if (!normalized) return;
            if (lastFinalTranscriptRef.current === normalized || isProcessingRef.current) {
              console.warn("[VOICE] final transcript ignored as duplicate:", normalized);
              return;
            }
            lastFinalTranscriptRef.current = normalized;
            addMessage("patient", normalized);
            void processPatientResponse(normalized);
          }
        },
        onError: (error) => {
          setErrorMessage(error);
          addMessage("ai", error);
        },
      });

      voiceControllerRef.current = controller;

      // Start with first question if available
      const startQuestion = currentQuestion || "What brings you in today?";
      lastFinalTranscriptRef.current = "";
      if (!messages.length) {
        addMessage("ai", startQuestion);
      }

      // Start voice interaction
      await controller.startVoice(startQuestion);
    };

    initializeVoiceMode();

    return () => {
      initialized.current = false;
      if (voiceControllerRef.current) {
        voiceControllerRef.current.cleanup();
      }
    };
  }, []);

  // Switch to Touch mode
  const switchToTouchMode = () => {
    if (voiceControllerRef.current) {
      voiceControllerRef.current.stopVoice();
      voiceControllerRef.current.cleanup();
    }
    setInputMode("touch");
    // Interview component will handle re-rendering with touch mode
  };

  // Exit voice
  const handleExit = () => {
    if (voiceControllerRef.current) {
      voiceControllerRef.current.cleanup();
    }
    navigate(-1);
  };

  const answeredCount = socratesOrder.filter(
    (field) => clinicalState[field as keyof ClinicalState]
  ).length;

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
                  <CardTitle className="text-lg" style={{ fontFamily: "Georgia, serif" }}>
                    Voice Interview
                  </CardTitle>
                  <span className="text-xs font-semibold text-vintage-blue">
                    {answeredCount}/9 SOCRATES
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto px-4 pb-4 space-y-6 flex flex-col">
                {/* Voice Orb - Main Interface */}
                <div className="flex-1 flex items-center justify-center">
                  <VoiceOrb
                    state={voiceState}
                    isActive={voiceState !== "IDLE" && voiceState !== "COMPLETED"}
                    interimTranscript={interimTranscript}
                  />
                </div>

                {/* Messages */}
                <div className="max-h-[200px] overflow-y-auto space-y-2">
                  {messages.slice(-5).map((msg) => (
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
                  <Button
                    variant="ghost"
                    onClick={handleExit}
                  >
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
                <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
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
                    <p className="text-sm text-foreground mt-1">{chiefComplaint}</p>
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
                        {Array.isArray(value) ? value.join(", ") : String(value)}
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
