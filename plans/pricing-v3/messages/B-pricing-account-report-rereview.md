# Pricing reviewer → parent: PDF label / AccountPlan bounded review PASS

Read-only implementation review; no source/test/harness edits. Pricing remains frozen. No new feature or additional full gate requested.

## AccountPlan product identity with enforcement OFF

No issue found in the CURRENT API chain. AccountPlan queries `api.pricing.queries.getAccess` with `{}` and labels `copy.products[access.productId]`, independently of fullReport/fullProfile/billing flags and legacy user.tier. Loading/null user or access shows an ellipsis instead of inventing a free plan.

Critical distinction verified: `convex/pricing/access.ts:getUserAccess` DOES have an OFF fast path that calls getAccess(null) and would return productId=free when readEntitlementsWhenOpen is omitted. But the public query `convex/pricing/queries.ts:getAccess` explicitly passes fourth argument **true**; getSubscription does too. Therefore AccountPlan bypasses that fast path and reads owner entitlements even with enforcement OFF. Do not remove that argument or substitute the unchecked internal fast path for product labels.

`shared/pricing/access.ts:getAccess` derives productId from started, active, unexpired entitlements independently of enforcement; OFF relaxes fullProfile/fullReport/maxBikes only. Active single remains single with `{}` even though fullReport is open; active annual/entry/personal retain their real IDs. Expired/revoked/future grants do not label paid. Bike ownership filtering remains in the backend helper. Old tier alone cannot invent a product.

NL/EN mappings cover free, single, annual, annual_entry, annual_personal; localized settings link and session singular/plural remain intact. AccountPlan tests use the real shared helper for all five products with OFF and ON, plus null/loading and stale Pro/Premium scenarios. This is source-traced public-query verification, not a live backend call.

## PDF label / access semantics

`results/page.tsx` now leaves the disabled button labeled with localized `messages.results.actions.downloadPdf` (NL “PDF downloaden”, EN “Download PDF”). The longer latest-only explanation moves into a `w-full` wrapping paragraph connected with aria-describedby. Button/action group allow wrapping (`whitespace-normal`, `min-w-0`, `flex-wrap`); no unbounded latest-only sentence remains inside the button. No source accessibility regression identified from the label change.

Permissions unchanged: canDownloadPdf still gates the enabled handler; handleDownloadPdf itself also returns when denied. Report-embedded access remains preferred over the supplementary query. Allowed free/latest exports retain the localized core-values label; full/legacy-full exports keep the ordinary PDF label. Denied older free export remains disabled with latest-only explanation. Enforcement-OFF full-export behavior is preserved unless server access explicitly says enforcement is ON. These checks do not turn “all features open” into a paid plan label.

Focused verification only: AccountPlan.test.tsx + results/page.test.tsx — **2 files / 47 tests PASS**, including NL/EN compact disabled-PDF explanation and OFF/ON product identity. No full gates repeated. Corrected 390px layout still requires the already-planned final production-CSS rerun; current review is not replacement pixel evidence.

No new blocker from this bounded review. Final pricing eight-PNG hash/provenance comparison remains pending the coordinated final build/capture.
