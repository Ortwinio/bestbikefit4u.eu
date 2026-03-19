"use client";

import { Selectable } from "@/components/ui";

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
            <Selectable
              key={step}
              onClick={() => onChange(step)}
              selected={isSelected}
              variant="segment"
              className="h-12"
            >
              {step}
            </Selectable>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex justify-between text-sm text-[color:var(--muted-foreground)]">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
