import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Checkbox } from "@/components/ui/checkbox";
import { usePatientStore } from "@/store/patientStore";
import { Header } from "@/components/shared/Header";
import { getAuthService } from "@/services/auth";
import { Phone, FileText, IdCard, ArrowRight, Loader2, Shield, AlertCircle, CheckCircle } from "lucide-react";

type AuthMethod = "select" | "aadhaar" | "abha" | "mobile";
type AuthStep = "method" | "request" | "verify" | "success";

export default function PatientLogin() {
  const navigate = useNavigate();
  const { loginPatient } = usePatientStore();
  const authService = getAuthService();

  // Flow state
  const [method, setMethod] = useState<AuthMethod>("select");
  const [step, setStep] = useState<AuthStep>("method");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Aadhaar flow
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarConsent, setAadhaarConsent] = useState(false);
  const [aadhaarOtp, setAadhaarOtp] = useState("");

  // ABHA flow
  const [abhaNumber, setAbhaNumber] = useState("");

  // Mobile flow
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");

  // ────────────────────────────────────────────────────────────────
  // AADHAAR FLOW
  // ────────────────────────────────────────────────────────────────

  const handleAadhaarRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aadhaarNumber || aadhaarNumber.length < 4 || !aadhaarConsent) {
      setError("Please enter Aadhaar number and consent");
      return;
    }
    setIsLoading(true);
    setError("");
    const result = await authService.requestAadhaarOtp({
      aadhaarNumber,
      consentGiven: aadhaarConsent,
    });
    setIsLoading(false);
    if (result.success) {
      setStep("verify");
    } else {
      setError(result.error || "Failed to request OTP");
    }
  };

  const handleAadhaarVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aadhaarOtp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }
    setIsLoading(true);
    setError("");
    const result = await authService.verifyAadhaarOtp({
      aadhaarNumber,
      otp: aadhaarOtp,
    });
    setIsLoading(false);
    if (result.success && result.identity) {
      loginPatient(result.identity, { isAuthenticated: true });
      setStep("success");
      setTimeout(() => navigate("/patient/dashboard"), 1200);
    } else {
      setError(result.error || "OTP verification failed");
    }
  };

  // ────────────────────────────────────────────────────────────────
  // ABHA FLOW
  // ────────────────────────────────────────────────────────────────

  const handleAbhaLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!abhaNumber || abhaNumber.length < 4) {
      setError("Please enter a valid ABHA number");
      return;
    }
    setIsLoading(true);
    setError("");
    const result = await authService.loginWithAbha({ abhaNumber });
    setIsLoading(false);
    if (result.success && result.identity) {
      loginPatient(result.identity, { isAuthenticated: true });
      setStep("success");
      setTimeout(() => navigate("/patient/dashboard"), 1200);
    } else {
      setError(result.error || "ABHA verification failed");
    }
  };

  // ────────────────────────────────────────────────────────────────
  // MOBILE OTP FLOW
  // ────────────────────────────────────────────────────────────────

  const handleMobileRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setIsLoading(true);
    setError("");
    const result = await authService.requestMobileOtp({ mobileNumber });
    setIsLoading(false);
    if (result.success) {
      setStep("verify");
    } else {
      setError(result.error || "Failed to request OTP");
    }
  };

  const handleMobileVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileOtp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }
    setIsLoading(true);
    setError("");
    const result = await authService.verifyMobileOtp({
      mobileNumber,
      otp: mobileOtp,
    });
    setIsLoading(false);
    if (result.success && result.identity) {
      loginPatient(result.identity, { isAuthenticated: true });
      setStep("success");
      setTimeout(() => navigate("/patient/dashboard"), 1200);
    } else {
      setError(result.error || "OTP verification failed");
    }
  };

  // ────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen vintage-texture">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          {/* METHOD SELECTION */}
          {step === "method" && (
            <Card className="vintage-card">
              <CardHeader className="text-center pt-8">
                <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-vintage-blue to-vintage-teal flex items-center justify-center mb-4">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl" style={{ fontFamily: "Georgia, serif" }}>
                  Patient Login
                </CardTitle>
                <CardDescription>
                  Choose your preferred authentication method
                </CardDescription>
              </CardHeader>

              <CardContent className="px-6 pb-6">
                <div className="space-y-3">
                  {/* Aadhaar Option */}
                  <button
                    onClick={() => {
                      setMethod("aadhaar");
                      setStep("request");
                      setError("");
                    }}
                    className="w-full p-4 border-2 border-border rounded-lg hover:border-vintage-blue hover:bg-vintage-blue/5 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-vintage-blue/10 flex items-center justify-center group-hover:bg-vintage-blue/20">
                        <IdCard className="w-5 h-5 text-vintage-blue" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-foreground">Continue with Aadhaar</p>
                        <p className="text-xs text-muted-foreground">
                          Verified identity for healthcare
                        </p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-vintage-blue/10 text-vintage-blue font-semibold inline-block mt-1">
                          DEMO MODE
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-vintage-blue ml-auto mt-1" />
                    </div>
                  </button>

                  {/* ABHA Option */}
                  <button
                    onClick={() => {
                      setMethod("abha");
                      setStep("request");
                      setError("");
                    }}
                    className="w-full p-4 border-2 border-border rounded-lg hover:border-vintage-teal hover:bg-vintage-teal/5 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-vintage-teal/10 flex items-center justify-center group-hover:bg-vintage-teal/20">
                        <Shield className="w-5 h-5 text-vintage-teal" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-foreground">Continue with ABHA</p>
                        <p className="text-xs text-muted-foreground">
                          National health identity
                        </p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-vintage-teal/10 text-vintage-teal font-semibold inline-block mt-1">
                          DEMO MODE
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-vintage-teal ml-auto mt-1" />
                    </div>
                  </button>

                  {/* Mobile OTP Option */}
                  <button
                    onClick={() => {
                      setMethod("mobile");
                      setStep("request");
                      setError("");
                    }}
                    className="w-full p-4 border-2 border-border rounded-lg hover:border-vintage-gold hover:bg-vintage-gold/5 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-vintage-gold/10 flex items-center justify-center group-hover:bg-vintage-gold/20">
                        <Phone className="w-5 h-5 text-vintage-gold" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-foreground">Continue with Mobile OTP</p>
                        <p className="text-xs text-muted-foreground">
                          Quick verification via SMS
                        </p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-vintage-gold/10 text-vintage-gold font-semibold inline-block mt-1">
                          DEMO MODE
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-vintage-gold ml-auto mt-1" />
                    </div>
                  </button>
                </div>

                {/* Demo Info */}
                <div className="mt-6 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/40">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                        Demo Authentication
                      </p>
                      <p className="text-[10px] text-amber-800 dark:text-amber-300 mt-0.5">
                        This is a simulation. No real OTP or identity verification is performed. Use demo OTP: <span className="font-mono font-bold">123456</span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AADHAAR FLOW */}
          {method === "aadhaar" && step === "request" && (
            <Card className="vintage-card">
              <CardHeader className="text-center pt-8">
                <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-vintage-blue to-blue-600 flex items-center justify-center mb-4">
                  <IdCard className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl" style={{ fontFamily: "Georgia, serif" }}>
                  Aadhaar Verification
                </CardTitle>
                <CardDescription>Enter your Aadhaar number (last 4 digits will not be stored)</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <form onSubmit={handleAadhaarRequest} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Aadhaar Number (12-digit)
                    </label>
                    <Input
                      placeholder="Enter 12-digit Aadhaar"
                      value={aadhaarNumber}
                      onChange={(e) => {
                        setAadhaarNumber(e.target.value.replace(/\D/g, "").slice(0, 12));
                        setError("");
                      }}
                      className="text-base h-12"
                      maxLength={12}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Only last 4 digits will be used for verification.
                    </p>
                  </div>

                  <div className="flex items-start gap-2 p-3 rounded-lg bg-parchment border border-border">
                    <Checkbox
                      checked={aadhaarConsent}
                      onCheckedChange={(checked) => {
                        setAadhaarConsent(checked as boolean);
                        setError("");
                      }}
                      id="aadhaar-consent"
                    />
                    <label htmlFor="aadhaar-consent" className="text-xs text-muted-foreground cursor-pointer">
                      I consent to identity verification for this healthcare service. My data will be used
                      only for this session.
                    </label>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 text-base bg-vintage-blue hover:bg-vintage-blue/90"
                    disabled={isLoading || !aadhaarNumber || aadhaarNumber.length < 4 || !aadhaarConsent}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Request OTP
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={() => {
                      setStep("method");
                      setMethod("select");
                      setAadhaarNumber("");
                      setAadhaarConsent(false);
                      setError("");
                    }}
                  >
                    Back
                  </Button>
                </form>

                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/40">
                  <p className="text-[10px] text-amber-900 dark:text-amber-200">
                    <span className="font-semibold">Demo Mode:</span> No real Aadhaar OTP will be sent.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {method === "aadhaar" && step === "verify" && (
            <Card className="vintage-card">
              <CardHeader className="text-center pt-8">
                <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-vintage-blue to-blue-600 flex items-center justify-center mb-4">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl" style={{ fontFamily: "Georgia, serif" }}>
                  Verify OTP
                </CardTitle>
                <CardDescription>
                  Enter the 6-digit code (demo: 123456)
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <form onSubmit={handleAadhaarVerify} className="space-y-4">
                  <div className="flex justify-center">
                    <InputOTP
                      value={aadhaarOtp}
                      onChange={(v) => {
                        setAadhaarOtp(v);
                        setError("");
                      }}
                      maxLength={6}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && aadhaarOtp.length === 6) {
                          handleAadhaarVerify(e as any);
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
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground text-center">
                    Demo OTP: <span className="font-mono font-bold">123456</span>
                  </p>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base bg-vintage-blue hover:bg-vintage-blue/90"
                    disabled={isLoading || aadhaarOtp.length !== 6}
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
                      setStep("request");
                      setAadhaarOtp("");
                      setError("");
                    }}
                  >
                    Back
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* ABHA FLOW */}
          {method === "abha" && step === "request" && (
            <Card className="vintage-card">
              <CardHeader className="text-center pt-8">
                <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-vintage-teal to-teal-600 flex items-center justify-center mb-4">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl" style={{ fontFamily: "Georgia, serif" }}>
                  ABHA Login
                </CardTitle>
                <CardDescription>Enter your ABHA number or ABHA address</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <form onSubmit={handleAbhaLogin} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      ABHA Number / Address
                    </label>
                    <Input
                      placeholder="ABHA-XXXX-XXXX-XXXX or abhaaddress@abha"
                      value={abhaNumber}
                      onChange={(e) => {
                        setAbhaNumber(e.target.value);
                        setError("");
                      }}
                      className="text-base h-12"
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 text-base bg-vintage-teal hover:bg-vintage-teal/90"
                    disabled={isLoading || !abhaNumber || abhaNumber.length < 4}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Verify ABHA
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={() => {
                      setStep("method");
                      setMethod("select");
                      setAbhaNumber("");
                      setError("");
                    }}
                  >
                    Back
                  </Button>
                </form>

                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/40">
                  <p className="text-[10px] text-amber-900 dark:text-amber-200">
                    <span className="font-semibold">Demo Mode:</span> ABHA verification is simulated locally.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* MOBILE FLOW */}
          {method === "mobile" && step === "request" && (
            <Card className="vintage-card">
              <CardHeader className="text-center pt-8">
                <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-vintage-gold to-yellow-600 flex items-center justify-center mb-4">
                  <Phone className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl" style={{ fontFamily: "Georgia, serif" }}>
                  Mobile OTP
                </CardTitle>
                <CardDescription>Enter your 10-digit mobile number</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <form onSubmit={handleMobileRequest} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Mobile Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={mobileNumber}
                      onChange={(e) => {
                        setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10));
                        setError("");
                      }}
                      className="text-base h-12"
                      maxLength={10}
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 text-base bg-vintage-gold hover:bg-vintage-gold/90"
                    disabled={isLoading || mobileNumber.length < 10}
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

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={() => {
                      setStep("method");
                      setMethod("select");
                      setMobileNumber("");
                      setError("");
                    }}
                  >
                    Back
                  </Button>
                </form>

                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/40">
                  <p className="text-[10px] text-amber-900 dark:text-amber-200">
                    <span className="font-semibold">Demo Mode:</span> No real SMS OTP will be sent.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {method === "mobile" && step === "verify" && (
            <Card className="vintage-card">
              <CardHeader className="text-center pt-8">
                <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-vintage-gold to-yellow-600 flex items-center justify-center mb-4">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl" style={{ fontFamily: "Georgia, serif" }}>
                  Verify OTP
                </CardTitle>
                <CardDescription>
                  Enter the 6-digit code (demo: 123456)
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <form onSubmit={handleMobileVerify} className="space-y-4">
                  <div className="flex justify-center">
                    <InputOTP
                      value={mobileOtp}
                      onChange={(v) => {
                        setMobileOtp(v);
                        setError("");
                      }}
                      maxLength={6}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && mobileOtp.length === 6) {
                          handleMobileVerify(e as any);
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
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground text-center">
                    Demo OTP: <span className="font-mono font-bold">123456</span>
                  </p>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base bg-vintage-gold hover:bg-vintage-gold/90"
                    disabled={isLoading || mobileOtp.length !== 6}
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
                      setStep("request");
                      setMobileOtp("");
                      setError("");
                    }}
                  >
                    Back
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* SUCCESS STATE */}
          {step === "success" && (
            <Card className="vintage-card">
              <CardContent className="px-6 py-12 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-vintage-green/10 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-vintage-green" />
                </div>
                <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
                  Identity Verified
                </h2>
                <p className="text-sm text-muted-foreground">
                  Welcome! Your authentication is complete. Redirecting to your dashboard...
                </p>
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-2 border-vintage-green border-t-transparent rounded-full animate-spin" />
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
