# Output 05 — PDF Report V2

## Status

Implemented before this session and verified in code and tests.

## Template / Route Files

- `src/app/api/reports/[sessionId]/pdf/route.ts`
- `src/lib/reports/pdfLayoutTemplate.ts`
- `src/lib/reports/reportV2Mapper.ts`
- `src/lib/reports/reportV2Copy.ts`
- `src/lib/pdf/htmlPdf.ts`
- `src/lib/pdf/simplePdf.ts`

## Template Sections Implemented

The rich PDF renderer includes:

1. Header / cover metadata
2. About-this-report section
3. Rider profile
4. Rider score sections when data exists
5. Bike context
6. Priority summary
7. Detailed fit table
8. Adjustment sequence
9. Tire pressure section
10. 14-day validation plan
11. Footer with print metadata

## Locale Handling

- Route accepts `GET /api/reports/[sessionId]/pdf?locale=nl`
- Locale resolution order:
  1. `locale` query param
  2. locale header
  3. referrer pathname locale
  4. cookie / `Accept-Language`
  5. `DEFAULT_LOCALE`
- `Content-Disposition` filename includes the locale:
  - `bestbikefit4u-report-[sessionId]-[locale].pdf`

## Shared Payload Contract

- PDF route queries `api.recommendations.queries.getReportV2`
- The route maps the source through `mapReportV2Payload(...)`
- The template consumes the same payload family as the dashboard page

This satisfies the Step 02 contract boundary; there is no separate PDF-only payload type.

## Fallback Mechanism

- Rich path:
  - `renderPdfReportHtml(...)`
  - `renderPdfFromHtml(...)`
- Fallback path:
  - `buildRecommendationPdfLines(...)`
  - `createSimplePdfFromLines(...)`

When rich rendering fails:
- the error is logged server-side
- the response falls back to the simple renderer
- response headers expose render metadata:
  - `X-Report-Render-Mode`
  - `X-Report-Render-Strategy`
  - `X-Report-Render-Fallback-Reason`

## Test Coverage Added / Verified

- `src/lib/reports/pdfLayoutTemplate.test.ts`
- `src/app/api/reports/[sessionId]/pdf/route.test.ts`

Verified cases:
- required report-v2 sections render
- locale-aware copy and `lang` attribute
- localized header / footer output
- bike image rendering
- rider-score section omission when rider data is absent
- route locale handling
- inline vs attachment disposition
- rich-render success path
- simple-render fallback path

## Quality Results

- `npx vitest run src/lib/reports/pdfLayoutTemplate.test.ts 'src/app/api/reports/[sessionId]/pdf/route.test.ts'` — passed
- `npm run test:i18n` — passed

Repo-wide gates were also run during Step 07 closeout; their failures were unrelated to report-v2 and are documented there.
