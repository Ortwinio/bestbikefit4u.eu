"use client";

import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/cn";

const EXCLUSIVE_VALUES = ["good", "no_bike"];

const OPTION_DETAILS: Record<string, { subtitle: string; tooltip: string }> = {
  good: {
    subtitle: "Minor adjustments needed",
    tooltip: "Your position feels mostly comfortable with small improvements possible.",
  },
  no_bike: {
    subtitle: "We'll base your fit entirely on your body measurements and riding profile.",
    tooltip: "We'll base your fit entirely on your body measurements and riding profile.",
  },
  too_stretched: {
    subtitle: "Too long a reach",
    tooltip: "Your arms, neck, or lower back may feel overstretched on longer rides.",
  },
  too_compact: {
    subtitle: "Feeling cramped or too upright",
    tooltip: "Your position may limit breathing, comfort, or power output.",
  },
  too_low: {
    subtitle: "Too much pressure on hands or back",
    tooltip: "You may feel strain in your neck, shoulders, or lower back.",
  },
  too_high: {
    subtitle: "Not enough forward position",
    tooltip: "You may feel less efficient or lack front-end control.",
  },
  saddle_too_high: {
    subtitle: "Possible hip rocking",
    tooltip:
      "A saddle that's too high causes the hips to rock, stresses the knees, and reduces power transfer.",
  },
  saddle_too_low: {
    subtitle: "Increased knee strain",
    tooltip:
      "A saddle that's too low compresses the knee joint and limits full leg extension.",
  },
};

interface Option {
  value: string;
  label: string;
}

interface PositionFeelingSelectorProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
}

export function PositionFeelingSelector({
  options,
  value,
  onChange,
}: PositionFeelingSelectorProps) {
  const exclusiveOptions = options.filter((o) => EXCLUSIVE_VALUES.includes(o.value));
  const multiOptions = options.filter((o) => !EXCLUSIVE_VALUES.includes(o.value));

  function handleExclusive(optionValue: string) {
    onChange(value.includes(optionValue) ? [] : [optionValue]);
  }

  function handleMulti(optionValue: string) {
    const withoutExclusive = value.filter((v) => !EXCLUSIVE_VALUES.includes(v));
    if (withoutExclusive.includes(optionValue)) {
      onChange(withoutExclusive.filter((v) => v !== optionValue));
    } else {
      onChange([...withoutExclusive, optionValue]);
    }
  }

  const selectedValues = value.filter(
    (v) => options.some((o) => o.value === v) && v !== "no_bike"
  );

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
      {/* Illustration */}
      <div className="relative w-full">
        <Image
          src="/comfort-discomfort.png"
          alt="Illustration of comfortable versus uncomfortable cycling positions"
          width={900}
          height={400}
          className="h-auto max-h-[214px] w-full object-cover"
          priority
        />
      </div>

      {/* Exclusive options: 2-column, mutually exclusive */}
      <div role="radiogroup" className="grid grid-cols-2 divide-x divide-border border-t border-border">
        {exclusiveOptions.map((option) => {
          const isSelected = value.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleExclusive(option.value)}
              className={cn(
                "relative flex flex-col items-center gap-1 px-4 py-3 text-center transition-colors duration-150",
                "focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-accent"
              )}
            >
              <CheckCircle2
                className={cn(
                  "h-5 w-5 transition-opacity duration-150",
                  isSelected ? "opacity-100" : "opacity-0"
                )}
              />
              <span className="text-sm font-semibold leading-snug">{option.label}</span>
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 border-t border-border px-4 py-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">
          or describe what feels off
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Multi-select options */}
      <div
        role="group"
        className="grid grid-cols-2 divide-x divide-y divide-border border-t border-border"
      >
        {multiOptions.map((option) => {
          const isSelected = value.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => handleMulti(option.value)}
              className={cn(
                "relative flex flex-col items-center gap-1 px-4 py-3 text-center transition-colors duration-150",
                "focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-accent"
              )}
            >
              <CheckCircle2
                className={cn(
                  "absolute top-2 right-2 h-4 w-4 transition-opacity duration-150",
                  isSelected ? "opacity-100" : "opacity-0"
                )}
              />
              <span className="text-sm font-semibold leading-snug">{option.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tooltip panel — only shown when something is selected */}
      {selectedValues.length > 0 && (
        <div className="border-t border-border px-6 py-4">
          <div className="space-y-3">
            {selectedValues.map((v) => {
              const details = OPTION_DETAILS[v];
              if (!details) return null;
              const label = options.find((o) => o.value === v)?.label ?? v;
              return (
                <div key={v}>
                  <p className="text-xs font-semibold text-foreground">{label}</p>
                  <p className="mt-0.5 text-xs font-medium text-foreground/70">
                    {details.subtitle}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {details.tooltip}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
