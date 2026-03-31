# Content And Metadata Review

## Highest Priority Pages

### `/`

- Strengths:
  - has metadata and OG coverage
  - includes `Organization` and `WebSite` JSON-LD
  - strong brand-level entry point
- Issues:
  - homepage can likely support clearer search-intent variants beyond brand messaging
- Proposed improvement:
  - sharpen title/description around online bike fitting, comfort, and performance outcomes
- Priority: medium

### `/pricing`

- Strengths:
  - clear metadata and strong conversion intent
  - aligned with commercial config
- Issues:
  - no stronger pricing-focused schema or FAQ schema on the page despite visible FAQ copy block
- Proposed improvement:
  - add FAQ structured data for pricing questions
  - strengthen title/description around online bike fit pricing in EUR
- Priority: high

### `/how-it-works`

- Strengths:
  - good metadata
  - includes JSON-LD
  - strong mid-funnel educational page
- Issues:
  - could support richer internal links into calculators, pricing, and proof pages
- Proposed improvement:
  - add contextual links to calculators and case-study/proof surfaces
- Priority: medium

### `/calculators/bike-fit`

- Strengths:
  - very strong acquisition intent
  - has metadata and JSON-LD
- Issues:
  - likely deserves the strongest internal linking from guides, use cases, and pain pages
- Proposed improvement:
  - treat as a central SEO target in internal-linking strategy
- Priority: high

### `/calculators/saddle-height`

- Strengths:
  - high-intent calculator with metadata and JSON-LD
- Issues:
  - can likely capture more intent through richer supporting copy and linked related calculators
- Proposed improvement:
  - strengthen adjacent-link cluster with bike-fit and frame-size pages
- Priority: medium

## Pain Pages

### `/pain`

- Strengths:
  - clear hub page intent
  - dedicated route family and supporting content set
- Issues:
  - should be treated as a strategic internal-link hub, not just an index
- Proposed improvement:
  - make sure hub copy reinforces symptom clusters, calculator links, and case-study path
- Priority: high

### First five `/pain/[slug]` pages

- Strengths:
  - strong SEO titles and descriptions in [painPages.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/content/painPages.ts)
  - good visible structure in [PainPointPageTemplate.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/public/PainPointPageTemplate.tsx)
  - internal links already present
- Issues:
  - FAQ content is visible, but only `Article` schema is emitted; no `FAQPage` structured data
  - no breadcrumb schema
- Proposed improvement:
  - add `FAQPage` JSON-LD and breadcrumb schema
  - ensure each page links to the most relevant calculator, adjacent pain pages, and case-study page
- Priority: high

## Guides

### `/guides`

- Strengths:
  - metadata present
  - clear content cluster
- Issues:
  - likely weaker as a navigational hub than the detail pages
- Proposed improvement:
  - improve guide categorization and internal links into calculators/use-cases
- Priority: medium

### Representative `/guides/[slug]`

- Strengths:
  - strong article-style structure
  - article JSON-LD present
  - visible FAQ and related links
- Issues:
  - visible FAQs are not exposed as `FAQPage` schema
  - no breadcrumb schema
- Proposed improvement:
  - add FAQ structured data for guide pages where FAQs are substantive
  - add breadcrumbs for better hierarchy signals
- Priority: medium-high

## Use Cases

### `/use-cases`

- Strengths:
  - strong intent bridge from scenario to solution
  - metadata present
- Issues:
  - could be a stronger internal-link hub into calculators and pain pages
- Proposed improvement:
  - tighten the cluster design with more explicit “next step” links
- Priority: medium

### Representative `/use-cases/[slug]`

- Strengths:
  - article JSON-LD present
  - good visible page structure
- Issues:
  - same structured-data gap as guides and pain pages: no FAQPage or breadcrumbs
- Proposed improvement:
  - add FAQPage + breadcrumb schema where appropriate
- Priority: medium-high

## `/case-study`

- Strengths:
  - strong conversion-oriented page
  - metadata present
- Issues:
  - no visible JSON-LD or explicit recruitment-oriented structured data
  - title/description can be more search-intent specific around rider stories, pain, and bike-fit case studies
- Proposed improvement:
  - add structured data where relevant
  - tighten metadata for recruitment/proof intent
- Priority: medium

## Cross-Page Content Findings

1. Metadata coverage is strong, but structured-data coverage is uneven.
2. Pain, guide, and use-case detail pages all expose FAQ-style content without FAQ schema.
3. Breadcrumb schema is a recurring opportunity across clustered content types.
4. Internal linking exists, but the site would benefit from a more explicit hub-and-spoke linking strategy around:
   - bike-fit calculator
   - pain pages
   - calculators
   - case-study/recruitment

