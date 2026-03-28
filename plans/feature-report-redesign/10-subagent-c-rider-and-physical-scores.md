# 10 — Subagent C Prompt: Rider And Physical Scores

## Mission
Implement the rider profile, BMI, flexibility, core stability, and comfort sections on top of the frozen payload and shared PDF shell.

## Ownership

Primary files:
- `src/lib/reports/pdfLayoutTemplate.ts`
- `src/lib/reports/pdfLayoutTemplate.test.ts`
- `src/i18n/messages/en.ts`
- `src/i18n/messages/nl.ts`

Do not own:
- data/query/mapping rules
- bike section
- route fallback behavior

## Required work

1. Add rider profile section.
2. Show only available measurements.
3. Render BMI only when both weight and height are present.
4. Render flexibility, core stability, and comfort only when values exist.
5. Use shared styles from the shell instead of introducing competing ad hoc styles.

## Acceptance criteria

- Rider name falls back gracefully when unavailable.
- No empty measurement tiles render.
- No `null`, `undefined`, or empty badges appear in the HTML.
- BMI marker and category render only when BMI can be calculated.
- Flexibility/core/comfort sections are fully hidden when source data is missing.
- Tests cover at least one sparse-data case and one full-data case.

## Success criteria

- The rider-related sections are informative with full data and unobtrusive with partial data.
- All new copy is present in English and Dutch with matching structure.
