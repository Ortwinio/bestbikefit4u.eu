# 44b-D — guide rewrites and illustrations

Owner D, 2026-10-01. No commit, push, deployment or database writes.

## Delivery

All twelve assigned guides have new Dutch-first and matching English articles in
`src/lib/guides/content/batch-d`. Slugs stay unchanged, including the pain and ride-type hubs.
Each version has a quick answer, the five required sections, six numbered steps, four FAQs,
three or four related guides, a calculator link and a closing CTA. Links use the exact localized
rewritten title; every D guide has at least two inbound links within D alone.

`scripts/guides-batch-d/export.mjs` writes twelve bilingual CMS-schema review documents under
`plans/redesign-canvas/guides-import` and the lightweight `guideRewriteTitlesD.ts` map.
Documents remain `in_review`, carry `importStatus=44b`, and preserve the closing CTA in `body`.
The exporter makes no database connection. CMS publishing remains a separate lead-approved step.

Shared integration is owned by C. D did not edit the shared registry, renderer, title registry or audit.
The registration request is in `messages/20261001-d-to-c-info-44b-registration.md`.

## Illustrations

Read the complete required bestbikefit4u-illustraties skill, including its appendix:
`/Users/ortwinverreck/.claude/skills/synced/0c1abaed-2dd7-48aa-9c40-860558849b78_86c85444-dcee-46eb-ac3a-bd832bfd8388/bestbikefit4u-illustraties/SKILL.md`.
Used route B: `scripts/guides-batch-d/draw.py` reuses C's verbatim `pen.py` and `fiets.py` extraction.
No new package dependency. Temporary Python environment and installed Cairo render the assets.

Twelve new SVG/WebP pairs numbered 45–56 cover neck position, tall-rider dimensions, carbohydrate supplies,
food access, foot measurement, handlebar drop, an indoor trainer, discomfort/contact points, riding styles,
saddle setback/tilt, sodium concentration and weight/power. All WebPs are 1600×1000 and below 200 kB.
Alt text is localized. SVGs contain no visible text. Reviewed the twelve-hero contact sheet;
then enlarged the saddle detail, clarified the drop measurement and differentiated the flat-bar bike.
Review PNGs are ignored under `code-renders/44b-D` and excluded from the manifest.

## Sources and editorial boundaries

- Nutrition follows the approved task-30 engine: Jeukendrup 2014 for carbohydrate duration categories.
  Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC4008807/ . Limits are not mandatory targets;
  higher carbohydrate advice retains the multiple-source qualification.
- Sodium follows Sawka et al. 2007: 20–30 mmol/L, about 460–690 mg/L, for rides over one hour.
  Source: https://pubmed.ncbi.nlm.nih.gov/17277604/ . A 500 mL bottle's 230–345 mg is explicitly
  a concentration × volume conversion, never a new hourly prescription. No 300–600 mg/h claim.
- W/kg uses the existing engine's FTP/mass formula and explicitly labelled test estimates.
  The Allen & Coggan 2010 comparison is attributed through Garmin's published FTP table.
  The user chooses a table; no gender inference, weight-loss advice or invented training-zone table.
  The article distinguishes a rating from a training prescription and bike fit from maximal testing.
- Neck safety wording was checked against NHS neck-pain guidance:
  https://www.nhs.uk/symptoms/neck-pain-and-stiff-neck/ . Persistent symptoms, spreading tingling,
  pain at rest/night and swelling prompt personal assessment. Online guidance is not a diagnosis.
- Small reversible 3 mm/5 mm position trials are labelled practical test steps, not universal ideals.
  Hardware installation limits take precedence. Test one change over two or three easy rides.

## Verification

- 38 content/artifact tests pass: all section and total lengths, title/description/quick-answer limits,
  FAQ lengths, exact localized link titles, inbound links, CMS/source parity, CTA preservation,
  image dimensions/format/size, no image text and approved Dutch sodium/table-choice wording.
- 24 additional real-render tests check all bilingual article headings, six list items, paragraph limits
  and average sentence length. Full lint passes; final typecheck/render-test status recorded below.
- `tests/visual/guides-batch-d/capture.mjs` invokes C's shared 44a audit and captures NL/EN at 1440/390
  using one isolated production HTTPS server on 4355, with cleanup in `finally`.
- Browser audit/captures pending shared registration. Do not treat this note as DONE until results are appended.

Final source verification: **62/62 tests pass**, full lint passes, full typecheck passes.
All D source/script lines are at most 120 characters. No server was started for this batch yet.

**Pending integration:** at handoff, `src/lib/guides/rewrites.ts` registers A/B/C only and the shared
localized title registry omits D. Both files are C-owned. The concrete two-import/two-spread request is
recorded in the message above. Do not mark DONE 44b-D until C registers D and the prepared runner produces
passing `44b-D-audit.json/.md` and `44b-D-browser.json` plus the 48 ignored screenshots.

### Lead illustration review — connected rider anatomy (2026-10-01)

Rebuilt every D rider figure: heroes 45, 46, 52 and all three riders in 53. The new
`rider_geometry.py` derives hip, hand and shoe positions from Fiets' returned saddle, bar,
pedal and bottom-bracket coordinates. Two-segment inverse kinematics places knees and elbows;
unreachable contacts raise an error rather than stretching or detaching limbs. Shoe soles rest
on the actual pedal top at its drawn crank angle. The flat bar supplies its actual grip endpoint.

Limbs use filled, hatched tubes with overlapping joints. Local layer composition puts the bike
behind the rider, correcting the pen engine's global fill-before-line ordering without editing
C's shared engine. Reduced the main rider scale to keep the entire helmet inside the canvas.
Lime marks neck/shoulder (45), saddle fit reference (46), symptom/contact points (52), and bars (53).

Re-rendered and visually inspected all four images at their full 1600×1000 size and as 390px
thumbnails. Checked continuous hip→knee→ankle→shoe→pedal and shoulder→elbow→hand chains, saddle support,
hood/grip contact, crank alignment, hatching and margins. Review PNGs remain ignored and unlisted.

Validation: `python3 scripts/guides-batch-d/test_rider_geometry.py` passes two tests, including
18 scale/posture/crank combinations; `npx vitest run src/lib/guides/content/batch-d` passes 62 tests.
All twelve WebPs still satisfy the <200 kB and 1600×1000 checks. No app or shared renderer changes.
