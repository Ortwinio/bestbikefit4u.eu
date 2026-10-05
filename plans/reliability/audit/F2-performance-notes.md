# DONE F2 performance — recovery/finalization

Date: 2026-10-05. Worktree: `/Users/ortwinverreck/Developer/bikefitboost-reliability`; branch: `feature/reliability-full`.

Reviewed FULL-RELEASE.md, F2-performance messages, C-performance-types, relevant model/design requirements, all new performance UI/input/copy files, and the previous worker's dispatch, gearing page and test diffs. The accompanying `files-F2-performance.txt` includes the previous worker's modified tests and gearing page, new source files, coordination artifacts and this final audit.

## Implementation and provenance audit

- Five public tools use the parent's two-step reliability template: power/speed, climb, FTP/W/kg, gearing, fuel/hydration. EN/NL keys match. Explicit account/accountMode dispatch retains legacy form internals and account regression coverage.
- Mount and prefill do not write examples or rewrite measurement provenance. Session/profile prefill remains visibly marked and editable. Explicit edits use declared provenance; bike fields use bike provenance. Raw protocol watts remain separate from derived estimated FTP. Existing merge behavior retains a stronger previously entered FTP against a later estimate.
- Public uncertainty remains conservative: no measured/recent/test evidence is invented from login, payment or a declared value. FTP protocol selects the documented 6%/10% range. Shared models own widths and scales; existing engines own speed/climb/FTP centres; C's adapters own climbing cadence and fluid loss. Reverse mode keeps required watts separate from the speed interval. Carbohydrate guidance has no uncertainty bar.
- Climb pacing displays the engine's actual FTP percentage. Gearing uses 85% FTP, with fallback FTP estimated at 3 W/kg; optional assumptions remain disclosed. Fuel labels fluid loss rather than a mandatory replacement target.
- Gearing page FAQ/HowTo reflects the new two-step cadence flow. Metadata/canonical/hreflang logic is unchanged in the reviewed diff.

## Recovery fixes

- Reject fractional chainring/sprocket prefill before it reaches the shared cadence model, which requires integer tooth counts and otherwise throws. Added a regression covering both fields and safe example fallbacks.
- Corrected EN/NL gearing basis/omitted copy to distinguish estimated FTP (3 W/kg) from climbing power (85% FTP), including the reused-FTP case.
- No shared model, template, data layer, backend, public saddle or account implementation edits in this recovery.

## Validation

Executed with `/bin/sh`, `login:false`, and `/opt/homebrew/bin/node`, from the required worktree:

- Vitest: both public `power-speed` and `gearing` directories plus `shared/reliability/performance.test.ts`: **9 files, 120 tests passed** after fixes (119 before the new regression).
- ESLint: both public calculator directories and `src/i18n/calculators/reliabilityPerformance.ts`: **exit 0**, no diagnostics after fixes.
- Vite prints its existing future native config-loader warning; tests pass.
- The earlier combined 415-test run and green tsc were supplied in the recovery handoff, not rerun or claimed as fresh evidence here.

## Handoff

Existing fixtures/selectors/profile provider contract are in `plans/reliability/messages/F2-performance-fixtures.md`; field contract is in `F2-performance-to-A-fields.md`. No additional fixture delivery is needed. This note is the final source-status record and supersedes the unfinished model-wait status in `F2-performance-progress.md` and the fixture note's anticipated `F2-performance-complete.md` filename. Centre/template requests were resolved by the current imports and C/parent contracts.

A/parent retain combined gates, real browser EN/NL 1440/390, axe and reduced-motion verification. No browser, screenshot or accessibility-sweep claim is made here. No commit, deploy, environment modification, production access or mail was performed.
