"use client";

import { useFormContext, Controller, useWatch } from "react-hook-form";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Selectable, InfoBox } from "@/components/ui";
import { CoreStabilityBar } from "@/components/profile/CoreStabilityBar";
import { coreStabilityTests } from "@/lib/validations/profile";
import { HelpCircle, Timer, Dumbbell } from "lucide-react";

export function StepCoreStability() {
  const { control } = useFormContext();
  const selectedScore = useWatch({ control, name: "coreStabilityScore" });

  return (
    <div className="space-y-6">

      {/* 1. Why this matters */}
      <InfoBox
        variant="primary"
        icon={<HelpCircle className="h-4 w-4 text-[color:var(--primary)]" />}
      >
        <p className="font-medium text-[color:var(--foreground)]">
          Why core stability determines your riding position
        </p>
        <p className="mt-1 text-[color:var(--muted-foreground)]">
          Your core muscles — abs, lower back, and stabilisers — are what hold
          your torso steady on the bike. A weak core means your body will
          compensate by shifting weight onto the hands and shoulders, causing
          neck and wrist pain. A strong core lets you sustain a lower, longer
          position for longer. This test helps us decide how aggressive a
          position your body can actually maintain on a real ride.
        </p>
      </InfoBox>

      {/* 2. Test instructions */}
      <InfoBox
        variant="secondary"
        icon={<Timer className="h-4 w-4 text-[color:var(--primary)]" />}
      >
        <p className="font-medium text-[color:var(--foreground)]">
          Front plank hold test — how to do it
        </p>
        <ol className="mt-1 list-inside list-decimal space-y-1 text-[color:var(--muted-foreground)]">
          <li>Get into a front plank position — forearms on the floor, toes on the floor</li>
          <li>Keep a straight line from your head through your heels — no sagging hips</li>
          <li>Do not let your hips rise (piking) or sink (sagging)</li>
          <li>Start a timer and hold with perfect form</li>
          <li>Stop the timer the moment your form breaks down</li>
          <li>Choose the result below that matches your hold time</li>
        </ol>
      </InfoBox>

      {/* 3. Selection */}
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
                How long can you hold a plank with perfect form?
              </legend>
              <RadioGroup<number>
                aria-labelledby={legendId}
                className="grid gap-3"
                name={field.name}
                value={field.value ?? undefined}
                onValueChange={(next) => field.onChange(Number(next))}
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

      {/* 4. Live preview — same card as My Profile */}
      {selectedScore && (
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[color:var(--muted-foreground)]">
            Your core stability result
          </p>
          <CoreStabilityBar score={Number(selectedScore)} />
        </div>
      )}

      {/* 5. How this affects the fit */}
      <InfoBox
        variant="primary"
        icon={<Dumbbell className="h-4 w-4 text-[color:var(--primary)]" />}
      >
        <p className="font-medium text-[color:var(--foreground)]">
          How this shapes your bike fit
        </p>
        <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <p className="font-medium text-[color:var(--foreground)]">Low stability (1–2)</p>
            <p className="text-[color:var(--muted-foreground)]">
              We limit reach and handlebar drop to reduce shoulder and neck load.
              More weight through the sit bones, less through the hands.
            </p>
          </div>
          <div>
            <p className="font-medium text-[color:var(--foreground)]">Good stability (4–5)</p>
            <p className="text-[color:var(--muted-foreground)]">
              A stretched-out, performance-oriented position becomes sustainable.
              Greater reach and lower bars are viable without pain or fatigue.
            </p>
          </div>
        </div>
      </InfoBox>

    </div>
  );
}
