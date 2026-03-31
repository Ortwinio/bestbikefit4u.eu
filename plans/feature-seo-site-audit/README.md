# SEO Site Audit Plan

## Goal

Run a structured SEO audit on the public website and turn the findings into an implementation-ready backlog.

## Scope

Included:
- public website pages under `src/app/(public)`
- sitemap index and child sitemap routes
- canonical and alternate locale metadata
- robots and indexability behavior
- structured metadata consistency
- preview-vs-production SEO behavior
- internal-linking and crawl-surface review for key acquisition pages

Excluded:
- dashboard pages behind auth
- admin pages
- PDF rendering quality except where it affects public SEO claims
- off-site SEO work like backlink strategy

## Existing SEO Foundation

Already present in the codebase:
- root metadata base in `src/app/layout.tsx`
- locale-aware canonical/alternate builder in `src/i18n/metadata.ts`
- sitemap routes in `src/app/sitemap*.xml/route.ts`
- XML rendering helpers in `src/lib/seo/sitemap/xml.ts`
- sitemap validation script in `scripts/seo/validate-sitemaps.mjs`
- broad page-level `generateMetadata` usage across public routes

## Approach

1. Audit the current SEO surface and classify pages by intent and indexability.
2. Validate technical SEO outputs: canonicals, alternates, robots, sitemap coverage, and preview handling.
3. Review content/metadata quality on high-value pages and identify gaps in titles, descriptions, OG copy, and internal links.
4. Produce an actionable remediation list with priorities, owners, and acceptance criteria.

## Deliverables

- current-state SEO inventory
- technical SEO findings with severity
- page-by-page priority backlog
- implementation roadmap for fixes
- validation checklist for release and regression testing

## Status

- `01-route-and-indexability-inventory.md` completed
- `02-technical-seo-validation.md` completed
- `03-content-and-metadata-review.md` completed
- `04-remediation-roadmap.md` completed
- implementation completed

## High-Level Findings Summary

1. Public route and metadata coverage are stronger than expected; every public page currently defines page-level metadata.
2. The most concrete technical issues are:
   - sitemap validation reliability, because the existing validator currently fails locally with `/sitemap.xml` returning `500`
   - preview sitemap endpoints, which can still look indexable because dotted routes bypass proxy noindex handling
3. The biggest SEO improvement opportunity is not missing metadata, but richer structured data and stronger internal linking on pain, guide, use-case, and pricing pages.
4. Programmatic tire-pressure pages deserve extra canonical/alternate hardening because they are the broadest long-tail SEO family and currently have `x-default` inconsistency.
5. `robots.txt` and sitemap validation blocklists should be brought back in sync with the real protected route set.

## Recommended Execution Order

1. Stop preview sitemap endpoints from appearing indexable.
2. Fix sitemap reliability and rerun the validator successfully.
3. Standardize canonical/alternate behavior on programmatic calculator routes.
4. Sync robots/validator blocklists with the actual protected route set.
5. Add FAQ and breadcrumb structured data to clustered content pages.
6. Improve hub-and-spoke internal linking for acquisition surfaces.
7. Tune titles and descriptions on the top conversion pages.

## Implementation Output

- [output-05-implementation-closeout.md](/Users/ortwinverreck/Developer/bestbikefit4u/plans/feature-seo-site-audit/output-05-implementation-closeout.md)

## Acceptance Criteria

- every indexable public route family is listed in the audit inventory
- sitemap coverage is compared against the actual public route set
- canonical and alternate rules are documented with clear pass/fail checks
- preview noindex behavior is explicitly checked
- the plan identifies concrete remediation work, not only observations
- the final backlog is prioritized into quick wins, medium changes, and structural work

## Success Criteria

- the team can execute the SEO work without re-discovering route/metadata behavior
- technical SEO regressions become testable with scripts or focused checks
- the audit separates real crawl/index issues from content-quality opportunities
- high-value marketing pages have explicit optimization recommendations

## Execution Steps

1. `01-route-and-indexability-inventory.md`
2. `02-technical-seo-validation.md`
3. `03-content-and-metadata-review.md`
4. `04-remediation-roadmap.md`
