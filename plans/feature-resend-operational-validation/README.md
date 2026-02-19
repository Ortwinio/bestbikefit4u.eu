# Resend Operational Validation Plan

## Goal

Confirm that Resend is correctly configured and that all production email paths (auth code + report email) work reliably end-to-end.

## Background

Email delivery is business-critical for login and report workflows. Recent setup work configured:

- `AUTH_EMAIL_FROM=BestBikeFit4U <noreply@notifications.bestbikefit4u.eu>`
- `SITE_URL=https://bestbikefit4u.eu`
- `AUTH_RESEND_KEY` in Convex production env

This plan validates configuration correctness, runtime behavior, and operational readiness.

## Scope

In scope:

- Validate Resend domain/sender authorization and API key scope.
- Validate production send paths for login code and fit report email.
- Verify Convex production logs/observability for send success and failure cases.
- Document a repeatable release/incident checklist for Resend.

Out of scope:

- Rewriting auth or report email architecture.
- Replacing Resend with another provider.
- Large UI changes unrelated to email reliability.

## Approach

1. Audit configuration alignment across Convex env, code defaults, and Resend dashboard.
2. Execute end-to-end production smoke tests for both email flows.
3. Run targeted negative tests to confirm clear failure behavior.
4. Capture evidence and finalize an operational runbook/checklist.

## Dependencies

- Convex production deployment linked and accessible.
- Resend account with domain `notifications.bestbikefit4u.eu` verified.
- Access to a real recipient inbox for validation.

## Acceptance Criteria

- Sender identity is consistently `BestBikeFit4U <noreply@notifications.bestbikefit4u.eu>`.
- Login magic-code email and report email both send successfully in production.
- Failure cases return actionable errors (no silent failures).
- Required logs/evidence are captured and documented.
- A reusable operational checklist exists for future verification.

## Status

- Owner: `@codex`
- Target completion: `2026-02-19`
- Last updated: `2026-02-19`
- State: `IN_PROGRESS (Step 02 report inbox/sender verification pending)`

| Step | File | Priority | Status |
|------|------|----------|--------|
| 01 | `01-audit-config-and-sender-alignment.md` | P0 | Done |
| 02 | `02-run-production-smoke-tests.md` | P0 | In Progress (Auth Inbox Confirmed) |
| 03 | `03-validate-failure-modes-and-logs.md` | P1 | Done |
| 04 | `04-finalize-operational-checklist.md` | P1 | Done |
