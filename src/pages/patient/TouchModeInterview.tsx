/**
 * TouchModeInterview.tsx - Text/Touch Interview Interface
 * 
 * Provides a traditional text-based interview experience with optional
 * microphone input and speaker buttons for question readback.
 * Designed for accessibility on touch and non-touch devices.
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePatientStore } from "@/store/patientStore";
import { Header } from "@/components/shared/Header";
import { StepProgress } from "@/components/shared/StepProgress";
import { SpeakerButton } from "@/components/voice/SpeakerButton";
import { getAsrService, getTtsService, getAiService } from "@/services/serviceRegistry";
import { ClinicalState, defaultClinicalState, SOCRATESResponse } from "@/types";
import {
  interviewGreeting,
  placeholderText,
  clarificationMessage,
  getFieldLabel,
  fieldDescription,
} from "@/services/ai/interviewI18n";
import {
  Mic,
  MicOff,
  Send,
  ArrowRight,
  ArrowLeft,
  Bot,
  User,
  Loader2,
  FileText,
} from "lucide-react";

// Constants
const socratesOrder = [
  "site",
  "onset",
  "character",
  "radiation",
  "associatedSymptoms",
  "timing",
  "exacerbatingFactors",
  "relievingFactors",
  "severity",
];

interface ChatMessage {
  id: string;
  role: "ai" | "patient";
  content: string;
  timestamp: string;
}

/**
 * Convert ClinicalState to legacy SOCRATES format
 */
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
  duration: state.duration ?? "",
});

/**
 * TouchModeInterview Component
 * 
 * Features:
 * - Text input for patient responses
 * - Optional microphone input for voice transcription
 * - Speaker buttons on AI messages for question readback
 * - Real-time SOCRATES field completion tracking
 * - Clinical state management and progression
 */
export default function TouchModeInterview() {
  const navigate = useNavigate();
  const {
    chiefComplaint,
    socrates,
    setSOCRATES,
    setChiefComplaint,
    setStep,
    interviewComplete,
    setInterviewComplete,
    clinicalState,
    updateClinicalState,
    language,
    activeInterviewQuestion,
    activeInterviewTargetField,
    interviewMessages,
    setInterviewProgress,
    setInterviewMessages,
  } = usePatientStore();

  // State management
  const [messages, setMessages] = useState<ChatMessage[]>(interviewMessages);
  const [completionHandled, setCompletionHandled] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(
    activeInterviewQuestion
  );
  const [currentTargetField, setCurrentTargetField] = useState<
    string | undefined
  >(
    activeInterviewTargetField ??
      (interviewComplete ? undefined : "chiefComplaint")
  );
  const [phase, setPhase] = useState<"complaint" | "interview" | "complete">(
    interviewComplete
      ? "complete"
      : clinicalState.chiefComplaint
        ? "interview"
        : "complaint"
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with greeting if empty
  useEffect(() => {
    if (messages.length === 0) {
      const greeting: ChatMessage = {
        id: "greeting",
        role: "ai",
        content: interviewGreeting(language),
        timestamp: new Date().toISOString(),
      };
      setMessages([greeting]);
      setInterviewMessages([greeting]);
      if (!interviewComplete) setInterviewProgress("", "chiefComplaint");
    }
  }, [language, interviewComplete]);

  /**
   * Add a message to the conversation
   */
  const addMessage = (role: "ai" | "patient", content: string) => {
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
  };

  /**
   * Mark interview as complete and add final message
   */
  const markInterviewComplete = (messageText: string) => {
    if (completionHandled || phase === "complete") return;
    setCompletionHandled(true);
    setInterviewComplete(true);
    setInterviewProgress("", null);
    setPhase("complete");
    addMessage("ai", messageText);
  };

  /**
   * Handle voice input (microphone transcription)
   */
  const handleVoiceInput = async () => {
    const asrService = getAsrService();

    if (!asrService.isSupported()) {
      addMessage("ai", "Speech recognition is not supported in this browser. Please use Chrome/Edge or Touch input.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      asrService.stopListening();
      return;
    }

    setIsListening(true);

    const asrLanguage = language || "English";

    asrService.startListening(asrLanguage, (result) => {
      if (result.isFinal) {
        setIsListening(false);
        setInputValue(result.text);
      }
    });
  };

  /**
   * Handle text form submission
   */
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    const value = inputValue.trim();
    addMessage("patient", value);
    setInputValue("");

    setIsProcessing(true);
    try {
      await processAnswer(
        value,
        phase === "complaint" ? "chiefComplaint" : undefined
      );
    } catch (error) {
      addMessage(
        "ai",
        error instanceof Error
          ? error.message
          : clarificationMessage(language)
      );
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Process patient answer through clinical engine
   */
  const processAnswer = async (
    answer: string,
    targetFieldOverride?: string
  ) => {
    setIsProcessing(true);

    const currentStore = usePatientStore.getState();
    const baseState = {
      ...currentStore.clinicalState,
      chiefComplaint:
        currentStore.clinicalState.chiefComplaint ||
        currentStore.chiefComplaint ||
        chiefComplaint ||
        "",
    };

    const aiService = getAiService();
    const result = await aiService.processAnswer?.(
      answer,
      currentQuestion,
      baseState,
      {
        language: language || "English",
        targetField: targetFieldOverride ?? currentTargetField,
      }
    ) ?? {
      updatedState: baseState,
      nextQuestion: null,
      providerStatus: "LOCAL" as const,
    };

    const nextState = result.updatedState;
    updateClinicalState(nextState);
    setSOCRATES(toLegacySocrates(nextState));
    setChiefComplaint(
      nextState.chiefComplaint ?? chiefComplaint ?? ""
    );

    // Check for completion
    if (
      result.nextQuestion?.targetField === "complete" ||
      !result.nextQuestion
    ) {
      const completionMessage =
        result.nextQuestion?.question ||
        "Thank you. I have gathered the information needed for your doctor. Please proceed to the next step.";
      markInterviewComplete(completionMessage);
      setCurrentQuestion("");
      setCurrentTargetField(undefined);
      setIsProcessing(false);
      return;
    }

    // Move to next question
    const nextTargetField = result.nextQuestion.targetField;
    setCurrentQuestion(result.nextQuestion.question);
    setCurrentTargetField(nextTargetField);
    setInterviewProgress(
      result.nextQuestion.question,
      nextTargetField
    );
    setPhase(nextTargetField === "chiefComplaint" ? "complaint" : "interview");
    addMessage("ai", result.nextQuestion.question);

    setIsProcessing(false);
  };

  const answeredCount = socratesOrder.filter(
    (field) => socrates[field as keyof typeof socrates]
  ).length;

  return (
    <div className="min-h-screen vintage-texture flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 py-4">
        {/* Progress */}
        <div className="mb-4">
          <StepProgress
            currentStep="interview"
            completedSteps={["login", "consent", "language"]}
          />
        </div>

        {/* Two-panel layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-0">
          {/* Left: AI Conversation */}
          <div className="lg:col-span-3 flex flex-col">
            <Card className="vintage-card flex-1 flex flex-col min-h-[500px]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-vintage-blue/10 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-vintage-blue" />
                    </div>
                    <div>
                      <CardTitle
                        className="text-sm"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        Clinical Interview
                      </CardTitle>
                      <p className="text-[10px] text-muted-foreground">
                        Touch Mode Interview
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-vintage-blue">
                    {answeredCount}/9 SOCRATES
                  </span>
                </div>
              </CardHeader>

              {/* Messages with Speaker Buttons */}
              <CardContent className="flex-1 overflow-y-auto px-4 pb-2 space-y-3">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        msg.role === "ai" ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-xl px-4 py-3 ${
                          msg.role === "ai"
                            ? "bg-vintage-blue/5 border border-vintage-blue/10 text-foreground"
                            : "bg-vintage-teal/10 border border-vintage-teal/20 text-foreground"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {msg.role === "ai" ? (
                            <Bot className="w-4 h-4 text-vintage-blue mt-0.5 flex-shrink-0" />
                          ) : (
                            <User className="w-4 h-4 text-vintage-teal mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm leading-relaxed">
                              {msg.content}
                            </p>
                            {/* Speaker button for AI questions */}
                            {msg.role === "ai" && msg.content && (
                              <div className="mt-2">
                                <SpeakerButton
                                  text={msg.content}
                                  language={language}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={isListening ? "default" : "outline"}
                    size="icon"
                    className={`flex-shrink-0 ${
                      isListening
                        ? "bg-urgent-red hover:bg-urgent-red/90 animate-pulse"
                        : ""
                    }`}
                    onClick={handleVoiceInput}
                    disabled={isProcessing}
                    title={isListening ? "Stop listening" : "Start listening"}
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </Button>
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={placeholderText(
                      phase === "complete" ? "interview" : phase,
                      language
                    )}
                    disabled={isProcessing}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="flex-shrink-0 bg-vintage-blue hover:bg-vintage-blue/90"
                    disabled={!inputValue.trim() || isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>

                {isListening && (
                  <div className="mt-3 flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-1 bg-vintage-blue rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-2">
                      Listening...
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right: Case Information Panel */}
          <div className="lg:col-span-2 flex flex-col">
            <Card className="vintage-card flex-1 flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-vintage-teal/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-vintage-teal" />
                  </div>
                  <div>
                    <CardTitle
                      className="text-sm"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      Live Case Information
                    </CardTitle>
                    <p className="text-[10px] text-muted-foreground">
                      Extracted in real-time
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
                {/* Chief Complaint */}
                {chiefComplaint && (
                  <div className="p-3 rounded-lg bg-vintage-blue/5 border border-vintage-blue/10">
                    <p className="text-[10px] font-bold text-vintage-blue uppercase tracking-wider mb-1">
                      Chief Complaint
                    </p>
                    <p className="text-sm text-foreground">{chiefComplaint}</p>
                  </div>
                )}

                {/* SOCRATES fields */}
                {socratesOrder.map((field) => {
                  const value =
                    socrates[field as keyof typeof socrates];
                  const isActive = !value && phase === "interview";
                  return (
                    <div
                      key={field}
                      className={`p-3 rounded-lg border transition-all ${
                        value
                          ? "bg-vintage-teal/5 border-vintage-teal/20"
                          : isActive
                            ? "bg-vintage-gold/5 border-vintage-gold/20 animate-pulse"
                            : "bg-muted/50 border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {getFieldLabel(field, language)}
                        </p>
                        {value && (
                          <span className="text-[10px] text-vintage-green font-semibold">
                            ✓
                          </span>
                        )}
                      </div>
                      {value ? (
                        <p className="text-sm text-foreground">{value}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          {isActive
                            ? language === "Hindi"
                              ? "उत्तर की प्रतीक्षा है..."
                              : language === "Telugu"
                                ? "సమాధానం కోసం వేచి ఉంది..."
                                : "Awaiting response..."
                            : fieldDescription(field, language)}
                        </p>
                      )}
                    </div>
                  );
                })}

                {/* Completeness indicator */}
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-foreground">
                      SOCRATES Completeness
                    </p>
                    <p className="text-xs font-bold text-vintage-blue">
                      {answeredCount}/9
                    </p>
                  </div>
                  <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-vintage-blue to-vintage-teal rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(answeredCount / 9) * 100}%`,
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate("/patient/dashboard")}
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </Button>

          {phase === "complete" && (
            <Button
              className="bg-vintage-blue hover:bg-vintage-blue/90"
              onClick={() => {
                setStep("ayush");
                navigate("/patient/assessment");
              }}
            >
              Continue to AYUSH Assessment
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
