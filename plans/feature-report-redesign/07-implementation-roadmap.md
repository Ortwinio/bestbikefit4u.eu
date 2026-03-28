# 07 — Implementation Roadmap

## Goal
Turn the report-redesign plan into a safe execution order for multiple subagents, with explicit dependency gates and closeout evidence.

## Phase 1: Contract Freeze

Owner:
- Subagent A

Scope:
- Validate the real source data in `getReportV2`
- Define final `ReportV2Source` and `ReportV2Payload`
- Resolve score derivation rules and questionnaire normalization rules
- Define fallback rules for every optional rider and bike field
- Update mapper and tests first

Exit criteria:
- `ReportV2Payload` is final for this feature
- field nullability is documented in code or closeout output
- mapper tests cover:
  - full data
  - missing rider data
  - missing bike data
  - missing questionnaire data
  - score derivation behavior

## Phase 2: Shared PDF Shell

Owner:
- Subagent B

Scope:
- Refactor `pdfLayoutTemplate.ts` so the renderer has explicit section helper boundaries
- Introduce shared CSS helpers:
  - section titles
  - tiles
  - score cards
  - table styling
  - page-break helpers
- Implement cover and about sections
- Add localized date formatting and `lang` handling

Exit criteria:
- shared print/layout contract exists
- cover and about render in both locales
- no existing fit content is removed

## Phase 3: Content Sections

Owners:
- Subagent C for rider and physical scores
- Subagent D for bike section

Scope:
- Build rider profile section
- Build BMI and score visuals
- Build bike section with safe fallbacks
- Use only the frozen payload from Phase 1
- Respect shared shell/CSS from Phase 2

Exit criteria:
- sections hide cleanly when source data is missing
- no `null`/`undefined` output
- long-text and no-image cases remain printable

## Phase 4: Existing Fit Section Restyling And Audit

Owner:
- Subagent E

Scope:
- Restyle existing fit sections without changing values
- verify fallback behavior in route tests
- verify locale parity
- prepare final acceptance and success scorecard

Exit criteria:
- baseline fit values match pre-redesign output
- route tests still cover rich-render and fallback behavior
- audit output gives pass/fail on each acceptance item

## Required Verification Matrix

Every implementation pass must be checked against these fixtures:

1. Full data fixture
2. Sparse rider data fixture
3. No questionnaire fixture
4. No bike image fixture
5. Long text fixture
6. Dutch locale fixture

## Required Commands

- `npm run build:vercel`
- targeted `vitest` for:
  - `src/lib/reports/reportV2Mapper.test.ts`
  - `src/lib/reports/pdfLayoutTemplate.test.ts`
  - `src/app/api/reports/[sessionId]/pdf/route.test.ts`

## Integration Rules

- Subagent A owns data contract files.
- Subagent B owns the shell and shared renderer structure.
- Subagents C and D should avoid broad CSS edits.
- Subagent E should not rewrite other workers' output; it audits and does bounded regression-safe restyling only.
- Final integration should happen after all worker outputs are available.
