# SEO Growth Engine — Test Plan

## Scope

Validate the shared SEO layer and every new public SEO surface added by this plan.

## Static Validation

1. Run `npm run typecheck`
2. Run `npm run lint`
3. Run `npm run build`

## Structured Data Checks

1. Confirm calculators emit `WebApplication` JSON-LD
2. Confirm FAQ-bearing pages emit `FAQPage` JSON-LD
3. Confirm guide/use-case pages emit `Article` JSON-LD
4. Confirm homepage emits `Organization` and `WebSite`

## Metadata Checks

1. Spot-check title, description, and alternates on:
   - homepage
   - `/calculators/bike-fit`
   - one guide
   - one use case
   - one programmatic tire-pressure page
2. Verify `robots` is not accidentally set to noindex on public pages

## Sitemap Checks

1. Confirm new public routes are present in sitemap output
2. Confirm programmatic tire-pressure pages are emitted under the calculators sitemap
3. Confirm use-case pages are emitted under the pages sitemap

## Functional Checks

1. Submit the public bike-fit calculator with valid and invalid inputs
2. Open an EN and NL use-case page
3. Open several programmatic tire-pressure pages and verify the content matches slug values
4. Confirm related-links modules render only public routes

## Exit Criteria

- Build passes
- New public pages render without runtime errors
- Structured data is present on the relevant pages
- Sitemap coverage includes the new routes
