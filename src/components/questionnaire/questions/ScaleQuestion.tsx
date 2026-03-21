"use client";

import { useId } from "react";
import { RadioGroup } from "@base-ui/react/radio-group";
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
  const legendId = useId();

  return (
    <fieldset className="space-y-4">
      <legend id={legendId} className="sr-only">
        Select a scale value
      </legend>
      <RadioGroup<number>
        aria-labelledby={legendId}
        className="flex justify-between gap-2"
        value={value ?? undefined}
        onValueChange={(next) => onChange(next)}
      >
        {steps.map((step) => {
          return (
            <Selectable
              key={step}
              mode="radio"
              value={step}
              variant="segment"
              className="h-12"
            >
              {step}
            </Selectable>
          );
        })}
      </RadioGroup>

      <div className="flex justify-between text-sm text-[color:var(--muted-foreground)]">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </fieldset>
  );
}
