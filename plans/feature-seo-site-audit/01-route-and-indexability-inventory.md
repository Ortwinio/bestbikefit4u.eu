# Step 01: Route And Indexability Inventory

## Objective

Create the source-of-truth inventory of public routes that matter for SEO and classify which ones should be indexable.

## Tasks

1. Enumerate public route families from `src/app/(public)`.
2. Group routes by type:
   - homepage and core marketing pages
   - calculators
   - tire-pressure landing pages
   - guides
   - use cases
   - pain pages
   - legal/support pages
3. Mark each route family as:
   - indexable
   - indexable with caution
   - noindex / excluded
4. Note whether each route has:
   - static params
   - `generateMetadata`
   - sitemap inclusion
   - internal entry points

## Output

Create `output-01-route-inventory.md` with:
- route family
- representative paths
- intent
- indexability decision
- current metadata status
- sitemap status
- notable risks

## Acceptance Checks

- no public route family is omitted
- dynamic slug families are represented explicitly
- legal/auth/dashboard/admin routes are clearly separated from crawlable public routes

