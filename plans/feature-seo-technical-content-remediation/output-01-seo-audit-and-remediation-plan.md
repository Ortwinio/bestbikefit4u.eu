# BestBikeFit4U SEO Audit And Remediation Plan

## 1. Executive Summary

### Audit Findings

- The most important SEO issues are route duplication and crawl inefficiency, not missing metadata.
- The cleanest confirmed issues are:
  - parameterized internal links to `/case-study?pain=...` that canonicalize to `/case-study`
  - locale/alias tire-pressure routes that can render on non-canonical paths
  - public links to robots-blocked URLs such as `/login`, `/dashboard/shoe-cleat-fit`, and `/bikes/compare-fit`
  - heading-order problems caused by shared card components that emit `h3` before the first page-level `h2`
- The codebase already has strong fundamentals:
  - per-page `generateMetadata`
  - locale-aware `canonical` and `hreflang` alternates
  - generated `robots.txt`
  - generated sitemap index and child sitemaps
  - non-production `X-Robots-Tag` handling in `src/proxy.ts`

### Likely Root Causes

- Public pages and guide content link to convenience URLs instead of canonical destinations.
- CTA flows reuse public, crawlable URLs for login and protected app destinations.
- Tire-pressure routes intentionally support multiple path variants but do not fully redirect all aliases to their canonical version.
- Shared public cards use semantic `h3` headings even when they appear before the first section `h2`.
- The single `noindex` and `nofollow` warnings are probably coming from an internally discoverable invalid dynamic route or a non-production crawl target, not from a normal public template.

### Fastest Wins

1. Replace `/use-cases` internal links with the final `/guides/...` destinations.
2. Stop using `?pain=` parameter links in public crawlable CTAs unless the parameter is required.
3. Redirect non-canonical tire-pressure aliases to the canonical locale path.
4. Remove or reroute public links to robots-blocked app URLs where a public landing page or `/login` gateway is better.
5. Fix the first-heading-after-`h1` problem in shared public card components.

### Highest Priority Technical Fixes

1. Canonical route consolidation for tire-pressure aliases and programmatic pressure pages.
2. Case-study parameter cleanup and canonical/internal-link cleanup.
3. Public-to-protected CTA strategy review for login and app-only routes.
4. Shared heading semantics refactor in public cards/info panels.

## 2. Issue-By-Issue Audit

### 2.1 `H2: Multiple`

**What it means here**

- Many public templates intentionally use several content sections, each with its own `h2`.
- This is expected on pages built with `PublicSection` and on long-form calculator/guides pages.

**Finding**

- Mostly informational, not a defect by itself.

**Severity for BestBikeFit4U**

- Low.

**Probable root cause**

- Shared section components correctly emit repeated `h2` headings across long pages.
- Primary component: `src/components/public/PublicSection.tsx`.

**Affected page groups**

- homepage
- guides hub and guide detail pages
- pain hub and pain detail pages
- calculators
- pricing, FAQ, about, privacy, terms

**Recommended action**

- Do not “fix” multiple `h2` warnings globally.
- Review only pages that also show non-sequential headings.

### 2.2 `Response Codes: Internal Redirection (3xx)`

**What it means here**

- At least one internal link points to a URL that redirects instead of linking directly to the final destination.

**Finding**

- Real issue, but minor.

**Severity for BestBikeFit4U**

- Low to medium.

**Probable root causes**

- Legacy `/use-cases` routes redirect to `/guides` routes:
  - `src/app/(public)/use-cases/page.tsx`
  - `src/app/(public)/use-cases/[slug]/page.tsx`
- Homepage still links to legacy `/use-cases` routes:
  - `src/app/(public)/page.tsx`

**Exact or likely affected URLs**

- confirmed likely source:
  - `/en/use-cases`
  - `/nl/use-cases`
- likely broader family if the crawler exported more detail:
  - `/en/use-cases/back-pain-cycling`
  - `/en/use-cases/gravel-cycling-fit`
  - `/en/use-cases/triathlon-bike-fit`
  - `/en/use-cases/tall-rider-bike-fit`
  - Dutch equivalents

**Recommended action**

- Update internal links to point directly to `/guides` or the specific guide destination.
- Keep redirects for legacy external/backlink preservation.

### 2.3 `H2: Non-Sequential`

**What it means here**

- The first heading after the page `h1` is sometimes an `h3` instead of an `h2`.

**Finding**

- Real accessibility/structure issue.
- Mostly template-level, not content-editor error.

**Severity for BestBikeFit4U**

- Medium.

**Probable root causes**

- Shared card primitives use semantic `h3` headings:
  - `src/components/prototyper-ui/ui/card.tsx`
  - `src/components/public/PublicSurfaceCard.tsx`
  - `src/components/public/PublicInfoPanel.tsx`
  - `src/components/public/BikeQuickCheckCard.tsx`
- These card titles can appear immediately after a hero `h1`, before the first section `h2`.

**Affected page groups/templates**

- homepage:
  - `BikeQuickCheckCard` appears before the first section `h2`
- pain detail pages:
  - `PainPointPageTemplate` renders a `PublicSurfaceCard` before section headings
- any public template that renders `PublicSurfaceCard` or `PublicInfoPanel` above the first `PublicSection`

**Likely affected URLs**

- `/en`
- `/nl`
- `/en/pain/*`
- `/nl/pain/*`
- likely selected public marketing/calculator pages with early info cards

**Recommended action**

- Add heading-level control to shared public cards, or switch default card titles to non-heading text when they are not part of the document outline.
- Acceptance rule: first visible structural heading after `h1` must be `h2`.

### 2.4 `Response Codes: Internal Blocked by Robots.txt`

**What it means here**

- Public pages link to URLs disallowed in `robots.txt`.

**Finding**

- Real.
- High crawl-efficiency impact, but not automatically an indexing bug because many of the targets are intentionally non-indexable app/login routes.

**Severity for BestBikeFit4U**

- Medium in practice, despite the crawler’s high flag.

**Probable root causes**

- `robots.txt` disallows many app/auth routes:
  - `src/app/robots.ts`
  - `src/lib/seo/sitemap/config.ts`
- Public CTAs still point to those blocked URLs:
  - `/login` from many public pages and shared auth actions
  - `/dashboard/shoe-cleat-fit` from guides backlog content
  - `/bikes/compare-fit` from geometry guide backlog content
- Public content sources:
  - `src/components/layout/HeaderAuthActions.tsx`
  - `src/components/layout/HeaderMobileMenu.tsx`
  - calculator and landing pages under `src/app/(public)`
  - guide content in `docs/bestbikefit4u_guides_cms_backlog_v1_en.csv`
  - guide content in `docs/bestbikefit4u_guides_cms_backlog_v1_nl.csv`

**Exact or likely affected URLs**

- definitely included:
  - `/en/login`
  - `/nl/login`
  - `/dashboard`
  - `/en/dashboard/shoe-cleat-fit`
  - `/nl/dashboard/shoe-cleat-fit`
  - `/en/bikes/compare-fit`
  - `/nl/bikes/compare-fit`
- likely also:
  - `/en/profile`
  - `/nl/profile`
  - `/en/fit`
  - `/nl/fit`
  - `/en/fit-history`
  - `/nl/fit-history`
  - `/en/bikes`
  - `/nl/bikes`

**Recommended action**

- Split the policy by route type:
  - public login page: prefer crawlable + `noindex,follow`
  - app-only routes: keep non-indexable, but reduce public inlinks
- Replace public links to deep protected app URLs with:
  - a public explainer page
  - a login gateway
  - or an authenticated CTA rendered only for signed-in users

### 2.5 `Directives: Nofollow`

**What it means here**

- One crawled URL contained `nofollow` in meta robots or `X-Robots-Tag`.

**Finding**

- Needs confirmation before changing code.
- No normal public production template intentionally emits `nofollow`.

**Severity for BestBikeFit4U**

- Unknown until URL-level export is checked.

**Probable root causes**

- non-production host response from `src/proxy.ts`:
  - `X-Robots-Tag: noindex, nofollow, noarchive`
- invalid dynamic route metadata in:
  - `src/app/(public)/guides/[slug]/page.tsx`
  - `src/app/(public)/pain/[slug]/page.tsx`
  - `src/app/(public)/bandenspanning/[slug]/page.tsx`
  - `src/app/(public)/tire-pressure/[slug]/page.tsx`

**Exact affected URL**

- Not identifiable from `issues_overview_report.csv` alone.

**Recommended action**

- Export the exact URL from the crawler before changing policy.
- If it is a preview host: no fix needed.
- If it is an internally linked invalid URL: fix the source link.

### 2.6 `URL: Parameters`

**What it means here**

- Internal crawl discovered parameterized URLs.

**Finding**

- Real.
- Mostly intentional, but avoidable.

**Severity for BestBikeFit4U**

- Low to medium.

**Probable root cause**

- Pain pages use CTA links to `/case-study?pain=<slug>`:
  - `src/components/public/PainPointPageTemplate.tsx`

**Exact likely affected URLs**

- `/en/case-study?pain=knee-pain-cycling`
- `/en/case-study?pain=lower-back-pain-cycling`
- `/en/case-study?pain=neck-pain-cycling`
- `/en/case-study?pain=hand-numbness-cycling`
- `/en/case-study?pain=saddle-discomfort-cycling`
- `/nl/case-study?pain=knee-pain-cycling`
- `/nl/case-study?pain=lower-back-pain-cycling`
- `/nl/case-study?pain=neck-pain-cycling`
- `/nl/case-study?pain=hand-numbness-cycling`
- `/nl/case-study?pain=saddle-discomfort-cycling`

**Recommended action**

- If the param is only for form prefill, stop linking to the parameterized URL publicly.
- Keep the clean canonical `/case-study` as the linked URL and pass the prefilling state through client state, storage, or a POST-backed form.

### 2.7 `Directives: Noindex`

**What it means here**

- One crawled URL contains `noindex`.

**Finding**

- Same investigation as the `nofollow` warning.
- There is no evidence that a normal public conversion page is intentionally `noindex`.

**Severity for BestBikeFit4U**

- Unknown until the exact URL is exported.

**Probable root causes**

- invalid dynamic route metadata
- non-production crawl target

**Recommended action**

- Confirm the URL before changing anything.
- If it is a valid public route, treat as a bug.
- If it is a not-found/preview route, leave policy intact and fix discovery only if it is internally linked.

### 2.8 `Canonicals: Canonicalised`

**What it means here**

- Crawled URLs canonicalize to another URL.

**Finding**

- Real.
- Mostly intentional duplication, but the site should reduce internal exposure of those URLs.

**Severity for BestBikeFit4U**

- Medium.

**Probable root causes**

- `case-study?pain=` pages canonicalize to the clean `/case-study` page:
  - `src/app/(public)/case-study/page.tsx`
- tire-pressure alias pages can resolve on the “wrong” localized path while canonicalizing to the preferred one:
  - `src/app/(public)/bandenspanning-calculator/page.tsx`
  - `src/app/(public)/tire-pressure-calculator/page.tsx`
  - `src/lib/public-calculators/routes.ts`

**Exact or likely affected URLs**

- likely 10 parameterized case-study URLs listed in section 2.6
- plus likely alias pages:
  - `/en/bandenspanning-calculator` -> canonical `/en/tire-pressure-calculator`
  - `/nl/tire-pressure-calculator` -> canonical `/nl/bandenspanning-calculator`

**Additional risk not clearly counted in the report**

- Cross-locale programmatic pressure aliases are technically reachable because both route families exist:
  - `/en/bandenspanning/<dutch-slug>`
  - `/nl/tire-pressure/<english-slug>`
- They are not the intended canonical surface.

**Recommended action**

- Replace internal links to non-canonical aliases.
- Add explicit redirects for alias paths instead of relying only on canonical tags.

## 3. Page Cluster Analysis

| Cluster | Likely issue types | Template-wide or page-specific | Recommended remediation |
|---|---|---|---|
| Homepage | non-sequential headings, redirect links, robots-blocked links | Template-wide | Fix `BikeQuickCheckCard` heading semantics and replace `/use-cases` links with canonical guide targets. |
| Public calculators | multiple `h2`, some robots-blocked login CTAs | Mostly template-wide | Keep multiple `h2`; review CTA strategy to `/login`; ensure no alias links point to non-canonical tire-pressure paths. |
| Tire-pressure family | canonicalized aliases, possible cross-locale duplicates | Template-wide | Enforce hard redirects for alias and cross-locale pressure routes. |
| Guides hub/detail | robots-blocked links from CTA targets, acceptable multiple `h2` | Template + content-source | Clean CTA targets in guide backlog and avoid linking indexable pages straight to protected deep-app routes. |
| Pain hub/detail | parameter URLs, non-sequential headings, login links | Template-wide | Remove `?pain=` public links, fix early-card heading order, keep pain hub/indexable. |
| Case-study | parameterized duplicates canonicalized to clean page | Template-wide | Use clean URL for public navigation; preserve prefill behavior without query-driven crawl surface. |
| Science/about/methodology | mostly healthy, some shared CTA/login links | Mostly page-specific | Keep indexable; route footer/resource links to canonical guide targets. |
| Legacy redirect families (`use-cases`, `science/calculation-engine`) | internal redirection | Template-wide | Keep redirects for legacy URLs, but stop linking to them internally. |
| Utility pages (`privacy`, `terms`, sitemaps, robots`) | low risk | Template-wide | No major change; just validate canonical/robots consistency. |
| Account/gated/app pages | robots-blocked, auth redirects | Intentional | Reassess whether `/login` should be `noindex,follow` instead of `Disallow`. Remove public deep links where possible. |

## 4. Root Cause Map

| Issue | Root cause | Code area / config | Affected page types | SEO risk | Fix complexity | Recommended owner |
|---|---|---|---|---|---|---|
| Multiple `h2` | Section-based long-form templates | `src/components/public/PublicSection.tsx` | most public pages | Low | S | Frontend |
| Non-sequential headings | `h3` card titles before first `h2` | `src/components/prototyper-ui/ui/card.tsx`, `src/components/public/PublicSurfaceCard.tsx`, `src/components/public/PublicInfoPanel.tsx`, `src/components/public/BikeQuickCheckCard.tsx` | homepage, pain pages, selected public pages | Medium | M | Frontend |
| Internal 3xx links | Legacy `/use-cases` links still used internally | `src/app/(public)/page.tsx`, `src/app/(public)/use-cases/*` | homepage, legacy scenario routes | Low | S | Frontend |
| Blocked by robots | Public CTAs point to disallowed auth/app routes | `src/app/robots.ts`, `src/lib/seo/sitemap/config.ts`, public pages, guide CSVs | guides, calculators, landing pages | Medium | M | Frontend + Product |
| `nofollow` | likely preview host or invalid dynamic URL | `src/proxy.ts`, dynamic slug pages | unknown single URL | Unknown | S | Frontend + SEO |
| Parameter URLs | pain pages link to query-based case-study URLs | `src/components/public/PainPointPageTemplate.tsx`, `src/app/(public)/case-study/page.tsx` | pain pages, case-study | Medium | M | Frontend |
| `noindex` | likely preview host or invalid dynamic URL | `src/proxy.ts`, dynamic slug metadata | unknown single URL | Unknown | S | Frontend + SEO |
| Canonicalized URLs | parameter URLs and tire-pressure aliases | `src/app/(public)/case-study/page.tsx`, `src/app/(public)/bandenspanning-calculator/page.tsx`, `src/app/(public)/tire-pressure-calculator/page.tsx`, `src/lib/public-calculators/routes.ts` | case-study, tire-pressure family | Medium | M | Frontend |
| Route normalization gap | canonical host normalization not defined in app config | hosting layer, `next.config.ts` absent redirect rules | whole site | Medium | M | Platform / Infra |

## 5. Prioritized Implementation Plan

### Phase 1: Critical / High-Impact

| Task | Objective | Files / areas | Why it matters | Dependencies | Acceptance criteria | Effort | Priority |
|---|---|---|---|---|---|---|---|
| Replace legacy internal redirect links | Stop linking to redirected `/use-cases` routes | `src/app/(public)/page.tsx` | Removes crawl hops and consolidates internal signals | none | No public internal links point to `/use-cases` routes | S | P1 |
| Remove public `case-study?pain=` links | Eliminate parameterized duplicate crawl surface | `src/components/public/PainPointPageTemplate.tsx`, `src/app/(public)/case-study/page.tsx` | Resolves `parameters` and most `canonicalised` warnings | may need client-side prefill strategy | Public pain CTAs link to clean `/case-study`; prefill still works | M | P1 |
| Redirect tire-pressure alias routes | Convert alias pages from canonical-only duplicates into explicit redirects | `src/app/(public)/bandenspanning-calculator/page.tsx`, `src/app/(public)/tire-pressure-calculator/page.tsx`, route handling layer | Removes duplicate crawlable aliases | route design decision | `/en/bandenspanning-calculator` 301s to `/en/tire-pressure-calculator`; Dutch inverse also true | M | P1 |
| Confirm and isolate `noindex`/`nofollow` URL | Prevent accidental deindexing if it is a real public page | crawl export + `src/proxy.ts` + dynamic slug pages | Only unresolved high-severity report item | URL-level export from crawler | Exact URL identified and classified as intentional or bug | S | P1 |

### Phase 2: Structural

| Task | Objective | Files / areas | Why it matters | Dependencies | Acceptance criteria | Effort | Priority |
|---|---|---|---|---|---|---|---|
| Refactor public heading semantics | Ensure first heading after `h1` is `h2` | `src/components/prototyper-ui/ui/card.tsx`, `src/components/public/PublicSurfaceCard.tsx`, `src/components/public/PublicInfoPanel.tsx`, `src/components/public/BikeQuickCheckCard.tsx` | Fixes accessibility and heading-order warnings across many pages | audit representative pages first | Representative pages have sequential heading order in rendered HTML | M | P2 |
| Rework public links to blocked app URLs | Reduce robots-blocked inlinks from indexable pages | shared CTA components, guide backlog CSVs, selected public pages | Improves crawl efficiency and cleaner IA | product decision on CTA destinations | Guide pages no longer link directly to deep protected routes unless user is authenticated | M | P2 |
| Split login vs app robots policy | Decide whether `/login` should be crawlable `noindex,follow` | `src/app/robots.ts`, `src/lib/seo/sitemap/config.ts`, login page metadata if added | Better balance between conversion CTAs and crawl logic | product/SEO policy choice | Final policy documented and implemented consistently | M | P2 |
| Guard cross-locale pressure aliases | Prevent non-canonical locale/path combinations from being crawlable | `src/app/(public)/bandenspanning/[slug]/page.tsx`, `src/app/(public)/tire-pressure/[slug]/page.tsx`, `src/lib/seo/programmatic/tirePressure.ts` | Removes hidden duplicate surfaces beyond the report | depends on redirect strategy | Cross-locale alias paths redirect or 404; only canonical locale path is indexable | M | P2 |

### Phase 3: Cleanup / Consistency

| Task | Objective | Files / areas | Why it matters | Dependencies | Acceptance criteria | Effort | Priority |
|---|---|---|---|---|---|---|---|
| Add SEO regression tests | Make canonical/robots/heading regressions testable | page tests + SEO utilities | Prevents reintroducing the same issues | Phase 1 and 2 decisions | Tests cover canonical routes, alias redirects, and representative heading trees | M | P3 |
| Validate infra-level host normalization | Confirm http/https and www/non-www canonical behavior outside app | hosting/Vercel config, DNS | Avoids off-repo normalization drift | access to hosting config | One canonical host enforced at edge | S | P3 |
| Editorial guidance for CTA targets | Stop future content from linking indexable pages to blocked app routes | guide backlog process/docs | Prevents future crawl waste | product/content alignment | guide content rules documented | S | P3 |

## 6. Developer-Ready Fix Backlog

| ID | Task | Problem solved | Scope | Files/components likely involved | Acceptance criteria | Priority | Effort | Risk if not fixed |
|---|---|---|---|---|---|---|---|---|
| SEO-01 | Replace `/use-cases` internal links | Internal redirect hops | Homepage + legacy scenario CTAs | `src/app/(public)/page.tsx` | No internal public links to `/use-cases` remain | P1 | S | Ongoing crawl inefficiency |
| SEO-02 | Remove `?pain=` crawlable links | Parameter duplicates + canonicalized URLs | Pain pages + case-study flow | `src/components/public/PainPointPageTemplate.tsx`, `src/app/(public)/case-study/page.tsx` | Public links use clean `/case-study`; prefill preserved without crawlable query URL | P1 | M | Duplicate URLs remain in crawl/index signals |
| SEO-03 | Redirect tire-pressure aliases | Canonicalized duplicate routes | Tire-pressure root aliases | `src/app/(public)/bandenspanning-calculator/page.tsx`, `src/app/(public)/tire-pressure-calculator/page.tsx` | Alias routes 301 to canonical locale path | P1 | M | Duplicate route surface remains crawlable |
| SEO-04 | Identify single `noindex`/`nofollow` URL | Unknown high-severity report item | Crawl validation + route audit | crawler export, `src/proxy.ts`, dynamic slug pages | Exact URL classified and resolved if needed | P1 | S | Accidental deindexing could persist |
| SEO-05 | Refactor card heading semantics | Non-sequential headings | Shared public card system | `src/components/prototyper-ui/ui/card.tsx`, `src/components/public/*` | Representative pages render `h1 -> h2 -> h3` order logically | P2 | M | Accessibility and structural warnings persist |
| SEO-06 | Reduce public links to blocked app URLs | Robots-blocked inlinks | Guides + public CTAs | guide backlog CSVs, selected public pages, shared CTA components | Public pages stop linking directly to deep app routes when not necessary | P2 | M | Crawl budget waste and noisy audits continue |
| SEO-07 | Decide login indexing policy | Mixed robots strategy | Login + robots config | `src/app/robots.ts`, `src/lib/seo/sitemap/config.ts`, login metadata | `/login` policy documented and consistent | P2 | M | Public CTA target remains awkward for crawlers |
| SEO-08 | Block cross-locale pressure duplicates | Hidden duplicate locale paths | Programmatic pressure pages | `src/app/(public)/bandenspanning/[slug]/page.tsx`, `src/app/(public)/tire-pressure/[slug]/page.tsx` | Only canonical locale path is indexable | P2 | M | Duplicate long-tail pages remain reachable |
| SEO-09 | Add SEO regression tests | Prevent regressions | Test suite | page tests, SEO helpers | Tests fail on canonical/robots/heading regressions | P3 | M | Same issues reappear silently |
| SEO-10 | Confirm host normalization at edge | Canonical host consistency | Platform config | hosting config outside repo | http/www variants redirect to `https://bestbikefit4u.eu` | P3 | S | Canonical drift remains possible |

## 7. Validation Plan

### Crawl Checks

- Re-run Screaming Frog after each phase.
- Export:
  - canonicalized URLs
  - parameter URLs
  - internal redirection inlinks
  - internal blocked by robots inlinks
  - noindex and nofollow URLs

### Manual Page Checks

- Check representative routes:
  - homepage
  - one pain page
  - one guide hub
  - one guide leaf
  - one calculator
  - tire-pressure root alias pages
  - one programmatic tire-pressure page

### Source-Code Checks

- Confirm canonical builders only target intended canonical paths.
- Confirm no public component links to legacy redirect routes.
- Confirm public CTA targets do not point to blocked deep-app routes unless intentional.

### Browser / HTML Inspection

- Inspect final HTML for:
  - `<link rel="canonical">`
  - `<link rel="alternate" hreflang=...>`
  - robots meta
  - heading order
- For heading validation, confirm the first heading after `h1` is `h2`.

### Search Console Checks

- Validate indexed vs excluded URLs after release.
- Review duplicate, alternate canonical, and blocked-by-robots reports.
- Watch for soft-404 or redirected-page indexing anomalies.

### Canonical Validation

- `/en/tire-pressure-calculator` self-canonical
- `/nl/bandenspanning-calculator` self-canonical
- alias paths 301 instead of self-rendering with canonical elsewhere
- `/case-study?pain=...` no longer appears in internal crawl surface

### Robots Validation

- `robots.txt` matches intended policy.
- `/login` policy is consistent with product/SEO decision.
- app-only routes are not exposed unnecessarily from public pages.

### Internal Link Validation

- no internal links to `/use-cases`
- no internal links to non-canonical tire-pressure aliases
- public guides do not point straight to protected app routes unless intentional

### Heading Validation

- representative pages pass a manual heading outline check
- no shared public card emits `h3` before the first section `h2` unless explicitly overridden

## 8. Final Recommendation

### Do Immediately

1. Replace `/use-cases` internal links with final guide destinations.
2. Remove crawlable `case-study?pain=` links and preserve prefill without parameter URLs.
3. Redirect tire-pressure aliases to canonical locale paths.
4. Export and confirm the exact single `noindex` / `nofollow` URL before shipping any policy change.

### Do Next

1. Refactor shared public card heading semantics.
2. Rework public CTA strategy for login and protected app routes.
3. Decide and document whether `/login` should be `Disallow` or `noindex,follow`.

### Can Wait

1. Multiple `h2` warnings where the structure is already logical.
2. Host normalization hardening, if platform-level redirects are already correct.
3. Test automation after the route-policy fixes are settled.

### Warnings That May Be Acceptable If Intentional

- Multiple `h2` on long pages.
- `canonicalised` URLs only where a legacy alias must remain reachable temporarily.
- robots-blocked app routes, but only if public pages are not needlessly linking to them.

## Open Questions

1. Was the crawler run against production, preview, or a local/non-canonical host?
2. What exact URL triggered the single `noindex` and `nofollow` warnings?
3. Is `/login` intentionally meant to be blocked by `robots.txt`, or should it become crawlable `noindex,follow`?
4. Are host-level redirects for `http`, `www`, and trailing-slash normalization already enforced outside the app?
