import { cn } from "@/lib/utils";
import { Info, AlertTriangle, Sparkles } from "lucide-react";

interface DisclaimerBannerProps {
  type?: "ai-generated" | "simulated" | "warning" | "demo";
  message?: string;
  className?: string;
}

const config = {
  "ai-generated": {
    icon: Sparkles,
    label: "AI-GENERATED DRAFT",
    description: "Doctor verification required.",
    className: "bg-vintage-blue/5 border-vintage-blue/20 text-vintage-blue",
  },
  simulated: {
    icon: Info,
    label: "Demo / Simulated",
    description: "This is a simulated result for demonstration purposes.",
    className: "bg-vintage-gold/5 border-vintage-gold/20 text-vintage-gold",
  },
  warning: {
    icon: AlertTriangle,
    label: "Important Notice",
    description: "This system does not diagnose diseases. Doctor has final clinical decision.",
    className: "bg-urgent-red/5 border-urgent-red/20 text-urgent-red",
  },
  demo: {
    icon: Info,
    label: "Demo Data",
    description: "All patient information shown is fictional demo data.",
    className: "bg-muted border-border text-muted-foreground",
  },
};

export function DisclaimerBanner({
  type = "ai-generated",
  message,
  className,
}: DisclaimerBannerProps) {
  const { icon: Icon, label, description, className: configClass } = config[type];

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 rounded-lg border",
        configClass,
        className
      )}
    >
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs font-bold uppercase tracking-wider">{label}</p>
        <p className="text-xs mt-0.5 opacity-80">
          {message || description}
        </p>
      </div>
    </div>
  );
}
