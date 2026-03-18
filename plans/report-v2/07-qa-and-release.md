# Step 07 — QA, Compatibility, and Release

## Objective

Run the full release-quality validation pass for report v2, verify legacy compatibility, and update plan status/output docs for handoff or release.

## Background

Read:
- `plans/report-v2/TESTPLAN.md`
- `plans/engine-v2-migration/10-default-cutover.md`
- `src/app/(dashboard)/fit/[sessionId]/results/page.tsx`
- `src/app/api/reports/[sessionId]/pdf/route.ts`

## Final QA Checklist

### Functional
- [ ] New fit session uses engine v2 by default
- [ ] Results page shows all required v2 sections for a complete session
- [ ] Results page shows pending-data banner for incomplete tire pressure
- [ ] Current-vs-target deltas appear only when current-bike measurements exist
- [ ] Language switch on results page updates all content with no hardcoded strings
- [ ] PDF download button requests the correct locale PDF
- [ ] PDF contains all target sections with correct data
- [ ] PDF tire pressure section handles both complete and pending states

### i18n
- [ ] `npm run test:i18n` passes with all new keys present in EN and NL
- [ ] Results page NL copy has no visible English strings
- [ ] PDF exported in NL uses Dutch copy throughout

### Quality gates
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] `npm test` passes

### Compatibility / regression checks
- [ ] Legacy sessions still load on the results page
- [ ] PDF download still works for legacy sessions or fails gracefully with the documented fallback
- [ ] Questionnaire flow still works end-to-end
- [ ] Bikes page and dashboard flows are unaffected
- [ ] Report rate limiting is still active on the PDF route

## Release Steps

1. Confirm all QA items pass or document any explicit deferred items.
2. Update `plans/engine-v2-migration/README.md` and mark phase 10 Done if cutover criteria are met.
3. Update `plans/report-v2/README.md` and mark completed steps accordingly.
4. Write `output-07-qa-and-release.md` with pass/fail results and any residual risks.
