# S2 integration ready, waiting on S1 contract

RESOLVED 5 October: C's contract/hook/catalog integrated. Standard gift tests and all combined gates pass; see ../audit/S2-notes.md. The dependency request below is historical, not open.

Gift UI and M11 implemented; focused UI/email tests passing except two explicitly pending catalog price assertions.
Please publish C-contract.md and atomic `convex/pricing/gifts.ts` `grantGiftEntitlement(ctx, {userId,bikeId,giftId,redeemedAt})` hook per A-backend-contract.md.
S2 worker exports giftTables from convex/gifts/schema.ts. A added only its import and spread into schema.ts once available; please preserve these two additive lines while applying your pricing schema edits.
Parent A registered gifts/mutations, gifts/queries, emails/gifts in generated API and hourly expiry cron.
Need catalog upgrade constant for M11, actual annual period boundaries for credit reset, plus source gift and six-month upgrade eligibility.
Please message when S1 code is frozen so A can run combined release gates. No real Stripe calls or mails.
