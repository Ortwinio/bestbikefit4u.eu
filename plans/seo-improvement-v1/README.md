# SEO Improvement Plan v1 — BestBikeFit4U

**Date:** 2026-05-05  
**Rewritten after repo audit:** 2026-05-05  
**Status:** Implemented and validated

## Execution Status

- [x] Step 01: `01-landing-pages.md` (`output-01-landing-pages.md`)
- [x] Step 02: `02-sitemap-and-guide-keywords.md` (`output-02-sitemap-and-guide-keywords.md`)
- [x] Step 03: `03-internal-linking-and-science-crosslinks.md` (`output-03-internal-linking-and-science-crosslinks.md`)
- [x] Step 04: `04-cms-hardening-and-validation.md` (`output-04-cms-hardening-and-validation.md`)

---

## 1. Goal

Increase qualified organic traffic to BestBikeFit4U’s public funnel in Dutch and English, especially for cyclists searching for:

- bike fitting help
- pain-related setup fixes
- core fit calculators
- better bike-position guidance before creating an account

The commercial aim is not “more impressions” in isolation. It is:

1. more high-intent visits to calculator and guide surfaces
2. more calculator starts
3. more account signups from organic sessions

**Primary KPI targets (90-day horizon):**
- Improve visibility for Dutch intent clusters around `fiets afstellen`, `bikefitting`, and `zadelhoogte berekenen`
- Improve visibility for English clusters around `online bike fitting`, `bike fit calculator`, and `saddle height calculator`
- Increase organic click-through into `/calculators/bike-fit`
- Increase calculator-to-signup conversion from organic sessions

This plan intentionally avoids hard ranking promises like “top 5 in 60 days”. Those are outcome targets, not implementation-grade acceptance criteria.

---

## 2. Repo-Verified SEO Baseline

This section reflects the current codebase, not a generic SEO wishlist.

### Already implemented

- `hreflang` and alternates are already wired across public pages.
- Public sitemap sections already exist for pages, calculators, and guides.
- Empty sitemap sections are already excluded from the sitemap index.
- Guide pages already emit `FAQPage` and `BreadcrumbList` schema when FAQ content exists.
- Pain pages already emit `FAQPage` and `BreadcrumbList` schema.
- Calculator pages already have strong metadata coverage and schema.
- Guide fallback content already contains SEO keyword arrays.
- Pain-page content already contains SEO keyword arrays.

### Real gaps still present

- No dedicated public landing page for the Dutch `fiets afstellen` intent cluster.
- No dedicated public landing page for the Dutch `bikefitting` intent cluster.
- No dedicated public landing page for the English `bike fitting` / `online bike fitting` cluster.
- Guide-page metadata currently does not expose `keywords` even though fallback guide content already has `seoKeywords`.
- Guide/CMS metadata precedence is unclear: fallback guide content has SEO keywords, but the Convex CMS model does not currently expose a first-class keywords field for guides.
- Science pages exist but are lightly connected to the higher-traffic calculator/guide funnel.
- Homepage and selected public pages can link more intentionally into the new landing pages once they exist.
- Guide and pain internal-link anchor text can be more search-intent specific in selected high-value pages.

### Not real gaps and therefore removed from this plan

- “Add BreadcrumbList schema everywhere” as a new initiative
- “Add FAQ schema to pain pages”
- “Add FAQ schema to guide pages”
- “Remove empty blog sitemap”
- “Build breadcrumb schema helper”

Those are already handled in the repo and should not appear in the execution backlog.

---

## 3. Strategic Direction

### Core thesis

BestBikeFit4U already has:

- tools
- bilingual content
- pain pages
- guides
- structured SEO foundations

What it lacks is a stronger set of intent-specific landing pages that sit between the broad homepage and the deeper calculators/guides.

That means the highest-value SEO work is:

1. create targeted landing pages for the highest-opportunity search clusters
2. wire those pages into the existing calculator and guide network
3. expose missing metadata fields cleanly from the real content sources
4. strengthen internal linking where commercial intent is already high

---

## 4. New Landing Pages To Create

### `/nl/fiets-afstellen`

**Purpose:** own the Dutch DIY/education cluster around bike setup and bike position.

**Primary intent:** informational with a strong calculator handoff.

**Target themes:**
- fiets afstellen
- fiets juist afstellen
- fietspositie instellen
- racefiets afstellen
- zadelhoogte instellen

**Recommended role in funnel:** TOFU → calculator start

**Primary CTA direction:**
- saddle height calculator
- bike fit calculator

### `/nl/bikefitting`

**Purpose:** own the Dutch “service/tool” interpretation of `bikefitting`.

**Primary intent:** commercial investigation, more product-oriented than `/nl/fiets-afstellen`.

**Target themes:**
- bikefitting
- online bikefitting
- bikefit berekenen
- bikefitting thuis

**Recommended role in funnel:** MOFU → bike-fit calculator → signup

### `/en/bike-fitting`

**Purpose:** own the English `bike fitting` / `online bike fitting` intent cluster.

**Primary intent:** informational + commercial investigation.

**Target themes:**
- online bike fitting
- bike fitting at home
- how to fit a bike
- virtual bike fitting

**Recommended role in funnel:** TOFU/MOFU → bike-fit calculator → signup

### Canonical / hreflang note

These three pages should be treated as distinct pages with distinct canonicals.

Do **not** place `/nl/fiets-afstellen` and `/nl/bikefitting` in the same hreflang-alternate cluster merely because both are Dutch. They target different intents and are not language alternates of each other.

Valid alternate relationships should remain language-based only where pages are actual equivalents.

---

## 5. Existing Pages To Strengthen

### A. Guide pages

Real issue:
- fallback guide content already has `seoKeywords`
- guide route metadata does not currently surface `keywords`

This should be solved by wiring metadata from the correct source of truth, not by blindly inventing another SEO layer.

### B. Calculator pages

Calculator pages are already comparatively strong.

The main improvements here are:
- smarter contextual links to the new landing pages
- selected title/description refinement where justified
- optional science/trust cross-links

### C. Pain pages

Pain pages already have:
- keywords
- FAQ schema
- breadcrumb schema

The improvement opportunity is not schema. It is:
- stronger topical inline links
- stronger calculator-directed anchor text
- possibly better CTA specificity on highest-intent pain pages

### D. Science pages

Science pages exist and are indexable, but they are relatively isolated.

They should be used as trust/transparency support pages and linked selectively from:
- bike-fit calculator
- new landing pages
- a small set of relevant guides

---

## 6. Keyword And Intent Mapping

### New pages

| Page | Primary keyword | Supporting keyword set | Intent | Funnel stage |
|---|---|---|---|---|
| `/nl/fiets-afstellen` | fiets afstellen | fietspositie instellen, racefiets afstellen, zadelhoogte instellen | informational / DIY | TOFU |
| `/nl/bikefitting` | bikefitting | online bikefitting, bikefit berekenen, bikefitting thuis | commercial investigation | MOFU |
| `/en/bike-fitting` | online bike fitting | bike fitting at home, virtual bike fitting, how to fit a bike | informational + commercial | TOFU/MOFU |

### Existing calculators

Keep current calculator targeting as the baseline. Improve only where it supports the new landing-page architecture.

### Existing guides and pain pages

Use them as:
- supporting informational clusters
- internal-link donors to calculators and new landing pages

Not every page needs a separate rewrite. Prioritize the pages already closest to the target keyword clusters.

---

## 7. Content Model And Metadata Strategy

This is the most important implementation correction from the audit.

### Guides

Current state:
- fallback guide content includes `seoKeywords`
- guide page metadata currently omits `keywords`
- Convex guide CMS currently models `metaTitle` and `metaDescription`, but not a dedicated SEO keywords field

### Required decision

Before implementation, choose one metadata precedence model:

1. **Fallback-first model**
   - use `entry.seoKeywords` from fallback guide data when present
   - use CMS only for title/description/canonical/OG where available

2. **CMS-extended model**
   - extend the Convex guide schema to include localized keyword arrays
   - expose them through guide queries
   - fall back to `entry.seoKeywords` when CMS does not provide them

**Recommendation:** use a hybrid model.

- short-term: wire guide `keywords` from fallback `seoKeywords`
- medium-term: add localized keyword arrays to the CMS guide schema so fallback and CMS stay aligned

This keeps the first SEO release small and avoids blocking on a CMS migration.

**Decision taken for this release:** ship the short-term fallback-first layer now.

- guide `keywords` metadata comes from fallback guide SEO data
- CMS remains authoritative for title, description, canonical, and OG fields where available
- localized CMS keyword arrays are deferred until there is a real editorial need for direct keyword management in the guide admin

### Validation status

- `npm run build`: passed after the SEO implementation slice
- `npm run typecheck`: passed after rebuilding fresh `.next` types

The implementation is complete in code and the technical validation criteria for this release are satisfied.

### Pain pages

Pain-page metadata already includes keywords through structured content. No schema redesign is needed.

### New landing pages

New landing pages should define:
- `title`
- `description`
- `keywords`
- `openGraph`
- `alternates`
- `FAQPage` where relevant
- `BreadcrumbList`

---

## 8. Internal Linking Plan

### Homepage

Add deliberate body links into the new landing pages only where they feel natural and useful.

Good candidates:
- guides area
- “how it works” explanatory surfaces
- hero/supporting copy only if the insertion stays readable

Avoid keyword-stuffing the hero paragraph.

### New landing pages → calculators

Each new landing page should link to the calculators most aligned to its user intent.

Minimum expectation:
- bike fit
- saddle height
- frame size

Optional:
- crank length
- saddle width
- tire pressure, if contextually relevant

### Guide pages → calculators

Do not route this work through `src/lib/seo/relatedLinks.ts` by default. That helper primarily serves calculator ecosystems, while guide pages assemble related links from guide content/backlog and `getGuideLinkLabel`.

Instead:
- audit the top-priority guides
- improve guide-specific related-link labels or link-label resolution
- keep anchor text natural and topic-matched

### Pain pages → landing pages

For Dutch pain pages, add a contextual inline link to `/nl/fiets-afstellen` only where it is semantically natural.

Do not enforce brittle instructions like “second mention of afstelling”. Write for content quality first.

### Science pages

Add selective cross-links:
- `/science/bike-fit-methods` from the bike-fit calculator and new bikefitting landing pages
- `/science/stack-and-reach` from frame-size / geometry-comparison contexts
- `/science/calculation-engine` from transparency/trust sections where technically appropriate

---

## 9. Technical SEO Recommendations

### P0 technical work

1. Create the three new landing pages.
2. Add them to sitemap sources.
3. Expose `keywords` in guide-page metadata using the chosen precedence model.

### P1 technical work

1. Improve selected internal-link labels in guide and pain content.
2. Add selective cross-links to science pages.
3. Refine selected calculator metadata where needed.

### P2 technical work

1. If needed, extend the Convex guide CMS schema with localized `keywords`.
2. Import/populate those values from the current guide source material.
3. Add additional landing-page variants only after the first three pages have performance data.

### Explicitly not in this plan

- removing blog sitemap plumbing that is already safely excluded from the sitemap index
- re-adding breadcrumb or FAQ schema that already exists
- speculative programmatic route expansion before validating the first landing-page cohort

---

## 10. Conversion Strategy

### Organic funnel

1. Searcher lands on a targeted landing page or high-intent guide/pain page
2. User clicks into the most relevant calculator
3. User completes the free calculator
4. User gets prompted to save or continue in account flow
5. User signs up and optionally upgrades

### Rules

1. Every new landing page must have clear calculator handoffs.
2. The most relevant calculator should not be buried among equal-weight links.
3. Pain pages should keep a practical, action-oriented CTA path.
4. Science pages should support trust, not become dead-end essays.

---

## 11. Implementation Backlog

### P0 — highest-value, repo-aligned work

| ID | Task | Files |
|---|---|---|
| SEO-01 | Create `/nl/fiets-afstellen` landing page | `src/app/(public)/fiets-afstellen/page.tsx` |
| SEO-02 | Create `/nl/bikefitting` landing page | `src/app/(public)/bikefitting/page.tsx` |
| SEO-03 | Create `/en/bike-fitting` landing page | `src/app/(public)/bike-fitting/page.tsx` |
| SEO-04 | Add new landing pages to sitemap sources | `src/lib/seo/sitemap/sources.ts` |
| SEO-05 | Wire guide-page `keywords` metadata from current fallback guide SEO data | `src/app/(public)/guides/[slug]/page.tsx`, `src/app/(public)/guides/data.ts` |

### P1 — strengthen existing funnel

| ID | Task | Files |
|---|---|---|
| SEO-06 | Improve homepage body links into new landing pages | `src/app/(public)/page.tsx` and/or home content modules |
| SEO-07 | Add contextual Dutch pain-page links to `/nl/fiets-afstellen` where natural | `src/content/painPages.ts` and related templates |
| SEO-08 | Improve guide-related link anchor text on selected high-value pages | guide content/backlog, `getGuideLinkLabel`, guide route presentation |
| SEO-09 | Add selected science-page cross-links from calculators/guides/landing pages | calculator pages, guide route, new landing pages |
| SEO-10 | Review and refine calculator titles/descriptions where the new landing-page architecture changes search intent coverage | selected calculator `page.tsx` files |

### P2 — content model hardening

| ID | Task | Files |
|---|---|---|
| SEO-11 | Decide and implement long-term guide SEO metadata precedence | guide route + guide content/CMS layer |
| SEO-12 | If chosen, extend guide CMS schema with localized keyword arrays | `convex/schema.ts`, guide queries/mutations |
| SEO-13 | Populate guide CMS keyword arrays from source material | import/backfill tooling |

### P3 — only after validation

| ID | Task | Notes |
|---|---|---|
| SEO-14 | Expand with additional landing-page variants only if the first cohort shows traction | optional |
| SEO-15 | Consider review/rating schema only if testimonial/source requirements are actually supportable | optional |
| SEO-16 | Consider blog launch only if there is a real publishing plan and owner | optional |

---

## 12. Implementation Preparation

This plan now includes a route-level implementation spec for the current public site:

- `plans/seo-improvement-v1/output-03-page-by-page-implementation-matrix.md`
- `plans/seo-improvement-v1/output-04-execution-checklist.md`

That matrix is the execution source of truth for:

- which current public pages should donate internal links
- which exact destination routes should receive those links
- which anchor-text families are preferred in Dutch and English
- which keyword clusters each page is supporting

The execution checklist is the sequencing source of truth for:

- sprint order
- write scope
- dependencies
- per-slice done criteria

Implementation should follow the route-level matrix rather than relying on broad “add more internal links” interpretation.

### Core route groups to execute against

#### Hubs and support pages

- `/`
- `/guides`
- `/pain`
- `/use-cases`
- `/how-it-works`
- `/measurement-guide`
- `/why-bikefit-matters`
- `/faq`

#### Science pages

- `/science/bike-fit-methods`
- `/science/calculation-engine`
- `/science/stack-and-reach`

#### Core calculators

- `/calculators/bike-fit`
- `/calculators/saddle-height`
- `/calculators/frame-size`
- `/calculators/saddle-width`
- `/calculators/crank-length`

#### Guide cluster

- `/guides/bike-fitting-for-knee-pain`
- `/guides/bike-fitting-for-lower-back-pain`
- `/guides/road-bike-fit-guide`
- `/guides/gravel-bike-fit-guide`
- `/guides/mountain-bike-fit-guide`
- `/guides/triathlon-bike-fit-guide`

#### Use-case cluster

- `/use-cases/endurance-cycling-fit`
- `/use-cases/gravel-cycling-fit`
- `/use-cases/mountain-cycling-fit`
- `/use-cases/triathlon-bike-fit`
- `/use-cases/commuter-bike-fit`
- `/use-cases/back-pain-cycling`
- `/use-cases/short-torso-bike-fit`
- `/use-cases/tall-rider-bike-fit`

### Success Criteria

These are execution-success criteria, separate from traffic outcomes.

#### Content and routing success

- All three new landing pages exist and are indexable:
  - `/nl/fiets-afstellen`
  - `/nl/bikefitting`
  - `/en/bike-fitting`
- Each new landing page has:
  - a distinct intent
  - complete metadata
  - at least one above-the-fold calculator handoff
  - at least one supporting guide/science link

#### Internal-linking success

- Homepage links directly to:
  - bike-fit calculator
  - saddle-height calculator
  - guides hub
  - pain hub
  - stack-and-reach science page
  - measurement guide
- `/calculators/bike-fit` receives contextual links from:
  - homepage
  - at least one science page
  - at least two guide/use-case pages
- `/calculators/saddle-height` receives contextual links from:
  - homepage or guides hub
  - measurement guide
  - knee-pain guide
  - lower-back-pain guide
- `/science/stack-and-reach`, `/calculators/frame-size`, and `/guides/road-bike-fit-guide` form a bidirectional `reach racefiets` cluster.
- `/pain` and the key pain guides distribute users into the calculator funnel rather than only laterally into more content.

#### Anchor-text success

- Primary contextual links avoid generic anchors such as:
  - `read more`
  - `learn more`
  - `open guide`
  - `bekijk hier`
- Dutch pages use Dutch anchor phrasing for Dutch intent clusters.
- English pages use English anchor phrasing for English intent clusters.
- Exact-match anchors are used deliberately, not repeated mechanically throughout a page.

#### Technical success

- New landing pages are included in sitemap sources.
- Guide metadata exposes `keywords` from a defined source of truth.
- No acceptance item duplicates already-complete breadcrumb or FAQ schema work.

---

## 13. Acceptance Criteria

### Build and metadata

- [ ] `npm run typecheck` passes after implementation
- [ ] New landing pages have correct metadata, canonical, and alternates
- [ ] New landing pages are present in the sitemap
- [ ] Guide pages expose `keywords` metadata from a defined source of truth

### Linking

- [ ] Homepage links intentionally into the new landing-page cluster
- [ ] Target Dutch pain pages link naturally to `/nl/fiets-afstellen`
- [ ] Selected high-value guides use stronger topic-matched calculator anchors
- [ ] New landing pages link clearly to the most relevant calculators

### Trust and structure

- [ ] Science pages are selectively connected into trust-relevant funnel surfaces
- [ ] No backlog item duplicates already-implemented breadcrumb or FAQ schema work

### Outcomes to monitor after launch

- [ ] Organic sessions to new landing pages
- [ ] Click-through from new landing pages to calculators
- [ ] Organic-assisted calculator starts
- [ ] Organic-assisted signup rate

---

## 14. Notes For Execution

- Treat this as a landing-page and metadata-wiring project first, not a sweeping schema rewrite.
- Preserve existing SEO systems that already work.
- Validate routes and content models against the repo before adding any new backlog items.
- Keep Dutch and English strategy aligned, but do not force same-language pages into hreflang relationships when they serve different intents.
