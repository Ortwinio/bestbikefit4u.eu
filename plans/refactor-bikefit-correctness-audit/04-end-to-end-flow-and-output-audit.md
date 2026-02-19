# Step 04: End-To-End Flow And Output Audit

## Objective

Validate that the full product journey produces correct and consistent outcomes from user input through displayed/exported recommendations.

## Inputs

- `src/app/(auth)/login/page.tsx`
- `src/app/(dashboard)/profile/page.tsx`
- `src/app/(dashboard)/fit/*`
- `src/app/api/reports/[sessionId]/pdf/*`
- `convex/auth.ts`
- `convex/recommendations/*`
- `convex/emails/*`
- Outputs from Steps 01-03

## Tasks

1. Validate the happy path:
   login -> profile -> session -> questionnaire -> results -> PDF/email.
2. Verify output consistency across channels:
   on-screen results, PDF, and email report should not disagree.
3. Validate failure modes:
   missing profile fields, auth errors, missing recommendation data, send failures.
4. Check operational safeguards:
   rate limits, ownership checks, environment-dependent behavior.
5. Capture UX and domain quality issues that could cause incorrect user actions.

## Deliverable

- `plans/refactor-bikefit-correctness-audit/output-04-e2e-audit-findings.md`

The output must include:

- pass/fail evidence for each flow segment
- consistency defects with references
- operational risk list

## Completion Checklist

- [ ] Full journey was tested
- [ ] Results/PDF/email consistency was checked
- [ ] Failure handling was evaluated
- [ ] Security and auth controls were reviewed
