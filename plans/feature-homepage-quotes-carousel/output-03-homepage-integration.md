# Output 03 - Homepage Integration

## Integrated
- Homepage wiring updated in `src/app/(public)/page.tsx`
  - imports:
    - `QuotesCarousel`
    - `HOME_QUOTES_DISPLAY_COUNT`
    - `selectRandomHomeQuotesForLocale`
  - server-side selection:
    - `randomHomeQuotes = selectRandomHomeQuotesForLocale(locale, HOME_QUOTES_DISPLAY_COUNT)`
  - placement:
    - `<QuotesCarousel ... />` inserted immediately after the hero/header section

## Locale Behavior
- `/en` uses English quotes.
- `/nl` uses Dutch quotes.
- Locale-specific quote pools are defined in `src/content/homeQuotes.ts`:
  - `HOME_QUOTES` (EN)
  - `HOME_QUOTES_NL` (NL)
  - `HOME_QUOTES_BY_LOCALE`

## Stability Notes
- Existing homepage sections remain in original order after insertion.
- CTA tracking components were not changed.
- Consent banner is fixed to viewport bottom and does not structurally conflict with the new section in normal page flow.

## Validation Run
- `npm run lint:eslint -- 'src/app/(public)/page.tsx' src/components/home/QuotesCarousel.tsx src/content/homeQuotes.ts src/content/homeQuotes.test.ts`
- `npx vitest run src/content/homeQuotes.test.ts`

