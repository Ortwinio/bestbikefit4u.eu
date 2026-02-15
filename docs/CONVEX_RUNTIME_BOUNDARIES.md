# Convex Runtime Boundaries

## Why this exists

Convex non-Node runtime files cannot import Node builtins (for example `crypto`, `fs`, `path`).
A recent auth incident was caused by importing Node `crypto` in `convex/auth.ts`, which broke Convex function bundling.

## Rules

1. Non-Node Convex files must not import Node builtins.
- Applies to files in `convex/` without a top-level `"use node"` directive.

2. Node-only APIs must live in `"use node"` files.
- Example: `convex/emails/actions.ts`.
- If you need Node APIs, move that logic into a dedicated Node runtime file.

3. Prefer runtime-safe APIs in shared Convex files.
- Example: use Web Crypto (`globalThis.crypto.getRandomValues`) instead of Node `crypto` imports when possible.

## Automated guardrail

`npm run lint` now includes `lint:runtime-boundaries`, which runs:

```bash
node scripts/check-convex-runtime-boundaries.mjs
```

The check fails when:
- A file in `convex/` imports a Node builtin.
- The file does not declare `"use node"`.

Ignored by the guardrail:
- `convex/_generated/**`
- `convex/**/__tests__/**`
- `*.test.ts(x)` and `*.spec.ts(x)` under `convex/`

## Quick verification after auth/runtime changes

1. Start the stack:

```bash
npm run dev
```

2. Confirm Convex health:

```bash
curl -sS -m 3 http://127.0.0.1:3210
```

Expected response includes:
- `This Convex deployment is running.`

3. Validate auth sign-in path:

```bash
npx convex run auth:signIn '{"provider":"resend","params":{"email":"qa-runtime-check@bikefit.ai"}}'
```

Expected behavior:
- Returns `{ "started": true }`.
- If no `AUTH_RESEND_KEY` is set on deployment, logs a dev verification code.

## Incident hotfix and rollback

If a runtime-boundary regression is introduced:

1. Run guardrail locally:

```bash
npm run lint:runtime-boundaries
```

2. Short-term hotfix (fast restore):
- Remove offending Node builtin import from non-Node file.
- Use runtime-safe alternative (for randomness, use Web Crypto).
- If needed, move Node-specific code into a dedicated `"use node"` file.

3. Rollback path (if production is blocked):
- Revert the offending change set to last known good commit.
- Redeploy.
- Re-run health checks above.

4. Post-incident:
- Add or update coverage in tests/guardrails if the issue pattern was not caught.
