# 01 — OAuth And Callback Hardening

## Goal

Make the Strava connect flow reliable, explicit, and safe.

## Suggested Owner

- Backend Integration

## Dependencies

- None

## Work

1. Keep the current consent-before-redirect experience.
2. Harden callback state validation and error handling.
3. After callback success:
   - persist integration tokens
   - cache athlete identity
   - schedule background bike and activity sync
   - redirect to Settings with a clear success state
4. Preserve query params needed for one-time UX states.

## Acceptance Criteria

- [ ] Invalid or expired OAuth state is rejected safely.
- [ ] Successful callback stores integration credentials and athlete identity.
- [ ] Callback schedules background sync automatically.
- [ ] User lands on Settings with a connected success state.
- [ ] Callback failure leaves the account in a recoverable state.

## Deliverables

- hardened callback behavior
- explicit callback tests
- stable redirect-state contract for the settings page

## Success Criteria

- [ ] Connect success rate is high enough that manual retry is rare.
- [ ] Errors are actionable and do not strand the integration in a confusing state.
