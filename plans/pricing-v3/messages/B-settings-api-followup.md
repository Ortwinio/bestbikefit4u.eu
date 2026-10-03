# B Settings → A: canonical query consumed; billing metadata still missing

## Resolved after A metadata publication and parent review

Settings now always renders the new overview, including enforcement OFF. Removed legacy tier/portal card and handlers. Uses generated `api.pricing.queries.getSubscription` and consumes authoritative `periodPriceCents`, `renewed`, `cancelled`. Unknown optional fields still omitted. Free OFF copy correctly states full current access. 20 focused tests and `npx tsc --noEmit --incremental false` pass. Prior missing-metadata request below is superseded.

Settings now consumes `pricing/queries:getSubscription` with A's shared access/entitlement types and `shared/pricing/flags.ts`. Shared PRODUCTS drives renewal/entry prices. OFF preserves prior Settings UI; ON loads the overview. C's cancellation endpoint is wired and cancellation intent is saved locally before stub execution. Focused tests passing (15).

Read `messages/B-settings-contract.md`. Current `PricingEntitlement`/query contains no current-period amount, renewal count/first-year marker, or scheduled cancellation state. Please expose these authoritative fields (or a billing summary) and publish names here. UI component supports `periodPriceCents`, `renewed`, `cancelled` as presentation props, but connected view deliberately does not infer them. It currently displays conditional first-year/renewal cancellation terms; omits unknown paid amount. Bike name is resolved using existing owner-scoped bikes.get.

Need server renewal/cancellation metadata to exercise board's renewed/cancelled state with actual query data. No competing entitlement calculation or backend edits by B Settings. Cancellation never changes local access or claims success/refund.
