"use client";

import { useState } from "react";
import { NumberInput } from "@/components/ui";
import { formatMessage } from "@/i18n/dashboardMessages";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

interface NumericConfig {
  min?: number;
  max?: number;
  unit?: string;
}

interface NumericQuestionProps {
  config?: NumericConfig;
  value: number | null;
  onChange: (value: number | null) => void;
}

export function NumericQuestion({
  config,
  value,
  onChange,
}: NumericQuestionProps) {
  const { messages } = useDashboardMessages();
  const [error, setError] = useState<string | null>(null);

  const { min, max, unit } = config || {};
  const unitLabel = unit ? ` ${unit}` : "";
  const tooltip = messages.questionnaire.numeric.tooltip;

  const handleChange = (nextValue: number | null) => {
    if (nextValue === null) {
      setError(null);
      onChange(null);
      return;
    }

    if (min !== undefined && nextValue < min) {
      setError(
        formatMessage(messages.questionnaire.numeric.errors.min, {
          min,
          unit: unitLabel,
        })
      );
      return;
    }

    if (max !== undefined && nextValue > max) {
      setError(
        formatMessage(messages.questionnaire.numeric.errors.max, {
          max,
          unit: unitLabel,
        })
      );
      return;
    }

    setError(null);
    onChange(nextValue);
  };

  return (
    <div className="space-y-2">
      <NumberInput
        label={messages.questionnaire.numeric.label}
        tooltip={tooltip}
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        step="any"
        unit={unit}
        error={error ?? undefined}
        allowOutOfRange
        inputClassName="text-lg font-medium"
        placeholder={`${messages.questionnaire.numeric.placeholder}${
          unit ? ` (${unit})` : ""
        }`}
      />

      {min !== undefined && max !== undefined && !error && (
        <p className="text-sm text-[color:var(--muted-foreground)]">
          {formatMessage(messages.questionnaire.numeric.range, {
            min,
            max,
            unit: unitLabel,
          })}
        </p>
      )}
    </div>
  );
}
