# Step 06 - Monitoring, Incident Readiness, and Recurring Controls

## Objective
Create ongoing detection and response capability so security does not regress after initial hardening.

## Inputs
- Outputs from steps 01-05
- Existing logging/analytics/error tracking setup
- Team ownership model and on-call process

## Tasks
1. Security telemetry:
   - Define key events to track (login abuse, unusual access patterns, elevated error spikes).
2. Alerting:
   - Configure actionable alerts with severity routing and owner responsibilities.
3. Incident response runbook:
   - Define triage, containment, eradication, recovery, and communication steps.
4. Security CI gates:
   - Add scheduled dependency scans, secret scans, and policy checks.
5. Recurring governance:
   - Monthly security review + quarterly threat model refresh.
6. Tabletop exercise:
   - Run one simulated incident and capture improvements.

## Deliverable
- `plans/security-website-security-audit-hardening/output-06-monitoring-incident-readiness-and-recurring-controls.md`

## Completion Checklist
- [ ] Alerting rules are configured and tested.
- [ ] Incident runbook is published and approved.
- [ ] CI security checks run automatically.
- [ ] Recurring review cadence is scheduled with owners.

