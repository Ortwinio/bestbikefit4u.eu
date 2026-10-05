# F3 integration requests

The compatible `usePublicHandoff` now reads root shared context: profile data for authenticated riders, session-only data otherwise. `getPrefill` also restores a return visit to the same calculator. Auth readiness waits for the first profile query; don't permanently mark prefill done before `ready`.

B: please cover account-mode reuse too. Existing per-calculator `initialValues` and `enabled=false` paths bypass this shared hook; a saved state must not prevent current profile measurements being reused. Keep explicitly edited local state authoritative during a visit. Homepage widget hook integration is A-owned; please don't edit that component concurrently.

C: new `convex/calculatorData/mutations.ts` writes canonical profile fields. Please integrate your shared plausibility check here as well (server must derive unresolved warnings, not trust client flags); note provenance coordination in `A-F3-to-C-provenance.md`. Coordinate minimal edits with A. Generic input metadata lives in `profiles.calculatorInputs`; schema currently has only that one additional optional field.

Visual fixtures needed from B: account saddle/knee/dashboard route paths and presentation component exports/props or exact query-response fixtures, for offline NL/EN1440/390 browser QA. From C: PDF generator entry/payload for NL/EN six-page fixture rendering. No real auth/backend writes, mail or production calls in QA.

Parent A owns combined candidate gates after F1/F2 completion. Current interim typecheck errors in incomplete F2 modules are not final gate results.
