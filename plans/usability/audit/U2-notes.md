# U2 calculator journey — complete on final14

## Scope and implementation

- Two explicit routes: posture (5) and ride (6), with native links, current-step semantics, completion checks based on actual entered data, and next-route continuation after each route. Links contain no personal values; the existing session/profile provider remains the data source.
- Compact per-calculator account reason and benefit CTA immediately after results. Original promise retained. A reason is recorded in sessionStorage only when its block enters the viewport; the same reason is not shown on a later mount, including a language change. This does not clear calculator inputs, persist new defaults or depend on marketing consent.
- Known-values strip displays actual applied prefills, localizes enums, and focuses an editable control via Wijzig/Edit.
- Public and account shells remain distinct: new public journey is disabled for account callers. Account ranges, models, automatic save, sign-in handoff and leave-data notice retained.
- Explanatory content collapse and example-state changes are delegated in disjoint files. Their reports: U2-content-notes.md and U2-examples-notes.md.

## Truthfulness review / canvas differences

Canvas round 3 takes precedence for route order and layout. Rule14 still prevents promoting unavailable functionality:

- Saddle uses its actual shared-model current range where supplied. Repeat measurements refine uncertainty only with measurement evidence; no guaranteed fixed width or pay-to-narrow claim.
- Crank: saved inseam shared with saddle is supported. A guided femur-to-shortlist flow was not found in the live account implementation; the canvas's “Meet mijn dijbeen” promise is deferred.
- Frame: profile and bike geometry can be recorded; no claim of automatically reducing every shortlist to one size.
- FTP: account stores FTP and supplies it to gearing/climb calculations. Seasonal FTP history and a guided test are not promised.
- Fuel: save/reuse of ride duration and temperature is supported. A guided sweat-test-to-uncertainty workflow was not verified, so “Doe mijn zweettest” waits; current CTA saves ride inputs.
- Paid functionality must not manufacture evidence. A model's optional evidence flag is not proof that a working measurement flow exists. Public paid presentation ownership is being coordinated with C.

## Checks so far

- Shared journey/personalize/account-view regression run: 38 tests passed, including NL/EN route destinations, untouched storage, consented value-free analytics and reason exposure deduplication.
- Broader calculator run found obsolete example/CTA assertions; delegated to corresponding source owners for intent-preserving updates.
- TypeScript initially found a route-key inference issue; corrected to the explicit posture|ride union.
- First U2 guard requested against A's interim offline production build. Not release-green yet; final guard and screenshot review pending.

No commits, deployment, production data/env changes or real mail.

## Development pass 2

- Added public-only paid chip/ladder using PRODUCTS.single/annual catalogue prices. It describes real fit report/adjustment-order access, explicitly says payment alone cannot narrow uncertainty, and does not invent paid range values. This deliberately differs from canvas predictions where a live measurement workflow has not been established.
- Genuine measured/estimated inseam controls are preselected, preserve incoming provenance, and do not store a missing measurement. A changed measurement drops stale repeat metadata; no profile-quality downgrade bypass was added.
- Source TypeScript passes. Reliability/journey/data-reuse/pressure regression subset: **186 tests pass in 11 files**. Additional content regressions are recorded in the content handoff. Full lint exits0; its six unused-import warnings were subsequently removed by the content owner.
- Interim second-build screenshots: bike-fit mobile5683px (6.73 screens), pressure5793px (6.86), frame4937px (5.85). These are development evidence, not final approval.
- Visual inspection caught saddle intrinsic-grid expansion: a390 viewport produced653px-wide content. Fixed the grid track and component width/min-width at the cause; did not hide overflow. This also distorted cookie-button hit testing. The guard owner was notified that innerWidth alone can miss mobile expansion.
- Two content mobile height follow-ups (measurement guide7.22 screens and Dutch pain index7.02) delegated. Most other content checks pass in the interim build. Final fresh-build screenshots and manual evidence remain pending.
- Profile limitation: shared canonical-profile merge protects stronger provenance, so explicit same-value downgrades may need confirmation in the shared provider. Local results use the selected kind and emit the correct save request; no existing measured profile record is silently downgraded.

## Frozen-source gates before build 3

- Combined owned calculator/content/reliability/reuse regression run: **45 files passed, 1 skipped; 523 tests passed, 20 pre-existing skipped**. A separate latest shared component run is17/17.
- TypeScript (`--noEmit --incremental false`) passes. Full lint has no ESLint warnings after cleanup; all254 contrast checks and token-only CSS checks pass. Whole-tree diff whitespace check passes.
- All U2 source edits paused for A's coordinated source-stamped build3. `files-U2.txt` lists83 owned source/test files and excludes A/C-owned files, logs and renders.
- Account reason exposure waits for data-provider readiness so auth initialization cannot consume and then hide the first reason on desktop. Regression simulates the pending-to-session subtree replacement. A fixed the guard's clipped Base UI backing-input false positives; product radio controls remain standard accessible components.
- No green usability claim yet: final build3 guard, remaining C pressure integration and manual screenshot review still required.

## Build3 review and build4 follow-ups

- U2-pass3 completed all96 cases, but is development evidence only: A corrected the native-range handoff selector during the sweep. The previous helper required explicit role=slider, excluding valid native range inputs. Independent offline frame-to-crank navigation preserves the actual191cm edit, source and known-values strip.
- The review found the English Edit target was29px wide. Added a44px minimum width and bilingual regression assertions. Removed the legacy completed-input performance account link: it duplicated the shared reason, was too short as a target, and its fuel wording promised an unverified saved sweat-test flow. Shared account reason and next calculator remain. Focused regression:51 tests pass across2 files.
- All48 non-pressure content records passed automatic checks, but manual review caught hidden safety, appointment placeholders and layout issues. See U2-content-build3-review.md. Content corrections are in progress; those automatic passes are not manual approval.
- Pressure landing still fails shared-component rule11 in all4 variants. Public-pressure integration remains coordinated with C, not silently patched with fake guard markers. Lead was asked whether C is completing it or public ownership should transfer.
- Build4 and a fresh unfiltered U2 sweep, followed by genuine manual review, are required. No DONE/green claim.

## Manual-review fixes ready for build4

- Calculator review covered44 initial screenshots plus13 states. Added full approved saddle safety outside disclosures, including normal/warning/error states; localized effort enums; scrolled the active mobile route pill into view without moving the page.158 safety/enum/reuse tests and20 shared route tests pass.
- Content safety answers now render as non-collapsible sections. Landing-page limitation/escalation cards moved outside details; WhyBikeFit includes the board's visible no-diagnosis/pain boundary. Removed redundant NL closing accountCTA. Closed desktop measurement rows align to start. Guide intro is reader-facing rather than an editorial brief. Saddle-width short answer no longer presents a separate worked example as the active result; example table and engine values stay intact.
- FAQ appointment placeholders and unverified calendar booking promise removed in NL/EN. Readers are asked to contact the team about location, duration and terms; no terms/duration/location invented. Existing prices and visible/schema parity retained.37 focused content/schema tests passed before the additional explicit editorial safety regression.
- Parent completed the content follow-ups after stopping the content worker; no concurrent source writes. All B source is now frozen for coordinated build4.91 owned source/test paths listed in files-U2.txt.
- Shared floating feedback overlaps calculator controls at390; reported to A, who already owns its coordinated follow-up. C pressure integration remains outstanding. These external issues and fresh built evidence prevent green certification.
- Final source validation after content fixes: editorial safety suite10/10, full typecheck and lint pass with no warnings; diff whitespace clean. App source remains frozen; build4 is coordinated by A, not run concurrently by B.

## Final13 exact-build review — rule14 blocker, no DONE U2

- Reviewed frozen build `-M-UBFJekPQrNYzLqVUSV`, source hash `3face2665511ff4e87fdf204ce82e730eb2ab44d34622dd8dc6babf61dcc4d92`. Current source fingerprint, BUILD_ID and stamped provenance match the report. No app/harness/test edits or rebuilds.
- The complete captured U2 subset is96 cases,284 state screenshots and580 manual requirements. Automatic checks and case errors are zero. All380 original initial/state image hashes were independently verified and copied unchanged to `renders/guard/U2-final13-B/` with a complete scoped report. This is not a green manual finalization.
- Parent directly inspected all24 body/pressure initial screenshots (NL/EN390/1440), selected edited/next/quick states, four EN390 body reused states and the expanded EN1440 gearing page. See `U2-final13-body-review.md`. Independent reviewers cover body states, performance and content; their reports distinguish actual completed review from pending coverage.
- **Confirmed rule14 defect:** expanded gearing still promises "Clear upgrade direction" / "Directe upgrade-richting" and immediate equipment-choice guidance, while the public form outputs cadence/range. The page metadata/OpenGraph/SoftwareApplication copy additionally advertises hardest gear, speed-at-cadence and a climb verdict not rendered by that form. The corrected FTP-derived cadence explanation does not fix these separate legacy promises. Evidence: `final13/gearing-en-1440-details-open.png`, performance-review checkpoint and `src/app/(public)/calculators/gearing/page.tsx`.
- Reported A **before any edit** in `messages/B-final13-gearing-copy-finding.md`. Source remains frozen. Gearing rule14 is not approved; no strict-green finalizer or DONE U2 is claimed. A/lead must assess/correct the leftover claims and coordinate the replacement snapshot. Existing reviewed images remain historical exact-bound evidence, not approvals silently rebound to a new build.
- Review workers were stopped after checkpointing the blocking finding. Coverage is explicitly incomplete: the body-state reviewer reported all26 saddle state images passed, but the other five IDs were not fully visually reviewed; the performance checkpoint lists completed and pending views; no completed B content approval was delivered. No manual-approval JSON was generated by the parent and no pending check was converted to pass.

## Final14 confirmation — DONE U2

- Confirmed exactly build `A-_g2mE1fYoPQrVxnnicS`, source hash
  `7ac3273c4a78cb5521d3fe5debb787da095ba4e87b5a31989eb60140a8b2738d`.
  Local `.next/BUILD_ID` matches the frozen report. No source edits or rebuild performed for this confirmation.
- `renders/guard/final14/reviewed-report.json` and `.md` report all 15 rules passed,
  332 saved cases, valid build provenance, no stale sources or review errors,
  `manualOutstanding: false`, `passed: true` and `releasePassed: true`.
- U2 comprises 96 NL/EN desktop/mobile cases. Independently recomputed SHA256 for all 380 U2 initial/state
  images: every hash matches its final14 record. Verified all 580 U2 manual attestations match the exact
  build/source hash, corresponding record evidence hash and initial screenshot hash; all statuses pass.
- Accepted the attributed final14 manual reviews in `manual-review-U2-calculators-A.json` (204 checks),
  `manual-review-U2-content-A.json` (216), `manual-review-U2-performance-desktop-A.json` (64) and
  `manual-review-U2-root.json` (96). These cover calculator journeys, collapsed server-rendered content,
  routes, examples/reuse and account reasons, including the previously incomplete B review coverage.
  A's reviewers explicitly distinguish freshly inspected changed images from byte-identical historical evidence.
  This confirmation does not claim B personally re-viewed all 380 images.
- B additionally inspected final14 expanded gearing EN1440 and NL390 screenshots. The trust section now
  describes cadence estimation, assumptions and changing inputs, not component-upgrade recommendations.
  The final13 rule14 blocker is resolved by the authorized copy fix and the replacement build's review;
  final13 evidence itself remains historical. Focused tests/typecheck/lint for that fix are recorded in
  `messages/B-gearing-copy-fixed.md`.
- U2 review is confirmed green on this exact snapshot. Existing report limitations remain: loopback/fixture
  evidence does not prove live authentication, persistence, payment, production CMS routing or real mail.
  No commits, deployment, production changes or source edits. Only this audit note changed in this confirmation.
