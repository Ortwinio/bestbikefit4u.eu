"use client";

import { useFormContext, Controller } from "react-hook-form";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Selectable } from "@/components/ui";
import { flexibilityTests } from "@/lib/validations/profile";

export function StepFlexibility() {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-lg font-medium text-[color:var(--foreground)]">
          Hamstring Flexibility Test
        </h3>
        <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
          Your flexibility affects how aggressive your riding position can be.
          Complete this simple test to help us personalize your fit.
        </p>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]/35 p-4">
        <h4 className="mb-2 font-medium text-[color:var(--foreground)]">
          How to perform the test
        </h4>
        <ol className="list-inside list-decimal space-y-1 text-sm text-[color:var(--muted-foreground)]">
          <li>Sit on the floor with legs straight out in front</li>
          <li>Keep your knees flat on the ground</li>
          <li>Reach forward with both hands toward your toes</li>
          <li>Note how far you can comfortably reach</li>
        </ol>
      </div>

      <Controller
        name="flexibilityScore"
        control={control}
        render={({ field }) => {
          const legendId = `${field.name}-legend`;

          return (
            <fieldset className="space-y-3">
              <legend
                id={legendId}
                className="text-sm font-medium text-[color:var(--foreground)]"
              >
                Select your result
              </legend>
              <RadioGroup<number>
                aria-labelledby={legendId}
                className="grid gap-3"
                name={field.name}
                value={field.value ?? undefined}
                onValueChange={(next) => field.onChange(next)}
              >
                {flexibilityTests.map((test) => (
                  <Selectable
                    key={test.score}
                    mode="radio"
                    value={test.score}
                    variant="card"
                    label={test.label}
                    badge={
                      <span className="rounded-full bg-[color:var(--secondary)] px-2 py-0.5 text-xs text-[color:var(--secondary-foreground)]">
                        {test.testResult}
                      </span>
                    }
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
          Lower flexibility scores will result in a more upright position with
          less handlebar drop. This protects your lower back and reduces strain.
          Higher flexibility allows for a more aggressive, aerodynamic position.
        </p>
      </div>
    </div>
  );
}
