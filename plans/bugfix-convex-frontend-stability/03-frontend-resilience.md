# Step 03: Frontend Resilience

## Objective

Harden frontend behavior around Convex communication so users always get clear loading, failure, and recovery states.

## Inputs

- `src/app/(dashboard)/profile/page.tsx`
- `src/app/(dashboard)/fit/page.tsx`
- `src/app/(dashboard)/fit/[sessionId]/questionnaire/page.tsx`
- `src/app/(dashboard)/fit/[sessionId]/results/page.tsx`
- `src/app/(dashboard)/error.tsx`

## Tasks

1. Normalize `useQuery` state handling:
   - Treat `undefined` as loading.
   - Treat `null` as empty/not-found.
   - Treat thrown errors via error boundary plus local recovery messaging where needed.
2. Add explicit mutation/action failure UX:
   - Profile save failures.
   - Session creation failures.
   - Questionnaire save/complete failures.
   - Recommendation generation and email-send failures.
3. Stabilize asynchronous flows:
   - Prevent duplicate recommendation generation calls.
   - Add retry affordance for transient failures.
   - Ensure navigation only happens after successful mutation completion.
4. Add lightweight telemetry hooks for key failure points (console plus extensible reporter function).

## Deliverable

- Frontend communication hardening changes with user-visible recovery paths.

## Completion Checklist

- [ ] No page treats loading data as missing data.
- [ ] Every core mutation/action has a user-facing failure state.
- [ ] Recommendation generation flow is idempotent and retryable from UI.
- [ ] Error boundary and local states provide actionable recovery.
