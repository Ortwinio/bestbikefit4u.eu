# Prompt 03 — Differentiate CalculatorLogo colours per calculator

## Context

`src/components/public/CalculatorLogo.tsx` currently assigns the same `blueToneClassName` to all 7 calculators:
```ts
const blueToneClassName =
  "bg-[color:color-mix(in_oklch,var(--primary)_16%,white_84%)] text-[color:color-mix(in_oklch,var(--primary)_92%,black_8%)]";
```

This means every card in the CalculatorGrid looks identical, which makes the grid feel like a list rather than a visual tool palette. Each calculator should have a distinct, recognisable tint that stays within the BestBikeFit4U oklch color system.

## Color assignments

Use `color-mix(in oklch, ...)` expressions with CSS custom properties. The palette uses:
- `--primary` (brand blue)
- `--secondary`
- `--warning` (amber, already used for stars)
- Create tinted backgrounds by mixing the accent with `--background` or `white`.

Assign per calculator:

| Calculator | Background tint | Icon color | Rationale |
|------------|----------------|------------|-----------|
| `bike-fit` | primary (keep existing, brand hero tool) | primary dark | flagship |
| `saddle-height` | teal — `color-mix(in oklch, oklch(0.72 0.14 195) 22%, white 78%)` | `oklch(0.38 0.14 195)` | vertical dimension = cool |
| `saddle-width` | warm amber — `color-mix(in oklch, var(--warning) 20%, white 80%)` | `color-mix(in oklch, var(--warning) 90%, black 10%)` | comfort/contact point |
| `frame-size` | violet — `color-mix(in oklch, oklch(0.70 0.16 285) 20%, white 80%)` | `oklch(0.40 0.16 285)` | structural, geometry |
| `crank-length` | green — `color-mix(in oklch, oklch(0.72 0.16 145) 20%, white 80%)` | `oklch(0.38 0.16 145)` | mechanical / drive-train |
| `gearing` | orange — `color-mix(in oklch, oklch(0.70 0.18 55) 20%, white 80%)` | `oklch(0.40 0.18 55)` | performance / speed |
| `tire-pressure` | slate/indigo — `color-mix(in oklch, oklch(0.66 0.10 260) 22%, white 78%)` | `oklch(0.38 0.10 260)` | technical, safety |

Each entry needs a `bg-[color:...]` and a `text-[color:...]` in the `toneClassNames` record.

## Task

In `src/components/public/CalculatorLogo.tsx`:

1. Replace the single `blueToneClassName` constant with individual className strings per calculator in the `toneClassNames` record.
2. Keep the same border/shadow on the outer `<span>` (do not change the structural className on `CalculatorLogo`).
3. Export `getCalculatorLogoToneClassName` still works (it reads from the same record — no change needed).

In `src/components/home/CalculatorGrid.tsx`:

4. No structural changes needed — `CalculatorLogo` handles its own colour. Verify the grid still renders correctly.

## Verification

- All 7 calculators show visually distinct icon background colours.
- Colours are harmonious — they should look like a cohesive palette, not random.
- `npx tsc --noEmit` passes.
