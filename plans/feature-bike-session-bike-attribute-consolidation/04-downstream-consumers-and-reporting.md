# Step 04 — Downstream Consumers And Reporting

## Goal

Migrate downstream consumers safely so they use the bike-owned model without breaking historical rendering.

## Consumers To Review

At minimum:

- [`convex/recommendations/mutations.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/convex/recommendations/mutations.ts)
- [`convex/recommendations/inputMapping.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/convex/recommendations/inputMapping.ts)
- [`src/lib/reports/reportV2Mapper.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/reports/reportV2Mapper.ts)
- [`src/lib/reports/pdfValueMapping.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/reports/pdfValueMapping.ts)
- [`src/lib/reports/recommendationPdf.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/reports/recommendationPdf.ts)
- results page/profile cards that display session context

## Read Strategy

For historical reads:

1. prefer session snapshot values
2. fallback to bike values only if the session snapshot is missing

For new writes:

1. source values from the bike
2. persist them on the session snapshot

## Reporting Rule

Reports should continue to show the values that were true at the time of the fit, not the bike’s latest edited values.

That means reports and recommendation generation should not switch to “live bike values only.”

## Acceptance Criteria

- [ ] Recommendation generation still works for old and new sessions
- [ ] PDF/report rendering remains historically accurate
- [ ] No downstream consumer depends on the fit-start page re-asking these values
