# U2 calculators — build 3 manual review

**Disposition: not approved.** This is a screenshot review, not a release gate sign-off. Source remains frozen; only this audit document was written.

## Evidence and scope

- Worktree: /Users/ortwinverreck/Developer/bikefitboost-usability
- Screenshot/report directory: /Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3
- Captured build: `nrNDRX3KXTT0C7uLLdRUZ`; report generated `2026-10-06T10:20:50.814Z`.
- Viewed with the image tool: all 44 initial calculator screenshots, covering the eleven calculators in NL/EN at 390 and 1440 px, plus 13 selected edited/reused/next/details captures listed below.
- Compared with /Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/usability-advies-v2.md and /Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/canvas/project/Calculator.dc.html, SaddleHeight.dc.html, TirePressure.dc.html and Bandenspanning.dc.html.
- Build-3 screenshots are authoritative for these visual findings. Current source includes later B/content-owner changes waiting for build 4; source inspection is not proof those changes render correctly.
- Known pending work, not rediscovered regressions: A's native-range handoff selectors; B's Edit minimum width and removal of completed-performance legacy account CTA (owner reports 51 tests passing); C's shared pressure component and example marking.
- No application source edits, rebuilds, test runs, deployments or new browser interactions were performed.

## Priority findings

### 1. P1 — full-mode saddle safety is less complete than the approved board (rules 13, 14)

Evidence: /Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/saddle-height-en-390.png; /Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/saddle-height-nl-1440.png; also both other initial saddle locale/viewport combinations and saddle-height-en-390-edited.png.

The visible full-mode safety paragraph says the range is not a safe adjustment zone, advises small changes, and says to stop for pain/tingling. That is useful and must stay visible. However, the board's **full-mode** safety section also explicitly includes:
- symptoms of too-high/too-low setup;
- “Wijkt je huidige hoogte meer dan 10 mm af? Verstel dan maximaal 5 mm per rit”;
- stop cycling and have a bikefitter examine the position, with a fitter link.

The reviewed full-mode captures do not show that complete section. The board places it outside collapsed explanation; an equivalent instruction available only in Quick Fix would not satisfy the full-mode design. This is a design/safety-content omission, not a medical judgment about the numeric model.

Required verification: render that approved safety information visibly in both languages and confirm it remains available with normal, suspicious and overridden inseam results. Quick-mode safety was not captured in this set and is **not signed off**.

### 2. P1 interaction / P2 visual — floating feedback button obscures real mobile controls (rules 3, 15; measurement safety relevance)

Evidence:
- /Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/fuel-hydration-en-390-next-calculator.png: the next saddle page has the floating “Give feedback” button over the right-hand measured/estimated selector, obscuring “Estimated”.
- /Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/fuel-hydration-en-390-edited.png: the feedback button overlaps the temperature “Use this value” confirmation.
- /Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/bike-fit-en-390-reused.png: the feedback button overlaps the height value area.
- /Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/saddle-height-en-390-edited.png: it overlays the inseam interaction area.

These captures are after cookie dismissal, so the persistent obstruction is separate from the cookie banner. A screenshot establishes overlap; it does not prove exactly which pointer coordinates are intercepted. Inspect hit testing in the next pass and move/collapse the widget so actual input choices and confirmations remain unobstructed at 390 px. A bounding-box size/contrast pass alone will not detect this.

### 3. Known pending C work — pressure defaults and shared presentation still fail the approved design (rules 8, 14; shared visual rule 11)

Evidence: all four tire-pressure initial screenshots, especially /Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/tire-pressure-en-1440.png; edited state /Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/tire-pressure-en-390-edited.png.

Untouched 75 kg / 28 mm / 28 mm values lack individual example badges and the muted example treatment used elsewhere. The result is labelled “Example starting pressure”, but that does not identify which remaining inputs are still defaults after an edit. Edited output becomes “Your starting pressure” at 5.3/5.7 bar while untouched tyre widths remain unmarked. Front/rear values share one lime result panel instead of the board's front-lime/rear-ink shared component.

The visible warning correctly tells users to respect the lower tyre/rim limit, and the page explicitly admits rim type is not used and no quantified 95% range exists. No fabricated pressure confidence interval was observed. Do not replace those honest limitations with unsupported “safe” claims. C's pending implementation must be reviewed on fresh captures; this audit does not approve it.

## Secondary concrete findings

### 4. P2 — worked-example copy is easily confused with the current saddle-width result (rules 2, 14)

Evidence: /Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/saddle-width-en-1440.png and /Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/saddle-width-nl-390.png (also the other two initial variants).

Live default result: **156 mm ±15 mm**, endpoints **141–171 mm**. The open short answer cites **147 mm**, range **142–152 mm**, referring to an “example below”. This may be a separate worked example inside collapsed content, not a calculation bug, but the open short answer does not make the separate assumptions clear and there is no immediately visible matching result. Readers are left with two widths/ranges.

Make the open answer qualitative, or explicitly distinguish the separate worked example and its inputs. Content-owner changes are pending; recheck build 4 rather than assume this remains in current source. Similarly, pressure's edited result 5.3/5.7 coexists with a static 5.2/5.6 worked-example short answer; that text does explicitly say “in this example”, so it is a lower-priority clarity issue.

### 5. P2 — current route step starts offscreen on mobile (rule 3)

Evidence: /Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/power-speed-en-390.png and the initial bike-fit, saddle-width, FTP and fuel mobile screenshots in both languages.

The progress text correctly says steps 4–6, but the horizontal pill row starts at steps 1–3. The active pill is offscreen with no explicit horizontal-scroll cue. This is internal horizontal scrolling, **not whole-page overflow**. Keep the active step visible initially or otherwise make navigation affordance clear. Desktop route rows are legible and show the active step.

### 6. P3 — reused effort value leaks an internal English enum into Dutch (rules 3, 14/localization)

Evidence: /Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3/fuel-hydration-nl-390-reused.png shows “Inspanning endurance” in “We kennen al”, while the visible selected effort is “Duur”. The numbers are consistent (150 minutes = 2.5 hours); the defect is the untranslated effort label, not reuse arithmetic. Localize known-value strings using the same labels as the controls.

## Known fixes awaiting fresh screenshots

- Rule 15: build-3 report records English Edit at **29.1875 × 44 px**. B's minimum-width fix is acknowledged, but not visually verified here.
- Rules 1/14/15: reused FTP/fuel still show the old secondary login link, e.g. “save your sweat test”; desktop line-height is **19 px**, mobile **43 px**. This also implies sweat-test saving beyond the narrower new “save ride inputs” promise. B's completed-performance CTA removal is acknowledged and needs build-4 screenshots; do not count it twice as a new task.
- Rule 3/8: timeout/missing-slider errors for saddle/frame/crank/width/gearing/climb/power and pressure's next journey stem from known selector issues. They are unresolved evidence gaps, not proof of a broken application or a pass.
- C pressure work remains outstanding as described above.

## Rule-by-rule assessment

| Rule | Manual observation | Remaining verification |
| --- | --- | --- |
| 1 | Initial non-pressure calculators have calculator-specific reason/action and a next-route card. Saddle default now includes them without requiring inseam. Build-3 bike-fit has an 811 px gap to the **start** of the account block at 390 px in both languages; FTP 212 px, fuel 332 px, per report. | Bike-fit only has 33 px margin to the one-screen start threshold; CTA lies further down. Recheck built layout and all previously interrupted cases. No inference that the entire account block fits within that interval. |
| 2 | Initial explanation/details blocks are collapsed. All 22 initial mobile PNGs are under seven 844 px screens including footer. Lowest 5.67 screens (frame EN); highest 6.86 (pressure NL). | Screenshots cannot establish server HTML. Report proves server-text presence for completed cases such as bike-fit; selector-interrupted cases need the next guard. All-open details view is intentionally longer and is not the default-height criterion. |
| 3 | Routes, numbered progress, next links and known-value strips are present. Reused bike-fit shows 184 cm/86 cm; FTP 240 W/80 kg; fuel 150 min/22°C. | Active-step mobile visibility and Dutch effort translation findings. “Retained-only” next journeys (e.g. height carried to pressure, FTP carried to fuel) prove storage retention, not visible reuse of an applicable input; do not overclaim. |
| 7 | Non-pressure chip + ladder and actual prices are visible. Paid copy names report/adjustment order; disclaimer explicitly says payment does not itself narrow the interval. | Generic fit-report promotion in performance tools is a truthful scope-limited offer visually, but screenshots alone do not prove feature fulfillment. Do not reintroduce invented paid precision to imitate a board. |
| 8 | Viewed saddle edited 191 cm removes the notice; FTP edited 295 W retains the untouched weight badge but removes the result notice; fuel edited duration retains its temperature badge. Viewed seeded bike-fit/FTP/fuel remove example markers from reused values. | Pressure remains incomplete. Finish selector-repaired journeys and profile-source checks; screenshots prove displayed state, not persistence/provenance correctness. |
| 13 | Full-mode saddle includes basic stop/pain and uncertainty cautions; pressure limit warning, FTP exertion warning, fuel “not a mandatory drinking target”, and gearing compatibility warning remain outside details. | Full saddle board-specific safety omitted (finding 1); quick mode and suspicious/overridden input states not visually covered. Safety is often well below result because account/next/ladder intervene; “not collapsed” does not mean visible alongside the number. |
| 14 | No invented paid precision or obsolete €24.50/€19.50 observed. Captures display €13.50 single fit and €21.50/year (localized in NL). Pressure explicitly admits unknown uncertainty and excluded rim type. | Worked-example clarity, known removed legacy sweat-test CTA, and actual account/backend fulfillment remain distinct checks. No blanket truthfulness approval. |
| 15 | No whole-page horizontal overflow observed in the 44 initial views. Cards/results remain within viewport. Reported completed-case axe contrast results are clean. | Known small targets require fresh evidence; feedback overlap remains untested by those checks. Visual inspection cannot certify numerical contrast or every keyboard path. |

Cookie banners obscure portions of the initial forms/results but do not cover the single-row header. Those initial captures alone cannot certify the obscured controls. Dismissed-cookie edited/reused captures were therefore used as additional evidence. This is not an upgrade overlay or a newly invented release restriction.

## Reviewed screenshot inventory

Initial screenshots directly viewed: every combination of:
- Calculator IDs: saddle-height, frame-size, crank-length, saddle-width, bike-fit, tire-pressure, gearing, climb-planner, power-speed, ftp-wkg, fuel-hydration.
- Locale: nl, en.
- Width: 390, 1440.
- Filename pattern: `<id>-<locale>-<width>.png` in /Users/ortwinverreck/Developer/bikefitboost-usability/plans/usability/renders/guard/U2-pass3.

Additional directly viewed captures:
- saddle-height-en-390-edited.png
- bike-fit-en-390-reused.png
- ftp-wkg-en-390-reused.png
- fuel-hydration-nl-390-reused.png
- fuel-hydration-en-1440-reused.png
- tire-pressure-en-390-edited.png
- bike-fit-nl-390-next-calculator.png
- ftp-wkg-en-1440-next-calculator.png
- fuel-hydration-en-390-next-calculator.png
- saddle-height-en-390-details-open.png
- bike-fit-nl-1440-reused.png
- ftp-wkg-nl-390-edited.png
- fuel-hydration-en-390-edited.png

No claims are made for unviewed warning/quick/profile screenshots, real backend persistence, full paid-product workflows, or the not-yet-captured build-4 state.

## Evidence hashes

All paths below are relative filenames within the absolute evidence directory above. Hashes computed read-only from the actual PNG files; remaining capture hashes are in the adjacent report.json.

| Screenshot | SHA-256 |
| --- | --- |
| saddle-height-en-390.png | `4747a0dfa0f71084b107573a75677a8fee7f35b8f508c3c712726d89bde8e0f6` |
| saddle-height-nl-1440.png | `e204aad6833f470fec97b8548debde79f289925a0e145cc26598e5ea77487513` |
| saddle-height-en-390-edited.png | `451c2d3090e4e3b96dabb41ede430edb80c504b00ddcdf8e3a443d41e654a293` |
| fuel-hydration-en-390-edited.png | `8df9362cda14e902a21475de72726205841930cf4030c5e85990821f4b591994` |
| fuel-hydration-en-390-next-calculator.png | `844f2b2baaf6b796703ce41ec5ebe4011ceeeeb6062459aa6b7938a963f6ad43` |
| saddle-width-en-1440.png | `bc7e001a11ee8f08aef2693bd5299d0b3093e4d4bcbff13dd431a73c0b6900f8` |
| saddle-width-nl-390.png | `7a4aa0e32ccb99625ef0c1179284dc75d292aae03dfdff87db1ae8e77c7ada7a` |
| power-speed-en-390.png | `e3b3caf99008f1688d0abe4b440c7d96fb5767408c9eed1d883733c47f14b50b` |
| fuel-hydration-nl-390-reused.png | `2948df351fac68b82757d7ed69c401bc4cab4df36981069666ebb6734b5864b6` |
| tire-pressure-en-1440.png | `fd5cfd34d25637b8759b4b29135bf13f028610b8f932fba513601cbafea5ad05` |
| tire-pressure-en-390-edited.png | `aac70ae31eb526aa9e78f943b7a8ec91e773617d6fa3bbd08d4a680fa21ef827` |
| ftp-wkg-en-390-reused.png | `8a014678564ba49f7a54867433a7c6a2edc9d59a36407b4bbc703a06c24f6490` |
| bike-fit-en-390-reused.png | `f28bc08f584bd9b1d782888ec1dd67da3dcfedb0933793e09457c16a1e2658c0` |

**Handoff:** prioritize the full-mode saddle safety omission and mobile feedback obstruction. Recheck content clarity alongside pending content fixes; C owns pressure. Run the repaired guard and review fresh screenshots after the coordinated build. This document does not autoapprove any rule or mark U2 complete.

