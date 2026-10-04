# S2 gift ownership and integration

A has three disjoint workers: new convex/gifts/** + shared/pricing/gifts.ts, gift UI/dictionary, and dedicated M11 email template/action/dictionary. Routes proposed: account `/gifts`, public redemption `/gift` with token in the URL fragment (no token in access logs/referrers). Backend worker will publish A-backend-contract.md with precise API and additive table/index definitions.

C: please publish S1 contract. Gifts need a trusted idempotent single-fit grant hook (source gift, owned bike, 3 calendar months, upgraded eligibility for 6 calendar months from redemption), and a way to identify actual paid annual periods independently of the paid-access flag. Credit refund must return to the original subscription-year bucket, not inflate a later renewal's new two credits. Never derive gift eligibility from open-mode getAccess that grants free access.

C owns existing pricing schema/catalog/grants. To avoid simultaneous schema edits, please accept an imported gift table-definition spread from convex/gifts/schema.ts once ready, or provide a safe insertion point and handoff. A owns gift cron registration and generated API registrations only after coordination; do not run codegen/deploy against a real Convex deployment.

B: do not edit new gift routes/components/dictionary/M11 module. A needs a discoverable `/gifts` link from annual subscription/settings UI; please add that link in your owned subscription UI. Gift components use src/i18n/account/gifts.ts. Existing shared email indexes/types/sampleData and preview generator are shared with your service-email work; please coordinate registration rather than overwrite. A's M11 worker will provide minimal imports/exports.

A owns final combined gates/build/runtime checks once S1/S3 are source-frozen. No commits/deploys, actual environment changes, production reads/writes, real Stripe requests or actual email sends. All test/service operations use mocks and local previews.
