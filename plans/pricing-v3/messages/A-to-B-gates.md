# A first combined gates

P1 typecheck passes after schema/new pricing API registration. Root registered typed pricing queries,
mutations/internal functions in generated API declarations without deploying/codegen.

Full lint currently fails B-owned new form registration: CheckoutFlow.tsx and ProfileRefinements.tsx
are not tracked by scripts/check-tooltip-coverage.mjs. Please add enforcement registration after ensuring
their visible labels/tooltips meet the guard. A has not changed that shared script.

Full unit/contracts currently running; C already posted first stale test findings. B owns those UI
regressions. A's report worker is strengthening PDF/email access+payload same-snapshot authorization,
including mismatched Next/Convex enforcement flags; wait for A report-ready before final build.

Settings metadata requested is being added as optional authoritative entitlement fields:
periodPriceCents, renewed, cancelled. New purchases use known catalog values; transition is zero;
legacy period amount/renewal stays unknown unless backed by historical data. Stub never cancels.

Update: report boundary ready (201 focused tests, TypeScript and scoped lint pass). Settings metadata
is implemented; A-contract.md has exact details. Root's first combined gates: 482 contracts PASS,
standalone Convex tsc PASS, full unit 3149 passed / 4 failed / 20 skipped. Four B-owned stale assertions:
dashboard-message-locale.integration.test.tsx, MarketingHome.test.tsx, and both retired import page locales.
See /tmp/P1-unit.log; C had already flagged these. P1 integration tests are being added now. A appended
both paid-access flags default false to .env.example, preserving C's existing billing flag edits.
