# Convex Auth Runtime Compatibility Bugfix Plan

## Goal

Resolve the Convex auth startup failure caused by Node-only APIs in `convex/auth.ts`, and restore a fully healthy local backend/auth flow.

## Background

`convex dev` currently starts the local deployment but repeatedly fails while bundling functions because `convex/auth.ts` imports Node's `crypto` module. This file is being bundled in a non-Node Convex runtime, so backend health is degraded and auth-related functionality is unreliable.

## Scope

In scope:

- Identify all Node-only APIs currently used in `convex/auth.ts`.
- Refactor verification token generation to a runtime-safe implementation.
- Ensure email verification sending remains functional in both local and production paths.
- Add focused validation and regression protection for this specific runtime boundary.

Out of scope:

- Reworking overall auth product flows.
- Changing auth provider selection.
- Broad refactors unrelated to runtime compatibility.

## Approach

1. Confirm runtime constraints and enumerate incompatibilities in `convex/auth.ts`.
2. Implement a runtime-safe token generation path (or isolate Node-only behavior behind proper Node runtime boundaries).
3. Validate local backend startup, auth token generation, and email send paths.
4. Add regression checks and documentation to prevent reintroducing Node-only imports in non-Node Convex files.

## Dependencies

- Existing Convex auth setup in `convex/auth.ts`.
- Local `.env.local` auth/resend settings.
- Existing tests in `convex/**/__tests__` and frontend login flow.

## Acceptance Criteria

- `npm run dev` starts without Convex runtime bundling errors.
- No Node builtin import (`crypto`) remains in non-Node Convex runtime files.
- Verification codes are still 6 characters and use the allowed alphabet.
- Login/code flow works in local mode (dev log path) and production send path behavior remains intact.
- A regression check or lint/test safeguard exists for this runtime boundary.

## Status

- Owner: `@codex`
- Target completion: `2026-02-16`
- Last updated: `2026-02-15`
- State: `COMPLETE`

| Step | File | Priority | Status |
|------|------|----------|--------|
| 01 | `01-runtime-audit-and-design.md` | P0 | Done |
| 02 | `02-implementation-runtime-safe-auth.md` | P0 | Done |
| 03 | `03-validation-auth-flow.md` | P0 | Done |
| 04 | `04-regression-guardrails.md` | P1 | Done |
