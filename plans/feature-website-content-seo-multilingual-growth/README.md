# Website Content, SEO, and Multilingual Growth Plan

## Goal

Improve bestbikefit4u.eu content quality, organic visibility, and conversion by strengthening:

- Technical SEO foundations
- EN/NL copy quality and consistency
- Reasons to start bike fitting (problem/benefit clarity)

## Background

Current content is clear but mostly feature-led. The value proposition should more strongly address rider pain points and outcomes (comfort, injury prevention, performance, confidence, long-ride sustainability).

From the current audit (2026-02-19):

- `robots.txt` and `sitemap.xml` resolve to the 404 page in production.
- Homepage metadata/hreflang exists, but canonical values are relative paths.
- No homepage structured data (`application/ld+json`) was detected.
- NL copy is understandable but includes mixed terminology (`bike fit`, `bike fitting`, Dutch and English terms together).

## Scope

In scope:

- Technical SEO fixes (crawl/index basics, metadata consistency, structured data)
- Homepage and key public page copy rewrite (EN + NL)
- Messaging framework focused on "why start bike fitting"
- Internal linking and landing page expansion for search intent
- Measurement framework for SEO + conversion iteration

Out of scope:

- Major brand redesign or full UI overhaul
- Backend algorithm changes for fit calculations
- Paid media strategy execution

## Approach

1. Fix technical SEO blockers first.
2. Redesign core messaging around rider outcomes and pain points.
3. Rewrite and normalize EN/NL copy with a terminology style guide.
4. Expand intent-based SEO content and linking.
5. Measure impact and iterate every 2-4 weeks.

## Dependencies

- Access to production deployment pipeline
- Search Console and Analytics access
- Ability to ship copy and metadata updates

## Acceptance Criteria

- `robots.txt` and `sitemap.xml` are valid and indexable in production.
- Homepage copy clearly communicates top reasons to start bike fitting.
- EN/NL content parity exists with natural, localized phrasing.
- At least 6 high-intent SEO landing pages are published or improved.
- KPI dashboard exists with baseline and post-change measurements.

## Status

- Owner: `@codex`
- Last updated: `2026-02-19`
- State: `COMPLETED (Steps 01-05 complete)`

| Step | File | Priority | Status |
|------|------|----------|--------|
| 01 | `01-fix-technical-seo-foundation.md` | P0 | Done |
| 02 | `02-rewrite-homepage-reasons-and-value-proposition.md` | P0 | Done |
| 03 | `03-upgrade-nl-en-localization-and-copy-quality.md` | P0 | Done |
| 04 | `04-expand-seo-landing-pages-and-internal-linking.md` | P1 | Done |
| 05 | `05-measure-conversion-seo-and-iterate.md` | P1 | Done |
