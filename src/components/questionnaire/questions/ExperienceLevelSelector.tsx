"use client";

import Image from "next/image";
import { cn } from "@/utils/cn";
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

  const levelIndex = value !== null ? LEVEL_KEYS.indexOf(value) : -1;

  // Fill width: 0% at beginner, 50% at intermediate, 100% at advanced
  const fillPercent = levelIndex >= 0 ? (levelIndex / 2) * 100 : 0;

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)]">

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

      {/* Slider */}
      <div className="border-t border-[color:var(--border)] px-6 pt-6 pb-3">

        {/* Track + dots */}
        <div
          role="radiogroup"
          aria-label={t.radioGroupLabel}
          className="relative flex items-center justify-between"
        >
          {/* Track background */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-[color:var(--secondary)]" />

          {/* Filled portion */}
          <div
            className="pointer-events-none absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-[color:var(--primary)] transition-[width] duration-300 ease-out"
            style={{ width: `${fillPercent}%` }}
          />

          {/* Snap-point buttons */}
          {LEVEL_KEYS.map((key, i) => {
            const isActive = i === levelIndex;
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onChange(key)}
                className={cn(
                  "relative z-10 rounded-full bg-[color:var(--primary)] transition-all duration-200",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--primary)]",
                  isActive
                    ? "size-7 border-[3px] border-[color:var(--card)] shadow-[0_2px_10px_rgba(0,0,0,0.25)]"
                    : "size-3 opacity-50 hover:opacity-90 hover:scale-125"
                )}
              />
            );
          })}
        </div>

        {/* Position labels */}
        <div className="mt-3 grid grid-cols-3 text-xs font-medium">
          {LEVEL_KEYS.map((key, i) => (
            <span
              key={key}
              className={cn(
                "transition-colors duration-150",
                i === 0 ? "text-left" : i === 1 ? "text-center" : "text-right",
                key === value
                  ? "font-semibold text-[color:var(--primary)]"
                  : "text-[color:var(--muted-foreground)]"
              )}
            >
              {t.levels[key].label}
            </span>
          ))}
        </div>
      </div>

      {/* Explanation panel */}
      <div className="min-h-[88px] border-t border-[color:var(--border)] px-6 py-4">
        {value ? (
          <>
            <p className="text-sm font-semibold text-[color:var(--foreground)]">
              {t.levels[value].label}
              <span className="ml-1.5 text-xs font-normal text-[color:var(--muted-foreground)]">
                · {t.levels[value].subtitle}
              </span>
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-[color:var(--muted-foreground)]">
              {t.levels[value].tooltip}
            </p>
          </>
        ) : (
          <p className="text-xs text-[color:var(--muted-foreground)]">
            {t.selectPrompt}
          </p>
        )}
      </div>
    </div>
  );
}
