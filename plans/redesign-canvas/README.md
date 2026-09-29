# Redesign canvas — BestBikeFit4U

Lead: Claude (project lead, QA, canvas publishing). Agents: Codex A (pane %3), Codex B (pane %4).
Kanban: Sfora project `bestbikefit4u-eu`. Canvas: https://claude.ai/artifact/87PNyNszcNRjBZBX9ZT3oX

## Goal

Redesign bestbikefit4u.eu into a modern, intuitive, slider-driven experience for the dedicated amateur cyclist (28–55, pain-driven, 3–6 h/week). This covers every public page, every configurator and the core logged-in flow. The design is made on the canvas and then handed off to code.

## How we work

- Codex agents **draft**: audits, and board files (`.dc.html`) in `plans/redesign-canvas/drafts/`.
- The lead **reviews every deliverable** against the phase gate below, sends back fixes, then publishes approved boards to the canvas and moves the Sfora card.
- `canvas/` is a read-only snapshot of the published canvas. Never edit it; the lead refreshes it after each publish.
- Design rules: `reference/design-language.md` (look, components, configurator rules), `reference/format.md` (the `.dc.html` format), `reference/craft.md`.
- Never invent numbers, prices, reviews or claims. Anything missing is a visible placeholder like `[PRIJS]`. Board copy is in Dutch (`lang="nl"`), matching the existing boards.
- No app code changes before phase 6. Don't commit; the lead commits at phase gates.

## Scope

In: public pages, all public calculators, the core account flow (profile, fit session, bikes, tools, settings), the PDF report, mobile key screens, and the handoff to code.
Out: `/admin/*`, fit-engine logic changes, payments (currently paused).

## Phases and gates

Each phase ends with a lead QA pass. A phase is only closed when every criterion is met; fixes go back to the agent.

### Phase 1 — Audit & align
- **01** `audit/route-map.md`: every non-admin page route appears exactly once, with its canvas board or MISSING, a proposed board name, a canvas row and a priority.
- **02** `audit/engine-alignment.md`: for each of the 4 existing configurator boards, every input and output is compared with the real engine (file:line). Each difference is classified as `match`, `design-only` or `must-fix`, and every canvas formula is marked real or temporary.
- Gate: both files are complete and spot-checked by the lead against the code (at least 5 random routes and 5 random engine claims verified). The palette decision is recorded.

### Phase 2 — Remaining configurators (7 boards)
Gate per board: it passes the skill's quality checklist.
- Every number is a slider; every choice is segment buttons or cards (no dropdowns, no typed numbers).
- There is a live visual, result tiles in DM Mono and a concrete next step.
- Contrast rules hold, and touch targets are at least 44 px.
- The tools tab bar links to all configurators.
- Inputs and ranges come from the real engine (per 02).
- It renders in the canvas without errors.

### Phase 3 — Logged-in flow
Gate: the same checklist, plus the dashboard sidebar pattern. Each screen maps to a real route, and example data is clearly example data.

### Phase 4 — Content & SEO pages
Gate: one template per page type. Real copy comes from the site/docs, with no filler. The header and footer navigation links resolve to boards.

### Phase 5 — Mobile (390 px)
Gate: no horizontal overflow, targets of at least 44 px, no fake status bar.

### Phase 6 — Handoff to code
Gate: the tokens are in Tailwind, there are shared components, and there is one implementation plan per board. Build, lint and tests pass.

## Decisions

- 2026-09-29 — **FTP W/kg, power↔speed, climb planner, fuel & hydration become real tools** (decided by Ortwin). Contracts: `05-new-tool-contracts.md`; [VOORSTEL] ranges await his approval.
- 2026-09-29 — **Palette locked: canvas lime/petrol** (decided by Ortwin). It replaces the blue/Inter palette in `plans/BestBikeFit4U_Redesign_Plan.docx`. The brand rules (colors, type, logo, tone of voice, icons) are in `reference/brand.md`, and they win over anything else.

## Draft progress

- 2026-09-29 — Codex B implemented **19.3 guides/blog** with two disjoint page-family subagents. CMS/SEO/redirects and shared Header/Footer remain intact. 1024 unit tests, lint, 30 i18n tests, sitemap checks and 36 NL/EN browser cases pass; final whole-tree build/typecheck is blocked by concurrent science-file errors routed to their owner. Exact 19-file source/test/harness list: `audit/files-19.3.txt`; details and 58 screenshots in `audit/19-notes.md`. No commits; awaiting lead review.

- 2026-09-29 — Codex A completed **19.2** after lead approval of 19.1: four home/pricing review fixes plus Measurement Guide, Fit Pass and pain index/all five detail slugs, using three subagents. Typecheck/lint/build, 985 unit tests, 30 i18n tests and production sitemap checks pass; 17 visual artifacts and exact per-batch file lists in `audit/19-notes.md`. Frozen dictionaries untouched. Awaiting lead review; no batch 3 or commit.

- 2026-09-29 — Codex B completed **20.2 fit-flow presentation** plus the Dutch Dashboard enum and full-height sticky ink-sidebar fixes, using four page-family subagents. Typecheck/lint/build, 996 unit tests, 30 i18n tests and 2 locale smoke tests pass; 92 NL/EN desktop/mobile fixture cases plus final refreshes produce 142 screenshots. Exact scoped file list, validation and inherited shared-dialog target follow-up: `audit/20-notes.md`. No commits; awaiting lead review. Later account batches in the shared tree belong to other workers.

- 2026-09-29 — Codex A completed content-header follow-up (12b): nineteen web headers share logo/nav/language/text-login/primary calculator action; A4 report keeps its print header. All checks and 45 state renders pass. Phase 6 task 19 batch 1 implements shared marketing layout + home/pricing/how-it-works with three page subagents; details and validation in `audit/19-notes.md`. No later batch started; awaiting lead review, no commit.

- 2026-09-29 — Codex B implemented **20.1 account app presentation only** with one subagent per page family: shell, Dashboard, Profile, four ProfileImprove routes and Login. Final integration evidence, actual-component fixture screenshots and ownership follow-ups are recorded in `audit/20-notes.md`. No commits; batch 2 remains unstarted and requires lead review.

- 2026-09-29 — Codex A completed task-13's twelve library/service/report drafts via single-board subagent assignments. Both checkers PASS (109 runtime states); shared footer verified, 35 PNGs including three A4 report pages, and source gaps/handoff notes in `audit/13-notes.md`. Published blog source is empty, so blog content remains explicitly unresolved. Drafts only; awaiting lead QA.

- 2026-09-29 — Codex A completed task-12's eight marketing/content drafts via one-board subagent assignments. Shared footer verified identical; both checkers PASS, with 15 renders and section-level source notes in `audit/12-notes.md`. Drafts only, awaiting lead QA; no phase-4 gate claimed.

- 2026-09-29 — Codex A completed 08b review-state strips and refreshed renders, then task-10's eight account/tools/settings drafts using three subagents. Both checkers PASS (707 task-10 runtime states); source gaps, 58 renders and QA recorded in `audit/10-notes.md`. Drafts only, awaiting lead review; no phase gate claimed.

- 2026-09-29 — Codex A completed 03c polish and the five task-08 account drafts. Both checkers pass; state renders and source/QA notes are in `audit/08-notes.md`. Awaiting lead review/publication; no phase-3 gate claimed.

## Gate log

- 2026-09-29 — **Phase 1 passed.** 01 route map: 70/70 routes, 6 claims spot-checked OK. 02 engine alignment: 28 must-fix items, 6 claims spot-checked OK. Findings carried forward:
  - The 4 existing configurator boards need the must-fix list from `audit/engine-alignment.md` → new task 03.
  - `Login.dc.html` shows a password, but the live login is an email code (Resend) + Google → fix in 03.
  - Dead CTA links in the app: `/dashboard/bikes` (bikes/compare-fit:118) and `/dashboard/fit` (shoe-cleat-fit:118) → phase 6 bug card.
  - FTP W/kg, power↔speed, climb planner and fuel & hydration are content-only pages with no calculator contract → scope decision needed before their boards.
  - Frontend/engine range mismatch: bike-fit form height 140–220 cm vs engine 130–210 cm → phase 6.
- 2026-09-29 — **Phase 2 passed** (published as canvas v8). 7 new configurators (crank length, saddle width, gearing, power↔speed, climb planner, FTP W/kg, fuel & hydration) + BikeFit/SaddleHeight/FrameSize corrected against the engine. QA: `check-board.mjs` + `check-runtime.mjs` (22–127 states per board) + visual review of renders + physics recomputed against the real engine (`src/lib/gearing-engine/math.ts`): 200 W flat → 33,6 km/u, 7 % → 11,2 km/u, 5 km @ 7 % → 26,9 min, identical in all 3 boards. Findings fixed during the phase: developer jargon in the copy (now an automatic check), sentences in DM Mono, inconsistent sub-nav/units → rules in BOARD-RULES. TirePressure + Login follow after 03c polish. Open: a source for the fuel values and the W/kg level table (placeholders on the board).

- 2026-09-29 — **15 code foundation implemented; awaiting lead diff review.** Brand tokens, fonts, assets and contrast lint in app code. Typecheck/lint/build and 640 unit tests pass; 214 contrast pairs pass. Four required route screenshots: `code-renders/15-*.png`. Mapping, results and deliberate exclusions: `audit/15-notes.md`. Uncommitted by request.

- 2026-09-29 — **15 approved by lead and committed (`2c7485c`). 16 implemented; awaiting lead diff review.** Shared inputs/results/layouts and protected playground, 681 unit tests, typecheck/lint/build, desktop/mobile/existing-page captures. Lead border finding corrected in PublicSection; mobile footer labels wrap. See `audit/16-notes.md` and `code-renders/16-*.png`. No commit by Codex C.

- 2026-09-29 — **16 approved/committed (`d18e640`). 18.1 implemented, awaiting lead review.** Section 0 shared border fixes plus saddle-height/frame-size/crank-length pilot pages; engines unchanged. Typecheck/lint/build, 697 unit tests, 30 i18n tests and 218 contrast checks pass. NL desktop/mobile + EN capture and matching boards: `code-renders/18-*.png`. See `audit/18-notes.md`. Uncommitted; batch 2 not started.
- 2026-09-29 — **Phase 3 passed** (canvas v12): 23 account screens (profile, fit flow, garage + imports, account tools, settings, feedback, app). QA: linter + runtime (up to 441 states) + visual review; the questions match `convex/questionnaire/questions.ts`; the home/pricing claims trace back to current site copy, with 2 unverifiable claims marked `[CLAIM — bron?]`. Rules added during the phase: the review-state strip and example data once per screen.
- 2026-09-29 — **Phases 4 & 5 passed** (canvas v13): 19 content/SEO pages + the A4 fitreport (3 pages) + 6 mobile boards (390 px, logic identical to desktop). Header/footer identical on every page. **The canvas design is complete: 72 boards.**
- 2026-09-29 — **Phase 6 running**: 6a foundation (2c7485c) and 6b components (d18e640) approved; 6c configurators batch 1 (2dccd9b) approved; 18.2 (Codex C), 18.3 (Codex D), 19.1 marketing (Codex A) and 20.1 account (Codex B) in progress, with file ownership per agent.

- 2026-09-29 — **18.1 approved/committed (`2dccd9b`).18.2 implemented, awaiting lead review.**
  Saddle-width, bike-fit and public pressure family; batch1 formatting and mobile feedback fix.
  58 targeted tests,5 browser regressions,30 i18n tests and218 contrast pairs pass. NL desktop/mobile
  and EN screenshots refreshed. Full shared gates have concurrent out-of-scope failures documented
  in `audit/18-notes.md`; no commit by C, and C has not started batch3.

## Code phase: ownership & commits (from checkpoint b40d638)
- Every agent writes **only** in its own files. New copy goes in its own dictionary module: `src/i18n/calculators/*` (C/D), `src/i18n/marketing/*` (A), `src/i18n/account/*` (B). **`src/i18n/messages/nl.ts` and `en.ts` are frozen**; only the lead changes them, on request (add a line to your notes).
- `src/components/ui/*` and `globals.css`: Codex C. `src/components/layout/*` (Header, Footer, mobile menu): Codex A. Account shell and `src/components/{dashboard,account,profile}/*`: Codex B. Calculator pages: C (batch 2) / D (batch 3).
- At DONE, the agent gives a **file list** in its notes; the lead commits exactly that list per batch.


- 2026-09-29 — **20.4 implemented by Codex C, awaiting lead review.** Account pressure/gearing/saddle,
  shoe-cleat `/fit` CTA, settings, feedback and standalone app install;18.2 warning dedupe included.
  Shell, Convex/authz/engines and frozen dictionaries unchanged by C.996 unit tests and locale gates
  pass; actual-component fixture captures and exact file list in `audit/20-notes.md`. No commit.
