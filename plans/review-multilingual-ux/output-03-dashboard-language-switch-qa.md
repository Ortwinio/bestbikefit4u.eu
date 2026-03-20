# Output 03 — Dashboard Language Switch QA

## Static Analysis Summary

Browser testing was not performed (no browser available in this execution context). This document covers what can be verified statically from source code, plus identifies what still requires manual browser QA.

---

## Static Verification Results

### Routing logic — PASS

The `LanguageSwitch` component (`src/components/layout/LanguageSwitch.tsx`) uses `buildLocaleSwitchHref()` which calls `switchLocalePathname()` → `withLocalePrefix()`. The logic:

1. Reads `usePathname()` to get the current path (includes `[sessionId]` values)
2. Strips the current locale prefix via `stripLocalePrefix()`
3. Replaces with the target locale prefix
4. Appends the query string from `useSearchParams()`

This correctly handles all dashboard route shapes:
- `/en/dashboard` → `/nl/dashboard`
- `/en/fit/[sessionId]/questionnaire` → `/nl/fit/[sessionId]/questionnaire` (sessionId preserved)
- `/en/fit/[sessionId]/results` → `/nl/fit/[sessionId]/results`
- `/en/profile` → `/nl/profile`
- `/en/bikes` → `/nl/bikes`
- `/en/bikes/new` → `/nl/bikes/new`
- `/en/bikes/[bikeId]/edit` → `/nl/bikes/[bikeId]/edit`
- `/en/pressure-calculator?bikeId=xxx` → `/nl/pressure-calculator?bikeId=xxx` (query preserved)

### Switch component placement — PASS

The `LanguageSwitch` is rendered in:
- `DashboardSidebar.tsx` (desktop, top of sidebar below brand link)
- `DashboardLayout` mobile topbar (the sticky `div` shown on `md:hidden`)

Both pass `locale` and `languageSwitchLabels` props from `useDashboardMessages()`, which is correctly locale-aware.

### Copy coverage — static PASS

All dashboard navigation items, action buttons, and state labels are sourced from the `useDashboardMessages()` hook backed by `nl.ts` dictionary entries. One exception found:

- `HeaderMobileMenu.tsx` (public header mobile nav, not dashboard) uses inline ternaries for authenticated user links — these strings appear correct but are not sourced from the dictionary. See output-01 for details.

### Locale persistence — logic PASS

- `LanguageSwitch` uses `<a href>` (not `<Link>`) for navigation, which triggers a full page load
- On full page load, the proxy middleware reads `bf_locale` cookie and sets `x-bf-locale` header
- `getRequestLocale()` reads `x-bf-locale` first, providing stable locale on reload
- On logout: the cookie is not cleared by `signOut()` (Convex auth action), so locale should persist across login/logout cycles

---

## QA Checklist — Static Assessment

### Desktop (≥1024px)

| Item | Static Result | Browser QA needed? |
|------|--------------|-------------------|
| Language switch visible in dashboard sidebar | PASS (code confirmed) | Yes — verify render position |
| Switching on `/en/dashboard` → `/nl/dashboard` | PASS (logic correct) | Yes — verify navigation |
| Switching on `/en/fit/[sessionId]/questionnaire` → `/nl/fit/[sessionId]/questionnaire` | PASS (sessionId preserved in logic) | Yes — verify in session context |
| Switching on `/en/fit/[sessionId]/results` | PASS | Yes |
| Switching on `/en/profile` | PASS | Yes |
| Switching on `/en/bikes` | PASS | Yes |
| Switching on `/en/bikes/new` | PASS | Yes |
| Switching on `/en/bikes/[bikeId]/edit` | PASS | Yes |
| Query parameters preserved | PASS (searchParams passed to `buildLocaleSwitchHref`) | Yes |

### Mobile (≤767px)

| Item | Static Result | Browser QA needed? |
|------|--------------|-------------------|
| Language switch visible in mobile header | PASS (rendered in `md:hidden` topbar) | Yes — verify on real viewport |
| All route switches work on mobile | PASS (same component) | Yes |

### Copy verification (spot check)

| Item | Static Result | Notes |
|------|--------------|-------|
| Dashboard home: navigation items translated in NL | PASS — all from `messages.nav.*` | Verified in `DashboardSidebar.tsx` and `DashboardLayout` |
| Questionnaire: action buttons (Next, Back) translated in NL | PASS — `messages.questionnaire.actions.*` | Verified in `QuestionnaireContainer.tsx` |
| Results page: back-navigation link translated in NL | PASS — `messages.results.backToDashboard` | Verified in `results/page.tsx` |
| Bikes empty state: translated in NL | PASS — `messages.bikes.empty.*` | Verified in `bikes/page.tsx` |
| No mixed-language chrome | PARTIAL — `BIKE_TYPE_LABELS` in sidebar and bike cards are hardcoded English | P1 gap noted in output-01/02 |

### Locale persistence

| Item | Static Result | Browser QA needed? |
|------|--------------|-------------------|
| Reload on NL dashboard route stays on NL | PASS (cookie + header mechanism) | Yes — verify cookie is set on switch |
| Log out and log back in: locale cookie persists | PASS (cookie not cleared on signOut) | Yes — verify empirically |

---

## Items Requiring Manual Browser QA

The following cannot be verified statically:

1. Confirm `LanguageSwitch` visually renders at the correct position in the sidebar (below brand, above nav items) — code says yes, render may differ
2. Confirm switching locale triggers a full page reload and the locale is correctly applied on the new page
3. Confirm the cookie `bf_locale` is set in browser DevTools after switching
4. Confirm no flash of English content on NL dashboard pages
5. Confirm that on mobile (375px viewport) the language switch in the sticky topbar is usable without overflow
6. Test in Firefox (any layout difference from Chrome)
7. Confirm that `BIKE_TYPE_LABELS` hardcoded English values appear on NL fit and bikes pages (to prioritize the fix)

---

## Known Issue: Hardcoded English Bike Type Labels

When a user is on `/nl/bikes` or `/nl/fit`, bike type labels (`"Road"`, `"Gravel"`, `"Mountain"`, etc.) from `BIKE_TYPE_LABELS` and `BIKE_TYPE_OPTIONS` in `src/lib/bikes.ts` will appear in English regardless of locale. This is a P1 i18n gap documented in output-01.
