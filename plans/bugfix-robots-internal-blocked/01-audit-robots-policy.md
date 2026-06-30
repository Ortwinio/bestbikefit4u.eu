# Step 01 — Audit Robots Policy

## Goal

Produce a concrete before/after crawl policy for every route family before changing `robots.txt`.

## Inputs

- `docs/issues_overview_report.csv`
- `src/lib/seo/routePolicy.ts`
- `src/lib/seo/sitemap/config.ts`
- `src/app/robots.ts`
- `scripts/seo/validate-sitemaps.mjs`
- live `https://bestbikefit4u.eu/robots.txt`

## Tasks

1. Capture current local and production `robots.txt` output.
2. Classify each current disallow prefix as one of:
   - private app
   - auth
   - API or operational endpoint
   - crawler utility endpoint
   - static/rendering asset
3. Decide final treatment for these disputed groups:
   - `/robots.txt`
   - `/sitemap*.xml`
   - `/_next`
   - `/static`
   - `/login`
4. Add the decision table to `plans/bugfix-robots-internal-blocked/output-01-audit.md`.

## Expected Outcome

A file-backed decision record exists before implementation. The expected likely changes are to allow sitemap and robots endpoints, reconsider `/_next`, and keep private app/API routes blocked.
