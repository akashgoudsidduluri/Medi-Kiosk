import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: string;
  label: string;
  shortLabel?: string;
}

interface StepProgressProps {
  steps?: Step[];
  currentStep: string;
  completedSteps?: string[];
}

const defaultSteps: Step[] = [
  { id: "login", label: "Patient Login", shortLabel: "Login" },
  { id: "consent", label: "Consent", shortLabel: "Consent" },
  { id: "language", label: "Language", shortLabel: "Language" },
  { id: "inputMode", label: "Input Mode", shortLabel: "Mode" },
  { id: "interview", label: "Clinical Interview", shortLabel: "Interview" },
  { id: "ayush", label: "AYUSH Assessment", shortLabel: "AYUSH" },
  { id: "documents", label: "Document Upload", shortLabel: "Docs" },
  { id: "timeline", label: "Medical Timeline", shortLabel: "Timeline" },
  { id: "triage", label: "AI Triage", shortLabel: "Triage" },
  { id: "casesheet", label: "Case Sheet", shortLabel: "Case Sheet" },
];

export function StepProgress({
  steps = defaultSteps,
  currentStep,
  completedSteps = [],
}: StepProgressProps) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex items-center gap-1 min-w-max px-4">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isPast =
            steps.findIndex((s) => s.id === step.id) <
            steps.findIndex((s) => s.id === currentStep);

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                    isCompleted
                      ? "bg-vintage-green text-white border-vintage-green"
                      : isCurrent
                        ? "bg-vintage-blue text-white border-vintage-blue"
                        : isPast
                          ? "bg-vintage-teal/10 text-vintage-teal border-vintage-teal/30"
                          : "bg-muted text-muted-foreground border-border"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium text-center max-w-[60px] leading-tight",
                    isCurrent
                      ? "text-vintage-blue font-bold"
                      : isCompleted
                        ? "text-vintage-green"
                        : "text-muted-foreground"
                  )}
                >
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.shortLabel || step.label}</span>
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-6 sm:w-10 h-0.5 mx-1 mt-[-20px]",
                    isPast || isCompleted ? "bg-vintage-teal" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
