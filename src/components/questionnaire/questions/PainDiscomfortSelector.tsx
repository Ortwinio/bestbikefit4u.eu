"use client";

import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

type PainValue = "no" | "yes";

const PAIN_KEYS: PainValue[] = ["yes", "no"];

interface PainDiscomfortSelectorProps {
  value: string | null;
  onChange: (value: string) => void;
}

export function PainDiscomfortSelector({
  value,
  onChange,
}: PainDiscomfortSelectorProps) {
  const { messages } = useDashboardMessages();
  const t = messages.questionnaire.painDiscomfort;

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">

      {/* Reference image */}
      <div className="relative w-full">
        <Image
          src="/comfort-discomfort.png"
          alt={t.imageAlt}
          width={900}
          height={400}
          className="h-auto max-h-56 w-full object-cover"
          priority
        />
      </div>

      {/* Two-card selector */}
      <div
        role="radiogroup"
        aria-label={t.radioGroupLabel}
        className="flex border-t border-border"
      >
        {PAIN_KEYS.map((key, i) => {
          const isSelected = value === key;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(key)}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-2 px-4 py-5 text-center transition-colors duration-150",
                "focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary",
                i !== 0 && "border-l border-border",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-accent"
              )}
            >
              {/* Check icon */}
              <CheckCircle2
                className={cn(
                  "h-5 w-5 transition-opacity duration-150",
                  isSelected ? "opacity-100" : "opacity-0"
                )}
              />

              <span className="text-sm font-semibold">
                {t.options[key].label}
              </span>
              <span
                className={cn(
                  "text-xs",
                  isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                )}
              >
                {t.options[key].subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Explanation panel */}
      <div className="min-h-[80px] border-t border-border px-6 py-4">
        {value && PAIN_KEYS.includes(value as PainValue) ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t.options[value as PainValue].tooltip}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">{t.selectPrompt}</p>
        )}
      </div>
    </div>
  );
}
