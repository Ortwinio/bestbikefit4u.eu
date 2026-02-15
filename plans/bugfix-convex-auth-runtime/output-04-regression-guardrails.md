# Output 04: Regression Guardrails

## Summary

Implemented an automated runtime-boundary guardrail that blocks Node builtin imports in Convex non-Node runtime files, documented the policy, and added operational guidance for verification and rollback.

## Guardrail Implemented

### 1) Automated check script

Added:
- `scripts/check-convex-runtime-boundaries.mjs`

What it enforces:
- Scans files under `convex/`.
- Detects Node builtin imports via:
  - `import ... from "<builtin>"`
  - `require("<builtin>")`
  - `import("<builtin>")`
- Fails if Node builtin is used in files that do **not** declare top-level `"use node"`.

Coverage details:
- Builtin list is sourced from Node's `module.builtinModules`.
- Handles both plain and `node:` specifiers.
- Ignores generated and test-only files:
  - `convex/_generated/**`
  - `convex/**/__tests__/**`
  - `*.test.ts(x)`, `*.spec.ts(x)`

### 2) Integrated into normal lint workflow

Updated `package.json` scripts:
- `lint` now runs both ESLint and runtime-boundary check:
  - `npm-run-all lint:eslint lint:runtime-boundaries`
- Added:
  - `lint:eslint`
  - `lint:runtime-boundaries`

This ensures the runtime-boundary check is part of standard developer and CI lint workflows.

## Documentation Added

### 1) Runtime boundary policy doc

Added:
- `docs/CONVEX_RUNTIME_BOUNDARIES.md`

Includes:
- Rules for Node API usage in Convex files.
- Guardrail behavior and scope.
- Quick verification commands.
- Incident hotfix and rollback path.

### 2) Governance linkage

Updated:
- `docs/ENGINEERING_GOVERNANCE.md`

Added a dedicated section linking to runtime boundary policy and noting enforcement through `npm run lint`.

## Validation Results

1. Guardrail command:
- Command:
  - `npm run lint:runtime-boundaries`
- Result:
  - Passed.
  - Output: `[runtime-boundaries] OK: no disallowed Node builtin imports found in Convex non-Node files.`

2. Typecheck:
- Command:
  - `npm run typecheck`
- Result:
  - Passed.

3. Full lint:
- Command:
  - `npm run lint`
- Result:
  - Fails due pre-existing ESLint errors in test files (`@typescript-eslint/no-unsafe-function-type`), unrelated to this runtime-boundary guardrail change.
  - `lint:runtime-boundaries` remains validated independently.

## Rollout Guidance

What changed:
- Runtime-safe auth token generation was implemented in Step 02 (`convex/auth.ts`).
- Runtime boundary guardrail is now enforced by script + lint integration (this step).

Why failures happened before:
- Node `crypto` import in `convex/auth.ts` was bundled in a non-Node Convex runtime file.

How to verify quickly:
1. `npm run lint:runtime-boundaries`
2. `npm run dev`
3. `curl -sS -m 3 http://127.0.0.1:3210`
4. `npx convex run auth:signIn '{"provider":"resend","params":{"email":"qa-runtime-check@bikefit.ai"}}'`

## Rollback / Hotfix Path

If runtime-boundary regression is reintroduced:

1. Immediate hotfix:
- Remove Node builtin import from non-Node Convex file.
- Replace with runtime-safe API, or move logic to `"use node"` file.

2. If release is blocked:
- Revert offending commit to last known good revision.
- Re-run quick verification commands.

3. Post-incident hardening:
- Extend guardrail/test coverage for the missed pattern.

## Files Added/Changed In Step 04

- `scripts/check-convex-runtime-boundaries.mjs` (added)
- `package.json` (updated scripts)
- `docs/CONVEX_RUNTIME_BOUNDARIES.md` (added)
- `docs/ENGINEERING_GOVERNANCE.md` (updated)
