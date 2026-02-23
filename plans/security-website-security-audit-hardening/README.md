# Website Security Audit + Hardening Plan

## Goal
Establish a repeatable security program for `bestbikefit4u.eu` that identifies current risks and implements prioritized hardening actions across application, infrastructure, and operations.

## Background
The website handles authentication, user profile data, bike fit sessions, and report generation. A structured security review is needed to reduce exploitable risk, improve detection/response, and keep deployment safe as features evolve.

## Scope
- Next.js application security (public + authenticated routes)
- Convex backend security (auth boundaries, queries/mutations/actions)
- Deployment security on Vercel (headers, secrets, environment isolation)
- Third-party integration security (email provider, analytics, external scripts)
- Dependency and supply-chain risk baseline
- Logging, alerting, and incident readiness

## Out of Scope
- Full formal penetration test by an external vendor
- Legal/compliance certification (ISO/SOC/GDPR legal opinion)
- Native mobile application security (not applicable)

## Approach
1. Establish baseline and threat model.
2. Execute code/config/dependency security checks.
3. Validate auth, authorization, and data protection controls.
4. Implement prioritized hardening backlog (quick wins + structural fixes).
5. Add monitoring, response playbooks, and recurring security gates in CI/CD.

## Dependencies
- Access to production + preview configuration in Vercel and Convex
- Access to current secret inventory and environment variables
- Ability to run local build/tests and static analysis
- Owners for engineering + operations signoff

## Risk Severity Model
- `P0 Critical`: immediate exploit path, data breach/system takeover risk
- `P1 High`: strong exploitability or major impact
- `P2 Medium`: meaningful weakness, lower exploitability/impact
- `P3 Low`: hygiene hardening and defense-in-depth

## Acceptance Criteria
1. Security baseline report exists with prioritized findings (P0-P3) and remediation owners.
2. Blocking issues (P0/P1) are fixed or have approved mitigation with due dates.
3. Security headers, auth boundaries, and secret handling are verified in production.
4. CI includes dependency/security checks with fail thresholds.
5. Incident response runbook and monitoring alerts are documented and tested.
6. A recurring monthly security review workflow is defined.

## Status
- `Steps 01-06 complete (Step 02 with network-limited audit note)`
- [x] Step 01: `01-security-inventory-and-threat-model.md` (`output-01-security-inventory-and-threat-model.md`)
- [x] Step 02: `02-automated-security-baseline.md` (`output-02-automated-security-baseline.md`) - dependency advisory endpoint blocked in current sandbox network
- [x] Step 03: `03-authz-data-and-session-review.md` (`output-03-authz-data-and-session-review.md`)
- [x] Step 04: `04-hardening-implementation-backlog.md` (`output-04-hardening-implementation-backlog.md`) - core code execution completed (auth paths, analytics hardening, numeric validation, safe errors, report throttling)
- [x] Step 05: `05-infra-secrets-and-deployment-hardening.md` (`output-05-infra-secrets-and-deployment-hardening.md`)
- [x] Step 06: `06-monitoring-incident-readiness-and-recurring-controls.md` (`output-06-monitoring-incident-readiness-and-recurring-controls.md`)
