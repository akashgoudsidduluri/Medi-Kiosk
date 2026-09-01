import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatientStore } from "@/store/patientStore";
import { Header } from "@/components/shared/Header";
import { StepProgress } from "@/components/shared/StepProgress";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { triageService, type Explainability } from "@/services/triageService";
import {
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Brain,
  ChevronRight,
} from "lucide-react";

export default function Triage() {
  const navigate = useNavigate();
  const { chiefComplaint, socrates, age, timeline, documents, triage, setTriage, setStep } =
    usePatientStore();
  const [isAnalyzing, setIsAnalyzing] = useState(!triage);
  const [explainability, setExplainability] = useState<Explainability | null>(null);

  useEffect(() => {
    if (!triage) {
      runTriage();
    }
  }, []);

  const runTriage = async () => {
    setIsAnalyzing(true);

    const result = await triageService.assessPriority({
      chiefComplaint,
      severity: socrates.severity,
      onset: socrates.onset,
      associatedSymptoms: socrates.associatedSymptoms,
      socrates,
      age,
      documents: documents.map((d: { extractedData: Record<string, string> }) => ({ extractedData: d.extractedData })),
      timeline: timeline.map((t: { description: string }) => ({ description: t.description })),
    });

    setTriage(result);
    const explanation = await triageService.explainPriority(result);
    setExplainability(explanation);
    setIsAnalyzing(false);
  };

  const priorityConfig = {
    routine: {
      icon: CheckCircle,
      color: "text-routine-green",
      bg: "bg-routine-green/10",
      border: "border-routine-green/20",
    },
    priority: {
      icon: Clock,
      color: "text-priority-amber",
      bg: "bg-priority-amber/10",
      border: "border-priority-amber/20",
    },
    urgent: {
      icon: AlertTriangle,
      color: "text-urgent-red",
      bg: "bg-urgent-red/10",
      border: "border-urgent-red/20",
    },
  };

  return (
    <div className="min-h-screen vintage-texture">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <StepProgress
            currentStep="triage"
            completedSteps={["login", "consent", "interview", "ayush", "documents", "timeline"]}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-vintage-blue/10 flex items-center justify-center">
              <Brain className="w-6 h-6 text-vintage-blue" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
                AI-Assisted Triage
              </h1>
              <p className="text-xs text-muted-foreground">
                Rule-based priority assessment — AI Response (Simulated)
              </p>
            </div>
          </div>

          {/* Analyzing State */}
          {isAnalyzing && (
            <Card className="vintage-card">
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 text-vintage-blue animate-spin" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Analyzing Clinical Data...</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Running rule-based triage engine
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {["Severity", "Duration", "History", "Red Flags"].map((step, i) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.3 }}
                        className="text-[10px] text-muted-foreground px-2 py-1 rounded-full bg-muted"
                      >
                        {step}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Result */}
          {triage && !isAnalyzing && (
            <>
              {/* Priority Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className={`vintage-card ${priorityConfig[triage.priority].border} border-2`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const config = priorityConfig[triage.priority];
                          const Icon = config.icon;
                          return (
                            <>
                              <div className={`w-14 h-14 rounded-xl ${config.bg} flex items-center justify-center`}>
                                <Icon className={`w-7 h-7 ${config.color}`} />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                  Priority Assessment
                                </p>
                                <h2 className={`text-2xl font-bold ${config.color}`} style={{ fontFamily: "Georgia, serif" }}>
                                  {triage.priority.toUpperCase()}
                                </h2>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      <PriorityBadge priority={triage.priority} size="lg" />
                    </div>

                    {/* Reasons */}
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Why this priority?
                      </p>
                      {triage.reasons.map((reason: string, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-2"
                        >
                          <ChevronRight className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                            triage.priority === "urgent"
                              ? "text-urgent-red"
                              : triage.priority === "priority"
                                ? "text-priority-amber"
                                : "text-routine-green"
                          }`} />
                          <span className="text-sm text-foreground">{reason}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Confidence */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">AI Confidence</p>
                        <p className="text-sm font-bold text-vintage-blue">
                          {Math.round(triage.confidence * 100)}% — Simulated
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Explainability */}
              {explainability && (
                <Card className="vintage-card">
                  <CardHeader>
                    <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                      Explainable AI — Factor Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {explainability.factors.map((factor, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          factor.detected ? "bg-vintage-teal/5 border border-vintage-teal/20" : "bg-muted/50 border border-border"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          factor.detected ? "bg-vintage-teal/10 text-vintage-teal" : "bg-muted text-muted-foreground"
                        }`}>
                          {factor.detected ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <span className="text-xs">—</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{factor.factor}</p>
                          <p className="text-[10px] text-muted-foreground">{factor.description}</p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase ${
                          factor.impact === "high"
                            ? "text-urgent-red"
                            : factor.impact === "medium"
                              ? "text-priority-amber"
                              : "text-muted-foreground"
                        }`}>
                          {factor.impact}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <DisclaimerBanner
                type="ai-generated"
                message="AI-assisted priority recommendation. The doctor retains final clinical decision authority."
              />
            </>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between pb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/patient/timeline")}
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </Button>

          {!isAnalyzing && triage && (
            <Button
              className="bg-vintage-blue hover:bg-vintage-blue/90"
              onClick={() => {
                setStep("casesheet");
                navigate("/patient/casesheet");
              }}
            >
              View Case Sheet
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
