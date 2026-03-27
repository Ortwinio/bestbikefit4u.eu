"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface Option {
  value: string;
  label: string;
  description?: string;
}

interface SingleChoiceTooltipQuestionProps {
  name: string;
  options: Option[];
  tooltips?: Record<string, string>;
  value: string | null;
  onChange: (value: string) => void;
}

export function SingleChoiceTooltipQuestion({
  options,
  tooltips,
  value,
  onChange,
}: SingleChoiceTooltipQuestionProps) {
  const selected = options.find((o) => o.value === value) ?? null;
  const tooltip = selected
    ? (tooltips?.[selected.value] ?? selected.description ?? null)
    : null;

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
      <div role="radiogroup" className="divide-y divide-border">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.value)}
              className={cn(
                "relative flex w-full items-center gap-4 px-5 py-3 text-left transition-colors duration-150",
                "focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-accent"
              )}
            >
              <CheckCircle2
                className={cn(
                  "h-4 w-4 shrink-0 transition-opacity duration-150",
                  isSelected ? "opacity-100" : "opacity-0"
                )}
              />
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tooltip panel */}
      {tooltip && selected && (
        <div className="border-t border-border px-6 py-4">
          <p className="text-xs font-semibold text-foreground">{selected.label}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {tooltip}
          </p>
        </div>
      )}
    </div>
  );
}
