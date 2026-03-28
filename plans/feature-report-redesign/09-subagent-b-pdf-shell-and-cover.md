# 09 — Subagent B Prompt: PDF Shell And Cover

## Mission
Own the shared PDF renderer structure so later workers can add sections safely. Refactor the shell, implement the header and about section, and define print-safe shared styles.

## Ownership

Primary files:
- `src/lib/reports/pdfLayoutTemplate.ts`
- `src/lib/reports/pdfLayoutTemplate.test.ts`
- `src/i18n/messages/en.ts`
- `src/i18n/messages/nl.ts`
- `src/lib/reports/reportV2Copy.ts`

Do not own:
- query or mapper logic
- bike-specific or rider-specific section data mapping

## Required work

1. Refactor the renderer into clear helper boundaries.
2. Add shared CSS tokens/helpers for:
   - section titles
   - content tiles
   - callout panels
   - tables
   - page-break protection
3. Implement:
   - branded header
   - localized report date
   - about section
4. Replace hardcoded `<html lang=\"en\">` with a locale-aware value.
5. Keep existing fit content rendering intact.

## Acceptance criteria

- Header renders brand mark or wordmark, title, and localized date.
- About section renders in both locales with localized copy.
- Shared shell includes page-break controls for section blocks and image/card surfaces.
- Existing fit sections still render after the shell refactor.
- Template tests are updated to assert the new top-of-report structure.

## Success criteria

- Later workers can add sections as helper functions rather than editing a single giant string blindly.
- Print-safe CSS is centralized and reusable.
- The template is ready for bounded parallel additions.
