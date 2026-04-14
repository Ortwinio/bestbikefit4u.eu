# Plan: Code Review and Security Audit

## Goal

Systematically review the BestBikeFit4U codebase for security vulnerabilities, missing authorisation checks, and code quality issues. Produce a written findings report with a prioritised remediation list.

## Background

The app is a Next.js 16 / Convex application with:
- Public marketing pages and guide library
- Authenticated dashboard for bike fitting sessions
- Admin panel (role-gated: super_admin, ops_admin, etc.)
- Payment processing via Stripe
- Strava OAuth integration
- A batch JSON import script and CMS guide management system (recently added)

Known auth patterns:
- `requireUserId()` / `requireBikeOwner()` etc. in `convex/lib/authz.ts`
- `requireAdminUserId()` / `requireAdminRole()` / `requireAnyRole()` in `convex/admin/authz.ts`
- Route protection via `convexAuthNextjsMiddleware` in `src/proxy.ts`
- 136 Convex mutations/actions across ~35 modules

## Scope

| Area | In scope |
|------|----------|
| Convex mutations and queries | Auth coverage, validator completeness |
| Next.js API routes (`src/app/api/`) | Auth, input validation, header checks |
| Middleware (`src/proxy.ts`) | Route protection gaps |
| Content Security Policy | `unsafe-inline`, missing directives |
| Admin panel | Role enforcement depth, IDOR |
| Error message exposure | Leaking internals to clients |
| Rate limiting | Coverage of unauthenticated endpoints |
| Dependency audit | `npm audit`, outdated packages |
| Secrets and env vars | Exposure in logs, client bundles |
| CMS guide mutations | New code from goal 10 (tasks 048–054) |

Out of scope: penetration testing, infrastructure (Vercel/Convex hosting), GDPR data processing agreements.

## Approach

Five sequential prompt files. Each is self-contained and produces written output into `plans/security-audit/findings/`. The final prompt synthesises all findings into a prioritised report.

## Acceptance Criteria

- AC-01: Every Convex mutation and action audited for auth coverage — result written to findings
- AC-02: Every `src/app/api/` route reviewed — result written to findings
- AC-03: CSP policy evaluated against OWASP recommendations — gaps noted
- AC-04: Admin role enforcement verified end-to-end (middleware → layout → mutation)
- AC-05: Rate limiting coverage mapped — unprotected unauthenticated endpoints listed
- AC-06: `npm audit` run and output recorded
- AC-07: Final report written to `plans/security-audit/findings/06-report.md` with severity ratings (Critical / High / Medium / Low / Info) and remediation steps

## Status

- State: `COMPLETE`
- Executed: 2026-04-14
- Findings: 19 total (1 Critical, 4 High, 6 Medium, 8 Low)
- Resolved in code: 19
- Still open: 0
- Remaining item: none

| Step | Prompt | Status |
|------|--------|--------|
| 01 | Auth and authorization audit | Done |
| 02 | Convex mutation and query audit | Done |
| 03 | Next.js API route audit | Done |
| 04 | CSP, frontend, config audit | Done |
| 05 | Dependency and configuration audit | Done |
| 06 | Consolidated findings report | Done |

## Output Files

```
plans/security-audit/findings/
├── 01-auth-authorization.md
├── 02-convex-mutations.md
├── 03-api-routes.md
├── 04-csp-and-frontend.md
├── 05-dependencies.md
└── 06-report.md          ← final prioritised report
```
