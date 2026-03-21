"use client";

import { useFormContext, Controller } from "react-hook-form";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Selectable } from "@/components/ui";
import { coreStabilityTests } from "@/lib/validations/profile";
import { Timer } from "lucide-react";

export function StepCoreStability() {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-lg font-medium text-[color:var(--foreground)]">
          Core Stability Test
        </h3>
        <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
          Your core strength determines how long you can maintain an aggressive
          position without fatigue. This helps us set appropriate reach and drop
          limits.
        </p>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]/35 p-4">
        <div className="flex items-start gap-3">
          <Timer className="mt-0.5 h-5 w-5 text-[color:var(--primary)]" />
          <div>
            <h4 className="mb-2 font-medium text-[color:var(--foreground)]">
              Front Plank Hold Test
            </h4>
            <ol className="list-inside list-decimal space-y-1 text-sm text-[color:var(--muted-foreground)]">
              <li>Get into a front plank position on forearms and toes</li>
              <li>Keep a straight line from head to heels</li>
              <li>No sagging or piking, which means raising hips</li>
              <li>Time how long you can hold with proper form</li>
              <li>Stop when form breaks down</li>
            </ol>
          </div>
        </div>
      </div>

      <Controller
        name="coreStabilityScore"
        control={control}
        render={({ field }) => {
          const legendId = `${field.name}-legend`;

          return (
            <fieldset className="space-y-3">
              <legend
                id={legendId}
                className="text-sm font-medium text-[color:var(--foreground)]"
              >
                How long can you hold a plank?
              </legend>
              <RadioGroup<number>
                aria-labelledby={legendId}
                className="grid gap-3"
                name={field.name}
                value={field.value ?? undefined}
                onValueChange={(next) => field.onChange(next)}
              >
                {coreStabilityTests.map((test) => (
                  <Selectable
                    key={test.score}
                    mode="radio"
                    value={test.score}
                    variant="card"
                    trailing={
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--secondary)] text-lg font-bold text-[color:var(--secondary-foreground)]">
                        {test.score}
                      </div>
                    }
                    label={test.label}
                    description={test.description}
                  />
                ))}
              </RadioGroup>
            </fieldset>
          );
        }}
      />

      <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
        <h4 className="mb-2 font-medium text-[color:var(--foreground)]">
          How this affects your fit
        </h4>
        <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
          Lower core stability means we&apos;ll limit how far you reach and how low
          your handlebars can be. This prevents fatigue and shoulder/neck pain.
          Stronger core allows for a more stretched-out, performance-oriented
          position.
        </p>
      </div>
    </div>
  );
}
