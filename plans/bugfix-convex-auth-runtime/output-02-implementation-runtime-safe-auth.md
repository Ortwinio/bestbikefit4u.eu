# Output 02: Implementation Runtime-Safe Auth

## Summary

Implemented the Step 02 runtime fix by removing Node-only `crypto` usage from `convex/auth.ts` and replacing it with a Web Crypto-based secure token generator compatible with Convex non-Node runtime bundling.

## Changes Implemented

### 1. Removed Node builtin import

- Removed `import { randomInt } from "crypto"` from `convex/auth.ts`.

### 2. Added runtime-safe secure randomness helpers

In `convex/auth.ts`:

- Added constants:
  - `VERIFICATION_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"`
  - `VERIFICATION_TOKEN_LENGTH = 6`
- Added `randomIndex(maxExclusive)` helper that:
  - Uses `globalThis.crypto.getRandomValues`.
  - Uses rejection sampling to avoid modulo bias.
  - Validates input range and availability of secure random API.
- Added `generateVerificationToken()` helper to build the 6-character token from the existing alphabet.

### 3. Kept auth behavior stable

- `EmailProvider.generateVerificationToken` now returns `generateVerificationToken()`.
- No changes made to:
  - Email format validation (`EMAIL_REGEX`).
  - Rate limiting (`checkRateLimit`).
  - Development fallback logging path when `AUTH_RESEND_KEY` is missing.
  - Resend send flow contract.

## Validation Performed

1. Node builtin scan in Convex code:

- Command:
  - `rg -n "from \"(node:)?...\"|require\(\"(node:)?...\"\)" convex || true`
- Result:
  - No Node builtin imports detected in `convex/` after this change.

2. Type safety check:

- Command:
  - `npm run typecheck`
- Result:
  - Passed (exit code 0).

3. Convex rebundle health (active dev session):

- Observed in running `npm run dev` session after edit:
  - `Convex functions ready!`
- The prior `Could not resolve "crypto"` error was not present after rebundle.

## Files Modified

- `convex/auth.ts`

## Step 02 Checklist Status

- [x] Convex bundle no longer fails on Node builtin imports.
- [x] Token generation behavior matches previous product expectations (6 chars, same alphabet).
- [x] No unrelated auth behavior changes were introduced.
- [x] Type checks affected by the change pass locally.

## Next Step

Proceed to Step 03 validation for explicit end-to-end checks:
- Local Convex endpoint health.
- Login/code flow execution evidence.
- Production-like Resend path sanity check.
