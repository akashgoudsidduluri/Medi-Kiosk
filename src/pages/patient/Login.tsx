import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { usePatientStore } from "@/store/patientStore";
import { Header } from "@/components/shared/Header";
import { Phone, ArrowRight, Loader2, Shield, Activity } from "lucide-react";

export default function PatientLogin() {
  const navigate = useNavigate();
  const { setPatient } = usePatientStore();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    setStep("otp");
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== "123456") {
      setError("Invalid OTP. Use 123456 for demo.");
      setOtp("");
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    // Set demo patient data
    setPatient({
      id: `patient-${Date.now()}`,
      name: "",
      mobileNumber: phone,
      isAuthenticated: true,
      isDoctor: false,
      abhaId: `ABHA-DEMO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    });

    setIsLoading(false);
    navigate("/patient/consent"); // Mandatory: consent before assessment
  };

  return (
    <div className="min-h-screen vintage-texture">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="vintage-card">
            <CardHeader className="text-center pt-8">
              <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-vintage-blue to-vintage-teal flex items-center justify-center mb-4">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl" style={{ fontFamily: "Georgia, serif" }}>
                Patient Check-in
              </CardTitle>
              <CardDescription>
                {step === "phone"
                  ? "Enter your mobile number to begin"
                  : `We sent a code to ${phone}`}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 pb-6">
              {step === "phone" ? (
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                        setError("");
                      }}
                      className="pl-10 text-base h-12"
                      maxLength={10}
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base bg-vintage-blue hover:bg-vintage-blue/90"
                    disabled={isLoading || phone.length < 10}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Send OTP
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="flex justify-center">
                    <InputOTP
                      value={otp}
                      onChange={(v) => {
                        setOtp(v);
                        setError("");
                      }}
                      maxLength={6}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && otp.length === 6) {
                          handleOtpSubmit(e as React.FormEvent);
                        }
                      }}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot key={i} index={i} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {error && (
                    <p className="text-sm text-destructive text-center">{error}</p>
                  )}
                  <p className="text-xs text-muted-foreground text-center">
                    Demo OTP: <span className="font-mono font-bold">123456</span>
                  </p>
                  <Button
                    type="submit"
                    className="w-full h-12 text-base bg-vintage-blue hover:bg-vintage-blue/90"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Verify & Continue
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={() => {
                      setStep("phone");
                      setOtp("");
                      setError("");
                    }}
                  >
                    Change mobile number
                  </Button>
                </form>
              )}

              {/* ABHA Demo Note */}
              <div className="mt-6 p-3 rounded-lg bg-vintage-teal/5 border border-vintage-teal/20">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-vintage-teal mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-vintage-teal">
                      ABHA Linked — Demo
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      After authentication, a simulated ABHA identifier will be assigned for this session.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
