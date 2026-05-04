# Homepage Improvements v1

## Goal

Clean up the homepage by removing two duplicate bike-entry sections, adding a lightweight bike passport entry point to the footer, improving the visual impact of the "How it works" stepper, and giving the calculator grid more visual colour variety.

## Background

Audit of the 2026-05-04 screenshot identified:
- Two bike-related sections ("Check of deze fiets…" BikeQuickCheckCard + "Weet je al welke fiets…" BikeSearchBar) doing similar jobs and confusing the page flow.
- Calculator grid icons are all identical mid-blue — no differentiation between tools.
- Stepper step icons are small (48px) with muted secondary backgrounds — visual weight is too low.
- Differentiator section has internal placeholder copy in the description field.

## Scope

| # | Change | File(s) touched |
|---|--------|-----------------|
| 01 | Remove `BikeQuickCheckCard` section from homepage | `page.tsx` |
| 01 | Remove `BikeSearchBar` section from homepage | `page.tsx` |
| 02 | Add compact bike passport entry in Footer | `Footer.tsx` |
| 03 | Differentiate `CalculatorLogo` colour per calculator | `CalculatorLogo.tsx`, `CalculatorGrid.tsx` |
| 04 | Enlarge and colorise stepper step visuals | `HowItWorksStepper.tsx` |
| 05 | Fix placeholder description in `DifferentiatorTriple` copy | `homeRedesignContent.ts` |

## Out of scope

- Hero second-CTA visibility (separate issue, needs copy decision)
- Hero trust line / ProofBar stat duplication (separate issue)
- Canyon Canyon Grizl data fix (manual admin task, already documented)

## Acceptance criteria

- Homepage no longer shows BikeQuickCheckCard or BikeSearchBar sections.
- Footer has a small, unobtrusive link/entry to the bike passport check tool.
- Each of the 6 calculator grid items shows a visually distinct colour accent.
- Stepper step icons are at least 64px with a strong primary-tinted or per-step coloured background.
- Differentiator description reads like product copy, not internal instruction.
- `npx tsc --noEmit` passes with zero errors after all changes.
