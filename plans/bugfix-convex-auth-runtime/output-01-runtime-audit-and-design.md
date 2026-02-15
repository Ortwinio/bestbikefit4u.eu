# Output 01: Runtime Audit And Design

## Root Cause Summary

`convex dev` fails to bundle auth functions because `convex/auth.ts` imports a Node builtin (`crypto`) in a non-Node Convex runtime file.

- Offending import: `convex/auth.ts:4`
- Offending usage: `convex/auth.ts:39`
- Runtime error observed in dev session:
  - `Could not resolve "crypto"`
  - `convex/auth.ts:4:26`
  - `It looks like you are using Node APIs from a file without the "use node" directive.`

This causes repeated Convex bundling failures, so backend process is up but function compilation is unhealthy.

## Runtime-Sensitive Inventory (`convex/auth.ts`)

1. Node builtin import:
- `import { randomInt } from "crypto"` at `convex/auth.ts:4`.
- This is incompatible with non-Node Convex runtime bundling.

2. Environment variable usage:
- `process.env.AUTH_RESEND_KEY` (`convex/auth.ts:34`, `convex/auth.ts:52`, `convex/auth.ts:62`)
- `process.env.AUTH_EMAIL_FROM` (`convex/auth.ts:65`)
- This pattern is already used across Convex code and is not the current bundling blocker.

3. Third-party SDK usage (`resend`):
- Imported at `convex/auth.ts:3` and instantiated in `sendVerificationRequest` (`convex/auth.ts:62`).
- Audit result: no direct Node builtin imports were found in `node_modules/resend/dist/index.mjs` during static inspection; no bundling error currently points to `resend`.
- Risk level: low-to-medium (runtime behavior should still be rechecked in Step 03 on production-configured path).

4. In-memory rate limiter:
- `Map`-based limiter at `convex/auth.ts:11` with `checkRateLimit`.
- Not a runtime compatibility blocker, but operationally best-effort only (state resets on process restart and is per-instance).

## Runtime Boundary Validation

1. `convex/auth.ts` is consumed by HTTP routing:
- `convex/http.ts:2` imports `auth` from `./auth`.
- `convex/http.ts:6` calls `auth.addHttpRoutes(http)`.

2. Convex explicitly requires Node APIs to be isolated:
- Existing project runtime error mandates splitting Node API usage into `"use node"` files.
- A working example of proper Node runtime boundary exists in `convex/emails/actions.ts:1` (`"use node"`).

3. Randomness API validation (non-Node-safe path):
- `@convex-dev/auth` itself uses `crypto.getRandomValues` (global Web Crypto) in `node_modules/@convex-dev/auth/src/server/implementation/utils.ts:19-23` for random string generation.
- This validates that using global Web Crypto (without importing Node `crypto`) is aligned with the auth library runtime model.

## Decision

### Selected remediation strategy (for Step 02)

Replace Node `randomInt` usage with a runtime-safe token generator based on `globalThis.crypto.getRandomValues` and remove the `crypto` import from `convex/auth.ts`.

Why this strategy:
- Fixes the confirmed bundling failure at the exact root cause.
- Preserves product behavior: 6-character code with existing alphabet (`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`).
- Avoids moving auth configuration into `"use node"` boundaries that may conflict with `auth.addHttpRoutes` usage.

### Explicit non-selected strategy

Do **not** remove `generateVerificationToken` entirely to fall back to library default token generation, because default behavior is a much longer token (32 chars in current library path) and would change UX/security flow expectations.

## Step 02 Implementation Spec

1. In `convex/auth.ts`:
- Remove `import { randomInt } from "crypto"`.
- Add a small helper to generate secure random indexes using Web Crypto (`crypto.getRandomValues`) with rejection sampling to avoid modulo bias.
- Keep token length = 6 and alphabet unchanged.

2. Keep unchanged:
- Email regex validation.
- `checkRateLimit` behavior.
- Dev fallback log path when `AUTH_RESEND_KEY` is absent.
- Resend send path contract.

3. Safety checks to run after change:
- `npm run dev` starts without Convex `Could not resolve "crypto"` errors.
- `http://127.0.0.1:3210` reports running.
- Auth sign-in flow still issues 6-character codes.

## Open Risks / Follow-ups

1. `resend` package compatibility should be verified in Step 03 with production-like configuration path.
2. In-memory rate limiting remains non-distributed and non-persistent; acceptable for this bugfix scope.

## Ready For Next Step

All design decisions are resolved for implementation. Step 02 can proceed without further blockers.
