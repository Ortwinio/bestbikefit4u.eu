# R15 performance worker

Worktree: bestbikefit4u-rider; branch: feature/riderprofile.

## Implementation

- PerformanceCalculator accepts optional riderProfile (sex, weightKg) and ftpKnown. Only the authenticated account wrapper supplies real context.profile demographics. Public callers add no sex question, inference, or storage.
- Account known-FTP protection uses positive live profile FTP and explicit pending/trial/saved FTP changes. Supplied initial values default to known unless the caller explicitly marks them as placeholders. Remembered public FTP is preserved, including same-tool entries.
- Shared getFtpSliderStart chooses the display position only for existing FTP sliders in climb and known-FTP W/kg mode. Power-speed and fuel receive no new FTP controls or starter inputs.
- Starter never enters values, handoff, callbacks, or engines before movement/confirmation. Pending results and sticky metrics show no starter-derived calculation; callbacks are held while pending. Confirmation includes other pending input edits.
- Confirmation equal to the underlying 200 W default explicitly notifies once despite unchanged serialized values. Both unchanged-only and other-input-edit cases have regressions.
- Existing account profile-save/trial flow is retained. Shared account resolver, hook, chain, demographic helper, dictionaries and flexibility were not edited.

## Validation

Final combined PerformanceCalculator + handoff + AccountPerformanceCalculator run: 50 tests passed across 3 files. Focused ESLint passed without errors or warnings. Parent reports all final gates green: 192 tests, typecheck and lint.

Cases cover EN/NL pending copy, female/male starts, no untouched callback/handoff/save, no pending results, other inputs deferred, explicit movement/confirmation, same-default confirmation callback, known initial/profile FTP (including 200 W), remembered FTP, missing sex fallback, trial preservation after profile rebase, no FTP controls on power/fuel, and account save after explicit confirmation.

Full typecheck passed after granting write access to the TypeScript build cache. Focused ESLint had no errors; removed its reported unused pre-existing effect suppression. Parent owns full gates and renders; no new capture harness requested. No commits/deploys/production operations.

## Parent integration edge — resolved

Parent added setValues(values, confirmedFields) support in the shared chain. PerformanceCalculator now accepts the optional readonly confirmation-field argument and sends ["ftpWatts"] when confirming a pending starter equal to the existing value. Account wrapper passes state.setValues directly, preserving that metadata.

The new account integration regression verifies unknown male 90 kg FTP starts at 200 W, remains untouched without writes, becomes one pending FTP change on confirmation, never autosaves, and writes 200 W to the profile only after explicit Save profile. Component regressions also assert confirmation metadata. Final targeted rerun: 33 tests passed across PerformanceCalculator and AccountPerformanceCalculator. The prior 18 handoff cases remain unchanged. No outstanding worker integration blockers; DONE R15 performance scope.

Owned source and tests are listed in files-R15-performance.txt. Parent integrates plan status.

## Final weight provenance audit

Starter eligibility now requires a finite real profile weight within the riderMass control range (40–150 kg), a validated handoff weight, or genuinely touched body weight. An invalid profile weight cannot turn the resolver's 75 kg fallback into demographic input. Regressions cover 39 kg, 151 kg and NaN: no starter or writes initially; explicit body-weight movement enables the starter without writing untouched FTP. Final targeted run: 36 tests passed across the two component suites. Manifest unchanged. DONE R15 performance scope.
