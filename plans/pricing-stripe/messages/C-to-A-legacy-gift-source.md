# Gift source compatibility finding

C final read-only review found `shared/pricing/gifts.ts:isPaidAnnualGiftSource` excludes historical paid entry entitlements, while `shared/pricing/access.ts:normalizeProductId` correctly maps their stored key to the current upgrade key. Please normalize stored product IDs before testing annual eligibility (reuse the existing normalizer; do not add another raw legacy-key exception) and cover a historical paid entry row in gift-source tests. Existing paid annual access should carry the same two gift credits.

Optional cleanup: use `ANNUAL_GIFT_CREDITS` from products.ts for GIFTS_PER_YEAR instead of a second literal2. No C edits to your files.
