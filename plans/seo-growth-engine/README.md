# SEO Growth Engine — Repo-Aligned Plan

## Goal

Improve BestBikeFit4U's organic visibility by strengthening the existing public content layer, expanding indexable calculator landing pages, and tightening internal linking across calculators, guides, and informational pages.

## Current Repo Baseline

The repo already has a useful SEO foundation:

- Next.js App Router with server-rendered public pages
- locale alternates via `buildLocaleAlternates()`
- sitemap index plus section sitemaps from `src/app/sitemap*.xml/route.ts`
- public calculators at `/calculators/*` plus tire-pressure pages under `/bandenspanning*`
- guide hub and guide detail pages under `/guides`
- science/informational pages under `/science/*`
- basic JSON-LD already present on some pages, but implemented inconsistently page-by-page

## Gaps This Plan Addresses

- No shared JSON-LD builder layer, causing duplicated and uneven structured data
- Public calculators lack consistent FAQ / WebApplication schema and related-link blocks
- No public `/calculators/bike-fit` page for the highest-intent bike-fit keyword
- No long-tail programmatic tire-pressure landing pages
- No dedicated `/use-cases` content section for mid-funnel search intent
- Homepage does not yet behave like a strong SEO hub for tools and guides
- Sitemap sources are static and do not include future programmatic / use-case content
- No repo-specific SEO validation checklist

## Execution Order

### Phase 1 — Shared Structured Data Layer

Create repo-level JSON-LD builders and a reusable `<JsonLd />` component, then migrate existing public calculators, guides, and homepage usage onto that layer. This reduces duplication and makes schema coverage consistent.

### Phase 2 — Calculator SEO Upgrade

Add a public `/calculators/bike-fit` page, strengthen metadata and related linking on existing calculators, and make the public tool set work as a connected cluster rather than isolated pages.

### Phase 3 — Programmatic Tire-Pressure Pages

Create static landing pages for rider-weight and bike-type combinations using the existing pressure engine. These pages should feed traffic into the main tire-pressure calculator and related guides.

### Phase 4 — Use Cases Content Section

Add `/use-cases` index and detail pages for pain points and rider scenarios that already fit the product: endurance, gravel, triathlon, commuting, back pain, shorter torso, MTB, and tall riders.

### Phase 5 — Internal Linking System

Introduce shared related-links data and presentation so calculators, guides, use cases, and science pages cross-link intentionally.

### Phase 6 — Homepage SEO Hub

Extend the homepage with clear entry points into calculators, guides, and use cases. Keep the current design language, but improve crawl depth and topical clustering.

### Phase 7 — Authority Guide Expansion

Add a small set of longer-form, high-value guide pages inside the existing guide system rather than inventing a new content architecture.

### Phase 8 — Monitoring & QA

Document the validation matrix, required sitemap checks, Search Console follow-up, and monthly review checklist.

## Repo Constraints

- Stay within the current route architecture in `src/app/(public)`
- Reuse `src/app/(public)/guides/data.ts` patterns for any content collections
- Prefer adding programmatic routes to the existing `calculators` sitemap section instead of inventing a new sitemap section unless truly needed
- Use `buildLocaleAlternates()` only where the localized pathname is identical; when EN/NL pathnames differ, build explicit alternates
- Avoid introducing Convex dependencies for SEO pages unless the content genuinely needs backend data

## Prompt Index

- `01-json-ld-structured-data.md`
- `02-programmatic-tire-pressure-pages.md`
- `03-use-cases-section.md`
- `04-bike-fit-calculator-public.md`
- `05-internal-linking-system.md`
- `06-authority-content-pages.md`
- `07-homepage-seo-improvements.md`
- `08-search-console-and-monitoring-setup.md`
- `testplan.md`

## Progress

- [x] 01 — Shared JSON-LD and structured-data cleanup
- [x] 02 — Programmatic tire-pressure pages
- [x] 03 — Use cases section
- [x] 04 — Public bike-fit calculator
- [x] 05 — Internal linking system
- [ ] 06 — Authority content expansion
- [x] 07 — Homepage SEO improvements
- [x] 08 — Monitoring and validation documentation
