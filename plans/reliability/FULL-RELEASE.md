# Betrouwbaarheidsrelease — volledige uitvoering (owner, 5 Oct)

Worktree `/Users/ortwinverreck/Developer/bikefitboost-reliability`, branch `feature/reliability-full` (from main @ 764f07a,
release 1 is live: shared saddle model `shared/reliability/saddleHeight.ts`, `RangeBar`, public 2-step saddle calculator,
Quick Fix, homepage widget). Absolute paths only; git only as `git -C /Users/ortwinverreck/Developer/bikefitboost-reliability`.
No commits, deploys, prod data, env changes or real mails. Never commit logs, renders or crawl/domain JSON.

**Sources (authoritative):** `rekenmodel.md`, `ontwerp.md` (model, texts, per-calculator table, open points) and every board in
`boards/project/`: Main (public 2 steps, live), **Account** (free account: 3 measurements as chips, bike + goal, flexibility + core
"Zelf ingeschat", "Hoe we op … mm komen", knee-angle teaser only after 3 good measurements), **Betaald** (knee angle measured on a
photo, verdict 25–35°, ±13 mm, adjustment plan max 5 mm per step, evaluation after 7 days, pain warning, "Binnenkort: wij meten de
hoek uit je foto"), **Dashboard** (compact rows A–D with RangeBar, ± and "Gebaseerd op", one "Grootste winst" line, profile measure
panel with provenance/date/check), **Rapport** (PDF: "Hoe nauwkeurig is dit advies?" block, 95%-bereik column, safety band no longer
drawn), **Bereikbalk** + **Maatbalk** (size variant), **Calculator** (template for all public calculators) + **Calc-*** (bikefit,
frame, crank, saddlewidth, speed, climb, ftp, gearing, fuel), **Calculators** (overview: same bar everywhere).
Run `boards/project/*.dc.html` scripts as the reference for formulas and states; where a board and `rekenmodel.md` differ, the
document wins and you note it.

## Owner requirements on data (new, 5 Oct)
1. **Reuse everywhere, ask once.** Every calculator prefills every field it can from what the user already entered elsewhere
   (height, inseam, weight, bike type, riding goal, FTP, power, measurements, current saddle height, …), both signed-out and
   signed-in. Prefilled fields are visibly marked ("Uit je eerdere invoer" / "Uit je profiel") and editable.
2. **Signed out = session only.** Public values live only for the browser session (sessionStorage) — never localStorage, whatever
   the cookie consent; migrate/clear any existing persistent `bbf.handoff`. Nothing is sent to the server until sign-up.
3. **Signed in = stored in the profile** (existing profile/autosave with provenance `kind/method/repeatCount/withinTolerance`), reused
   on every later visit and every calculator. On sign-up/log-in the session values are offered/merged into the profile (existing
   handoff), measured beats declared, newer beats older, never silently overwrite a measured profile value.
4. **Leaving the site while signed out with entered data:** desktop exit-intent dialog (mouse leaves the viewport at the top), at most
   once per session, accessible (focus trap, Esc, no auto-open on load), text: "Bewaar je gegevens voor de volgende keer" — your values
   are only kept in this browser session; a free account keeps them and refines your advice; buttons "Maak een gratis account" (carries
   the session values) / "Nee, bedankt". Mobile/touch: no exit intent; instead a small dismissible bottom bar after the first entered
   value: "Bewaar je maten voor de volgende keer". No `beforeunload` prompt. Not shown to signed-in users or on auth/checkout pages.

## Tasks
| ID | Owner | Scope |
|---|---|---|
| **F1 models + backend** | C | Generalise `shared/reliability/` to all 12 calculators per the table in `ontwerp.md` §9 (value, biggest uncertainty, widths public → account → paid; continuous + size-bar variants; scale = advice ± 1,25 × widest range; no flexibility/core in public models). One shared **plausibility check** replacing `validation.ts`, `publicCalculatorLogic.ts` and `profileAutosave.ts` variants (incl. `unresolvedWarning` on save, `withinTolerance` for measurements >5 mm apart). σB from profile provenance (rules 1–5). Account saddle model (mean of measurements, bike factor, Δ flex/core/goal/climb, breakdown) and paid knee-angle model (σM 4 mm in window, ~2 mm per degree, max 5 mm step). Convex: store knee-angle measurements + adjustment plan + 7-day evaluation scheduling (existing lifecycle/email infra; respects email preferences; service mail renderer NL/EN + previews; no real send in tests), queries for dashboard rows and "Grootste winst". **PDF report** per Rapport board (95%-bereik column, accuracy block, no drawn safety band). Keep the engine result unchanged (787 mm example) — only add ranges. Write `messages/C-contract.md` first. |
| **F2 UI** | B | Public calculator template from `Calculator.dc.html` applied to all 11 other public calculators (max 2 steps, RangeBar/Maatbalk, one next step, "Verfijnen in je gratis account", "Wat we hier nog niet meenemen"; public bike-fit loses flexibility/core, keeps bike type). Account saddle page per Account board; paid knee-angle page per Betaald board (paid gating via existing `getAccess`/`isPaidAccessEnforced`, OFF in prod = available to signed-in users); dashboard rows + profile measure panel per Dashboard board. NL/EN, 1440/390, axe clean, reduced motion. Build against C's contract. |
| **F3 data reuse + leave notice + QA** | A | Requirements 1–4 above: one shared client data layer for all calculators (session store signed-out, profile signed-in, merge on sign-up), prefill markers, migration of the old persistent store, the exit-intent dialog + mobile bar (NL/EN, analytics events if the pattern exists). Then the combined final gates and a NL/EN 1440/390 visual sweep of every calculator (signed-out and signed-in fixtures), account saddle, knee angle, dashboard, PDF pages, the leave notice, and **cross-calculator reuse journeys** (enter height + inseam in saddle height → open frame size, crank, bike fit: prefilled; sign up → profile has them; new session signed-out → empty). |

Coordination via `plans/reliability/messages/`; disjoint files; C's contract first. Use subagents in parallel.
Gates (A owns final): typecheck, lint, test:unit, test:contracts, Convex tsc, build with `NEXT_PUBLIC_SITE_URL=https://bikefitboost.com`
and offline Convex URLs, `scripts/seo-crawl-check.mjs --local`, `scripts/domain-migration-check.mjs https://bikefitboost.com https://bestbikefit4u.eu --local`,
email previews, axe 0 serious/critical. Notes `plans/reliability/audit/F<n>-notes.md`. Print `DONE F1` / `DONE F2` / `DONE F3`.
