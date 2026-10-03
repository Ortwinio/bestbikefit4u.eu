# R15 — FTP control starting position

Worktree: bestbikefit4u-rider, feature/riderprofile. No commit, deploy, database or mail calls.

## Source and implementation choice

Verified the cited [Garmin FTP Ratings](https://www8.garmin.com/manuals-apac/webhelp/fenix7series/EN-SG/GUID-6C0F3C49-1E05-4AE5-8EC0-367A47C07DAB-4498.html),
attributed there to Allen and Coggan (2010). Lowest bounded category, Fair: men 2.23–2.78 W/kg;
women 1.90–2.35 W/kg. Untrained has no lower bound, so cannot supply a bounded starting value.
The helper uses the Fair lower boundary times real weight, rounded relative to the existing control's
min/step. Out-of-range/invalid inputs return null, retaining today's default rather than fabricating
a clamped estimate. A known positive FTP always prevents a replacement.

Choosing the lower boundary is a UI convention, not a prediction, clinical claim or new reference model.
Exact reference values and attribution are in shared/riderEstimates/ftpSliderStart.ts. Lead was asked
to confirm that lower-bound choice; absent a response, this conservative convention is explicit here.
estimateFtp and estimateFlexibility remain unchanged and unavailable; no guessed flexibility is shown.

## Scope and data safety

- Shared performance form: existing FTP controls in climb planner and FTP/Wkg only. Account wrapper
  supplies real profile sex/weight and an explicit known-FTP flag. Comparison tabs never imply sex.
- Account gearing: its existing optional numeric FTP input uses the same rule; no new slider/control.
- Power-speed, fuel and public gearing currently have no FTP control. Public handoff contains no sex.
  Those paths retain today's defaults rather than adding questions or sensitive storage. Lead scope
  clarification was requested; no unsupported demographic inference or algorithm change was made.
- Starter is display-only, not a value in profile/calculator state, handoff, observations or analytics.
  Movement/explicit confirmation accepts it; account profile saving still follows the existing explicit
  save-versus-trial flow. Unconfirmed FTP-dependent results are not displayed.
- Existing profile/explicit initial/remembered FTP stays authoritative. NL/EN helper text explains
  that the control needs adjustment; confirmation and pending-result text are localized.

## Validation

Final combined helper/performance/gearing/account-state/handoff/chain regression run:
212 tests in 16 files pass. Full typecheck and lint pass; final worker-specific
regressions are documented in R15-performance-notes.md and R15-gearing-notes.md.
Gearing before-confirm/after-confirm NL/EN 1440/390 captures have zero runtime errors, overflow or
external requests and zero writes before the explicit profile choice. Parent inspected NL mobile.
No shared engine, backend schema, frozen dictionary, consent storage or dependencies changed.

Equal-placeholder edge: accepting the same wattage as the form's old default must still create an
explicit pending profile change. The shared frontend chain accepts an optional confirmedFields list;
old callers remain unchanged. Only matching bindings are eligible, known identical values create no
redundant observation, and a separate profile-save choice remains required. Fourteen chain tests pass.
