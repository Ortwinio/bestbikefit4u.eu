# 28 — Release whole-app QA sweep

Completed the unfiltered 70-route matrix: NL/EN × 1440/390, 280 cases, with axe serious/critical checks.
Raw result: **261 cases without failures, 19 with failures** (first run: 75 / 205). Exit code 1 reports findings.
No app code was changed. This is not an all-green release gate.

## Run and evidence

```sh
node tests/visual/final-sweep/sweep.mjs --output=plans/redesign-canvas/final-sweep/28-release --label=28-release
```

- [Report](../final-sweep/28-release/report.md), [JSON](../final-sweep/28-release/report.json),
  [raw rows](../final-sweep/28-release/results.jsonl), [context](../final-sweep/28-release/run-context.json).
- HEAD at run: `e9a8162`, including approved `b1a9411` (25f) and `d5dc5dd` (26.1).
- Matching production snapshot reused: `/tmp/bbf-final-sweep-0ac319e9375f372f`.
- Source hash: `0ac319e9375f372f14dd57d593487cea8d58da3e428159e6ac8817b8b23ded98`.
- Build ID: `kbGnaNbIe73XgWF1kgesj`; axe adapter `@axe-core/playwright@4.13.0`.
- One production server reused for all production routes; one account and one blog fixture server.
- All 280 screenshots captured locally; none included in the commit file list.
- Normal cleanup completed; no listeners remain on run ports 4321, 56837 or 56838.
- Two read-only subagents independently checked baseline counts and remaining-failure source ownership.

## Before / after

Counts are pass / fail / skip. Skips are not passes.

| Check | First full run | 28-release |
|---|---:|---:|
| status | 280 / 0 / 0 | 280 / 0 / 0 |
| errors | 104 / 176 / 0 | 274 / 6 / 0 |
| overflow | 280 / 0 / 0 | 280 / 0 / 0 |
| h1 | 276 / 0 / 4 | 276 / 0 / 4 |
| locale | 276 / 0 / 4 | 276 / 0 / 4 |
| seo | 164 / 0 / 116 | 164 / 0 / 116 |
| language | 276 / 0 / 4 | 276 / 0 / 4 |
| touchTargets | 73 / 65 / 142 | 125 / 13 / 142 |
| images | 276 / 0 / 4 | 276 / 0 / 4 |
| axe | 192 / 84 / 4 | 276 / 0 / 4 |

All four original hydration errors are gone. All 84 axe-failing cases now pass.
All 6,804 recorded Next static responses passed asset checks. The 176 narrowly matched local Convex CSP
diagnostics remain recorded, separately classified. Console improvement includes the approved analytics
no-ops and local CSP classification; it is not solely an app-code improvement.
## Remaining real bugs: owner fix list

All 13 mobile cases below fail the agreed 44×44 target requirement: 23 undersized targets in total.
The account fixtures render the actual controls with production CSS; these are not fixture exemptions.

| Owner | Route / cases | Evidence and required fix |
|---|---|---|
| C, shared UI | `/`, NL/EN 390 (2) | Inseam help trigger 20×20. `src/components/ui/Tooltip.tsx:45`, inner icon at 51; caller `src/components/home/SaddleHeightTeaser.tsx:38`. Give the button a 44px target while retaining the icon size. |
| D, bikes; coordinate shared defaults with C | `/bikes/new/manual`, NL/EN 390 (2) | Five controls per case are 36px high: name, riding style, goal, drivetrain, groupset. Actual implementation is `src/components/features/bikes/CreateBikeForm.tsx:306,354,385,420,453`. Make targets at least 44px. |
| D, bikes; coordinate with C | `/bikes/import/marktplaats`, NL/EN 390 (2) | URL input 36px high in `src/components/features/bikes/MarktplaatsBikeImportFlow.tsx:409`. |
| D, bikes; coordinate with C | `/bikes/import/passport`, NL/EN 390 (2) | Passport input 36px high in `src/components/features/bikes/BikePassportImportFlow.tsx:195`. |
| C, account tools | `/gearing`, NL/EN 390 (2) | Summaries are 24px and 28px high in `src/app/(dashboard)/gearing/GearingControls.tsx:112` and `GearingCalculatorForm.tsx:549`. Add sufficient clickable padding/min-height. |
| C, account tools | `/settings`, NL/EN 390 (2) | Display-name input 36px high in `src/app/(dashboard)/settings/page.tsx:256`. |
| C, account tools | `/feedback`, EN 390 (1) | “Example: compare settings” title button is 32px high in `src/app/(dashboard)/feedback/FeedbackAccountPage.tsx:254`. Add min-height; NL text wrapping above 44px does not make the valid single-line EN case safe. |

Input/Select defaults originate at `src/components/prototyper-ui/ui/input.tsx:14` and
`src/components/prototyper-ui/ui/select.tsx:27` (`h-9`). C should coordinate any shared sizing correction
with D's bike routes. The manual-bike route uses `features/bikes/CreateBikeForm`, not the separately
sized `components/bikes/BikeForm`. No fixes were made as part of this run.

## Remaining harness limitation: six console-error cases

Owner D (harness follow-up): production CSP upgrades prefetch redirects to HTTPS, but the local server
only serves HTTP. Keep all six raw failures; do not weaken app CSP or broadly suppress SSL errors.

- `/bike-fitting`, NL at both widths; `/bikefitting`, EN at both widths: four expected locale-404 cases.
- `/app`, NL/EN at 1440: two cases. All six record `ERR_SSL_PROTOCOL_ERROR` for
  `https://127.0.0.1:4321/{locale}/login`; main-document status checks pass.

A read-only Chromium diagnostic against the same running server confirmed this chain on NL mobile:

```text
/nl/bike-fitting (expected document 404)
  → fetch http://127.0.0.1:4321/nl/dashboard?_rsc=…
    next-router-prefetch: 1; next-router-segment-prefetch: /_tree
  → HTTP 307, Location: /nl/login
  → https://127.0.0.1:4321/nl/login
  → net::ERR_SSL_PROTOCOL_ERROR
```

Evidence: default-prefetch dashboard Link in `src/app/not-found.tsx:114`; unauthenticated protected-route
redirect in `src/i18n/proxyDecision.ts:60–64`; production `upgrade-insecure-requests` in
`src/lib/csp.ts:37`; plain `http.createServer` in `tests/visual/final-sweep/server.mjs:14`.
For `/app`, the same failed destination/protocol is recorded; its protected `/settings` Link at
`src/app/app/page.tsx:177` supports the same redirect mechanism. That exact initiator is inferred from
source, rather than separately network-traced. This is a local HTTP/TLS topology failure, not evidence
of a production HTTPS login failure. Follow-up: use local HTTPS/TLS termination with a trusted test
certificate and rerun these six cases; retain production CSP.

## Scope and release interpretation

Axe has 276 passes and four expected-404 skips, not 280 passes. The matrix stays at 70 audited routes;
`/design-system` remains outside scope. Checks cover light theme and initial states, not all workflows.
Account auth/data/mutations and Next navigation are fixture adapters; status does not certify live
backend authorization or persistence. Blog detail used the existing article fixture because no published
CMS slug was available; its production metadata remains unverified. These limitations are unchanged
and fully listed in run-context.json. Source hashing now includes test fixtures following 25f.

Release follow-up is the C/D touch-target fixes above plus D's TLS harness verification. A/B have no
new app fixes assigned by this run. The first sweep remains untouched; no failures were relabelled as
passes. All sweep servers and diagnostic browser sessions are closed. No commits or pushes.
