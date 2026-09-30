# 30 — Tool sources and approved ranges

## Implementation

The approved contract now uses `TOOL_RANGES` and `FTP_TEST_FACTORS`. The historical proposal text in
`05-new-tool-contracts.md` has an explicit approval dated 2026-09-30 and points to the new source brief.
Fuel results show hourly bands, derived ride totals and bottle equivalents. Easy intensity changes
only the explanatory text. FTP starts with both reference columns highlighted and never infers gender.
Both tools show localized citations under the results. Practical climb/flat-speed physics is unchanged.

## Number-to-source inventory

| Number or rule | Source / meaning |
|---|---|
| Under 0.5 h: no carbohydrate; 0.5 to under 1 h: small amounts or mouth rinse | Jeukendrup 2014, Figure 1; no invented gram value for the textual band. |
| 1 to under 2 h: up to 30 g/h; 2 through 2.5 h: up to 60 g/h | Jeukendrup 2014, Figure 1. The longer-duration row takes precedence in the 1–1.25 h overlap. |
| Strictly over 2.5 h: up to 90 g/h, glucose + fructose required | Jeukendrup 2014, Figure 1; exact 2.5 h stays in the 60 g/h band. |
| Carbohydrate ride total | Hourly cap × hours; the total is also an upper bound, not an additional hourly recommendation. |
| Fluid 0.4–0.8 L/h | Sawka et al., ACSM 2007 starting band; original example is marathon running, individualized here for ride planning. |
| Sodium 20–30 mmol/L (equivalent mEq/L for sodium), approximately 460–690 mg/L | Sawka 2007, p. 385; sports-drink concentration, shown only for rides strictly longer than 1 h per the corrected lead brief. |
| Sodium per bottle | Concentration × bottle litres: 500 ml → about 230–345 mg; 750 ml → about 345–517.5 mg. Unit conversion only; no hourly dose. |
| Position 0–1 | UI heuristic: average of temperature/40 and sweat choice 0 / 0.5 / 1. Not a physiological measurement. |
| Selected hourly fluid | Linear position within 0.4–0.8 L/h; cannot exceed the endpoints. Temperature/sweat never changes sodium concentration. |
| Bottle 500–750 ml, step 50 ml, default 500 ml | Approved task-30 conversion input; not intake advice. |
| Bottle equivalent and total fluid | L/h × hours / (ml per bottle / 1000); no ceiling to whole bottles that would increase intake. |
| Avoid more than 2% body-mass loss; weigh before/after training | Sawka 2007, individualized fluid-loss assessment. |
| FTP × 1 for known FTP; 20-minute power × 0.95 | Known value unchanged; Allen & Coggan 2010 twenty-minute convention. |
| Final-minute ramp power × 0.75 | Approved common ramp-test convention, named separately from the book/table citation. |
| Men: ≥5.05; 3.93–5.04; 2.79–3.92; 2.23–2.78; <2.23 W/kg | Allen & Coggan 2010 as published in Garmin FTP Ratings; Superior to Untrained. |
| Women: ≥4.30; 3.33–4.29; 2.36–3.32; 1.90–2.35; <1.90 W/kg | Same source. Classification uses raw W/kg lower thresholds, with no numerical gaps; display rounding is disclosed. |
| Reference climb 5 km at 7%; road-bike default 8.5 kg; solver 0.36–54 km/h | Existing approved task-05/shared-engine reference, unchanged in this task. |

Approved slider contracts, not nutrition claims: power 50–600 W (step 5, initial 200), speed 10–50 km/h
(step 0.5, initial 30), rider 40–150 kg (step 0.5, initial 75), bike 3–20 kg (step 0.5, initial 8.5),
gradient 0–15% (step 0.5, initial 0), climb gradient 2–15% (step 0.5, initial 7), distance 1–30 km
(step 0.5, initial 5), FTP 80–500 W (step 5, initial 200), twenty-minute power 100–550 W
(step 5, initial 250), ramp power 150–700 W (step 5, initial 320), duration 0.5–8 h
(step 0.25, initial 2), temperature 0–40°C (step 1, initial 20). See task 05 approval history.

## Source verification

- [Jeukendrup 2014](https://link.springer.com/article/10.1007/s40279-014-0148-z): primary full text
  and Figure 1 checked. The chosen PMC link is retained on the page as requested.
- [Garmin FTP Ratings](https://www8.garmin.com/manuals-apac/webhelp/fenix7series/EN-SG/GUID-6C0F3C49-1E05-4AE5-8EC0-367A47C07DAB-4498.html): every threshold matches the brief.
- [Sawka 2007 bibliographic record](https://pubmed.ncbi.nlm.nih.gov/17277604/) and
  [original paper copy](https://www.sportmedicine.ru/recomendations/exercise_and_fluid_replacement.pdf):
  Fluid guidance is verified on journal page 384 (PDF page 8), under “During Exercise”.
  Excerpt from the sentence containing the band (omission marked; unit typography normalized):

  > “A possible starting point suggested for marathon runners […] is they drink ad libitum from 0.4 to 0.8 L·h−1”

  The omitted parenthesis specifies runners hydrated at the start. The sentence continues by tying
  higher rates to faster/heavier runners in warmth and lower rates to slower/lighter runners in cooler
  conditions. The following page cautions that other activities and durations may have different needs.
  The page copy explicitly identifies the marathon context and individualization for ride planning.
  The publisher URL supplied by the lead was inaccessible to this tool; verification used the full
  original-paper PDF linked above, including its title, DOI, journal pagination and authors.

  **Lead correction:** the original task-30 sodium hourly band was withdrawn because it came from a
  secondary summary. The implemented source value is instead 20–30 mmol/L (mEq/L), about 460–690 mg/L
  in carbohydrate-electrolyte drinks, shown only above 1 h. This is the concentration on p. 385.
  The approximate mass conversion uses 23 mg sodium per mmol; any mg-per-bottle result is labelled
  as concentration × bottle volume, never as an hourly intake recommendation.

## Validation

- `npm run lint`: passes all ESLint/runtime/tooltip/contrast/CSS-token gates.
- `npm run typecheck`: passes.
- Focused engine and UI suites: **65 tests pass** (54 engine, 11 UI).
- Production build passes; [four-route sweep](../final-sweep/30-tools/report.md): **16/16 cases without failures**,
  including axe, status, locale, SEO, images, overflow and the eight applicable mobile-target checks.
- `node tests/visual/tool-sources/capture.mjs`: **16/16 theme/locale/viewport cases pass**, with zero
  page errors, overflow or serious/critical axe findings and correct theme activation.
- Screenshots: `code-renders/30-{fuel-hydration,ftp-wkg}-{nl,en}-{light,dark}-{1440,390}.png`,
  plus result crops. Locally reviewed mobile dark FTP and final mobile dark fuel layouts, plus desktop light fuel layout.
- Snapshot/build identity is recorded in `final-sweep/30-tools/run-context.json` and `30-visual.json`.
- Diagnostic preview servers are closed. No app files outside the four-tool scope were changed.
- Source correction implemented per lead instruction. Final captures and sweep use the corrected snapshot.
  No commit or push.


## 30.1 — Advice-first result headlines

The lime fuel tile now leads with the carbohydrate advice: at the default two-hour ride it shows
“Tot 60 g/uur”, ride total up to 120 g and the 0.4–0.8 L/h fluid band. Duration is a small caption.
The short textual band uses a readable smaller headline, and the under-30-minute branch says no
carbohydrate is needed. The approved slider minimum remains 0.5 h; the below-minimum display branch
is exercised directly in component tests with the real carbohydrate helper at 0.49 h.

FTP keeps W/kg as its headline and adds the explicitly selected table and Coggan rating alongside
it. Initial “Both” selection produces no single headline rating; switching tables or changing FTP
updates it, and returning to “Both” removes it. Both comparison columns remain visible as before.
No calculation ranges, source values, nutrition logic, shared UI components or inference rules changed.

Validation: **70 focused tests pass** (54 engine, 16 UI); full lint and typecheck pass. Production build
passes. Recaptured both tools in NL/EN × 1440/390 × light/dark: **16/16 cases pass**, with no overflow,
page errors or serious/critical axe findings. Each case additionally checks and captures its short-ride
or selected-table headline, with no overflow. Reviewed the mobile fuel default/short-band and selected
FTP result crops. Capture command: `node tests/visual/tool-sources/capture.mjs 30.1`.

Evidence: `code-renders/30.1-*` screenshots (local only) and [30.1-visual.json](30.1-visual.json).
The earlier four-route sweep remains task-30 evidence; 30.1 validation uses the new captures and tests.

Final 30.1 snapshot: `bbf894f5d6d239d457c5492c128cce64e2f9d3e2fc2ea6d7c3aa90da4da0e748`;
build ID `j13w19DAOIhwE4bnWvaZq`.
Preview server stopped. Cumulative `files-30.txt` updated without PNGs. No commit or deployment;
this change is intended for the follow-up release after production `88a4e10`.
