# 04 — Step 3: Flexibility

## Goal
Redesign `StepFlexibility.tsx` with a "why this matters" intro box, an `InfoBox` test instruction panel, and a **live `FlexibilityScale` preview** that appears and updates in real time as the user selects their result — reusing the exact same card component from the My Profile page.

## File to change
`src/components/measurements/StepFlexibility.tsx`

## New imports
```tsx
import { InfoBox } from "@/components/ui";
import { FlexibilityScale } from "@/components/profile/FlexibilityScale";
import { Info, HelpCircle, Activity } from "lucide-react";
```

## Key pattern: live preview using `useWatch`

The component uses `useFormContext`. To show a live preview, add `useWatch`:

```tsx
import { useFormContext, Controller, useWatch } from "react-hook-form";

export function StepFlexibility() {
  const { control } = useFormContext();
  const selectedScore = useWatch({ control, name: "flexibilityScore" });
  // ...
}
```

`selectedScore` will be the current string value (e.g. `"average"`, `"good"`) or the default `"average"` from the wizard schema.

## Full redesigned component

```tsx
"use client";

import { useFormContext, Controller, useWatch } from "react-hook-form";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Selectable, InfoBox } from "@/components/ui";
import { FlexibilityScale } from "@/components/profile/FlexibilityScale";
import { flexibilityTests } from "@/lib/validations/profile";
import { HelpCircle, Info, Activity } from "lucide-react";

export function StepFlexibility() {
  const { control } = useFormContext();
  const selectedScore = useWatch({ control, name: "flexibilityScore" });

  return (
    <div className="space-y-6">

      {/* 1. Why this matters */}
      <InfoBox
        variant="primary"
        icon={<HelpCircle className="h-4 w-4 text-[color:var(--primary)]" />}
      >
        <p className="font-medium text-[color:var(--foreground)]">
          Why flexibility matters for your bike fit
        </p>
        <p className="mt-1 text-[color:var(--muted-foreground)]">
          Hip flexor and hamstring flexibility directly determines how far forward
          and how low you can comfortably ride. A rider with limited flexibility
          needs a more upright, relaxed position — more handlebar height and less
          reach. A flexible rider can sustain a lower, more aerodynamic position
          without back or hip strain. This test helps us set the right limits
          for your handlebar drop and saddle-to-bar reach.
        </p>
      </InfoBox>

      {/* 2. How to perform the test */}
      <InfoBox
        variant="secondary"
        icon={<Info className="h-4 w-4 text-[color:var(--primary)]" />}
      >
        <p className="font-medium text-[color:var(--foreground)]">
          Hamstring flexibility test — how to do it
        </p>
        <ol className="mt-1 list-inside list-decimal space-y-1 text-[color:var(--muted-foreground)]">
          <li>Sit on the floor with both legs straight out in front of you</li>
          <li>Keep your knees flat against the floor — do not bend them</li>
          <li>Sit up tall, then slowly reach forward with both hands toward your toes</li>
          <li>Note how far you can comfortably reach without forcing</li>
          <li>Choose the option below that best describes your result</li>
        </ol>
      </InfoBox>

      {/* 3. Selection */}
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
              <RadioGroup
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

      {/* 4. Live preview of the selected score — same card as My Profile */}
      {selectedScore && (
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)] p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[color:var(--muted-foreground)]">
            Your flexibility result
          </p>
          <FlexibilityScale score={selectedScore} />
        </div>
      )}

      {/* 5. How this affects the fit */}
      <InfoBox
        variant="primary"
        icon={<Activity className="h-4 w-4 text-[color:var(--primary)]" />}
      >
        <p className="font-medium text-[color:var(--foreground)]">
          How this shapes your bike fit
        </p>
        <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <p className="font-medium text-[color:var(--foreground)]">Low flexibility</p>
            <p className="text-[color:var(--muted-foreground)]">
              More upright position, higher handlebars, shorter reach.
              Protects lower back and hip flexors on longer rides.
            </p>
          </div>
          <div>
            <p className="font-medium text-[color:var(--foreground)]">High flexibility</p>
            <p className="text-[color:var(--muted-foreground)]">
              Lower, more aggressive position possible. More handlebar drop and
              longer reach for aerodynamics and power.
            </p>
          </div>
        </div>
      </InfoBox>

    </div>
  );
}
```

## Acceptance criteria
- "Why flexibility matters" intro uses `InfoBox variant="primary"` with HelpCircle icon
- Test instructions use `InfoBox variant="secondary"` with ordered list
- Radio selection options (Selectable cards) are unchanged in their data/values
- After any selection, a live `FlexibilityScale` preview renders below the radio options showing the currently selected score — identical to how it looks on the My Profile page
- The preview appears immediately as the user selects (no save needed)
- "How this shapes your fit" uses `InfoBox variant="primary"` with Activity icon and a 2-column grid
- `npm run build:vercel` passes
