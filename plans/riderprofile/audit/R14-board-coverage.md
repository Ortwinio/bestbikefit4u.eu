# R14 board/render coverage inventory

## R16 final all-board refresh

After the R16 advice-progress UI landed, reran every harness in the table below sequentially. All exited zero: **184 existing cases/flows and 231 images**. Additionally, `R16_RENDER=1 node plans/riderprofile/audit/R8-advice-capture.mjs` passed **48 interaction cases and 96 images** across NL/EN at 1440/390. Combined coverage is **232 cases/flows and 327 images**, with no recorded runtime errors or horizontal overflow. The R16 mode also asserts zero external requests. See `R16-render-notes.md` for lifecycle assertions and the fixture/backend evidence boundary.

This refresh supersedes the earlier targeted-only refresh below. Actual full-page images retain the account shell; R16 supplementary article detail crops hide fixed/sticky shell overlays only while taking that crop. Production source was not changed by the render pass. Latest R16 results are `renders/R16-advice-results.json`; existing manifests retain their paths below.

Follow-up R16-only refresh: visual review identified low-contrast conditional error copy. After the UI owner changed that alert to `text-destructive-text`, reran all 48 R16 cases and replaced their images/results. The other board captures are unaffected by that error-only change.

Subsequent unfiltered R16 axe checks identified the pending note label and mobile shell landmark issues; after the owners corrected these, repeated the full eleven-harness refresh because the shell semantics changed. Group-count semantics were also corrected before the final advice captures. See `R16-render-notes.md` for all findings, fixes and manual ring-contrast evidence. No axe rule or node exemptions are used.

## Post-rebase refresh — 169f7fc

### Targeted refresh after approved RP7/RP8 fixes

After root applied the Dutch `Rijder` filter label and bike-profile edit-link minimum width, reran `R8-advice-capture.mjs` and `R10-capture.mjs` for NL/EN at 1440/390. R8 passed all **32 captures**; R10 passed all **4 interaction flows / 12 state captures** plus comparisons and the board reference. Final manifests report zero errors/overflow. The first R8 attempt exposed an obsolete fixture selector expecting Dutch `Rider`; updated that selector to `Rijder`, keeping English `Rider`, then the complete rerun passed. No application source was changed during validation.

Inspected `R8-advice-filter-nl-390.png`: the selected filter reads `Rijder` and the two rider results remain visible. Inspected `R10-bike-nl-390-baseline.png`: edit links remain aligned and unclipped after the touch-target change. This visual inspection does not substitute for the separate measured touch-target sweep. Refreshed artifacts are the R8/R10 PNGs, `renders/R8-advice-results.json` and `audit/R10-browser.json`; the harness selector change is in `audit/R8-advice-capture.mjs`.

All RP1–RP8 boards and RPSidebar now have refreshed actual-component coverage at NL/EN × 1440/390. This section supersedes the earlier pending RP7/RP8 inventory and pre-rebase-only status. The production route sweep/axe gate remains root-owned and separate.

| Board / supplement | Harness | Final cases | Actual state images |
|---|---|---:|---:|
| RP1 public saddle | R1-capture.mjs | 4 interaction flows | 8 + 4 comparisons + board |
| RP2 handoff login | R2-login-capture.mjs | 12 | 12 |
| RP2 current newsletter login | R11-login-capture.mjs | 20 | 20 |
| RP3 welcome | R2-welcome-capture.mjs | 12 | 12 |
| Rings / score explainer | R3-render.mjs | 16 | 16 |
| RP6 account saddle | R4-capture.mjs | 4 interaction flows | 16 + 4 comparisons + board |
| RP5 current profile / demographics | R13-ui-capture.mjs | 20 | 20 |
| RPSidebar / RP4 hero | R6-render.mjs | 40 | 40 + 8 viewport images |
| RP4 prompt states | R7-dashboard-capture.mjs | 20 | 20 |
| RP7 advice | R8-advice-capture.mjs | 32 | 32 |
| RP8 bike | R10-capture.mjs | 4 interaction flows | 12 + 4 comparisons + board |

Final runs exit zero: **184 cases/flows, 231 images including comparisons/board references/viewport extras**. Recorded final cases have zero page/runtime errors and zero horizontal overflow where asserted. R2 login reports its 12 cases directly to stdout rather than a separate JSON manifest. R1/R4/R10 each record four interaction flows with multiple screenshots, not four screenshots.

### Compatibility repairs and resolved failures

- Updated six browser harness imports from the server `layout.tsx` to the actual `DashboardLayoutClient`: R5-profile, R6-render, R7-dashboard, R8-advice, R11-ui and R13-ui. This preserves the real account shell, rather than mocking it away. R5 and R11-ui were compatibility-patched but are not counted as refreshed runs; newer R13 profile and R11 login runs supply this pass's board evidence.
- The older R2 login harness initially failed bundling because newsletter completion now imports Convex `useQuery`. Added the logged-out fixture query export (`undefined`), then all 12 handoff/login cases passed.
- R13 initially timed out on the first profile route because the fixture did not handle `emails/preferences:get`; the actual newsletter profile component surfaced that missing boundary. Added a false newsletter preference fixture and page-error diagnostics. The complete 20-case rerun passed. No production errors were suppressed.
- Focused ESLint passes for all seven modified harnesses. No production source, API, CSS or owner implementation was changed.

### Visual inspection

Inspected refreshed mobile NL and desktop EN representatives for each board family: R1 filled saddle, R2 handoff/login (plus latest desktop newsletter state), R2 welcome, R7 dashboard, R13 filled profile, R4 account saddle, R8 stale advice, R10 baseline bike, and R6 sidebar/mobile hero. The long profile and advice screenshots were reviewed as full-page thumbnails; dashboard shell rings were also inspected in exact viewport images. Group columns collapse without horizontal clipping; rings, provenance/source labels, stale/unknown badges, optional newsletter state and bike setup actions remain visible. Actual RP6/RP8 components are rendered in focused fixtures without the account shell; separate R6 shell coverage and the root-owned route sweep cover that boundary.

No new visual implementation blocker was found in these representatives. This is not a claim of exact pixel equivalence, exhaustive interactive coverage, or real Convex persistence. Full production-build/authenticated-route checks remain separate release gates.

### Refreshed machine artifacts

- `audit/R1-browser.json`, `audit/R3-render-results.json`, `audit/R4-browser.json`, `audit/R6-render-results.json`, `audit/R10-browser.json`.
- Ignored render manifests: `renders/R2-welcome-results.json`, `renders/R7-dashboard-results.json`, `renders/R8-advice-results.json`, `renders/R13-ui-results.json`, `renders/R11-login-results.json`.
- All screenshots remain under `renders/`; no PNG belongs in source file manifests. No commit or deployment performed.

## Historical baseline — superseded

The initial 3 October inventory preceded R8/R10 availability and the server/client layout rebase. It identified missing RP7/RP8 evidence and browser imports of the server layout. Those gaps were resolved by the post-rebase refresh above; they are not current blockers.

Before rebase, A also ran R3 (16 cases) and R6 (40 cases), with no runtime errors or overflow. Those captures were subsequently replaced by the post-rebase runs. No compatibility edits were needed during that earlier baseline; the seven harness edits listed above were made during final integration.

## Reproduction commands

Run from `/Users/ortwinverreck/Developer/bestbikefit4u-rider`:

```sh
node plans/riderprofile/audit/R1-capture.mjs
node plans/riderprofile/audit/R2-login-capture.mjs
node plans/riderprofile/audit/R11-login-capture.mjs
node plans/riderprofile/audit/R2-welcome-capture.mjs
node plans/riderprofile/audit/R3-render.mjs
node plans/riderprofile/audit/R4-capture.mjs
node plans/riderprofile/audit/R13-ui-capture.mjs
node plans/riderprofile/audit/R6-render.mjs
node plans/riderprofile/audit/R7-dashboard-capture.mjs
node plans/riderprofile/audit/R8-advice-capture.mjs
node plans/riderprofile/audit/R10-capture.mjs
```

These scripts invoke esbuild/PostCSS, local fixture HTTP servers and Playwright. They do not launch a Next production build. The current harnesses use the real client account shell where applicable; RP6/RP8 remain focused component fixtures, as disclosed above. Root-owned production route sweeps and axe checks are separate evidence and are not claimed by this report.
