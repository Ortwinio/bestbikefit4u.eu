# Prompt 04 — Enlarge and colorise stepper step visuals

## Context

`src/components/home/HowItWorksStepper.tsx` currently renders each step with:
- A 40×40px primary-filled circle showing the step number ("01", "02", "03")
- A 48×48px secondary-tinted circle with primary icon (Ruler / Bike / CheckCircle2)
- These sit stacked vertically at the top of each card

The audit finding: the icon circles are too small and too uniformly muted to create visual hierarchy. The section needs each step to feel distinct and more impactful — larger icon containers with strong per-step colour accents.

## Design direction

Each step gets its own accent colour (same rationale as calculator colours — use oklch palette):
- Step 01 "Measure" → teal/cyan accent (`oklch(0.72 0.14 195)`)
- Step 02 "Connect bike" → primary blue (existing `--primary`)
- Step 03 "Get plan" → green (`oklch(0.72 0.16 145)`)

Changes per step card:
- Remove the separate number circle — instead embed the number as a small label (text, not a circle) above or below the icon.
- Upgrade icon container from 48px to **72px** (`h-18 w-18` = `h-[4.5rem] w-[4.5rem]`).
- Give each icon container a strong per-step tinted background (22% colour + 78% white, matching the calculator colour formula).
- Icon inside scales to 32px (`h-8 w-8`).
- Keep the dashed connector line between steps on desktop.
- Step number becomes small uppercase label above the icon: `text-xs font-bold tracking-[0.2em]` in the step's accent colour.

## Step color data

Add a `STEP_COLORS` map in the component:

```ts
const STEP_COLORS = {
  "01": {
    bg: "bg-[color:color-mix(in_oklch,oklch(0.72_0.14_195)_22%,white_78%)]",
    text: "text-[color:oklch(0.38_0.14_195)]",
    label: "text-[color:oklch(0.42_0.14_195)]",
  },
  "02": {
    bg: "bg-[color:color-mix(in_oklch,var(--primary)_22%,white_78%)]",
    text: "text-[color:color-mix(in_oklch,var(--primary)_90%,black_10%)]",
    label: "text-[color:var(--primary)]",
  },
  "03": {
    bg: "bg-[color:color-mix(in_oklch,oklch(0.72_0.16_145)_22%,white_78%)]",
    text: "text-[color:oklch(0.38_0.16_145)]",
    label: "text-[color:oklch(0.42_0.16_145)]",
  },
} as const;
```

## Task

In `src/components/home/HowItWorksStepper.tsx`:

1. Add the `STEP_COLORS` map (keyed by step number string `"01"`, `"02"`, `"03"`).
2. Replace the existing number circle (`h-10 w-10 rounded-full bg-primary`) with a small number label: `<p className={cn("text-xs font-bold tracking-[0.2em] uppercase", color.label)}>{step.number}</p>`.
3. Replace the icon container (`h-12 w-12 rounded-full border bg-secondary text-primary`) with: `<div className={cn("mt-3 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl", color.bg, color.text)}><Icon className="h-8 w-8" /></div>`.
4. Adjust spacing: `mt-5` heading → `mt-4` (number label takes less space than old circle).
5. Keep the dashed connector `<div>` unchanged.
6. Keep everything else (CTA, RatingBadge, card border/shadow) unchanged.

## Verification

- Three step cards render with 72px icon containers, each in a distinct accent colour.
- Step number appears as a small uppercase label, not a filled circle.
- Connector lines still visible on desktop (lg breakpoint).
- `npx tsc --noEmit` passes.
