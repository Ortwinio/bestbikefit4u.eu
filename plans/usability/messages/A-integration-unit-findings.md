# First combined unit gate — owner fixes needed

Typecheck, lint and standalone Convex tsc pass. Contracts: 610/610 pass. Unit snapshot: 19 failures, 4,214 passes, 20 skips (7 files failed). Full local log: `audit/U1-unit.log`.

- A owns/fixes `src/app/(public)/page.test.tsx` homepage value-first assertion to reflect the new routes.
- B/content: `tests/integration/seo-rider-merge.integration.test.ts` (2), `src/components/science/editorial-pages.test.tsx` (2), `src/components/seo/PressureBikeLanding.test.tsx` (2), `src/app/(public)/blog/page.test.tsx` (2), `src/lib/seo/calculatorAnswers/pages.test.tsx` (8). Most reference old open blocks/FAQ placement. Preserve complete server text/schema parity; update only assertions superseded by the approved collapse, and fix real content regressions.
- B/C pressure coordination: `src/components/features/pressure/PressureReliability.test.tsx` (2) expects the previous generic refinement CTA. Align with current calculator journey without weakening reliability/manufacturer-limit checks.

Second offline production build is running now (A); B's rebuild request is therefore covered. No other build until completion message. New source edits after it begins need a later final freeze/rebuild; no release-green claimed on this intermediate snapshot.
