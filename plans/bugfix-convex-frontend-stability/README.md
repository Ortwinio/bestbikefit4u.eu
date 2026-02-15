# Convex Frontend Stability Plan

## Goal

Build a stable, test-verified interaction layer between the Next.js frontend and Convex backend so user flows remain reliable under normal and failure conditions.

## Background

Current implementation has strong core functionality, but there are communication contract gaps between frontend and server that can produce inconsistent behavior:

1. `src/app/(dashboard)/fit/page.tsx` sends `bikeType`, but `convex/sessions/mutations.ts` does not persist it in `fitSessions`.
2. Recommendation category can fall back to riding style instead of explicit bike selection, causing potential mismatch in generated fit outputs.
3. `src/app/(dashboard)/fit/[sessionId]/results/page.tsx` sends a full `recommendation` payload to `convex/emails/actions.ts`, but the server re-queries recommendation data and ignores that payload.
4. Frontend pages rely on `useQuery` states (`undefined`, `null`, error) but do not consistently handle all failure states with user-facing recovery.
5. Contract-level tests for frontend-to-Convex argument and response alignment are incomplete.

## Scope

In scope:

- Convex API contract audit for profile, session, questionnaire, recommendation, and email flows.
- Backend contract fixes where frontend/server payloads are inconsistent.
- Frontend error/loading/retry hardening for Convex query/mutation/action calls.
- Integration and E2E reliability tests targeting communication boundaries and failure modes.
- CI quality gates for communication stability.

Out of scope:

- Visual redesign.
- Performance/load benchmarking.
- New product features unrelated to communication stability.

## Approach

1. Establish a contract baseline and failure matrix.
2. Fix backend and frontend contract mismatches first.
3. Add integration tests around high-risk boundaries.
4. Add E2E failure-path tests and retry behavior checks.
5. Gate merges with CI checks and add minimal observability for rapid diagnosis.

## Dependencies

- Existing test foundation in `plans/test-strategy/`.
- Convex generated API types in `convex/_generated/`.
- Auth middleware and ownership checks in `src/proxy.ts` and `convex/lib/authz.ts`.

## Acceptance Criteria

- Explicit bike selection is preserved end-to-end and used in recommendation mapping.
- Email report action uses a single source of truth for recommendation data and has a stable client/server contract.
- Frontend shows deterministic loading, error, and retry behavior for all core Convex calls.
- Integration tests cover contract correctness and ownership/error paths for core flows.
- E2E tests cover success and communication-failure scenarios without flaky behavior.
- CI blocks merges when communication contract tests fail.

## Status

- Owner: `@codex`
- Target completion: `2026-02-22`
- Last updated: `2026-02-15`
- State: `COMPLETE`

| Step | File | Priority | Status |
|------|------|----------|--------|
| 01 | `01-contract-baseline.md` | P0 | Done |
| 02 | `02-backend-contract-fixes.md` | P0 | Done |
| 03 | `03-frontend-resilience.md` | P0 | Done |
| 04 | `04-integration-contract-tests.md` | P1 | Done |
| 05 | `05-e2e-communication-tests.md` | P1 | Done |
| 06 | `06-ci-rollout-and-observability.md` | P2 | Done |
