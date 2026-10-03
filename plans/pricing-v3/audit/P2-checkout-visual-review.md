# P2 checkout manual visual review

Status: **FINAL V3 PASS — all 72 checkout cases covered; V01, V02 and V03 visually resolved. No open checkout visual findings.**

## Final v3 closure — build 6KW82hm49ljNYI1ddtwmm

Exact .next/BUILD_ID matches final capture report. Shared run completed 2026-10-03T21:24:19.592Z: 200/200 captures, zero automated failures. All 72 checkout cases are clean. Coverage remains NL/EN, 1440/390, flags OFF/ON, all nine scenarios, with 36 additional mobile viewport files.

Compared every checkout PNG against preserved renders/p2-visual/v2-screenshot-hashes.json: **100 of 108 files are byte-identical to reviewed v2 evidence; eight changed files form four OFF/ON pairs.** Manually opened all four changed representatives individually: NL/EN success-preview at 390, full-page and viewport. Both flags in each pair have identical SHA-256. Complete before/after hashes, inspection dispositions and CTA bounds are in P2-checkout-v3-hashes.json.

- V02 PASS: both rounded CTA caps and equal 16px gutters are visible in NL/EN full images and actual mobile viewports. Outcome remains before summary; price and honest preview disclaimer remain visible. Actual fixed CTA bounds before/after capture are left16, right374, width358 within viewport390 for all four locale/flag cases. No clipped right edge remains.
- V01 PASS retained by exact hash: EN stub OFF/ON390 full and viewport are unchanged from the final v2 images that visibly show the complete notice including “available.” and clearance above Pay. Viewport SHA-256 remains 30608f30288c424f89922e013ac57a6df25efde1c2df26a466e4cbcb1c9e3486.
- V03 PASS retained by exact hash: all personal-preview and appointment images match the reviewed v2 images without duplicated heading/lead. Configured external agenda transport is not exercised by placeholder fixtures.

**CSS provenance limitation:** origin http://127.0.0.1:62855/; report explicitly records same-build-disk-manifest fallback after /nl/login HTTP500, not successful production-server CSS fetching. Disk manifest build matches 6KW82hm49ljNYI1ddtwmm; global CSS SHA-256 is 899fc0bc9c857075af6679c65c5fd83b36ecc689e89213584af9910e00de66ac. This closes component-fixture visual review with compiled same-build CSS; it does not certify live proxy/auth routing or resolve the parent-owned environment issue.

Parent follow-up confirms production CSS verification returned HTTP200 with the same hash and is documented separately. The capture provenance above remains accurately recorded as disk fallback; the earlier proxy/CSS concern is superseded by that parent verification, not silently relabeled as a network-backed capture.

No app changes, competing capture/build, payments, sends, commits or deployment during this review. All historical pending/open dispositions below are superseded by this final v3 closure.

Source-ready-v3 follow-up: changed only the mobile selector to .primary.pinnedAction. Added CSS specificity regression using the existing repo source-CSS assertion pattern. 33 checkout tests, scoped ESLint and token audit pass. Requested actual fixed-control bounds assertion from Einstein. No build/capture by checkout worker. The following v2 screenshots remain the pre-v3 evidence and must not be relabeled as proof of the selector correction.

## Final capture re-review — build 0Dw9Uq506jBKvW5c7Uwwh

Exact build ID read from .next/BUILD_ID and matched final report.json. Production CSS origin http://127.0.0.1:60620/. Final report completed 2026-10-03T21:03:47.152Z: 200/200 captured, zero automated failures. All 72 checkout entries are clean. No competing capture/build or source changes during this re-review.

Hash-checked all 108 checkout PNGs against initial-screenshot-hashes.json, preserved from build UYxIkN6xXxBU0VSr0nQh7. **64 files are byte-identical to previously reviewed images; 44 changed files form 22 OFF/ON pairs.** All 22 changed representatives were manually opened and reviewed (full pages and mobile viewports); all 54 final groups still consist of exact OFF/ON pairs. Machine-readable before/after hashes, filenames and inspection disposition: P2-checkout-final-hashes.json. This covers every final checkout image without assuming unchanged output from source alone.

Changed representatives reviewed: NL and EN personal-preview/appointment at 1440; mobile code viewport; mobile stub full+viewport; mobile success-preview full+viewport; mobile personal-preview full+viewport; mobile appointment full+viewport. Code viewport changes do not introduce visible clipping or label regression. The remaining choose/account/confirm/failure and unchanged desktop/code captures retain their earlier visual assessment by exact hash match.

### V01 — visually resolved

Explicit post-completion verification requested after C's interim158-case inspection: reopened FINAL EN ON390 viewport itself. ON mtime21:03:16.445Z, OFF mtime21:02:35.991Z, final report completion21:03:47.152Z on3October2026. Both viewport SHA-256 hashes30608f30288c424f89922e013ac57a6df25efde1c2df26a466e4cbcb1c9e3486; both full-page hashes26372a4644d08401136abebed763edb2b773d7187c6ea6a0ef86fcdae076b1dd. Final ON has full “available.” line, notice border and clearance. Interim screenshot concern was stale evidence before ON replacement; V01 pass reaffirmed independently of automated metrics.

Both en-checkout-stub-{off,on}-390-viewport.png now show the **entire notice including “available.”**, its bottom border, and a clear gap above the fixed Pay region. The Dutch viewport has matching clearance. Both full-page notices are also completely readable. Fixed-position Pay can appear higher in the full-page stitch; viewport evidence confirms the actual scrolled notice is unobscured. No new consent/price issue observed.

### V03 — visually resolved

NL/EN personal-preview desktop/mobile show one appointment lead, with the distinct success H1 and one appointment heading. NL/EN authoritative appointment desktop/mobile show one appointment H1 and one lead, with no duplicate H2. Placeholders/terms remain readable and no booking link is invented. These 12 changed representative images were inspected in full.

### V02 — outcome order fixed, but new P2 pinned-action width regression

Affected final evidence: nl-checkout-success-preview-{off,on}-390.png and en-checkout-success-preview-{off,on}-390.png, plus all four viewport counterparts. The outcome now precedes the summary and the primary action is pinned as requested. However, the button begins at x=16 and extends past the right edge of the 390px viewport: the right rounded cap and intended 16px gutter are clipped. Label remains readable, but this is not board-matching or a clean fixed-control layout.

Source cause verified read-only: CheckoutFlow.module.css mobile rule `.actions > .primary, .pinnedAction` gives width calc(100% - 32px), followed by `.primary { width: 100%; }`. A standalone pinned action also has class primary; equal specificity means the later 100% rule wins. Existing `.actions > .primary` buttons have higher specificity and do not suffer this issue, explaining the good Pay/Continue controls. Configured agenda links share the affected class combination, though this run uses the placeholder and does not visually test that link.

Minimal recommended correction: make the pinned selector `.primary.pinnedAction` (or place the fixed-width rule after the generic primary width rule). Then verify success-preview mobile NL/EN OFF/ON full+viewport, preferably with a bounds assertion on the actual CTA rather than document scrollWidth alone. The final harness reports no overflow despite the clipped fixed element, so its clean automatic metrics do not close this finding.

**Final disposition:** all requested re-review coverage completed; V01/V03 pass. V02 remains open for the width regression; no source edit, rebuild or capture performed during re-review. Prior findings and original hashes below are retained as history, superseded by this section where stated.

## Source-ready-v2 follow-up

At user request, three scoped fixes were applied after the original image review. The evidence/hash manifest below still describes build UYxIkN6xXxBU0VSr0nQh7, not the changed source. No rebuild/capture run by this worker.

- V01 resolved in source, pending rerender: notices scroll immediately to their end, with mobile scroll-margin-block-end reserving 112px plus bottom safe-area inset above the pinned bar. Shell bottom clearance also includes the safe area. Removing smooth animation prevents capturing an intermediate notice position.
- V02 resolved in source, pending rerender: annual/single success action uses the mobile pinned-action style, as does a configured personal booking link. Mobile success outcome precedes its summary; desktop layout is retained. Placeholder-only personal views do not invent a booking action, and the action-plan secondary link remains unpinned there.
- V03 resolved in source, pending rerender: authoritative appointment keeps one H1 and suppresses the duplicate block H2. Personal preview lead appears only in the appointment block. Preview still has its distinct success H1 and one appointment H2.
- Focused verification: 32/32 checkout tests; scoped ESLint; full TypeScript (incremental false); CSS token audit all pass. New regressions cover immediate notice scroll targeting, one pinned success action, configured booking versus placeholder, and single title/lead in both locales. Pixel clearance requires the shared rerender; DOM tests alone do not establish it.
- Source changes limited to CheckoutFlow.tsx, AppointmentBlock.tsx, CheckoutFlow.module.css and CheckoutReview.test.tsx. No backend, pricing, settings, report, shared UI or dictionary changes.

## Evidence and scope

Reviewed the shared capture only; no competing capture, build, source edit, payment or notification. Parent owns report pages and unrelated global failures.

- Build: `UYxIkN6xXxBU0VSr0nQh7`.
- Production CSS origin: `http://127.0.0.1:58410/`; provenance: production-server.
- Report completed: 2026-10-03T20:43:52.608Z.
- Global CSS SHA-256: `899fc0bc9c857075af6679c65c5fd83b36ecc689e89213584af9910e00de66ac`.
- All 72 checkout result entries report captured=true, no runtime errors, failed requests, unknown queries or horizontal overflow.
- The final shared report has 200/200 captures and flags two non-checkout older-report cases: nl-results-free-older-on-390 and en-results-free-older-on-390. Those remain parent-owned; this review does not assert a globally clean sweep.
- 72 full-page images plus 36 mobile viewport supplements = **108 files**. SHA-256 comparison yielded **54 distinct images**, every group exactly one OFF/ON pair. Manually viewed every representative: 18 desktop full pages, 18 mobile full pages and 18 mobile viewports. No unviewed distinct checkout image remains.
- All eight reference boards read: desktop Kies, Account, Bevestig, Gelukt, Mislukt; mobile Kies, Bevestig, Gelukt. Release overrides are applied: seven-character alphanumeric OTP; explicit guarded previews with no fabricated receipt/mail; standard annual two-gift feature exception only; placeholders retained.

## Explicit coverage

Every row covers NL and EN, widths 1440 and 390, flags OFF and ON: eight full-page cases plus four mobile viewport files. Every distinct full image and viewport was inspected, not just thumbnails or automated metrics.

| Scenario | Full files covered | Mobile viewport files covered | Distinct images viewed | Disposition |
| --- | ---: | ---: | ---: | --- |
| checkout-choose | 8 | 4 | 6 | Readable, annual emphasized/first, pinned mobile continuation visible |
| checkout-account | 8 | 4 | 6 | Email form and price summary readable; form scrolls below initial viewport |
| checkout-code | 8 | 4 | 6 | Correct seven-character labels, focus ring, no input clipping in full image |
| checkout-confirm | 8 | 4 | 6 | Disabled Pay with price visible; withdrawal below fold, readable on full page |
| checkout-stub | 8 | 4 | 6 | Dutch notice clear; English mobile notice obstructed by pinned bar (V01) |
| checkout-success-preview | 8 | 4 | 6 | Disclaimer clear; mobile CTA differs from pinned board treatment (V02) |
| checkout-personal-preview | 8 | 4 | 6 | Placeholder and terms readable; repeated lead copy (V03) |
| checkout-appointment | 8 | 4 | 6 | Authoritative fixture, no preview/success claim; repeated heading (V03) |
| checkout-failure-preview | 8 | 4 | 6 | Disclaimer, failure message and single retry action readable |
| **Total** | **72** | **36** | **54** | **Complete coverage, findings below** |

## Findings

### V01 — P2: English mobile stub notice is partly hidden behind pinned Pay

Affected: `en-checkout-stub-off-390.png`, `en-checkout-stub-on-390.png`, and their `-viewport.png` counterparts (groups 45/46 in the hash manifest).

The notice reads “Payment through Stripe has not been implemented yet. Your choice has been saved; we’ll let you know when checkout is …” but the final “available.” line/bottom of the notice lies under the white-backed fixed Pay bar. The viewport demonstrates actual post-click overlap; this is not merely a full-page stitching artifact. The Dutch counterpart is fully readable with space before its pinned bar.

Likely repair: account for the fixed action region when scrolling the newly rendered notice into view (mobile scroll-margin/scroll-padding), and capture after the scroll settles. Preserve the pinned Pay price/action and sufficient bottom content clearance. The current screenshots do not prove the content is permanently unreachable by manual scrolling; they do prove the automatically presented payment result is obscured.

**Disposition:** resolved in source-ready-v2, pending Einstein-owned recapture of checkout-stub in both locales at 390, flags OFF/ON, full plus viewport. Original findings refer exactly to the pre-fix shared evidence below.

### V02 — P3: mobile annual success CTA is inline, not board-pinned

Affected: `{nl,en}-checkout-success-preview-{off,on}-390.png` and viewport supplements.

The mobile Gelukt board places the action-plan CTA in the bottom action area, with the outcome prominent. Actual screenshots place an expanded choice summary before the result; the action-plan CTA is inline below the initial 844px viewport. It is readable and reachable in the full-page image, so this is a board-fidelity/hierarchy difference, not a broken link or payment problem. Guarded preview only. Parent can accept the difference or request alignment; do not call it pixel-matched to the board.

For personal appointment, an absent booking button is expected while [AGENDALINK] is unconfigured; this is not counted as a broken CTA. **Disposition:** resolved in source-ready-v2, pending shared success/personal rerender.

### V03 — P3: duplicate personal appointment heading/lead

Affected: personal-preview and appointment, NL/EN, 1440/390, OFF/ON.

Personal preview repeats the location/duration/fitter lead before and inside “Plan je afspraak / Book your appointment.” Authoritative appointment repeats the same title as adjacent H1 and H2. Text remains readable and placeholders honest, but repeated content elongates mobile screens and is absent from the compact board hierarchy. **Disposition:** resolved in source-ready-v2, pending shared personal-preview/appointment rerender; no access, payment or notification effect.

## Other visual observations / passes

- Desktop cards are side by side; annual is central, taller, dark ink with lime price/badge. Mobile annual is first. All visible amounts/VAT and renewal copy are readable; the EN personal selection label wraps within its button-shaped control without clipping.
- Distraction-free header/compact legal footer only: no marketing navigation, marketing footer or Ontwerpstaat strip in these fixture captures.
- No horizontal overflow or broken font/image observed. Both locales preserve clear typography, card edges, spacing and aligned desktop columns.
- Mobile choose/confirm pinned controls stay within the viewport and show the chosen amount. The full-page choose/confirm PNGs show the fixed bar at the viewport-relative scroll position, over lower product/total content; this alone is not a persistent obstruction because content scrolls beneath the bar. V01 is specifically the post-payment notice's presented position, corroborated by its viewport.
- Account send-code button is near/below the initial mobile fold; code confirmation action is further down. Full images show complete controls and helper text. There is no dedicated mobile Account board, and no sticky auth-action requirement was inferred.
- Seven-character OTP label is correct in both languages. Synthetic visual@example.invalid is fixture identity, not live email evidence.
- Confirm has unchecked consent and visibly disabled Pay. Stub has checked consent, unchanged confirmation screen and shared unimplemented notice; no successful payment, activation or confirmation-email claim.
- Success/failure previews display the explicit no-payment/no-access/no-mail notice; no fabricated date/receipt. Personal agenda, location, duration and legal placeholders remain visible.
- Programmatically focused headings have browser blue focus outlines in initial/result screenshots. Recorded as focus-state presentation, not a text clipping defect; focus visibility should not simply be removed for cosmetic matching.

## Fixture limits

This is a review of actual app component/layout bundles using deterministic synthetic auth/Convex data and production-build CSS. It does not verify live OTP delivery, server authorization, Next hydration, middleware, real payments, mail transport or booking completion. Root cookie/feedback overlays are not established by these isolated fixtures. No configured agenda URL appears: the authoritative appointment fixture still uses [AGENDALINK].

The matrix does not separately capture single/intro/personal confirmation, signed-in Account, invalid-code/error/storage-denied states, configured agenda, dark mode, mobile keyboard, scrolling every position or browsers other than the harness Chromium. Unit/contract tests cover several of these behavioral boundaries; that is not additional visual coverage.

## Byte-identical grouping and inspection manifest

Base directory: `plans/pricing-v3/renders/p2-visual/`. Each first filename below was manually viewed in full. Its second filename was independently SHA-256 verified byte-identical and is covered by that same visual inspection. No grouping across different locale, step or full/viewport content was assumed.

| Group | Viewed representative | Byte-identical counterpart | SHA-256 |
| --- | --- | --- | --- |
| 1 | `nl-checkout-choose-off-1440.png` | `nl-checkout-choose-on-1440.png` | `a1d8a4e92227052bb806f9a04d0c5c045c97c23f418fc7fafa04b6c10c1c325d` |
| 2 | `nl-checkout-account-off-1440.png` | `nl-checkout-account-on-1440.png` | `1577ed0661f5c46bb62f494de90fbbbd8c298f63b1e26850935ac4138067ffed` |
| 3 | `nl-checkout-code-off-1440.png` | `nl-checkout-code-on-1440.png` | `adf973d793966bee9daa85a20569a169c28cad5940527c0a5f60011b11570c03` |
| 4 | `nl-checkout-confirm-off-1440.png` | `nl-checkout-confirm-on-1440.png` | `2c106501fcfa9144564e5508f692b496a3a6823b51b0141ac0366d23ea9b7335` |
| 5 | `nl-checkout-stub-off-1440.png` | `nl-checkout-stub-on-1440.png` | `858800d3206488bd8b52b9fd5c3409c0cad93f0f697f493e0c0d10da490fce81` |
| 6 | `nl-checkout-success-preview-off-1440.png` | `nl-checkout-success-preview-on-1440.png` | `614ec062506e4457eb62db71c8e954f8c7e2e432d973dacdc2c41053563b91ba` |
| 7 | `nl-checkout-personal-preview-off-1440.png` | `nl-checkout-personal-preview-on-1440.png` | `fca01ef6f040a82b775f47e754baac56a8f3865dc509858e974c7bf36d6f6e0d` |
| 8 | `nl-checkout-appointment-off-1440.png` | `nl-checkout-appointment-on-1440.png` | `550350ce6c0a4ce2949fdfc1ac25ba56938753012fbbb74700b4cafed0fba469` |
| 9 | `nl-checkout-failure-preview-off-1440.png` | `nl-checkout-failure-preview-on-1440.png` | `9968bc71129ec1f9068b114aa8077a7e583197deb3e3d72de0fc41a375eee849` |
| 10 | `nl-checkout-choose-off-390.png` | `nl-checkout-choose-on-390.png` | `6275d761ee7ba01af332434e481de4fdd0e723dfec9d3fdf0fa2be6cea1bb336` |
| 11 | `nl-checkout-choose-off-390-viewport.png` | `nl-checkout-choose-on-390-viewport.png` | `1eac04519b2b7347eb23fbd514301dd3c61a3469497b2c5d14ab8240fcade5ec` |
| 12 | `nl-checkout-account-off-390.png` | `nl-checkout-account-on-390.png` | `32431d0f6eb34a1a0e3c05121505dc11f07625f92ae121fe4c8f451627f7dc39` |
| 13 | `nl-checkout-account-off-390-viewport.png` | `nl-checkout-account-on-390-viewport.png` | `0ecbc04ebc106116fa8adc2ded041ec8a74143d1cb0b6708d55779c75e2cabaf` |
| 14 | `nl-checkout-code-off-390.png` | `nl-checkout-code-on-390.png` | `6fc837488b2ca71efff8fb98fd3b8d7f357e324b0b611c54359ea2c997676315` |
| 15 | `nl-checkout-code-off-390-viewport.png` | `nl-checkout-code-on-390-viewport.png` | `e4dba40b7ff16b7c4b8370e1f3f985a14452c46019184b1ecde87c3289c741a3` |
| 16 | `nl-checkout-confirm-off-390.png` | `nl-checkout-confirm-on-390.png` | `11391db1ca1a02b4cf9136a60ffa7ee15532f60a9a967abebba089b929bab193` |
| 17 | `nl-checkout-confirm-off-390-viewport.png` | `nl-checkout-confirm-on-390-viewport.png` | `17de29905f62a9eae66d9529eacc7d3a6a58658927be6d1113e7b8f2d290d036` |
| 18 | `nl-checkout-stub-off-390.png` | `nl-checkout-stub-on-390.png` | `d1c9fedd9772cd07cb20afa5129ddc6b2bf9aacecf503e90deddf91aa37100a5` |
| 19 | `nl-checkout-stub-off-390-viewport.png` | `nl-checkout-stub-on-390-viewport.png` | `7b5eb9d3ab2a5e70644cb5ccadf636dcf9bcd04398aa616e8f2a27d61ff29076` |
| 20 | `nl-checkout-success-preview-off-390.png` | `nl-checkout-success-preview-on-390.png` | `f34631288da55038202c628272f12b30fc42383e14acadffe6880c4cb7f5be41` |
| 21 | `nl-checkout-success-preview-off-390-viewport.png` | `nl-checkout-success-preview-on-390-viewport.png` | `ee42147f4a6ca9168cff0f1c2e014754da9432a643a4cd8a12daef1128a49564` |
| 22 | `nl-checkout-personal-preview-off-390.png` | `nl-checkout-personal-preview-on-390.png` | `f868d85f9a0ab3ee9250df42fcbaef1644b2e01db25c2d431f15ee961a11147e` |
| 23 | `nl-checkout-personal-preview-off-390-viewport.png` | `nl-checkout-personal-preview-on-390-viewport.png` | `c55ffa6a14ddb814abb9ae50c45779f3eff29f500666551742e598958f5af59c` |
| 24 | `nl-checkout-appointment-off-390.png` | `nl-checkout-appointment-on-390.png` | `2cd5e95543d0a92345475ceb5e0d35a85523fe6aca6fcda4081c7acb2b8a451f` |
| 25 | `nl-checkout-appointment-off-390-viewport.png` | `nl-checkout-appointment-on-390-viewport.png` | `c6960dbcce52b42d3da7e849f33e470d6146b9c71c02af164a028282914c0988` |
| 26 | `nl-checkout-failure-preview-off-390.png` | `nl-checkout-failure-preview-on-390.png` | `fd5c6f2c23c1c42272f1da024a925ebfe8f09507fc105c591a0d0884b269937c` |
| 27 | `nl-checkout-failure-preview-off-390-viewport.png` | `nl-checkout-failure-preview-on-390-viewport.png` | `22f8ed91ddc710eed04ea5874060cd5d47cc38fcdf03b9e5b18ca803252dc669` |
| 28 | `en-checkout-choose-off-1440.png` | `en-checkout-choose-on-1440.png` | `e7029be253840e5cbe23243ba8341323b687d38d6b26867e8ace65cb852042ca` |
| 29 | `en-checkout-account-off-1440.png` | `en-checkout-account-on-1440.png` | `596d7ee30827157ba5fa3d1316cbb51b89473ecd15aca5ff4a366210e01211e8` |
| 30 | `en-checkout-code-off-1440.png` | `en-checkout-code-on-1440.png` | `ceb49b86af555609d88f33b6ac25d1a52c73357819e2e040be82047c20937a0c` |
| 31 | `en-checkout-confirm-off-1440.png` | `en-checkout-confirm-on-1440.png` | `45b2ea3f6146af36e88bceeee97fab730c8ca237ac18f40c3189db80595baddd` |
| 32 | `en-checkout-stub-off-1440.png` | `en-checkout-stub-on-1440.png` | `e708ad9ceec279aaf681026edac55f3b02a1d73920189c653488b7ea49447e28` |
| 33 | `en-checkout-success-preview-off-1440.png` | `en-checkout-success-preview-on-1440.png` | `8a4af3e98e37d01119701579ed8fa7449c2893d88f7515d1177992076a18eb94` |
| 34 | `en-checkout-personal-preview-off-1440.png` | `en-checkout-personal-preview-on-1440.png` | `36953d0517dba9ba8a955cc560fbdf4e28fbf62928b3ce427ef28e1dd8b71182` |
| 35 | `en-checkout-appointment-off-1440.png` | `en-checkout-appointment-on-1440.png` | `04aa11dca70680e6f6c8b872264f94d69a7dc2cb55185ca3e126431e47ed8358` |
| 36 | `en-checkout-failure-preview-off-1440.png` | `en-checkout-failure-preview-on-1440.png` | `eca4fc6da274dbced390f2409a7e53134b0b396b78760038c1256c609efb8bf5` |
| 37 | `en-checkout-choose-off-390.png` | `en-checkout-choose-on-390.png` | `51e533c293563cb89f704ee6afbbdd65827bbd5928b4253e31e6c5e553423311` |
| 38 | `en-checkout-choose-off-390-viewport.png` | `en-checkout-choose-on-390-viewport.png` | `ef99497b712afd96c1fb9f4c2f502bf1d77ed1f368a26e8e58db6e2aa9eba7d7` |
| 39 | `en-checkout-account-off-390.png` | `en-checkout-account-on-390.png` | `53f1e80350579597bb0d4a47baacdcf713483ef3316284018a4699e82295ced4` |
| 40 | `en-checkout-account-off-390-viewport.png` | `en-checkout-account-on-390-viewport.png` | `81ebf45702c6288568f348ac8dd28dcc21a10257e02165a488ccf11ed3025c81` |
| 41 | `en-checkout-code-off-390.png` | `en-checkout-code-on-390.png` | `c94d3b5e8324002816de4894dfe7415ed860522f91d88d180d682b21dce8cf00` |
| 42 | `en-checkout-code-off-390-viewport.png` | `en-checkout-code-on-390-viewport.png` | `b6b02e8ec3ec9e44aaabfd9422e2760deb66fbc51658ca037742e811945c7d71` |
| 43 | `en-checkout-confirm-off-390.png` | `en-checkout-confirm-on-390.png` | `91acb1b7be2e4fdfec39135ab86f1b8c03c1c747f66c6a9047edeffa8adff120` |
| 44 | `en-checkout-confirm-off-390-viewport.png` | `en-checkout-confirm-on-390-viewport.png` | `ca9cf0e0430ee1146c9ab7cd091ed5f26b134a52b530f6e0220a9829175d4e86` |
| 45 | `en-checkout-stub-off-390.png` | `en-checkout-stub-on-390.png` | `5ae6d02a321bc8eddbd59aa9281469d204f03d9d77c10b28b7d080e1cf0841de` |
| 46 | `en-checkout-stub-off-390-viewport.png` | `en-checkout-stub-on-390-viewport.png` | `c0451ad59e433e8a9ca85f873c229a235e64ec83e9897daaab2b9862235605c2` |
| 47 | `en-checkout-success-preview-off-390.png` | `en-checkout-success-preview-on-390.png` | `5d16fe22fbc2553fc817d04c0afb3806b5d1dac95047c4eade6444aa0e96a87c` |
| 48 | `en-checkout-success-preview-off-390-viewport.png` | `en-checkout-success-preview-on-390-viewport.png` | `bd520b09030d99094fd16caf9e73300c6c70f42e770cffa917bc1a6a782c0a78` |
| 49 | `en-checkout-personal-preview-off-390.png` | `en-checkout-personal-preview-on-390.png` | `7365faaacf3a0d30b38b580b56e7d34a6436a1a357c1f34fce45a72ab47f4a8d` |
| 50 | `en-checkout-personal-preview-off-390-viewport.png` | `en-checkout-personal-preview-on-390-viewport.png` | `e1c60d4689a9de3b2d591442688ef18326dc0db5b6fc32b0cb03d8b085214962` |
| 51 | `en-checkout-appointment-off-390.png` | `en-checkout-appointment-on-390.png` | `55debcac0162903e8e19680d4062e75300abb171b7451c2bf51a58861a1abc9f` |
| 52 | `en-checkout-appointment-off-390-viewport.png` | `en-checkout-appointment-on-390-viewport.png` | `c001d77e7fd1b1e4a23c860e3428069d86b04074854cf196608842a1b20194fb` |
| 53 | `en-checkout-failure-preview-off-390.png` | `en-checkout-failure-preview-on-390.png` | `6483f93fc8e569fe8ac38c076db5558c9f00b467465ebce28678bade8524b344` |
| 54 | `en-checkout-failure-preview-off-390-viewport.png` | `en-checkout-failure-preview-on-390-viewport.png` | `5e3430b1bb26631023076ea69b24294eec044260a1822e13aab01e7e257f13d3` |

## Handoff

Original manual review assignment is complete. All three findings are now resolved in scoped source, pending shared rebuild/rerender; do not use the old hashes as proof of the fixes. Parent coordinates the one shared rebuild and Einstein recapture. Notification integration remains resolved; actual transport intentionally unimplemented. No reports or other owners' source files were edited.
