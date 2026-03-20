# Output 02 — Route Coverage Check

## Route Inventory

Routes are derived from `src/app/` directory structure. There is no `[locale]` segment in the filesystem — locale is injected via middleware/proxy (`src/proxy.ts`) that reads the `x-bf-locale` header and cookie, then rewrites the request. All pages call `getRequestLocale()` (server) or `useDashboardMessages()` (client) to obtain the active locale.

## Public Routes (`src/app/(public)/`)

| Route | Locale-aware? | Metadata translated? | Switch works? | Notes |
|-------|--------------|---------------------|---------------|-------|
| `/` (home) | Yes — uses dictionary | Yes — `generateMetadata()` with `buildLocaleAlternates` | Yes — `LanguageSwitch` in header | Also has inline ternaries for some sections (P2) |
| `/about` | Yes — inline `content` object with EN/NL | Yes — `generateMetadata()` with `buildLocaleAlternates` | Yes | |
| `/pricing` | Needs check | Unknown | Unknown | File not read |
| `/contact` | Needs check | Unknown | Unknown | File not read |
| `/faq` | Needs check | Unknown | Unknown | File not read |
| `/measurement-guide` | Needs check | Unknown | Unknown | File not read |
| `/privacy` | Needs check | Unknown | Unknown | File not read |
| `/terms` | Needs check | Unknown | Unknown | File not read |
| `/bandenspanning-calculator` | Partial — uses dictionary for page content, but metadata is static Dutch only | No — static `export const metadata` without locale alternates | Yes for content | P2: metadata object not locale-sensitive |
| `/bandenspanning/[slug]` | Needs check | Unknown | Unknown | NL-specific slug |
| `/bandenspanning/gravelbike` | NL-specific static page | Unknown | N/A — NL only | Purpose-built NL SEO page |
| `/bandenspanning/mtb` | NL-specific static page | Unknown | N/A — NL only | Purpose-built NL SEO page |
| `/bandenspanning/racefiets` | NL-specific static page | Unknown | N/A — NL only | Purpose-built NL SEO page |
| `/calculators/bike-fit` | Needs check | Unknown | Unknown | |
| `/calculators/crank-length` | Needs check | Unknown | Unknown | |
| `/calculators/frame-size` | Needs check | Unknown | Unknown | |
| `/calculators/saddle-height` | Needs check | Unknown | Unknown | |
| `/guides` | Needs check | Unknown | Unknown | |
| `/guides/[slug]` | Needs check | Unknown | Unknown | |
| `/science/bike-fit-methods` | Needs check | Unknown | Unknown | |
| `/science/calculation-engine` | Needs check | Unknown | Unknown | |
| `/science/stack-and-reach` | Needs check | Unknown | Unknown | |
| `/tire-pressure/[slug]` | Needs check | Unknown | Unknown | EN-specific slug |
| `/use-cases` | Needs check | Unknown | Unknown | |
| `/use-cases/[slug]` | Needs check | Unknown | Unknown | |
| `/why-bikefit-matters` | Needs check | Unknown | Unknown | |

## Dashboard Routes (`src/app/(dashboard)/`)

All dashboard pages use `useDashboardMessages()` (client) or `getDashboardMessages(locale)` (server) to retrieve the active locale and translated strings.

| Route | Locale-aware? | Metadata translated? | Switch works? | Notes |
|-------|--------------|---------------------|---------------|-------|
| `/dashboard` | Yes — full dictionary coverage | No — no `generateMetadata`, no page-level metadata | Statically verified (routing code correct) | Dashboard pages don't set metadata |
| `/fit` | Yes — full dictionary, but `BIKE_TYPE_OPTIONS` labels are hardcoded English | No page-level metadata | Statically verified | `profileTypeLabel()` function has hardcoded EN bike profile type names |
| `/fit/[sessionId]/questionnaire` | Yes — full dictionary | No | Statically verified | |
| `/fit/[sessionId]/results` | Yes — full dictionary | No | Statically verified | |
| `/bikes` | Yes — full dictionary, but `BIKE_TYPE_LABELS` are hardcoded English | No | Statically verified | |
| `/bikes/new` | Needs check | No | Statically verified | |
| `/bikes/[bikeId]` | Needs check | No | Statically verified | |
| `/bikes/[bikeId]/edit` | Needs check | No | Statically verified | |
| `/profile` | Yes — full dictionary | No | Statically verified | Flexibility score value displayed raw (e.g. `"very_flexible"` not translated) |
| `/settings` | Yes — full dictionary, `LanguageSwitch` present | No | Statically verified | |
| `/pressure-calculator` | Yes — uses `getDashboardMessages` + `PressureWizard` | No | Statically verified | |

## Auth Routes (`src/app/(auth)/`)

| Route | Locale-aware? | Intentionally English-only? | Notes |
|-------|--------------|----------------------------|-------|
| `/login` | Yes — inline `loginCopy` object with full EN/NL copy | No — fully localized | Locale extracted from pathname at render time |

## Edge Routes

| Route | Status | Notes |
|-------|--------|-------|
| `not-found.tsx` | Localized — uses inline `notFoundCopy` EN/NL object | Works correctly |
| `(dashboard)/error.tsx` | Localized — uses `useDashboardMessages()` | Works correctly |
| `(dashboard)/loading.tsx` | **Spinner-only (skeleton UI)** — no text copy | Acceptable UX: skeleton is content-neutral |

## Locale Switch Behavior (Static Analysis)

### How switching works

`LanguageSwitch` component (`src/components/layout/LanguageSwitch.tsx`) uses `buildLocaleSwitchHref()` which calls `switchLocalePathname()` → `withLocalePrefix()`. This:
1. Strips the current locale prefix from `usePathname()`
2. Replaces it with the target locale prefix
3. Preserves the remainder of the path (including `[sessionId]` segments)
4. Preserves query string

This is correct for all route shapes including `/en/fit/[sessionId]/questionnaire`.

### Switch component placement

| Context | Switch present? | Notes |
|---------|----------------|-------|
| Public header (desktop) | Yes — `Header` → `LanguageSwitch` | |
| Public header (mobile) | Yes — `HeaderMobileMenu` includes `LanguageSwitch` via `Header` | |
| Dashboard sidebar (desktop) | Yes — `DashboardSidebar` → `LanguageSwitch` | |
| Dashboard mobile topbar | Yes — in the sticky mobile header strip | |
| Settings page | Yes — `LanguageSwitch` in Preferences card | |
| Auth/login page | No | P2 gap — login page has no language switch UI |

## Locale Persistence

- Cookie name: `bf_locale` (set by `LanguageSwitch` on navigation)
- The `a href` navigation in `LanguageSwitch` triggers a full page load, which writes the cookie via proxy/middleware
- `resolvePreferredLocale()` in `config.ts` correctly reads cookie first, then Accept-Language header

## Gaps Summary

| Gap | Priority | Details |
|-----|----------|---------|
| `BIKE_TYPE_OPTIONS` and `BIKE_TYPE_LABELS` in `src/lib/bikes.ts` hardcoded English | P1 | Used in `/fit` and `/bikes` pages visible to NL users |
| `profileTypeLabel()` in `fit/page.tsx` hardcoded English bike profile type labels | P1 | Used in bike profile selector on NL `/fit` page |
| Flexibility score raw value displayed (`"very_flexible"` etc.) | P1 | Profile page shows raw enum value, not translated |
| `HeaderMobileMenu.tsx` authenticated nav items use inline ternaries instead of passed labels | P1 | Dashboard links and sign-out button |
| `bandenspanning-calculator` metadata not locale-aware | P2 | Static Dutch metadata for what is a bilingual page |
| Login page has no language switch | P2 | User arriving at wrong locale cannot switch |
| Many public pages not read — coverage unknown for ~15 routes | P2 | Should be verified if full audit is needed |
