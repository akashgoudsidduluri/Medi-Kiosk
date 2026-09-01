import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface PriorityBadgeProps {
  priority: "routine" | "priority" | "urgent";
  size?: "sm" | "md" | "lg";
}

const config = {
  routine: {
    label: "Routine",
    icon: CheckCircle,
    className: "bg-routine-green/10 text-routine-green border-routine-green/20",
  },
  priority: {
    label: "Priority",
    icon: Clock,
    className: "bg-priority-amber/10 text-priority-amber border-priority-amber/20",
  },
  urgent: {
    label: "Urgent",
    icon: AlertTriangle,
    className: "bg-urgent-red/10 text-urgent-red border-urgent-red/20",
  },
};

const sizeConfig = {
  sm: "px-2 py-0.5 text-[10px] gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
  lg: "px-3 py-1.5 text-sm gap-2",
};

const iconSize = {
  sm: "w-3 h-3",
  md: "w-3.5 h-3.5",
  lg: "w-4 h-4",
};

export function PriorityBadge({ priority, size = "md" }: PriorityBadgeProps) {
  const { label, icon: Icon, className } = config[priority];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold border uppercase tracking-wide",
        className,
        sizeConfig[size]
      )}
    >
      <Icon className={iconSize[size]} />
      {label}
    </span>
  );
}
