# 08 — Subagent A Prompt: Contract And Backend

## Mission
Own the report data contract. Make the report payload implementation-ready without breaking the current PDF route or on-screen results consumers.

## Ownership

Primary files:
- `convex/recommendations/queries.ts`
- `src/lib/reports/reportV2Types.ts`
- `src/lib/reports/reportV2Mapper.ts`
- `src/lib/reports/reportV2Mapper.test.ts`
- `src/app/api/reports/[sessionId]/pdf/route.test.ts`

You may adjust:
- `src/app/api/reports/[sessionId]/pdf/route.ts`

Do not own:
- `src/lib/reports/pdfLayoutTemplate.ts`
- locale copy files except where a type addition forces a minimal coordinated change

## Required work

1. Extend `getReportV2` safely.
2. Add the rider and bike sections to `ReportV2Payload`.
3. Validate real score derivation from existing profile data instead of assuming wrong storage shapes.
4. Normalize questionnaire responses into a stable report-facing structure.
5. Define fallback behavior for:
   - missing user name
   - missing body metrics
   - missing bike description
   - missing questionnaire responses
6. Preserve existing payload consumers.

## Acceptance criteria

- Query returns the additional source data needed by the redesign.
- `ReportV2Payload` includes stable `rider`, `bike`, and `reportDate` fields.
- Mapper never emits `undefined` in payload fields intended for rendering.
- Mapper tests cover full and sparse inputs.
- Existing route tests still pass after the payload extension.

## Success criteria

- Later section workers can render without touching query logic.
- There is one canonical normalization layer for questionnaire-derived report labels.
- No existing fit values regress.

## Required output

Create:
- `plans/feature-report-redesign/output-01-contract-audit.md`

That output must state:
- final payload fields
- nullability rules
- score derivation rules
- known deferrals
