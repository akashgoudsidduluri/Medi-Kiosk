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
  const { timeline, documents, setStep, clinicalState } = usePatientStore();

  const derivedDocumentTimeline = (documents ?? []).flatMap((doc) => {
    const dateValue = doc.extractedData?.date;
    if (!dateValue || dateValue === "Date unavailable" || dateValue === "Not detected") return [];
    const facts = (doc.documentFacts ?? []).filter((fact) => fact.verified || fact.status === "confirmed" || fact.status === "edited");
    if (facts.length === 0) return [];
    return facts.slice(0, 3).map((fact) => ({
      id: `${doc.id}-${fact.field}`,
      date: dateValue,
      title: fact.field,
      description: fact.value,
      type: fact.field.toLowerCase().includes("med") ? "medication" : fact.field.toLowerCase().includes("lab") ? "lab" : "observation",
      source: fact.source,
    }));
  });

  const effectiveTimeline = [...timeline, ...derivedDocumentTimeline];

  const parseTimelineDate = (value?: string) => {
    if (!value || value === "Date unavailable" || value === "Not detected") return null;
    const normalized = value.trim();
    const actualDate = normalized.startsWith("~") ? normalized.slice(1) : normalized;
    const parsed = new Date(actualDate);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const sortedTimeline = [...effectiveTimeline].sort((a, b) => {
    const aDate = parseTimelineDate(a.date);
    const bDate = parseTimelineDate(b.date);

    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;
    return bDate.getTime() - aDate.getTime();
  });

  const undatedRecords = (documents ?? []).filter((doc) => {
    const dateValue = doc.extractedData?.date;
    return !dateValue || dateValue === "Date unavailable" || dateValue === "Not detected";
  });

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

          {sortedTimeline.length > 0 ? (
            <div className="space-y-8">
              <div>
                <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Clinical Timeline</h2>
                <div className="relative">
                  <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />

                  <div className="space-y-6">
                    {sortedTimeline.map((event, index) => {
                      const config = typeConfig[event.type] || typeConfig.consultation;
                      const Icon = config.icon;
                      const validDate = parseTimelineDate(event.date);
                      const displayDate = !event.date || event.date === "Date unavailable" || event.date === "Not detected"
                        ? "Date unavailable"
                        : event.date.startsWith("~")
                          ? event.date
                          : validDate && !Number.isNaN(validDate.getTime())
                            ? validDate.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
                            : event.date;

                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative flex items-start gap-4 pl-0"
                        >
                          <div className={`relative z-10 w-10 h-10 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-5 h-5 ${config.color}`} />
                          </div>

                          <Card className="vintage-card flex-1">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="text-xs text-muted-foreground font-medium">
                                    {displayDate}
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
              </div>

              {undatedRecords.length > 0 && (
                <div>
                  <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Undated Records</h2>
                  <div className="space-y-3">
                    {undatedRecords.map((doc) => (
                      <Card key={doc.id} className="vintage-card">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
                                {doc.fileName || doc.filename || "Uploaded document"}
                              </p>
                              <p className="text-xs text-muted-foreground">Date unavailable</p>
                            </div>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Document</span>
                          </div>

                          <div className="mt-3 space-y-2">
                            {doc.documentFacts && doc.documentFacts.length > 0 ? (
                              doc.documentFacts.map((fact) => (
                                <div key={`${doc.id}-${fact.field}-${fact.value}`} className="rounded-lg bg-muted/50 p-2">
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{fact.field}</p>
                                  <p className="text-sm text-foreground">{fact.value}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No clinically dated facts were extracted.</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Card className="vintage-card">
              <CardContent className="p-8 text-center">
                <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No dated clinical events available yet. Undated document records will appear here when a document is uploaded without a clinical date.
                </p>
              </CardContent>
            </Card>
          )}

          <DisclaimerBanner
            type="simulated"
            message="Timeline events are derived from interview data and simulated records."
          />
        </motion.div>

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
