# Plan: Bike Fit Report Redesign

## Goal
Transform the PDF bike fit report from a plain HTML document into a structured, branded, multi-section report that includes rider context, body metrics, bike information, and the existing fit data — with colour, illustrations, and visual indicators.

## Background
The current report is generated in `src/lib/reports/pdfLayoutTemplate.ts` as a single HTML string rendered to PDF via Playwright. It starts directly with the fit data (priority table, detailed fit, adjustment sequence, tyre pressure, validation plan). It has minimal branding, no rider identity section, no body measurement visuals, no bike photo or context, and uses black-and-white styling throughout.

The Convex `getReportV2` query already fetches: `session`, `recommendation`, `bike`, `bikeProfile`, `profile`, and `latestPressureCalculation`. The `profile` doc contains all body measurements, flexibility, core stability, and comfort scores. The `bike` doc contains name, type, brand, model, riding style, goal, and description. This means no new backend queries are needed for most sections — the data is already there.

## Architecture: How the PDF is built
```
GET /api/reports/[sessionId]/pdf
  → convex.query(getReportV2)            # fetches all source data
  → mapReportV2Payload(source)           # transforms into ReportV2Payload
  → renderPdfReportHtml({ report, copy }) # renders HTML string
  → renderPdfFromHtml(html)              # Playwright → PDF bytes
```

The main file to change is `src/lib/reports/pdfLayoutTemplate.ts`.
Supporting changes: `reportV2Types.ts`, `reportV2Mapper.ts`, `pdf/route.ts` (to pass extra source data), and possibly `convex/recommendations/queries.ts` (to fetch bike description and questionnaire responses).

## Audit Findings

The original plan is directionally strong, but not implementation-ready yet.

Main findings:
- Steps `02` through `06` all write to the same hotspot: `src/lib/reports/pdfLayoutTemplate.ts`. That is not safe for parallel subagent execution.
- Acceptance criteria are partly subjective. Terms like `clear visual hierarchy` and `page-break-safe styling` need explicit verification rules.
- The plan does not define a data-contract freeze before template work begins. Section work should not start until `ReportV2Payload` and fallback rules are settled.
- PDF-specific risks are under-specified: page breaks, long-text overflow, image-resolution failures, missing optional data, and rich-render fallback behavior.
- Localization parity is not explicitly gated, even though `reportV2` copy is tightly mirrored across `en.ts` and `nl.ts`.
- Some data assumptions need validation during implementation, especially profile score derivation and questionnaire-response normalization.

## Implementation Strategy

This plan should be executed in four phases, not as six independent template edits:

1. Data contract freeze
2. Shared PDF layout primitives and print contract
3. Section implementation on top of that contract
4. Validation, fallback parity, and closeout

This makes the work safe for parallel subagents:
- backend/data contract worker
- shared PDF layout worker
- rider and physical scores worker
- bike section worker
- fit-section restyling worker
- independent audit worker

## New Report Structure

| # | Section | Data source |
|---|---------|-------------|
| 0 | **Cover / Header** | Brand logo, report title, date | Static + session.createdAt |
| 1 | **About Bestbikefit4u** | Value proposition, benefit bullets | Static copy |
| 2 | **Rider profile** | Rider name/photo, body measurements, BMI visual | `profile` doc + `user` |
| 3 | **Flexibility** | Score 1–5, coloured scale visual, description | `profile.flexibilityScore` |
| 4 | **Core stability** | Score 1–5, segmented bar visual, description | `profile.coreStabilityScore` |
| 5 | **Comfort & discomfort** | Comfort score + impact text | `profile.comfortScore` |
| 6 | **Your bike** | Bike name, photo, riding style, goal, bike type, AI description | `bike` doc + bikeImageUrl |
| 7–11 | **Existing fit sections** | Priority table, detailed fit, adjustment sequence, tyre pressure, validation plan, fit notes | `recommendation` |

## Scope

**In scope:**
- Redesign `pdfLayoutTemplate.ts` with the new section order and visual layout
- Add new data fields to `ReportV2Payload` and `ReportV2Source` for rider/bike context
- Update `reportV2Mapper.ts` to include rider name, body metrics, scores, bike description
- Update `getReportV2` query to also fetch questionnaire responses (for riding context in section 6) and user name
- Add brand colour palette and inline SVG visuals (BMI bar, flexibility scale, stability bar) to the HTML template
- Add static copy for the "About" section to `en.ts` / `nl.ts`
- Ensure the cover/header uses the Bestbikefit4u wordmark (inline SVG or text-based logo)
- Add PDF print-safety rules for section spacing, page breaks, and long-content handling
- Add regression tests for mapper, HTML rendering, locale parity, and route fallback behavior

**Out of scope:**
- Climbing profile tab in PDF (separate future feature)
- Interactive or web-based report viewer changes
- Changes to the on-screen results page
- Replacing the simple-PDF fallback format in this pass
- Introducing a new web design system for the results page
- New AI generation work for bike descriptions

## Acceptance criteria
- Full-data fixture PDF renders in this order:
  1. header
  2. about
  3. rider profile
  4. flexibility
  5. core stability
  6. comfort and discomfort
  7. your bike
  8. existing fit sections
- Header contains the Bestbikefit4u brand mark or wordmark, report title, and a localized report date.
- About section contains one intro paragraph and 4-6 bullet points in both English and Dutch.
- Rider section renders only present values; it never prints `null`, `undefined`, empty badges, or empty tiles.
- Rider section shows BMI only when both height and weight are available.
- Flexibility, core stability, and comfort sections are hidden when their source values are unavailable.
- Bike section shows only available bike and questionnaire fields; missing photo falls back to a placeholder without breaking the PDF.
- Existing fit sections preserve their current row counts and values for the baseline fixture.
- Rich PDF HTML uses brand accents consistently for section titles, badges, and callouts.
- Long-text fixture does not overflow outside the printable area.
- Section headings are not orphaned from their first content block in the sample HTML/PDF fixtures.
- `npm run build:vercel` passes.
- Report mapper tests and HTML template tests cover both `en` and `nl`.

## Success Criteria

### Product success
- The report looks intentionally branded and materially richer than the current plain report.
- A rider can understand who the report is for, what bike/context it applies to, and what to change without referring back to the app.
- Sparse-data reports still feel complete rather than broken or partially rendered.

### Operational success
- Rich HTML render does not fail when optional rider, bike, score, or questionnaire fields are missing.
- If rich rendering fails, the route still returns a valid PDF through the existing fallback path.
- No regressions are introduced to the on-screen results page or the report download route.

### Delivery success
- All acceptance criteria are evidenced by tests or fixture snapshots.
- English and Dutch copy remain type-safe and in parity.
- The plan can be executed by subagents with minimal file overlap.

## Prompts
- `01-data-model-and-query.md` — Extend `ReportV2Source`, `ReportV2Payload`, mapper, and Convex query
- `02-pdf-template-cover-and-about.md` — Cover header + About section HTML/CSS
- `03-pdf-template-rider-section.md` — Rider profile, BMI visual, measurements
- `04-pdf-template-physical-scores.md` — Flexibility, core stability, comfort sections with inline SVG visuals
- `05-pdf-template-bike-section.md` — Bike section with photo, context, AI description
- `06-pdf-template-fit-sections-styling.md` — Colour and illustration improvements to existing fit sections
- `07-implementation-roadmap.md` — dependency-based execution order, validation gates, and integration steps
- `08-subagent-a-contract-and-backend.md` — data contract, query, mapper, tests
- `09-subagent-b-pdf-shell-and-cover.md` — shared PDF shell, page-break contract, cover, about
- `10-subagent-c-rider-and-physical-scores.md` — rider, BMI, flexibility, core, comfort sections
- `11-subagent-d-bike-section-and-context.md` — bike section, questionnaire context, fallbacks
- `12-subagent-e-fit-restyling-and-audit.md` — fit-section restyling, regression checks, final scorecard

## Progress
- [x] 01 Data model and query
- [x] 02 Cover and About section
- [x] 03 Rider profile section
- [x] 04 Physical scores sections
- [x] 05 Bike section
- [x] 06 Fit sections styling
- [x] 07 Implementation roadmap
- [x] 08 Subagent A prompt
- [x] 09 Subagent B prompt
- [x] 10 Subagent C prompt
- [x] 11 Subagent D prompt
- [x] 12 Subagent E prompt

## Notes For Implementation

- Do not start parallel section work before the payload and fallback rules are frozen.
- Do not let multiple workers edit `pdfLayoutTemplate.ts` blindly. One worker should own the shell and shared CSS, and the final integrator should merge section renderers.
- Treat PDF print behavior as a first-class requirement, not a visual afterthought.

_Implemented with subagents. Validation: targeted `vitest` passed `18/18`; `npm run build:vercel` passed._
