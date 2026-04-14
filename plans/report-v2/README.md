# Report V2 — Bilingual, Engine-Powered Fit Report

## Goal

Deliver a fully upgraded rider-facing report — in-app and PDF — that uses Engine v2 outputs (confidence ranges, rationale, adjustment order), educates the rider on why good bike fitting matters, explains each setting in plain language, and provides clear per-parameter adjustment instructions. The report is available in both English and Dutch.

## Quality Check Findings

The original report-v2 plan had the right product direction, but it still needed to be tightened into a repo-executable plan.

### What was already strong

- Clear rider-facing outcome for both in-app and PDF reports
- Good alignment with engine-v2 capabilities such as confidence, rationale, and adjustment order
- Correct focus on bilingual delivery and missing-data handling
- Sensible reuse of existing report and PDF infrastructure

### Gaps that needed fixing

1. Some prompts were not grounded enough in the current repo shape.
2. The contract boundary between backend mapping and rendering was too loose.
3. Early steps asked for heavier validation than they actually needed.
4. The final step bundled tire pressure, delta display, QA, and release into one oversized prompt.
5. At least one source reference was wrong and would send an executor to a non-existent file.
6. Legacy compatibility requirements were present in the README, but not enforced consistently in the step prompts.
7. There was no dedicated test plan tying Convex, UI, i18n, and PDF verification together.

## Background

### What exists today
- **Engine v2** is complete (`plans/engine-v2-migration/`). Phase 10 default cutover is documented in `output-10-default-cutover.md`.
- **PDF layout** was upgraded (`plans/feature-pdf-layout-upgrade/` — COMPLETE). Structured layout with value mapping exists.
- **Tire pressure module** is built (`plans/feature-tire-pressure/`).
- **i18n infrastructure** is in place (EN/NL, dashboard + public routes).
- **Current results page** still renders the legacy recommendation shape — not wired to v2 outputs.

### The v2 spec (`plans/report-v2/bestbikefit4u_v2_report_and_migration_plan (1).docx.md`)
Defines the target report structure:
1. Rider profile and fit objective
2. Priority summary table (target, why it matters, rider validation cue, status)
3. Detailed fit table (target, method label, feel description, watch-outs)
4. Adjustment sequence with measurement references
5. Tire pressure module (with missing-data handling)
6. 14-day validation plan

### Why now
With engine v2 nearly complete and i18n in place, all building blocks exist. This plan wires them together into a report riders can actually use to improve their setup.

## Scope

**In scope:**
- Complete engine v2 default cutover (phase 10)
- New in-app results page using engine v2 outputs (confidence, rationale, adjustment order, feasibility)
- "Why bike fitting matters" education section per parameter and as a brief intro
- Bilingual in-app report (EN/NL) using existing i18n infrastructure
- Updated PDF report matching the v2 structure, single-language export per user locale
- Tire pressure section in report with graceful missing-data handling
- 14-day validation plan section in both in-app and PDF
- Current-vs-target delta display when current bike measurements are available

**Out of scope:**
- New questionnaire questions or algorithm changes
- Frame geometry database / brand matching
- Premium coaching features (adaptive validation, AI feedback)
- Adding languages beyond EN/NL
- Wearable integrations

## Repo Anchors

- Results route: `src/app/(dashboard)/fit/[sessionId]/results/page.tsx`
- Current PDF route: `src/app/api/reports/[sessionId]/pdf/route.ts`
- Current report helpers: `src/lib/reports/pdfValueMapping.ts`, `src/lib/reports/pdfLayoutTemplate.ts`, `src/lib/reports/recommendationPdf.ts`
- PDF renderers: `src/lib/pdf/htmlPdf.ts`, `src/lib/pdf/simplePdf.ts`
- Core Convex read paths: `convex/sessions/queries.ts`, `convex/recommendations/queries.ts`, `convex/pressureCalculations/queries.ts`, `convex/pressureProfiles/queries.ts`
- Auth helpers: `convex/lib/authz.ts`
- Existing tests to extend: `src/lib/reports/pdfLayoutTemplate.test.ts`, `src/lib/reports/pdfValueMapping.test.ts`, `src/app/api/reports/[sessionId]/pdf/route.test.ts`

## Approach

1. **Engine v2 cutover** — Complete phase 10 and document rollback mechanics
2. **Report data contract** — Define one typed payload and one Convex query for both UI and PDF
3. **In-app results page v2** — Redesign the results route around that shared payload
4. **Education content** — Replace placeholders with final EN/NL rider copy
5. **PDF report v2** — Upgrade the PDF route and renderer to consume the same payload in one locale
6. **Tire pressure + delta display** — Finish remaining rider-facing report sections and missing-data behavior
7. **QA and release** — Run full validation, verify legacy compatibility, and update plan status/output docs

## Dependencies

- Engine v2 complete: `plans/engine-v2-migration/` (phases 1–9 done, phase 10 is Step 01 of this plan)
- Tire pressure Convex data: `convex/pressureCalculations/`, `convex/pressureProfiles/`
- i18n: `src/i18n/messages/en.ts`, `src/i18n/messages/nl.ts`
- Current PDF renderer: `src/lib/reports/`, `src/lib/pdf/`
- Results route: `src/app/(dashboard)/fit/[sessionId]/results/`
- PDF API route: `src/app/api/reports/[sessionId]/pdf/route.ts`
- Test matrix: `plans/report-v2/TESTPLAN.md`

## Acceptance Criteria

1. Engine v2 is the default recommendation path for new fit sessions
2. Results page shows: rider profile, priority table, detailed fit table with rationale and confidence, adjustment sequence, tire pressure (or pending-data banner), 14-day plan
3. Every parameter includes "why it matters" copy and rider validation cue
4. Results page is fully bilingual — EN/NL with no hardcoded strings
5. PDF export matches the in-app structure; exports in the user's active locale
6. Tire pressure section shows calculated values when inputs are complete; shows "Pending required data" banner when incomplete
7. Current-vs-target deltas shown when current bike measurements exist
8. `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm test` all pass
9. `npm run test:i18n` passes (28+ tests, no missing NL keys)
10. Legacy v1 sessions still render a usable results page and PDF path during migration
11. The results page and PDF route consume the same report-v2 payload contract instead of maintaining separate mapping logic

## Execution Notes

- Step 02 is the contract boundary. Do not let the results page and PDF route invent separate payload shapes.
- Keep legacy recommendation fields readable until release sign-off.
- Use targeted validation inside each implementation step, then run the full regression matrix only in the final QA/release step.
- Update this README after each completed step and add the matching output document before moving on.

## Status

| Step | File | Priority | Status |
|------|------|----------|--------|
| 01 | `01-engine-v2-cutover.md` | P0 | Complete |
| 02 | `02-report-data-model.md` | P0 | Complete |
| 03 | `03-in-app-results-page-v2.md` | P1 | Complete |
| 04 | `04-education-content.md` | P1 | Complete |
| 05 | `05-pdf-report-v2.md` | P1 | Complete |
| 06 | `06-tire-pressure-and-deltas.md` | P1 | Complete |
| 07 | `07-qa-and-release.md` | P0 | Complete with documented repo-wide blockers |

## Final Closeout

- Outputs added for Steps `03` through `07`
- Shared report-v2 payload, dashboard surface, PDF route, tire-pressure integration, and EN/NL copy were verified in code
- A small cleanup pass moved remaining report-v2 route strings into the shared `dashboard.results.reportV2` copy layer
- Repo-wide release gates are not fully clean because of unrelated existing failures in guide import, geometry-link test, and questionnaire localization typing; see `output-07-qa-and-release.md`
