# Step 02 Output - Dashboard i18n Model

## Implemented

1. Extended message catalogs with a full typed dashboard tree:
- `src/i18n/messages/en.ts`
- `src/i18n/messages/nl.ts`

2. Added reusable typed dashboard dictionary accessor:
- `src/i18n/dashboardMessages.ts`
  - exports `DashboardMessages` type
  - exports `getDashboardMessages(locale)`

3. Added client-safe dashboard i18n hook:
- `src/i18n/useDashboardMessages.ts`
  - derives locale from pathname
  - returns `{ locale, messages }` for dashboard components

## Dashboard Key Structure Added
- `dashboard.common`
- `dashboard.nav`
- `dashboard.layout`
- `dashboard.userMenu`
- `dashboard.sessions`
- `dashboard.home`
- `dashboard.fit`
- `dashboard.questionnaire`
- `dashboard.results`
- `dashboard.profile`
- `dashboard.bikes`
- `dashboard.bikeForm`
- `dashboard.errors`

## Validation
- `npm run typecheck` passed
- `npm run test:i18n` passed

## Additional Hardening
- Added dashboard catalog unit tests:
  - `src/i18n/dashboardMessages.test.ts`
- Added this test to the i18n test script in `package.json`:
  - `test:i18n` now includes `src/i18n/dashboardMessages.test.ts`

## Notes for Step 03
- Replace dashboard hardcoded strings with `useDashboardMessages()`.
- Remove component-local locale maps and ternary NL/EN branches.
- Add dashboard `LanguageSwitch` in authenticated shell (desktop + mobile).
