import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/shared/Header";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import {
  ArrowLeft,
  ArrowRight,
  Activity,
  Users,
  Brain,
  Database,
  Server,
  Shield,
  Globe,
  Mic,
  FileText,
  Link2,
  Code,
  CheckCircle,
  Cpu,
  Layers,
  Workflow,
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const techStack = [
  { name: "React / Vite", category: "Frontend", status: "implemented" as const },
  { name: "TypeScript", category: "Frontend", status: "implemented" as const },
  { name: "Tailwind CSS", category: "Frontend", status: "implemented" as const },
  { name: "shadcn/ui", category: "Frontend", status: "implemented" as const },
  { name: "Framer Motion", category: "Frontend", status: "implemented" as const },
  { name: "Zustand", category: "State", status: "implemented" as const },
  { name: "Bhashini / AI4Bharat", category: "AI/ML", status: "simulated" as const },
  { name: "Llama-3 / OpenHathi", category: "AI/ML", status: "simulated" as const },
  { name: "Tesseract OCR", category: "OCR", status: "simulated" as const },
  { name: "Rule-based Triage", category: "AI/ML", status: "implemented" as const },
  { name: "HL7 FHIR R4", category: "Interoperability", status: "simulated" as const },
  { name: "ABDM Integration", category: "Interoperability", status: "simulated" as const },
  { name: "Convex", category: "Backend", status: "implemented" as const },
  { name: "Bun", category: "Runtime", status: "implemented" as const },
];

const statusConfig = {
  implemented: { label: "Implemented", color: "text-vintage-green", bg: "bg-vintage-green/10" },
  simulated: { label: "Simulated", color: "text-vintage-gold", bg: "bg-vintage-gold/10" },
  planned: { label: "Planned", color: "text-muted-foreground", bg: "bg-muted" },
};

export default function Technology() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen vintage-texture">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Home
          </Button>

          {/* Header */}
          <div className="text-center">
            <h1
              className="text-3xl sm:text-4xl font-bold text-foreground"
              style={{ fontFamily: "Georgia, serif" }}
            >
              MediKiosk — Architecture
            </h1>
            <p className="text-sm text-muted-foreground mt-2 italic">
              Capture → Structure → Prioritize → Verify → Integrate
            </p>
            <div className="ornamental-divider max-w-xs mx-auto mt-4">
              <Activity className="w-4 h-4 text-vintage-gold" />
            </div>
          </div>

          <DisclaimerBanner
            type="simulated"
            message="This page clearly separates ACTUAL PROTOTYPE IMPLEMENTATION from INTENDED PRODUCTION INTEGRATION."
          />

          {/* System Status Block */}
          <Card className="vintage-card bg-vintage-blue/5 border-vintage-blue/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-vintage-blue" />
                <CardTitle className="text-sm tracking-wide uppercase" style={{ fontFamily: "Georgia, serif" }}>
                  System Status
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                {[
                  { name: "AI Interview", status: "LOCAL / DEMO" },
                  { name: "Voice ASR", status: "BROWSER / FALLBACK" },
                  { name: "Voice TTS", status: "BROWSER" },
                  { name: "OCR", status: "TESSERACT.JS" },
                  { name: "Triage", status: "LOCAL RULE ENGINE" },
                  { name: "FHIR", status: "FHIR R4 GENERATED" },
                  { name: "ABDM", status: "SIMULATED" },
                  { name: "HIS", status: "INTEGRATION-READY" },
                ].map((sys) => (
                  <div key={sys.name} className="flex justify-between items-center py-1 border-b border-vintage-blue/10 last:border-0">
                    <span className="text-sm font-medium text-foreground">{sys.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-vintage-blue/20 text-vintage-blue">
                      {sys.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Architecture Diagram */}
          <Card className="vintage-card overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-vintage-blue" />
                <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                  System Architecture
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {/* Architecture Flow */}
              <div className="space-y-4">
                {/* Layer 1: Patient Interaction */}
                <div className="p-4 rounded-xl border-2 border-vintage-blue/20 bg-vintage-blue/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-vintage-blue" />
                    <h3 className="text-sm font-bold text-vintage-blue uppercase tracking-wider">
                      01 — Patient Interaction (Kiosk / Mobile)
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      "Patient Check-in",
                      "Language Selection",
                      "Voice/Touch Mode",
                      "SOCRATES Interview",
                      "AYUSH Assessment",
                    ].map((item) => (
                      <div key={item} className="p-2 rounded-lg bg-white border border-vintage-blue/10 text-center">
                        <p className="text-[10px] font-medium text-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2">
                    {[
                      "Document Upload",
                      "OCR Extraction",
                      "Medical Timeline",
                      "AI Triage",
                      "Case Sheet",
                    ].map((item) => (
                      <div key={item} className="p-2 rounded-lg bg-white border border-vintage-blue/10 text-center">
                        <p className="text-[10px] font-medium text-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="w-0.5 h-6 bg-vintage-blue" />
                </div>

                {/* Layer 2: AI Processing */}
                <div className="p-4 rounded-xl border-2 border-vintage-teal/20 bg-vintage-teal/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-vintage-teal" />
                    <h3 className="text-sm font-bold text-vintage-teal uppercase tracking-wider">
                      02 — AI Processing Engine
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      "Speech Processing (Bhashini)",
                      "NLP & Understanding (LLM)",
                      "Clinical Extraction",
                      "Priority Scoring Engine",
                    ].map((item) => (
                      <div key={item} className="p-2 rounded-lg bg-white border border-vintage-teal/10 text-center">
                        <p className="text-[10px] font-medium text-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="w-0.5 h-6 bg-vintage-teal" />
                </div>

                {/* Layer 3: Data + Integration + Doctor */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Data Layer */}
                  <div className="p-4 rounded-xl border-2 border-vintage-gold/20 bg-vintage-gold/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Database className="w-5 h-5 text-vintage-gold" />
                      <h3 className="text-xs font-bold text-vintage-gold uppercase tracking-wider">
                        03 — Data Layer
                      </h3>
                    </div>
                    <div className="space-y-1.5">
                      {["Patient Profile", "Clinical Data", "Documents", "Timeline", "Audit Logs"].map((item) => (
                        <div key={item} className="p-1.5 rounded bg-white border border-vintage-gold/10">
                          <p className="text-[10px] font-medium text-foreground">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Integration Layer */}
                  <div className="p-4 rounded-xl border-2 border-vintage-teal/20 bg-vintage-teal/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Link2 className="w-5 h-5 text-vintage-teal" />
                      <h3 className="text-xs font-bold text-vintage-teal uppercase tracking-wider">
                        04 — Integration
                      </h3>
                    </div>
                    <div className="space-y-1.5">
                      {["FHIR R4 Server", "ABDM (ABHA, Health ID)", "HIS / EMR Push", "Notification Service"].map((item) => (
                        <div key={item} className="p-1.5 rounded bg-white border border-vintage-teal/10">
                          <p className="text-[10px] font-medium text-foreground">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Doctor Workflow */}
                  <div className="p-4 rounded-xl border-2 border-vintage-blue/20 bg-vintage-blue/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Workflow className="w-5 h-5 text-vintage-blue" />
                      <h3 className="text-xs font-bold text-vintage-blue uppercase tracking-wider">
                        05 — Doctor Workflow
                      </h3>
                    </div>
                    <div className="space-y-1.5">
                      {["OPD Queue Dashboard", "Patient Case View", "Explainable AI", "Confirm/Edit/Override"].map((item) => (
                        <div key={item} className="p-1.5 rounded bg-white border border-vintage-blue/10">
                          <p className="text-[10px] font-medium text-foreground">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="w-0.5 h-6 bg-border" />
                </div>

                {/* Layer 4: External Systems */}
                <div className="p-4 rounded-xl border-2 border-border bg-muted/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      06 — External Systems (Production)
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { name: "Bhashini Platform", icon: Mic },
                      { name: "AI4Bharat LLMs", icon: Cpu },
                      { name: "OCR Engine", icon: FileText },
                      { name: "Hospital HIS/EMR", icon: Server },
                    ].map((item) => (
                      <div key={item.name} className="p-2 rounded-lg bg-white border border-border text-center">
                        <item.icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                        <p className="text-[10px] font-medium text-foreground">{item.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <Card className="vintage-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-vintage-blue" />
                <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                  Technology Stack
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {techStack.map((tech) => {
                  const status = statusConfig[tech.status];
                  return (
                    <div
                      key={tech.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-parchment border border-border"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{tech.name}</p>
                        <p className="text-[10px] text-muted-foreground">{tech.category}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Key Benefits */}
          <Card className="vintage-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-vintage-green" />
                <CardTitle className="text-sm" style={{ fontFamily: "Georgia, serif" }}>
                  Key Benefits
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "Pre-consultation reduces doctor workload",
                  "Structured, priority-aware case sheets",
                  "AYUSH + Modern medicine integration",
                  "Multilingual, inclusive & accessible",
                  "ABDM/FHIR ready for future integration",
                  "Explainable AI with doctor override capability",
                ].map((benefit) => (
                  <div key={benefit} className="flex items-start gap-2 p-3 rounded-lg bg-vintage-green/5 border border-vintage-green/20">
                    <CheckCircle className="w-4 h-4 text-vintage-green mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground">{benefit}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Safety Note */}
          <DisclaimerBanner type="warning" className="mb-8" />
        </motion.div>
      </div>
    </div>
  );
}
