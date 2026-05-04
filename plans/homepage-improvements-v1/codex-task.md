# Codex Task — Implement homepage-improvements-v1

## What to do

Implement the 5 prompts in `plans/homepage-improvements-v1/` in order. Each prompt file is self-contained. Read it fully before touching any code.

## Execution order

1. `plans/homepage-improvements-v1/01-remove-sections.md`
2. `plans/homepage-improvements-v1/02-footer-bike-passport.md`
3. `plans/homepage-improvements-v1/03-calculator-grid-colors.md`
4. `plans/homepage-improvements-v1/04-stepper-visual-upgrade.md`
5. `plans/homepage-improvements-v1/05-fix-placeholder-copy.md`

## Key files you will touch

- `src/app/(public)/page.tsx` — homepage (prompts 01)
- `src/components/layout/Footer.tsx` — footer (prompt 02)
- `src/components/public/CalculatorLogo.tsx` — calculator icon colours (prompt 03)
- `src/components/home/HowItWorksStepper.tsx` — stepper visuals (prompt 04)
- `src/components/home/homeRedesignContent.ts` — content strings (prompt 05)

## Important constraints

- All colours must use `color-mix(in oklch, ...)` or `oklch(...)` values — no raw hex codes.
- Do not add CSS `@keyframes`, animations, or motion of any kind.
- Do not create new files unless a prompt explicitly requires it.
- Do not touch `convex/`, test files, or any file not listed above.
- Follow the existing Tailwind pattern: arbitrary value classes like `bg-[color:...]`, `text-[color:...]`.

## Verification

After all 5 prompts are implemented, run:

```
npx tsc --noEmit
```

Zero errors expected. If there are errors, fix them before finishing.

## Done criteria

- `npx tsc --noEmit` exits with code 0.
- Commit all changes with a message: `Implement homepage improvements v1 (remove sections, footer passport, calculator colours, stepper upgrade, copy fix)`.
