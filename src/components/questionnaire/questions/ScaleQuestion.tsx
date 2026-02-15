"use client";

import { cn } from "@/utils/cn";

interface ScaleConfig {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
}

interface ScaleQuestionProps {
  config: ScaleConfig;
  value: number | null;
  onChange: (value: number) => void;
}

export function ScaleQuestion({ config, value, onChange }: ScaleQuestionProps) {
  const { min, max, minLabel, maxLabel } = config;
  const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="space-y-4">
      {/* Scale buttons */}
      <div className="flex justify-between gap-2">
        {steps.map((step) => {
          const isSelected = value === step;

          return (
            <button
              key={step}
              type="button"
              onClick={() => onChange(step)}
              className={cn(
                "flex-1 h-12 rounded-lg border-2 font-medium transition-all",
                isSelected
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
              )}
            >
              {step}
            </button>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex justify-between text-sm text-gray-500">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
