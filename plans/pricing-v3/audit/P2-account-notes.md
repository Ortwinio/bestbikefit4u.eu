# P2 delegated account UI

Worktree `/Users/ortwinverreck/Developer/bestbikefit4u-pricing`, branch `feature/pricing-v3`.
No commits, deployment, production writes or fixture data in app paths.

## Implemented

- Account/mobile sidebar, dashboard and profile provenance consume A's `useProfileAccess` and the shared access-aware rider score. Completeness ring marks 80% without changing the supplied score; reliability remains separate. Localized cap explanation, basic/refined accuracy and pricing links appear only under enforcement.
- Six real profile refinements use A's rule/field definitions, `saveObservation` and concurrent-value-safe `removePaidField`. Each field has localized WHY text. Saved values remain readable/removable after expiry. Free users cannot edit refinements; existing self-assessment and complaint controls stay editable. No estimates or default measurements are written. New guided fields and score labels live in the new dictionary, without frozen dictionary edits.
- Garage/dashboard explain the one-bike limit. Creation chooser, manual form and passport import use authoritative access plus actual bike count; gate is not mounted when OFF. Existing bikes remain visible. Extra-bike CTAs lead to annual checkout.
- History, bike history, garage and dashboard label explicitly legacy full-access reports using owner-checked report access, never report dates. Free/single history includes the board's annual plan prompt. RP7 advice remains free and adds its contextual paid-plan link under enforcement.
- Fixed C's account test regressions: new skipped query expectations and mocks, and OFF-path creation rendering without Convex context.

## Validation

- Initial combined account run: 14 files / 176 tests PASS.
- Follow-up field reasons, complaint editing and garage/dashboard legacy badges: 6 files / 64 tests PASS.
- Scoped ESLint PASS.
- `npx tsc --noEmit --incremental false` PASS after A registered pricing API declarations. Initial incremental typecheck was blocked by the worktree cache permission, rerun with approval; earlier generated API failures were resolved by A.
- `git diff --check` PASS.
- Final combined account run: **16 files / 183 tests PASS**, including all C-reported account failures and new enforcement/expiry/removal/one-bike/legacy/complaint coverage. Final changed-file ESLint PASS. Parent owns shared full gates and NL/EN 1440/390 browser sweep; no visual capture is claimed by this worker.

## Remaining blockers

None for delegated account source. Parent expanded scope to the shared wizard and Welcome. Free wizard now suppresses paid femur prediction/editing, preserves persisted values and completes successfully with either no femur or a retained value. Welcome's rider/bike preview consumes A's scoring access arguments. Existing profile refinement removal remains available after expiry.

A's selected-bike contract is implemented: BikeProfilePanel consumes the server score, per-bike fullReport, BIKE_REFINEMENT_RULES and removeRefinement. Six localized refinement cards display real values and reasons. Expired fields remain readable/removable. Numeric/gearing editors lock appropriately; other edits preserve retained refinements. Strava/riding score labels are localized, and the score explainer uses the canonical enforced weight tables. No frontend score policy was recreated.

Final expanded validation: **7 files / 53 tests PASS**, final TypeScript, changed-file ESLint and whitespace checks PASS. Prior full account regression result is 16 files / 183 tests PASS. Account source stable; parent retains full P2 integration and visual QA. File manifest: `files-P2-account.txt`. Handoff `../messages/P2-account-stable.md`.
