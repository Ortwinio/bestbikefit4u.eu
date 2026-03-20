# 01 — Audit My Bikes Data and Layout

## Goal

Map the current My Bikes page structure, data dependencies, and UX shortcomings before changing the layout.

## Tasks

1. Review [`src/app/(dashboard)/bikes/page.tsx`](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/bikes/page.tsx) and identify:
   - the current outer bike card structure
   - which sections are mixed together today
   - where the "Calculate pressure" action currently appears
2. Review [`BikePressureSummary.tsx`](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/pressure/BikePressureSummary.tsx) and document which queries it issues.
3. Review the bike detail page and note how it derives:
   - active wheelset
   - active tyre setup
   - latest fit recommendation
4. Produce a short implementation note describing:
   - what can be reused
   - what should move to a page summary query
   - which data points are needed for the four target cards

## Acceptance Criteria

- [ ] Current data/query flow is documented
- [ ] Target four-card bike summary structure is defined
- [ ] Removal points for the pressure CTA are identified
