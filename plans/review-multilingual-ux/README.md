# Multilingual Completeness + UX Review

## Goal

Verify that the EN/NL multilingual implementation is complete and correct across all routes, and run a structured UX review of the full user journey from landing page through bike fit results.

## Background

Several multilingual plans have been executed:
- `feature-multilingual-homepage-switch` — COMPLETE (EN/NL public pages, locale routing, cookie persistence)
- `feature-dashboard-language-switch` — Step 04 browser QA still pending (automated checks pass)
- `feature-website-content-seo-multilingual-growth` — All 5 steps done

This plan does two things:
1. Closes the open browser QA gap from the dashboard i18n plan
2. Reviews UX quality holistically — flows, copy, accessibility, and responsiveness across both locales

## Scope

**Multilingual completeness:**
- All public routes render correct EN/NL copy
- Dashboard routes maintain locale on navigation
- Language switch works in all contexts (header, dashboard shell, mobile)
- First-visit locale detection (cookie → Accept-Language → en) is correct
- `<html lang>` and meta tags reflect active locale
- No hardcoded English strings remain in NL routes
- Translation key parity (no missing keys in NL dictionary)

**UX review:**
- Landing page: value proposition clarity, CTA effectiveness, mobile layout
- Onboarding/questionnaire flow: progress indication, step clarity, error states, back navigation
- Bike setup / dashboard: information hierarchy, empty states, loading states
- Tire pressure module: input UX, result display
- Results page: recommendation readability, PDF export discoverability
- Responsive design: mobile/tablet/desktop breakpoints across key pages
- Accessibility: keyboard navigation, focus management, ARIA labels, color contrast

## Out of Scope

- Adding new locale support (beyond EN/NL)
- Full WCAG 2.2 AA audit (covered separately if needed)
- Backend translation of Convex error messages
- SEO copy quality (covered in `feature-website-content-seo-multilingual-growth`)

## Approach

1. **i18n audit** — Static analysis: scan for hardcoded strings, check key parity in dictionaries
2. **Route coverage check** — List all routes and verify each has EN/NL variants
3. **Dashboard language switch QA** — Close the open Step 04 browser QA from `feature-dashboard-language-switch`
4. **UX flow review** — Walk through user journeys, document friction points and gaps
5. **Fix and verify** — Address P0/P1 findings; document P2/P3

## Acceptance Criteria

- Zero hardcoded user-facing strings in NL routes (excluding proper nouns and brand names)
- All EN dictionary keys have NL equivalents (no missing translations)
- Language switch works in header (public), dashboard sidebar (desktop), and mobile nav
- Locale persists across: refresh, internal navigation, login/logout redirect
- All pages are usable on mobile (375px viewport) without horizontal scroll
- Key interactive elements (buttons, form fields, modals) have visible focus indicators
- Loading and empty states exist for all async data displays

## Status

| Step | File | Priority | Status |
|------|------|----------|--------|
| 01 | `01-i18n-static-audit.md` | P0 | Todo |
| 02 | `02-route-coverage-check.md` | P1 | Todo |
| 03 | `03-dashboard-language-switch-qa.md` | P0 | Todo |
| 04 | `04-ux-flow-review.md` | P1 | Todo |
| 05 | `05-fix-and-verify.md` | P1 | Todo |
