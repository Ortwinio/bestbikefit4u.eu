**BestBikeFit4U Fit Recommendation Report v2**

Improved rider-facing report, migration instructions from the existing report, and tire-pressure module.

Baseline source: existing session report k579d6b5vm0hd9g9agehtv8r9s81fsgc, created 2026-02-19. This redesign preserves the existing fit targets and adds missing implementation context, data-quality flags, and a tire-pressure section.

| What changes in v2: clear rider profile, method labels, adjustment instructions, missing-data handling, single-language export, and a tire-pressure module that can produce front/rear recommendations once weight and tire inputs are captured. |
| :---- |

**Baseline fit targets carried into v2**

| Cleats | Saddle | Front end | Frame target |
| :---: | :---: | :---: | :---: |
| 6 mm behind ball of foot | 758 mm height55 mm setback | 71 mm drop522 mm reach100 mm stem at \-6° | Stack 657 mmReach 467 mmXL / 59–62 cm |

**Current-report data present vs. missing**

| Available now | Missing in current report | Impact on v2 |
| ----- | ----- | ----- |
| Bike type, riding style, goal, confidence, inseam, fit targets, frame target | Rider weight, bike+gear weight, measured tire width, tire type, rim internal width, current bike measurements, pain history | **v2 can preserve fit outputs now, but tire pressure and delta-vs-current must be flagged as pending until these inputs are added.** |

**Part A — Proposed rider-facing report v2**

**Intent.** This section shows the upgraded report as a rider would receive it. It uses the existing fit outputs and makes missing data explicit instead of implying false precision.

**1\. Rider profile and fit objective**

| Field | Value | Field | Value |
| ----- | ----- | ----- | ----- |
| Session ID | k579d6b5vm0hd9g9agehtv8r9s81fsgc | Bike type | Road |
| Riding style | Sportive | Primary goal | Balanced |
| Algorithm version | 1.0.0 | Global confidence | 90% |
| Body metrics in source | 860 mm inseam; torso and arm length used | Language export | Single language PDF \+ in-app language toggle |
| Data quality status | Fit targets available | Missing data | Weight, tire width, rim width, current contact-point values |

**2\. Summary recommendation**

| Priority | Target | Why it matters | Rider validation | Status |
| ----- | ----- | ----- | ----- | ----- |
| 1 — Cleat position | 6 mm behind ball of foot | Stabilizes foot platform and reduces calf/forefoot load | No hot spot under forefoot; foot tracks neutrally | Ready to apply |
| 2 — Saddle height | 758 mm | Primary driver for knee extension timing and lower-limb load | No hip rocking; smooth spin after 15–20 min | Ready to apply |
| 3 — Saddle setback | 55 mm behind BB | Improves hip position and seated pedaling stability | Balanced pressure between saddle and hands | Ready to apply |
| 4 — Front-end height | 71 mm bar drop | Sets comfort–aero balance for sportive road riding | Comfortable in hoods and drops on 30–45 min ride | Ready to apply |
| 5 — Reach tuning | 522 mm total reach via 100 mm stem at \-6° | Completes upper-body load distribution after saddle is set | Soft elbows; no excessive hand pressure | Ready to apply |

**3\. Detailed fit table**

| Parameter | Target | Display method label | What the rider should feel | Watch-outs |
| ----- | ----- | ----- | ----- | ----- |
| Saddle height | 758 mm (source range 740–783 mm) | LeMond baseline \+ Holmes validation band | Smooth extension without reaching | Too high: hip rock / hamstring tension. Too low: anterior knee load. |
| Saddle setback | 55 mm behind BB | KOPS-informed starting point \+ stability correction | Stable pelvis and consistent seated power | Too far forward: quad overload. Too far back: hamstring overload. |
| Handlebar drop | 71 mm | Terrain/goal correction for sportive road | Neutral trunk angle for longer rides | Too low: neck and low-back strain. |
| Handlebar reach | 522 mm | Stack/reach and contact-point model | Relaxed shoulders with slight elbow bend | Too long: hand numbness and shoulder tension. |
| Stem | 100 mm at \-6° | Fine-tune once saddle is locked | Upper-body support without collapsing to bars | Do not solve saddle errors with stem swaps first. |
| Crank length | 172.5 mm | Existing output retained | Natural cadence and hip clearance | Re-test only if hip pinching remains. |
| Handlebar width | 440 mm | Existing output retained | Neutral wrist line and stable steering | Oversize bars can increase shoulder opening. |
| Frame target | Stack 657 mm / Reach 467 mm / ETT 572 mm | Brand-neutral geometry target | Makes frame search portable across brands | Use stack/reach first, nominal frame size second. |

**4\. Adjustment sequence and measurement references**

| Adjustment order | Measurement reference |
| ----- | ----- |
| 1\. Cleats2\. Saddle height3\. Saddle setback4\. Saddle tilt5\. Bar drop (spacers)6\. Stem / reach tuning | Saddle height: BB center to saddle top along seat-tube lineSetback: BB vertical to saddle noseReach: saddle tip to handlebar centerDrop: saddle top to handlebar top |

| Rule: change one variable at a time, limit each move to 2–5 mm, then re-check comfort, control, and pressure points on a short ride before moving to the next item. |
| :---- |

**5\. Tire-pressure module**

**Status in this sample report:** final front/rear pressure cannot be calculated from the current source report because rider weight, bike+gear weight, measured tire width, tire construction, and rim internal width are not captured.

**What v2 should display when inputs are complete:** front pressure, rear pressure, unit toggle (psi / bar), confidence, and guardrails for tire/rim maximum pressure.

| Required new input | Why it is needed | Example UI control |
| ----- | ----- | ----- |
| Rider weight \+ bike \+ gear mass | Primary load input for tire deformation | Required numeric fields with kg default |
| Measured tire width | Actual tire volume is more predictive than labeled width | Dropdown \+ measured-width override |
| Tire type | Tubeless / latex / butyl changes starting pressure | Segmented control |
| Rim internal width | Wider rims generally support lower pressure | Geometry DB lookup with manual override |
| Surface condition | Rougher surfaces require lower pressure | Road condition picker |

**Road-paved quick-start chart for tubeless setups**

Use only as a starting point when exact data are incomplete. The table below reflects published paved-road tubeless starting pressures for modern road wheels with 28 mm and 30 mm tires; final pressure must still respect tire, rim, and manufacturer limits.

| Rider weight | 28 mm front/rear | 28 mm bar | 30 mm front/rear | 30 mm bar |
| ----- | ----- | ----- | ----- | ----- |
| 60 kg | 52 / 56 psi | 3.6 / 3.9 | 48 / 51 psi | 3.3 / 3.5 |
| 70 kg | 55 / 58 psi | 3.8 / 4.0 | 50 / 53 psi | 3.4 / 3.7 |
| 80 kg | 57 / 61 psi | 3.9 / 4.2 | 52 / 56 psi | 3.6 / 3.9 |
| 90 kg | 59 / 64 psi | 4.1 / 4.4 | 54 / 58 psi | 3.7 / 4.0 |
| 100 kg | 61 / 66 psi | 4.2 / 4.6 | 56 / 61 psi | 3.9 / 4.2 |

| Pressure logic to surface in the report: front is lower than rear on road bikes; larger tires, wider internal rims, and rougher surfaces generally push the optimum pressure downward; always cap the recommendation at the lower of the tire, rim, and hookless/ETRTO limits published for the rider’s setup. |
| :---- |

**6\. 14-day validation plan**

| Day block | Change to make | Ride duration | What to score after ride |
| ----- | ----- | ----- | ----- |
| Days 1–3 | Cleats only | 30–45 min easy | Forefoot pressure, foot stability, cadence feel |
| Days 4–7 | Saddle height | 45–60 min easy to moderate | Knee comfort, hip stability, spin smoothness |
| Days 8–10 | Saddle setback | 45–75 min steady | Hand pressure, seated power, pelvic stability |
| Days 11–14 | Drop and reach | 60–90 min sportive ride | Neck/back fatigue, breathing, comfort in drops |

**Part B — Migration instructions: existing report → v2**

**Goal.** Migrate without breaking current outputs. Preserve existing fit calculations first, then add new inputs and modules behind explicit status flags.

**1\. Old-to-new section map**

| Current section | Problem in v1 | New section in v2 | Migration action |
| ----- | ----- | ----- | ----- |
| Executive Summary | Targets shown without current-vs-target context | Priority changes at a glance | Keep targets; add rationale, rider check, and status chip. |
| Why Bike Fitting Matters | Generic copy consumes space | Move to one short note or onboarding page | Shorten in PDF; keep expanded education in app. |
| Scientific Basis | Too generic; no method labels | Method display per parameter | Add method tags per metric rather than a generic paragraph. |
| Core Fit Metrics | Flat list, hard to scan | Detailed fit table | Render as structured table with units, range, and watch-outs. |
| Adjustment Order | Good content but under-specified | Adjustment sequence \+ measurement reference | Add exact reference points and validation cues. |
| Frame Recommendation Summary | Only nominal size shown | Frame geometry target block | Keep size range, elevate stack/reach as primary output. |
| 14-Day Plan | Useful but too compressed | Validation plan with scoring fields | Retain plan, add score columns and app sync. |
| Fit Notes / Disclaimer | Fine, but under-leveraged | Data quality, risk note, and safety footer | Split into missing-data note, risk note, and footer. |

**2\. Data-model additions**

| Domain | Field | Type | Reason |
| ----- | ----- | ----- | ----- |
| user\_input | rider\_weight\_kg | number | Required for tire-pressure calculation |
| user\_input | bike\_weight\_kg | number | Supports system-mass-based pressure logic |
| user\_input | gear\_weight\_kg | number | Captures bottles, tools, clothing |
| bike\_setup | tire\_measured\_width\_mm | number | Use measured width, not label, when available |
| bike\_setup | tire\_type | enum\[tubeless, latex, butyl, puncture-resistant\] | Different casings need different starting pressure |
| bike\_setup | rim\_internal\_width\_mm | number | Changes tire support and pressure target |
| ride\_context | surface\_condition | enum\[new pavement, worn pavement, chipseal, gravel\] | Lower pressure on rougher surfaces |
| current\_bike | current\_saddle\_height\_mm | number | Enables delta-from-current in report |
| current\_bike | current\_setback\_mm | number | Enables delta-from-current in report |
| current\_bike | current\_drop\_mm | number | Enables migration from current bike to recommended bike |
| output | front\_tire\_pressure\_psi | number | New rider-facing output |
| output | rear\_tire\_pressure\_psi | number | New rider-facing output |
| output | fit\_confidence\_by\_metric | object | Avoids a single score masking weak inputs |
| output | pending\_fields | array\[string\] | Honest missing-data handling |

**3\. Calculation-layer migration**

| Phase | What changes | Delivery rule |
| ----- | ----- | ----- |
| Phase 1 — non-breaking | Keep existing fit outputs exactly as today; only reformat them in new report template | No regression in saddle / setback / reach targets |
| Phase 2 — richer context | Add method labels, current-vs-target deltas, and per-metric confidence | Only show a delta when a current value exists |
| Phase 3 — tire pressure | Add front/rear pressure engine with guardrails and missing-data flags | No tire number is shown unless required fields are present or output is marked provisional |
| Phase 4 — commercial layer | Enable premium toggles: visual diagrams, frame matching, adaptive validation prompts | Free tier remains readable; premium adds coaching depth |

**4\. API / payload mapping example**

Recommended strategy: keep v1 keys during transition, build a mapper to the new payload, then deprecate the old schema only after the renderer and app both consume v2 successfully.

| v1 field | v2 destination |
| ----- | ----- |
| bike\_type | profile.bikeType |
| riding\_style | profile.ridingStyle |
| primary\_goal | profile.goal |
| confidence\_score | summary.globalConfidence |
| saddle\_height\_mm | fit.saddle.height.targetMm |
| saddle\_setback\_mm | fit.saddle.setback.targetMm |
| handlebar\_drop\_mm | fit.frontEnd.drop.targetMm |
| handlebar\_reach\_mm | fit.frontEnd.reach.targetMm |
| stem\_length\_mm / stem\_angle\_deg | fit.frontEnd.stem |
| frame\_stack\_target\_mm / frame\_reach\_target\_mm | frame.stackTargetMm / frame.reachTargetMm |

| {   "profile": {     "bikeType": "road",     "ridingStyle": "sportive",     "goal": "balanced"   },   "fit": {     "saddle": {"heightMm": 758, "setbackMm": 55},     "frontEnd": {"dropMm": 71, "reachMm": 522, "stem": {"lengthMm": 100, "angleDeg": \-6}}   },   "frame": {"stackTargetMm": 657, "reachTargetMm": 467, "sizeRange": "XL / 59-62 cm"},   "tirePressure": {     "status": "pending\_required\_inputs",     "required": \["rider\_weight\_kg", "bike\_weight\_kg", "gear\_weight\_kg", "tire\_measured\_width\_mm", "tire\_type", "rim\_internal\_width\_mm", "surface\_condition"\]   } } |
| :---- |

**5\. Rendering and UX migration**

| Renderer change | Why | Implementation note |
| ----- | ----- | ----- |
| Single-language export | Cuts PDF length and improves scannability | Keep EN/NL in app; export one language at a time |
| Tables and status chips instead of repeated prose | Improves rider comprehension in the workshop | Use reusable components for summary, metrics, and plan |
| Missing-data banners | Prevents false precision | Show 'Pending rider data' rather than blank values |
| Unit support | Pressure must support psi and bar | Persist canonical SI values, render unit preference |

**6\. Rollout plan**

| Sprint | Primary deliverable | Risk | Exit criteria |
| ----- | ----- | ----- | ----- |
| Sprint 1 | New PDF template using existing fit outputs | Formatting regressions | PDF approved with no change to current target values |
| Sprint 2 | Current-vs-target deltas and data-quality flags | Null handling | All missing inputs rendered explicitly |
| Sprint 3 | Tire-pressure input capture \+ engine | Conflicts with tire/rim limits | Guardrail tests pass for hooked and hookless cases |
| Sprint 4 | App guidance, validation logging, analytics | Feature creep | Rider can complete one adjustment workflow end-to-end |

**References used for the tire-pressure module**

**•** SRAM / Zipp, Total System Efficiency white paper: paved-road tubeless starting-pressure table for 28 mm and 30 mm tires.

**•** SILCA Professional Tire Pressure Calculator: required variables include total system weight, surface condition, measured tire width, tire type, speed, and weight distribution.

**•** ENVE Tire Pressure Recommendations and Hookless Rim Technology guidance: pressure should be treated as a starting point, and manufacturer / ETRTO maximums must be respected, especially on hookless road systems.