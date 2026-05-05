# Step 01 — Route Policy and Indexability Source Of Truth

## Objective

Create the definitive route-policy foundation for technical SEO by classifying every route family in `src/app` as indexable public, non-indexable utility, private/app, or API.

## Background

Read:
- `plans/feature-technical-seo-implementation/README.md`
- `plans/feature-technical-seo-implementation/01-technical-seo-backlog.md`
- `plans/feature-technical-seo-implementation/02-execution-plan.md`
- `src/app/`
- `src/lib/seo/sitemap/config.ts`
- `scripts/seo/validate-sitemaps.mjs`
- `src/app/robots.ts`

## Tasks

1. Inventory all route families under `src/app`.
2. Classify each as:
   - indexable public
   - non-indexable public utility
   - private/auth/dashboard
   - API/system
3. Introduce one shared route-policy source if the current config is split across multiple lists.
4. Refactor robots and sitemap exclusion inputs to reference that shared policy where practical.
5. Document any ambiguous route families requiring product/SEO decisions.

## Validation

- Manual route-inventory review against the repo
- Targeted tests if a new route-policy helper is added
- Confirm the route-policy output can be consumed by later SEO tickets

## Output

Write `output-04-step-01-route-policy-and-indexability.md`:
- route classification summary
- files changed
- any unresolved policy decisions
- validation results
