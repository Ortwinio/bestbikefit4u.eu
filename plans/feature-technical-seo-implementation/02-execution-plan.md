# Execution Plan — Technical SEO

## Goal

Turn the technical SEO backlog into a buildable sequence that minimizes rework, keeps crawl/indexing policy changes coherent, and gives the team a practical implementation order.

## Planning Assumptions

- Work is executed on the current Next.js App Router codebase, not a greenfield rewrite.
- Existing shared helpers should be extended before new route-local logic is added.
- Sitemap, canonical, and hreflang policy must be stabilized before template-level enhancements like breadcrumbs and richer schema.
- Repo-wide non-SEO lint/build noise exists today, so SEO verification should rely on targeted checks first and then roll into broader gates.

## Effort Scale

- `XS`: less than 0.5 day
- `S`: 0.5 to 1 day
- `M`: 1 to 2 days
- `L`: 2 to 4 days
- `XL`: 4+ days

## Dependency Summary

### Foundation dependencies

- Ticket 01 is the source-of-truth step for route policy.
- Ticket 02 and Ticket 05 depend on Ticket 01.
- Ticket 06 depends on Ticket 01 and partially on Ticket 05.
- Ticket 03 depends on Ticket 02 and Ticket 05.

### Template and CMS dependencies

- Ticket 07 depends on Ticket 03 and Ticket 05.
- Ticket 08 depends on Ticket 03 and partially on Ticket 07.
- Ticket 10 depends on Ticket 12 for guide CMS enforcement.
- Ticket 11 depends on Ticket 01 and Ticket 02.
- Ticket 12 depends on Ticket 03 for metadata field policy.

### Validation dependencies

- Ticket 13 depends on Tickets 01, 05, 06, and whichever template/CMS tickets are in scope for the release.
- Ticket 09 can start after the core public templates are stable, but should not be the first workstream.

## Recommended Build Order

### Phase 1 — Crawl / Indexing Foundation

#### Ticket 01

**Build order step**  
1

**Why first**  
This defines what is indexable and what is not. Without it, robots, sitemaps, canonical rules, and internal-link policy will diverge again.

**Estimated effort**  
`S`

**Likely outputs**  
- route policy inventory
- shared allow/block definitions
- updated implementation notes for sitemap + robots consumers

**Execution notes**  
- Use `src/app` route families as the source set.
- Produce a single policy artifact that later tickets can import or reference.

#### Ticket 02

**Build order step**  
2

**Why here**  
Canonical ownership and URL policy need to be decided before metadata helpers and sitemap rules are tightened.

**Estimated effort**  
`M`

**Likely outputs**  
- standardized canonical owner policy
- programmatic page canonical cleanup plan
- redirect/canonical decision table for Dutch alias routes

**Execution notes**  
- Focus first on `bandenspanning/*` and `tire-pressure/*`.
- Decide whether route pairs are parallel localized pages or alias/redirect families.

#### Ticket 05

**Build order step**  
3

**Why here**  
Canonical and hreflang logic should be stabilized before page templates are refactored to shared metadata helpers.

**Estimated effort**  
`M`

**Likely outputs**  
- shared alternate behavior contract
- reciprocity tests
- consistent `x-default` policy

**Execution notes**  
- Keep `src/i18n/metadata.ts` as the canonical entrypoint unless there is a strong reason to split responsibilities.
- Update sitemap alternate generation to match page-level behavior exactly.

#### Ticket 06

**Build order step**  
4

**Why here**  
Once URL ownership and alternates are stable, sitemap and robots behavior can be made production-safe and testable without rework.

**Estimated effort**  
`M`

**Likely outputs**  
- synchronized robots and sitemap exclusion logic
- production-safe preview behavior
- stronger validator coverage

**Execution notes**  
- Reuse `src/lib/seo/sitemap/config.ts` as the central policy layer.
- Extend `scripts/seo/validate-sitemaps.mjs` instead of creating a second validator.

### Phase 2 — Metadata and Publishing Contracts

#### Ticket 03

**Build order step**  
5

**Why here**  
Now that canonical/hreflang rules are defined, route-family metadata contracts can be standardized without guessing.

**Estimated effort**  
`L`

**Likely outputs**  
- shared metadata helpers
- cleanup of route-local metadata drift
- consistent calculator / guide metadata pattern

**Execution notes**  
- Split into subpasses:
  1. static public pages
  2. calculators
  3. guides/article pages
- Prefer helper composition over giant one-size-fits-all metadata builders.

#### Ticket 12

**Build order step**  
6

**Why here**  
CMS publishing validation should reflect the metadata policy after it has been formalized, not before.

**Estimated effort**  
`M`

**Likely outputs**  
- stricter guide publishing validation
- clearer guide editor SEO field expectations
- canonical override safety rules

**Execution notes**  
- Keep published/draft distinction explicit.
- Fail publishing for missing required fields instead of relying on editor convention.

### Phase 3 — Template Enhancements

#### Ticket 04

**Build order step**  
7

**Why here**  
Heading structure should be corrected before breadcrumbs and schema are widened, because those features will depend on predictable templates.

**Estimated effort**  
`S`

**Likely outputs**  
- heading rules per template family
- removal of duplicate-H1 risks
- optional tests on key templates

**Execution notes**  
- Start with guides and calculators.
- Audit reusable hero/section components rather than only leaf pages.

#### Ticket 11

**Build order step**  
8

**Why here**  
Internal-link cleanup benefits from the stabilized route and canonical policy from Phase 1 and should be done before breadcrumb and schema rollout.

**Estimated effort**  
`M`

**Likely outputs**  
- canonical internal-link helper
- updated related-link modules
- improved hub-and-spoke linking rules

**Execution notes**  
- Use `RelatedLinksSection` and guide link generation as the first integration points.
- Explicitly guard against links to blocked/private surfaces from public pages.

#### Ticket 07

**Build order step**  
9

**Why here**  
Breadcrumb UI depends on stable paths and link policy, and should land before breadcrumb schema is treated as fully complete.

**Estimated effort**  
`M`

**Likely outputs**  
- reusable breadcrumb component
- rollout across guides and other deep public templates

**Execution notes**  
- Start with guides because they already emit breadcrumb schema.
- Expand to science, pain, use-case, and calculator detail templates after the component contract is stable.

#### Ticket 08

**Build order step**  
10

**Why here**  
Structured-data normalization should follow the template and breadcrumb work so schema reflects the actual rendered experience.

**Estimated effort**  
`M`

**Likely outputs**  
- sitewide `Organization` and `WebSite`
- consistent page-level schema policy
- calculator application-schema normalization

**Execution notes**  
- Use `src/lib/seo/jsonLd.ts` as the single builder layer.
- Avoid emitting schema for content blocks that are not visibly present.

#### Ticket 10

**Build order step**  
11

**Why here**  
Image SEO policy should be applied after CMS field validation and template metadata rules exist, so it can be enforced cleanly.

**Estimated effort**  
`S`

**Likely outputs**  
- guide image alt contract
- OG image fallback rules
- public image rendering guidance

**Execution notes**  
- Pair this with guide editor UX if fields are missing today.
- Treat CLS prevention as part of the same ticket where feasible.

### Phase 4 — Performance and Release Validation

#### Ticket 09

**Build order step**  
12

**Why here**  
Core Web Vitals work should run after structural SEO changes are mostly stable, otherwise measurements will be invalidated by later template changes.

**Estimated effort**  
`L`

**Likely outputs**  
- template-level CWV baseline
- prioritized remediation list
- quick wins on LCP/CLS/INP

**Execution notes**  
- Measure homepage, one guide, and one calculator first.
- Separate “measurement only” from “fix implementation” if scheduling is tight.

#### Ticket 13

**Build order step**  
13

**Why last**  
The QA and release gate should encode the final policy and implementation behavior, not an intermediate state.

**Estimated effort**  
`S`

**Likely outputs**  
- documented SEO release checklist
- scripted validation procedure
- acceptance sign-off steps

**Execution notes**  
- Reuse existing package scripts:
  - `npm run seo:validate-sitemaps`
  - `npm run test:i18n`
  - targeted route/schema tests
- Add targeted SEO checks before relying on noisy repo-wide gates.

## Total Estimated Effort

### Minimum viable technical SEO foundation

Includes:
- Ticket 01
- Ticket 02
- Ticket 03
- Ticket 05
- Ticket 06
- Ticket 12
- Ticket 13

Estimated total:
- `7.5` to `11` working days

### Full implementation including template UX and performance

Includes all 13 tickets.

Estimated total:
- `12.5` to `19` working days

## Suggested Sprint Split

### Sprint A — Foundation and publishing safety

- Ticket 01
- Ticket 02
- Ticket 05
- Ticket 06
- Ticket 03
- Ticket 12

Goal:
- stable crawl/index policy
- stable canonical/hreflang behavior
- safe publishing model for guides

Estimated sprint load:
- `6.5` to `10` days

### Sprint B — Template rollout and release hardening

- Ticket 04
- Ticket 11
- Ticket 07
- Ticket 08
- Ticket 10
- Ticket 09
- Ticket 13

Goal:
- richer search presentation
- stronger internal linking and schema
- measurable performance and repeatable QA

Estimated sprint load:
- `6` to `9` days

## Critical Path

1. Ticket 01
2. Ticket 02
3. Ticket 05
4. Ticket 06
5. Ticket 03
6. Ticket 12
7. Ticket 13

If schedule is constrained, this is the shortest path that still materially improves technical SEO correctness.

## Recommended Implementation Sequence By Area

### Area 1 — Crawl/indexing policy

- Ticket 01
- Ticket 05
- Ticket 06

### Area 2 — URL/canonical cleanup

- Ticket 02
- Ticket 03

### Area 3 — Guide SEO platform

- Ticket 03
- Ticket 12
- Ticket 07
- Ticket 08
- Ticket 10

### Area 4 — Public template quality

- Ticket 04
- Ticket 11
- Ticket 09

### Area 5 — Release validation

- Ticket 13

## Risks During Execution

1. Route-policy decisions on Dutch alias pages may require product/SEO judgment, not just implementation.
2. Guide CMS validation may surface incomplete existing content that blocks publishing until backfilled.
3. Repo-wide unrelated lint/build failures may obscure SEO verification if the team expects one clean full-suite pass immediately.
4. Breadcrumb rollout can sprawl if too many template families are changed in one PR.

## Recommended PR Slicing

1. PR 1: route inventory + canonical/hreflang policy + tests
2. PR 2: sitemap/robots hardening
3. PR 3: metadata helper rollout
4. PR 4: guide CMS SEO validation
5. PR 5: headings + internal links + breadcrumbs
6. PR 6: structured data normalization
7. PR 7: image SEO + CWV fixes
8. PR 8: QA/release gate

## Definition Of Done

- canonical owner is explicit for every indexable route family
- EN/NL alternates are reciprocal and deterministic
- robots and sitemaps encode the same protected-route policy
- guide publishing blocks broken SEO states
- guides and calculators emit the intended schema
- release QA can detect the most likely SEO regressions before deploy
