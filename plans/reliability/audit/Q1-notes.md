# Q1 — shared saddle-height model and range bar

Implemented only the new shared module, RangeBar and its UI barrel export. Existing account/fit-engine calculations are unchanged. The contract was published before implementation in messages/C-model-contract.md; model, bar and independent review ran in parallel.

## Model

- Inputs use cm, output uses mm. Road factor0.883, other bike factors and neutral adjustment terms are reusable inputs. Advice is internally clamped0.86–0.91B; that safety clamp is never returned as the uncertainty range.
- Every uncertainty rule is covered: derived/estimated/declared3%B; measured10mm; repeated within tolerance10/sqrt(n), capped3; fitter/video5mm; unresolved warning always overrides to3%B. Formula sigma remains1% of the computed advice.
- Shared plausibility handles both signs of inclusive5%/12% boundaries without floating-point edge errors, rejects inseam outside55–105cm or at/above height, and does not calculate invalid input.
- Public state preserves the height-based result until a large deviation is explicitly overridden. Overrides retain wide uncertainty, dashed zone and remeasurement guidance. A yellow warning narrows only after confirmation. Refinement is allowed only for plausible or confirmed-check measurements.
- Next-step widths are computed using the same formula, not fixed23/18 labels. Raw sigma is retained for those projections.

## Acceptance and board differences resolved

The explicit worked example and board require whole-mm advice and half-width before rounding bounds to5mm. Raw190cm values would give a835mm upper bound; presentation rounding correctly yields **789±49mm,740–840mm**. The89cm measurement yields **786±23mm,765–810mm**. Next-step projections are23mm and18mm. A identified the initial contract rounding discrepancy and it was corrected before completion.

The board's yellow-warning script temporarily uses a narrow10mm input uncertainty. The written model explicitly makes every unresolved warning3%B; the implementation follows that written rule. The contract explains this to both UI owners. Large overrides use3% of the entered inseam, also following the written rule.

## RangeBar

Continuous large and compact variants match Bereikbalk geometry. Fixed default scale is advice±60mm; explicit min/max permit reuse. Lime zone has an ink solid/dashed border and an ink advice marker; bounds use the existing DM Mono utility and are centered on zone edges without mobile overflow. Localized role=img labels include value, unit and both bounds; color is not the only carrier.400ms transitions are disabled by reduced-motion preference. Invalid geometry does not render a fabricated bar. Colors use existing tokens only.

## Verification

- 84 focused tests passed:70 model +14 RangeBar.
- Integrated TypeScript and whole-tree lint passed. Logs remain outside the repository in /private/tmp/q1-{tests,typecheck,lint}.log.
- Independent review found no remaining model/bar blocker.
- Local isolated component captures at390/1440 in light/dark, with large/compact solid/dashed variants, show no horizontal overflow. Browser reduced-motion check reports transition-property:none. Screenshots remain ignored under plans/reliability/renders/Q1-range-*; the ephemeral harness is /private/tmp/q1-range-preview.mjs and is not product code.
- A owns the final combined build/Convex/crawl/axe/page sweep after Q2/Q3 integration; isolated bar captures do not replace that page QA.

No commit, deployment, production operation, environment change or mail. No logs/renders are in the file manifest.
