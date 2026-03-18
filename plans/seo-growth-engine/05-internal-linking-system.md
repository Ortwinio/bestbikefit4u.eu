# Prompt 05 — Internal Linking System

## Goal

Improve crawl depth and topical authority by connecting calculators, guides, use cases, and science pages with explicit related-link modules.

## Repo Reality

- Existing pages already render ad-hoc related links
- There is no shared data source for related links
- The current sitemap is healthy, but internal linking is still shallow

## Deliverables

1. Create a shared SEO link-map utility under `src/lib/seo/relatedLinks.ts`
2. Add a reusable component under `src/components/seo/RelatedLinksSection.tsx`
3. Use it on:
   - public calculators
   - guide detail pages
   - use-case detail pages
   - public bike-fit calculator
4. Keep current route names; do not invent blog-style slugs

## Acceptance Criteria

- Every major public money/guide page links to at least 3 related public pages
- Links are locale-aware
- Duplicate “related links” implementations are reduced rather than multiplied
