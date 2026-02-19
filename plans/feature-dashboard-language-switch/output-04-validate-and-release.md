# Step 04 Output - Validate, Test, and Release

## Automated Checks

Executed on 2026-02-19:

- `npm run typecheck` -> passed
- `npm run test:i18n` -> passed
- `npm run build` -> passed

## Test Coverage Added

1. Dashboard locale switch route retention
- Added `tests/integration/dashboard-locale-switch.integration.test.ts` with coverage for:
  - `/en/dashboard` -> `/nl/dashboard`
  - dynamic questionnaire route + query retention
  - dynamic results route from unprefixed path
  - nested bikes edit route + query retention

2. Key dashboard label assertions
- Extended `src/i18n/dashboardMessages.test.ts` to assert EN/NL labels used by:
  - dashboard shell (mobile menu aria)
  - questionnaire action labels
  - results back-navigation label
  - bikes empty-state label

3. i18n test runner inclusion
- Updated `package.json` `test:i18n` to include:
  - `tests/integration/dashboard-locale-switch.integration.test.ts`

## Manual QA Matrix (Browser)

Status: pending (requires interactive browser run).

- [ ] EN desktop: `/en/dashboard` switch to NL, stay on `/nl/dashboard`.
- [ ] EN desktop: `/en/fit` switch to NL, stay on `/nl/fit`.
- [ ] EN desktop: `/en/profile` switch to NL, stay on `/nl/profile`.
- [ ] EN desktop: `/en/bikes` switch to NL, stay on `/nl/bikes`.
- [ ] EN desktop: `/en/fit/[sessionId]/questionnaire` switch to NL, path preserved.
- [ ] EN desktop: `/en/fit/[sessionId]/results` switch to NL, path preserved.
- [ ] NL mobile: verify dashboard top bar switch works and mobile menu labels are localized.
- [ ] NL mobile: verify sidebar/nav links remain in NL after navigation.
- [ ] Both locales: verify no mixed-language strings in dashboard shell + subpages.

## Rollout Checklist

- [ ] Commit Step 4 changes with summary of added tests.
- [ ] Open PR with validation evidence (`typecheck`, `test:i18n`, `build`).
- [ ] Attach screenshots:
  - EN dashboard shell + one subpage
  - NL dashboard shell + one subpage
