# Step 02 Output: i18n Foundation

## Summary

Implemented the i18n foundation for Dutch/English locale handling without translating all pages yet:

1. Added locale config/constants and locale resolution utilities.
2. Added typed message catalogs and server-safe dictionary loader.
3. Implemented locale negotiation + persistence in proxy routing.
4. Wired active locale into root `<html lang>` rendering.
5. Preserved dashboard auth protection behavior for localized routes.

## Files Changed

### Added

- `src/i18n/config.ts`
- `src/i18n/navigation.ts`
- `src/i18n/getDictionary.ts`
- `src/i18n/messages/en.ts`
- `src/i18n/messages/nl.ts`

### Updated

- `src/proxy.ts`
- `src/app/layout.tsx`

## Implemented Behavior

## Locale Config + Utilities

`src/i18n/config.ts` now defines:

- Supported locales: `en`, `nl`
- Default locale: `en`
- Cookie name: `bf_locale`
- Request header name for SSR locale propagation: `x-bf-locale`
- Locale normalization + validation
- `Accept-Language` parsing with q-weight support
- Preferred-locale resolution order: `cookie -> Accept-Language -> en`

`src/i18n/navigation.ts` now provides:

- Locale extraction from pathname
- Locale prefix stripping/injection
- Path bypass detection for API/internal/static paths
- Protected dashboard path detection (locale-aware)

## Dictionary Foundation

`src/i18n/getDictionary.ts` adds a server-only, typed loader:

- `getDictionary(locale)`
- `getDictionaryForLocale(localeValue)`

Message catalogs are defined in:

- `src/i18n/messages/en.ts`
- `src/i18n/messages/nl.ts`

Dutch catalog is shape-checked against English keys (`satisfies typeof en`).

## Proxy Locale Routing + Persistence

`src/proxy.ts` now:

1. Skips localization for bypassed paths (`/api`, `/trpc`, `/_next`, file-like paths).
2. Redirects non-prefixed routes to locale-prefixed routes.
3. Rewrites locale-prefixed routes (for example `/nl/about`) to internal unprefixed routes (`/about`) so existing route files keep working.
4. Sets locale cookie (`bf_locale`) on locale redirects/rewrites.
5. Protects localized dashboard routes:
   - unauthenticated `/en/dashboard...` or `/nl/dashboard...` redirects to localized login (`/{locale}/login`).

## Root HTML Locale

`src/app/layout.tsx` now resolves locale from:

1. `x-bf-locale` request header (set during locale rewrite),
2. locale cookie,
3. default locale fallback.

The resolved locale is applied to `<html lang={locale}>`.

## Validation

Command run:

```bash
npm run typecheck
npx eslint src/proxy.ts src/app/layout.tsx src/i18n/**/*.ts
```

Result: passed.

## Notes for Step 03

- Existing links still use unprefixed paths in many places; these currently work via proxy redirects but should be replaced by locale-aware navigation in Step 03+.
- The homepage language switch can now be implemented on top of:
  - `switchLocalePathname`/`withLocalePrefix` helpers
  - proxy-driven locale cookie synchronization.
