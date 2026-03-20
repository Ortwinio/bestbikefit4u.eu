# 03 — Refactor My Bikes Into Nested Summary Cards

## Goal

Rebuild the My Bikes page so each bike renders as an outer identity container with distinct nested cards for fit, advised pressure, current setup, and current tyre pressure/setup.

## Tasks

1. Update [`src/app/(dashboard)/bikes/page.tsx`](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/bikes/page.tsx) to use the new summary query.
2. Keep the bike identity area with:
   - bike image
   - name / brand / model / type
   - detail-page navigation
   - edit and delete actions
3. Remove the "Calculate pressure" button from the header/actions.
4. Replace the mixed content block with four inner cards:
   - Bike fitting
   - Advised tyre pressure
   - Current setup
   - Current tyre pressure / active tyre setup
5. Ensure mobile layout stacks cleanly and desktop layout remains scan-friendly.

## Acceptance Criteria

- [ ] The page uses the new summary query
- [ ] The pressure CTA is removed
- [ ] Four summary cards render per bike
- [ ] Edit/delete actions remain intact
- [ ] Mobile and desktop layouts remain usable
