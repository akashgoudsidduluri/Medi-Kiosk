import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatientStore } from "@/store/patientStore";
import { Header } from "@/components/shared/Header";
import { StepProgress } from "@/components/shared/StepProgress";
import { DisclaimerBanner } from "@/components/shared/DisclaimerBanner";
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  Stethoscope,
  Pill,
  TestTube,
  ClipboardList,
} from "lucide-react";

const typeConfig: Record<string, { icon: typeof Stethoscope; color: string; bg: string }> = {
  consultation: { icon: Stethoscope, color: "text-vintage-blue", bg: "bg-vintage-blue/10" },
  medication: { icon: Pill, color: "text-vintage-teal", bg: "bg-vintage-teal/10" },
  investigation: { icon: TestTube, color: "text-vintage-gold", bg: "bg-vintage-gold/10" },
  assessment: { icon: ClipboardList, color: "text-urgent-red", bg: "bg-urgent-red/10" },
};

export default function Timeline() {
  const navigate = useNavigate();
  const { timeline, setStep } = usePatientStore();

  return (
    <div className="min-h-screen vintage-texture">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <StepProgress
            currentStep="timeline"
            completedSteps={["login", "consent", "interview", "ayush", "documents"]}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-vintage-blue/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-vintage-blue" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
                Medical Timeline
              </h1>
              <p className="text-xs text-muted-foreground">
                Your health history organized chronologically
              </p>
            </div>
          </div>

          {/* Timeline */}
          {timeline.length > 0 ? (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-6">
                {timeline
                  .sort((a: { date: string }, b: { date: string }) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((event: { id: string; date: string; title: string; description: string; type: string }, index: number) => {
                    const config = typeConfig[event.type] || typeConfig.consultation;
                    const Icon = config.icon;
                    const date = new Date(event.date);

                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative flex items-start gap-4 pl-0"
                      >
                        {/* Timeline dot */}
                        <div className={`relative z-10 w-10 h-10 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${config.color}`} />
                        </div>

                        {/* Content */}
                        <Card className="vintage-card flex-1">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-xs text-muted-foreground font-medium">
                                  {date.toLocaleDateString("en-IN", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                                <h3 className="text-sm font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
                                  {event.title}
                                </h3>
                              </div>
                              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                                {event.type}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {event.description}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <Card className="vintage-card">
              <CardContent className="p-8 text-center">
                <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No timeline events available. Complete the clinical interview to populate your medical timeline.
                </p>
              </CardContent>
            </Card>
          )}

          <DisclaimerBanner
            type="simulated"
            message="Timeline events are derived from interview data and simulated records."
          />
        </motion.div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between pb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/patient/document")}
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </Button>

          <Button
            className="bg-vintage-blue hover:bg-vintage-blue/90"
            onClick={() => {
              setStep("triage");
              navigate("/patient/triage");
            }}
          >
            Continue to Triage
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
