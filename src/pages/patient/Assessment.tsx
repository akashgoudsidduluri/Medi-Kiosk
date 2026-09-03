import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePatientStore } from "@/store/patientStore";
import { Header } from "@/components/shared/Header";
import { StepProgress } from "@/components/shared/StepProgress";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { AYUSHRulebook } from "@/components/AYUSHRulebook";
import { ayushService } from "@/services/ayushService";
import { getParameter } from "@/lib/ayushRulebook";
import {
  ArrowRight,
  ArrowLeft,
  Leaf,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

export default function Assessment() {
  const navigate = useNavigate();
  const { ayush, setAYUSH, aharaVihara, setAharaVihara, language, setStep } = usePatientStore();
  const parameters = ayushService.getParameterOptions();
  const [expandedParam, setExpandedParam] = useState<string | null>(
    parameters.find((p) => !ayush[p.id as keyof typeof ayush])?.id || null
  );
  const [showAhara, setShowAhara] = useState(false);

  const validation = useMemo(() => ayushService.validateAssessment(ayush), [ayush]);
  const aharaFields = ["diet", "sleep", "bowelHabits", "dailyRoutine", "substances"] as const;
  const aharaComplete = aharaFields.every((field) => Boolean(aharaVihara[field]?.trim()));

  const localizedOptionLabel = (label: string) => {
    if (language === "English") return label;
    const dictionary = language === "Telugu"
      ? { Air: "గాలి", Space: "ఆకాశం", Fire: "అగ్ని", Water: "నీరు", Earth: "భూమి", Dual: "ద్వంద్వ", Balanced: "సమతుల్య", Predominant: "ప్రధాన", Imbalance: "అసమతుల్యత", Reduced: "తగ్గిన", Medium: "మధ్యస్థ", Strong: "బలమైన", Small: "చిన్న", Large: "పెద్ద", Full: "పూర్తి", Poor: "తక్కువ", Partial: "పాక్షిక", Dense: "దృఢమైన", Fine: "సూక్ష్మ", Lax: "వదులైన" }
      : { Air: "वायु", Space: "आकाश", Fire: "अग्नि", Water: "जल", Earth: "पृथ्वी", Dual: "द्वि", Balanced: "संतुलित", Predominant: "प्रमुख", Imbalance: "असंतुलन", Reduced: "कम", Medium: "मध्यम", Strong: "मज़बूत", Small: "छोटा", Large: "बड़ा", Full: "पूर्ण", Poor: "कम", Partial: "आंशिक", Dense: "घना", Fine: "सूक्ष्म", Lax: "ढीला" };
    const translated = Object.entries(dictionary).reduce((value, [english, regional]) => value.replace(new RegExp(`\\b${english}\\b`, "g"), regional), label);
    return `${label} (${translated})`;
  };

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
                <div className="flex flex-col items-end gap-2">
                  <div>
                    <p className="text-2xl font-bold text-vintage-gold" style={{ fontFamily: "Georgia, serif" }}>
                      {validation.completedCount}/{validation.totalCount}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Parameters
                    </p>
                  </div>
                  <AYUSHRulebook currentParameterId={expandedParam || undefined} language={language} />
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
                              {language !== "English" && <span className="text-muted-foreground ml-2 text-xs font-normal">
                                {param.id === "prakriti" ? (language === "Telugu" ? "ప్రకృతి" : "प्रकृति") :
                                  param.id === "vikriti" ? (language === "Telugu" ? "వికృతి" : "विकृति") :
                                  param.id === "sara" ? (language === "Telugu" ? "సారం" : "सार") :
                                  param.id === "samhanana" ? (language === "Telugu" ? "సంహననం" : "संहनन") :
                                  param.id === "pramana" ? (language === "Telugu" ? "ప్రమాణం" : "प्रमाण") :
                                  param.id === "satmya" ? (language === "Telugu" ? "సాత్మ్యం" : "सात्म्य") :
                                  param.id === "satva" ? (language === "Telugu" ? "సత్త్వం" : "सत्त्व") :
                                  param.id === "aharaShakti" ? (language === "Telugu" ? "ఆహార శక్తి" : "आहार शक्ति") :
                                  param.id === "vyayamaShakti" ? (language === "Telugu" ? "వ్యాయామ శక్తి" : "व्यायाम शक्ति") :
                                  (language === "Telugu" ? "వయస్సు" : "वय")}
                              </span>}
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
                        {/* Inline Rulebook Snippet */}
                        {(() => {
                          const ruleInfo = getParameter(param.id);
                          return ruleInfo ? (
                            <div className="mb-3 p-3 rounded-lg bg-vintage-gold/5 border border-vintage-gold/15 flex gap-2">
                              <Info className="w-3.5 h-3.5 text-vintage-gold mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                  {ruleInfo.description}
                                </p>
                                {ruleInfo.educationalContext && (
                                  <p className="text-[10px] text-muted-foreground/70 mt-1 leading-relaxed italic">
                                    {ruleInfo.educationalContext}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : null;
                        })()}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {param.options.map((option) => {
                            const ruleInfo = getParameter(param.id);
                            const ruleOption = ruleInfo?.options.find(
                              (o) => o.value.toLowerCase() === option.value.toLowerCase() ||
                                     o.label.toLowerCase().startsWith(option.label.split(" ")[0].toLowerCase())
                            );
                            return (
                              <button
                                key={option.value}
                                className={`p-3 rounded-lg border text-left text-sm transition-all ${
                                  value === option.value
                                    ? "bg-vintage-gold/10 border-vintage-gold/30 text-foreground font-medium"
                                    : "bg-muted/30 border-border hover:border-vintage-gold/20 text-muted-foreground hover:text-foreground"
                                }`}
                                onClick={() => handleSelect(param.id, option.value)}
                              >
                                <div className="flex items-start gap-2">
                                  {value === option.value && (
                                    <Check className="w-4 h-4 text-vintage-gold flex-shrink-0 mt-0.5" />
                                  )}
                                  <div className="min-w-0">
                                    <span className="block">{localizedOptionLabel(option.label)}</span>
                                    {ruleOption?.meaning && (
                                      <span className="block text-[10px] text-muted-foreground/70 mt-0.5 leading-relaxed font-normal">
                                        {ruleOption.meaning}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {showAhara && (
          <Card className="vintage-card mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Ahara-Vihara {language === "Telugu" ? "ఆహార-విహార" : language === "Hindi" ? "आहार-विहार" : ""}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {language === "Telugu" ? "మీ ఆహారం మరియు రోజువారీ అలవాట్లను నమోదు చేయండి." : language === "Hindi" ? "अपने भोजन और दैनिक आदतों के बारे में बताइए।" : "Record your diet and daily habits."}
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {aharaFields.map((field) => {
                const labels = {
                  diet: { English: "Diet / Ahara", Hindi: "आहार", Telugu: "ఆహారం" },
                  sleep: { English: "Sleep", Hindi: "नींद", Telugu: "నిద్ర" },
                  bowelHabits: { English: "Bowel habits", Hindi: "मल त्याग की आदतें", Telugu: "మల విసర్జన అలవాట్లు" },
                  dailyRoutine: { English: "Daily routine", Hindi: "दैनिक दिनचर्या", Telugu: "రోజువారీ దినచర్య" },
                  substances: { English: "Substances / lifestyle", Hindi: "नशीले पदार्थ / जीवनशैली", Telugu: "పదార్థాలు / జీవనశైలి" },
                };
                return <label key={field} className="text-xs font-medium text-foreground">{labels[field][language as "English" | "Hindi" | "Telugu"] || labels[field].English}<Input className="mt-1" value={aharaVihara[field] || ""} onChange={(e) => setAharaVihara({ [field]: e.target.value })} /></label>;
              })}
            </CardContent>
          </Card>
        )}

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
            disabled={!validation.isComplete || (showAhara && !aharaComplete)}
            onClick={() => {
              if (!showAhara) {
                setShowAhara(true);
                return;
              }
              setStep("documents");
              navigate("/patient/document");
            }}
          >
            {!showAhara ? (language === "Telugu" ? "ఆహార-విహారానికి కొనసాగండి" : language === "Hindi" ? "आहार-विहार पर जाएँ" : "Continue to Ahara-Vihara") : (language === "Telugu" ? "పత్రాలకు కొనసాగండి" : language === "Hindi" ? "दस्तावेज़ों पर जाएँ" : "Continue to Documents")}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
