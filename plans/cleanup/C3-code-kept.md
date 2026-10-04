# C3 source kept

Conservative outcome: keep every module not listed in C3-code-removed.md. In particular, keep the following compiler candidates because framework discovery, external string references or shared symbol names need more evidence.

- `src/app/(dashboard)/gearing/GearingControls.tsx` — No runtime edge found in the preliminary graph, but same exported symbols occur elsewhere or barrel/dynamic compatibility needs additional review; keep rather than infer deletion from names.
- `src/app/(dashboard)/gearing/gearingMath.ts` — No runtime edge found in the preliminary graph, but same exported symbols occur elsewhere or barrel/dynamic compatibility needs additional review; keep rather than infer deletion from names.
- `src/app/global-error.tsx` — Next.js convention entrypoint, not dead code; import reachability alone is insufficient.
- `src/app/not-found.tsx` — Next.js convention entrypoint, not dead code; import reachability alone is insufficient.
- `src/app/robots.ts` — Next.js convention entrypoint, not dead code; import reachability alone is insufficient.
- `src/components/admin/organizations/admin-organizations-data.ts` — No runtime edge found in the preliminary graph, but same exported symbols occur elsewhere or barrel/dynamic compatibility needs additional review; keep rather than infer deletion from names.
- `src/components/admin/users/admin-users-data.ts` — No runtime edge found in the preliminary graph, but same exported symbols occur elsewhere or barrel/dynamic compatibility needs additional review; keep rather than infer deletion from names.
- `src/components/bikes/index.ts` — No runtime edge found in the preliminary graph, but same exported symbols occur elsewhere or barrel/dynamic compatibility needs additional review; keep rather than infer deletion from names.
- `src/components/features/pressure/PressureCalculatorHero.tsx` — Referenced by homepage/pressure route tests as mocks or by the tooltip coverage registry; keep the existing test contract.
- `src/components/features/pressure/wizard/StepResult.tsx` — Registered by scripts/check-tooltip-coverage.mjs; do not remove a tool-read source.
- `src/components/features/pressure/wizard/StepRoute.tsx` — Registered by scripts/check-tooltip-coverage.mjs; do not remove a tool-read source.
- `src/components/features/pressure/wizard/StepWeightGoal.tsx` — Registered by scripts/check-tooltip-coverage.mjs; do not remove a tool-read source.
- `src/components/features/pressure/wizard/StepWheelsetTires.tsx` — Registered by scripts/check-tooltip-coverage.mjs; do not remove a tool-read source.
- `src/components/feedback/FeedbackHubPage.tsx` — tests/integration/dashboard-message-locale.integration.test.tsx mocks the directory barrel; preserve barrel and its dependency.
- `src/components/feedback/index.ts` — tests/integration/dashboard-message-locale.integration.test.tsx mocks the directory barrel; preserve barrel and its dependency.
- `src/components/home/BikeSearchBar.tsx` — Referenced by homepage/pressure route tests as mocks or by the tooltip coverage registry; keep the existing test contract.
- `src/components/home/CalculatorGrid.tsx` — Referenced by homepage/pressure route tests as mocks or by the tooltip coverage registry; keep the existing test contract.
- `src/components/home/ClosingCtaBand.tsx` — Referenced by homepage/pressure route tests as mocks or by the tooltip coverage registry; keep the existing test contract.
- `src/components/home/DifferentiatorTriple.tsx` — Referenced by homepage/pressure route tests as mocks or by the tooltip coverage registry; keep the existing test contract.
- `src/components/home/HeroBlock.tsx` — Referenced by homepage/pressure route tests as mocks or by the tooltip coverage registry; keep the existing test contract.
- `src/components/home/HowItWorksStepper.tsx` — Referenced by homepage/pressure route tests as mocks or by the tooltip coverage registry; keep the existing test contract.
- `src/components/home/ProofBar.tsx` — Referenced by homepage/pressure route tests as mocks or by the tooltip coverage registry; keep the existing test contract.
- `src/components/home/TestimonialSection.tsx` — Referenced by homepage/pressure route tests as mocks or by the tooltip coverage registry; keep the existing test contract.
- `src/components/layout/index.ts` — No runtime edge found in the preliminary graph, but same exported symbols occur elsewhere or barrel/dynamic compatibility needs additional review; keep rather than infer deletion from names.
- `src/components/prototyper-ui/lib/utils.ts` — No runtime edge found in the preliminary graph, but same exported symbols occur elsewhere or barrel/dynamic compatibility needs additional review; keep rather than infer deletion from names.
- `src/components/prototyper-ui/ui/segmented-control.tsx` — No runtime edge found in the preliminary graph, but same exported symbols occur elsewhere or barrel/dynamic compatibility needs additional review; keep rather than infer deletion from names.
- `src/components/results/AdjustmentPriorities.tsx` — No runtime edge found in the preliminary graph, but same exported symbols occur elsewhere or barrel/dynamic compatibility needs additional review; keep rather than infer deletion from names.
- `src/components/results/FitNotes.tsx` — No runtime edge found in the preliminary graph, but same exported symbols occur elsewhere or barrel/dynamic compatibility needs additional review; keep rather than infer deletion from names.
- `src/components/results/FitSummaryCard.tsx` — No runtime edge found in the preliminary graph, but same exported symbols occur elsewhere or barrel/dynamic compatibility needs additional review; keep rather than infer deletion from names.
- `src/components/results/FrameSizeRecommendation.tsx` — No runtime edge found in the preliminary graph, but same exported symbols occur elsewhere or barrel/dynamic compatibility needs additional review; keep rather than infer deletion from names.
- `src/components/results/PainSolutions.tsx` — No runtime edge found in the preliminary graph, but same exported symbols occur elsewhere or barrel/dynamic compatibility needs additional review; keep rather than infer deletion from names.
- `src/components/results/index.ts` — No runtime edge found in the preliminary graph, but same exported symbols occur elsewhere or barrel/dynamic compatibility needs additional review; keep rather than infer deletion from names.
- `src/types/bikefit.ts` — No runtime edge found in the preliminary graph, but same exported symbols occur elsewhere or barrel/dynamic compatibility needs additional review; keep rather than infer deletion from names.

All `src/i18n/**` dictionaries and keys are kept: dynamic/indexed access and locale shape contracts prevent proving unused keys from a simple import graph.
All hooks and reachable library modules are kept. No public Next routes, Convex registered functions, tests, runtime field names, assets or emails are removed.
