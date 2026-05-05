# Technical SEO Implementation Plan — bestbikefit4u.eu

## Goal

Deliver a stable multilingual SEO foundation for `www.bestbikefit4u.eu` that improves crawlability, indexation quality, and query-to-page relevance for:

- `bikefitting`
- `bike fitting`
- `fiets afstellen`
- `racefiets afstellen`
- `bike fit calculator`

The implementation must be compatible with the current Next.js App Router architecture, the EN/NL locale system, the public calculator surfaces, the guide CMS, and the protected dashboard split.

## Background

The repository already has a meaningful SEO foundation:

- locale-aware alternate builder in `src/i18n/metadata.ts`
- metadata-based `robots.txt` route in `src/app/robots.ts`
- sitemap index and child sitemap routes in `src/app/sitemap*.xml/route.ts`
- sitemap config in `src/lib/seo/sitemap/config.ts`
- JSON-LD builders in `src/lib/seo/jsonLd.ts`
- guide page metadata and Article / FAQ / Breadcrumb JSON-LD on `src/app/(public)/guides/[slug]/page.tsx`
- sitemap validation script in `scripts/seo/validate-sitemaps.mjs`

The site structure is also already favorable for SEO work:

- localized route prefixes (`/en/...`, `/nl/...`)
- public calculator hub under `/calculators/*`
- guide library under `/guides/*`
- science cluster under `/science/*`
- use-case / pain clusters
- protected dashboard and API routes already separated from public marketing routes

## Current Risks To Check

1. Locale/canonical logic is partly centralized and partly route-local, especially on programmatic calculator routes.
2. The guide CMS permits canonical and robots overrides, which is useful but can drift into inconsistent SEO signals.
3. Sitemap coverage and robots blocklists can fall out of sync with the real protected route surface.
4. Preview / non-production crawl protection needs explicit verification for sitemap endpoints, not just HTML pages.
5. Heading hierarchy and internal-link behavior are component-driven but not yet enforced as a reusable contract.
6. Structured data exists in pockets, but not as a normalized sitewide policy.
7. Current repo-wide lint/build failures will make SEO regression verification noisy until they are isolated or cleared.

## Scope

Included:

- public route SEO foundation
- locale, canonical, and hreflang policy
- metadata contracts for pages, guides, and calculators
- robots / sitemap / breadcrumb / structured data implementation
- image SEO and Core Web Vitals checks on public pages
- internal linking component contract
- guide CMS SEO field model
- QA and release acceptance checks

Excluded:

- off-site SEO campaigns
- backlink acquisition
- content rewriting itself except where field contracts or page templates require it
- dashboard/private route indexing beyond robots/noindex blocking

## Repo Anchors

- `src/app/layout.tsx`
- `src/i18n/metadata.ts`
- `src/app/robots.ts`
- `src/app/sitemap.xml/route.ts`
- `src/app/sitemap-pages.xml/route.ts`
- `src/app/sitemap-calculators.xml/route.ts`
- `src/app/sitemap-guides.xml/route.ts`
- `src/lib/seo/sitemap/config.ts`
- `scripts/seo/validate-sitemaps.mjs`
- `src/lib/seo/jsonLd.ts`
- `src/app/(public)/guides/[slug]/page.tsx`
- `src/app/(public)/guides/page.tsx`
- `src/app/(public)/calculators/*/page.tsx`
- `src/components/seo/RelatedLinksSection.tsx`
- `src/components/content/GuideFaqAccordion.tsx`
- `src/components/admin/guides/GuideEditView.tsx`
- `convex/guides/mutations.ts`
- `src/lib/guides/content.ts`

## Deliverables

1. Technical SEO policy for URL, metadata, canonical, hreflang, and robots behavior
2. Shared implementation helpers for public pages and calculators
3. Breadcrumb and structured-data coverage rules
4. Guide CMS SEO field contract
5. QA checklist and release acceptance criteria
6. Ticketed developer backlog ready for implementation

## Ticket Backlog

See:
- [01-technical-seo-backlog.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-technical-seo-implementation/01-technical-seo-backlog.md)

## Execution Plan

See:
- [02-execution-plan.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-technical-seo-implementation/02-execution-plan.md)

## PR Roadmap

See:
- [03-pr-roadmap.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-technical-seo-implementation/03-pr-roadmap.md)

## Execution Steps

1. [04-step-01-route-policy-and-indexability.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-technical-seo-implementation/04-step-01-route-policy-and-indexability.md)
2. [05-step-02-canonical-and-hreflang.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-technical-seo-implementation/05-step-02-canonical-and-hreflang.md)
3. [06-step-03-sitemaps-and-robots.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-technical-seo-implementation/06-step-03-sitemaps-and-robots.md)
4. [07-step-04-metadata-helper-rollout.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-technical-seo-implementation/07-step-04-metadata-helper-rollout.md)
5. [08-step-05-guide-cms-seo-validation.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-technical-seo-implementation/08-step-05-guide-cms-seo-validation.md)
6. [09-step-06-template-seo-ux.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-technical-seo-implementation/09-step-06-template-seo-ux.md)
7. [10-step-07-schema-normalization.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-technical-seo-implementation/10-step-07-schema-normalization.md)
8. [11-step-08-image-seo-cwv-and-qa.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-technical-seo-implementation/11-step-08-image-seo-cwv-and-qa.md)

## Execution Status

1. Step 01 complete
   Output: [output-04-step-01-route-policy-and-indexability.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-technical-seo-implementation/output-04-step-01-route-policy-and-indexability.md)
2. Step 02 complete
   Output: [output-05-step-02-canonical-and-hreflang.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-technical-seo-implementation/output-05-step-02-canonical-and-hreflang.md)
3. Step 03 complete
   Output: [output-06-step-03-sitemaps-and-robots.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-technical-seo-implementation/output-06-step-03-sitemaps-and-robots.md)
4. Step 04 complete with a limited helper rollout
   Output: [output-07-step-04-metadata-helper-rollout.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-technical-seo-implementation/output-07-step-04-metadata-helper-rollout.md)
5. Step 05 complete
   Output: [output-08-step-05-guide-cms-seo-validation.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-technical-seo-implementation/output-08-step-05-guide-cms-seo-validation.md)
6. Step 06 complete for priority templates
   Output: [output-09-step-06-template-seo-ux.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-technical-seo-implementation/output-09-step-06-template-seo-ux.md)
7. Step 07 complete
   Output: [output-10-step-07-schema-normalization.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-technical-seo-implementation/output-10-step-07-schema-normalization.md)
8. Step 08 complete for code + release QA, with live CWV baseline capture still recommended
   Output: [output-11-step-08-image-seo-cwv-and-qa.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-technical-seo-implementation/output-11-step-08-image-seo-cwv-and-qa.md)

## Acceptance Criteria

- every indexable public route family has a documented canonical owner
- EN/NL alternates are reciprocal and deterministic
- dashboards, auth, previews, and APIs stay non-indexable
- every guide and calculator template emits the intended metadata and structured data
- sitemap and robots policies are testable via scripted QA
- the guide CMS captures all required SEO fields without relying on ad hoc editor decisions
