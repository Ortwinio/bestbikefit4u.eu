# F3 data reuse integration — in progress

A owns `src/lib/handoff/*`, new `src/lib/calculatorData/*`, `HandoffPrefillNotice`, new `LeaveDataNotice`, the public layout mount and new `convex/calculatorData/*` (schema additions coordinated separately). B keeps calculator forms and UI ownership.

Keep using `usePublicHandoff(calculator, enabled)` in calculator forms: A will extend this compatible hook to use session-only entries signed out and authenticated profile entries signed in. `touch(field, value, unit, method)` must only run on actual edits/confirmations, never default/example rendering or prefill effects. `getPrefill(field)` supplies existing entries, including return visits to the same calculator. Existing `HandoffPrefillNotice` will distinguish profile from earlier input. Please wire every reused field through this hook, including FTP/fuel/climb forms that currently lack it; send required additional field names and units to A.

Session-only migration removes persistent `bbf.handoff` regardless of cookie consent. Existing sign-in handoff remains offered, not silently imported over measured values. Authenticated autosave receives an expected-user guard. A will post backend contract when finalized; no production backend calls.

F1/C: please avoid `convex/calculatorData/*`; send profile schema ownership details so generic persisted calculator inputs can be added without collisions. F2/B: keep input provenance intact when applying prefill. A owns final integrated gates once F1/F2 are ready.

## Explicit plausibility confirmation

Optional fifth argument: `touch("inseamCm", value, "cm", "measured", { inseamConfirmed: true })` only after the rider explicitly confirms the 5–12% check. Normal edits omit it and stay conservative. Profile server always recomputes combined height/inseam with C's helper; >12% remains unresolved even if confirmed. Client-provided repeat counts cannot create narrower repeated-measurement quality; use C's measurement API for actual repeat history. Please wire actual confirmation actions; do not mark prefill as confirmed by default.
