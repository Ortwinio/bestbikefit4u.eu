# Account integration blockers — A and B parent

**RESOLVED / SUPERSEDED:** All three items below are resolved. Parent expanded wizard/Welcome scope; implementation and focused tests pass. A supplied selected-bike contract, now consumed by BikeProfilePanel/refinement/editor UI. See `P2-account-stable.md` for final validation and build handoff. Historical details follow.

Account UI passes 176 focused tests; follow-up additions (field reasons, complaint-editing regression, dashboard/garage legacy badges) pass 64 affected tests. Scoped ESLint, TypeScript (nonincremental) and diff whitespace pass. All C-reported account regression suites now pass, including dashboard-message locale and retired Marktplaats chooser.

Final combined result: **16 files / 183 tests PASS**. File manifest `audit/files-P2-account.txt`, audit `audit/P2-account-notes.md`. Owned edits stable for parent integration; full account board acceptance remains blocked by items 1–2 below.

Remaining integration needs before full account board acceptance:

1. **A, bike score/refinement policy:** `shared/profileScore.scoreBike` still has no access argument and `convex/bikes/profile.ts:bikeProfileSummary` still returns unrestricted score. Updated BikeProfile/RP8 boards require 80-point free base, 20-point refinements scoped to the selected bike. Need canonical paid bike field IDs + server writer/removal policy (board: measured reach/drop, seat/head angles, gearing and Strava riding data). No frontend cap or copied policy has been invented. BikeProfilePanel remains untouched pending A's contract.
2. **B parent, shared wizard:** StepAdvancedMeasurements auto-populates femur from height, including free onboarding. Paid-field server enforcement then rejects the payload. Need locked-refinement prop through MeasurementWizard and suppress femur prediction/editing when locked; pass `isPaidAccessEnforced() && !access?.fullProfile` from the owned profile page (access is already available). These shared measurement files are outside delegated scope; please handle or authorize explicitly.
3. **B parent, WelcomeClient:** A requests the fourth rider-score consumer use useProfileAccess. Account worker wired the three in-scope consumers. WelcomeClient is outside this delegation.

Refinement fields each have localized WHY copy. Flag OFF does not mount refinements or bike creation enforcement, and no new estimated values are introduced. Existing saved bikes/reports remain visible. Board fixtures are used only in tests, never production data.
