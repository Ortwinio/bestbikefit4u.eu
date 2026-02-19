# Dashboard Language Switch Plan

## Goal
Make language switching fully work inside authenticated dashboard flows, so users can switch EN/NL and see both:
- localized route paths (`/en/...`, `/nl/...`)
- localized dashboard UI copy (navigation, page text, actions, errors, empty/loading states)

## Scope
- Dashboard shell/layout and sidebar/mobile nav
- Dashboard pages:
  - `/dashboard`
  - `/fit`
  - `/fit/[sessionId]/questionnaire`
  - `/fit/[sessionId]/results`
  - `/profile`
  - `/bikes`
  - `/bikes/new`
  - `/bikes/[bikeId]/edit`
- Shared dashboard components used by these pages (`DashboardSidebar`, `UserMenu`, questionnaire UI labels)

## Non-Goals
- Translating backend error messages emitted from Convex
- Adding extra locales beyond EN/NL
- Reworking global i18n architecture for public pages

## Approach
1. Create one dashboard-focused i18n access pattern for client components.
2. Move dashboard hardcoded strings into message catalogs.
3. Ensure a visible language switch exists in dashboard shell (desktop + mobile).
4. Keep locale when navigating between all dashboard pages.
5. Add tests for route switching and text rendering parity.

## Acceptance Criteria
1. Language switch is available while logged in on dashboard pages.
2. Switching language on any dashboard route keeps user on equivalent route in target locale.
3. Dashboard UI copy updates EN/NL consistently (no mixed-language chrome).
4. No TypeScript regressions; build passes.
5. i18n parity tests pass (`en`/`nl` key shape match).

## Status
- In progress
- [x] Step 01 complete: `output-01-string-inventory.md`
- [x] Step 02 complete: `output-02-dashboard-i18n-model.md`
- [x] Step 03 complete: `output-03-wire-dashboard-shell-and-pages.md`
- [ ] Step 04 in progress: `output-04-validate-and-release.md` (automated checks + tests done, browser QA pending)
