# R5 profile UI — scoped completion

## Implementation
- Real scoreRiderProfile and unchanged A ProfileStrengthRings; group breakdown/filter uses the same scored item weights. No fabricated bike score or sample values in product.
- Matching current observations expose value, unit, kind, localized method/source and historical recorded date. Unsupported existing hip circumference is read-only with observation unit or cm fallback; absent unsupported fields are omitted.
- Typed final API references support persisted and virtual evidence without requiring observation IDs. Score loading does not temporarily classify historical values as measured.
- Current array evidence is structurally matched before adapting to A's scalar ScoreObservation contract: scalar values retained, array values omitted but matched metadata preserved. A owns widening the shared scorer.
- Explicit save method, shared ranges/options and expectedCurrentValue (null when absent). Conflicts never silently write: keep/remeasure discard draft; use-new retries returned current value. No repeated-measurement claim.
- NL/EN method/protocol labels, locale-formatted gains, token-only CSS, shared controls with tooltips.
- Existing direct autosave editor stays mounted behind a toggle; wizard, retry and weight/pressure recalculation remain covered. R2 closeout caps WelcomeClient generic maxLength at 100.

## Validation
- Own focused run: 3 files / 41 tests pass (ProfileProvenance, profile page, WelcomeClient), including readonly 90 cm.
- Scoped ESLint passes for owned production/tests and capture harness.
- CSS Modules guard: 22 files, zero raw color lines.
- Tooltip guard remains blocked ONLY by coordinated registration: C crank/C saddle, WelcomeClient and ProfileProvenance. Controls already have real localized tooltips; no aliases or bypass. Parent/C own the single registry edit.
- Parent reports wider profile/measurements/page 14 files / 121 tests and backend 584 tests pass; parent typecheck has no R5 diagnostics. These broader runs were not rerun by this sidecar.

## Actual responsive renders
Run: node plans/riderprofile/audit/R5-profile-capture.mjs
- Real profile route and dashboard layout, actual CSS Modules/globals/fonts, fake authenticated Convex only.
- 12 full-page PNGs: normal, body-filtered, concurrent-conflict states × NL/EN × 1440/390.
- All 12: zero document overflow, zero page errors, two genuine rider score meters.
- External requests blocked; local synthetic fixture only; no production/database/network service data.
- Reviewed desktop body and mobile conflict captures. Desktop keeps compact summary/table/aside; mobile stacks controls without horizontal clipping. Full-page mobile images are long because all supported fields remain available.
- Results: plans/riderprofile/renders/R5-profile-results.json.
- Final fixture correction: FTP with twentyMinute now uses derived kind, twentyMinute method and legacy_migration source, matching migration semantics rather than claiming a single measured value. All 12 renders regenerated; each capture asserts the FTP row is calculated and from the existing profile before filtering. All overflow/runtime checks remain green. No product/CSS changes in this closeout.
- Capture permission approved and harness completed; no tooling blocker remains.

## Ownership
Exact R5 UI/harness/render paths: files-R5-ui.txt. Existing R2 ownership remains files-R2-welcome.txt; R2 closeout only changed maxLength in WelcomeClient. Parent backend/shared/A/C files and parent handoff-flow.test.tsx were not edited. No commits, dependencies, deployment or migration runs.
