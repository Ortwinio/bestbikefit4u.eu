# Step 05: Validate Regression And Cutover

## Objective

Verify the replacement is safe, complete, and ready for production rollout.

## Inputs

- `plans/refactor-bikefit-ai-to-bestbikefit4u/output-03-frontend-rebrand.md`
- `plans/refactor-bikefit-ai-to-bestbikefit4u/output-04-backend-env-rebrand.md`
- Entire codebase (`src/`, `convex/`, `docs/`)
- CI commands from `README.md`

## Tasks

1. Run residual reference checks and confirm all intentional exceptions are documented.
2. Execute quality gates:
   - `npm run lint`
   - `npm run typecheck`
   - `npm run test:unit`
   - `npm run test:contracts`
   - `npm run build -- --webpack` (or `npm run build:vercel` if release-targeted)
3. Perform manual smoke tests for:
   - public pages + metadata
   - auth login email flow
   - dashboard start session -> results
   - report email/PDF generation paths
4. Create a production cutover checklist:
   - Convex env updates
   - Vercel env updates
   - sender/domain verification
   - rollback plan and post-release monitoring checks
5. Save validation and release checklist to `plans/refactor-bikefit-ai-to-bestbikefit4u/output-05-validation-and-cutover.md`.
6. Mark the plan state in `plans/refactor-bikefit-ai-to-bestbikefit4u/README.md` as complete when all checks pass.

## Deliverable

- Validation evidence and a production-ready cutover checklist with rollback guidance.

## Completion Checklist

- [ ] Residual reference audit is clean or documented by exception.
- [ ] All selected quality gates pass.
- [ ] Manual smoke test evidence is captured.
- [ ] Cutover and rollback checklist is complete.
- [ ] Output file is created and linked in the plan README.
