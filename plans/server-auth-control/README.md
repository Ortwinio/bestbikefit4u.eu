# Server + Authentication Control Plan

## Goal

Implement secure, testable authentication and authorization controls on the server with clear rollout steps.

## Scope

- Auth flow definition (login/session/token lifecycle)
- Authorization model (role and route control)
- Security hardening and observability
- Test and rollout checkpoints

## Out of Scope

- Full UI redesign
- Non-auth feature work

## Status: COMPLETE

All 4 steps completed on 2026-02-15. Implemented in commit `eab1d82`.

| Step | File | Status |
|------|------|--------|
| 01 | `01-auth-inventory.md` | Done |
| 02 | `02-authz-design.md` | Done |
| 03 | `03-implementation.md` | Done |
| 04 | `04-tests-and-rollout.md` | Done |

## Summary of What Was Implemented

- Rate limiting on magic code requests (3 req/15min per email)
- Email format validation in auth flow
- Server-side route protection via `src/proxy.ts` (Next.js 16 proxy convention)
- Security headers: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- `sendFitReport` restricted to authenticated user's own email + HTML escaping of fitNotes
- Backend string length validation for free-text fields (painPoints, injuryHistory, questionnaire)
- All 36 Convex endpoints audited — correct ownership checks confirmed
