"use client";

import Image from "next/image";
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
  explanation: string;
  tooltip: string;
}[] = [
  {
    value: "beginner",
    label: "Beginner",
    subtitle: "Comfort first",
    explanation:
      "We assume lower baseline flexibility and core stability. Your fit will be more upright — less hip closure, less lower-back strain, and a saddle-to-bar height that is easier to sustain on longer rides.",
    tooltip:
      "Choosing a level above your current fitness leads to a position you cannot hold comfortably. Lower bars increase hip closure and require core strength to avoid back pain. If in doubt, start here.",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    subtitle: "Balanced",
    explanation:
      "Average flexibility and core strength. Your fit uses a neutral handlebar position — neither aggressive nor fully upright. Suited for regular multi-hour rides across varied terrain.",
    tooltip:
      "This level applies no modifier to bar drop. It is the baseline most riders fit into after 6–12 months of regular riding. Your body can sustain moderate hip closure without strain.",
  },
  {
    value: "advanced",
    label: "Advanced",
    subtitle: "Performance",
    explanation:
      "Higher tolerance for hip closure, fuller knee extension, and the core strength to hold an aerodynamic posture for extended periods. Your fit will be more aggressive — lower bars, longer reach.",
    tooltip:
      "Be honest: if your core and flexibility do not support this, the position will cause discomfort within the first 30 minutes. An aggressive fit only improves performance when your body is conditioned for it.",
  },
];

export function ExperienceLevelSelector({
  value,
  onChange,
}: ExperienceLevelSelectorProps) {
  return (
    <TooltipProvider delay={150} closeDelay={50}>
      <div className="space-y-0 overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)]">

        {/* Reference image */}
        <div className="relative w-full">
          <Image
            src="/bestbikefit4u-beginner-intermediate-advanced.png"
            alt="Cycling positions from beginner (upright) through intermediate to advanced (aerodynamic)"
            width={900}
            height={400}
            className="h-auto w-full object-cover"
            priority
          />
        </div>

        {/* Selector bar */}
        <div
          role="radiogroup"
          aria-label="Cycling experience level"
          className="flex w-full border-t border-[color:var(--border)]"
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
                  "group relative flex flex-1 flex-col items-start gap-2 px-4 py-4 text-left transition-colors duration-150 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[color:var(--primary)]",
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
                    isSelected ? "bg-[color:var(--primary)]" : "bg-transparent"
                  )}
                />

                {/* Label + info icon */}
                <span className="flex w-full items-center justify-between gap-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-[color:var(--foreground)]">
                      {level.label}
                    </span>
                    <span className="text-xs text-[color:var(--muted-foreground)]">
                      · {level.subtitle}
                    </span>
                  </span>

                  <Tooltip>
                    <TooltipTrigger
                      type="button"
                      aria-label={`More about ${level.label}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)] focus-visible:outline-2 focus-visible:outline-[color:var(--primary)]"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      sideOffset={8}
                      className="max-w-[240px] text-xs leading-relaxed"
                    >
                      {level.tooltip}
                    </TooltipContent>
                  </Tooltip>
                </span>

                {/* Explanation text */}
                <p className="text-xs leading-relaxed text-[color:var(--muted-foreground)]">
                  {level.explanation}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
