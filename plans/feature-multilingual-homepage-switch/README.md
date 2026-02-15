# Multilingual Dutch/English Rollout Plan

## Goal

Make the app multilingual in English and Dutch, with a language switch available on the homepage and consistent locale behavior across public and authenticated routes.

## Background

Current implementation is English-only:

1. `src/app/layout.tsx` hard-codes `<html lang="en">`.
2. Homepage copy in `src/app/(public)/page.tsx` is hard-coded English.
3. Shared chrome (`src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`) is hard-coded English.
4. No locale routing, locale persistence, or browser-language detection exists.

## Scope

In scope:

- English (`en`) + Dutch (`nl`) locale infrastructure.
- Locale-aware routing and redirect strategy for first visit.
- Homepage translation and visible language switch on homepage.
- Shared navigation/chrome localization needed for a coherent UX.
- Locale-aware metadata (`lang`, canonical/hreflang where applicable).
- Tests and docs for i18n behavior.

Out of scope:

- Adding languages beyond English/Dutch.
- Translating user-generated content or Convex stored free-text.
- Changing bike-fit calculation logic.

## Approach

1. Lock architecture decisions (routing strategy, dictionary structure, fallback rules).
2. Implement i18n foundation (locale config, dictionary loader, locale detection/persistence).
3. Translate homepage and add a robust language switch control.
4. Expand translation coverage for shared app chrome and critical pages.
5. Add automated tests, QA checklist, and operational docs.

## Dependencies

- Next.js App Router structure in `src/app/`.
- Auth+proxy behavior in `src/proxy.ts` (must remain intact after locale routing updates).
- Existing shared layout components in `src/components/layout/`.

## Acceptance Criteria

- `en` and `nl` homepage variants render translated copy.
- Homepage language switch toggles locale and preserves current path/query when possible.
- First visit locale selection follows `cookie -> Accept-Language -> en` fallback.
- Locale preference persists via cookie.
- Shared public navigation/footer text is translated for both locales.
- `<html lang>` and page metadata reflect active locale.
- Tests verify locale detection, switch behavior, and no auth-regression in protected routes.

## Status

- Owner: `@codex`
- Target completion: `2026-03-01`
- Last updated: `2026-02-15`
- State: `COMPLETE`

| Step | File | Priority | Status |
|------|------|----------|--------|
| 01 | `01-i18n-architecture.md` | P0 | Done |
| 02 | `02-i18n-foundation.md` | P0 | Done |
| 03 | `03-homepage-switch-and-translation.md` | P0 | Done |
| 04 | `04-shared-pages-localization.md` | P1 | Done |
| 05 | `05-testing-docs-rollout.md` | P1 | Done |
