# U2 example lifecycle handoff

Implemented per-field grey numeric default values and localized example badges, with one contextual result-top banner. Intentional edits/confirmations remove each field's marking; valid session/profile reuse (even equal to defaults) is never marked. Following A's clarification, the result notice uses `data-usability="example"` and disappears on the first intentional edit or valid reuse; other untouched fields retain `data-usability="example-label"`. Missing body measurements remain missing rather than becoming example measurements. Calculations and handoff provenance are unchanged. Explicit saddle save confirms the displayed default height and removes its example state.

Shared integration: body/performance pass `example` to ReliabilityCalculatorTemplate; body passes the primary continuous range as `reasonValue`. Saddle uses CalculatorJourneyHeader and PersonalizeAdviceBlock directly, preserves onSave, supplies its actual model range, and removes the old generic CTA. Gearing's public branch already delegates to PublicPerformanceCalculator, so GearingCalculatorForm needed no change. No pressure, shared template, PersonalizeAdviceBlock, server pages, account forms, environment, mail, commits or deployment changes.

## Changed source/test paths

- /Users/ortwinverreck/Developer/bikefitboost-usability/src/i18n/calculators/examples.ts
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/components/reliability/PublicBodyReliabilityCalculator.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/components/reliability/CalculatorExamples.test.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/power-speed/PublicPerformanceCalculator.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/power-speed/PublicPerformanceCalculator.test.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/saddle-height/PublicSaddleHeightCalculator.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/saddle-height/PublicBodyHandoff.test.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/saddle-height/HomepageSaddleHandoff.test.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/saddle-height/SaddleHeightCalculatorForm.test.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/saddle-width/SaddleWidthCalculatorForm.test.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/bike-fit/BikeFitCalculatorForm.test.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/frame-size/FrameSizeCalculatorForm.test.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/app/(public)/calculators/crank-length/CrankLengthCalculatorForm.test.tsx

## Validation

- Executed Calculator and SaddleHeight canvas board scripts for their initial states; reviewed per-field touch/prefill logic. Canvas has predefined reused body values; implementation correctly derives reuse from actual session/profile data.
- Five focused suites passed: 92 tests (CalculatorExamples, PublicBodyReliabilityCalculator, PublicPerformanceCalculator, PublicBodyHandoff, HomepageSaddleHandoff).
- After explicit-save example clearing, reran the two affected suites: 48 tests passed.
- ESLint passed for changed source/tests after fixing the test fixture key.
- Typecheck now has only an owner-file error: CalculatorJourney.tsx:32 TS7053 (`route` inferred as string used to index JourneyCopy). Earlier pending shared prop errors are resolved.
- Invoked `node /Users/ortwinverreck/Developer/bikefitboost-usability/scripts/usability-check.mjs --local --scope=U2`; exits ENOENT because `.next/BUILD_ID` does not yet exist. No guard green claim and no DONE U2 until the owner's production build/guard run.
- Whole-worktree diff check also identifies trailing whitespace in concurrent server-page/CalculatorAnswerSection changes; left those owner files untouched.

## Follow-up validation

After the clarified result notice contract, all five focused suites pass (94 tests), including 28 NL/EN lifecycle tests. ESLint passes. Typecheck passes after the owner's CalculatorJourney correction. Updated the five additional public-form suites requested by the owner: example assertions use the real result notice; account-action assertions use the calculator-specific CTA and still enforce plausibility/refinement gating. No real measured/estimated selector exists in the public saddle/body forms, so no synthetic measurement-kind hook was added; C/guard owner retains that decision.

Final run: all six requested suites (five public forms plus lifecycle) pass, 77 tests. Final `npx tsc --noEmit --incremental false` exits 0.

## Measurement choice and saddle follow-up

The owner expanded scope to genuine measured/estimated selection in public saddle and bike-fit. Implemented real keyboard-accessible segmented radios, preselected measured for missing input and matching reused provenance otherwise. Declared/derived inputs display estimated without rewriting their provenance on load. Explicit edits respect the chosen kind and discard repeat/method metadata. Session edits explicitly replace old entries so the quality-first merge does not undo an intentional downgrade. Unknown inseam stays missing. Plausibility confirmation never upgrades an estimate.

Additional paths:
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/i18n/calculators/measurementChoice.ts
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/components/reliability/MeasurementChoice.test.tsx
- /Users/ortwinverreck/Developer/bikefitboost-usability/src/components/reliability/PublicBodyReliabilityCalculator.test.tsx

Saddle renders initial account/next actions without requiring an inseam, while explicit save confirms the displayed height only; it never fabricates inseam data. Warning states retain a next-route link without the refinement CTA. Shared paid chip follows RangeBar and shared advice ladder follows account/next actions, using the actual current model range; both are absent in quick mode and the shared links have min-h-11 targets.

Profile limitation reported to owner: shared canonical-profile merge rejects lower-quality provenance, and the provider's retained-field confirmation ignores same-numeric-value method changes. These forms update local results and send the correct save payload, but persisting a canonical profile downgrade requires a shared-provider confirmation contract outside this task's ownership. Session flow is complete; no silent profile overwrite workaround added.

36 measurement-choice tests pass (NL/EN, both forms, no fabricated input, session/profile prefill, repeated metadata removal, keyboard selection, warning confirmation). Prior combined follow-up passed 143 tests, typecheck and lint. No production rebuild: owner runs guards on the interim build; no green guard claim.

Latest combined run with saddle paid integration: six suites, 149 tests passed; ESLint passed.

## Final handoff — source frozen

Final typecheck also exited 0. App source is frozen at the owner's request for the coordinated production build/guard sweep. No further source edits, builds, or generated artifacts from this agent unless explicitly requested after guard review. The profile downgrade limitation was reported to Codex B; C has not confirmed it. No shared-provider work is assigned to this agent. No guard-green or DONE U2 claim.

The complete app-source/test file list is the thirteen paths under “Changed source/test paths” plus the three paths under “Additional paths” (16 files total). Coordination artifacts owned by this agent:
- /Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/messages/B-examples.md
- /Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/audit/U2-examples-notes.md
