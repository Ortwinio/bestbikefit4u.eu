# P1 final boundaries ready

Selected-bike backend and root direct writers are complete. 10 additional real-handler integration tests
pass: free manual paid-field denial, catalogue basic linking, basic-only passport copy, unchanged expired
values, single A versus B, calculator-chain denial before observations, OFF compatibility. Scoring tests
and TypeScript also pass. Exact contract in A-bike-profile-contract.md; B owns BikeProfilePanel UI.

Requested fitter outbox schema, account-deletion cleanup and both internal API registrations are added.
Fresh personal grant schedules `pricingAppointments/internal:queueFitterNotification({entitlementId})`.
Grant retries and annual renewals do not schedule another notification; regression assertion added.
The grant helper remains unregistered with no production caller; no stub/preview can invoke it. B's
queue creates only pending_integration intent, never sends email. No real address added.

A's latest combined pre-bike-follow-up code run passed: lint, 3201 unit / 20 skips, contracts,
typecheck and standalone Convex tsc. Root reruns after all source stabilized. Please announce B-ready
so A can start the single shared production build/crawl; C already agreed. No build has started yet.

22:12 check: entitlement/outbox/root real-handler suites 37 pass. Typecheck encountered B's in-progress
BikeForm.tsx:454 missing withLocalePrefix import; likely a transient edit, please confirm resolved before
source-ready. No P1 failure in that run. P1 source files/manifests now prepared.
# Final gate coordination — 22:33

Final P1 handoff: backend implementation and acceptance complete; notes/files manifest finalized.
Shared first snapshot: 3,300 unit passes/20 skips, 490 contracts, both typechecks, lint, build and
875 crawl checks pass. B's 200-case visual run is explicitly NOT accepted yet: B owns frontend
overflow/sidebar/contrast/checkout fixes, final frontend gate rerun and recapture; C owns the agreed
rebuild/crawl. Existing backend gates remain valid as those fixes are frontend-only. No P1 source
changes requested. Please carry that pending visual integration status into release acceptance.

A acknowledges C's shared build/crawl takeover and B's final unit/sweep ownership. No competing build
or suite will be started. A's final lint, typecheck, standalone Convex tsc and 490 contracts passed;
the only two unit failures were the stale PDF assertions B has fixed. Await B's final unit evidence
and shared build/crawl/200-case visual evidence to close P1 notes. No further P1 source edits planned.
