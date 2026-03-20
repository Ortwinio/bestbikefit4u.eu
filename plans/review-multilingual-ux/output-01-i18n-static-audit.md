# Output 01 — i18n Static Audit

## 1. Translation Dictionary Location

- `src/i18n/messages/en.ts` — English dictionary (source of truth)
- `src/i18n/messages/nl.ts` — Dutch dictionary (typed `as const satisfies typeof en`)
- `src/i18n/messages/messages-parity.test.ts` — automated key-parity test
- `src/i18n/config.ts` — locale config (cookie, header, resolution logic)
- `src/i18n/getDictionary.ts` — server-side dictionary loader
- `src/i18n/dashboardMessages.ts` — dashboard-specific helper + `formatMessage`
- `src/i18n/useDashboardMessages.ts` — client-side hook for dashboard messages

## 2. Key Parity Check

### Automated test result

`npm run test:i18n` — **28 tests, all passing** (6 test files). The TypeScript type constraint `as const satisfies typeof en` on `nl.ts` provides compile-time enforcement.

### Manual findings

One NL key was confirmed to contain a hardcoded English string despite the key existing:

| Key | EN value | NL value (before fix) | Status |
|-----|----------|-----------------------|--------|
| `dashboard.questionnaire.errors.missingRequiredMarker` | `"Missing required responses:"` | `"Missing required responses:"` (English) | **FIXED** — now `"Ontbrekende verplichte antwoorden:"` |

This is a P1 issue: it is used as a sentinel string to parse a server error message in `QuestionnaireContainer.tsx`. Both the en and nl value need to be identical because the server produces the error using the EN marker string, and the client strips by the same value regardless of locale. The current architecture means this key acts as a technical marker, not a user-visible string. The fix I applied is still correct NL, but the architecture should be noted.

### Extra NL keys without EN equivalent

None detected. The `satisfies typeof en` constraint prevents extra keys in NL.

## 3. Hardcoded String Scan

### P0 / P1 Findings (fixed or actionable)

| File:line | Hardcoded string | Notes | Priority |
|-----------|-----------------|-------|----------|
| `src/app/layout.tsx:40` | `"Skip to main content"` | Root layout skip-link, shown to all users. Not in any dictionary. | P1 |
| `src/components/layout/HeaderMobileMenu.tsx:83` | `"Dashboard"` | Hardcoded EN in authenticated mobile nav. | P1 |
| `src/components/layout/HeaderMobileMenu.tsx:88-89` | `"Nieuwe fit-sessie"` / `"New Fit Session"` | Uses `locale === "nl"` ternary instead of dictionary. | P1 |
| `src/components/layout/HeaderMobileMenu.tsx:95-96` | `"Mijn fietsen"` / `"My Bikes"` | Same pattern. | P1 |
| `src/components/layout/HeaderMobileMenu.tsx:102-103` | `"Profiel"` / `"Profile"` | Same pattern. | P1 |
| `src/components/layout/HeaderMobileMenu.tsx:110` | `"Uitloggen"` / `"Sign out"` | Same pattern. | P1 |
| `src/app/(dashboard)/fit/page.tsx:170-182` | `profileTypeLabel()` function with hardcoded English labels: `Base`, `Mountain`, `Endurance`, `Performance`, `Aero`, `Indoor`, `Technical`, `Comfort`, `Custom` | Used in bike profile selection. No NL equivalents. | P1 |
| `src/lib/bikes.ts` | `BIKE_TYPE_OPTIONS` labels/descriptions (`"Road Bike"`, `"Gravel Bike"`, etc.) and `BIKE_TYPE_LABELS` | Used throughout dashboard in bike type selectors and display. Not locale-aware. | P1 |
| `src/app/(public)/page.tsx:245-321` | Multiple inline `locale === "nl" ? "..." : "..."` ternaries for section headings and link labels | "Populaire calculators", "Popular Bike Fitting Guides", etc. | P2 (functional, but should use dictionary) |

### P2 Findings (not fixed, for backlog)

| File:line | Hardcoded string | Notes |
|-----------|-----------------|-------|
| `src/app/(public)/page.tsx:245` | `"Populaire calculators"` / `"Popular Calculators"` | Inline ternary, not in dictionary |
| `src/app/(public)/page.tsx:297` | `"Populaire bikefitting gidsen"` / `"Popular Bike Fitting Guides"` | Inline ternary |
| `src/app/(public)/page.tsx:321` | `"Bekijk alle gidsen"` / `"View all guides"` | Inline ternary |
| `src/app/(public)/page.tsx:331` | `"Rijsituaties en klachten"` / `"Riding Scenarios and Pain Points"` | Inline ternary |
| `src/app/(public)/page.tsx:355` | `"Bekijk alle use cases"` / `"View all use cases"` | Inline ternary |
| `src/components/layout/HeaderMobileMenu.tsx:42` | `aria-label` values `"Close navigation menu"` / `"Open navigation menu"` | Not localized |
| `src/components/ui/States.tsx:25` | `"Loading..."` default prop value | Used as fallback only, caller should always provide label |
| `src/app/(public)/bandenspanning-calculator/page.tsx:16-21` | Hardcoded Dutch metadata and canonical URL | The metadata is fixed Dutch rather than locale-aware |

## 4. `<html lang>` Status

| Layout | Method | Status |
|--------|--------|--------|
| `src/app/layout.tsx` | `const locale = await getRequestLocale(); … <html lang={locale}>` | **Pass** — dynamically set per request |
| `src/app/(public)/layout.tsx` | No separate `<html>` tag — inherits root layout | **Pass** |
| `src/app/(dashboard)/layout.tsx` | No separate `<html>` tag — inherits root layout | **Pass** |
| `src/app/(auth)/layout.tsx` | No separate `<html>` tag — inherits root layout | **Pass** |

The `getRequestLocale()` function reads from (in priority order): `x-bf-locale` header → `bf_locale` cookie → Accept-Language header → defaults to `en`. This is correct.

## 5. Hreflang / Canonical Check

The `buildLocaleAlternates()` function in `src/i18n/metadata.ts` produces:
- `canonical` — absolute URL with current locale prefix
- `languages.en` — EN variant
- `languages.nl` — NL variant
- `languages["x-default"]` — set to EN

Pages using `buildLocaleAlternates()`:
- `src/app/(public)/page.tsx` — **Pass**
- `src/app/(public)/about/page.tsx` — **Pass**
- Several other public pages (pricing, contact, etc.) also use it

Pages using **inline metadata without hreflang**:
- `src/app/(public)/bandenspanning-calculator/page.tsx` — exports static `metadata` object with only `canonical: "https://bestbikefit4u.eu/bandenspanning-calculator"` (no `alternates.languages`) — **P2 gap**

Dashboard pages do not need hreflang (authenticated, not crawlable by design).

## Summary

| Category | Count | Severity |
|----------|-------|----------|
| Missing NL translation (English string in NL key) | 1 | P0 — **FIXED** |
| Hardcoded strings in UI components (should use dictionary) | 10 | P1 |
| Hardcoded strings in public pages (inline ternaries) | 7 | P2 |
| `<html lang>` issues | 0 | — |
| Hreflang gaps | 1 page | P2 |
