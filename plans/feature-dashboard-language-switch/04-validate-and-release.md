# Step 04 - Validate, Test, and Release

## Objective
Ensure no regressions and prove dashboard language switch behavior end-to-end.

## Tasks
1. Automated checks
   - `npm run typecheck`
   - `npm run test:i18n`
   - `npm run build`
2. Add/extend tests for dashboard locale switching:
   - route retention when switching locale from dashboard routes
   - key dashboard labels rendered in selected locale
3. Manual QA matrix (EN/NL x desktop/mobile):
   - Switch language on `/dashboard`, `/fit`, `/profile`, `/bikes`, questionnaire, results.
   - Verify navigation links remain in selected locale.
   - Verify no mixed-language sections.
4. Rollout checklist:
   - commit message + PR summary
   - screenshots EN/NL dashboard shell + one subpage each

## Deliverable
- Test evidence and QA checklist completion.

## Done When
- Language switch in dashboard is production-ready with passing checks.
