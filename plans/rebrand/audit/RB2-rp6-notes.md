# RB2 RP6 — account saddle result

## Scope and provenance

- Lead's explicit PR14 merge authorization supersedes the plan's planning-only gate. Verified branch `feature/rb2-followups`, baseline `b16f970c4e374d3787367090036281b75ce33612`.
- Read root AGENTS/README, context index, rebrand README/RB2 plan, B4 audit/inventory and local board `plans/riderprofile/boards/RP6SaddleAccount.dc.html`. No deeper AGENTS files. No open messages at start.
- B4 reports desktop `745` split into `74` / `5`. The RP6 board renders one mono target with a smaller mm unit. This patch addresses that number's readability; it does not claim full board parity.
- No shared UI/global CSS, engine, account hooks, prefill, persistence, handoff or units changed. No builds, dependencies, commits, production access, environment changes or mail actions by this worker. Parent subsequently authorized temporary account-fixture servers consuming the approved loopback previews; both fixture servers closed after captures.

## Cause and change

`/tools/saddle-height` → `AccountFitCalculator` → `SaddleHeightCalculatorForm` → `ConfiguratorLayout` / `ResultHero`.
At desktop, the dashboard sidebar, configurator gutters and 520–540px input column constrain the results column. The saddle card nevertheless activates a two-column grid from viewport breakpoints, reserving at least 160px for its illustration. `ResultHero` uses viewport-sized type (up to 96px) and `min-w-0 break-words` on its value, allowing three digits to split inside the narrow remainder.

The saddle-only CSS module makes its card an inline-size container; its contents stack until the card content is 34rem wide. The result scales from 3rem to 6rem using the card width and the numeric span is nonshrinking, nowrap. The shared mono family, unit styling and flex wrapping stay intact. No minimum card width is imposed. CSS module selectors affect only this saddle hero.

## Focused verification

Command: `./node_modules/.bin/vitest run 'src/app/(public)/calculators/saddle-height/SaddleHeightCalculatorForm.test.tsx' 'src/app/(public)/calculators/saddle-height/PublicBodyHandoff.test.tsx' src/components/calculators/AccountFitCalculator.test.tsx src/components/calculators/useCalculatorAccountState.test.tsx`

Result: **4 files / 22 tests passed**, 1.86s. New NL/EN regression renders synthetic measured inseam84, road/balanced, flexibility4/core3 through the real adapter:745mm, then drives55/105cm boundaries and verifies the actual adapter's value, separate mm unit and mono/local layout hooks. Existing tests cover public example/estimated states, live refinement, current-height comparison, account loading/prefill, changes/trials and persistence behavior. DOM tests do not certify pixel geometry.

## Capture integration and results

Parent authorized fixture captures using baseline preview4372 (`UVZIndeVjtShDM0girzs9`) and final preview4374 (`ZXPl6jjYh3t3YVMXnwu14`, snapshot `/tmp/bbf-final-sweep-cf43609f07a9723e`). `RB2-rp6-browsercheck.mjs` requires loopback origins and `x-qa-fixture: account-read-only`, blocks off-origin browser requests and uses synthetic batch4/rider fixtures. Its narrowly scoped HTTPS GET adapter permits the self-signed certificate only at the explicitly supplied loopback origin and does not follow redirects. No Convex connection or real account data.

Selectors available on baseline and patched source:

- Card: `#saddle-result`
- Hero: `#saddle-result [data-slot="result-hero"]`
- Number: `#saddle-result [data-slot="result-hero"] dd > span:first-child`
- Unit: `#saddle-result [data-slot="result-hero"] dd > span:nth-child(2)`
- Inputs: `[data-slot="configurator-inputs"] details`, localized inseam slider.

Executed commands:

`node plans/rebrand/audit/RB2-rp6-browsercheck.mjs --preview=https://127.0.0.1:4372 --phase=before`

`node plans/rebrand/audit/RB2-rp6-browsercheck.mjs --preview=https://127.0.0.1:4374 --phase=after --source-root=/tmp/bbf-final-sweep-cf43609f07a9723e --static-dir=.next-final-sweep/static`

Both completed **20 cases / zero failures**. Each captures NL/EN at1440×1000 and390×844; synthetic745, minimum/maximum inseam (489/930mm), empty example742 and loading without premature result. There are40 viewport/full-page images plus16 result crops per phase and `geometry.json` under `plans/rebrand/renders/RB2/rp6/{before,after}`. Before requires reproducing desktop wrapping; after asserts one text line, glyph/element horizontal fit, glyph bounds within hero, value/unit bounds within card, no number clipping, mm/mono preserved and no page overflow. Text glyph boxes can exceed the line-height box vertically without clipping; those are checked against the containing hero instead. Baseline uses the original form from `git show b16f970` in an isolated copy; after uses the final source/CSS/fonts snapshot. No DOM styles reconstruct baseline.

| Locales / width | Before | After |
| --- | --- | --- |
| NL + EN /1440 | Card380px, inner grid144px +160px,96px font, number2 lines | Same card380px, single324px column,58.32px font, number1 line /98.859px wide |
| NL + EN /390 | Card326px, single286px column,48px font, number1 line | Same card326px, single286px column,51.48px font, number1 line /87.266px wide |

All16 nonloading after cases pass number fit/mono/unit/no-horizontal-overflow checks. Baseline and final desktop result crops visually inspected: the split74/5 becomes745mm on one line, with the illustration below. Full-page and viewport captures retain the actual dashboard shell. Mobile element crops initially included fixed account header/footer overlays after automatic scrolling; the capture helper now takes document-coordinate crops without scrolling to the result. The final20-case after rerun passes again; both NL/EN mobile result crops were visually inspected and show the whole unclipped745mm card. These are capture mechanics only, with no production-source changes. Both phases contain56 PNGs. Focused ESLint, script syntax and source diff-whitespace checks pass.

## Capture retry cleanup incident

Four baseline runs were needed while correcting the Playwright URL type, hidden loading-status selector, and isolated tsconfig resolution; one final run followed. The first helper retained five source snapshots beneath ignored renders. Their node_modules symlinks contaminated the parent's unit discovery, despite being git-ignored. On the parent's request all five were moved to `/private/tmp/rb2-rp6-recovered-kI0aLp`; screenshots/JSON were preserved. Verified no `source-*` directories or symlinks remain under RP6 renders. The helper now creates snapshots exclusively under `/private/tmp/rb2-rp6-source-*` and removes its own snapshot in `finally` (including setup failures). The final after rerun exercised that cleanup successfully. No test exclusions changed. The earlier full-unit run affected by discovery is not acceptance evidence; parent reruns it after cleanup.

## Remaining limits

- Account captures use actual UI with deterministic auth/Convex mocks, not authentication/server metadata or real persistence infrastructure. Focused existing hook tests cover persistence behavior; this CSS-only change does not alter it.
- Parent owns full gates, current-source CSS validation/build/crawl, public/shared integration review and final audit aggregation.
