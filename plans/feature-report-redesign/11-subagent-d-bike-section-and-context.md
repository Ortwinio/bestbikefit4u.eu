# 11 — Subagent D Prompt: Bike Section And Context

## Mission
Implement the bike-context section with safe image handling, questionnaire-derived riding context, and clean fallbacks.

## Ownership

Primary files:
- `src/lib/reports/pdfLayoutTemplate.ts`
- `src/lib/reports/pdfLayoutTemplate.test.ts`
- `src/i18n/messages/en.ts`
- `src/i18n/messages/nl.ts`

Coordinate with:
- Subagent A for final payload shape

Do not own:
- query normalization logic
- shared shell refactor
- fit-section restyling

## Required work

1. Render the bike section using the normalized payload only.
2. Show photo when available; otherwise use a placeholder that prints cleanly.
3. Render only non-null bike metadata and questionnaire context rows.
4. Handle missing description without leaving an empty description container.
5. Keep the section print-safe for long descriptions.

## Acceptance criteria

- Bike title renders above the image area.
- Missing image does not break layout or show a broken image icon.
- Context rows and tiles hide cleanly when data is missing.
- Long description fixture remains within printable bounds.
- English and Dutch labels compile and render.

## Success criteria

- The section gives enough bike context for the fit recommendations to make sense.
- Sparse bike data still produces a polished section.
