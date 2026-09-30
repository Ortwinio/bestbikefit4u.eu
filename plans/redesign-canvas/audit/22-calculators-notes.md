# DONE22 calculator dark pass

Audited all ten public calculator route families and their local diagrams/panels. Shared UI and globals
remain owned by tokens agent. Fixed theme-dependent diagrams on semantic card surfaces: frame ratio
progress/marker use primary/foreground; power-speed resistance bands use primary/foreground. Fixed
fuel guidance inset heading to explicit ink on fixed white. Gearing and performance mobile result CTA
text now uses primary-foreground instead of hardcoded white. Existing lime diagrams intentionally keep
fixed ink strokes/text in both themes. No engine, backend, dictionary, route or copy changes.

Validation:
- Real Chromium computed-color contrast regression: 16/16 cases pass, at390/1440 in light/dark.
  Checks ratio marker/progress, power split fills, fuel heading and mobile result CTA contrast plus overflow.
- Existing frame/gearing/performance UI tests:14/14 pass.
- Owned ESLint clean; source lines<=120.
- Parent fullroute captures cover remaining unchanged local surfaces.

Exact files:
- src/app/(public)/calculators/frame-size/FrameSizeCalculatorForm.tsx
- src/app/(public)/calculators/gearing/GearingCalculatorForm.tsx
- src/app/(public)/calculators/power-speed/PerformanceCalculator.tsx
- src/app/(public)/calculators/dark-contrast.e2e.test.ts

Evidence: /private/tmp/bbf22-calculator-browser.log and /private/tmp/bbf22-calculator-unit.log.
Browser suite opt-in: CONFIGURATOR_TEST_ORIGIN=http://localhost:3000 npx vitest run
'src/app/(public)/calculators/dark-contrast.e2e.test.ts' --maxWorkers=1.
No commits.

## Full-page dark screenshot review matrix
Reviewed all24 fullpage captures20-dark-{slug}-dark-{1440,390}.png, including results/diagrams,
belowfold guidance, FAQs, relatedlinks and finalCTA/footer. Mobile sheets were split into thirds
at fullwidth for readable inspection; desktop sheets retain full page coverage.

| Route |1440|390| Local result/body finding |
|---|---|---|---|
| saddle-height |pass|pass| Lime pedaling illustration and ink result legible |
| frame-size |pass|pass| Semantic ratio marker visible; ink CTA and size bands legible |
| crank-length |pass|pass| Crank SVG and sizebands legible; warning/order panels readable |
| saddle-width |pass|pass| Width/Sitbone SVG, scale notes, confidence and shape guidance readable |
| bike-fit |pass|pass| SVG dimension badges and result tiles legible |
| gearing |pass|pass| Chainring illustration, six result tiles and explanations readable |
| power-speed |pass|pass| Gauge, resistance bands and all explanatory sections readable |
| climb-planner |pass|pass| Gradient visual and power/speed result tiles readable |
| ftp-wkg |pass|pass| W/kg and reference-result cards readable |
| fuel-hydration |pass|pass| White inset guidance heading/body and timeline readable |
| tire-pressure |pass|pass| Reviewed only: lime pressure gauges and dark guidance readable |
| bandenspanning |pass|pass| Reviewed only: same pressure content/diagram behavior |

Shared findings routed to parent, not edited:
- Configurator header wordmark invisible dark; some footer logos absent in captures (known A ownership).
- SegmentedControl selected state on dark saddle-height bike/goals and saddle-width mode/posture lacks
  a clearly visible selected surface. Shared component uses checked:bg-card against dark bg-muted;
  both currently near-identical. Asked parent to route to tokens agent.
No additional calculator-local edits required after full-page visual inspection.

Keyboard focus follow-up: added four real Tab-navigation cases on /nl/design-system, one for each
light/dark ×390/1440 combination. Each reaches native slider input, shared text input and shared button;
asserts visible/nonzero focus ring on the rendered control (slider's thumb wrapper), then tabs away
and verifies the ring changes so permanent shadows cannot falsely pass. Coordinated with tokens agent.
Final combined browser suite20/20 passed; owned test ESLint clean. Existing file list unchanged.
