# Plan: Improve My Bikes UX

## Goal

Upgrade the UX of the My Bikes page so each bike clearly shows:

- bike fitting status in its own card
- advised tyre pressure in its own card
- current bike setup in its own card with a short description of the selected setup
- current tyre pressure / tyre setup in its own card with a short description of what is active

The current "Calculate pressure" button on the My Bikes page should be removed.

## Current State

The page at [`src/app/(dashboard)/bikes/page.tsx`](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/bikes/page.tsx) currently:

- renders one large bike card per bike
- mixes bike identity, geometry, current setup, and tyre pressure into one content area
- uses a nested [`BikePressureSummary`](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/pressure/BikePressureSummary.tsx) block
- shows a "Calculate pressure" action in the bike card header
- does not surface bike-fitting information as its own dedicated summary card
- does not explain the active setup / active tyre pressure selection in brief user-facing copy

The current pressure summary also performs per-bike nested queries, which is acceptable for a small list but is not ideal as the card design gets richer.

## Desired UX

For each saved bike on the My Bikes page:

1. Show bike identity and actions at the top
2. Show four distinct content cards beneath it:
   - Bike fitting
   - Advised tyre pressure
   - Current setup
   - Current tyre pressure / active tyre setup
3. Use short descriptive copy so the rider can understand what setup is active without opening the detail page
4. Remove the "Calculate pressure" button from this page
5. Keep edit and delete actions available

## Scope

In scope:

- redesigning the My Bikes page card layout
- introducing a page-specific bike summary data shape if needed
- surfacing latest fit recommendation status per bike
- surfacing latest advised tyre pressure per bike
- surfacing active wheelset / active tyre setup / latest current pressure in a dedicated card
- adding new i18n copy for the new card titles and brief descriptions

Out of scope:

- redesigning the bike detail page
- changing the pressure calculation wizard flow
- changing fit algorithms or pressure algorithms
- adding new backend entities beyond summary/query composition

## Data and UX Constraints

- Current bike list data comes from [`convex/bikes/queries.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/convex/bikes/queries.ts) via `listByUser`
- Pressure data currently comes from per-bike queries in [`BikePressureSummary.tsx`](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/features/pressure/BikePressureSummary.tsx)
- Fit recommendation data currently comes from [`convex/recommendations/queries.ts`](/Users/ortwinverreck/Developer/bestbikefit4u/convex/recommendations/queries.ts)
- Active wheelset / tyre setup data currently exists on the bike detail page in [`src/app/(dashboard)/bikes/[bikeId]/page.tsx`](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/bikes/[bikeId]/page.tsx)

Because the page will now display more summary state per bike, the preferred implementation is to introduce a dedicated aggregate query for the My Bikes page instead of growing the current per-bike nested query pattern.

## Recommended Approach

### 1. Create a Bikes Page Summary Query

Add a new Convex query that returns, per bike:

- core bike identity data
- current geometry summary
- current setup summary
- latest fit recommendation summary
- latest advised pressure summary
- active wheelset summary
- active tyre setup summary
- stale pressure state if relevant

This prevents the UI from doing multiple nested queries per rendered bike card.

### 2. Split Each Bike Into Nested Summary Cards

Keep one outer bike container per bike, but inside it render separate summary cards:

- Bike fit card
- Advised pressure card
- Current setup card
- Current tyre pressure card

This should make the page easier to scan and reduce the current mixed-information block.

### 3. Add Brief Explanatory Copy

Each of the two "current" cards should include a short summary sentence such as:

- what kind of bike setup is currently stored
- which wheelset / tyre setup is currently active
- whether the visible tyre pressure is a saved current pressure or a latest recommendation snapshot

### 4. Remove the Pressure CTA From This Page

Remove the "Calculate pressure" button from the bike card header and from the current pressure summary block on this page. The page should remain informational-first.

### 5. Preserve Existing Safe Actions

Keep:

- add bike
- edit bike
- delete bike
- bike detail navigation from the bike identity area

## Acceptance Criteria

- [ ] The My Bikes page no longer shows a "Calculate pressure" button
- [ ] Each bike shows a separate bike fitting card
- [ ] Each bike shows a separate advised tyre pressure card
- [ ] Each bike shows a separate current setup card with brief descriptive text
- [ ] Each bike shows a separate current tyre pressure / active tyre setup card with brief descriptive text
- [ ] The page uses a dedicated summary data source or another deliberate strategy that avoids uncontrolled per-bike query sprawl
- [ ] English and Dutch copy is added for all new labels and descriptions
- [ ] The page remains usable on mobile and desktop
- [ ] `npm run typecheck` passes
- [ ] Relevant UI tests or page-level checks are updated

## Prompts

| # | File | Description |
|---|------|-------------|
| 01 | `01-audit-data-and-layout.md` | Audit current My Bikes data shape, current cards, and desired UX gaps |
| 02 | `02-build-summary-query.md` | Add an aggregate summary query for My Bikes page data |
| 03 | `03-refactor-bike-cards.md` | Rebuild the My Bikes page into nested per-bike summary cards |
| 04 | `04-add-copy-and-descriptions.md` | Add i18n copy and brief descriptive summaries for setup and pressure |
| 05 | `05-validate-and-polish.md` | Validate layout, mobile UX, and remove obsolete pressure CTA paths |
