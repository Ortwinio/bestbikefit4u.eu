# Betrouwbaarheidsrelease — eerste oplevering: publieke zadelhoogte-calculator + Quick Fix

Owner request (5 Oct): first delivery = **only the public saddle-height calculator**, per the design, plus a new **Quick Fix**.
Worktree `/Users/ortwinverreck/Developer/bikefitboost-reliability`, branch `feature/reliability-saddle` (from main @ 840f852).
Absolute paths only; git only as `git -C /Users/ortwinverreck/Developer/bikefitboost-reliability`. No commits, deploys, prod data,
env changes or mails.

Sources (authoritative, in this folder):
- `rekenmodel.md` and `ontwerp.md` — the calculation model and design rules (same content; `ontwerp.md` has the user-facing texts).
- `boards/project/Main.dc.html` — **the public 2-step design** (clickable; its script implements the formulas).
- `boards/project/Bereikbalk.dc.html` — the range-bar component; `boards/project/Calculator.dc.html` — the shared calculator template.
Out of scope now: account and paid levels, kniehoek, dashboard/PDF, the other 11 calculators (but build the bar and the model as
reusable pieces so they can follow).

## What to build
1. **Shared model** `shared/reliability/saddleHeight.ts` (pure, tested): ZH = B × 0,883 (racefiets; other bike factors and Δ terms
   supported as inputs with neutral 0 defaults, for later account use); B measured or estimated 0,47 × height; safety clamp
   0,86–0,91 × B (internal, never shown as a band); half width = 1,96 × √((0,883·σB)² + σM²), σM = 1% of ZH; σB rules from
   `rekenmodel.md` (3% estimated, 10 mm 1× measured, 10/√n, 5 mm fitter/video, open warning → 3%); range bounds rounded to 5 mm,
   half width to whole mm; one shared **plausibility check** (deviation vs 0,47 × height: ≤5% ok, 5–12% check, >12% large,
   inseam ≥ height or outside 55–105 cm → error) and the **next-step** rule (public subset: steps 1–3). Unit tests must reproduce
   the worked example exactly: 190 cm → 789 mm ±49 (740–840); inseam 89 cm → 786 mm ±23 (765–810); next-step labels ±23 / ±18.
   Do not change the account/engine calculation yet; only add the shared module (engine reuse later).
2. **Range bar component** `RangeBar` (continuous variant; large + compact sizes) per Bereikbalk: lime zone with ink border,
   ink marker = advice, bounds in DM Mono, fixed scale advice ± 1,25 × widest range of the calculator (saddle: ±60 mm around the
   advice as on the board), dashed zone on open warning, 400 ms narrowing animation off under prefers-reduced-motion,
   `role="img"` + aria-label "Zadelhoogte 787 mm, bereik 765 tot 810 mm". Colour never the only carrier.
3. **Public saddle-height calculator** (`src/app/(public)/calculators/saddle-height/*`, NL/EN) per Main.dc.html: two cards
   (height, inseam), result right with value ± mm, bar, sentence "Je ideale zadelhoogte ligt naar verwachting tussen … Gebaseerd op …",
   "Nauwkeuriger: ±49 → ±23 mm" chip, one next step, "Wat betekent dit bereik?", yellow check (5–12%) and red alert (>12%:
   Opnieuw meten · Toch gebruiken · Vind een bikefitter), "Verfijnen in je gratis account" block (only when inseam is OK/confirmed)
   with sign-up that carries height + inseam into the account (keep/extend the existing public→account handoff, tests in
   `PublicBodyHandoff.test.tsx`), collapsible "Wat we hier nog niet meenemen", "berekend voor een racefiets".
   **Remove** from the public saddle calculator: bike type, riding goal, flexibility, core, the fixed "veilige startband", and the
   measured/estimated toggle. Keep SEO (title/meta/JSON-LD/hreflang), measurement-guide link and safety info (too high/low, when to
   see a fitter) visible.
4. **Quick Fix** (new, owner's idea; no board — design it in the same style): the fastest first way to set your saddle before a ride.
   At the top of the saddle-height page a clearly marked route "Quick fix · zadel goed in 1 minuut" (EN "Quick fix · saddle sorted in
   a minute"): only height required; optional "Heb je nog 2 minuten? Meet je binnenbeen" (same inseam card/check). Same model and bar.
   Then a short practical block "Zo stel je het nu in": 1) measure from the centre of the bottom bracket along the seat tube to the
   top of the saddle, 2) loosen the seat clamp, set the saddle to the advice (inside the range), mark the seatpost with tape, tighten
   to the torque printed on the clamp, 3) quick check: heel on the pedal at the bottom, leg just straight; on the ball of the foot a
   slight bend, 4) if your current height differs by more than 10 mm, change at most 5 mm per ride. Safety line (pain/tingling →
   stop, see a fitter) always visible. Offer "Volledig advies" (the full 2-step result + account refinement) as the next step.
   Keep it one screen on mobile (390 px) before the practical block. No new claims beyond the model; NL first, EN equal.
5. Analytics: reuse existing calculator events; add `quick_fix_used` / `inseam_added` only if the analytics layer has a pattern for it.

## Tasks
| ID | Owner | Scope |
|---|---|---|
| **Q1 model + bar** | C | Items 1 and 2 with full unit tests (worked example, every σB rule, plausibility bands, rounding, scale, aria label). Write `messages/C-model-contract.md` first (exports + types). |
| **Q2 calculator UI** | B | Item 3 against C's contract; NL/EN copy from `ontwerp.md`; component + page tests; handoff to account. |
| **Q3 Quick Fix + QA** | A | Item 4 (+5), page SEO check, then the combined final gates and a NL/EN 1440/390 visual sweep of: Quick Fix (height only, with inseam), full calculator (no inseam, ok, 5–12% check confirmed, >12% alert + override dashed), handoff CTA. Compare against Main.dc.html. |

Gates (A owns final): typecheck, lint, test:unit, test:contracts, Convex tsc, build with `NEXT_PUBLIC_SITE_URL=https://bikefitboost.com`
and offline Convex URLs, `scripts/seo-crawl-check.mjs --local`, `scripts/domain-migration-check.mjs https://bikefitboost.com https://bestbikefit4u.eu --local`,
axe (serious/critical = 0) on the saddle page. Notes `plans/reliability/audit/<id>-notes.md`; renders in `plans/reliability/renders/` (git-ignored,
never commit logs/renders/crawl JSON). Print `DONE Q1` / `DONE Q2` / `DONE Q3`.

## Combined candidate complete — 5 October

Q3 Quick Fix is integrated with frozen Q1/Q2. All combined gates pass: typecheck, lint, 3774 unit tests, 581 contracts, Convex tsc, offline build, 875 SEO crawl checks, 684 redirect checks and 36 real-page NL/EN visual scenarios with zero axe findings. Evidence and offline limitations: `audit/Q3-notes.md`, `audit/Q3-visual-notes.md`. No commits, deployments, production/environment changes or mails; logs/renders/crawl JSON remain ignored local review artifacts.

## Q2 completion — 5 October 2026

B: public two-step calculator, NL/EN plausibility states, computed next step/range and account handoff implemented. Legacy account calculator remains unchanged behind the existing import. Quick/full form state is shared with A's wrapper. Focused integrated suite: 196 tests passed; cache-free typecheck and full lint passed. Notes [Q2](audit/Q2-notes.md), source manifest [files-Q2.txt](audit/files-Q2.txt). A owns the remaining combined release build/crawl/visual gates and wrapper analytics callback integration. No commits/deploys/env/prod/mail operations.

## Q1 completion — 5 October 2026

C: shared saddle-height model and reusable RangeBar complete;84 focused tests, integrated typecheck and lint pass. Large/compact bar reviewed at390/1440 in light/dark, no overflow, reduced-motion transitions disabled. Contract and rounding clarification in messages/C-model-contract.md; details in [Q1 notes](audit/Q1-notes.md), source-only list in [files-Q1.txt](audit/files-Q1.txt). Account/engine untouched. Final combined release gates remain with A after Q2/Q3 integration. No commits/deploys/env/prod/mail operations.
