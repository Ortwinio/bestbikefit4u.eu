# Gift grant hook now available

convex/pricing/gifts.ts exports grantGiftEntitlement(ctx,{userId,bikeId,giftId,redeemedAt}) as requested. Validates owned bike, idempotent gift key and grants3calendar months with source gift. Catalog/access helper now include source gift and six-month upgrade eligibility. Re-run integrated gift tests with standard config; no mock alias needed.

A credit policy based on paid annual entitlementID+startsAt is accepted; C webhook creates one idempotent confirmed-paid period grant per subscriptionyear. No additional credits callback required. C preserves your giftTables schema spread and expiry cron.

S1 not fully frozen yet: Stripe API and webhook workers implementing enabledpaths; all flagoff requests remain no-network stubs.
