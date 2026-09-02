import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePatientStore } from "@/store/patientStore";
import { Header } from "@/components/shared/Header";
import { StepProgress } from "@/components/shared/StepProgress";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { getAsrService, getTtsService, getAiService } from "@/services/serviceRegistry";
import { ClinicalState, defaultClinicalState, SOCRATESResponse } from "@/types";
import { interviewGreeting, placeholderText, clarificationMessage, getFieldLabel, fieldDescription } from "@/services/ai/interviewI18n";
import {
  Mic,
  MicOff,
  Send,
  ArrowRight,
  ArrowLeft,
  Bot,
  User,
  Loader2,
  Volume2,
  FileText,
  AlertCircle,
  Touchpad,
  Hand,
} from "lucide-react";

const socratesLabels: Record<string, { label: string; description: string }> = {
  site: { label: "Site", description: "Where is the problem?" },
  onset: { label: "Onset", description: "When did it start?" },
  character: { label: "Character", description: "What does it feel like?" },
  radiation: { label: "Radiation", description: "Does it spread?" },
  associatedSymptoms: { label: "Associated Symptoms", description: "Any other symptoms?" },
  timing: { label: "Timing", description: "When does it happen?" },
  exacerbatingFactors: { label: "Exacerbating Factors", description: "What makes it worse?" },
  relievingFactors: { label: "Relieving Factors", description: "What makes it better?" },
  severity: { label: "Severity", description: "How bad is it?" },
};

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

const toClinicalState = (complaint: string, legacy: Partial<SOCRATESResponse> = {}): ClinicalState => {
  const base = defaultClinicalState();
  const severityValue = legacy.severity ? Number.parseFloat(String(legacy.severity).replace(/[^\d.]/g, "")) : null;

  return {
    ...base,
    chiefComplaint: complaint || "",
    site: legacy.site || undefined,
    onset: legacy.onset || undefined,
    duration: legacy.duration || undefined,
    character: legacy.character || undefined,
    radiation: legacy.radiation || undefined,
    severity: Number.isFinite(severityValue) ? severityValue : null,
    associatedSymptoms: legacy.associatedSymptoms
      ? legacy.associatedSymptoms
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      : [],
    timing: legacy.timing || undefined,
    aggravatingFactors: legacy.exacerbatingFactors || undefined,
    relievingFactors: legacy.relievingFactors || undefined,
  };
};

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

export default function Interview() {
  const navigate = useNavigate();
  const { chiefComplaint, socrates, setSOCRATES, setChiefComplaint, setStep, interviewComplete, setInterviewComplete, inputMode, setInputMode, clinicalState, updateClinicalState, language, activeAssessmentId, assessmentStatus, activeInterviewQuestion, activeInterviewTargetField, interviewMessages, setInterviewProgress, setInterviewMessages } = usePatientStore();
  const [messages, setMessages] = useState<ChatMessage[]>(interviewMessages);
  const [completionHandled, setCompletionHandled] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(activeInterviewQuestion);
  const [currentTargetField, setCurrentTargetField] = useState<string | undefined>(activeInterviewTargetField ?? (interviewComplete ? undefined : "chiefComplaint"));
  const [phase, setPhase] = useState<"complaint" | "interview" | "complete">(
    interviewComplete ? "complete" : activeAssessmentId && assessmentStatus === "in-progress" && clinicalState.chiefComplaint ? "interview" : "complaint"
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with greeting
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
  }, [language]);

  const addMessage = (role: "ai" | "patient", content: string) => {
    const newMsg = {
      id: `${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date().toISOString(),
    };
    const updated = [...messages, newMsg];
    setMessages(updated);
    setInterviewMessages(updated);
  };

  const markInterviewComplete = (messageText: string) => {
    if (completionHandled || phase === "complete") return;
    setCompletionHandled(true);
    setInterviewComplete(true);
    setInterviewProgress("", null);
    setPhase("complete");
    addMessage("ai", messageText);
  };

  const handleVoiceInput = async () => {
    const asrService = getAsrService();

    if (isListening) {
      setIsListening(false);
      asrService.stopListening();
      return;
    }

    if (inputMode !== "voice") {
      setInputMode("voice");
    }

    setIsListening(true);
    addMessage("patient", "🎙️ Listening...");
    
    // We expect the language store to have the selected language, defaulting to English
    const asrLanguage = usePatientStore.getState().language || "English";

    asrService.startListening(asrLanguage, (result) => {
      if (result.isFinal) {
        setIsListening(false);
        setIsProcessing(true);
        
        // Replace the "Listening..." message with the actual transcript
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.role === "patient" && lastMsg.content === "🎙️ Listening...") {
            lastMsg.content = result.text;
          } else {
             newMessages.push({
              id: `${Date.now()}-${Math.random()}`,
              role: "patient",
              content: result.text,
              timestamp: new Date().toISOString(),
            });
          }
          return newMessages;
        });

        // Process the final text
        handlePatientResponse(result.text).catch((error) => {
          addMessage("ai", error instanceof Error ? error.message : clarificationMessage(language));
        }).finally(() => setIsProcessing(false));
      } else {
        // Update the interim transcript
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.role === "patient" && lastMsg.content.includes("Listening")) {
            lastMsg.content = result.text + " (Listening...)";
          }
          return newMessages;
        });
      }
    });
  };

  const handlePatientResponse = async (text: string) => {
    await processAnswer(text, phase === "complaint" ? "chiefComplaint" : undefined);
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    const value = inputValue.trim();
    addMessage("patient", value);
    setInputValue(""); // Clear immediately
    
    setIsProcessing(true);
    try {
      await handlePatientResponse(value);
    } catch (error) {
      addMessage("ai", error instanceof Error ? error.message : clarificationMessage(language));
    } finally {
      setIsProcessing(false);
    }
  };

  const processAnswer = async (answer: string, targetFieldOverride?: string) => {
    setIsProcessing(true);

    const currentStore = usePatientStore.getState();
    const legacyState = toClinicalState(
      currentStore.chiefComplaint || currentStore.clinicalState.chiefComplaint || chiefComplaint || "",
      currentStore.socrates
    );
    const baseState = {
      ...currentStore.clinicalState,
      chiefComplaint:
        currentStore.clinicalState.chiefComplaint || currentStore.chiefComplaint || chiefComplaint || "",
      site: currentStore.clinicalState.site ?? legacyState.site,
      onset: currentStore.clinicalState.onset ?? legacyState.onset,
      duration: currentStore.clinicalState.duration ?? legacyState.duration,
      character: currentStore.clinicalState.character ?? legacyState.character,
      radiation: currentStore.clinicalState.radiation ?? legacyState.radiation,
      severity: currentStore.clinicalState.severity ?? legacyState.severity,
      associatedSymptoms:
        currentStore.clinicalState.associatedSymptoms.length > 0
          ? currentStore.clinicalState.associatedSymptoms
          : legacyState.associatedSymptoms,
      timing: currentStore.clinicalState.timing ?? legacyState.timing,
      aggravatingFactors:
        currentStore.clinicalState.aggravatingFactors ?? legacyState.aggravatingFactors,
      relievingFactors:
        currentStore.clinicalState.relievingFactors ?? legacyState.relievingFactors,
    };

    const aiService = getAiService();
    const result = await aiService.processAnswer?.(
      answer,
      currentQuestion,
      baseState,
      {
        language: usePatientStore.getState().language || "English",
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
    setChiefComplaint(nextState.chiefComplaint ?? chiefComplaint ?? "");

    if (result.nextQuestion?.targetField === "complete" || !result.nextQuestion) {
      const completionMessage = result.nextQuestion?.question || "Thank you. I have gathered the information needed for your doctor. Please proceed to the next step.";
      markInterviewComplete(completionMessage);
      setCurrentQuestion("");
      setCurrentTargetField(undefined);
      setIsProcessing(false);
      return;
    }

    const nextTargetField = result.nextQuestion.targetField;
    setCurrentQuestion(result.nextQuestion.question);
    setCurrentTargetField(nextTargetField);
    setInterviewProgress(result.nextQuestion.question, nextTargetField);
    setPhase(nextTargetField === "chiefComplaint" ? "complaint" : "interview");
    addMessage("ai", result.nextQuestion.question);

    if (inputMode === "voice") {
      const ttsService = getTtsService();
      ttsService.speak(result.nextQuestion.question, usePatientStore.getState().language || "English");
    }

    setIsProcessing(false);
  };

  const generateFollowUp = async (complaint: string, currentState: ClinicalState) => {
    const aiService = getAiService();
    const nextQ = await aiService.getNextQuestion(
      { ...socrates, chiefComplaint: complaint },
      complaint,
      currentState,
      usePatientStore.getState().language || "English"
    );

    setCurrentQuestion(nextQ.question);
    setCurrentTargetField(nextQ.targetField);

    if (nextQ.targetField === "complete") {
      markInterviewComplete(nextQ.question);
      return;
    }

    addMessage("ai", nextQ.question);

    if (inputMode === "voice") {
      const ttsService = getTtsService();
      ttsService.speak(nextQ.question, usePatientStore.getState().language || "English");
    }
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
                      <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                        Clinical Interview
                      </CardTitle>
                      <p className="text-[10px] text-muted-foreground">
                        Local clinical interview
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-vintage-blue">
                    {answeredCount}/9 SOCRATES
                  </span>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto px-4 pb-2 space-y-3">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === "ai" ? "justify-start" : "justify-end"}`}
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
                          <p className="text-sm leading-relaxed">{msg.content}</p>
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
                      isListening ? "bg-urgent-red hover:bg-urgent-red/90 animate-pulse" : ""
                    }`}
                    onClick={handleVoiceInput}
                    disabled={isProcessing}
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
                    placeholder={placeholderText(phase === "complete" ? "interview" : phase, language)}
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

                {/* Simulated voice button fallback */}
                {phase !== "complete" && (
                  <div className="mt-2 rounded-md border border-dashed border-vintage-blue/20 bg-vintage-blue/5 px-3 py-2 text-[11px] text-muted-foreground">
                    Local interview engine active: answers are processed through the clinical planner and fallback AI service.
                  </div>
                )}

                {isListening && (
                  <div className="mt-3 flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-1 bg-vintage-blue rounded-full waveform-bar"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-2">Listening...</span>
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
                    <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
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
                  const value = socrates[field as keyof typeof socrates];
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
                          {isActive ? (language === "Hindi" ? "उत्तर की प्रतीक्षा है..." : language === "Telugu" ? "సమాధానం కోసం వేచి ఉంది..." : "Awaiting response...") : fieldDescription(field, language)}
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
                      animate={{ width: `${(answeredCount / 9) * 100}%` }}
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
