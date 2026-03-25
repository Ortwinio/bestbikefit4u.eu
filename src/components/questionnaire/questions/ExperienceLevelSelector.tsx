"use client";

import Image from "next/image";
import { CheckCircle2, Info } from "lucide-react";
import { cn } from "@/utils/cn";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/prototyper-ui/ui/tooltip";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

type ExperienceLevel = "beginner" | "intermediate" | "advanced";

const LEVEL_KEYS: ExperienceLevel[] = ["beginner", "intermediate", "advanced"];

interface ExperienceLevelSelectorProps {
  value: ExperienceLevel | null;
  onChange: (value: ExperienceLevel) => void;
}

export function ExperienceLevelSelector({
  value,
  onChange,
}: ExperienceLevelSelectorProps) {
  const { messages } = useDashboardMessages();
  const t = messages.questionnaire.experienceLevel;

  return (
    <TooltipProvider delay={150} closeDelay={50}>
      <div className="space-y-0 overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)]">

        {/* Reference image */}
        <div className="relative w-full">
          <Image
            src="/bestbikefit4u-beginner-intermediate-advanced.png"
            alt={t.imageAlt}
            width={900}
            height={400}
            className="h-auto w-full object-cover"
            priority
          />
        </div>

        {/* Selector bar */}
        <div
          role="radiogroup"
          aria-label={t.radioGroupLabel}
          className="flex w-full border-t border-[color:var(--border)]"
        >
          {LEVEL_KEYS.map((key, index) => {
            const level = t.levels[key];
            const isSelected = value === key;
            const isFirst = index === 0;

            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onChange(key)}
                className={cn(
                  "group relative flex flex-1 flex-col items-start gap-2 px-4 py-4 text-left transition-colors duration-150 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[color:var(--primary)]",
                  !isFirst && "border-l border-[color:var(--border)]",
                  isSelected
                    ? "bg-[color:color-mix(in_oklch,var(--primary)_18%,var(--card)_82%)]"
                    : "bg-[color:var(--card)] hover:bg-[color:var(--accent)]"
                )}
              >
                {/* Selected indicator bar at top */}
                <span
                  className={cn(
                    "absolute inset-x-0 top-0 h-1 transition-colors duration-150",
                    isSelected ? "bg-[color:var(--primary)]" : "bg-transparent"
                  )}
                />

                {/* Label + icons */}
                <span className="flex w-full items-center justify-between gap-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-[color:var(--foreground)]">
                      {level.label}
                    </span>
                    <span className="text-xs text-[color:var(--muted-foreground)]">
                      · {level.subtitle}
                    </span>
                  </span>

                  <span className="flex items-center gap-1">
                    {/* Check icon — visible when selected */}
                    <CheckCircle2
                      className={cn(
                        "h-4 w-4 shrink-0 text-[color:var(--primary)] transition-opacity duration-150",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />

                    <Tooltip>
                      <TooltipTrigger
                        type="button"
                        aria-label={t.moreAbout.replace("{level}", level.label)}
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
