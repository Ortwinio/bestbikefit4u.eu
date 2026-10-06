# U1 usability guard contract — 6 October

Runner available: `scripts/usability-check.mjs`; 16 focused Node tests pass. Use it during implementation. A is preparing the first offline production build. No page scope has been certified green yet. The blog fixture's server-HTML support is being aligned; account/checkout fixtures are real-component presentation adapters, not real backend transactions.

## Commands

From this worktree, after an offline production build:

`node /Users/ortwinverreck/Developer/bikefitboost-usability/scripts/usability-check.mjs --local --scope=U2`

Use `--scope=U1`, `--scope=U3` or `--scope=all`; optional `--filter=/calculators/frame-size` narrows development runs. The unfiltered owner scope is required before DONE. `--origin=https://127.0.0.1:PORT` reuses an already-running local production server. No remote origin is allowed. NL/EN × 390×844 and 1440×900 are always checked.

Reports/screenshots are ignored local artifacts under `plans/usability/renders/guard/`; durable human review goes in `plans/usability/audit/`. Every report enumerates rules 1–15 with evidence, applicability and unresolved manual checks. Manual checks never silently count as passes. A provides the final combined review. `--automated-only` is for iteration only, not DONE.

`--local` starts the existing `.next` production build, it does not build implicitly. First run `node /Users/ortwinverreck/Developer/bikefitboost-usability/scripts/usability/build.mjs`. This fixes the canonical origin and offline services and records matching application-input fingerprints before/after compilation. Missing or mismatched provenance cannot pass the release gate. Coordinate builds with A; do not overwrite `.next` during another agent's sweep. Ports default to 3240; override with `--port=3241` etc. U2/U3 may start their own local guard server on a different port after the shared build finishes.

Manual review input: `--manual-file=/absolute/path/review.json`, shape `{ "buildId": "from report", "sourceHash": "from report", "checks": [{ "id": "page id", "locale": "nl", "width": 390, "rule": 14, "status": "pass", "reviewer": "reviewer name", "note": "specific checked evidence", "screenshotHash": "from record", "evidenceHash": "from record" }] }`. A green manual result requires the exact build, application/harness source, screenshot and interaction-evidence hashes. Do not auto-approve pending checks or reuse stale evidence. The runner rejects newer app sources and source changes during the sweep.

Rule11 additionally requires `surfaces` entries for `FitReport.dc.html`, `FitRapport5.dc.html`, and `mail-pressure-text`, NL and EN: `{surface,locale,status:"pass",reviewer,note,file:"absolute ignored artifact path under plans/usability/renders/",sha256}`. These surfaces have no standalone route and cannot disappear from coverage. C should produce/inspect their actual report and mail renders, not a canvas replica.

After inspecting saved screenshots/states, apply the explicit manual-review file without rerendering using `node /Users/ortwinverreck/Developer/bikefitboost-usability/scripts/usability/review.mjs --report=/absolute/report.json --manual-file=/absolute/review.json`. Genuine edit timestamps make a second browser run different evidence. This finalizer verifies unchanged current source/build provenance, the complete case matrix and original screenshot/state hashes; it preserves automatic failures and writes separate `reviewed-report.json`/`.md`. Missing manual checks remain pending. No manual approvals have been fabricated for the current blocked reviews.

## Stable DOM hooks (semantic HTML still required)

Use `data-usability` values below on the actual visible element, not empty test-only sentinels. Measurements and text checks are independent of the marker.

- U2: `result-value`, `account-reason` (contains its benefit CTA; `data-reason-id` stable ID), `next-step` (real link), `route-progress`, `known-values`, `example` (example label), `short-answer`, `safety`. Native closed `<details>` must contain explanatory text in initial server HTML. Equivalent accessible collapsibles require server-rendered panel content.
- U1: `site-header`, `menu-trigger`, `home-routes`; the two home route links use `route-start` + `data-route="posture|ride"`.
- U3: `paid-boundary` + `data-boundary="second-bike|profile-score|step-plan|compare|report|history"`, `paid-presentation` + `data-presentation="range-chip|ladder|locked-preview|score-cap|compare-strip"`, `measurement-kind` on the real preselected control/group, `tire-pressure` + `data-component="…"` on the shared pressure component. Do not mark future/non-live features as real.

For U3 offline authenticated/checkout fixtures, please publish a local fixture-manifest adapter in a message: actual component route/state, local URL, and whether it includes header/page chrome. Use real components with explicit offline data, never canvas replicas. Guard must fail missing required fixtures instead of counting login redirects as account coverage. A integrates the final runner once your fixture entry is available.

The guard catches dimensions, 44px targets, axe contrast, numeric text inputs, stale prices/CTA, missing/mispositioned blocks, expanded explanations, absent server text, upgrade overlays, default-vs-reused examples and repeated reasons. Live-feature truthfulness, correct paid forms, chart colours and safety completeness need documented visual/code review against canvas/advice.

Account state coverage now uses C's explicit extension:17 routes ×free-enforced/flag-off/paid, separately compiled open/enforced fixture servers, with scenario-marker verification. Thus full coverage is332 cases; baseline account IDs are free-enforced and the other IDs carry `-flag-off`/`-paid`. The runner executes up to4 isolated browser contexts concurrently. Dedicated checkout boards intentionally require back/progress rather than a marketing menu; the back target and64px mobile header are still measured.

Ownership: A owns `scripts/usability-check.mjs`, `scripts/usability/*`, homepage and marketing header. B owns calculator/content changes; C owns account/paid/forms/email. Please send selector/fixture conflicts before touching A's files.
