# Output 04 - Validation and Polish

## Commands Run
1. `npm run lint:eslint -- 'src/app/(public)/faq/page.tsx'`
2. `npm run test:e2e:i18n`
3. `npm run build`
4. `rg -n "BestBikeFit4U FAQ \\| Online Bike Fitting|BestBikeFit4U FAQ \\| Online bikefitting|application/ld\\+json|buildFaqJsonLd|<details|<summary" 'src/app/(public)/faq/page.tsx' -S`

## Results
- Lint: pass
- Tests: pass
  - `tests/e2e/homepage-language-switch.e2e.test.ts` passed
- Production build: pass
  - `/faq` route is generated successfully

## Manual Checklist Verification (Code-Level Evidence)
- `/en/faq` and `/nl/faq` render FAQ content from locale-bound source:
  - `contentRaw.en` and `contentRaw.nl` both present in `src/app/(public)/faq/page.tsx`
  - locale selection via `const page = content[locale]`
- Accordion behavior implemented with native semantics:
  - `<details>` at `src/app/(public)/faq/page.tsx:342`
  - `<summary>` at `src/app/(public)/faq/page.tsx:346`
- Metadata title/description values match provided EN/NL copy:
  - EN title at `src/app/(public)/faq/page.tsx:97`
  - NL title at `src/app/(public)/faq/page.tsx:195`
  - metadata binding in `generateMetadata()` uses `page.metadata.*`
- JSON-LD script appears and is synchronized with visible FAQ data:
  - schema builder `buildFaqJsonLd(...)` at `src/app/(public)/faq/page.tsx:77`
  - generated from `page.sections` at `src/app/(public)/faq/page.tsx:319`
  - injected as `application/ld+json` at `src/app/(public)/faq/page.tsx:324`
- UI guideline alignment:
  - Existing public-page shell retained (`max-w-4xl`, section rhythm, guide block, final CTA pattern)
  - FAQ cards styled consistently with site border/spacing/typography conventions

## Accessibility Notes
- Heading hierarchy preserved (`h1` page title, section `h2` headings).
- Native `<details>/<summary>` provides keyboard support by default.
- Text contrast remains within existing site palette conventions for readability.

## Known Limitations
- This validation pass did not include browser screenshots.
- Final visual QA on real devices/viewports is still recommended before release sign-off.

