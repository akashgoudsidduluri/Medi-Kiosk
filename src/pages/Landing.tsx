import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/shared/Header";
import { opdStats } from "@/data/demoData";
import {
  Users,
  Mic,
  Brain,
  Leaf,
  FileText,
  Clock,
  AlertTriangle,
  ClipboardList,
  Stethoscope,
  Link2,
  ArrowRight,
  Activity,
  Shield,
  Heart,
  ChevronRight,
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const workflowSteps = [
  { number: 1, title: "Patient", subtitle: "Patient arrives", icon: Users, color: "blue" as const },
  { number: 2, title: "Voice / Touch", subtitle: "Multilingual interaction", icon: Mic, color: "blue" as const },
  { number: 3, title: "Adaptive Interview", subtitle: "SOCRATES questioning", icon: Brain, color: "teal" as const },
  { number: 4, title: "AYUSH", subtitle: "Dashavidha Pariksha", icon: Leaf, color: "gold" as const },
  { number: 5, title: "Documents", subtitle: "OCR + extraction", icon: FileText, color: "teal" as const },
  { number: 6, title: "Timeline", subtitle: "Medical history organized", icon: Clock, color: "blue" as const },
  { number: 7, title: "Triage", subtitle: "Priority detection", icon: AlertTriangle, color: "red" as const },
  { number: 8, title: "Case Sheet", subtitle: "Clinical summary", icon: ClipboardList, color: "teal" as const },
  { number: 9, title: "Doctor", subtitle: "Confirm / Edit / Override", icon: Stethoscope, color: "green" as const },
  { number: 10, title: "FHIR / ABDM", subtitle: "Integration-ready record", icon: Link2, color: "gold" as const },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen vintage-texture">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-vintage-blue/5 via-transparent to-vintage-teal/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-vintage-blue/10 border border-vintage-blue/20 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-vintage-blue" />
              <span className="text-xs font-semibold text-vintage-blue uppercase tracking-wider">
                AI-Powered Pre-Consultation
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Pre-Consultation Intelligence
              <br />
              <span className="text-vintage-blue">for Every OPD</span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Capture patient history, AYUSH assessment and medical records before
              consultation — then provide a structured, priority-aware case sheet to the doctor.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="text-base px-8 py-6 bg-vintage-blue hover:bg-vintage-blue/90 text-white rounded-xl shadow-lg shadow-vintage-blue/20"
                onClick={() => navigate("/patient/login")}
              >
                Patient Login / Signup
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 py-6 rounded-xl border-border"
                onClick={() => navigate("/doctor/login")}
              >
                <Stethoscope className="mr-2 w-5 h-5" />
                Doctor Login
              </Button>
            </div>

            {/* Safety statement */}
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span className="italic">AI assists. Doctor decides.</span>
            </div>
          </motion.div>

          {/* OPD Demo Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 max-w-3xl mx-auto"
          >
            <div className="vintage-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Demo OPD Queue
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-vintage-blue/10 text-vintage-blue font-semibold">
                  LIVE DEMO
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-parchment">
                  <p className="text-3xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
                    {opdStats.todaysOPD}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Today&apos;s OPD</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-urgent-red/5">
                  <p className="text-3xl font-bold text-urgent-red" style={{ fontFamily: "Georgia, serif" }}>
                    {opdStats.highRisk}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">High Risk</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-priority-amber/5">
                  <p className="text-3xl font-bold text-priority-amber" style={{ fontFamily: "Georgia, serif" }}>
                    {opdStats.priority}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Priority</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-routine-green/5">
                  <p className="text-3xl font-bold text-routine-green" style={{ fontFamily: "Georgia, serif" }}>
                    {opdStats.routine}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Routine</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works — Workflow */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-cream-dark/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2
              className="text-3xl sm:text-4xl font-bold text-foreground"
              style={{ fontFamily: "Georgia, serif" }}
            >
              How It Works
            </h2>
            <div className="ornamental-divider max-w-xs mx-auto">
              <Activity className="w-4 h-4 text-vintage-gold" />
            </div>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From patient arrival to structured case sheet — a complete pre-consultation intelligence pipeline
            </p>
          </motion.div>

          {/* Workflow Grid */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-1"
          >
            {workflowSteps.map((step) => (
              <motion.div key={step.number} variants={fadeInUp} className="flex flex-col items-center gap-2">
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center border transition-transform hover:scale-105 ${
                    step.color === "blue"
                      ? "bg-vintage-blue/10 text-vintage-blue border-vintage-blue/20"
                      : step.color === "teal"
                        ? "bg-vintage-teal/10 text-vintage-teal border-vintage-teal/20"
                        : step.color === "gold"
                          ? "bg-vintage-gold/10 text-vintage-gold border-vintage-gold/20"
                          : step.color === "green"
                            ? "bg-vintage-green/10 text-vintage-green border-vintage-green/20"
                            : "bg-urgent-red/10 text-urgent-red border-urgent-red/20"
                  }`}
                >
                  <step.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10px] font-bold text-foreground text-center leading-tight">
                  {step.number}. {step.title}
                </span>
                <span className="text-[9px] text-muted-foreground text-center leading-tight hidden sm:block">
                  {step.subtitle}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Flow arrows for mobile */}
          <div className="flex justify-center mt-4 sm:hidden">
            <div className="flex items-center gap-1 text-muted-foreground/40">
              {Array.from({ length: 9 }).map((_, i) => (
                <ChevronRight key={i} className="w-3 h-3" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* For Patients */}
      <section id="for-patients" className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2
              className="text-3xl sm:text-4xl font-bold text-foreground"
              style={{ fontFamily: "Georgia, serif" }}
            >
              For Patients
            </h2>
            <div className="ornamental-divider max-w-xs mx-auto">
              <Heart className="w-4 h-4 text-vintage-teal" />
            </div>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A comfortable, multilingual pre-consultation experience that captures your complete health history
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Mic,
                title: "Voice & Touch Interaction",
                description:
                  "Speak in your preferred language. Our system understands 26 Indian languages through simulated Bhashini ASR integration.",
              },
              {
                icon: Brain,
                title: "Adaptive Clinical Interview",
                description:
                  "The system asks intelligent follow-up questions using the SOCRATES framework, adapting to your specific symptoms.",
              },
              {
                icon: Leaf,
                title: "AYUSH Assessment",
                description:
                  "Complete Dashavidha Pariksha assessment covering 10 traditional Ayurvedic parameters for holistic health evaluation.",
              },
              {
                icon: FileText,
                title: "Document Digitization",
                description:
                  "Upload prescriptions, lab reports, and medical records. OCR technology extracts key information automatically.",
              },
              {
                icon: Clock,
                title: "Medical Timeline",
                description:
                  "Your complete medical history organized chronologically — giving the doctor a clear picture before consultation.",
              },
              {
                icon: ClipboardList,
                title: "Structured Case Sheet",
                description:
                  "Receive a comprehensive, physician-ready case sheet that captures everything discussed during pre-consultation.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="vintage-card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-vintage-teal/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-vintage-teal" />
                </div>
                <h3 className="font-bold text-foreground mb-2" style={{ fontFamily: "Georgia, serif" }}>
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* For Doctors */}
      <section id="for-doctors" className="py-16 sm:py-20 bg-cream-dark/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2
              className="text-3xl sm:text-4xl font-bold text-foreground"
              style={{ fontFamily: "Georgia, serif" }}
            >
              For Doctors
            </h2>
            <div className="ornamental-divider max-w-xs mx-auto">
              <Stethoscope className="w-4 h-4 text-vintage-blue" />
            </div>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Walk into every consultation with a complete, organized patient history — powered by AI, verified by you
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                icon: ClipboardList,
                title: "Smart Case Sheet",
                description:
                  "Structured clinical summary with SOCRATES, AYUSH assessment, medications, allergies, and red-flag indicators — all before you see the patient.",
              },
              {
                icon: AlertTriangle,
                title: "Priority-Aware Queue",
                description:
                  "OPD queue sorted by clinical priority. Urgent cases highlighted. Rule-based triage with explainable AI reasoning.",
              },
              {
                icon: Brain,
                title: "Explainable AI",
                description:
                  "See why the AI recommended a particular priority. Transparent factors: severity, duration, associated symptoms, medical history.",
              },
              {
                icon: Shield,
                title: "Doctor as Final Authority",
                description:
                  "Confirm, edit, or override any AI recommendation. Your clinical judgment always takes precedence. All overrides are logged.",
              },
              {
                icon: Link2,
                title: "FHIR / ABDM Ready",
                description:
                  "HL7 FHIR R4 compatible case sheets. Ready for ABDM integration. Push to hospital HIS/EMR systems.",
              },
              {
                icon: Clock,
                title: "Saves Consultation Time",
                description:
                  "Pre-collected history means more time for diagnosis and treatment, less time for data entry during consultation.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="vintage-card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-vintage-blue/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-vintage-blue" />
                </div>
                <h3 className="font-bold text-foreground mb-2" style={{ fontFamily: "Georgia, serif" }}>
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <h2
              className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Ready to Experience MediKiosk?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Try the complete pre-consultation journey with our interactive demo
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="text-base px-8 py-6 bg-vintage-blue hover:bg-vintage-blue/90 text-white rounded-xl"
                onClick={() => navigate("/patient/login")}
              >
                Start Patient Assessment
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 py-6 rounded-xl"
                onClick={() => navigate("/doctor/login")}
              >
                <Stethoscope className="mr-2 w-5 h-5" />
                Doctor Dashboard
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-cream-dark/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-vintage-blue to-vintage-teal flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>
                MediKiosk
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <span>Smart India Hackathon 2026</span>
              <span>Ministry of Ayush</span>
              <span>All India Institute of Ayurveda</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Demo / Simulated Prototype
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l1.912 5.813a2 2 0 001.272 1.272L21 12l-5.816 1.912a2 2 0 00-1.272 1.272L12 21l-1.912-5.816a2 2 0 00-1.272-1.272L3 12l5.816-1.912a2 2 0 001.272-1.272L12 3z" />
    </svg>
  );
}
