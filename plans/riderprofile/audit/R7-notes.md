# R7 — dashboard prompts

Rider worktree only. Lead explicitly queued R7 after R5. No commit, deployment or database calls.

## Server policy

- Server-selected safe allowlist. No complaints, injuries, age or free-text health questions.
- Shared scorer supplies gains and freshness. Quick entries precede tape measurements; relevance
  multiplies gain by 1.5, at most two slots and one tape measurement. Recent means 30 days.
- Above 90% rider completeness, only genuine stale confirmations survive, including on an already
  open card after answering. Missing/future dates never masquerade as stale data.
- Auth-session identity is server-derived; no browser-provided login counter. One reserved card per
  login, maximum two slots, no replacement after answer/skip. Cross-login reservation waits 24 hours.
  Atomic Convex transactions serialize competing index reads/inserts.
- Per-field/bike skip is 14 days, third skip means profile-only. Not now hides seven days; retries
  do not extend that date. Queries are read-only. Reservation is an idempotent mutation.
- New profilePrompts/profilePromptCards rows contain keys/status/times, not measurement values.
  profilePromptActivity accepts only calculator keys and timestamps for actual advice views.
- Answers validate field/value/method/expected current value, enforce owner/session/card membership,
  recheck eligibility and preserve explicit conflicts without writes. Profile observations are saved
  atomically; a 20-minute FTP result is derived, never measured. Derived never replaces measured.
- Bike answers require ownership and a real measurement point for saddle height; estimates clear
  old measured metadata. Type confirmations call the existing bike update mutation in a subtransaction
  to retain public snapshot and system-default bike-profile side effects.
- Account deletion removes prompt history/cards/activity together with profile observations.

## Integration

UI uses the contract in messages/B-R7-contract.md. A owns the R6 dashboard hero; B's prompt card
mounts under the header without changing shared rings/sidebar or erasing existing fit/report scores.
A has been asked for the R9 contract required by R8; that implementation is not owned by B.
C owns the shared tooltip registry; R7's covered controls were added to the coordination request.

## Gates

- Full Convex + prompt policy + dashboard prompt tests: 80 files, 688 tests pass.
- `npm run typecheck -- --incremental false`: passes after C's R1 integration landed.
- `npm run lint`: all stages pass, including 54 tooltip-control files, 254 contrast checks,
  token-only CSS modules, runtime boundaries and image weights.
- Actual dashboard and account shell, with offline fake query/mutation data: 16 NL/EN captures at
  1440/390, open/answered/hidden/unknown-FTP, plus four dark answered captures (20 total).
  No runtime errors or horizontal overflow. Final UI/dashboard regression: 47 tests pass.
  See `renders/R7-dashboard-results.json`; parent reviewed desktop open and mobile answered.
  These are render/interaction fixtures, not a production Convex or authenticated end-to-end run.
- Sidecar evidence: R7-policy-notes.md, R7-prompts-tests-notes.md and R7-ui-notes.md.

R6's large dashboard hero became available from A after the original gate. B mounted the real
DashboardProfileStrength immediately before prompts and added a locale/order regression test;
the component and sidebar rings remain A-owned. No duplicate score implementation or board
example counts were introduced. R7 stores actual observations; it never
claims that existing advice has already recalculated. Lead revised B's next queue to R13, R11, R8;
A publishes the R9 contract before R8.
