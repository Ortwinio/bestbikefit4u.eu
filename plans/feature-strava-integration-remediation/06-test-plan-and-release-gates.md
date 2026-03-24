# 06 — Test Plan And Release Gates

## Goal

Define what must pass before this Strava remediation ships.

## Suggested Owner

- Quality Control with support from all implementation roles

## Dependencies

- Steps 01-05

## Required Automated Tests

- callback success and error handling
- token refresh success and failure
- bike import idempotency
- exact `stravaGearId` activity matching
- unattached activity safety
- summary recomputation
- disconnect cleanup
- settings overview UI states
- import flow and confirmation flow
- quality-control checks on shared UI usage where practical

## Release Gates

### Gate A — Connect and overview

- [ ] callback tests green
- [ ] settings overview tests green
- [ ] manual connect flow verified

### Gate B — Import correctness

- [ ] bike import tests green
- [ ] idempotency tests green
- [ ] manual multi-bike import verified

### Gate C — Enrichment correctness

- [ ] activity sync tests green
- [ ] summary query tests green
- [ ] low-use logic verified against real synced metrics

### Gate D — Safety

- [ ] disconnect cleanup tests green
- [ ] no user-owned field overwrite regressions
- [ ] no duplicate bike or activity regressions

### Gate E — Quality Control

- [ ] quality-control review completed
- [ ] Prototyper UI usage reviewed
- [ ] mobile and desktop state review completed
- [ ] no unresolved major UX findings

## Success Criteria

- [ ] `npm run typecheck` passes
- [ ] focused Strava suites pass
- [ ] manual happy-path and recovery-path checks pass
