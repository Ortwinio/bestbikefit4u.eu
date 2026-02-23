# Output 03 - SEO and JSON-LD

## Implemented
- Updated FAQ metadata per locale in `src/app/(public)/faq/page.tsx` with exact provided values:
  - EN title:
    `BestBikeFit4U FAQ | Online Bike Fitting, Saddle Height, Frame Size & Pain Fixes`
  - EN description:
    `Answers about BestBikeFit4U online bike fitting: measurements, saddle height, setback, reach & drop, stack & reach, MTB/gravel/TT setups, pain troubleshooting, plans, exports, and safety guardrails.`
  - NL title:
    `BestBikeFit4U FAQ | Online bikefitting, zadelhoogte, framemaat & klachten oplossen`
  - NL description:
    `Antwoorden over BestBikeFit4U online bikefitting: metingen, zadelhoogte, zadelterugstand, reach & drop, stack & reach, MTB/gravel/TT, klachten, abonnementen, exports en veiligheidsregels.`

## Locale Alternates
- `buildLocaleAlternates("/faq", locale)` remains in use for alternate/canonical mapping.

## FAQPage JSON-LD
- Added typed JSON-LD builder:
  - `buildFaqJsonLd(sections: FAQSection[])`
- Added schema injection in page render:
  - `<script type="application/ld+json" ... />`
- Synchronization rule:
  - JSON-LD `mainEntity` is generated directly from `page.sections` used by visible UI.
  - This ensures questions/answers in schema stay aligned with rendered content.

## File Updated
- `src/app/(public)/faq/page.tsx`

## Validation
- `npm run lint:eslint -- 'src/app/(public)/faq/page.tsx'`
- `npm run test:e2e:i18n`

