import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { usePatientStore } from "@/store/patientStore";
import { Header } from "@/components/shared/Header";
import { StepProgress } from "@/components/shared/StepProgress";
import { ShieldAlert, ArrowRight, ShieldCheck, FileText, Lock } from "lucide-react";

export default function Consent() {
  const navigate = useNavigate();
  const { setConsent, setStep } = usePatientStore();

  const handleConsent = () => {
    setConsent(true);
    setStep("language");
    navigate("/patient/language");
  };

  return (
    <div className="min-h-screen vintage-texture flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <StepProgress currentStep="consent" completedSteps={["login"]} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col"
        >
          <Card className="vintage-card flex-1">
            <CardHeader className="text-center pt-8 pb-4">
              <div className="mx-auto w-14 h-14 rounded-xl bg-vintage-blue/10 flex items-center justify-center mb-4">
                <ShieldAlert className="w-7 h-7 text-vintage-blue" />
              </div>
              <CardTitle className="text-2xl" style={{ fontFamily: "Georgia, serif" }}>
                Patient Consent
              </CardTitle>
              <CardDescription>
                Please review how we handle your health information.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-4">
                
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-vintage-teal/10 p-1.5 rounded-lg text-vintage-teal">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Data Collection</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      We collect your clinical history, symptoms, and uploaded medical documents to create a structured pre-consultation summary.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-vintage-blue/10 p-1.5 rounded-lg text-vintage-blue">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Doctor Verification Required</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      This AI system does <strong>not</strong> provide medical diagnoses. All information collected will be reviewed and verified by your consulting doctor.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-vintage-gold/10 p-1.5 rounded-lg text-vintage-gold">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Data Privacy (Demo)</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      For this prototype demonstration, your data is stored locally on this device and is not shared with external health registries.
                    </p>
                  </div>
                </div>

              </div>
            </CardContent>

            <CardFooter className="flex-col gap-3 pb-8">
              <Button
                className="w-full h-12 text-base bg-vintage-blue hover:bg-vintage-blue/90"
                onClick={handleConsent}
              >
                I Understand & Agree
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                className="w-full text-sm text-muted-foreground"
                onClick={() => navigate("/")}
              >
                Decline & Exit
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
