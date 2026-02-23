# Output 06 - Monitoring, Incident Readiness, and Recurring Controls

Date: `2026-02-23`  
Plan: `plans/security-website-security-audit-hardening`  
Step: `06-monitoring-incident-readiness-and-recurring-controls.md`

## 1) Objective Outcome

Defined the operational security layer required to detect abuse, respond quickly, and prevent regression after hardening.

## 2) Security Telemetry Model

Track and centralize events for:
1. Authentication abuse:
   - repeated login code requests
   - repeated verification failures
2. Authorization anomalies:
   - denied access attempts for protected resources
3. API abuse:
   - high-rate PDF/report requests
   - suspicious mutation bursts
4. Platform risk:
   - deploy failures on security checks
   - secret rotation overdue alerts

## 3) Alerting Rules (Initial)

P1 alerts:
1. Login abuse spike (5x normal in 15 min).
2. API/report endpoint abuse threshold exceeded.
3. Multiple authz-denied events from single actor/IP pattern.

P2 alerts:
1. Elevated error rate in auth/recommendation/report paths.
2. CI security gate failures on default branch.

Operational requirements:
1. Each alert has owner, escalation path, and response SLA.
2. Alerts route to on-call + incident channel.

## 4) Incident Response Runbook (Minimum)

1. Triage:
   - classify severity (SEV1/SEV2/SEV3)
   - identify impacted assets/data classes
2. Containment:
   - disable affected endpoint/feature flag
   - revoke suspected secrets/tokens
3. Eradication:
   - patch root cause
   - validate no active exploit remains
4. Recovery:
   - restore normal operations
   - monitor elevated signals for 24-72h
5. Postmortem:
   - timeline, root cause, corrective actions, prevention owners

## 5) Recurring Controls

Monthly:
1. Security backlog review and overdue remediation check.
2. Secret age/rotation report review.
3. Production header and authz spot-check.

Quarterly:
1. Threat model refresh.
2. Access-role audit (Vercel/Convex/team).
3. Tabletop incident exercise.

Per release:
1. CI security gates pass required.
2. Release checklist includes security signoff for sensitive changes.

## 6) CI/CD Security Gate Additions

1. Dependency advisory check (`npm audit`) on network-enabled runner.
2. Secret scanning on push/PR.
3. Policy check for protected route/authz coverage deltas.
4. Optional DAST smoke checks against preview deployment.

## 7) Tabletop Exercise Scenario (Recommended)

Scenario:
- Automated abuse on login/report endpoints causing performance degradation.

Exercise goals:
1. Validate detection latency.
2. Validate containment actions and role clarity.
3. Validate stakeholder communications.
4. Capture improvement tasks with deadlines.

## 8) Definition of Done for Operational Security

1. Alerts implemented and tested.
2. Incident runbook published and acknowledged by owners.
3. Monthly/quarterly review cadence scheduled.
4. CI security gates active and enforced on protected branches.

## 9) Completion Status

Step 06 completed with a practical monitoring and incident-readiness framework ready for operational rollout.

