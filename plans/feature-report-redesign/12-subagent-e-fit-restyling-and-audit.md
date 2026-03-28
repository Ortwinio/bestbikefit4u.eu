# 12 — Subagent E Prompt: Fit Restyling And Audit

## Mission
Restyle the existing fit sections without changing their values, then audit the full redesign against the plan acceptance and success criteria.

## Ownership

Primary files:
- `src/lib/reports/pdfLayoutTemplate.ts`
- `src/lib/reports/pdfLayoutTemplate.test.ts`
- `src/app/api/reports/[sessionId]/pdf/route.test.ts`

You may read:
- all plan files in `plans/feature-report-redesign`

Do not own:
- backend query shape
- major copy expansion beyond minor wording required by restyling

## Required work

1. Restyle:
   - priority summary
   - detailed fit
   - adjustment sequence
   - tire pressure
   - validation plan
   - fit notes
2. Confirm existing fit values remain intact.
3. Confirm route fallback behavior still works when rich HTML render fails.
4. Produce a final audit report.

## Acceptance criteria

- Existing fit values and row counts remain intact for the baseline fixture.
- Status, target, and callout styling are visually upgraded.
- Ready and pending tire-pressure states remain distinct and correct.
- Route tests still cover fallback to the simple PDF path.
- Final audit maps every acceptance criterion to pass/fail evidence.

## Success criteria

- The redesign improves visual quality without changing recommendation semantics.
- The plan is shippable with explicit known gaps, if any.

## Required output

Create:
- `plans/feature-report-redesign/output-02-final-audit.md`

That output must include:
- findings by severity
- acceptance scorecard
- success scorecard
- test/build results
- ship recommendation
