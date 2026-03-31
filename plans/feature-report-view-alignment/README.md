# Report View Alignment Plan

## Goal

Make the production PDF consistently use the rich report layout and bring the in-app fit results page visually closer to that PDF layout.

## Findings

### 1. Production PDF likely falls back to the old simple generator

The PDF route in `src/app/api/reports/[sessionId]/pdf/route.ts` explicitly tries the rich HTML renderer first and falls back to the old line-based PDF when rich rendering fails.

Current fallback path:

- `renderPdfReportHtml(...)`
- `renderPdfFromHtml(...)`
- on error: `createSimplePdfFromLines(buildRecommendationPdfLines(...))`

The likely production problem is in `src/lib/pdf/htmlPdf.ts`:

- it imports raw `playwright`
- it launches Chromium directly inside a Vercel Node function
- there is no serverless-compatible Chromium packaging or remote browser strategy

That means production can silently fall back to the simple PDF even while local development succeeds.

### 2. The on-page report uses the same data contract but not the same layout system

The results page in `src/app/(dashboard)/fit/[sessionId]/results/page.tsx` already uses `getReportV2Copy(...)` and `mapReportV2Payload(...)`, so the content contract is aligned.

But the visual shell diverges from the PDF:

- the PDF has a branded cover/header/footer rhythm
- the on-page report is a stack of generic cards/tables
- pressure, profile, and bike context sections do not use the same visual hierarchy as the PDF

So this is not a data mismatch problem. It is mostly:

- a production PDF rendering reliability problem
- a presentation system mismatch between PDF and in-app results

## Scope

In scope:

- make rich PDF rendering production-safe
- add explicit observability for rich-vs-fallback PDF rendering
- align the on-page results layout with the PDF layout system
- keep report content and localization consistent across both surfaces

Out of scope:

- changing the recommendation engine logic
- changing the report data contract beyond minor display needs
- redesigning unrelated dashboard pages

## Acceptance Criteria

1. Production PDF downloads use the rich HTML layout for normal sessions instead of silently falling back to the simple PDF.
2. If rich rendering fails, the failure reason is observable in logs/telemetry and can be measured.
3. The results page uses the same section order and visual grouping as the PDF:
   - intro / cover summary
   - rider profile
   - bike context
   - priority summary
   - detailed fit
   - adjustment sequence
   - tire pressure
   - validation plan
4. Core visual cues match the PDF:
   - stronger branded hero/header treatment
   - metric tiles instead of plain tables where appropriate
   - pressure bars
   - more deliberate section spacing and hierarchy
5. EN/NL rendering remains correct in both PDF and on-page views.
6. `npm run build:vercel` passes and report tests cover the new behavior.

## Success Criteria

- production users stop seeing the old simple report unless a real rich-render failure occurs
- support/admin can distinguish rich-render success from fallback events
- the in-app results page feels like the interactive companion of the PDF, not a separate design system

## Execution Steps

- `01-pdf-production-reliability.md`
- `02-on-page-layout-alignment.md`
- `03-component-refactor-and-visual-system.md`
- `04-validation-and-rollout.md`
