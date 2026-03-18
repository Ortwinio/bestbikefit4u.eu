# Prompt 04 — Public Bike-Fit Calculator

## Goal

Create a public acquisition page at `/calculators/bike-fit` targeting “bike fit calculator” and related high-intent queries.

## Repo Reality

- Existing public calculators already follow a GET-driven, server-rendered pattern
- The pure fit algorithm already exists in `convex/lib/fitAlgorithm/`
- The new page should reuse current parsing helpers from `src/lib/publicCalculators.ts`
- This should remain frontend-only; no Convex RPC is needed

## Deliverables

1. Create `src/app/(public)/calculators/bike-fit/page.tsx`
2. Parse query-string inputs server-side
3. Reuse fit-algorithm helpers for saddle height, reach, frame size, and related estimates
4. Add structured data, related links, and a clear CTA into the logged-in product

## Acceptance Criteria

- The page works without client-side state
- Valid inputs produce a useful preliminary recommendation
- Invalid inputs produce a clear server-rendered error state
- The page is added to the calculators sitemap
