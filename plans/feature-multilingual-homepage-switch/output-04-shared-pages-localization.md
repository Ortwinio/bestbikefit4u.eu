# Step 04 Output: Shared Pages Localization

## Summary

Expanded localization coverage beyond homepage to shared chrome, key public pages, and core system/auth pages.

Implemented in this step:

1. Shared chrome localization:
   - Header remained localized (from Step 03).
   - Footer is now localized with locale-aware links.
2. Key public pages localized in EN/NL:
   - `/about`
   - `/pricing`
   - `/faq`
   - `/contact`
   - `/measurement-guide`
   - `/privacy`
   - `/terms`
3. Core system/auth localization:
   - `not-found` page localized and locale-aware links.
   - login flow localized and locale-aware redirects.
4. Locale-aware metadata strategy:
   - Added shared `alternates` helper for canonical/hreflang behavior.
   - Applied to homepage + key public pages.

## Files Changed

### i18n and metadata utilities

- `src/i18n/metadata.ts` (new)
- `src/i18n/messages/en.ts`
- `src/i18n/messages/nl.ts`
- `src/i18n/request.ts` (continued use from Step 03)

### Shared layout/chrome

- `src/app/(public)/layout.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/LanguageSwitch.tsx`
- `src/app/layout.tsx`

### System/auth pages

- `src/app/not-found.tsx`
- `src/app/(auth)/layout.tsx`
- `src/app/(auth)/login/page.tsx`

### Localized public pages

- `src/app/(public)/page.tsx` (alternates metadata update)
- `src/app/(public)/about/page.tsx`
- `src/app/(public)/pricing/page.tsx`
- `src/app/(public)/faq/page.tsx`
- `src/app/(public)/contact/page.tsx`
- `src/app/(public)/measurement-guide/page.tsx`
- `src/app/(public)/privacy/page.tsx`
- `src/app/(public)/terms/page.tsx`

## Locale Metadata Strategy

Added helper:

- `buildLocaleAlternates(pathname, locale)` in `src/i18n/metadata.ts`

Behavior:

- Canonical points to active locale path.
- `languages` entries for `en`, `nl`, and `x-default` are generated consistently.

Applied on:

- `/`
- `/about`
- `/pricing`
- `/faq`
- `/contact`
- `/measurement-guide`
- `/privacy`
- `/terms`

## Translation Coverage Audit

Audit commands used:

```bash
rg -n 'href=\"/' src/components/layout src/app/not-found.tsx 'src/app/(auth)/login/page.tsx' 'src/app/(public)'
rg -n 'href=\"/' 'src/app/(public)/science' 'src/app/(public)/calculators'
```

Findings:

- Shared public chrome and targeted pages now preserve locale paths.
- Remaining unlocalized locale-link hotspots are outside Step 04 scope:
  - Calculator page cross-links:
    - `src/app/(public)/calculators/saddle-height/page.tsx`
    - `src/app/(public)/calculators/frame-size/page.tsx`
    - `src/app/(public)/calculators/crank-length/page.tsx`
  - Dashboard sidebar legacy link:
    - `src/components/layout/DashboardSidebar.tsx`

These are deferred to follow-up localization work (Step 05+ hardening pass).

## Validation

Commands run:

```bash
npm run typecheck
npx eslint src/app/layout.tsx src/app/not-found.tsx 'src/app/(auth)/layout.tsx' 'src/app/(auth)/login/page.tsx' 'src/app/(public)/layout.tsx' 'src/app/(public)/page.tsx' 'src/app/(public)/about/page.tsx' 'src/app/(public)/pricing/page.tsx' 'src/app/(public)/faq/page.tsx' 'src/app/(public)/contact/page.tsx' 'src/app/(public)/measurement-guide/page.tsx' 'src/app/(public)/privacy/page.tsx' 'src/app/(public)/terms/page.tsx' src/components/layout/Header.tsx src/components/layout/Footer.tsx src/components/layout/LanguageSwitch.tsx src/i18n/*.ts src/i18n/messages/*.ts src/proxy.ts
```

Result: passed.
