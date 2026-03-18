# Report V2 Test Plan

## Goal

Provide a single validation matrix for the report-v2 rollout across Convex, dashboard rendering, localization, and PDF export.

## Test Layers

### 1. Contract and mapper tests

- `src/lib/reports/reportV2Mapper.test.ts`
  Purpose: validate mapping from recommendation/session data into `ReportV2Payload`
- Legacy-shape coverage
  Purpose: ensure v1 recommendation data does not break the new renderer contract

### 2. Convex query tests

- Extend query/contract tests under `convex/recommendations/__tests__/` or `convex/sessions/__tests__/`
  Purpose: verify auth, ownership, and payload completeness for the report query
- Pending tire-pressure coverage
  Purpose: verify missing required fields are surfaced explicitly

### 3. Results page tests

- Add component or route-level coverage for the dashboard results route
  Purpose: verify complete state, pending-data state, and no-current-bike state
- Verify existing generation, download, and email behaviors still function

### 4. i18n tests

- `npm run test:i18n`
  Purpose: enforce EN/NL key parity for all new `results` namespace keys
- Manual NL spot-check
  Purpose: catch awkward or literal Dutch cycling terminology that parity tests cannot detect

### 5. PDF tests

- `src/lib/reports/pdfLayoutTemplate.test.ts`
  Purpose: verify section rendering for v2
- `src/app/api/reports/[sessionId]/pdf/route.test.ts`
  Purpose: verify locale param handling, fallback behavior, and response headers
- Pending tire-pressure PDF coverage
  Purpose: verify pending-data banner path renders instead of implying false precision

### 6. Full quality gates

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm test`

Run these only after Steps 01–06 are complete or when a step makes a high-risk cross-cutting change.

## Manual Scenarios

1. Complete v2 session
   Expect full results page, PDF export, education copy, adjustment sequence, and tire-pressure values.
2. Session missing tire-pressure inputs
   Expect pending-data banner, explicit missing-field list, and no false precision.
3. Session without current bike measurements
   Expect no delta column or empty placeholder cells.
4. Legacy v1 session
   Expect readable results page and a working PDF path.
5. NL locale session
   Expect Dutch UI strings and Dutch PDF output when locale is `nl`.

## Release Sign-Off

Release is only ready when:
- the full quality gates pass,
- manual scenarios 1–5 pass,
- phase-10 cutover rollback is documented,
- and no unresolved contract mismatch remains between the results page and PDF route.
