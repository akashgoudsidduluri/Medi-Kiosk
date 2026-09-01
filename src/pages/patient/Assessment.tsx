import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatientStore } from "@/store/patientStore";
import { Header } from "@/components/shared/Header";
import { StepProgress } from "@/components/shared/StepProgress";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { ayushService } from "@/services/ayushService";
import {
  ArrowRight,
  ArrowLeft,
  Leaf,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function Assessment() {
  const navigate = useNavigate();
  const { ayush, setAYUSH, setStep } = usePatientStore();
  const parameters = ayushService.getParameterOptions();
  const [expandedParam, setExpandedParam] = useState<string | null>(
    parameters.find((p) => !ayush[p.id as keyof typeof ayush])?.id || null
  );

  const validation = useMemo(() => ayushService.validateAssessment(ayush), [ayush]);

  const handleSelect = (paramId: string, value: string) => {
    setAYUSH({ [paramId]: value });
    // Auto-expand next unanswered parameter
    const currentIndex = parameters.findIndex((p) => p.id === paramId);
    const nextUnanswered = parameters
      .slice(currentIndex + 1)
      .find((p) => !ayush[p.id as keyof typeof ayush]);
    if (nextUnanswered) {
      setExpandedParam(nextUnanswered.id);
    }
  };

  return (
    <div className="min-h-screen vintage-texture">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <StepProgress
            currentStep="ayush"
            completedSteps={["login", "consent", "interview"]}
          />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="vintage-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-vintage-gold/10 flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-vintage-gold" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
                      AYUSH Assessment
                    </h1>
                    <p className="text-xs text-muted-foreground">
                      Dashavidha Pariksha (10-Fold Examination)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-vintage-gold" style={{ fontFamily: "Georgia, serif" }}>
                    {validation.completedCount}/{validation.totalCount}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Parameters
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="w-full h-2.5 bg-border rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-vintage-gold to-vintage-green rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${validation.completionPercentage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {validation.completionPercentage}% complete
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Parameter Cards */}
        <div className="space-y-3">
          {parameters.map((param, index) => {
            const value = ayush[param.id as keyof typeof ayush];
            const isExpanded = expandedParam === param.id;
            const isComplete = !!value;

            return (
              <motion.div
                key={param.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`vintage-card transition-all ${
                    isComplete
                      ? "border-vintage-green/30"
                      : isExpanded
                        ? "border-vintage-gold/30"
                        : ""
                  }`}
                >
                  <button
                    className="w-full text-left"
                    onClick={() =>
                      setExpandedParam(isExpanded ? null : param.id)
                    }
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              isComplete
                                ? "bg-vintage-green text-white"
                                : "bg-vintage-gold/10 text-vintage-gold"
                            }`}
                          >
                            {isComplete ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                              {param.name}
                              <span className="text-muted-foreground ml-2 text-xs font-normal">
                                {param.sanskrit}
                              </span>
                            </CardTitle>
                            <p className="text-[10px] text-muted-foreground">
                              {param.description}
                            </p>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardContent className="pt-0 pb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {param.options.map((option) => (
                            <button
                              key={option.value}
                              className={`p-3 rounded-lg border text-left text-sm transition-all ${
                                value === option.value
                                  ? "bg-vintage-gold/10 border-vintage-gold/30 text-foreground font-medium"
                                  : "bg-muted/30 border-border hover:border-vintage-gold/20 text-muted-foreground hover:text-foreground"
                              }`}
                              onClick={() => handleSelect(param.id, option.value)}
                            >
                              <div className="flex items-center gap-2">
                                {value === option.value && (
                                  <Check className="w-4 h-4 text-vintage-gold flex-shrink-0" />
                                )}
                                <span>{option.label}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Safety Note */}
        <div className="mt-6">
          <DisclaimerBanner
            type="simulated"
            message="AYUSH parameters are for clinical documentation. This system does not generate diagnoses from these assessments."
          />
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between pb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/patient/interview")}
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </Button>

          <Button
            className="bg-vintage-blue hover:bg-vintage-blue/90"
            disabled={!validation.isComplete}
            onClick={() => {
              setStep("documents");
              navigate("/patient/document");
            }}
          >
            Continue to Documents
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
