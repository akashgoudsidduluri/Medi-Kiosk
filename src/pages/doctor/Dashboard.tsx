import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatientStore } from "@/store/patientStore";
import { Header } from "@/components/shared/Header";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import { demoScenarios, opdStats } from "@/data/demoData";
import {
  Stethoscope,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight,
  Activity,
  Globe,
  Filter,
  SortAsc,
} from "lucide-react";

type SortBy = "priority" | "waitTime" | "token";

const allPatients = [
  { ...demoScenarios.urgent.patient, priority: "urgent" as const, chiefComplaint: demoScenarios.urgent.chiefComplaint, waitTime: 8, token: 1 },
  { ...demoScenarios.priority.patient, priority: "priority" as const, chiefComplaint: demoScenarios.priority.chiefComplaint, waitTime: 15, token: 2 },
  { ...demoScenarios.routine.patient, priority: "routine" as const, chiefComplaint: demoScenarios.routine.chiefComplaint, waitTime: 22, token: 3 },
  { name: "Priya Nair", age: 28, gender: "Female", language: "Malayalam", priority: "routine" as const, chiefComplaint: "Mild headache for 3 days", waitTime: 18, token: 4 },
  { name: "Vikram Singh", age: 55, gender: "Male", language: "Hindi", priority: "priority" as const, chiefComplaint: "Recurring dizziness and fatigue", waitTime: 12, token: 5 },
  { name: "Lakshmi Devi", age: 62, gender: "Female", language: "Tamil", priority: "routine" as const, chiefComplaint: "Lower back pain — chronic", waitTime: 25, token: 6 },
];

const priorityOrder: Record<string, number> = { urgent: 0, priority: 1, routine: 2 };

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { setPatient } = usePatientStore();
  const [sortBy, setSortBy] = useState<SortBy>("priority");

  const sortedPatients = [...allPatients].sort((a, b) => {
    if (sortBy === "priority") return priorityOrder[a.priority] - priorityOrder[b.priority];
    if (sortBy === "waitTime") return b.waitTime - a.waitTime;
    return a.token - b.token;
  });

  const urgentCount = allPatients.filter((p) => p.priority === "urgent").length;
  const priorityCount = allPatients.filter((p) => p.priority === "priority").length;
  const routineCount = allPatients.filter((p) => p.priority === "routine").length;

  const handlePatientClick = (patient: typeof allPatients[0]) => {
    // Map to scenario data if available
    const scenarioKey = patient.name === "Anita Sharma" ? "urgent" : 
                         patient.name === "Ravi Kumar" ? "priority" : 
                         patient.name === "Suresh Rao" ? "routine" : null;
    
    if (scenarioKey) {
      const scenario = demoScenarios[scenarioKey];
      setPatient({
        id: `patient-${patient.token}`,
        name: scenario.patient.name,
        age: scenario.patient.age,
        gender: scenario.patient.gender,
        language: scenario.patient.language,
        mobileNumber: scenario.patient.mobileNumber,
        abhaId: scenario.patient.abhaId,
        chiefComplaint: scenario.chiefComplaint,
        socrates: scenario.socrates,
        ayush: scenario.ayush,
        documents: scenario.documents,
        timeline: scenario.timeline,
        triage: scenario.triage,
        interviewComplete: true,
        ayushComplete: true,
      });
    } else {
      setPatient({
        id: `patient-${patient.token}`,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        language: patient.language,
        chiefComplaint: patient.chiefComplaint,
        triage: {
          priority: patient.priority,
          reasons: ["Patient data loaded from OPD queue"],
          confidence: 0.85,
          timestamp: new Date().toISOString(),
        },
      });
    }
    navigate("/doctor/patient");
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
                  Smart OPD Queue — Today&apos;s View
                </p>
              </div>
            </div>
            <DisclaimerBanner type="demo" className="flex-1 max-w-xs" />
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
              { key: "token" as SortBy, label: "Token" },
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
                  {allPatients.length} patients waiting
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedPatients.map((patient, i) => (
                  <motion.div
                    key={patient.token}
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
                        {/* Token */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          patient.priority === "urgent"
                            ? "bg-urgent-red text-white"
                            : patient.priority === "priority"
                              ? "bg-priority-amber text-white"
                              : "bg-routine-green text-white"
                        }`}>
                          #{patient.token}
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

                        {/* Language */}
                        <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                          <Globe className="w-3 h-3" />
                          {patient.language}
                        </div>

                        {/* Wait Time */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-bold text-foreground">{patient.waitTime}m</p>
                          <p className="text-[10px] text-muted-foreground">wait</p>
                        </div>

                        {/* Priority Badge */}
                        <PriorityBadge priority={patient.priority} size="sm" />

                        <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
