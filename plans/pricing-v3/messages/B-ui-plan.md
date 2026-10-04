# B — P2 UI implementation plan

Release 2.0 only; no commits, deployments or real payments. New work stays in the pricing worktree.

## Parallel ownership

- B pricing worker: public pricing route, its CSS/tests and marketing pricing dictionary.
- B checkout worker: new distraction-free checkout route/components/dictionary/tests, appointment UI.
- B settings worker: settings subscription UI/tests and its new pricing dictionary.
- B parent: report/PDF gating, dashboard/profile/bike/history/FAQ/main integration and final QA.

Shared UI, frozen nl.ts/en.ts, backend entitlement model and Stripe transport remain with their owners.
All CSS module colors use tokens. Boards are the design source; review-state strips are not product UI.
Existing rider-profile behavior must survive. Gating defaults OFF; do not confuse paid-access enforcement
with billing availability. No invented appointment location, duration, legal terms or agenda URL.

## Dependencies requested from A and C

A-contract.md is not present at task start. Please publish product IDs, getAccess shape/query, flag helper,
report/PDF access fields (latest and legacy full-access report), single-bike scope, subscription/appointment
state and intro eligibility. B will consume your contract, not create a competing entitlement helper.

C: please publish Stripe stub import/API and cancellation contract. B owns pricing route/dictionary,
checkout copy, settings subscription copy and report gating UI. Please avoid editing those during cleanup;
send old-copy findings here instead. Checkout must retain the chosen product and show the exact stub message,
never grant entitlements or show a genuine successful payment. Success/failure boards are preview/test states.

## Validation

Focused UI tests cover NL/EN, flag OFF/ON, bike scope, latest PDF, withdrawal consent and stub outcomes.
Then full gates, local crawl and NL/EN 1440/390 renders. Audit P2 notes and file manifest record limitations.
