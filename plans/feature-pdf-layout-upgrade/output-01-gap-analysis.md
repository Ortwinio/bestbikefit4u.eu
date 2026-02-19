# Output 01: PDF Gap Analysis

Date: 2026-02-19
Owner: `@codex`

## Result

Step 01 status: `PASS`

The current production PDF pipeline is reliable but intentionally minimal, and it cannot reproduce the layout quality shown in `BestBikeFit4U_ExampleReport_EN_v2.pdf`. A richer renderer is required for parity with the example, with strict value mapping to canonical recommendation fields.

## Current Production Architecture And Limits

1. Route flow:
   - `src/app/api/reports/[sessionId]/pdf/route.ts`
   - Auth -> query session/recommendation -> build text lines -> create PDF bytes.
2. Content builder:
   - `src/lib/reports/recommendationPdf.ts`
   - Generates long plain-text bilingual lines (EN/NL), including metrics and guidance.
3. Renderer:
   - `src/lib/pdf/simplePdf.ts`
   - Hand-rolled Type1 Helvetica PDF, text-only stream.

Current limitations:

- Styling: no layout engine (no CSS, grids, card blocks, table borders, icons, callout components).
- Media: no image support (logo, hero image, measurement panel unavailable).
- Typography: single font, fixed font size and line height.
- Pagination: fixed `46` lines per page, not content-aware.
- Wrapping: lines are hard-truncated at 110 chars.
- Data presentation: table-like structures are flattened to plain lines, reducing readability.

## Example Vs Current Delta By Section

| Example section | Current production | Gap | Priority for v1 |
|---|---|---|---|
| Header with logo + meta block | Text header only | Missing branding block, visual hierarchy | Mandatory |
| Intro with hero image | Plain paragraph lines | Missing two-column hero layout | Optional |
| Summary cards (confidence, saddle height, bar drop) | Plain metric lines | Missing card emphasis and at-a-glance scanability | Mandatory |
| Priority changes callout | Adjustment list lines | Missing highlighted callout container | Mandatory |
| Core fit targets table | Text lines only | Missing structured table and range columns | Mandatory |
| Implementation plan table | Text lines only | Missing clear day-by-day matrix | Mandatory |
| Pain troubleshooting callout | Generic safety lines | Missing symptom -> action block | Mandatory |
| Measurement guide image + definitions table | Definitions exist only as plain lines | Missing image and formal measurement table | Mandatory |
| Controlled page breaks and section rhythm | Fixed line chunking only | Unstable section breaks across content lengths | Mandatory |

## Mandatory Vs Optional Layout Elements

Mandatory for rollout v1:

1. Structured multi-page layout with stable section boundaries.
2. Branded header + report meta (session/date/bike/goal/version/confidence).
3. Summary metric blocks and core target table.
4. Implementation and troubleshooting sections with clear visual grouping.
5. Measurement definitions table and safety disclaimer.
6. Value integrity rule: render measurement values from canonical fields only.

Optional for rollout v1:

1. Hero lifestyle image.
2. Section icons.
3. Non-essential decorative styling beyond readability and brand identity.
4. Full bilingual body copy (if layout scope is constrained for first release).

## Value-Correctness Risks Identified

1. Example script expects explicit min/max ranges for multiple metrics, but stored recommendation data currently includes only `saddleHeightRange` in `calculatedFit`.
2. `cleatOffset` is produced by algorithm but not stored in `calculatedFit`; today it appears only as text in `adjustmentPriorities.recommendedValue`.
3. If range values are not present in canonical storage, they must be omitted or clearly labeled as reference defaults to avoid incorrect "measured output" claims.

## Platform And Runtime Risks

1. Browser dependency risk:
   - Example uses Playwright + Chromium.
   - Serverless deployment may require specific Chromium packaging and launch flags.
2. Cold start and function budget:
   - Browser launch increases memory/time usage vs current lightweight text renderer.
3. Asset loading risk:
   - Example uses `file://` asset paths, which are not valid in serverless runtime by default.
4. Failure mode risk:
   - Without fallback, PDF generation can fail hard on browser launch/runtime issues.

## Recommended Renderer Direction

Recommended direction for implementation:

1. Use an HTML template renderer (matching example structure) and generate PDF via Playwright in Node runtime.
2. Keep the existing simple text renderer as a fallback path for resilience.
3. Introduce a strict typed mapping layer from `session` + `recommendation` -> template view model.
4. Enforce explicit policy: any displayed metric must map to canonical numeric fields and units; no parsing from free text for final measured outputs.
5. Use deterministic page-break classes in template instead of line-count pagination.

Why this direction:

- It is the only practical path to replicate the example layout quality quickly.
- It keeps rollback safety by retaining the current renderer.
- It enables value-correctness checks at mapping level before rendering.

## Exit Checklist

- [x] Current production renderer limitations documented.
- [x] Example-vs-current layout delta documented by section.
- [x] Runtime/deployment risks documented.
- [x] Recommended renderer direction documented.
