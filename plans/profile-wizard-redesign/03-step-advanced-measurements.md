# 03 — Step 2: Advanced Measurements

## Goal
Redesign `StepAdvancedMeasurements.tsx` with a "why this matters" intro box, per-field `InfoBox` instruction panels, and a clear framing that these measurements are optional but improve fit precision.

## File to change
`src/components/measurements/StepAdvancedMeasurements.tsx`

## First, read the file
Read `src/components/measurements/StepAdvancedMeasurements.tsx` in full before making changes — it has not been included in this plan because its exact current markup may vary.

## New imports
```tsx
import { InfoBox } from "@/components/ui";
import { Info, Ruler, HelpCircle, Sparkles } from "lucide-react";
```

## 1. Add "Why this matters" intro box

At the top of the returned JSX, before any inputs:

```tsx
<InfoBox
  variant="primary"
  icon={<HelpCircle className="h-4 w-4 text-[color:var(--primary)]" />}
>
  <p className="font-medium text-[color:var(--foreground)]">
    Optional — but worth it
  </p>
  <p className="mt-1 text-[color:var(--muted-foreground)]">
    These measurements are not required, but each one refines a different part of your fit.
    Torso and arm length determine handlebar reach. Shoulder width influences
    handlebar width. Femur length fine-tunes saddle setback. The more you provide,
    the more personalised the recommendation.
  </p>
</InfoBox>
```

## 2. Per-field "How to measure" boxes — use `InfoBox variant="secondary"`

Add an `InfoBox variant="secondary"` below each `NumberInput`. Use the following copy:

**Torso Length:**
```tsx
<InfoBox variant="secondary" icon={<Info className="h-4 w-4 text-[color:var(--primary)]" />}>
  <p className="font-medium text-[color:var(--foreground)]">How to measure torso length</p>
  <ul className="mt-1 list-inside list-disc space-y-1 text-[color:var(--muted-foreground)]">
    <li>Sit upright on a firm chair, back straight</li>
    <li>Measure from the seat surface to the bony bump at the base of your neck (C7 vertebra)</li>
    <li>Typical range: 45–75 cm</li>
  </ul>
  <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
    <span className="font-medium">Affects:</span> handlebar reach and stack
  </p>
</InfoBox>
```

**Arm Length:**
```tsx
<InfoBox variant="secondary" icon={<Info className="h-4 w-4 text-[color:var(--primary)]" />}>
  <p className="font-medium text-[color:var(--foreground)]">How to measure arm length</p>
  <ul className="mt-1 list-inside list-disc space-y-1 text-[color:var(--muted-foreground)]">
    <li>Stand with arm relaxed at your side</li>
    <li>Measure from the bony shoulder tip (acromion) to the middle finger tip</li>
    <li>Typical range: 45–75 cm</li>
  </ul>
  <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
    <span className="font-medium">Affects:</span> handlebar reach and stem length
  </p>
</InfoBox>
```

**Shoulder Width:**
```tsx
<InfoBox variant="secondary" icon={<Info className="h-4 w-4 text-[color:var(--primary)]" />}>
  <p className="font-medium text-[color:var(--foreground)]">How to measure shoulder width</p>
  <ul className="mt-1 list-inside list-disc space-y-1 text-[color:var(--muted-foreground)]">
    <li>Stand relaxed with arms at sides</li>
    <li>Measure between the outermost bony points of both shoulders (acromion to acromion)</li>
    <li>Typical range: 30–55 cm</li>
  </ul>
  <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
    <span className="font-medium">Affects:</span> handlebar width recommendation
  </p>
</InfoBox>
```

**Femur Length:**
```tsx
<InfoBox variant="secondary" icon={<Info className="h-4 w-4 text-[color:var(--primary)]" />}>
  <p className="font-medium text-[color:var(--foreground)]">How to measure femur length</p>
  <ul className="mt-1 list-inside list-disc space-y-1 text-[color:var(--muted-foreground)]">
    <li>Sit on a hard surface with your thigh horizontal</li>
    <li>Measure from the bony hip point (greater trochanter) to the outside of the knee</li>
    <li>Typical range: 35–60 cm</li>
  </ul>
  <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
    <span className="font-medium">Affects:</span> saddle setback and fore-aft position
  </p>
</InfoBox>
```

## 3. Replace or update the "How these improve your fit" section

If the step has a bottom explainer section, replace it with:

```tsx
<InfoBox
  variant="primary"
  icon={<Sparkles className="h-4 w-4 text-[color:var(--primary)]" />}
>
  <p className="font-medium text-[color:var(--foreground)]">How advanced measurements improve your fit</p>
  <p className="mt-1 text-[color:var(--muted-foreground)]">
    A basic fit uses height and inseam only. Adding torso and arm length lets us
    calculate reach precisely, rather than estimating it from height alone. Shoulder
    width gives a starting point for handlebar width. Femur length refines saddle
    setback. Each additional measurement reduces the range of uncertainty in the final numbers.
  </p>
</InfoBox>
```

## Final structure of the step

```
InfoBox (primary) ← "Optional but worth it"
Grid (2 columns):
  Torso Length NumberInput
    InfoBox (secondary) ← how to measure + affects
  Arm Length NumberInput
    InfoBox (secondary) ← how to measure + affects
  Shoulder Width NumberInput
    InfoBox (secondary) ← how to measure + affects
  Femur Length NumberInput
    InfoBox (secondary) ← how to measure + affects
InfoBox (primary) ← "How advanced measurements improve your fit"
```

## Acceptance criteria
- "Optional but worth it" intro uses `InfoBox variant="primary"` at the top
- Each measurement field has a matching `InfoBox variant="secondary"` with how-to steps and "Affects:" note
- Bottom summary uses `InfoBox variant="primary"` with Sparkles icon
- No data/validation logic is changed
- `npm run build:vercel` passes
