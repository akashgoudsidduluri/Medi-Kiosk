import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { usePatientStore } from "@/store/patientStore";
import { Header } from "@/components/shared/Header";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { getFhirService, getAbdmService } from "@/services/serviceRegistry";
import { type FHIRBundle } from "@/types";
import {
  ArrowLeft,
  User,
  Stethoscope,
  Brain,
  Leaf,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit3,
  ArrowRight,
  Link2,
  Loader2,
  ChevronRight,
  Shield,
  Activity,
} from "lucide-react";

const socratesLabels: Record<string, string> = {
  site: "Site",
  onset: "Onset",
  character: "Character",
  radiation: "Radiation",
  associatedSymptoms: "Associated Symptoms",
  timing: "Timing",
  exacerbatingFactors: "Exacerbating Factors",
  relievingFactors: "Relieving Factors",
  severity: "Severity",
};

export default function PatientDetail() {
  const navigate = useNavigate();
  const store = usePatientStore();
  const {
    name,
    age,
    gender,
    language,
    abhaId,
    chiefComplaint,
    socrates,
    ayush,
    documents,
    timeline,
    triage,
    verification,
    setVerification,
  } = store;

  const [overrideReason, setOverrideReason] = useState("");
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [fhirBundle, setFhirBundle] = useState<FHIRBundle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [abdmResult, setAbdmResult] = useState<string | null>(null);

  const handleVerify = (action: "confirmed" | "edited" | "rejected") => {
    if (action === "edited") {
      setShowOverrideForm(true);
      return;
    }
    setVerification({
      status: action,
      verifiedAt: new Date().toISOString(),
    });
  };

  const handleOverride = () => {
    setVerification({
      status: "edited",
      overridePriority: triage?.priority === "urgent" ? "priority" : triage?.priority === "priority" ? "routine" : "priority",
      overrideReason,
      verifiedAt: new Date().toISOString(),
    });
    setShowOverrideForm(false);
    setOverrideReason("");
  };

  const handleGenerateFHIR = async () => {
    setIsGenerating(true);
    const fhirServiceInstance = getFhirService();
    const bundle = await fhirServiceInstance.generateBundle({
      patient: { id: name || "demo", name: name || "Demo Patient", age: age || 40, gender: gender || "Male", abhaId: abhaId || "DEMO-ABHA", mobileNumber: store.mobileNumber },
      chiefComplaint: chiefComplaint || "Demo complaint",
      socrates,
      ayush,
      triage: triage || { priority: "routine", reasons: [] },
      documents: documents.map((d: { extractedData: Record<string, string> }) => ({ extractedData: d.extractedData })),
    });
    setFhirBundle(bundle);
    setIsGenerating(false);
  };

  const handleABDMPush = async () => {
    if (!fhirBundle) return;
    setIsGenerating(true);
    const abdmService = getAbdmService();
    const result = await abdmService.pushHealthRecord(fhirBundle);
    setAbdmResult(result.message);
    setIsGenerating(false);
  };

  const answeredSOCRATES = Object.entries(socrates).filter(([_, v]) => v);
  const answeredAYUSH = Object.entries(ayush).filter(([_, v]) => v);

  return (
    <div className="min-h-screen vintage-texture">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/doctor/dashboard")}
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Queue
          </Button>

          {/* Patient Header */}
          <Card className="vintage-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-vintage-blue/10 flex items-center justify-center">
                    <User className="w-7 h-7 text-vintage-blue" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
                      {name || "Patient"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {age ? `${age}y, ${gender}` : ""} • {language} • ABHA: {abhaId || "—"}
                    </p>
                    <p className="text-sm text-foreground mt-1 font-medium">
                      Chief Complaint: {chiefComplaint || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <PriorityBadge priority={(triage?.priority as any) || "routine"} />
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${
                    verification.status === "confirmed"
                      ? "bg-routine-green/10 text-routine-green"
                      : verification.status === "edited"
                        ? "bg-priority-amber/10 text-priority-amber"
                        : verification.status === "rejected"
                          ? "bg-urgent-red/10 text-urgent-red"
                          : "bg-muted text-muted-foreground"
                  }`}>
                    {verification.status}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* SOCRATES */}
              <Card className="vintage-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-vintage-teal" />
                    <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                      SOCRATES Assessment
                    </CardTitle>
                    <span className="text-[10px] text-muted-foreground">
                      ({answeredSOCRATES.length}/9)
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(socratesLabels).map(([key, label]) => {
                    const value = socrates[key as keyof typeof socrates];
                    return (
                      <div key={key} className={`flex items-start gap-3 p-2.5 rounded-lg ${value ? "bg-parchment" : "bg-muted/30"}`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-20 flex-shrink-0 pt-0.5">
                          {label}
                        </span>
                        <span className={`text-sm ${value ? "text-foreground" : "text-muted-foreground italic"}`}>
                          {value || "Not documented"}
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* AYUSH */}
              <Card className="vintage-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-vintage-gold" />
                    <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                      AYUSH Assessment ({answeredAYUSH.length}/10)
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(ayush).map(([key, value]: [string, string]) => (
                      <div key={key} className={`p-2 rounded-lg text-xs ${value ? "bg-vintage-gold/5" : "bg-muted/30"}`}>
                        <p className="font-semibold text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                        <p className={`mt-0.5 ${value ? "text-foreground" : "text-muted-foreground italic"}`}>
                          {value || "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Explainable AI */}
              {triage && (
                <Card className="vintage-card border-vintage-blue/20">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-vintage-blue" />
                      <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                        Why This Priority?
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {triage.reasons.map((reason: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-vintage-blue/5">
                        <CheckCircle className="w-4 h-4 text-vintage-blue mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{reason}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        AI Confidence: <span className="font-bold text-vintage-blue">{Math.round(triage.confidence * 100)}% — Simulated</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Documents */}
              <Card className="vintage-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-vintage-teal" />
                    <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                      Documents ({documents.length})
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {documents.length > 0 ? (
                    documents.map((doc) => (
                      <div key={doc.id} className="p-3 rounded-lg bg-parchment border border-border">
                        <p className="text-sm font-medium text-foreground">{doc.fileName}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {doc.extractedData.date} — {doc.extractedData.medication}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No documents uploaded</p>
                  )}
                </CardContent>
              </Card>

              {/* Missing Information */}
              <Card className="vintage-card border-priority-amber/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-priority-amber" />
                    <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                      Missing Information
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  {answeredSOCRATES.length < 5 && (
                    <p className="text-xs text-foreground flex items-start gap-1">
                      <ChevronRight className="w-3 h-3 text-priority-amber mt-0.5" />
                      SOCRATES assessment incomplete ({answeredSOCRATES.length}/9)
                    </p>
                  )}
                  {documents.length === 0 && (
                    <p className="text-xs text-foreground flex items-start gap-1">
                      <ChevronRight className="w-3 h-3 text-priority-amber mt-0.5" />
                      No medical documents uploaded
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Doctor Verification Actions */}
          <Card className="vintage-card border-vintage-blue/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-vintage-blue" />
                <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                  Doctor Verification
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {verification.status !== "pending" && verification.verifiedAt && (
                <div className="p-3 rounded-lg bg-routine-green/5 border border-routine-green/20">
                  <p className="text-sm font-medium text-routine-green">
                    ✓ Doctor {verification.status === "confirmed" ? "Confirmed" : verification.status === "edited" ? "Edited & Confirmed" : "Rejected"} — {new Date(verification.verifiedAt).toLocaleString("en-IN")}
                  </p>
                  {verification.overrideReason && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Reason: {verification.overrideReason}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button
                  className="bg-routine-green hover:bg-routine-green/90 text-white"
                  onClick={() => handleVerify("confirmed")}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Case Sheet
                </Button>
                <Button
                  variant="outline"
                  className="border-priority-amber text-priority-amber hover:bg-priority-amber/5"
                  onClick={() => handleVerify("edited")}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit / Override
                </Button>
                <Button
                  variant="outline"
                  className="border-urgent-red text-urgent-red hover:bg-urgent-red/5"
                  onClick={() => handleVerify("rejected")}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>

              {showOverrideForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-3"
                >
                  <Textarea
                    placeholder="Enter reason for override..."
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-priority-amber hover:bg-priority-amber/90 text-white"
                      onClick={handleOverride}
                      disabled={!overrideReason}
                    >
                      Submit Override
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowOverrideForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* FHIR / ABDM Integration */}
          <Card className="vintage-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-vintage-teal" />
                <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                  FHIR / ABDM Integration Demo
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateFHIR}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <FileText className="w-3 h-3 mr-1" />
                  )}
                  Generate FHIR Bundle
                </Button>
                {fhirBundle && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleABDMPush}
                    disabled={isGenerating}
                  >
                    <Link2 className="w-3 h-3 mr-1" />
                    Push to ABHA PHR
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/integration")}
                >
                  View Full FHIR Demo
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>

              {fhirBundle && (
                <div className="p-3 rounded-lg bg-parchment border border-border">
                  <p className="text-xs font-bold text-foreground mb-2">FHIR R4 Bundle — {fhirBundle.entry.length} resources</p>
                  <pre className="text-[10px] text-muted-foreground overflow-auto max-h-40 font-mono">
                    {JSON.stringify(fhirBundle, null, 2).slice(0, 800)}...
                  </pre>
                </div>
              )}

              {abdmResult && (
                <div className="p-3 rounded-lg bg-vintage-teal/5 border border-vintage-teal/20">
                  <p className="text-xs text-vintage-teal font-medium">{abdmResult}</p>
                </div>
              )}

              <DisclaimerBanner type="simulated" />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
