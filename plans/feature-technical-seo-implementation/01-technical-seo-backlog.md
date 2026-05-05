# Developer Backlog — Technical SEO

## 1. Goal

Create a technically consistent, multilingual SEO foundation that helps search engines correctly discover, consolidate, and rank the right public pages for:

- bikefitting / bike fitting
- fiets afstellen / racefiets afstellen
- bike fit calculator

## 2. Background

The application is a Next.js App Router site with localized public pages, a guide CMS, public calculators, and a protected dashboard. The strongest SEO opportunities are on:

- homepage and core explainer pages
- bike fit calculator
- guide pages
- science pages
- pain/use-case pages
- programmatic tire pressure pages

The strongest technical risks are inconsistent canonical/alternate logic, sitemap/robots drift, and uneven metadata/schema enforcement across route families.

## 3. Current Risks To Check

- route-local canonical logic diverging from `src/i18n/metadata.ts`
- sitemap URLs not matching actual canonical URLs
- non-indexable/private routes leaking into sitemaps or internal links
- preview/local environments exposing indexable sitemap or page responses
- guide CMS overrides creating cross-locale canonical mistakes
- pages rendering multiple H1s or skipping from H1 to H3 in reusable sections
- calculators shipping weak application schema or missing breadcrumbs
- guide pages missing required `Article` and `FAQPage` parity across locales
- internal link components linking to redirected or blocked URLs
- images missing stable alt text, dimensions, or OG mappings

## 4. URL Structure Recommendations

- Keep all indexable public routes under locale-prefixed paths: `/en/...` and `/nl/...`
- Treat EN and NL pages as peer alternates, not translated duplicates that canonicalize to one locale
- Use one stable slug per content concept across both locales where possible:
  - `/en/guides/saddle-height-guide`
  - `/nl/guides/saddle-height-guide`
- Keep calculator URLs noun-led and stable:
  - `/en/calculators/bike-fit`
  - `/nl/calculators/bike-fit`
- Keep Dutch legacy aliases only when they target materially different search behavior and are intentionally maintained:
  - `/nl/bandenspanning-calculator`
  - `/nl/bandenspanning/[slug]`
- Do not index dashboard, auth, API, preview, or session/result routes
- Enforce lowercase, no trailing slash, no query-string canonicals

## 5. Metadata Requirements

- Every indexable page must define:
  - `title`
  - `description`
  - canonical URL
  - locale alternates
  - Open Graph title/description/url
  - robots directive when non-default behavior is needed
- Metadata must be built from shared helpers wherever a route family is templated
- Guide pages must support locale-specific:
  - title
  - meta description
  - OG title
  - OG description
  - OG image
- Calculator pages must support:
  - commercial-intent title
  - action-led description
  - app schema
- Home, guides hub, and calculator hub pages should include keyword-relevant but non-spammy titles around bike fitting / bike fit calculator / fiets afstellen topics

## 6. H1 / H2 Rules

- Exactly one H1 per indexable page
- H1 must match the primary search intent of the page
- H2s should break the page into search-relevant sections, not decorative sections only
- Reusable hero / CTA / FAQ components must not inject duplicate H1s
- Guide pages should standardize:
  - H1 = main guide topic
  - H2s = problem, causes, adjustments, validation, FAQ, related tools
- Calculator pages should standardize:
  - H1 = calculator intent
  - H2s = how it works, who it is for, how to use results, FAQ

## 7. Canonical Tag Rules

- Canonical must always be absolute
- Canonical must point to the current locale version for localized pages
- No EN page should canonicalize to NL, and no NL page should canonicalize to EN
- Query params, hash fragments, preview params, and draft params must never appear in canonicals
- CMS overrides are only allowed when:
  - the page intentionally consolidates a legacy URL
  - the canonical target is indexable
  - locale parity remains intact
- Programmatic pages must use the same canonical helper contract as static pages

## 8. Hreflang Rules For NL And EN

- Every localized indexable page must emit:
  - `en`
  - `nl`
  - `x-default`
- `x-default` should consistently point to the chosen default locale route family
- EN/NL alternates must be reciprocal
- Pages without a true alternate should omit hreflang rather than fabricate one
- Sitemap alternates must match page-level alternates

## 9. Sitemap Requirements

- `sitemap.xml` must return a valid sitemap index
- Child sitemaps should reflect route families:
  - pages
  - calculators
  - guides
- Every sitemap URL must:
  - be canonical
  - be lowercase
  - exclude trailing slash except root
  - exclude query/hash
  - exclude blocked/private paths
- Every sitemap entry should include:
  - `loc`
  - `lastmod`
  - alternate links where the page has EN/NL parity
- Validator script must be part of release QA

## 10. Robots.txt Checks

- `robots.txt` must return 200 in production
- `robots.txt` must disallow:
  - dashboard
  - auth/login
  - fit session flows
  - bikes private flows
  - feedback
  - API routes
  - preview routes where applicable
- Blocklist in robots must stay aligned with sitemap exclusion rules
- Non-production environments should not emit indexable signals

## 11. Breadcrumb Implementation

- Add visible breadcrumb navigation on guides, science pages, pain pages, use-case pages, and calculator detail pages where it improves orientation
- Breadcrumb labels must be locale-aware
- Breadcrumb links must point to canonical locale URLs
- BreadcrumbList JSON-LD must mirror visible breadcrumbs

## 12. Structured Data Requirements

- Sitewide:
  - `Organization`
  - `WebSite`
- Page-specific:
  - `BreadcrumbList`
  - `Article` for guides and science/article-style pages
  - `FAQPage` where FAQ content is visible on the page
  - `WebApplication` or `SoftwareApplication` for calculators
- Schema objects should use shared builders from `src/lib/seo/jsonLd.ts`
- Schema must not be emitted when the visible content does not justify it

## 13. Page Speed And Core Web Vitals Checks

- Focus templates:
  - homepage
  - guide page
  - calculator page
- Measure and improve:
  - LCP
  - INP
  - CLS
- Check:
  - hero image sizing
  - font loading
  - JS payload on calculators
  - hydration cost of analytics/widgets
  - layout shifts from media and CTA modules

## 14. Image SEO Requirements

- All indexable hero/media images need descriptive alt text
- Use `next/image` on public pages unless a justified exception exists
- Provide width/height or stable aspect ratio to prevent CLS
- Guide CMS should support:
  - featured image alt
  - OG image URL
  - locale-aware OG alt fallback where applicable
- Avoid decorative images receiving keyword-stuffed alt text

## 15. Internal Link Component Requirements

- Related links and CTA link components must always link to canonical locale URLs
- Internal link components must not point to blocked/private surfaces from indexable public pages unless clearly login-gated and intentional
- Add a normalized link helper for:
  - guides
  - calculators
  - science pages
  - use cases
- Link modules should support:
  - descriptive anchor text
  - optional supporting description
  - no generic repeated “click here” patterns

## 16. CMS Field Requirements For Guide Pages

- Required per locale:
  - page title
  - meta title
  - H1
  - meta description
  - page brief / intro
  - body content
  - FAQ set when FAQ block is used
  - featured image alt
- Required global / structural:
  - slug
  - path
  - canonical URL override (optional, tightly validated)
  - robots index flag
  - OG image URL
  - related guide paths
  - SEO hints / funnel classification
- Validation should prevent:
  - empty meta description on published pages
  - canonical outside allowed host
  - canonical mismatch against locale path policy
  - published pages without H1 or title

## 17. QA Checklist

- inspect page source for canonical and hreflang
- verify EN/NL alternates are reciprocal
- confirm exactly one H1 on indexable templates
- validate `robots.txt`
- validate sitemap index and child sitemaps
- validate breadcrumb links and schema
- validate JSON-LD on:
  - homepage
  - one guide
  - one calculator
  - one FAQ-bearing page
- confirm no blocked/private URLs appear in sitemap
- confirm no indexable page links to redirected internal URLs where avoidable
- run Lighthouse / CWV checks on key templates
- confirm guide CMS published records enforce required SEO fields

## 18. Acceptance Criteria

- technical SEO behavior is centralized enough that new pages inherit the correct defaults
- all public EN/NL routes follow one canonical + hreflang policy
- all protected/private routes remain excluded from crawl/index surfaces
- sitemap and robots rules are script-validated
- guides and calculators emit the intended metadata and structured data
- guide CMS contains the required SEO field contract for publishing

---

## Tickets

### Ticket 01

**Task title**  
Create a route inventory and indexability source of truth

**Why it matters**  
SEO regressions happen when route families are public in code but private in policy, or vice versa. A single inventory is the base layer for canonicals, sitemap coverage, robots rules, and internal links.

**Files or areas likely affected**  
- `src/app/(public)/`
- `src/app/(dashboard)/`
- `src/app/api/`
- `src/lib/seo/sitemap/config.ts`
- `scripts/seo/validate-sitemaps.mjs`
- `docs/` or `plans/` audit output

**Implementation notes**  
- Enumerate every route family and classify as:
  - indexable public
  - non-indexable public utility
  - private/auth/dashboard
  - API
- Convert this into one shared allow/block policy that sitemap and robots consumers can reuse.
- Use existing audit outputs as input, but regenerate against current route structure.

**Acceptance criteria**  
- Every route family in `src/app` is categorized.
- A shared SEO route-policy source exists or is documented for implementation.
- Sitemap and robots exclusions reference the same route policy.

**Priority**  
P0

### Ticket 02

**Task title**  
Standardize URL structure, redirects, and canonical ownership

**Why it matters**  
Query intent will split across EN/NL pages, calculator aliases, and guide migrations unless each content concept has one stable canonical owner.

**Files or areas likely affected**  
- `src/i18n/metadata.ts`
- `src/app/(public)/bandenspanning/[slug]/page.tsx`
- `src/app/(public)/tire-pressure/[slug]/page.tsx`
- `src/app/api/guide-redirects/`
- `convex/guides/*`
- guide redirect tables / redirect utilities

**Implementation notes**  
- Standardize canonical generation through shared helpers.
- Decide and document when Dutch alias routes are first-class indexable pages vs redirects.
- Enforce lowercase, no trailing slash, no query-based canonicals.
- Validate guide canonical overrides against host + locale policy.

**Acceptance criteria**  
- All indexable route families have an explicit canonical owner.
- Programmatic tire-pressure routes no longer use divergent canonical logic.
- Legacy guide URLs redirect cleanly to canonical guide targets.

**Priority**  
P0

### Ticket 03

**Task title**  
Harden page metadata contracts across public route families

**Why it matters**  
Metadata is currently implemented but unevenly enforced. The goal is to make titles, descriptions, OG data, and locale alternates predictable for every public template.

**Files or areas likely affected**  
- `src/app/layout.tsx`
- `src/i18n/metadata.ts`
- `src/app/(public)/**/*.tsx`
- `src/lib/guides/content.ts`
- `src/components/admin/guides/GuideEditView.tsx`

**Implementation notes**  
- Introduce or tighten shared metadata helpers for:
  - static public pages
  - calculators
  - guides
  - article-style pages
- Make alternates default to EN/NL + `x-default` from one helper.
- Ensure guide pages read locale-specific SEO fields cleanly from CMS/fallback content.

**Acceptance criteria**  
- Every indexable template defines title, description, canonical, alternates, and OG data.
- Shared helpers are used for major route families.
- Preview params and draft params never appear in canonical URLs.

**Priority**  
P0

### Ticket 04

**Task title**  
Enforce H1/H2 and content-outline rules in public templates

**Why it matters**  
Heading misuse weakens topical clarity and is easy to introduce with reusable hero and section components.

**Files or areas likely affected**  
- `src/components/public/*`
- `src/components/content/*`
- `src/app/(public)/guides/[slug]/page.tsx`
- calculator page templates
- guide rendering helpers

**Implementation notes**  
- Audit hero and section components for accidental multiple H1 output.
- Document template heading contract:
  - one H1
  - H2-led major sections
- Add lightweight tests or lint-like assertions on key templates where feasible.

**Acceptance criteria**  
- Guide, calculator, and major public templates render exactly one H1.
- H2 sections are consistent with search intent and page structure.
- No template skips to decorative heading structures that break outline clarity.

**Priority**  
P1

### Ticket 05

**Task title**  
Centralize canonical and hreflang reciprocity rules

**Why it matters**  
Multilingual SEO fails fast when page-level alternates, sitemap alternates, and CMS canonical overrides disagree.

**Files or areas likely affected**  
- `src/i18n/metadata.ts`
- `src/lib/seo/sitemap/config.ts`
- `src/lib/seo/sitemap/*`
- `scripts/seo/validate-sitemaps.mjs`
- public route metadata implementations

**Implementation notes**  
- Keep one default-locale policy for `x-default`.
- Ensure sitemap alternate logic mirrors page metadata logic.
- Add focused tests for EN/NL reciprocity on:
  - guides
  - calculators
  - programmatic tire-pressure pages

**Acceptance criteria**  
- Every localized indexable page emits reciprocal EN/NL alternates.
- `x-default` is consistent across route families.
- Sitemaps and page metadata agree on alternate URLs.

**Priority**  
P0

### Ticket 06

**Task title**  
Make sitemap and robots behavior production-safe and testable

**Why it matters**  
Sitemaps and robots are the core crawl-control layer. If they drift, search engines crawl the wrong things or miss important pages.

**Files or areas likely affected**  
- `src/app/robots.ts`
- `src/app/sitemap.xml/route.ts`
- `src/app/sitemap-pages.xml/route.ts`
- `src/app/sitemap-calculators.xml/route.ts`
- `src/app/sitemap-guides.xml/route.ts`
- `src/lib/seo/sitemap/config.ts`
- `scripts/seo/validate-sitemaps.mjs`
- `src/proxy.ts`

**Implementation notes**  
- Align robots disallow rules with the actual protected route surface.
- Ensure preview/local/non-production sitemap responses are not indexable.
- Decide whether `sitemap-blog.xml` should stay reserved or be removed until used.
- Add release checks that hit production-like sitemap endpoints.

**Acceptance criteria**  
- `robots.txt` returns expected content in production.
- `sitemap.xml` and child sitemaps return 200 and validate.
- No blocked/private route appears in sitemap output.
- Preview/non-production environments do not look indexable.

**Priority**  
P0

### Ticket 07

**Task title**  
Implement visible breadcrumbs and breadcrumb schema across content templates

**Why it matters**  
Breadcrumbs improve internal linking clarity, SERP understanding, and user orientation on deep guide/science/use-case pages.

**Files or areas likely affected**  
- `src/app/(public)/guides/[slug]/page.tsx`
- `src/app/(public)/science/*/page.tsx`
- `src/app/(public)/pain/[slug]/page.tsx`
- `src/app/(public)/use-cases/[slug]/page.tsx`
- calculator page templates
- `src/lib/seo/jsonLd.ts`
- new breadcrumb UI component(s)

**Implementation notes**  
- Add a shared breadcrumb component with locale-aware labels and canonical links.
- Keep `BreadcrumbList` JSON-LD aligned to the visible breadcrumb trail.
- Prefer shallow, intent-based breadcrumb depth:
  - Home
  - Guides / Calculators / Science
  - Current page

**Acceptance criteria**  
- Guides and other deep content templates render visible breadcrumbs.
- Breadcrumb links resolve to canonical locale URLs.
- Breadcrumb schema validates and matches visible navigation.

**Priority**  
P1

### Ticket 08

**Task title**  
Normalize structured data policy for public pages and calculators

**Why it matters**  
Schema is already present in places, but it should be deterministic by template and not depend on route-by-route memory.

**Files or areas likely affected**  
- `src/lib/seo/jsonLd.ts`
- `src/components/seo/JsonLd.tsx`
- `src/app/layout.tsx`
- homepage page file
- guide pages
- calculator pages
- FAQ-bearing pages

**Implementation notes**  
- Sitewide:
  - add `Organization`
  - add `WebSite`
- Guides / science pages:
  - `Article`
  - `BreadcrumbList`
  - `FAQPage` when FAQ block is visible
- Calculators:
  - `WebApplication` or `SoftwareApplication`
  - `BreadcrumbList`
- Consider adding a search-action capable `WebSite` object only if site search exists or is intentionally omitted.

**Acceptance criteria**  
- Sitewide organization and website schema are emitted once in the intended shell.
- Guides emit Article + breadcrumb schema.
- FAQ schema is only emitted when visible FAQ content exists.
- Calculators emit application schema with correct locale URL.

**Priority**  
P0

### Ticket 09

**Task title**  
Run page-speed and Core Web Vitals remediation on SEO entry templates

**Why it matters**  
Indexability without performance still leaves ranking and conversion value on the table. Template-level performance work has the highest leverage.

**Files or areas likely affected**  
- `src/app/(public)/page.tsx`
- `src/app/(public)/guides/[slug]/page.tsx`
- `src/app/(public)/calculators/*/page.tsx`
- `src/components/public/*`
- `src/components/content/*`
- image assets and loading strategies

**Implementation notes**  
- Measure representative templates with Lighthouse and field instrumentation where available.
- Check LCP image handling, component hydration cost, analytics loading, and layout shifts.
- Prioritize fixes that apply to multiple templates.

**Acceptance criteria**  
- Baseline CWV audit is captured for homepage, one guide, and one calculator.
- Largest template-level regressions are identified with concrete fixes.
- Image/layout shift issues are documented and queued or resolved.

**Priority**  
P1

### Ticket 10

**Task title**  
Create an image SEO contract for public pages and guide CMS content

**Why it matters**  
Image alt, dimensions, OG assets, and render strategy affect accessibility, discoverability, and CWV simultaneously.

**Files or areas likely affected**  
- `src/app/(public)/guides/[slug]/page.tsx`
- `src/components/content/*`
- `src/components/public/*`
- `src/components/admin/guides/GuideEditView.tsx`
- `convex/guides/mutations.ts`

**Implementation notes**  
- Standardize when to use `next/image`.
- Require alt text for featured/hero images on published guides.
- Ensure image aspect ratio is stable to avoid CLS.
- Define OG image fallback rules for guides and share pages.

**Acceptance criteria**  
- Published guides cannot ship featured images without alt text.
- Public templates avoid CLS from image rendering.
- OG image rules are documented and enforced in guide publishing flow.

**Priority**  
P1

### Ticket 11

**Task title**  
Standardize internal link components and canonical link targets

**Why it matters**  
Internal links distribute relevance and crawl paths. They should point to canonical public URLs and reinforce the target keyword clusters.

**Files or areas likely affected**  
- `src/components/seo/RelatedLinksSection.tsx`
- `src/lib/guides/content.ts`
- guide / pain / use-case page templates
- shared navigation and CTA link components

**Implementation notes**  
- Create or tighten a canonical public-link helper for locale-aware routing.
- Prevent indexable public pages from linking to blocked/private URLs unless that link is explicitly a login CTA.
- Add content-model guidance for:
  - related guides
  - related calculators
  - science explainers
- Prefer descriptive anchors tied to the destination topic.

**Acceptance criteria**  
- Related-links modules generate canonical locale URLs.
- Internal link targets avoid redirects where practical.
- Public SEO surfaces follow a hub-and-spoke internal-link pattern.

**Priority**  
P1

### Ticket 12

**Task title**  
Tighten guide CMS SEO field requirements and publishing validation

**Why it matters**  
The guide CMS is now a major SEO surface. Publishing needs stronger validation so editors cannot create thin or inconsistent SEO states.

**Files or areas likely affected**  
- `src/components/admin/guides/GuideEditView.tsx`
- `convex/guides/mutations.ts`
- `convex/guides/queries.ts`
- `src/lib/guides/content.ts`

**Implementation notes**  
- Enforce required fields for published guides:
  - meta title
  - meta description
  - H1
  - page brief
  - locale body
  - robots index state
  - featured image alt when hero image is used
- Validate canonical override host and locale compatibility.
- Make related guides and FAQ usage explicit in the editor UI.

**Acceptance criteria**  
- Published guides fail validation if required SEO fields are missing.
- Canonical overrides outside allowed host/policy are rejected.
- The editor UI clearly shows SEO-critical fields and their required status.

**Priority**  
P0

### Ticket 13

**Task title**  
Add a technical SEO QA checklist and release gate

**Why it matters**  
Without a repeatable QA layer, canonical, hreflang, sitemap, and schema regressions will reappear during content and route changes.

**Files or areas likely affected**  
- `scripts/seo/validate-sitemaps.mjs`
- SEO-related tests under `src/lib/seo/` and route tests
- release documentation under `plans/` or `docs/`
- package scripts if a dedicated SEO check is added

**Implementation notes**  
- Add or formalize a release command set for:
  - sitemap validation
  - canonical/hreflang spot checks
  - structured-data spot checks
  - robots verification
- Keep the QA checklist tied to the route inventory and policy from Ticket 01.

**Acceptance criteria**  
- A documented SEO QA checklist exists for release.
- Sitemaps and robots are script-validated.
- A developer can verify a changed page family without rediscovering the SEO contract.

**Priority**  
P0
