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

export default function Interview() {
  const navigate = useNavigate();
  const { chiefComplaint, socrates, setSOCRATES, setChiefComplaint, setStep, interviewComplete, setPatient, inputMode, setInputMode } = usePatientStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [phase, setPhase] = useState<"complaint" | "interview" | "complete">(
    interviewComplete ? "complete" : chiefComplaint ? "interview" : "complaint"
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
        content: `Namaste! I'm your pre-consultation assistant. I'll help prepare a comprehensive case sheet for your doctor. Let's start with your main concern. What brings you here today?`,
        timestamp: new Date().toISOString(),
      };
      setMessages([greeting]);
    }
  }, [messages.length]);

  const addMessage = (role: "ai" | "patient", content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        role,
        content,
        timestamp: new Date().toISOString(),
      },
    ]);
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
        handlePatientResponse(result.text).finally(() => setIsProcessing(false));
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
    if (phase === "complaint") {
      setChiefComplaint(text);
      setPhase("interview");
      await generateFollowUp(text, socrates);
    } else {
      await processAnswer(text);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    const value = inputValue.trim();
    setInputValue("");
    addMessage("patient", value);
    
    setIsProcessing(true);
    await handlePatientResponse(value);
    setIsProcessing(false);
  };

  const processAnswer = async (answer: string) => {
    setIsProcessing(true);

    // Determine which SOCRATES field to fill
    const answeredFields = socratesOrder.filter(
      (field) => socrates[field as keyof typeof socrates]
    );
    const currentField = socratesOrder[answeredFields.length];

    if (currentField) {
      setSOCRATES({ [currentField]: answer });
      const updatedSocrates = { ...socrates, [currentField]: answer };

      // Check if all fields are filled
      const allFilled = socratesOrder.every(
        (f) => updatedSocrates[f as keyof typeof updatedSocrates]
      );

      if (allFilled) {
        setPhase("complete");
        addMessage(
          "ai",
          "Excellent! I've completed the SOCRATES assessment. Your clinical interview is now complete. Let's proceed to the AYUSH assessment."
        );
        setIsProcessing(false);
        return;
      }

      await generateFollowUp(chiefComplaint, updatedSocrates);
    }

    setIsProcessing(false);
  };

  const generateFollowUp = async (complaint: string, currentSocrates: Record<string, string>) => {
    const aiService = getAiService();
    const nextQ = await aiService.getNextQuestion(currentSocrates as any, complaint);
    
    setCurrentQuestion(nextQ.question);
    addMessage("ai", nextQ.question);
    
    // Auto-speak if input mode is voice
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
                        AI Model: Llama-3 — Simulated
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
                    placeholder={
                      phase === "complaint"
                        ? "Describe your main symptom..."
                        : "Type your answer..."
                    }
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-xs text-muted-foreground"
                    onClick={async () => {
                      setIsProcessing(true);
                      const responses: Record<string, string> = {
                        chest: "The pain is in the center of my chest, feeling like a heavy pressure. It started suddenly this morning. It spreads to my left arm. I also feel breathless and sweaty.",
                        stomach: "The pain is in my upper abdomen, especially after eating. It's been about 3 months. It feels heavy and cramping. I also have bloating and nausea.",
                        joint: "My right knee hurts. It started about 2 weeks ago. It's a dull ache, worse in the morning with stiffness. No swelling.",
                      };

                      const complaintLower = chiefComplaint?.toLowerCase() || "";
                      let response = "I've been having discomfort for a few days now. It's moderate severity, worse at certain times of the day.";
                      if (complaintLower.includes("chest")) response = responses.chest;
                      else if (complaintLower.includes("stomach") || complaintLower.includes("abdomen")) response = responses.stomach;
                      else if (complaintLower.includes("joint") || complaintLower.includes("knee")) response = responses.joint;

                      addMessage("patient", response);

                      // Fill all SOCRATES fields
                      const socratesData = complaintLower.includes("chest")
                        ? { site: "Retrosternal center", onset: "Sudden, this morning", character: "Heavy pressure", radiation: "Left arm", associatedSymptoms: "Breathlessness, sweating", timing: "Persistent", exacerbatingFactors: "Physical activity", relievingFactors: "None", severity: "7/10 — Significant" }
                        : complaintLower.includes("stomach")
                          ? { site: "Upper abdomen, epigastric", onset: "Gradual, 3 months", character: "Heavy, cramping", radiation: "No radiation", associatedSymptoms: "Bloating, nausea", timing: "After meals", exacerbatingFactors: "Spicy food, heavy meals", relievingFactors: "Antacids", severity: "6/10 — Moderate" }
                          : { site: "Right knee, medial", onset: "Gradual, 2 weeks", character: "Dull, aching", radiation: "No radiation", associatedSymptoms: "Morning stiffness", timing: "Worse in morning", exacerbatingFactors: "Prolonged sitting", relievingFactors: "Warm compress", severity: "3/10 — Mild" };

                      setSOCRATES(socratesData);
                      setPhase("complete");
                      addMessage("ai", "Thank you! I've recorded your complete SOCRATES assessment. Your clinical interview is now complete. Let's proceed to the AYUSH assessment.");
                      setIsProcessing(false);
                    }}
                  >
                    <Volume2 className="w-3 h-3 mr-1" />
                    Simulate Voice Response (Demo)
                  </Button>
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
                          {socratesLabels[field].label}
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
                          {isActive ? "Awaiting response..." : socratesLabels[field].description}
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
