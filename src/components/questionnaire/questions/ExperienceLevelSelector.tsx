"use client";

import Image from "next/image";
import { cn } from "@/utils/cn";
import {
  SliderControl,
  SliderIndicator,
  SliderRoot,
  SliderThumb,
  SliderTrack,
} from "@/components/prototyper-ui/ui/slider";
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
  // Default thumb to center (intermediate) when nothing is selected yet
  const sliderIndex = levelIndex >= 0 ? levelIndex : 1;

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
        <SliderRoot
          min={0}
          max={2}
          step={1}
          value={[sliderIndex]}
          onValueChange={(vals) => {
            const idx = Array.isArray(vals) ? vals[0] : vals;
            if (typeof idx === "number") {
              onChange(LEVEL_KEYS[idx] ?? "intermediate");
            }
          }}
          aria-label={t.radioGroupLabel}
        >
          <SliderControl>
            <SliderTrack>
              <SliderIndicator />
              <SliderThumb />
            </SliderTrack>
          </SliderControl>
        </SliderRoot>

        {/* Position labels */}
        <div className="mt-2 grid grid-cols-3 text-xs font-medium">
          {LEVEL_KEYS.map((key, i) => (
            <span
              key={key}
              className={cn(
                "transition-colors duration-150",
                i === 0 && "text-left",
                i === 1 && "text-center",
                i === 2 && "text-right",
                key === value
                  ? "text-[color:var(--foreground)]"
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
