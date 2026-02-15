# Communication Stability Runbook

Last updated: 2026-02-15

## Purpose

Provide one operational reference for:

1. Communication-focused CI gates
2. Structured frontend observability conventions
3. Pre-merge and post-deploy communication checks
4. Incident triage and rollback for contract regressions

## CI Gates

`CI` workflow (`.github/workflows/ci.yml`) enforces:

1. `contracts` job on PR + push:
   - `npm run test:contracts`
   - This is the fail-fast communication gate.
2. `quality` job on PR + push:
   - `npm run lint`
   - `npm run typecheck`
   - `npm run test:unit`
   - `npm run build -- --webpack`
3. `e2e-communication` job on `main`, `master`, and `release/*` pushes:
   - `npm run test:e2e:communication`

## Structured Client Error Logging

Use `reportClientError()` from `src/lib/telemetry.ts` for all Convex communication failures.

Required fields:

- `area`: feature/page domain (`profile`, `fit`, `questionnaire`, `results`)
- `action`: operation name (`createSession`, `saveResponse`, `sendFitReport`)
- `operationType`: one of `query`, `mutation`, `action`, `client`
- `subjectId`: stable identifier where safe (for example `sessionId`)

Log format uses:

- prefix: `[convex-communication-error]`
- event tag: `convex_communication_error`

## Pre-Merge Communication Checklist

Before merge:

1. `npm run test:contracts` passes locally.
2. `npm run test:unit` passes locally.
3. For communication-affecting changes, run `npm run test:e2e:communication`.
4. Any Convex query/mutation/action failure path touched in UI has user-facing recovery.
5. Plan status/docs are updated (`plans/*/README.md`, `plans/*/output-*.md`) where applicable.

## Post-Deploy Smoke Checklist

After deploy on mainline/release:

1. Login and auth guard behavior:
   - Unauthenticated user cannot access dashboard routes.
2. Profile flow:
   - Create or edit profile succeeds.
3. Session flow:
   - Create fit session succeeds for valid profile.
4. Questionnaire flow:
   - Save and complete questionnaire succeeds.
5. Results flow:
   - Recommendation generation succeeds.
   - Retry path works when generation is intentionally interrupted.
6. Email flow:
   - Email report sends for account owner email.
   - Non-owner recipient is rejected with explicit error.

## Incident Triage: Contract Regression

If communication behavior regresses:

1. Identify failure domain:
   - `query`, `mutation`, `action`, or client flow orchestration.
2. Gather identifiers:
   - `sessionId` (or relevant id), user-facing step, exact error message.
3. Check logs for `convex_communication_error`.
4. Reproduce locally with targeted test command:
   - `npm run test:contracts`
   - `npm run test:e2e:communication`
5. Determine scope:
   - Contract change, auth/ownership check, mapping regression, or UI-state regression.

## Rollback Procedure

Use rollback if production communication is broken and hotfix cannot land quickly:

1. Revert offending commit(s) on release/main branch.
2. Run:
   - `npm run test:contracts`
   - `npm run test:unit`
3. Redeploy reverted build.
4. Re-run post-deploy smoke checklist.
5. Follow-up:
   - Add missing regression coverage before reintroducing change.
