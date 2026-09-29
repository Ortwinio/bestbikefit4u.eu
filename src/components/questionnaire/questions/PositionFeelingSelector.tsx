"use client";

import { OptionCard } from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

const EXCLUSIVE_VALUES = ["good", "no_bike"];

interface Option {
  value: string;
  label: string;
}

interface PositionFeelingCopy {
  imageAlt: string;
  orDivider: string;
  options: Record<string, { subtitle: string; tooltip: string }>;
}

interface PositionFeelingSelectorProps {
  options: Option[];
  copy: PositionFeelingCopy;
  value: string[];
  onChange: (value: string[]) => void;
}

export function PositionFeelingSelector({
  options,
  copy,
  value,
  onChange,
}: PositionFeelingSelectorProps) {
  const { messages } = useDashboardMessages();

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
    <div className="space-y-4">
      <div role="group" aria-label={messages.questionnaire.multiChoice.legend} className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            selected={value.includes(option.value)}
            onClick={() => EXCLUSIVE_VALUES.includes(option.value) ? handleExclusive(option.value) : handleMulti(option.value)}
            className="min-h-[88px] min-w-0 rounded-[18px] p-4"
          />
        ))}
      </div>
      {selectedValues.length > 0 && (
        <div className="space-y-4 rounded-2xl bg-[var(--bbf-petrol-zacht)] p-4" aria-live="polite">
          {selectedValues.map((selectedValue) => {
            const details = copy.options[selectedValue];
            if (!details) return null;
            const label = options.find((option) => option.value === selectedValue)?.label ?? selectedValue;
            return (
              <div key={selectedValue}>
                <p className="text-sm font-semibold">{label}</p>
                <p className="mt-1 text-sm font-medium">{details.subtitle}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{details.tooltip}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
