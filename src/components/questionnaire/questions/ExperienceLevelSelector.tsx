"use client";

import { cn } from "@/utils/cn";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/prototyper-ui/ui/tooltip";
import { Info } from "lucide-react";

type ExperienceLevel = "beginner" | "intermediate" | "advanced";

interface ExperienceLevelSelectorProps {
  value: ExperienceLevel | null;
  onChange: (value: ExperienceLevel) => void;
}

const LEVELS: {
  value: ExperienceLevel;
  label: string;
  subtitle: string;
  tooltip: string;
}[] = [
  {
    value: "beginner",
    label: "Beginner",
    subtitle: "Comfort first",
    tooltip:
      "We assume lower baseline flexibility and core stability, which is completely normal. Your fit will be more upright: less hip closure, less lower-back strain, and a saddle-to-bar height difference that is easier to sustain. Choosing this if it does not match your body leads to a position that may feel too relaxed and reduce pedalling efficiency.",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    subtitle: "Balanced",
    tooltip:
      "Average flexibility and core strength. Your fit uses a neutral handlebar position — neither aggressive nor fully upright. This suits most regular riders doing multi-hour rides on varied terrain. The engine applies no modifier to bar drop for this level.",
  },
  {
    value: "advanced",
    label: "Advanced",
    subtitle: "Performance",
    tooltip:
      "Higher tolerance for hip closure, fuller knee extension at the bottom of the pedal stroke, and the core strength to hold an aerodynamic posture for extended periods. Your fit will be more aggressive — lower bars, longer reach. Be honest: if your core and flexibility do not support this, the position will cause discomfort within the first 30 minutes.",
  },
];

export function ExperienceLevelSelector({
  value,
  onChange,
}: ExperienceLevelSelectorProps) {
  return (
    <TooltipProvider delay={150} closeDelay={50}>
      <div
        role="radiogroup"
        aria-label="Cycling experience level"
        className="flex w-full overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)]"
      >
        {LEVELS.map((level, index) => {
          const isSelected = value === level.value;
          const isFirst = index === 0;

          return (
            <button
              key={level.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(level.value)}
              className={cn(
                "group relative flex flex-1 flex-col items-center gap-1 px-3 py-4 text-center transition-colors duration-150 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[color:var(--primary)]",
                !isFirst && "border-l border-[color:var(--border)]",
                isSelected
                  ? "bg-[color:color-mix(in_oklch,var(--primary)_14%,var(--card)_86%)] text-[color:var(--foreground)]"
                  : "bg-[color:var(--card)] text-[color:var(--muted-foreground)] hover:bg-[color:var(--accent)] hover:text-[color:var(--foreground)]"
              )}
            >
              {/* Selected indicator bar at top */}
              <span
                className={cn(
                  "absolute inset-x-0 top-0 h-0.5 transition-colors duration-150",
                  isSelected
                    ? "bg-[color:var(--primary)]"
                    : "bg-transparent"
                )}
              />

              {/* Label + info icon row */}
              <span className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "text-sm font-semibold",
                    isSelected && "text-[color:var(--foreground)]"
                  )}
                >
                  {level.label}
                </span>

                <Tooltip>
                  <TooltipTrigger
                    type="button"
                    aria-label={`More about ${level.label}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)] focus-visible:outline-2 focus-visible:outline-[color:var(--primary)]"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    sideOffset={8}
                    className="max-w-[260px] text-xs leading-relaxed"
                  >
                    {level.tooltip}
                  </TooltipContent>
                </Tooltip>
              </span>

              {/* Subtitle */}
              <span className="text-xs text-[color:var(--muted-foreground)]">
                {level.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
