import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatientStore } from "@/store/patientStore";
import { useDoctorStore, QueuePatient } from "@/store/doctorStore";
import { Header } from "@/components/shared/Header";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { opdStats, demoScenarios } from "@/data/demoData";
import { queueService } from "@/services/queue/queueService";
import {
  Stethoscope,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight,
  Activity,
  Globe,
  SortAsc,
  RefreshCw,
  Inbox,
} from "lucide-react";

type SortBy = "priority" | "waitTime" | "token";
const priorityOrder: Record<string, number> = { urgent: 0, priority: 1, routine: 2 };

// Seed demo patients into queue if empty (for self-contained demo)
function seedDemoQueueIfEmpty() {
  const queue = useDoctorStore.getState().queue;
  if (queue.length === 0) {
    demoScenarios.forEach((scenario, i) => {
      const patientState = usePatientStore.getState();
      // Build a minimal patient state snapshot for each scenario
      const snapshot: any = {
        id: scenario.id,
        name: scenario.patient.name,
        age: scenario.patient.age,
        gender: scenario.patient.gender,
        language: scenario.patient.language,
        mobileNumber: scenario.patient.mobileNumber,
        abhaId: scenario.patient.abhaId,
        chiefComplaint: scenario.history.chiefComplaint,
        socrates: {
          site: scenario.history.site,
          onset: scenario.history.onset,
          character: scenario.history.character,
          radiation: scenario.history.radiation,
          associatedSymptoms: scenario.history.associatedSymptoms,
          timing: scenario.history.timing,
          exacerbatingFactors: scenario.history.exacerbatingFactors,
          relievingFactors: scenario.history.relievingFactors,
          severity: scenario.history.severity,
        },
        ayush: scenario.ayush,
        documents: scenario.documents,
        timeline: scenario.timeline,
        triage: scenario.triage,
        interviewComplete: true,
        ayushComplete: true,
        consentGiven: true,
        isAuthenticated: true,
        isDoctor: false,
        verification: { status: "pending" },
      };
      useDoctorStore.getState().addPatientToQueue({
        id: scenario.id,
        name: scenario.patient.name,
        age: scenario.patient.age,
        gender: scenario.patient.gender,
        chiefComplaint: scenario.history.chiefComplaint,
        priority: scenario.expectedPriority,
        timestamp: new Date(Date.now() - (3 - i) * 8 * 60 * 1000).toISOString(),
        status: "waiting",
        patientStateSnapshot: snapshot,
      });
    });
  }
}

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { setPatient } = usePatientStore();
  const { queue, clearQueue } = useDoctorStore();
  const [sortBy, setSortBy] = useState<SortBy>("priority");

  // Seed demo data if queue is empty
  seedDemoQueueIfEmpty();

  const waitingPatients = queue.filter(p => p.status === "waiting");

  const sortedPatients = [...waitingPatients].sort((a, b) => {
    if (sortBy === "priority") return priorityOrder[a.priority] - priorityOrder[b.priority];
    if (sortBy === "waitTime") {
      const waitA = Date.now() - new Date(a.timestamp).getTime();
      const waitB = Date.now() - new Date(b.timestamp).getTime();
      return waitB - waitA; // Longer wait first
    }
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  const urgentCount = waitingPatients.filter((p) => p.priority === "urgent").length;
  const priorityCount = waitingPatients.filter((p) => p.priority === "priority").length;
  const routineCount = waitingPatients.filter((p) => p.priority === "routine").length;

  const handlePatientClick = (queuePatient: QueuePatient) => {
    // Load the patient's full state snapshot into the patient store
    setPatient({
      ...queuePatient.patientStateSnapshot,
    });
    useDoctorStore.getState().updatePatientStatus(queuePatient.id, "in-consultation");
    navigate("/doctor/patient");
  };

  const getWaitMinutes = (timestamp: string) => {
    return Math.round((Date.now() - new Date(timestamp).getTime()) / 60000);
  };

  return (
    <div className="min-h-screen vintage-texture">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-vintage-blue to-vintage-teal flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
                  Doctor Dashboard
                </h1>
                <p className="text-xs text-muted-foreground">
                  Smart OPD Queue — Real-time View
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DisclaimerBanner type="demo" className="flex-1 max-w-xs" />
              <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => clearQueue()}>
                <RefreshCw className="w-3 h-3 mr-1" />
                Clear Queue
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Today's OPD", value: opdStats.todaysOPD, icon: Users, color: "text-vintage-blue", bg: "bg-vintage-blue/10" },
              { label: "Urgent", value: urgentCount, icon: AlertTriangle, color: "text-urgent-red", bg: "bg-urgent-red/10" },
              { label: "Priority", value: priorityCount, icon: Clock, color: "text-priority-amber", bg: "bg-priority-amber/10" },
              { label: "Routine", value: routineCount, icon: CheckCircle, color: "text-routine-green", bg: "bg-routine-green/10" },
            ].map((stat) => (
              <Card key={stat.label} className="vintage-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
                        {stat.value}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Sort by:</span>
            {[
              { key: "priority" as SortBy, label: "Priority" },
              { key: "waitTime" as SortBy, label: "Wait Time" },
              { key: "token" as SortBy, label: "Queue Order" },
            ].map((option) => (
              <Button
                key={option.key}
                variant={sortBy === option.key ? "default" : "outline"}
                size="sm"
                className={`text-xs h-7 ${
                  sortBy === option.key ? "bg-vintage-blue text-white" : ""
                }`}
                onClick={() => setSortBy(option.key)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Patient Queue */}
          <Card className="vintage-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-vintage-blue" />
                  <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                    Smart OPD Queue
                  </CardTitle>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {waitingPatients.length} patients waiting
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {sortedPatients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Inbox className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm font-medium">Queue is empty</p>
                  <p className="text-xs mt-1">Complete a patient assessment to populate the queue</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedPatients.map((patient, i) => (
                    <motion.div
                      key={patient.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <button
                        className={`w-full p-4 rounded-xl border text-left transition-all hover:shadow-md ${
                          patient.priority === "urgent"
                            ? "border-urgent-red/30 bg-urgent-red/5 hover:bg-urgent-red/10"
                            : "border-border bg-white hover:bg-parchment"
                        }`}
                        onClick={() => handlePatientClick(patient)}
                      >
                        <div className="flex items-center gap-4">
                          {/* Priority Indicator */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            patient.priority === "urgent"
                              ? "bg-urgent-red text-white"
                              : patient.priority === "priority"
                                ? "bg-priority-amber text-white"
                                : "bg-routine-green text-white"
                          }`}>
                            {patient.priority === "urgent" ? "!" : i + 1}
                          </div>

                          {/* Patient Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-bold text-foreground">{patient.name}</p>
                              <span className="text-xs text-muted-foreground">
                                {patient.age}y, {patient.gender}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {patient.chiefComplaint}
                            </p>
                          </div>

                          {/* Wait Time */}
                          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                            <Globe className="w-3 h-3" />
                            {patient.patientStateSnapshot?.language || "—"}
                          </div>

                          <div className="text-right flex-shrink-0">
                            <p className="text-xs font-bold text-foreground">{getWaitMinutes(patient.timestamp)}m</p>
                            <p className="text-[10px] text-muted-foreground">wait</p>
                          </div>

                          {/* Priority Badge */}
                          <PriorityBadge priority={patient.priority as any} size="sm" />

                          <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
