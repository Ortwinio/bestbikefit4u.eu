# Output 07 — QA, Compatibility, and Release

## Status

Report-v2 implementation is complete in repo terms, with repo-wide blockers outside the report-v2 scope still preventing a fully clean global release gate.

## Functional Check

- [x] New fit session uses engine v2 by default
- [x] Results page uses `getReportV2` + shared mapper
- [x] Results page renders report-v2 sections in the full-report surface
- [x] Tire-pressure pending state is supported
- [x] Current-vs-target deltas are supported
- [x] PDF route requests locale-aware output
- [x] PDF route uses `getReportV2`
- [x] PDF route keeps simple-render fallback
- [x] PDF rate limiting remains active
- [x] Legacy recommendation fallback remains readable through the shared mapper

## Quality Gate Results

### Passed

- `npm run test:i18n`
  - passed, `30/30`
- `npx vitest run src/lib/reports/reportV2Mapper.test.ts src/lib/reports/pdfLayoutTemplate.test.ts 'src/app/api/reports/[sessionId]/pdf/route.test.ts'`
  - passed, `21/21`

### Repo-wide blockers outside report-v2

- `npm test`
  - failed due existing parse error in [geometry-link-card.test.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/bikes/[bikeId]/geometry-link-card.test.ts:14)
- `npm run lint`
  - failed due existing non-report issues in:
    - [scripts/import-guide-json.ts](/Users/ortwinverreck/Developer/bestbikefit4u/scripts/import-guide-json.ts:229)
    - [src/app/(dashboard)/bikes/[bikeId]/geometry-link-card.test.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/bikes/[bikeId]/geometry-link-card.test.ts:14)
    - plus unrelated warnings in guide/questionnaire files
- `npm run build`
  - failed due existing questionnaire i18n typing issues in:
    - [src/components/questionnaire/localization.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/questionnaire/localization.ts:23)
    - [src/components/questionnaire/QuestionRenderer.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/questionnaire/QuestionRenderer.tsx:136)
- `npm run typecheck`
  - same questionnaire i18n typing failures as the build run above

## Compatibility / Regression Notes

- The shared mapper remains defensive when recommendation detail is sparse, which preserves readable output for older data shapes.
- Full v2 sections are still monetized behind Fit Pass / Pro in the dashboard route; that is a product-policy deviation from the original plan, not a technical blocker.
- PDF export remains premium-gated and rate-limited.

## Release Readiness

`report-v2` itself is implemented and documented, but global release sign-off is not clean until the unrelated repo-wide failures above are resolved.

## Residual Risks

1. Questionnaire localization/type drift is currently breaking repo-wide typecheck/build.
2. A broken unrelated test file currently blocks `npm test`.
3. The original plan expected the full results page for all users; the actual implementation preserves the existing paid-access boundary.
