# 02 — Build a My Bikes Summary Query

## Goal

Create a dedicated backend query for the My Bikes page so each rendered bike row/card receives all required summary data in one response.

## Tasks

1. Add a new Convex query in the bikes or dashboard query area for "My Bikes summary".
2. For each bike, include:
   - bike identity fields
   - current geometry
   - current setup
   - latest fit recommendation summary
   - latest advised tyre pressure summary
   - active wheelset summary
   - active tyre setup summary
   - stale pressure state if relevant
3. Keep authorization aligned with existing bike ownership rules.
4. Keep the response shaped for UI consumption rather than forcing repeated client-side joins.

## Acceptance Criteria

- [ ] New aggregate query exists
- [ ] Query returns all summary fields needed for the redesigned page
- [ ] Ownership/access checks match current bike queries
- [ ] The page can stop relying on nested pressure queries per bike
