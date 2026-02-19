# Step 04: Replace Backend Email PDF And Env Branding

## Objective

Replace BikeFit AI references in backend communications, generated reports, and deployment/environment configuration.

## Inputs

- `plans/refactor-bikefit-ai-to-bestbikefit4u/output-02-brand-replacement-spec.md`
- `convex/auth.ts`
- `convex/emails/actions.ts`
- `src/lib/reports/recommendationPdf.ts`
- `src/lib/pdf/simplePdf.ts`
- `.env.example`
- `docs/VERCEL_DEPLOYMENT.md`
- `package.json`

## Tasks

1. Replace branding in auth magic-code email subject/body/from fallback values.
2. Replace branding in recommendation/report email templates and subjects.
3. Replace branding in PDF/report titles and footer signatures.
4. Align default environment examples and deployment docs:
   - `SITE_URL`
   - `AUTH_EMAIL_FROM`
   - any brand/domain references used in runbooks
5. Review whether package/service identifiers should be renamed now or deferred (document decision).
6. Save implementation notes and changed file list to `plans/refactor-bikefit-ai-to-bestbikefit4u/output-04-backend-env-rebrand.md`.
7. Update plan status in `plans/refactor-bikefit-ai-to-bestbikefit4u/README.md`.

## Deliverable

- Backend communications and operational config references updated to BestBikeFit4U with explicit decisions on deferred renames.

## Completion Checklist

- [ ] Auth email templates and defaults are updated.
- [ ] Recommendation email and report templates are updated.
- [ ] PDF/report branding is updated.
- [ ] Env examples and deployment docs are aligned.
- [ ] Output file is created and linked in the plan README.
