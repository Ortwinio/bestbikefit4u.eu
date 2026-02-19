# PDF Layout Upgrade Plan

## Goal

Upgrade the production PDF report in BestBikeFit4U to a polished, multi-section layout based on `scripts/generate-example-report.mjs` and `BestBikeFit4U_ExampleReport_EN_v2.pdf`, while guaranteeing measurement output values are rendered correctly.

## Background

The current production PDF path uses a lightweight text-only renderer (`src/lib/reports/recommendationPdf.ts` + `src/lib/pdf/simplePdf.ts`). The new example report demonstrates a richer layout, visual hierarchy, and clearer guidance content. We need to bring production output closer to that design without losing data correctness or runtime reliability.

## Scope

In scope:

- Design and implementation plan to modernize PDF layout.
- Data mapping contract from recommendation/session fields to displayed report values.
- Runtime-safe rendering strategy for production API route.
- Automated and manual validation for value correctness and layout quality.

Out of scope:

- Changing bike fit algorithm formulas.
- Adding new fit metrics not already produced by backend.
- Rebranding work already covered in prior plans.

## Approach

1. Audit current production PDF generation and compare it to the new example script/PDF.
2. Define an explicit field mapping contract to guarantee output value correctness.
3. Implement a template-based report layout engine aligned with the example structure.
4. Integrate into `/api/reports/[sessionId]/pdf` with fallback behavior and production constraints.
5. Validate visual quality, page breaking, and measurement value correctness via tests and smoke checks.

## Dependencies

- Current PDF route: `src/app/api/reports/[sessionId]/pdf/route.ts`
- Current text renderer: `src/lib/reports/recommendationPdf.ts`, `src/lib/pdf/simplePdf.ts`
- Example script: `scripts/generate-example-report.mjs`
- Example output: `BestBikeFit4U_ExampleReport_EN_v2.pdf`
- Data source queries: `convex/sessions/*`, `convex/recommendations/*`

## Acceptance Criteria

- Production PDF uses improved, structured layout inspired by the example report.
- All displayed measurement outputs are mapped from canonical backend fields and units are correct.
- PDF route tests verify both rendering behavior and value integrity.
- Build/typecheck/tests pass.
- A fallback/rollback strategy exists if rich rendering fails in production.

## Status

- Owner: `@codex`
- Target completion: `2026-02-26`
- Last updated: `2026-02-19`
- State: `COMPLETE`

| Step | File | Priority | Status |
|------|------|----------|--------|
| 01 | `01-audit-current-pdf-and-example-gap.md` | P0 | Done |
| 02 | `02-define-value-mapping-contract.md` | P0 | Done |
| 03 | `03-build-layout-template-and-sections.md` | P1 | Done |
| 04 | `04-integrate-renderer-into-production-route.md` | P0 | Done |
| 05 | `05-validate-layout-values-and-release.md` | P0 | Done |

## Outputs

- `output-01-gap-analysis.md`
- `output-02-value-mapping-matrix.md`
- `output-03-layout-implementation-notes.md`
- `output-04-production-integration-notes.md`
- `output-05-validation-and-release-checklist.md`
