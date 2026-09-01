import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface WorkflowStepProps {
  number: number;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color?: "blue" | "teal" | "gold" | "green" | "red";
  showArrow?: boolean;
}

const colorMap = {
  blue: "bg-vintage-blue/10 text-vintage-blue border-vintage-blue/20",
  teal: "bg-vintage-teal/10 text-vintage-teal border-vintage-teal/20",
  gold: "bg-vintage-gold/10 text-vintage-gold border-vintage-gold/20",
  green: "bg-vintage-green/10 text-vintage-green border-vintage-green/20",
  red: "bg-urgent-red/10 text-urgent-red border-urgent-red/20",
};

const numberColorMap = {
  blue: "bg-vintage-blue text-white",
  teal: "bg-vintage-teal text-white",
  gold: "bg-vintage-gold text-white",
  green: "bg-vintage-green text-white",
  red: "bg-urgent-red text-white",
};

export function WorkflowStep({
  number,
  title,
  subtitle,
  icon: Icon,
  color = "blue",
  showArrow = true,
}: WorkflowStepProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("flex flex-col items-center gap-1.5 min-w-[100px]", "flex-shrink-0")}>
        <div
          className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center border",
            colorMap[color]
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div
          className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
            numberColorMap[color]
          )}
        >
          {number}
        </div>
        <p className="text-xs font-semibold text-foreground text-center leading-tight">
          {title}
        </p>
        <p className="text-[10px] text-muted-foreground text-center leading-tight max-w-[90px]">
          {subtitle}
        </p>
      </div>
      {showArrow && (
        <div className="hidden sm:flex items-center text-muted-foreground/40 mt-[-40px]">
          <div className="w-6 h-px bg-border" />
          <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-border" />
        </div>
      )}
    </div>
  );
}
