# PR Roadmap — Technical SEO

## Goal

Break the execution plan into reviewable pull requests with clean boundaries, minimal cross-PR dependency risk, and clear validation scope.

## PR 1 — Route Policy and Indexability Source Of Truth

### Scope

- implement Ticket 01
- document or codify the route-family classification
- align protected/public route policy inputs for later SEO work

### Why this PR exists

Every later SEO change depends on a stable answer to one question: which routes are indexable and which are not.

### Likely files

- `src/lib/seo/sitemap/config.ts`
- `scripts/seo/validate-sitemaps.mjs`
- new shared SEO route-policy helper if needed
- `plans/feature-technical-seo-implementation/*`

### Validation

- route inventory reviewed against `src/app`
- targeted tests for policy helpers if added
- manual verification that protected route families match current app structure

### Exit criteria

- one source of truth exists for route indexability policy
- later PRs can consume the same public/private classification

## PR 2 — Canonical Ownership and Locale Alternate Normalization

### Scope

- implement Ticket 02
- implement Ticket 05
- normalize canonical + hreflang behavior, especially on programmatic tire-pressure routes

### Why this PR exists

Canonical and hreflang behavior should be fixed before touching template-by-template metadata rollout.

### Likely files

- `src/i18n/metadata.ts`
- `src/app/(public)/tire-pressure/[slug]/page.tsx`
- `src/app/(public)/bandenspanning/[slug]/page.tsx`
- sitemap alternate helpers / config
- tests for alternates and reciprocity

### Validation

- targeted metadata tests
- `npm run test:i18n`
- targeted sitemap alternate checks

### Exit criteria

- EN/NL alternates are reciprocal
- `x-default` is consistent
- programmatic routes no longer use divergent canonical logic

## PR 3 — Sitemap and Robots Hardening

### Scope

- implement Ticket 06
- align robots, sitemap inclusion rules, and preview/non-production crawl behavior

### Why this PR exists

Robots and sitemap behavior should move together because they encode the same crawl policy.

### Likely files

- `src/app/robots.ts`
- `src/app/sitemap.xml/route.ts`
- `src/app/sitemap-pages.xml/route.ts`
- `src/app/sitemap-calculators.xml/route.ts`
- `src/app/sitemap-guides.xml/route.ts`
- `src/lib/seo/sitemap/config.ts`
- `scripts/seo/validate-sitemaps.mjs`
- `src/proxy.ts`

### Validation

- `npm run seo:validate-sitemaps`
- targeted route tests for sitemap responses
- manual `robots.txt` verification

### Exit criteria

- sitemap index and children validate
- robots disallow list matches protected route policy
- preview/non-production behavior is intentionally non-indexable

## PR 4 — Shared Metadata Helpers and Route-Family Rollout

### Scope

- implement Ticket 03
- migrate major route families onto shared metadata contracts

### Why this PR exists

Once URL and alternate policy are stable, the metadata implementation should be normalized by template family.

### Likely files

- shared metadata helper files under `src/i18n/` or `src/lib/seo/`
- calculator pages under `src/app/(public)/calculators/*/page.tsx`
- guide pages
- selected science / pain / use-case pages

### Validation

- targeted metadata tests
- manual source inspection for canonical/alternate/OG output
- `npm run test:i18n`

### Exit criteria

- public templates use shared metadata contracts
- page metadata stops drifting route by route

## PR 5 — Guide CMS SEO Validation and Publishing Safety

### Scope

- implement Ticket 12
- tighten publishing requirements for guide SEO fields

### Why this PR exists

The guide CMS is a major SEO surface and needs validation before more search-facing enhancements are layered on top.

### Likely files

- `convex/guides/mutations.ts`
- `convex/guides/queries.ts`
- `src/components/admin/guides/GuideEditView.tsx`
- guide editor tests

### Validation

- contract tests for guide mutations
- admin editor validation checks
- manual publish-flow check for required fields

### Exit criteria

- published guides cannot ship broken SEO states
- canonical override validation is enforced

## PR 6 — Heading, Internal Linking, and Breadcrumb UX

### Scope

- implement Ticket 04
- implement Ticket 11
- implement Ticket 07

### Why this PR exists

These changes all improve template clarity and crawlability, and they share the same page-template touchpoints.

### Likely files

- `src/components/public/*`
- `src/components/seo/RelatedLinksSection.tsx`
- new breadcrumb component(s)
- guide, science, pain, use-case, and calculator templates
- guide link-generation helpers

### Validation

- template tests
- manual heading-outline checks
- manual internal-link and breadcrumb review

### Exit criteria

- one H1 per template
- canonical internal links on SEO surfaces
- visible breadcrumbs on deep content pages

## PR 7 — Structured Data Normalization

### Scope

- implement Ticket 08
- normalize schema usage across homepage, guides, and calculators

### Why this PR exists

Schema should match the final rendered template structure after breadcrumbs and content-outline work is complete.

### Likely files

- `src/lib/seo/jsonLd.ts`
- `src/components/seo/JsonLd.tsx`
- `src/app/layout.tsx`
- homepage and calculator pages
- guide and article-style templates

### Validation

- manual source inspection
- schema-focused route tests where feasible
- Rich Results Test / Schema Validator spot checks outside repo

### Exit criteria

- sitewide `Organization` and `WebSite` are emitted correctly
- guides and calculators emit the intended page-level schema

## PR 8 — Image SEO, CWV Pass, and SEO Release Gate

### Scope

- implement Ticket 10
- implement Ticket 09
- implement Ticket 13

### Why this PR exists

This is the hardening PR: image rules, CWV follow-through, and release QA.

### Likely files

- guide/public content components
- guide editor SEO/image fields
- any template files needing image/CWV fixes
- validation scripts and release docs

### Validation

- Lighthouse/CWV spot checks
- `npm run seo:validate-sitemaps`
- `npm run test:i18n`
- targeted SEO/template tests

### Exit criteria

- image SEO rules are enforceable
- key templates have measured CWV baselines and fixes
- release QA checklist is documented and repeatable

## Recommended Merge Order

1. PR 1 — route policy
2. PR 2 — canonical/hreflang
3. PR 3 — sitemap/robots
4. PR 4 — metadata helpers
5. PR 5 — guide CMS validation
6. PR 6 — headings/links/breadcrumbs
7. PR 7 — structured data
8. PR 8 — image SEO/CWV/QA

## Merge Guardrails

- Do not start PR 4 before PR 2 is accepted or effectively locked.
- Do not widen schema rollout before breadcrumb rendering is settled.
- Do not treat repo-wide lint/build as the only sign-off signal; use targeted SEO checks until current unrelated failures are cleared.
