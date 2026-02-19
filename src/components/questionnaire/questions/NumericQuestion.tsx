"use client";

import { useId, useState } from "react";
import { cn } from "@/utils/cn";
import { FieldLabel } from "@/components/ui";
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
  const inputId = `question-numeric-${useId().replace(/:/g, "")}`;
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [localInput, setLocalInput] = useState("");

  const { min, max, unit } = config || {};
  const unitLabel = unit ? ` ${unit}` : "";
  const tooltip = messages.questionnaire.numeric.tooltip;

  // Display local input while focused, otherwise show prop value
  const displayValue = isFocused ? localInput : (value !== null ? String(value) : "");

  const handleFocus = () => {
    setIsFocused(true);
    setLocalInput(value !== null ? String(value) : "");
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalInput(raw);

    if (raw === "") {
      setError(null);
      onChange(null);
      return;
    }

    const num = parseFloat(raw);

    if (isNaN(num)) {
      setError(messages.questionnaire.numeric.errors.invalidNumber);
      return;
    }

    if (min !== undefined && num < min) {
      setError(
        formatMessage(messages.questionnaire.numeric.errors.min, {
          min,
          unit: unitLabel,
        })
      );
      return;
    }

    if (max !== undefined && num > max) {
      setError(
        formatMessage(messages.questionnaire.numeric.errors.max, {
          max,
          unit: unitLabel,
        })
      );
      return;
    }

    setError(null);
    onChange(num);
  };

  return (
    <div className="space-y-2">
      <FieldLabel
        label={messages.questionnaire.numeric.label}
        htmlFor={inputId}
        tooltip={tooltip}
      />
      <div className="relative">
        <input
          id={inputId}
          type="number"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          min={min}
          max={max}
          className={cn(
            "w-full px-4 py-3 rounded-lg border-2 text-lg font-medium transition-colors",
            "focus:outline-none focus:ring-0",
            error
              ? "border-red-300 focus:border-red-500"
              : "border-gray-200 focus:border-blue-600"
          )}
          placeholder={`${messages.questionnaire.numeric.placeholder}${
            unit ? ` (${unit})` : ""
          }`}
        />
        {unit && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
            {unit}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {min !== undefined && max !== undefined && !error && (
        <p className="text-sm text-gray-500">
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
