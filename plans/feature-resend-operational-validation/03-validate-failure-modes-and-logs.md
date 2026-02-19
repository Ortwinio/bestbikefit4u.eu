# Step 03: Validate Failure Modes And Logs

## Objective

Ensure expected failures surface clear errors and are visible in production logs.

## Inputs

- Step 02 output
- `npx convex logs --prod`
- Known invalid sender/key test cases

## Tasks

1. Run controlled negative tests:
   - Invalid `from` format (expect validation error).
   - Unauthorized sender domain (expect authorization error).
   - Missing/invalid API key path (in safe non-prod or controlled test context).
2. Confirm app behavior:
   - Errors are propagated to user-facing flow where relevant.
   - No silent success responses on failed sends.
3. Confirm observability:
   - Identify where success/failure appears in Convex logs.
   - Capture at least one success and one failure log sample.
4. Summarize incident triage flow:
   - First checks
   - Commands to run
   - Typical root causes and fixes

## Deliverable

- `plans/feature-resend-operational-validation/output-03-validate-failure-modes-and-logs.md`

## Completion Checklist

- [ ] Failure modes are reproduced intentionally and safely.
- [ ] Error messages are actionable.
- [ ] Log visibility is sufficient for diagnosis.
