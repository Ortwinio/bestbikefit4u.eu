# Prompt 01 — Add `color` prop to FeatureIconCard

## Context

`src/components/public/FeatureIconCard.tsx` currently hardcodes the icon container to always use the primary blue accent:
```
bg-[color:var(--primary-soft)] text-[color:var(--primary)]
```

This is fine for the homepage differentiators (3 cards, same brand tone), but as soon as the component is used across multiple grids on different pages, every card looks identical. The stepper and calculator logo work already proved that per-item color differentiation creates clear visual hierarchy.

## Color palette to support

Use the same hue set as the stepper/calculator logos. Define a named `FeatureIconCardColor` type:

```ts
type FeatureIconCardColor =
  | "primary"   // var(--primary) — brand blue (default)
  | "teal"      // oklch(0.72 0.14 195)
  | "amber"     // var(--warning)
  | "violet"    // oklch(0.70 0.16 285)
  | "green"     // oklch(0.72 0.16 145)
  | "orange"    // oklch(0.70 0.18 55)
  | "slate"     // oklch(0.66 0.10 260)
```

## Color class map

Define a `COLOR_CLASSES` map inside the component:

```ts
const COLOR_CLASSES: Record<FeatureIconCardColor, { bg: string; text: string }> = {
  primary: {
    bg: "bg-[color:var(--primary-soft)]",
    text: "text-[color:var(--primary)]",
  },
  teal: {
    bg: "bg-[color:color-mix(in_oklch,oklch(0.72_0.14_195)_22%,white_78%)]",
    text: "text-[color:oklch(0.38_0.14_195)]",
  },
  amber: {
    bg: "bg-[color:color-mix(in_oklch,var(--warning)_20%,white_80%)]",
    text: "text-[color:color-mix(in_oklch,var(--warning)_90%,black_10%)]",
  },
  violet: {
    bg: "bg-[color:color-mix(in_oklch,oklch(0.70_0.16_285)_20%,white_80%)]",
    text: "text-[color:oklch(0.40_0.16_285)]",
  },
  green: {
    bg: "bg-[color:color-mix(in_oklch,oklch(0.72_0.16_145)_22%,white_78%)]",
    text: "text-[color:oklch(0.38_0.16_145)]",
  },
  orange: {
    bg: "bg-[color:color-mix(in_oklch,oklch(0.70_0.18_55)_20%,white_80%)]",
    text: "text-[color:oklch(0.40_0.18_55)]",
  },
  slate: {
    bg: "bg-[color:color-mix(in_oklch,oklch(0.66_0.10_260)_22%,white_78%)]",
    text: "text-[color:oklch(0.38_0.10_260)]",
  },
};
```

## Task

In `src/components/public/FeatureIconCard.tsx`:

1. Add `color?: FeatureIconCardColor` to `FeatureIconCardProps` (default: `"primary"`).
2. Add the `COLOR_CLASSES` map.
3. Replace the hardcoded `bg-[color:var(--primary-soft)] text-[color:var(--primary)]` in the icon container `<div>` with `cn(color.bg, color.text)` using the resolved classes.
4. Export `FeatureIconCardColor` type so caller pages can use it without re-declaring.

## Verification

- Existing homepage usage (DifferentiatorTriple) still works unchanged (no `color` prop = defaults to `"primary"`).
- `npx tsc --noEmit` passes.
