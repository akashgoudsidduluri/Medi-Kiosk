import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { usePatientStore } from "@/store/patientStore";
import { Header } from "@/components/shared/Header";
import { StepProgress } from "@/components/shared/StepProgress";
import { Mic, Touchpad, ArrowRight, ArrowLeft } from "lucide-react";

export default function InputMode() {
  const navigate = useNavigate();
  const { inputMode, setInputMode, setStep } = usePatientStore();

  const handleContinue = () => {
    if (!inputMode) return;
    setStep("interview");
    navigate("/patient/interview");
  };

  return (
    <div className="min-h-screen vintage-texture flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <StepProgress currentStep="inputMode" completedSteps={["login", "consent", "language"]} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col"
        >
          <Card className="vintage-card flex-1">
            <CardHeader className="text-center pt-8 pb-4">
              <CardTitle className="text-2xl" style={{ fontFamily: "Georgia, serif" }}>
                How would you like to answer?
              </CardTitle>
              <CardDescription>
                Select your preferred interaction mode.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setInputMode("voice")}
                  className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-4 text-center ${
                    inputMode === "voice"
                      ? "border-vintage-blue bg-vintage-blue/5 shadow-sm"
                      : "border-border bg-white hover:border-vintage-blue/30 hover:bg-muted/30"
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    inputMode === "voice" ? "bg-vintage-blue text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    <Mic className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">Voice</h3>
                    <p className="text-sm text-muted-foreground mt-1">Speak your answers naturally</p>
                  </div>
                </button>

                <button
                  onClick={() => setInputMode("touch")}
                  className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-4 text-center ${
                    inputMode === "touch"
                      ? "border-vintage-blue bg-vintage-blue/5 shadow-sm"
                      : "border-border bg-white hover:border-vintage-blue/30 hover:bg-muted/30"
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    inputMode === "touch" ? "bg-vintage-blue text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    <Touchpad className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">Touch</h3>
                    <p className="text-sm text-muted-foreground mt-1">Tap to select options and type</p>
                  </div>
                </button>
              </div>

              <div className="flex items-center justify-between mt-8 pt-8 border-t border-border">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back
                </Button>
                <Button
                  className="bg-vintage-blue hover:bg-vintage-blue/90 min-w-[140px]"
                  onClick={handleContinue}
                  disabled={!inputMode}
                >
                  Continue
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
