import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatientStore } from "@/store/patientStore";
import { Header } from "@/components/shared/Header";
import { StepProgress } from "@/components/shared/StepProgress";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { queueService } from "@/services/queue/queueService";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  User,
  Stethoscope,
  Brain,
  Leaf,
  Clock,
  AlertTriangle,
  Pill,
  FileCheck,
  Activity,
  Link2,
  Printer,
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

const ayushLabels: Record<string, string> = {
  prakriti: "Prakriti",
  vikriti: "Vikriti",
  sara: "Sara",
  samhanana: "Samhanana",
  pramana: "Pramana",
  satmya: "Satmya",
  satva: "Satva",
  aharaShakti: "Ahara Shakti",
  vyayamaShakti: "Vyayama Shakti",
  vaya: "Vaya",
};

export default function CaseSheet() {
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
    clinicalState,
    aharaVihara,
    setVerification,
    completeAssessment,
    setStep,
  } = store;

  const answeredSOCRATES = Object.entries(socrates).filter(([_, v]) => v);
  const answeredAYUSH = Object.entries(ayush).filter(([_, v]) => v);

  // Simple completeness engine
  const missingInfo: string[] = [];
  const clinicalAlerts: string[] = [];

  if (!socrates.severity) missingInfo.push("Severity assessment incomplete");
  if (!socrates.associatedSymptoms) missingInfo.push("Associated symptoms not documented");
  if (!socrates.exacerbatingFactors) missingInfo.push("Exacerbating factors not documented");
  if (documents.length === 0) missingInfo.push("No medical documents uploaded");
  if (answeredAYUSH.length < 10)
    missingInfo.push(`AYUSH assessment incomplete (${answeredAYUSH.length}/10)`);

  if (answeredSOCRATES.length < 5) missingInfo.push("SOCRATES assessment incomplete");

  return (
    <div className="min-h-screen vintage-texture">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <StepProgress
            currentStep="casesheet"
            completedSteps={["login", "consent", "interview", "ayush", "documents", "timeline", "triage"]}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* AI-Generated Draft Banner */}
          <DisclaimerBanner
            type="ai-generated"
            message="This is an AI-generated draft case sheet. Doctor verification is required before clinical use."
          />

          {/* Case Sheet Header */}
          <Card className="vintage-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-vintage-blue to-vintage-teal flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
                      Pre-Consultation Case Sheet
                    </h1>
                    <p className="text-xs text-muted-foreground">
                      MediKiosk — Generated {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {triage && <PriorityBadge priority={triage.priority as any} size="lg" />}
                  <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Printer className="w-4 h-4 mr-1" />
                    Print
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient Information */}
          <Card className="vintage-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-vintage-blue" />
                <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                  Patient Information
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Name</p>
                  <p className="text-sm font-medium text-foreground">{name || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Age / Gender</p>
                  <p className="text-sm font-medium text-foreground">{age ? `${age}y / ${gender}` : "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Language</p>
                  <p className="text-sm font-medium text-foreground">{language}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">ABHA ID</p>
                  <p className="text-sm font-medium text-vintage-teal">{abhaId || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chief Complaint */}
          <Card className="vintage-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-vintage-blue" />
                <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                  Chief Complaint
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed p-3 bg-parchment rounded-lg border border-border">
                {chiefComplaint || "—"}
              </p>
            </CardContent>
          </Card>

          {/* SOCRATES */}
          <Card className="vintage-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-vintage-teal" />
                <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                  SOCRATES Assessment
                </CardTitle>
                <span className="text-[10px] text-muted-foreground">
                  ({answeredSOCRATES.length}/9 documented)
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(socratesLabels).map(([key, label]) => {
                  const value = socrates[key as keyof typeof socrates];
                  return (
                    <div key={key} className={`p-3 rounded-lg border ${value ? "bg-parchment border-border" : "bg-muted/30 border-border"}`}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                        {label}
                      </p>
                      <p className={`text-sm ${value ? "text-foreground" : "text-muted-foreground italic"}`}>
                        {value || "Not documented"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* HPI and structured history */}
          <Card className="vintage-card">
            <CardHeader>
              <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>History of Present Illness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-foreground">
              <p><strong>Chief complaint:</strong> {chiefComplaint || "Not provided"}</p>
              <p><strong>Onset:</strong> {socrates.onset || "Not provided"}</p>
              <p><strong>Duration:</strong> {clinicalState.duration || "Not provided"}</p>
              <p><strong>Site / character:</strong> {[socrates.site, socrates.character].filter(Boolean).join("; ") || "Not provided"}</p>
              <p><strong>Associated symptoms:</strong> {socrates.associatedSymptoms || "Not provided"}</p>
            </CardContent>
          </Card>

          <Card className="vintage-card">
            <CardHeader>
              <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>Medical History</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <p><strong>Past medical history:</strong> {clinicalState.pastMedicalHistory.join(", ") || "Not provided"}</p>
              <p><strong>Past surgical history:</strong> {clinicalState.personalHistory || "Not provided"}</p>
              <p><strong>Medications:</strong> {clinicalState.medications.join(", ") || "Not provided"}</p>
              <p><strong>Allergies:</strong> {clinicalState.allergies.join(", ") || "Not provided"}</p>
              <p><strong>Family history:</strong> {clinicalState.familyHistory || "Not provided"}</p>
              <p><strong>Personal history:</strong> {clinicalState.personalHistory || "Not provided"}</p>
              <p><strong>ROS:</strong> {Object.entries(clinicalState.reviewOfSystems).map(([key, value]) => `${key}: ${value}`).join("; ") || "Not provided"}</p>
              <p><strong>Prior investigations:</strong> {documents.map((doc) => doc.extractedData.investigations || "").filter(Boolean).join(", ") || "Not provided"}</p>
            </CardContent>
          </Card>

          {/* AYUSH Assessment */}
          <Card className="vintage-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-vintage-gold" />
                <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                  AYUSH Assessment — Dashavidha Pariksha
                </CardTitle>
                <span className="text-[10px] text-muted-foreground">
                  ({answeredAYUSH.length}/10 completed)
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(ayushLabels).map(([key, label]) => {
                  const value = ayush[key as keyof typeof ayush];
                  return (
                    <div key={key} className={`p-3 rounded-lg border ${value ? "bg-vintage-gold/5 border-vintage-gold/20" : "bg-muted/30 border-border"}`}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                        {label}
                      </p>
                      <p className={`text-sm ${value ? "text-foreground" : "text-muted-foreground italic"}`}>
                        {value || "Not assessed"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Document Findings */}
          <Card className="vintage-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-vintage-teal" />
                <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                  Document Findings
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-3 rounded-lg bg-parchment border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-vintage-teal" />
                        <p className="text-sm font-medium text-foreground">{doc.fileName}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Date:</p>
                          <p className="text-foreground">{doc.extractedData.date || "—"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Medication:</p>
                          <p className="text-foreground">{doc.extractedData.medication || "—"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Observation:</p>
                          <p className="text-foreground">{doc.extractedData.observation || "—"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No documents uploaded</p>
              )}
            </CardContent>
          </Card>

          <Card className="vintage-card">
            <CardHeader>
              <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>Ahara-Vihara</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {(["diet", "sleep", "bowelHabits", "dailyRoutine", "substances"] as const).map((field) => (
                <p key={field}><strong>{field}:</strong> {aharaVihara[field] || "Not provided"}</p>
              ))}
            </CardContent>
          </Card>

          {/* Missing Information & Clinical Alerts */}
          {(missingInfo.length > 0 || clinicalAlerts.length > 0) && (
            <Card className="vintage-card border-priority-amber/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-priority-amber" />
                  <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                    Case Completeness Engine
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {missingInfo.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-priority-amber uppercase tracking-wider mb-2">
                      ⚠ Missing Information
                    </p>
                    {missingInfo.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 mb-1">
                        <span className="text-priority-amber text-xs">•</span>
                        <p className="text-sm text-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                )}
                {clinicalAlerts.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-urgent-red uppercase tracking-wider mb-2">
                      ⚠ Clinical Consistency Alert
                    </p>
                    {clinicalAlerts.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 mb-1">
                        <span className="text-urgent-red text-xs">•</span>
                        <p className="text-sm text-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* AI Priority & Triage */}
          {triage && (
            <Card className="vintage-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-vintage-blue" />
                  <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                    AI-Assisted Priority
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-3">
                  <PriorityBadge priority={(triage?.priority as any) || "routine"} />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Confidence: {Math.round(triage.confidence * 100)}% — Simulated
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {triage.timestamp ? new Date(triage.timestamp).toLocaleString("en-IN") : "—"}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  {triage.reasons.map((reason: string, i: number) => (
                    <p key={i} className="text-xs text-muted-foreground">• {reason}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Doctor Verification Status */}
          <Card className="vintage-card border-vintage-blue/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-vintage-blue" />
                <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                  Doctor Verification
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-parchment border border-border text-center">
                <p className="text-sm text-muted-foreground">
                  Status:{" "}
                  <span className="font-bold text-vintage-blue uppercase">
                    {verification.status}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Awaiting doctor review and verification
                </p>
              </div>
            </CardContent>
          </Card>

          {/* FHIR Integration Preview */}
          <Card className="vintage-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-vintage-teal" />
                <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                  FHIR / ABDM Integration
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                This case sheet can be exported as an HL7 FHIR R4 Bundle and pushed to ABDM/ABHA health records.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => navigate("/integration")}
              >
                View FHIR Bundle Demo
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>

          <DisclaimerBanner type="warning" />
        </motion.div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between pb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/patient/triage")}
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </Button>

          <Button
            className="bg-vintage-blue hover:bg-vintage-blue/90"
            onClick={() => {
              // Push patient to doctor queue via the queue service boundary
              completeAssessment();
              queueService.pushToQueue(usePatientStore.getState());
              setVerification({ status: "pending" });
              navigate("/doctor/dashboard");
            }}
          >
            Send to Doctor Queue
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
