# Output 03 — Dashboard Language Switch QA

Refreshed on 2026-04-14 after the multilingual closeout pass.

## Result Summary

- Static route-switch verification: PASS
- Integration coverage (`tests/integration/dashboard-locale-switch.integration.test.ts`): PASS
- Public locale persistence and shell smoke: PASS via local built app
- Protected dashboard browser walkthrough: BLOCKED by missing signed-in test credentials in this workspace

## What Was Verified

### Route + query preservation

Verified statically from the routing utilities and integration tests:

- Locale switching preserves the pathname shape for dashboard routes
- Dynamic segments such as `sessionId` remain intact
- Query strings are preserved
- Locale preference continues to rely on `bf_locale` cookie plus request header resolution

### Dashboard shell coverage

Verified from current source:

- Desktop dashboard sidebar renders `LanguageSwitch`
- Mobile dashboard topbar renders `LanguageSwitch`
- Dashboard navigation labels are dictionary-backed
- Authenticated public mobile nav labels are dictionary-backed

### Local browser/app smoke

Verified against a fresh local production build:

- `npm run build` completed successfully
- `npm run start -- --port 3001` served the built app successfully
- Playwright could be launched only with elevated execution in this environment
- Direct protected-route browser QA could not be completed without a real authenticated session

## Checklist

### Desktop (>=1024px)

- [x] Language switch code path exists in dashboard sidebar
- [x] `/en/dashboard` -> `/nl/dashboard` is covered by switch-path logic
- [x] `/en/fit/[sessionId]/questionnaire` -> `/nl/fit/[sessionId]/questionnaire` is covered by switch-path logic
- [x] `/en/fit/[sessionId]/results` -> `/nl/fit/[sessionId]/results` is covered by switch-path logic
- [x] `/en/profile` -> `/nl/profile` is covered by switch-path logic
- [x] `/en/bikes` -> `/nl/bikes` is covered by switch-path logic
- [x] `/en/bikes/new` -> `/nl/bikes/new` is covered by switch-path logic
- [x] `/en/bikes/[bikeId]/edit` -> `/nl/bikes/[bikeId]/edit` is covered by switch-path logic
- [x] Query parameters are preserved by the switch helper
- [ ] Real signed-in browser navigation through those routes

### Mobile (<=767px)

- [x] Language switch code path exists in the mobile dashboard header
- [ ] Real signed-in mobile browser walkthrough

### Copy verification

- [x] Dashboard shell/navigation labels are localized
- [x] Questionnaire action buttons are localized
- [x] Results back-navigation label is localized
- [x] Bikes empty state is localized
- [x] Previously stale authenticated mobile-nav label issue is fixed in current code

### Locale persistence

- [x] Cookie-driven persistence remains implemented in proxy + locale resolution
- [ ] Signed-in logout/login persistence walkthrough in a browser

## Residual Risk

The remaining gap is not a known routing bug; it is missing manual evidence for the authenticated browser walkthrough. Completing that last check requires valid login credentials or a seeded local auth session.
