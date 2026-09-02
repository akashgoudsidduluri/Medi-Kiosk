import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { usePatientStore } from "@/store/patientStore";
import { Header } from "@/components/shared/Header";
import { getAuthService } from "@/services/auth";
import {
  Plus,
  LogOut,
  Calendar,
  FileText,
  Leaf,
  Shield,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Activity,
  Loader2,
} from "lucide-react";

type DashboardView = "overview" | "consultation-detail";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { currentPatient, name, abhaId, clinicalState, ayush, documents, timeline, triage, logoutPatient } = usePatientStore();
  const authService = getAuthService();
  const [view, setView] = useState<DashboardView>("overview");
  const [selectedConsultation, setSelectedConsultation] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await authService.logout();
    logoutPatient();
    setTimeout(() => navigate("/patient/login"), 600);
  };

  const handleStartAssessment = () => {
    navigate("/patient/consent");
  };

  // Demo previous consultations
  const previousConsultations = [
    {
      id: "cons-001",
      date: "15 Aug 2026",
      chiefComplaint: "Mild joint pain in knee",
      priority: "routine" as const,
      status: "Completed",
      casesheetAvailable: true,
    },
    {
      id: "cons-002",
      date: "08 Aug 2026",
      chiefComplaint: "Abdominal discomfort",
      priority: "priority" as const,
      status: "Completed",
      casesheetAvailable: true,
    },
  ];

  // ════════════════════════════════════════════════════════════════
  // CONSULTATION DETAIL VIEW
  // ════════════════════════════════════════════════════════════════

  if (view === "consultation-detail" && selectedConsultation) {
    const consultation = previousConsultations.find((c) => c.id === selectedConsultation);
    if (!consultation) return null;

    return (
      <div className="min-h-screen vintage-texture">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="vintage-card mb-6">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle style={{ fontFamily: "Georgia, serif" }}>
                    Consultation Details
                  </CardTitle>
                  <CardDescription>{consultation.date}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setView("overview");
                    setSelectedConsultation(null);
                  }}
                >
                  ← Back to Dashboard
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-parchment">
                    <p className="text-xs text-muted-foreground mb-1">Chief Complaint</p>
                    <p className="text-sm font-semibold text-foreground">{consultation.chiefComplaint}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-parchment">
                    <p className="text-xs text-muted-foreground mb-1">Priority Level</p>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          consultation.priority === "routine"
                            ? "bg-green-500"
                            : consultation.priority === "priority"
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                      />
                      <p className="text-sm font-semibold text-foreground capitalize">
                        {consultation.priority}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-900/40">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-green-700 dark:text-green-300">Consultation Status</p>
                      <p className="text-[10px] text-green-700 dark:text-green-300 mt-0.5">
                        {consultation.status}
                      </p>
                    </div>
                  </div>
                </div>

                {consultation.casesheetAvailable && (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/40">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Case Sheet Available</p>
                        <p className="text-[10px] text-blue-700 dark:text-blue-300 mt-0.5">
                          A structured case sheet from this consultation is available.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-border">
                  <Button
                    className="w-full bg-vintage-blue hover:bg-vintage-blue/90"
                    onClick={() => {
                      setView("overview");
                      setSelectedConsultation(null);
                    }}
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // MAIN DASHBOARD VIEW
  // ════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen vintage-texture">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* HEADER WITH PATIENT INFO & PRIMARY CTA */}
          <div className="mb-8">
            <Card className="vintage-card">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground mb-1" style={{ fontFamily: "Georgia, serif" }}>
                      Welcome, {name || "Patient"}
                    </h1>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        <span>MediKiosk ID: <span className="font-mono font-semibold text-foreground">{currentPatient?.patientId || "—"}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span>
                          ABHA Status:{" "}
                          <span className="font-semibold text-foreground">
                            {abhaId ? "Linked" : "Not linked"}
                          </span>
                          {abhaId && ` (${abhaId.substring(0, 8)}...)`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>
                          Authentication:{" "}
                          <span className="font-semibold text-green-600 dark:text-green-400">Verified (Demo)</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={handleStartAssessment}
                      className="h-12 px-6 bg-vintage-blue hover:bg-vintage-blue/90 text-white"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Start New Assessment
                    </Button>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="h-12 px-6"
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PREVIOUS CONSULTATIONS */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4" style={{ fontFamily: "Georgia, serif" }}>
              <Calendar className="w-5 h-5 inline mr-2" />
              Previous Consultations
            </h2>
            {previousConsultations.length > 0 ? (
              <div className="space-y-3">
                {previousConsultations.map((consultation) => (
                  <button
                    key={consultation.id}
                    onClick={() => {
                      setSelectedConsultation(consultation.id);
                      setView("consultation-detail");
                    }}
                    className="w-full p-4 rounded-lg border-2 border-border hover:border-vintage-blue hover:bg-vintage-blue/5 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-semibold text-foreground">{consultation.chiefComplaint}</span>
                          <div
                            className={`w-2 h-2 rounded-full ${
                              consultation.priority === "routine"
                                ? "bg-green-500"
                                : consultation.priority === "priority"
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                            }`}
                          />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{consultation.date}</span>
                          <span className="capitalize">{consultation.priority}</span>
                          <span>{consultation.status}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-vintage-blue" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <Card className="vintage-card">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground text-center">
                    No previous consultations found.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* CLINICAL HISTORY */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4" style={{ fontFamily: "Georgia, serif" }}>
              <FileText className="w-5 h-5 inline mr-2" />
              Clinical History
            </h2>
            <Card className="vintage-card">
              <CardContent className="pt-6 space-y-3">
                {clinicalState?.chiefComplaint ? (
                  <>
                    <div className="p-3 rounded-lg bg-parchment">
                      <p className="text-xs text-muted-foreground mb-1">Chief Complaint</p>
                      <p className="text-sm font-semibold text-foreground">{clinicalState.chiefComplaint}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">No clinical history available.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AYUSH PROFILE */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4" style={{ fontFamily: "Georgia, serif" }}>
              <Leaf className="w-5 h-5 inline mr-2" />
              AYUSH Profile
            </h2>
            <Card className="vintage-card">
              <CardContent className="pt-6">
                {ayush && (ayush.prakriti || ayush.vikriti) ? (
                  <div className="grid grid-cols-2 gap-3">
                    {ayush.prakriti && (
                      <div className="p-3 rounded-lg bg-parchment">
                        <p className="text-xs text-muted-foreground mb-1">Prakriti</p>
                        <p className="text-sm font-semibold text-foreground">{ayush.prakriti}</p>
                      </div>
                    )}
                    {ayush.vikriti && (
                      <div className="p-3 rounded-lg bg-parchment">
                        <p className="text-xs text-muted-foreground mb-1">Vikriti</p>
                        <p className="text-sm font-semibold text-foreground">{ayush.vikriti}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    AYUSH assessment not completed.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* DOCUMENTS */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4" style={{ fontFamily: "Georgia, serif" }}>
              <FileText className="w-5 h-5 inline mr-2" />
              Documents
            </h2>
            <Card className="vintage-card">
              <CardContent className="pt-6">
                {documents && documents.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{documents.length}</span> document{documents.length > 1 ? "s" : ""} on file
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    No documents uploaded.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* TIMELINE */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4" style={{ fontFamily: "Georgia, serif" }}>
              <Calendar className="w-5 h-5 inline mr-2" />
              Clinical Timeline
            </h2>
            <Card className="vintage-card">
              <CardContent className="pt-6">
                {timeline && timeline.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {timeline.map((event: any, i: number) => (
                      <div key={i} className="flex gap-3 pb-3 border-b border-border last:border-0">
                        <div className="w-2 h-2 rounded-full bg-vintage-blue mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">{event.date}</p>
                          <p className="text-sm font-semibold text-foreground">{event.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    No timeline events available.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* TRIAGE */}
          {triage && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4" style={{ fontFamily: "Georgia, serif" }}>
                <AlertTriangle className="w-5 h-5 inline mr-2" />
                Triage Result
              </h2>
              <Card className={`vintage-card border-l-4 ${
                triage.priority === "urgent"
                  ? "border-l-red-500"
                  : triage.priority === "priority"
                    ? "border-l-amber-500"
                    : "border-l-green-500"
              }`}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-3 h-3 rounded-full ${
                      triage.priority === "urgent"
                        ? "bg-red-500"
                        : triage.priority === "priority"
                          ? "bg-amber-500"
                          : "bg-green-500"
                    }`} />
                    <p className="text-sm font-semibold text-foreground capitalize">{triage.priority}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* FOOTER INFO */}
          <div className="text-center text-xs text-muted-foreground py-4">
            <p>MediKiosk Patient Portal — Demo Mode</p>
            <p>All data is session-only and not persisted.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
