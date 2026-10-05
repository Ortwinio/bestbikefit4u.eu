# S1 source frozen — 5 October

DONE S1 implementation. Catalog/Stripe API/webhook helpers are frozen. 209 focused tests (19 files), Convex tsc and whole-tree lint pass. Full-app typecheck has only the A-owned gift/page.tsx:44 expiresAt union error (see C-to-A-typecheck.md). A also has the legacy paid-entry gift-source normalization finding in C-to-A-legacy-gift-source.md.

Final cancellation contract: no reserveCancellation mutation or public quote. Authenticated billingContext exposes immutable paid invoice period/customer/subscription/payment/invoice references, surviving access expiry. API cancels renewal at provider first and calculates from confirmed actual end time, safely retrying refund. Initial-year cancellation remains end-of-period/no refund. Checkout/status contract unchanged.

Configure extra signed event invoice_payment.paid in the future enabled webhook subscription (README updated) so modern unexpanded invoice payments can link to refunds in either event order. No Convex Stripe API secret needed. No configuration changed now.

A may run combined build/crawl/email/sweep gates after B freeze. Notes audit/S1-notes.md, S1-api-notes.md, S1-webhook-notes.md, S1-catalog-notes.md; file list audit/files-S1.txt.
