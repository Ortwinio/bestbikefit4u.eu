# Step 05: E2E Communication Tests

## Objective

Validate end-to-end stability for frontend ↔ Convex interaction, including transient communication failures and recovery.

## Inputs

- Dashboard flow pages under `src/app/(dashboard)/`
- E2E framework setup (Playwright preferred)
- Convex dev backend setup

## Tasks

1. Add E2E coverage for happy-path communication:
   - Profile create/update.
   - Session create.
   - Questionnaire complete.
   - Recommendation display.
   - Email report submission.
2. Add failure-mode scenarios:
   - Simulated mutation failure during session creation.
   - Simulated recommendation-generation failure.
   - Simulated email-action failure.
   - Session not found / unauthorized access.
3. Validate recovery UX:
   - Retry action works.
   - User remains on a safe page state after failure.
   - Error messaging is clear and not silent.
4. Run tests multiple times to detect flakiness and tune waits/retries.

## Deliverable

- E2E suite that validates both success and failure communication paths.

## Completion Checklist

- [ ] Critical happy path is covered end-to-end.
- [ ] At least three communication failure modes are tested.
- [ ] Retry/recovery behavior is asserted.
- [ ] Test suite is stable across repeated runs.
