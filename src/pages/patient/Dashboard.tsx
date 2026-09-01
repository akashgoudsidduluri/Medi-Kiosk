import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePatientStore } from "@/store/patientStore";
import { Header } from "@/components/shared/Header";
import { StepProgress } from "@/components/shared/StepProgress";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { demoScenarios, languages } from "@/data/demoData";
import {
  User,
  Globe,
  FileCheck,
  ArrowRight,
  Loader2,
  ChevronDown,
  Check,
  AlertTriangle,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const store = usePatientStore();
  const [step, setStep] = useState<"details" | "language" | "consent" | "scenario">("details");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [consentGiven, setConsentGiven] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age || !gender) return;
    store.setPatient({ name, age: parseInt(age), gender });
    setStep("language");
  };

  const handleLanguageSubmit = () => {
    store.setLanguage(selectedLanguage);
    setStep("consent");
  };

  const handleConsentSubmit = () => {
    if (!consentGiven) return;
    store.setConsent(true);
    setStep("scenario");
  };

  const handleScenarioSelect = async (scenarioKey: string) => {
    setSelectedScenario(scenarioKey);
    setIsLoading(true);

    const scenario = demoScenarios[scenarioKey];
    store.setPatient({
      name: scenario.patient.name,
      age: scenario.patient.age,
      gender: scenario.patient.gender,
      language: scenario.patient.language,
      mobileNumber: scenario.patient.mobileNumber,
      abhaId: scenario.patient.abhaId,
      chiefComplaint: scenario.chiefComplaint,
      socrates: scenario.socrates,
      ayush: scenario.ayush,
      documents: scenario.documents,
      timeline: scenario.timeline,
      triage: scenario.triage,
      interviewComplete: true,
      ayushComplete: true,
    });

    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    navigate("/patient/interview");
  };

  return (
    <div className="min-h-screen vintage-texture">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <StepProgress
            currentStep={
              step === "details"
                ? "login"
                : step === "language"
                  ? "consent"
                  : step === "consent"
                    ? "consent"
                    : "interview"
            }
            completedSteps={["login"]}
          />
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Step: Patient Details */}
          {step === "details" && (
            <Card className="vintage-card">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-vintage-blue/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-vintage-blue" />
                  </div>
                  <div>
                    <CardTitle className="text-lg" style={{ fontFamily: "Georgia, serif" }}>
                      Patient Details
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">Basic information for this session</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDetailsSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
                    <Input
                      placeholder="Enter patient name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Age</label>
                      <Input
                        type="number"
                        placeholder="Age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="h-11"
                        min={1}
                        max={120}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Gender</label>
                      <div className="flex gap-2">
                        {["Male", "Female", "Other"].map((g) => (
                          <Button
                            key={g}
                            type="button"
                            variant={gender === g ? "default" : "outline"}
                            className={`flex-1 h-11 text-sm ${
                              gender === g ? "bg-vintage-blue text-white" : ""
                            }`}
                            onClick={() => setGender(g)}
                          >
                            {g}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DisclaimerBanner type="demo" />
                  <Button
                    type="submit"
                    className="w-full h-12 text-base bg-vintage-blue hover:bg-vintage-blue/90"
                    disabled={!name || !age || !gender}
                  >
                    Continue
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step: Language Selection */}
          {step === "language" && (
            <Card className="vintage-card">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-vintage-teal/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-vintage-teal" />
                  </div>
                  <div>
                    <CardTitle className="text-lg" style={{ fontFamily: "Georgia, serif" }}>
                      Language Selection
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">Choose your preferred language for interaction</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {languages.map((lang) => (
                    <Button
                      key={lang.code}
                      variant={selectedLanguage === lang.name ? "default" : "outline"}
                      className={`h-auto py-3 flex-col gap-1 ${
                        selectedLanguage === lang.name
                          ? "bg-vintage-teal text-white border-vintage-teal"
                          : ""
                      }`}
                      onClick={() => setSelectedLanguage(lang.name)}
                    >
                      <span className="text-sm font-medium">{lang.native}</span>
                      <span className="text-[10px] opacity-70">{lang.name}</span>
                    </Button>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-vintage-gold/5 border border-vintage-gold/20">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-vintage-gold">Bhashini ASR — Simulated</span>
                    {" "}Speech recognition powered by Bhashini/AI4Bharat (demo mode)
                  </p>
                </div>
                <Button
                  className="w-full h-12 text-base mt-6 bg-vintage-blue hover:bg-vintage-blue/90"
                  onClick={handleLanguageSubmit}
                >
                  Continue with {selectedLanguage}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step: Consent */}
          {step === "consent" && (
            <Card className="vintage-card">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-vintage-gold/10 flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-vintage-gold" />
                  </div>
                  <div>
                    <CardTitle className="text-lg" style={{ fontFamily: "Georgia, serif" }}>
                      Consent & Privacy
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">Please review and accept before proceeding</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-parchment border border-border space-y-3">
                  <p className="text-sm text-foreground leading-relaxed">
                    By proceeding, you consent to:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-vintage-green mt-0.5 flex-shrink-0" />
                      <span>Collection of your health information for pre-consultation assessment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-vintage-green mt-0.5 flex-shrink-0" />
                      <span>Voice recording for speech-to-text processing (not retained after session)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-vintage-green mt-0.5 flex-shrink-0" />
                      <span>AI-assisted analysis to prepare a clinical summary for your doctor</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-vintage-green mt-0.5 flex-shrink-0" />
                      <span>Sharing the structured case sheet with your consulting physician</span>
                    </li>
                  </ul>
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground italic">
                      Your voice is used only for this assessment. This prototype does not retain raw voice recordings.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <label htmlFor="consent" className="text-sm text-foreground cursor-pointer">
                    I have read and understood the above. I consent to proceed.
                  </label>
                </div>

                <DisclaimerBanner type="warning" />

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-12"
                    onClick={() => setStep("language")}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 h-12 text-base bg-vintage-blue hover:bg-vintage-blue/90"
                    disabled={!consentGiven}
                    onClick={handleConsentSubmit}
                  >
                    I Agree
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step: Demo Scenario */}
          {step === "scenario" && (
            <Card className="vintage-card">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-vintage-blue/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-vintage-blue" />
                  </div>
                  <div>
                    <CardTitle className="text-lg" style={{ fontFamily: "Georgia, serif" }}>
                      Select Demo Scenario
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Choose a pre-configured scenario for the demonstration
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    key: "routine",
                    label: "Routine",
                    description: "Mild joint pain — No red flags detected",
                    icon: CheckCircle,
                    color: "routine-green",
                    borderColor: "border-routine-green/30",
                    bgColor: "bg-routine-green/5",
                  },
                  {
                    key: "priority",
                    label: "Priority",
                    description: "Abdominal discomfort — Worsening symptoms, requires evaluation",
                    icon: Clock,
                    color: "priority-amber",
                    borderColor: "border-priority-amber/30",
                    bgColor: "bg-priority-amber/5",
                  },
                  {
                    key: "urgent",
                    label: "Urgent",
                    description: "Chest pain with breathlessness — Potential red-flag indicators",
                    icon: AlertTriangle,
                    color: "urgent-red",
                    borderColor: "border-urgent-red/30",
                    bgColor: "bg-urgent-red/5",
                  },
                ].map((scenario) => (
                  <button
                    key={scenario.key}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                      selectedScenario === scenario.key
                        ? `${scenario.borderColor} ${scenario.bgColor}`
                        : "border-border hover:border-border/80 bg-white"
                    }`}
                    onClick={() => handleScenarioSelect(scenario.key)}
                    disabled={isLoading}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        scenario.key === "routine"
                          ? "bg-routine-green/10 text-routine-green"
                          : scenario.key === "priority"
                            ? "bg-priority-amber/10 text-priority-amber"
                            : "bg-urgent-red/10 text-urgent-red"
                      }`}>
                        <scenario.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold text-sm ${
                          scenario.key === "routine"
                            ? "text-routine-green"
                            : scenario.key === "priority"
                              ? "text-priority-amber"
                              : "text-urgent-red"
                        }`}>
                          {scenario.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {scenario.description}
                        </p>
                      </div>
                      {isLoading && selectedScenario === scenario.key ? (
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                ))}

                <DisclaimerBanner
                  type="simulated"
                  message="Demo scenarios populate pre-configured patient data for demonstration purposes."
                />
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
