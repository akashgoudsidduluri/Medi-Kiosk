import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Header } from "@/components/shared/Header";
import { usePatientStore } from "@/store/patientStore";
import { Stethoscope, ArrowRight, Loader2, Mail, UserX } from "lucide-react";

export default function DoctorLogin() {
  const navigate = useNavigate();
  const { setPatient } = usePatientStore();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
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
    setPatient({
      isDoctor: true,
      isAuthenticated: true,
    });
    setIsLoading(false);
    navigate("/doctor/dashboard");
  };

  return (
    <div className="min-h-screen vintage-texture">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="vintage-card">
            <CardHeader className="text-center pt-8">
              <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-vintage-blue to-vintage-teal flex items-center justify-center mb-4">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl" style={{ fontFamily: "Georgia, serif" }}>
                Doctor Login
              </CardTitle>
              <CardDescription>
                {step === "email"
                  ? "Enter your registered email"
                  : `Verification code sent to ${email}`}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 pb-6">
              {step === "email" ? (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="doctor@hospital.gov.in"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      className="pl-10 text-base h-12"
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base bg-vintage-blue hover:bg-vintage-blue/90"
                    disabled={isLoading || !email}
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
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                      setIsLoading(true);
                      await new Promise((r) => setTimeout(r, 500));
                      setPatient({ isDoctor: true, isAuthenticated: true });
                      setIsLoading(false);
                      navigate("/doctor/dashboard");
                    }}
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Quick Demo Login
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="flex justify-center">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                        setError("");
                      }}
                      placeholder="Enter 6-digit code"
                      className="w-full text-center text-2xl font-mono tracking-widest py-3 px-4 border border-input rounded-lg bg-background"
                      maxLength={6}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && otp.length === 6) {
                          handleOtpSubmit(e as React.FormEvent);
                        }
                      }}
                    />
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
                        Verify & Enter Dashboard
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={() => {
                      setStep("email");
                      setOtp("");
                      setError("");
                    }}
                  >
                    Use different email
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
