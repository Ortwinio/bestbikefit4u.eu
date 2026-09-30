# 30 — Sourced values for fuel & hydration and FTP W/kg; approve the tool ranges (Sfora card 32)

Owner: **Codex D** (built the four tools in 18.3). Reviewer: Claude (lead).
Decision (Ortwin, 2026-09-30, "fix all the to do items"): the [VOORSTEL] ranges in
`05-new-tool-contracts.md` are approved as proposed, and the sources below are chosen.

## 1. Ranges approved

- Rename `PROPOSED_RANGES` → `TOOL_RANGES` and `PROPOSED_FTP_FACTORS` → `FTP_TEST_FACTORS` in
  `src/lib/public-calculators/performance.ts` (update imports/tests); drop "awaiting approval" comments.
- In `05-new-tool-contracts.md`, mark the ranges as approved on 2026-09-30 (keep the history).
- FTP factors stay 0.95 (20-min test, Allen & Coggan) and 0.75 (ramp test, last-minute power; common
  ramp-test convention). Name both conventions in the tool's "how is this calculated" copy.

## 2. Fuel & hydration — only these sourced values

**Carbohydrate per hour by ride duration** — Jeukendrup A. *A Step Towards Personalized Sports Nutrition:
Carbohydrate Intake During Exercise.* Sports Med 2014;44(Suppl 1):25–33. doi:10.1007/s40279-014-0148-z
(open access: https://pmc.ncbi.nlm.nih.gov/articles/PMC4008807/, Figure 1):

| Duration | Guidance |
|---|---|
| < 30 min | none needed |
| 30–75 min | very small amounts or mouth rinse |
| 1–2 h | up to 30 g/h |
| 2–3 h | up to 60 g/h (single carbohydrate sources fine) |
| > 2.5 h | up to 90 g/h, only with multiple transportable carbohydrates (glucose + fructose) |

Map the slider (0.5–8 h) to these bands. Show the band's value as "up to N g/h" plus the total for the
ride. The paper notes lower absolute intensity needs less: for "Rustig" show the text "lager kan
volstaan" instead of computing an invented lower number. Where the bands overlap (2.5–3 h) show the
higher value with the multiple-transportable-carbohydrate condition.

**Fluid and sodium per hour** — Sawka MN et al. *American College of Sports Medicine position stand.
Exercise and fluid replacement.* Med Sci Sports Exerc 2007;39(2):377–390:
typically **0.4–0.8 L/h** fluid and **300–600 mg sodium/h**, individualised; aim to avoid losing more
than 2 % of body mass.

Show the ACSM band as the result (not one exact number). Temperature and sweat may only choose a
*position within* the band (lower end: cool and little sweat; upper end: hot and heavy sweat) and the UI
must say so ("positie binnen de ACSM-bandbreedte, geen meting"). Bottles = fluid per hour × duration
/ bottle size (bottle size slider 500–750 ml, default 500; this is a unit conversion, not advice).
Always show: "Weeg jezelf voor en na een training om je eigen zweetverlies te leren kennen", and
"startpunt, test het op training". No medical claims; remove the old `adviceAvailable: false` path.

## 3. FTP W/kg level table

Allen H, Coggan A. *Training and Racing with a Power Meter*, 2nd ed. VeloPress, 2010 — as published in
Garmin's FTP ratings (https://www8.garmin.com/manuals-apac/webhelp/fenix7series/EN-SG/GUID-6C0F3C49-1E05-4AE5-8EC0-367A47C07DAB-4498.html):

| Rating (NL / EN) | Men W/kg | Women W/kg |
|---|---|---|
| Uitstekend / Superior | ≥ 5.05 | ≥ 4.30 |
| Zeer goed / Excellent | 3.93–5.04 | 3.33–4.29 |
| Goed / Good | 2.79–3.92 | 2.36–3.32 |
| Redelijk / Fair | 2.23–2.78 | 1.90–2.35 |
| Ongetraind / Untrained | < 2.23 | < 1.90 |

Add a segmented control "Vergelijk met: Mannen / Vrouwen" (no default gender assumption: default to
showing both columns highlighted until the rider picks one, or pick the design you think is clearest,
but never infer gender). Highlight the rider's band on a scale bar. Replace the `noRanking` copy.
Keep the practical translation (climb time, flat speed). Copy: "indicatie, geen oordeel".

## 4. Sources on the page

Each tool gets a small "Bronnen" block (NL/EN) under the result with the citations above as text
(links allowed, `rel="noopener"`). Copy in `src/i18n/calculators/performance.ts`.

## Acceptance

- Unit tests for every band boundary (0.49/0.5/1/2/2.5/3/8 h; W/kg boundaries for both tables; the
  fluid band positions; bottle maths), and that no value outside the cited ranges can be produced.
- Both tools NL/EN, 1440/390, light/dark screenshots `code-renders/30-*`; sweep
  `--filter=/calculators/fuel-hydration,/calculators/ftp-wkg,/calculators/power-speed,/calculators/climb-planner`.
- `npm run lint`, `npm run typecheck`, focused tests. Notes `audit/30-notes.md` (list every number with its
  source), `audit/files-30.txt` (no PNG). No commit. Print **DONE 30**. Use subagents where useful.
