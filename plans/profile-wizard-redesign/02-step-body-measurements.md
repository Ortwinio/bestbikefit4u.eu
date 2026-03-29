# 02 — Step 1: Body Measurements

## Goal
Redesign `StepBodyMeasurements.tsx` with a prominent "why this matters" intro box, `InfoBox`-based instruction panels, a rich tooltip experience, and a branded warning for the inseam ratio check.

## File to change
`src/components/measurements/StepBodyMeasurements.tsx`

## New imports
```tsx
import { InfoBox } from "@/components/ui";
import { AlertCircle, Info, Ruler, HelpCircle } from "lucide-react";
```

## 1. Add "Why we need this" intro box at the top

Replace the current plain `<p>` intro text with a prominent `InfoBox variant="primary"`:

```tsx
<InfoBox
  variant="primary"
  icon={<HelpCircle className="h-4 w-4 text-[color:var(--primary)]" />}
>
  <p className="font-medium text-[color:var(--foreground)]">Why we need your measurements</p>
  <p className="mt-1 text-[color:var(--muted-foreground)]">
    Your height and inseam are the two most important inputs for a bike fit.
    Height sets the overall frame size and reach, while inseam is the primary driver
    for saddle height — the single most impactful adjustment for comfort and power.
    Without accurate measurements, every recommendation is just an estimate.
  </p>
</InfoBox>
```

## 2. Convert "How to measure" boxes to `InfoBox variant="secondary"`

Replace both ad-hoc `rounded-[var(--radius-lg)] border … bg-[color:var(--secondary)]/35` divs with `InfoBox`:

**Height:**
```tsx
<InfoBox
  variant="secondary"
  icon={<Info className="h-4 w-4 text-[color:var(--primary)]" />}
>
  <p className="font-medium text-[color:var(--foreground)]">How to measure your height</p>
  <ul className="mt-1 list-inside list-disc space-y-1 text-[color:var(--muted-foreground)]">
    <li>Stand barefoot against a wall</li>
    <li>Place a book flat on top of your head, touching the wall</li>
    <li>Mark the wall and measure from the floor to the mark</li>
  </ul>
</InfoBox>
```

**Inseam:**
```tsx
<InfoBox
  variant="secondary"
  icon={<Info className="h-4 w-4 text-[color:var(--primary)]" />}
>
  <p className="font-medium text-[color:var(--foreground)]">How to measure your inseam</p>
  <ul className="mt-1 list-inside list-disc space-y-1 text-[color:var(--muted-foreground)]">
    <li>Stand barefoot with feet 10–15 cm apart</li>
    <li>Press a hardcover book firmly up between your legs, simulating a saddle</li>
    <li>Measure from the floor to the top of the book spine</li>
  </ul>
</InfoBox>
```

## 3. Convert ratio warning to `InfoBox variant="warning"`

Replace the ad-hoc orange div:

```tsx
{ratioWarning && (
  <InfoBox
    variant="warning"
    icon={<AlertCircle className="h-4 w-4 text-[color:var(--warning)]" />}
  >
    <p className="font-medium">Measurement check</p>
    <p className="mt-1 text-[color:var(--muted-foreground)]">{ratioWarning}</p>
  </InfoBox>
)}
```

## 4. Convert "Why these measurements matter" to `InfoBox variant="primary"`

Replace the bottom plain card div:

```tsx
<InfoBox
  variant="primary"
  icon={<Ruler className="h-4 w-4 text-[color:var(--primary)]" />}
>
  <p className="font-medium text-[color:var(--foreground)]">How these measurements shape your fit</p>
  <div className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
    <div>
      <p className="font-medium text-[color:var(--foreground)]">Height</p>
      <p className="text-[color:var(--muted-foreground)]">
        Sets the overall frame size range and forms the baseline for reach,
        stack, and handlebar position calculations.
      </p>
    </div>
    <div>
      <p className="font-medium text-[color:var(--foreground)]">Inseam</p>
      <p className="text-[color:var(--muted-foreground)]">
        The primary driver for saddle height — the most critical fit variable.
        Also informs crank length and cleat position.
      </p>
    </div>
    <div>
      <p className="font-medium text-[color:var(--foreground)]">Weight (optional)</p>
      <p className="text-[color:var(--muted-foreground)]">
        Used to calculate BMI and refine tyre pressure recommendations.
        Does not affect saddle height or reach calculations.
      </p>
    </div>
  </div>
</InfoBox>
```

## Final structure of the step

```
InfoBox (primary)  ← "Why we need this"
Grid (2 columns):
  Height NumberInput
    InfoBox (secondary) ← "How to measure"
  Inseam NumberInput
    InfoBox (secondary) ← "How to measure"
Weight NumberInput (full width, optional)
InfoBox (warning, conditional) ← ratio warning
InfoBox (primary) ← "How these shape your fit"
```

## Acceptance criteria
- "Why we need this" info box appears at the very top using brand primary tint
- "How to measure" boxes use `InfoBox variant="secondary"` with Info icon
- Inseam ratio warning uses `InfoBox variant="warning"` with AlertCircle icon
- "How these shape your fit" uses `InfoBox variant="primary"` with Ruler icon
- No data/validation logic is changed
- `npm run build:vercel` passes
