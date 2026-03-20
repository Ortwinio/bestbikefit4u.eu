# Security Audit — 2026 Q1

## Goal

Run a targeted security review over new features shipped since the original security hardening plan (completed ~Feb 2026), and verify that existing controls still hold.

## Background

The original `security-website-security-audit-hardening` plan is complete (all 6 steps done). Since then:
- GTM consent gating was implemented — analytics scripts now require user consent (`0288595`)
- Tire pressure module added new Convex mutations/queries (`04b47ef`)
- Dashboard bike setup experience upgraded with new flows (`d7f66cc`)
- Image preview fixes were made — check if `<img>` sources are validated
- Prototyper UI migration changed client component surface

New feature code = new potential attack surface. This plan audits the delta and re-validates key controls.

## Scope

- New Convex mutations/queries from tire pressure and dashboard upgrade (auth boundaries, input validation)
- GTM consent implementation — verify no analytics fire before consent, check for data leakage in tag configuration
- Image handling changes — ensure no open redirect or unvalidated image source issues
- Updated CSP headers — verify Prototyper UI's CSS/script requirements don't require loosening CSP
- Dependency delta — new packages added since last audit
- Re-run key checks from original plan: auth boundary, input validation, CSP, rate limiting

## Out of Scope

- Full re-audit of stable features already covered in the original plan
- External penetration test
- GDPR legal opinion (consent mechanism functional review only)

## Approach

1. **Delta review** — Audit only new/changed Convex endpoints and client features since `e79b451`
2. **GTM consent validation** — Verify consent gate implementation is watertight
3. **Dependency audit** — Run `npm audit` and review new dependencies
4. **CSP and headers re-check** — Confirm headers still pass after UI changes
5. **Auth boundary re-check** — Verify new endpoints use `requireUserId()` / `requireXOwner()` patterns

## Acceptance Criteria

- All new Convex endpoints have `requireUserId()` or equivalent auth guard
- All new mutation args use `v.` validators with appropriate constraints (no unbounded string inputs)
- GTM loads only after consent signal confirmed (tested manually or via test)
- `npm audit` returns zero high/critical vulnerabilities
- Security headers (CSP, X-Frame-Options, etc.) unchanged or tightened vs. original audit
- No new `any`-typed args in Convex functions (bypasses validator)

## Status

| Step | File | Priority | Status |
|------|------|----------|--------|
| 01 | `01-delta-convex-review.md` | P0 | Done — output: `output-01-delta-convex-review.md` |
| 02 | `02-gtm-consent-validation.md` | P1 | Done — output: `output-02-gtm-consent-validation.md` |
| 03 | `03-dependency-audit.md` | P1 | Done — output: `output-03-dependency-audit.md` |
| 04 | `04-csp-and-headers-recheck.md` | P1 | Done — output: `output-04-csp-and-headers-recheck.md` |
| 05 | `05-findings-and-fixes.md` | P0 | Done — output: `output-05-findings-and-fixes.md`; P1 CSP fix applied to `next.config.ts` |

## Execution Notes (2026-03-18)

All 5 steps completed. One P1 fix applied in code:
- `next.config.ts`: Added `https://www.googletagmanager.com` to `script-src` and `connect-src`; added GA4 analytics endpoints to `connect-src`; added `https://*.convex.cloud` to `img-src`.

No P0 findings found. P2/P3 items documented in `output-05-findings-and-fixes.md` for next sprint / Q2 review.
