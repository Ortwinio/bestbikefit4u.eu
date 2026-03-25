"use client";

import {
  Bone,
  Activity,
  PersonStanding,
  Hand,
  Bike,
  Footprints,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

type PainAreaKey =
  | "knee_front"
  | "knee_back"
  | "lower_back"
  | "neck"
  | "hands"
  | "saddle"
  | "feet";

const AREA_KEYS: PainAreaKey[] = [
  "knee_front",
  "knee_back",
  "lower_back",
  "neck",
  "hands",
  "saddle",
  "feet",
];

const AREA_ICONS: Record<PainAreaKey, LucideIcon> = {
  knee_front: Bone,
  knee_back: Bone,
  lower_back: Activity,
  neck: PersonStanding,
  hands: Hand,
  saddle: Bike,
  feet: Footprints,
};

interface PainAreasSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function PainAreasSelector({ value, onChange }: PainAreasSelectorProps) {
  const { messages } = useDashboardMessages();
  const t = messages.questionnaire.painAreas;

  function toggle(key: PainAreaKey) {
    if (value.includes(key)) {
      onChange(value.filter((v) => v !== key));
    } else {
      onChange([...value, key]);
    }
  }

  const selectedAreas = AREA_KEYS.filter((k) => value.includes(k));

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">

      {/* Body area grid */}
      <div
        role="group"
        className="grid grid-cols-2 divide-x divide-y divide-border"
      >
        {AREA_KEYS.map((key, i) => {
          const isSelected = value.includes(key);
          const Icon = AREA_ICONS[key];
          // Last item: if odd count, span full width
          const isLast = i === AREA_KEYS.length - 1;
          const isOddTotal = AREA_KEYS.length % 2 !== 0;

          return (
            <button
              key={key}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => toggle(key)}
              className={cn(
                "relative flex flex-col items-center gap-2 px-4 py-5 text-center transition-colors duration-150",
                "focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary",
                isLast && isOddTotal && "col-span-2",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-accent"
              )}
            >
              {/* Check indicator */}
              <CheckCircle2
                className={cn(
                  "absolute top-2 right-2 h-4 w-4 transition-opacity duration-150",
                  isSelected ? "opacity-100" : "opacity-0"
                )}
              />

              <Icon className="h-6 w-6 shrink-0" />

              <span className="text-sm font-semibold leading-tight">
                {t.areas[key].label}
              </span>
              <span
                className={cn(
                  "text-xs",
                  isSelected
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground"
                )}
              >
                {t.areas[key].subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Explanation panel */}
      <div className="min-h-[80px] border-t border-border px-6 py-4">
        {selectedAreas.length > 0 ? (
          <div className="space-y-3">
            {selectedAreas.map((key) => (
              <div key={key}>
                <p className="text-xs font-semibold text-foreground">
                  {t.areas[key].label}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {t.areas[key].tooltip}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{t.selectPrompt}</p>
        )}
      </div>
    </div>
  );
}
