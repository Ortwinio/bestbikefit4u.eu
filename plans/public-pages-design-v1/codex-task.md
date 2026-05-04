# Codex Task — Implement public-pages-design-v1

## What to do

Implement the 6 prompts in `plans/public-pages-design-v1/` in order. Read each prompt file fully before touching any code. Each prompt is self-contained.

## Execution order

1. `plans/public-pages-design-v1/01-feature-icon-card-color-prop.md`
2. `plans/public-pages-design-v1/02-calculator-pages-feature-cards.md`
3. `plans/public-pages-design-v1/03-how-it-works-step-cards.md`
4. `plans/public-pages-design-v1/04-guides-hub.md`
5. `plans/public-pages-design-v1/05-pricing-page-standardize.md`
6. `plans/public-pages-design-v1/06-privacy-terms-wrap.md`

## Key files you will touch

- `src/components/public/FeatureIconCard.tsx` — prompt 01
- `src/app/(public)/calculators/bike-fit/page.tsx` — prompt 02
- `src/app/(public)/calculators/saddle-height/page.tsx` — prompt 02
- `src/app/(public)/calculators/saddle-width/page.tsx` — prompt 02
- `src/app/(public)/calculators/frame-size/page.tsx` — prompt 02
- `src/app/(public)/calculators/crank-length/page.tsx` — prompt 02
- `src/app/(public)/calculators/gearing/page.tsx` — prompt 02
- `src/app/(public)/how-it-works/page.tsx` — prompt 03
- `src/app/(public)/guides/page.tsx` — prompt 04
- `src/app/(public)/pricing/page.tsx` — prompt 05
- `src/app/(public)/privacy/page.tsx` — prompt 06
- `src/app/(public)/terms/page.tsx` — prompt 06

## Important constraints

- All colours must use `color-mix(in oklch, ...)` or `oklch(...)` — no raw hex codes.
- Do not add animations, transitions, or motion.
- Do not create new files unless a prompt explicitly requires it.
- Do not touch `convex/`, test files, dashboard pages, or admin pages.
- Follow the existing Tailwind arbitrary-value pattern: `bg-[color:...]`, `text-[color:...]`.
- Prompt 02 depends on prompt 01 being done first — the `color` prop must exist on `FeatureIconCard` before calculator pages use it.

## Verification

After all 6 prompts, run:

```
npx tsc --noEmit
```

Zero errors expected. Fix any type errors before finishing.

## Done criteria

- `npx tsc --noEmit` exits with code 0.
- Commit all changes with message: `Implement public pages design v1 (FeatureIconCard colours, calculator grids, how-it-works, guides hub, pricing, privacy/terms)`
