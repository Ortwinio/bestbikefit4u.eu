# Output 02 - Homepage Read More Link

## Implemented
- Added a dedicated "Read more quotes" link below the homepage quotes carousel cards.
- Link target is locale-aware and resolves to:
  - `/en/why-bikefit-matters`
  - `/nl/why-bikefit-matters`

## Files Updated
- `src/components/home/QuotesCarousel.tsx`
  - added `Link` import
  - added `withLocalePrefix` usage
  - inserted bottom link block under quote cards
- `src/content/homeQuotes.ts`
  - extended `HOME_QUOTES_SECTION_COPY` with localized `readMoreLabel`
    - EN: `Read more quotes`
    - NL: `Lees meer ervaringen`

## UX Notes
- Placement: directly below the carousel row within the same section.
- Styling: clear text-link treatment consistent with existing homepage link patterns.
- Existing CTA tracking behavior remains unchanged.

## Validation
- `npm run lint:eslint -- src/components/home/QuotesCarousel.tsx src/content/homeQuotes.ts`

