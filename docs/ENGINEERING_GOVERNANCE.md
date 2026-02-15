# Engineering Governance

Last updated: 2026-02-15

## Purpose

Define lightweight, enforceable controls to keep code quality, plans, and release readiness synchronized.

## Required Pre-Merge Checks

Every PR must satisfy these checks before merge:

1. `test:contracts` passes (`npm run test:contracts`)
2. `lint` passes (`npm run lint`)
3. `typecheck` passes (`npm run typecheck`)
4. `test:unit` passes (`npm run test:unit`)
5. `build` passes in deterministic mode (`npm run build -- --webpack`)
6. If plan step files changed (`plans/**/NN-*.md`), matching `plans/**/README.md` must be updated

These checks are executed by `.github/workflows/ci.yml`.

Additional release/mainline gate on push:

- `test:e2e:communication` (`npm run test:e2e:communication`)

## Runtime Boundary Policy

Convex runtime boundary rules and hotfix guidance are documented in:

- `docs/CONVEX_RUNTIME_BOUNDARIES.md`

This policy is enforced by `npm run lint` via `lint:runtime-boundaries`.

## Non-Optional Merge Gates

Repository administrators should configure branch protection for `main` with required status checks:

1. `quality / Lint`
2. `quality / Typecheck`
3. `quality / Unit tests`
4. `quality / Build (webpack mode)`
5. `quality / Enforce plan README update when step files change`
6. `contracts / Contract tests (fail-fast gate)`

If branch protection is not configured, CI is advisory only.

## PR Checklist Policy

PRs must use `.github/pull_request_template.md` and complete all applicable sections:

1. Quality gates
2. Plan/docs hygiene
3. Migration/seed impact
4. Release risk checks

## Weekly Maintenance Routine

Run once per week (or before each release):

1. `plans/` hygiene:
   - Ensure active plan READMEs have owner, status, and target date.
   - Archive/close stale plans or mark blocked with reason.
2. `messages/` hygiene:
   - Delete resolved local message files.
   - Keep only unresolved items plus `README.md` and `TEMPLATE.md`.
3. `context/INDEX.md` hygiene:
   - Update active task, owner, status, and open message list.
4. Quality drift check:
   - Run `npm run test:contracts`, `npm run lint`, `npm run typecheck`, `npm run test:unit`.

## Ownership Model

- Plan curation owner: `@ortwinverreck`
  - Responsible for plan status accuracy and backlog hygiene.
- Quality gate owner: `@ortwinverreck`
  - Responsible for failing CI triage and resolution.
- Release checklist owner: `@ortwinverreck`
  - Responsible for release readiness sign-off.

## Failure Handling

When CI fails:

1. Assign owner within the PR thread.
2. Identify failing gate and affected files.
3. Fix or revert within the same PR.
4. Do not merge while required checks are failing.
