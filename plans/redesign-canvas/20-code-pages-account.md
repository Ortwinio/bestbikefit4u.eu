# 20 — Phase 6e: build the account pages (after 19)

**App code, don't commit** (the lead reviews per batch). Source: the approved account boards (after 17 polish + 11 alignment) in `canvas/`. Convex queries/mutations and authz stay untouched; only the presentation changes. The review-state strip from the boards is **not** built. The states it shows (loading/empty/error/free/pro) are built as real UI states.

## 0. Shell
`DashboardSidebar` + the mobile header per `canvas/Dashboard.dc.html` (ink, active item lime, plan block at the bottom showing the real subscription/usage, payments paused = the real state). On mobile: a bottom tab bar per `m/Dashboard.dc.html` (phase 5).

## Batches (print `DONE 20.N`, wait for approval)
1. `/dashboard`, `/profile`, `/profile/improve/*`, `/login` (email code + Google; auth logic unchanged).
2. `/fit`, `/fit/[sessionId]/questionnaire`, `/fit/[sessionId]/results`, `/fit/how-it-works`, `/fit-history`.
3. `/bikes`, `/bikes/new`, `/bikes/new/manual`, `/bikes/[bikeId]`, `/bikes/[bikeId]/edit`, `/bikes/import/*`, `/bikes/compare-fit` (fix the CTA: `/bikes` instead of `/dashboard/bikes`).
4. `/pressure-calculator`, `/gearing`, `/saddle-selector`, `/shoe-cleat-fit` (fix the CTA: `/fit` instead of `/dashboard/fit`), `/settings`, `/feedback`, `/app`.

Also: the bike-fit form height range 140–220 cm → the engine's 130–210 cm (`BikeFitCalculatorForm.tsx:235`), with a test.

## Per batch: done when
typecheck/lint/test:unit/test:i18n/build pass; screenshots 1440 + 390 (logged in via the local test/dev account flow if available, otherwise render the components with fixtures in a test harness, and say which). The existing e2e/integration tests for dashboard and locale switch stay green (`npm run test:e2e:i18n` where it can run locally). `audit/20-notes.md` updated.
