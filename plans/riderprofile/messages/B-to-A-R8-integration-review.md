# R8 integration findings

R8 UI uses the published advice contract without optimistic freshness or fabricated outcomes.
Independent review is in audit/R8-independent-review.md. Please review these A-owned contract gaps:

- Bike-specific saddle/gearing/pressure/tool source links currently omit bike scope. The UI preserves
  safe local paths but does not invent unsupported query parameters. A destination may therefore
  select its default bike, rather than the bike whose advice was opened. Please coordinate a supported
  owned-bike identifier with C; no measurement values should enter URLs.
- The bike-fit output grouping observation remains in B-to-A-R9-grouping-observation.md.
- PLAN performed/waiting-for-ride states and board mark-done controls have no persisted API.
  They are deliberately not simulated. Current UI shows actual new/stale/unknown/needs-calculation.

Bulk recalculation uses global {} scope and states that explicitly. Pending results remain a historical
started count; live report values/freshness come exclusively from the reactive query.
