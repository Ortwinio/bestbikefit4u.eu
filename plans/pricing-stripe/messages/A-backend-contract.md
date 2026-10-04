# S2 backend contract

Gift credit period = real paid active annual entitlement ID + startsAt. Exactly two outstanding/redeemed gifts per period. Expired/cancelled gifts do not consume credits; expiry from an older period never increases this period's allowance. Open-access feature flags do not grant credits. Refund/revocation of the originating entitlement invalidates pending gifts.

Parent: add `pricingGifts` schema (Convex validators):

```ts
pricingGifts: defineTable({
  giverId: v.id("users"),
  entitlementId: v.id("pricingEntitlements"),
  periodStartsAt: v.number(),
  periodExpiresAt: v.number(),
  recipientEmail: v.optional(v.string()),
  message: v.optional(v.string()),
  locale: v.union(v.literal("nl"), v.literal("en")),
  tokenHash: v.string(),
  requestKey: v.string(),
  status: v.union(v.literal("pending"), v.literal("redeemed"), v.literal("expired"), v.literal("cancelled")),
  createdAt: v.number(),
  expiresAt: v.number(),
  redeemedAt: v.optional(v.number()),
  emailSentAt: v.optional(v.number()),
  recipientId: v.optional(v.id("users")),
  bikeId: v.optional(v.id("bikes")),
}).index("by_token_hash", ["tokenHash"])
  .index("by_giver", ["giverId"])
  .index("by_giver_request", ["giverId", "requestKey"])
  .index("by_entitlement_period", ["entitlementId", "periodStartsAt"])
  .index("by_status_expiry", ["status", "expiresAt"])
```

API proposal:
- `api.gifts.queries.getOverview({})`: authenticated, `{ eligible, availableCredits, periodExpiresAt?, gifts: [{id,status,createdAt,expiresAt}] }`. No email, message, recipient ID, bike ID or profile returned.
- `api.gifts.mutations.give({recipientEmail,message?,locale,requestKey})`: mutation, `{ giftId, expiresAt }`; idempotent per user/requestKey. Token generated server-side, only hashed in gift table. Schedule `internal.emails.gifts.sendGiftMeasurement({giftId, token})` in the same transaction. Email worker checks pending/expiry before sending, never returns recipient data. Parent owns worker.
- `api.gifts.queries.preview({token})`: `{status:"valid"|"expiring"|"expired"|"redeemed"|"invalid",expiresAt?}`. No identities or messages.
- `api.gifts.mutations.redeem({token,bikeId})`: authenticated verified matching recipient email and owned bike; returns `{status:"redeemed"|"expired"|"invalid"}`; successful same-recipient/same-bike replay returns redeemed. Other replays do not disclose identity.
- `internal.gifts.mutations.expire({})`: batches 100 pending expired gifts, removes recipientEmail/message, marks expired. Parent register hourly cron.
- `internal.gifts.mutations.expireGift({giftId})`: scheduled at each gift's exact expiry for prompt personal-data removal; the hourly batch is a fallback. Scheduler execution latency still applies.
- `internal.gifts.queries.getGiftEmailContext({giftId,token})`: validates hash, unsent pending gift, deadline and source before returning email/message/locale/expiresAt to worker only.
- `internal.gifts.mutations.markGiftEmailSent({giftId})`: idempotent emailSentAt marking. Overview maps delivered pending gifts to `sent` and source-revoked pending gifts to `cancelled`.

C helper required: `grantGiftEntitlement(ctx, {userId,bikeId,giftId,redeemedAt})`, same transaction, idempotent grant key `gift:${giftId}`, single entitlement 3 calendar months, six-month upgrade eligibility. Await C's exact module/export. Refunds checked against source entitlement both on give and redeem; expired annual periods may still honor gifts issued during their validity unless revoked.

Rate limits: maximum 5 created gifts/day/giver; 2 outstanding/redeemed gifts/period; mandatory random UUID requestKey, maximum 500-character message. Reject normalized self-email. Random 256-bit token, SHA-256 hash, calendar one-month expiry.

## Validation

SUPERSEDED 5 October: C hook integrated. Standard Vitest now passes 20 policy/handler/real-hook integration tests without an alias, including three-month access and six-month upgrade boundaries. Full combined gates pass; see ../audit/S2-notes.md. The initial validation limitations below record the earlier blocked state only.

- 16 focused policy/handler tests passed using `/private/tmp/bfb-gift-vitest.config.mjs` to alias the missing C entitlement hook to a test-only mock; no application source or standard test configuration altered for this workaround.
- Standard Vitest currently fails module resolution because `convex/pricing/gifts.ts` is not yet present. Re-run with standard configuration after C lands its hook. This isolated proof is not integrated entitlement validation.
- Concurrency coverage models serialized Convex transaction execution, asserting two-credit cap and one grant for simultaneous requested operations. It does not run actual Convex OCC. Grant-failure case verifies gift row remains pending; database rollback remains Convex's transaction guarantee.
- Focused ESLint passed without warnings.
