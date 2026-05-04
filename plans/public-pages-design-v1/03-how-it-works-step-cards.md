# Prompt 03 — Upgrade How It Works step cards with per-step colour accents

## Context

`src/app/(public)/how-it-works/page.tsx` has a 3-step section using `PublicFeatureCard` with `ClipboardList`, `Bike`, and `Target` icons. This is the same conceptual content as the homepage `HowItWorksStepper`, but rendered on a dedicated page without the stepper's visual treatment.

The homepage stepper now uses:
- Step 01 → teal (`oklch(0.72 0.14 195)`)
- Step 02 → primary blue
- Step 03 → green (`oklch(0.72 0.16 145)`)
- 72px icon containers with `rounded-2xl`
- Step number as small uppercase text label above the icon

The How It Works page should mirror this visual language.

## Task

In `src/app/(public)/how-it-works/page.tsx`:

1. Replace the import of `PublicFeatureCard` with `FeatureIconCard` from `@/components/public`.

2. Replace the `PublicFeatureCard` grid with a `FeatureIconCard` grid. Map step index → colour:
   - Index 0 (`ClipboardList`): `color="teal"`
   - Index 1 (`Bike`): `color="primary"`
   - Index 2 (`Target`): `color="green"`

3. Above each `FeatureIconCard`, add a step number label matching the stepper pattern. Since `FeatureIconCard` doesn't have a built-in step number slot, wrap each card in a `<div>` and prepend:

```tsx
<div key={step.title}>
  <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
    {String(index + 1).padStart(2, "0")}
  </p>
  <FeatureIconCard
    icon={<Icon className="h-8 w-8" />}
    title={step.title}
    description={step.body}
    color={stepColor}
  />
</div>
```

4. Update the `stepIcons` array — icons should render at `h-8 w-8` to match the 72px container used in the stepper (they'll be slightly smaller since `FeatureIconCard` uses 48px, not 72px, but `h-8 w-8` is still an improvement over the current `h-5 w-5`).

5. Leave the 2-column `PublicSurfaceCard` section ("Preparation and output") and the `PublicCtaBand` unchanged.

## Verification

- 3 step cards show `FeatureIconCard` with teal / primary / green colour accents.
- Step numbers (01, 02, 03) appear above each card as small uppercase labels.
- `npx tsc --noEmit` passes.
