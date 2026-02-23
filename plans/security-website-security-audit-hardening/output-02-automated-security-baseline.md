# Output 02 - Automated Security Baseline

Date: `2026-02-23`  
Plan: `plans/security-website-security-audit-hardening`  
Step: `02-automated-security-baseline.md`

## 1) Scope and Limitation

Automated baseline checks were executed locally for:
- lint/type/build quality gates
- risky-code pattern scan
- secret pattern scan
- auth-guard coverage review

Limitation:
- `npm audit` could not run because sandbox DNS cannot reach npm registry (`ENOTFOUND registry.npmjs.org`).

## 2) Commands Run

1. `npm audit --json`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run build -- --webpack`
5. `rg -n "dangerouslySetInnerHTML|\beval\(|new Function\(|innerHTML\s*=|document\.write\(" src convex scripts`
6. `rg -n "target=\"_blank\"" src`
7. `rg -n --hidden -S "BEGIN [A-Z ]*PRIVATE KEY|ghp_[A-Za-z0-9]{36}|xox[baprs]-|sk_live_[A-Za-z0-9]|AIza[0-9A-Za-z_-]{35}" .`
8. `rg -n "process\.env\.[A-Z0-9_]+" src convex scripts | sort`
9. Auth surface mapping via `rg` for Convex query/mutation auth helpers.

## 3) Results Summary

### 3.1 Dependency and Build Baseline

- `npm audit`:
  - Failed due network/DNS restriction, not due package parsing error.
  - Action: rerun in CI or network-enabled local shell.

- `npm run lint`:
  - Completed with warnings only (0 errors).
  - Security-relevant warning: GTM inline script recommendation in `src/app/layout.tsx`.

- `npm run typecheck`:
  - Passed.

- `npm run build -- --webpack`:
  - Passed.

### 3.2 Risky Pattern Scan

Findings:
- `dangerouslySetInnerHTML` exists on multiple pages but currently used for JSON-LD and GTM script injection.
- No `eval`, `new Function`, `document.write`, or direct `innerHTML=` assignments found.
- No `target="_blank"` usage found.

Assessment:
- JSON-LD usage is expected.
- GTM inline script and permissive CSP increase script-injection blast radius.

### 3.3 Secret Pattern Scan

No obvious hardcoded secrets or private keys found with high-signal regex patterns.

Assessment:
- Positive baseline, but should still add dedicated secret scanning in CI (e.g., gitleaks/trufflehog) including git history.

### 3.4 Header / Policy Baseline

From `next.config.ts`:
- Present: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, CSP.
- Gap: no explicit HSTS from app layer (often edge-configured; must verify at platform level).
- Gap: CSP includes `'unsafe-inline'` for `script-src` and `style-src`.

### 3.5 Auth Guard Coverage Baseline

Observed:
- Strong resource ownership checks in most core Convex domains.
- Potential issue: analytics KPI query/mutation paths do not enforce auth/authorization like core domains.
- Route-level proxy protection only marks `/dashboard` as protected; other authenticated app paths rely mostly on client-side checks.

## 4) Baseline Findings (Prioritized)

| ID | Finding | Severity | Evidence |
|---|---|---|---|
| B-02-01 | `npm audit` could not execute in sandbox network | P3 | `npm audit --json` ENOTFOUND |
| B-02-02 | CSP allows `'unsafe-inline'` for scripts/styles | P2 | `next.config.ts` |
| B-02-03 | GTM loaded via inline script in root layout | P3 | `src/app/layout.tsx` |
| B-02-04 | Analytics query/mutation auth/rate controls weaker than core domains | P1 | `convex/analytics/*.ts` |
| B-02-05 | No dedicated secret/dependency security scan jobs in CI | P2 | `.github/workflows/ci.yml` |

## 5) Recommended CI Security Baseline (Next Step Input)

Add jobs:
1. `npm audit --audit-level=high` (network-enabled runner).
2. Secret scanning:
   - repo scan + history scan.
3. Custom authz lint script:
   - flag Convex queries/mutations without auth helper usage where required.
4. Header verification check:
   - validate production response headers for key routes.
5. Security regression tests:
   - unauthorized route/resource access checks.

## 6) Completion Status

Step 02 is completed with documented limitation:
- Dependency audit API unavailable in current sandbox network.
- All other baseline checks were executed and recorded.

