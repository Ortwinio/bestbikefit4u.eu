# Step 05: Validate Layout Values And Release

## Objective

Prove the upgraded PDF is visually acceptable and value-correct, then prepare safe rollout steps.

## Inputs

- `plans/feature-pdf-layout-upgrade/output-04-production-integration-notes.md`
- test suite and PDF route tests
- generated sample PDFs from current implementation

## Tasks

1. Add/update automated tests for:
   - value mapping correctness
   - required section presence
   - fallback behavior on render failure
2. Execute quality gates:
   - `npm run lint`
   - `npm run typecheck`
   - `npm run test:unit`
   - `npm run test:contracts`
   - `npm run build -- --webpack`
3. Run manual smoke tests:
   - generate report for a known fixture/session
   - verify critical metrics and ranges match expected backend values
   - verify layout/page breaks are readable
4. Create release checklist with rollback path:
   - feature flag or fallback switch plan
   - runtime monitoring points for PDF generation failures
5. Save final validation to `plans/feature-pdf-layout-upgrade/output-05-validation-and-release-checklist.md`.
6. Mark plan complete in `plans/feature-pdf-layout-upgrade/README.md` when all checks pass.

## Deliverable

- Validated release package for upgraded production PDF output.

## Completion Checklist

- [ ] Automated tests cover value correctness and fallback behavior.
- [ ] All quality gates pass.
- [ ] Manual metric checks pass against known data.
- [ ] Release + rollback checklist is complete.
- [ ] Output file created and linked in plan progress.
