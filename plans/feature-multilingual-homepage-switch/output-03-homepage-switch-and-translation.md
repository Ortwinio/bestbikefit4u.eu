# Step 03 Output: Homepage Switch and Translation

## Summary

Implemented the Step 03 milestone:

1. Homepage is now dictionary-driven and translated for EN/NL.
2. Language switch is available in the homepage header (and shared public header).
3. Homepage and header links are locale-prefixed, so locale is preserved without fallback redirects.
4. Switch preserves current pathname and query string while toggling locale.

## Files Changed

- `src/app/(public)/page.tsx`
- `src/app/(public)/layout.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/LanguageSwitch.tsx`
- `src/i18n/messages/en.ts`
- `src/i18n/messages/nl.ts`
- `src/i18n/request.ts`
- `src/app/layout.tsx`

## Implementation Details

## Homepage Translation

`src/app/(public)/page.tsx` was refactored to:

- Resolve request locale via `getRequestLocale()`.
- Load dictionary via `getDictionary(locale)`.
- Render all homepage copy from `dictionary.home`:
  - Hero
  - How-it-works
  - Features
  - Recommendation section
  - CTA section
- Use locale-prefixed links for homepage CTAs (`/login`, `/about`).
- Generate locale-aware metadata with `generateMetadata()`.

## Language Switch

Added `src/components/layout/LanguageSwitch.tsx` (client component):

- Uses `usePathname()` and `useSearchParams()` from `next/navigation`.
- Uses `switchLocalePathname()` to swap locale in-place.
- Preserves existing query params during switch.
- Shows active locale state via `aria-current="page"`.
- Provides accessible `aria-label` values for language choices.

## Header Integration

`src/components/layout/Header.tsx` now:

- Receives `locale` + translated `common/nav` labels.
- Uses locale-prefixed links for:
  - brand home
  - about
  - pricing
  - login/get-started
- Renders `LanguageSwitch` in the header action area.

`src/app/(public)/layout.tsx` now resolves locale + dictionary and passes translated labels into `Header`.

## Shared Locale Helper

Added `src/i18n/request.ts`:

- Centralized request-locale resolution (`header -> cookie -> default`).
- Reused in:
  - `src/app/layout.tsx`
  - `src/app/(public)/layout.tsx`
  - `src/app/(public)/page.tsx`

## Validation

Commands run:

```bash
npm run typecheck
npx eslint src/app/layout.tsx 'src/app/(public)/layout.tsx' 'src/app/(public)/page.tsx' src/components/layout/Header.tsx src/components/layout/LanguageSwitch.tsx src/i18n/*.ts src/i18n/messages/*.ts src/proxy.ts
```

Result: passed.
