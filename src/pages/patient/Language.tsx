import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { usePatientStore } from "@/store/patientStore";
import { Header } from "@/components/shared/Header";
import { StepProgress } from "@/components/shared/StepProgress";
import { Languages, ArrowRight, Check } from "lucide-react";
import { demoLanguages } from "@/data/demoData";

export default function Language() {
  const navigate = useNavigate();
  const { language, setLanguage, setStep } = usePatientStore();

  const handleContinue = () => {
    if (!language) return;
    setStep("inputMode");
    navigate("/patient/input-mode");
  };

  return (
    <div className="min-h-screen vintage-texture flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <StepProgress currentStep="language" completedSteps={["login", "consent"]} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col"
        >
          <Card className="vintage-card flex-1">
            <CardHeader className="text-center pt-8 pb-4">
              <div className="mx-auto w-14 h-14 rounded-xl bg-vintage-teal/10 flex items-center justify-center mb-4">
                <Languages className="w-7 h-7 text-vintage-teal" />
              </div>
              <CardTitle className="text-2xl" style={{ fontFamily: "Georgia, serif" }}>
                Select Language
              </CardTitle>
              <CardDescription>
                Choose your preferred language for the interview.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {demoLanguages.map((lang) => {
                  const isSelected = language === lang.name;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.name)}
                      className={`relative p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 min-h-[100px] ${
                        isSelected
                          ? "border-vintage-blue bg-vintage-blue/5 shadow-sm"
                          : "border-border bg-white hover:border-vintage-blue/30 hover:bg-muted/30"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <Check className="w-4 h-4 text-vintage-blue" />
                        </div>
                      )}
                      <span className="text-2xl font-bold text-foreground">
                        {lang.nativeName}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {lang.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-6 flex justify-end">
                <Button
                  className="h-12 px-8 text-base bg-vintage-blue hover:bg-vintage-blue/90"
                  onClick={handleContinue}
                  disabled={!language}
                >
                  Continue
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
