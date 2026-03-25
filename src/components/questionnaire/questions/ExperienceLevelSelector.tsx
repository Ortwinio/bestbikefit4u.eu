"use client";

import Image from "next/image";
import { cn } from "@/utils/cn";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/SegmentedControl";
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

      {/* Segmented control */}
      <div className="border-t border-[color:var(--border)] px-6 py-5">
        <SegmentedControl
          value={value ?? ""}
          onValueChange={(v) => onChange(v as ExperienceLevel)}
          aria-label={t.radioGroupLabel}
          className="w-full"
        >
          {LEVEL_KEYS.map((key) => (
            <SegmentedControlItem
              key={key}
              value={key}
              className="flex-1 py-2.5 text-sm data-checked:bg-[color:var(--primary)] data-checked:text-[color:var(--primary-foreground)]"
            >
              {t.levels[key].label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
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
