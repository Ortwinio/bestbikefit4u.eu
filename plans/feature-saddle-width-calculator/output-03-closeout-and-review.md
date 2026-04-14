# Saddle Width Closeout And Review

## Outcome

Tasks `028` through `033` were reviewed in parallel and closed against the repo state.

Parallel review coverage:
- engine/backend review
- public/dashboard UX review
- discoverability/QA review

Confirmed fixes applied after review:
- aligned saddle-width measured range to the planned `60-200 mm` contract
- removed the unintended engine clamp that forced all high recommendations into the largest marketed bin
- hardened `convex/saddleWidth/mutations.ts` with payload validation for measurement mode, ranges, enums, and score bounds
- fixed saddle-selector bike binding so the selected bike drives derived defaults and save payloads
- stopped the public calculator from saving on every transient input signature by deduping on result payload and adding a short debounce
- corrected the dashboard sidebar/mobile/protected-route wiring for `/saddle-selector`

One review suggestion was intentionally not adopted:
- clamping all high recommendations to the largest width bin was rejected because `testplan.md` explicitly requires valid high-end outputs such as `236 mm` while only the width-class label clamps gracefully to `XXL`

## Evidence

### Task 028

Files:
- [config.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/saddle-width-engine/config.ts)
- [width-engine.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/saddle-width-engine/width-engine.ts)
- [width-engine.test.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/lib/saddle-width-engine/width-engine.test.ts)

Validated:
- measured and estimated engine paths
- shared measured range contract
- high-end recommendation handling without false clamp
- symptom handling and width-match scoring

### Task 029

Files:
- [mutations.ts](/Users/ortwinverreck/Developer/bestbikefit4u/convex/saddleWidth/mutations.ts)
- [queries.ts](/Users/ortwinverreck/Developer/bestbikefit4u/convex/saddleWidth/queries.ts)
- [mutations.ts](/Users/ortwinverreck/Developer/bestbikefit4u/convex/profiles/mutations.ts)
- [schema.ts](/Users/ortwinverreck/Developer/bestbikefit4u/convex/schema.ts)

Validated:
- public session mutation remains unauthenticated
- dashboard session mutation still enforces `requireUserId`
- `bikeId` ownership guard remains in place
- persisted payloads are now range-checked and mode-checked

### Task 030

Files:
- [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/calculators/saddle-width/page.tsx)
- [SaddleWidthCalculatorForm.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/calculators/saddle-width/SaddleWidthCalculatorForm.tsx)
- [SaddleWidthCalculatorForm.test.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/calculators/saddle-width/SaddleWidthCalculatorForm.test.tsx)
- [page.test.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(public)/calculators/saddle-width/page.test.tsx)

Validated:
- measured default path
- estimated-mode switch behavior
- public page rendering and CTA wiring
- deduped public session writes keyed to result payload

### Task 031

Files:
- [page.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/saddle-selector/page.tsx)
- [SaddleSelectorForm.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/saddle-selector/SaddleSelectorForm.tsx)
- [SaddleSelectorForm.test.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/saddle-selector/SaddleSelectorForm.test.ts)
- [SaddleSelectorForm.test.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/saddle-selector/SaddleSelectorForm.test.tsx)

Validated:
- no silent first-bike auto-binding
- selected bike drives riding/posture defaults
- query-param bike hydration
- save payload matches the selected bike
- profile sit-bone prefill is ignored when outside the supported calculator range

### Task 032

Files:
- [DashboardSidebar.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/layout/DashboardSidebar.tsx)
- [DashboardSidebar.test.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/components/layout/DashboardSidebar.test.tsx)
- [layout.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/layout.tsx)
- [layout.test.tsx](/Users/ortwinverreck/Developer/bestbikefit4u/src/app/(dashboard)/layout.test.tsx)
- [navigation.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/i18n/navigation.ts)
- [navigation.test.ts](/Users/ortwinverreck/Developer/bestbikefit4u/src/i18n/navigation.test.ts)

Validated:
- desktop sidebar points at `/saddle-selector`
- mobile dashboard menu includes saddle selector
- protected-route allowlist includes `/saddle-selector`
- homepage/footer/related-links/sitemap wiring already present in the shipped saddle-width commit

### Task 033

Commands run:
```bash
npx tsc --noEmit
npx vitest run 'src/lib/saddle-width-engine/width-engine.test.ts' \
  'src/app/(public)/calculators/saddle-width/SaddleWidthCalculatorForm.test.tsx' \
  'src/app/(public)/calculators/saddle-width/page.test.tsx' \
  'src/app/(dashboard)/saddle-selector/SaddleSelectorForm.test.ts' \
  'src/app/(dashboard)/saddle-selector/SaddleSelectorForm.test.tsx' \
  'src/components/layout/DashboardSidebar.test.tsx' \
  'src/i18n/navigation.test.ts' \
  'src/app/(dashboard)/layout.test.tsx'
```

Result:
- `tsc`: passed
- `vitest`: passed

## Review Notes

Reviewer findings that were fixed:
- dashboard bike selection could save against the wrong bike
- sidebar path used the wrong route
- mobile dashboard menu missed the saddle-selector entry
- protected-route allowlist missed `/saddle-selector`
- public calculator session writes were noisier than intended
- profile and saddle-width calculator measured ranges had drifted apart

Residual gap:
- no live browser automation was rerun in this closeout pass; coverage was strengthened with focused component and routing tests instead
