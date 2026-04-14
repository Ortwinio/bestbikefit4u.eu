# Prompt 06 — Consolidated Findings Report

## Context

Read `plans/security-audit/README.md` first.
Read all five findings files:
- `plans/security-audit/findings/01-auth-authorization.md`
- `plans/security-audit/findings/02-convex-mutations.md`
- `plans/security-audit/findings/03-api-routes.md`
- `plans/security-audit/findings/04-csp-and-frontend.md`
- `plans/security-audit/findings/05-dependencies.md`

## What to produce

Write `plans/security-audit/findings/06-report.md` with the following sections.

---

### Executive Summary

2–4 sentence overview: How many findings total, breakdown by severity, the most critical issues, and overall security posture.

### Finding Inventory

Full table of all findings from all five audits:

| ID | Severity | Area | Title | File/Location | Status |
|----|----------|------|-------|---------------|--------|
| F-01 | Critical | ... | ... | ... | Open |
| ... | | | | | |

Status is always "Open" at report creation time. Remediation tracking happens separately.

### Critical and High Findings (detailed)

For each Critical or High finding, write a full description:
```
## F-XX — [Title]
**Severity**: Critical / High
**Area**: Auth / API / CSP / Backend / Deps
**Location**: file:line
**Issue**:
[Full description of the vulnerability or weakness]

**Attack scenario**:
[Concise: who does what, what data is at risk]

**Recommendation**:
[Specific code change or configuration change]

**Estimated effort**: S / M / L
```

### Medium Findings (summary)

Table only for Medium findings — no need for full write-ups, just location + recommendation.

### Low and Info Findings (summary)

Bulleted list.

### Remediation Roadmap

Prioritised list of what to fix and in what order. Group by effort:

**Do immediately (< 1 day each)**
- ...

**Sprint 1 (next 2 weeks)**
- ...

**Backlog (no immediate risk)**
- ...

### What is working well

Briefly note security controls that are already in place and effective:
- CSP is set (though needs improvement)
- `requireUserId()` pattern is consistent
- Admin role enforcement exists at the Convex layer
- Rate limiting exists for auth and report endpoints
- Sentry integrated with source maps disabled
- `X-Frame-Options: DENY` and `frame-ancestors 'none'`
- `secure: true` on cookies in production
- etc.

---

## Verification

After writing the report, run:
```bash
npx tsc --noEmit
```
to confirm no type regressions were introduced during the audit (read-only audit should have none, but verify).

Write proof: `plans/security-audit/findings/06-report.md complete; N findings (X critical, Y high, Z medium); tsc passes`
