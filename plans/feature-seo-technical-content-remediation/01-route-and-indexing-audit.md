# Step 01: Route And Indexing Audit

Audit the public route surface and indexing logic before making changes.

## Read First

- `docs/issues_overview_report.csv`
- `src/app/robots.ts`
- `src/proxy.ts`
- `src/i18n/metadata.ts`
- `src/lib/seo/sitemap/config.ts`
- `src/lib/seo/sitemap/sources.ts`
- `src/lib/public-calculators/routes.ts`

## What To Produce

1. List all public page families and legacy/alias route families.
2. Identify which routes are meant to be indexable, canonicalized, redirected, or blocked.
3. Confirm where `canonical`, `alternates`, `robots`, and `x-robots-tag` are produced.
4. Flag any route families where internal links do not point to the canonical destination.

## Done When

- the route inventory is complete enough to explain the report counts
- every canonical/robots warning has at least one concrete code hypothesis
