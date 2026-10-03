# Riderprofiel-reis — implementatie

**Spec:** `PLAN.md` (Ortwin, 3 okt 2026). **Design:** `boards/RP1–RP8, RPSidebar` (canvas "Riderprofiel-reis",
https://claude.ai/artifact/87PNyNszcNRjBZBX9ZT3oX). Build the boards as designed: same layout, copy, states,
colors and type as the existing house style. Board review-state strips (Ontwerpstaat) are **not** product UI.
Example names in boards (Sanne, Canyon Endurace, 81 cm …) are examples, never hardcoded data.

**Branch / worktree:** `feature/riderprofile` in `/Users/ortwinverreck/Developer/bestbikefit4u-rider`
(from `main` @ `9094481`). Work only there. No commits, deploys or production data. One PR per phase,
released only after Ortwin's go. Sfora project `bestbikefit4u-eu`, cards "Riderprofiel F1–F4".

## Rules
- Own files only (table below); cross-owner needs go via `messages/<from>-to-<to>-<topic>.md`.
- Every new string NL + EN in `src/i18n/{calculators,account,marketing}/*`; `src/i18n/messages/nl.ts`/`en.ts` frozen.
- Convex: `v.` validators, `requireUserId()` / owner checks; optional schema fields so existing records stay valid.
- Privacy: no measurement values in URLs, analytics, logs or emails. Analytics only value-free events.
- Existing public calculator results never hidden or degraded.
- Gates per task: focused vitest, `npm run typecheck`, `npm run lint`, and for UI tasks desktop 1440 + mobile 390
  screenshots next to the board in `plans/riderprofile/renders/` (git-ignored). Notes `audit/<id>-notes.md`,
  manifest `audit/files-<id>.txt`. Print `DONE <id>`.

## Phase 1 — Overdracht (now)

| Task | Owner | Board | Scope |
|---|---|---|---|
| **R1 public block + session handoff** | Codex C | RP1 | Shared `PersonalizeAdviceBlock` under the result of every public calculator (copy per calculator from PLAN §1), replacing bare `/login` links there. Session store `bbf.handoff` (`src/lib/handoff/*`): records **only touched fields** with field, value, unit, calculator, method, timestamp; cross-calculator prefill notice in the same session; "N gegevens klaar om te bewaren"; CTA `/login?src=<calculator>&handoff=1`. Calculators must track touched vs default (extend the existing confirmed-field logic). Tests: untouched defaults never stored, nothing in URL. |
| **R2 backend + login + welcome** | Codex B | RP2, RP3 | Convex: table `profileObservations` (field, value, unit, kind measured/estimated/derived/declared, method, source, recordedAt, status) with index by user+field; `profiles.importHandoff` (validate against profile bounds, write current value to `profiles` and an observation with source `public_handoff`, return conflicts instead of overwriting); optional bike creation from handoff (name, type, current saddle height with measure point); new profile fields `ftpWatts`, `ftpMethod`, `ftpMeasuredAt`, riding goal (reuse existing field if present), shoe size + cleat system. Login (RP2): `handoff=1` shows the waiting-data panel from `sessionStorage`; after first successful sign-in route to `/welcome` (RP3): keep / adjust / omit per value, bike-profile toggle, conflict card (profile vs today vs measure again), "Niets meenemen", key cleared after confirm **and** cancel. FTP prefill in performance/gearing account calculators shows its date. E2E (fake auth ok): public saddle height → login → profile contains inseam with source public_handoff. |
| **R3 scores + rings** | Codex A | RP3 aside, RPSidebar | Pure `scoreRiderProfile()` / `scoreBike()` in `shared/profileScore/*` with the weights, quality/freshness factors and levels from PLAN §3, input = current values + observation kind/date (works before full migration: unknown kind → "eenmaal gemeten" for body measures, "zelf ingeschat" for flexibility/goal). Unit tests per rule. Component `ProfileStrengthRings` (two rings, `role="meter"` with text, sizes sm/lg, NL/EN level names) matching RP3/RPSidebar. Explainer page "Hoe berekenen we je profielscore?" (account route, NL/EN). Integrate rings in RP3 aside with B (B owns the page, A the component). Sidebar placement is phase 2; build it behind no flag but do not mount it yet. |

Sequencing: B first writes the Convex contract (`messages/B-contract.md`: table, mutation args/returns,
query for current values + kinds) before A/C consume it. C's handoff record shape is the input of
`importHandoff`; C writes `messages/C-handoff-shape.md` first.

## Phases 2–4 (same branch, same release — Ortwin 3 okt 2026: "alle fasen t/m 4 in de volgende release")

Each agent continues with its next task as soon as its current one is DONE and reviewed.

| Task | Owner | Phase | Board | Scope |
|---|---|---|---|---|
| **R4 calculator chain** | Codex C (after R1) | F3 | RP6 | All account calculators read profile/bike values live (no silent override; retire `profileWithCalculatorInputs`, fit session stores a snapshot of used observations); "We gebruiken je riderprofiel" block with measured/estimated/calculated labels and dates; missing-input questions with the gain; "We hebben je profiel en fiets bijgewerkt" + deviation choice (save to profile / only this calculation); next-calculator block per PLAN §6 table and rule; per-advice reliability from A's score functions. |
| **R5 provenance + profile** | Codex B (after R2) | F2 | RP5 | Migration of existing profile/bike values into `profileObservations` with best-guess kind (idempotent, dry-run first, never "measured" for derived); Mijn profiel header rings + group breakdown, per field method/date/source, conflict card, label legend, "Je gegevens blijven van jou". |
| **R6 rings everywhere** | Codex A (after R3) | F2 | RPSidebar, RP4, RP6 | Mount `ProfileStrengthRings` in desktop sidebar and mobile header on every account page (click → Mijn profiel), dashboard top (large, with next-step line), and the per-advice reliability slot in account calculators (C mounts it there via A's component). |
| **R7 dashboard + prompt card** | Codex B (after R5) | F3 | RP4 | `profilePrompts` table + `nextPrompts` query implementing PLAN §5 (gain × relevance, effort, staleness confirmations, bike questions, limits 2/login, 1 card/24 h, skip 14 d, 3× skip → profile only, "Niet nu" 7 d, never sensitive, >90 % only staleness); dashboard per RP4 states (open / after answering / hidden). |
| **R8 advice tab** | Codex B (after R7) | F4 | RP7 | Tab "Mijn adviezen" grouped per PLAN §7 using A's `listAdviceGroups`; value + range, current and difference, reliability with reason, status, date, max 3 improvement actions per group, stale marking and "herbereken alles". |
| **R9 staleness + advice query** | Codex A (after R6) | F4 | RP7 | Outcomes store the observation ids they used; generic `isStale()`; query `listAdviceGroups` over recommendations, saddleWidthSessions, gearingSessions, pressureCalculations, calculatorStates; recalculate-all mutation/action. |
| **R10 bike profile** | Codex C (after R4) | F4 | RP8 | `scoreBike` on bike cards and bike page with group bars and missing-data buttons with measuring instructions; per setup value `measuredAt` + `measurePoint` + `source`; new bike fields saddle model, spacers, max seatpost, riding goal per bike; prominent "Zoek je fiets op" (geometry DB match fills geometry); "advice does not fit without adjustment room" notice. |

| **R11 newsletter opt-in** | Codex B (after R8, or earlier between tasks) | F1 | RP2 | Ortwin 3 okt: sign up for the newsletter while creating the account, and show it in the profile. EU consent rules: an **active, unticked** choice on account creation ("Stuur mij de nieuwsbrief" / "Send me the newsletter", one tap together with creating the account), never pre-ticked or implied. Store `emailPreferences.newsletter` (default false) plus consent record (`newsletterConsentAt`, source `signup` / `profile` / `preferences`, locale, wording version). Toggle in Mijn profiel (RP5 "Je gegevens blijven van jou" area) and on `/email-preferences`; unsubscribe always possible, one-click unsubscribe tokens get a `newsletter` category. Newsletter sending itself is out of scope. Value-free analytics event `newsletter_opt_in` only. NL+EN. |

| **R12 remembered browser data** | Codex C (after R1, before R4) | F1 | RP1, RP3 | Ortwin 3 okt: data the browser already remembers may also be used behind the login. If the visitor chose "accepted" in the cookie banner (`src/lib/cookieConsent.ts`), keep the `bbf.handoff` entries in `localStorage` for at most 30 days (same shape, touched fields only), so a visitor who registers later still gets the "Dit nemen we mee" screen; with "essential" or no choice keep today's `sessionStorage` behaviour. Never put measurement values in real cookies (they are sent with every request). Expire and clear on confirm, cancel, logout and after 30 days; withdrawing consent clears it. NL/EN line in the RP1 block saying how long it is remembered. |
| **R13 general rider data + estimates** | Codex B (fields, UI) + Codex A (estimate functions), after their current task | F2/F3 | RP3, RP4, RP5 | Ortwin 3 okt: also ask general data such as **sex** and **date of birth**, and always explain why it matters for a good measurement. Profile fields `sex` (female / male / prefer not to say) and `birthDate`, both optional, with observations and source. Every place that asks shows a one-line reason (e.g. "Je leeftijd bepaalt hoe lenig we je inschatten als je dat nog niet hebt gemeten" / "Met geslacht, leeftijd en gewicht schatten we je FTP als je die niet weet"). Use them for **estimates**, never as facts: default flexibility from age (and sex) when flexibility is unknown; FTP estimate from sex, age and weight when FTP is unknown. A builds `shared/riderEstimates/*` with **sourced** reference tables (cite the source per table in code and notes; reuse the sourced W/kg tables from task 30 where they fit; anything without a source stays `[PLACEHOLDER — bron?]` and is not shown). Estimates are labelled "geschat uit …", count as derived (quality 0.3), never overwrite a measured or declared value, and the prompt card (R7) may ask for sex/birth date with the reason. Score weights from PLAN §3 stay unchanged; age/sex improve estimates, not completeness. NL/EN. |

| **R14 integration + release prep** | Codex A (after R9; others help when idle) | all | all | Merge-ready branch: rebase onto latest `main` (incl. PR #9 if merged; watch the `(dashboard)/layout.tsx` server/client split), resolve conflicts, full `npm run typecheck`, `npm run lint`, `test:unit`, `test:contracts`, `next build`, Convex standalone typecheck, `scripts/seo-crawl-check.mjs --local`, full final sweep NL/EN 1440/390 with axe, renders of every RP board next to the board in `renders/`, migration dry-run plan for production, and a release checklist (Convex first, env vars, smoke paths). Report blockers per owner; owners fix their own files. Print `DONE R14`. |

| **R15 FTP slider start (Ortwin's choice, 3 okt)** | Codex B (after S5) | F3 | RP6 | Ortwin chose: **FTP = slider start only, flexibility = no estimate**. When FTP is unknown but sex and weight are known, the FTP slider of the performance/gearing/climb/fuel calculators (public and account) starts at the lower-category W/kg range of the cited Allen & Coggan FTP rating table (`shared/riderEstimates/sourcesFtp.ts`, Garmin page) for that sex × the rider's weight, rounded to the slider step; take the exact table values from the source and cite them in code. Never shown as a result, never stored or counted as an observation unless the user moves/confirms the slider (touched-fields rule), never overrides a known FTP. Helper text NL/EN: "We hebben de regelaar alvast op een gebruikelijke waarde gezet. Pas hem aan naar je eigen FTP." / EN equivalent. Without sex or weight: today's default. Flexibility estimate stays `[PLACEHOLDER — bron?]` and hidden; flexibility is asked (prompt card / profile). Tests: no storage without touch, no override of known FTP, correct start per sex/weight, copy NL/EN. Print `DONE R15`. |

| **R16 advice performed + ride feedback** | Codex A (inside R14, rider worktree is A's alone) | F4 | RP7 | Gap found in R14: RP7 statuses "uitgevoerd" and "wacht op ritfeedback" and the mark-done action have no persisted API. Build it per PLAN §7: owner-authenticated mutation to mark an advice item as performed (date, optional note), status moves to "wacht op ritfeedback" until the user gives ride feedback (reuse the existing ride-feedback data where it exists; otherwise a minimal per-advice feedback record: better / same / worse + optional note), then "uitgevoerd". New/stale/needs-calculation logic unchanged; a recalculated advice resets to new. NL/EN, tests, RP7 renders updated. No invented states. Print `DONE R16` (can be reported together with DONE R14). |

Final integration (lead): full gates, all-route sweep, renders vs boards, one PR, release with Convex first.

## Measurement

R2 integration: backend/partial-profile guards, login, welcome and FTP prefill implemented.
All 505 Convex tests and 124 focused core tests pass; desktop/mobile fixtures captured.
Public-handoff acceptance and full gates await C's shared calculator/tooling integration.
See `audit/R2-notes.md`. Lead accepted R2-owned completion with those R1-dependent gates deferred
to combined validation after R1; B continues R5. Partial-profile support explicitly approved.

R5 owned implementation complete: provenance mutation/query, conservative dry-run-first legacy
migration, and RP5 profile UI. All 584 Convex and 121 profile/measurement tests pass; 12 NL/EN
desktop/mobile renders pass runtime/overflow checks. Full combined gates still await R1 and shared
tooltip registration. No database migration has been run. See `audit/R5-notes.md`, `audit/files-R5.txt`
and migration runbook. Lead subsequently authorized R7 and the next queued tasks.

R7 owned implementation complete: server-reserved safe prompts, per-login/day/skip limits,
explicit provenance/conflict handling, and RP4 prompt states. 688 focused/backend tests,
full typecheck and all lint stages pass after R1 integration; 16 NL/EN desktop/mobile renders
have no runtime errors or overflow. A owns the remaining R6 hero/sidebar integration.
See `audit/R7-notes.md` and `audit/files-R7.txt`. Lead's latest B queue: R13, then R11, then R8.

R13 B-owned fields/observations/profile-and-prompt UI complete: optional sex and birthDate,
visible reasons, strict validation and unchanged score weights. 943 combined tests and lint pass;
typecheck passed before a new A-owned R9 index error, documented in notes. 20 NL/EN 1440/390
renders are clean. A's sourced estimate functions remain A-owned;
B adds no guessed estimates. See `audit/R13-notes.md` and `audit/files-R13.txt`. B continues R11.

R11 implemented: optional unticked newsletter signup, verified-address consent, explicit Google/
ambiguous account confirmation, profile autosave toggle, preferences and signed one-click category.
Consent receipts prevent replay after withdrawal. 380 focused tests plus five analytics tests pass;
full typecheck/lint pass. Concurrent session-snapshot E2E fixtures remain A/C integration work.
See `audit/R11-notes.md` and `audit/files-R11.txt`; no newsletter sending or production calls.

PLAN §11: two weeks of baseline before phase 1 goes live. Value-free events only. Ortwin decides the release date.

## R15 progress — 3 October 2026

R15 B-owned completion: cited Fair lower-bound FTP control start, UI-only until explicitly touched/
confirmed, known FTP preserved, no flexibility estimate. Existing FTP controls only; missing demographic
inputs retain defaults. Equal-placeholder confirmation follows explicit profile-save/trial choice.
212 focused tests, full typecheck/lint and eight gearing captures pass. See audit/R15-notes.md and
audit/files-R15.txt for scope and evidence. No commit/deploy. B resumes Semrush S6–S9.

## R8 progress — 3 October 2026
Owned advice route, localized tabs, seven-group view and truthful bulk-recalculation states implemented.
Focused tests, full typecheck and 32 offline NL/EN desktop/mobile captures pass. Full lint currently
stops on C's in-progress BikeForm tooltip; remaining contrast/token/image stages pass separately.
Backend grouping/navigation-scope and unsupported performed/waiting contract gaps are handed to A,
not simulated in UI. See `audit/R8-notes.md`, `audit/files-R8.txt` and sidecar evidence.
R13 reason copy also now reflects A's unavailable demographic estimates. No commit/deploy.

## R3 progress — 3 October 2026
Scores, two-ring component and bilingual account explanation implemented; B owns the welcome integration.
94 focused tests, focused typecheck/ESLint and 16 light/dark NL/EN renders pass. Full repository gates remain
blocked by concurrent R1 work; under-18 height freshness assumption awaits lead confirmation.
Evidence and exact ownership: `audit/R3-notes.md`, `audit/files-R3.txt`. No sidebar mount, commit or deploy.

## R6 progress — 3 October 2026
Live sidebar/mobile rings, dashboard hero (mounted by B), and the advice-only reliability component/API
for C's R4 are implemented. 131 focused tests and full lint pass; renders cover NL/EN desktop/mobile
and light/dark. Combined typecheck passes on final rerun. See `audit/R6-notes.md`
and `audit/files-R6.txt`. Existing dashboard scores preserved; no commit/deploy.

## R9 progress — 3 October 2026
Outcome observation snapshots, generic staleness, seven-group advice query and bulk recalculation
are implemented. 156 focused tests, full typecheck and full lint pass. Broader backend/shared run:
897 pass, six shared communication E2E fixtures need timestamps for C's new session snapshot path;
owner notified. B owns R8 UI integration/rendering. See `audit/R9-notes.md`, `audit/files-R9.txt`
and `messages/A-to-BC-R9-final-integration.md`. No commit/deploy.

## R13A progress — 3 October 2026
Sourced research and pure estimate boundary complete: existing values preserved, derived quality 0.3
contract and bilingual labels. No verified demographic-to-FTP or app-flexibility model was found;
both requested estimates remain explicitly unavailable/hidden placeholders as required, not invented
defaults. 142 focused tests, full typecheck and lint pass. B notified about honest field-reason copy.
See `audit/R13A-notes.md` and `audit/files-R13A.txt`. No commit/deploy.

## R14 progress — 3 October 2026 (complete)
Lead checkpoint d8726c5 rebased onto origin/main e93f8c1 as 169f7fc; both dashboard split and rider
functionality preserved. All post-R16 code gates pass (2848 unit tests, 20 skips; 477 contracts; standalone
Convex tsc; typecheck/lint/build). Local SEO: 1145 checks, zero findings. All RP1–RP8/sidebar refreshed,
184 cases/flows plus 48 R16 interaction states. On lead's instruction A fixed the NL advice label and EN bike-edit targets on B/C's
behalf. Combined final sweep: 320/320 cases pass, axe 320/320. Affected RP7/RP8 renders refreshed.
All technical gates green; lead-assigned R16 closes the performed/feedback scope gap. R16 unfiltered
axe has zero violations; incomplete contrast reviews remain documented with manual evidence.
See `audit/R14-notes.md`, `audit/files-R14.txt`. Subsequent fixes uncommitted; no push/deploy.

## R16 progress — 3 October 2026 (complete)
Owner-authenticated performed date/note and explicit better/same/worse ride feedback persist per advice
item. Existing eligible ride feedback can be linked; recalculation resets progress with revision guards.
NL/EN controls, backend/unit/real-handler integration tests and 48 interactive renders pass. Accessibility
findings were fixed and the complete R14 candidate gates rerun. See `audit/R16-notes.md`,
`audit/files-R16.txt`. No commit, push, deploy or production data write.

## R1 progress — 3 October 2026
Shared RP1 block, typed session handoff, touched-only calculator integration and bilingual prefill notices complete. 177 focused tests pass (20 existing skips), full typecheck/lint pass, NL/EN desktop/mobile visuals and session-prefill checks pass. See `audit/R1-notes.md` and `audit/files-R1.txt`. R2-owned login acceptance fixture needs its theme provider; recorded for B. No commit/deploy. C proceeds to assigned R4, then R10.

## R4 progress — 3 October 2026
Live account calculator inputs, explicit profile/bike save versus trial, immutable fit snapshots, evidence-based reliability and one next-step block are implemented. 307 focused tests pass (20 existing skips), additional backend/communication review tests pass, full typecheck/lint green. NL/EN 1440/390 RP6 comparisons and save/trial browser checks pass. See `audit/R4-notes.md` and `audit/files-R4.txt`. No commit/deploy. C proceeds to assigned R10.

## R10 progress — 3 October 2026
Bike profile score/rings, group bars, explicit per-field provenance editing, missing-data actions, geometry lookup, optional component/adjustment fields and garage scores are implemented. Existing bike tools remain accessible. 89 frontend and 128 backend tests pass; final typecheck/full lint green. Sixteen NL/EN desktop/mobile browser contexts pass with RP8 comparisons. See `audit/R10-notes.md` and `audit/files-R10.txt`. No commit, deployment or production data write. C has completed the lead-assigned R0 → R1 → R4 → R10 sequence.

## R12 progress — 3 October 2026
Consent-gated browser storage, unchanged touched-only v1 handoff, 30-day expiry, all logout cleanup and NL/EN retention notices complete. 63 focused tests, full typecheck/lint and four desktop/mobile browser contexts pass. See `audit/R12-notes.md` and `audit/files-R12.txt`. R10 remains complete; its advice link is aligned with R8 `/profile/advice`. No commit/deploy.
