# Redesign canvas — BestBikeFit4U

2026-09-30 — Codex D completed **44a read-only production guides audit**: 96 live pages
(48 slugs × NL/EN), including 36 real pages missing from the guide sitemap. All pages have
writing-guide gaps; 60 bodies are positively identified as CMS libraryBody, while the other
36 cannot be distinguished conclusively between CMS body and fallback through public HTML.
Per-page checks, source limits and 48 Dutch keyword/illustration proposals are in
`audit/44a-guides-audit.md` and `.json`; exact files: `audit/files-44a.txt`.
Scripts pass lint/syntax checks. No guide content, app code, database or production change.
41c is complete after the lead’s confirmation. 43b is confirmed and next; 44b batch D follows last.

2026-09-30 — Codex D completed **40a.2 bike Dutch copy**: gearing labels, passport copy,
road description and passport feedback/errors use the bikes dictionary; English unchanged.
10 focused tests, scoped lint and fresh snapshot build/TypeScript pass. Seven retained bike routes
at NL 1440/390 yielded 14 captures, no capture errors and no D-owned app-copy finding.
C's ten Increase/Decrease ARIA prefixes remain reported; fixture bike names are unchanged.
Evidence: `audit/40a.2-notes.md`, `audit/40a.2-nl-findings.md`, `audit/files-40a.2.txt`.
No commit; Marktplaats excluded. Continuing the read-only 44a guide audit.

2026-09-30 — Codex D completed **40a strict Dutch audit harness and owner report**:
70 audited NL routes at 1440/390 plus two PDF HTML variants, 142 captures, no capture errors.
20,042 text/attribute entries and 362 completed interactions; 29 English-copy candidates plus
16 explicitly classified citations, plan names, fixture values and browser validation messages.
Frozen-snapshot source/owner evidence and coverage gaps: `audit/40a-nl-findings.md`.
12 focused tests and scoped harness lint pass; no commit. Bike follow-up 40a.2 and read-only
44a guide audit are in progress. 41c has audit notes and awaits the lead's DONE 41a confirmation;
43b awaits DONE 43a. Marktplaats import is retiring under A's task 46.

2026-10-01 — Codex B **DONE 41b**, awaiting lead review after confirmation of 41a:
six always-editable profile blocks use shared autosave, with isolated preferences/pain
writes, serialized assessments and retry statuses. Audit: `audit/41b-notes.md`;
manifest: `audit/files-41b.txt`. 88 tests, lint/typecheck, production build and 28 browser cases pass.
New Convex preferences mutation deploys before frontend. No commit/deploy; 43a subsequently confirmed by lead.

2026-10-01 — Codex B **DONE 43d**, awaiting lead review:
one 11-calculator registry for sidebar/mobile/dashboard; public bike-fit form reused
in account mode with autosave and the approved session-local input snapshot.
157 focused tests plus 35 existing contracts, lint and production snapshot build pass.
Typecheck passed before D's new test landed; its unsupported getByRole exact option
is the final whole-tree blocker, reported to D (see audit notes).
Capture evidence retains only fixture bike-name language flags after the hover contrast fix.
Notes: `audit/43d-notes.md`; exact manifest: `audit/files-43d.txt`.
Release requires C's Convex infrastructure and D's four confirmed 43b routes; no commit/deploy.

2026-09-30 — Codex A completed **40c Dutch marketing/guide copy**. Canonical Dutch
guide titles, metadata, related links, mixed prose and marketing form copy are
localized in marketing dictionaries; EN preserved. 68 Dutch routes checked at
1440/390 with no named guide-link mismatches. Shared toast aria-label follow-up
and validation details: `audit/40c-notes.md`; exact files: `audit/files-40c.txt`.
No commit, push or deployment.

2026-09-30 — Codex B completed **40d Dutch account audit**: profile/wizard,
questionnaire/results, settings/feedback, safe errors, account labels and metadata.
336 focused tests, typecheck and lint pass. The 56-case sweep retains shared-UI
English ARIA findings and heuristic false positives. PDF/email/bike owner follow-ups
are listed in `audit/40d-notes.md`; exact files in `audit/files-40d.txt`. No commit.

2026-09-30 — Codex B completed **29b account mobile targets**: gearing summaries
and feedback titles now have 44px minimum targets. Settings verified against C's
shared Input fix without a local change. 15 tests, full lint and 16 filtered sweep
cases pass, including NL/EN 390. Notes: `audit/29b-notes.md`; files: `audit/files-29b.txt`.
No commit or push.

2026-09-30 — Codex B completed **27.1 visual corrections**: Dutch core heading,
numeric mono typography, padded range bands, bike pills and usage chips. Fixed
fixture font URL resolution; 56 focused tests and 72 real-font captures pass.
Final full lint hits a concurrent out-of-scope slider repro; see `audit/27-notes.md`.
Manifest: `audit/files-27.txt`. No commit or deployment.

2026-09-30 — Codex B implemented **27 dashboard/report alignment** using the
PDF query, mapper and shared labels. Profile comfort/extra data, A–D ranges,
confidence/priorities and per-bike pressure states are covered by focused tests
and 72 light/dark browser cases. Notes: `audit/27-notes.md`; files: `audit/files-27.txt`.
Combined unit/build/typecheck await parallel PDF integration. No commit by B.

2026-09-30 — Codex A completed **25a2**: semantic selected-language foreground
fix, zero contrast violations in the 64 requested filtered sweep cases and 24
light/dark selected-link checks. Four unrelated hydration cases remain documented
in `audit/25-a2-notes.md`; file list: `audit/files-25-a2.txt`. No commit or push.

2026-09-30 — Codex A completed **25a**, sweep items 7–8. Across 37 filtered routes
(148 unique cases), undersized mobile links drop from 102 to 0 and bike-form
label-title-only cases from 8 to 0. Remaining out-of-scope sweep findings are
recorded in `audit/25-a-notes.md`; exact files: `audit/files-25-a.txt`.
No commit or push by A.

2026-09-30 — Codex B completed **25b**, naming the profile flexibility progressbar
with existing localized copy. Ten regression tests and all 20 filtered profile
sweep cases pass. Before/after: `audit/25-b-notes.md`; files: `audit/files-25-b.txt`.
No commit, push or deployment by B for this task.

2026-09-29 — Codex B verified Sfora #30 account CTA routes, added NL/EN comparison-page
regression coverage and corrected link semantics. Proof: `audit/30-cta-links.md`.
No commit; awaiting lead review.

2026-09-29 — Codex B task 23 dark-mode pass: owned account/content page families checked
at 1440/390 in light/dark. Token-only fixes, capture proof and validation in
`audit/23-dark-b.md`; exact commit list `audit/files-dark-b.txt`. No commit by B.

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

- 2026-09-29 — Codex A completed **24 / dark-a2**, the handed-over bikes and editorial dark-mode pass: 108 light/dark desktop/mobile captures, both token/contrast linters green, full lint/typecheck and 47 focused tests pass. Notes: `audit/24-notes.md`; exact 13-file list: `audit/files-dark-a2.txt`. No commit; awaiting lead review.

- 2026-09-29 — Codex A completed **19.6 marketing dark-mode pass**: theme-aware Header/menu/Footer and owned page families; 46 light/dark screenshots, 118 browser states and 46 unit tests. Typecheck passes; shared lint has unrelated tooltip/CSS blockers. Details: `audit/19-dark-notes.md`; exact source list: `audit/files-19.dark.txt`. No commit; awaiting lead review.

- 2026-09-29 — Codex B implemented **19.5a About/FAQ/Contact/Case Study** with three page workers and parent
  integration. Real mailto and recruitment-form behavior, metadata and FAQPage schema are preserved. Build,
  typecheck, 1065 unit tests, i18n and sitemaps pass. New CSS-token lint flags earlier-batch files only;
  routed to their owners. Scoped file list: `audit/files-19.5a.txt`; validation/renders: `audit/19-notes.md`.
  No commits; awaiting lead review.

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

- 2026-10-01 — **43c complete; awaiting lead review.** Gearing and saddle-width account routes reuse their public forms, restore saved inputs, autosave per user/bike and retain history. Approved backend identity guards, 50 tests, lint/typecheck, 32 comparison captures and 20 persistence scenarios pass. Final production sweep: 16/16 cases pass. Notes `audit/43c-notes.md`, manifest `audit/files-43c.txt`; no commit/deploy.

- 2026-10-01 — **42 implemented; awaiting lead review.** Shared public/account pressure form, per-bike or unbound autosave, prefill precedence and queued-save identity guard. 37 focused tests, lint/typecheck, isolated production build, 16 comparison captures and 10 browser persistence scenarios pass. All account sweep cases pass; public-only plan-name language flags and the existing moderate mobile-shell finding are recorded in `audit/42-notes.md`. Manifest `audit/files-42.txt`; no commit/deploy.

- 2026-09-30 — **40f implemented.** Request-localized root/social/JSON-LD/app metadata and explicit-locale manifests preserve English copy. Ten tests and both live local NL/EN metadata checks pass; shared gates remain blocked by D's in-progress wheelset editor. Notes `audit/40f-notes.md`, manifest `audit/files-40f.txt`; no commit/deploy.

- 2026-09-30 — **46 implemented; combined sweep deferred by lead.** Retired listing import removed; locale-aware permanent redirect and passport/legacy-bike behavior tested. 115 contracts, 10 focused frontend tests, lint/typecheck and build pass. Full-unit/sweep blockers come from concurrent B/D work and are recorded in `audit/46-notes.md`; lead will run the combined sweep after 41c. Manifest `audit/files-46.txt`; no commit/deploy.

- 2026-09-30 — **45 implemented; awaiting lead review.** Exact-name bike deletion from garage/detail/edit, immediate removal and bounded full-data cascade, shared-data preservation and late-write guards. 69 focused tests, 123 contracts, typecheck/lint and eight NL/EN theme/viewport browser cases pass. Notes `audit/45-notes.md`, manifest `audit/files-45.txt`. Includes concurrently added `calculatorStates`; integrate its owner’s schema addition before deployment. No commit or deploy.

- Every agent writes **only** in its own files. New copy goes in its own dictionary module: `src/i18n/calculators/*` (C/D), `src/i18n/marketing/*` (A), `src/i18n/account/*` (B). **`src/i18n/messages/nl.ts` and `en.ts` are frozen**; only the lead changes them, on request (add a line to your notes).
- `src/components/ui/*` and `globals.css`: Codex C. `src/components/layout/*` (Header, Footer, mobile menu): Codex A. Account shell and `src/components/{dashboard,account,profile}/*`: Codex B. Calculator pages: C (batch 2) / D (batch 3).
- At DONE, the agent gives a **file list** in its notes; the lead commits exactly that list per batch.


- 2026-09-29 — **20.4 implemented by Codex C, awaiting lead review.** Account pressure/gearing/saddle,
  shoe-cleat `/fit` CTA, settings, feedback and standalone app install;18.2 warning dedupe included.
  Shell, Convex/authz/engines and frozen dictionaries unchanged by C.996 unit tests and locale gates
  pass; actual-component fixture captures and exact file list in `audit/20-notes.md`. No commit.
- **Styling convention (lead decision):** Tailwind with the semantic/brand tokens first. CSS Modules only for complex layouts, and then **tokens only** (`var(--…)`), no raw colors (hex/rgb/hsl/oklch). Enforced by `npm run lint` → `lint:css-modules` (`scripts/check-css-module-tokens.mjs`). Shadows via tokens too (e.g. `--shadow-float`), or `color-mix()` with a token.
- Open item for the final sweep: in dark mode the marketing header stays light on a dark page (Header = Codex A).

- 2026-09-29 — **19.5b implemented by Codex C, awaiting lead review.** Shared readable legal template
  preserves original privacy/terms text; programmatic pressure pages retain source slugs/SEO/engine.
  Typecheck/build,1,139 unit tests,i18n,sitemap and19browser cases pass. Full lint has49out-of-scope
  CSS color findings; owned modules pass. See `audit/19-notes.md` and `audit/files-19.5b.txt`.
  No commit by C; shared Header/Footer and frozen root dictionaries untouched.

- 2026-09-29 — **22 Codex C dark-mode pass implemented; awaiting lead review.** Twelve calculator URLs,
  shared UI/playground and seven account tools checked light/dark at 1440/390. Token-only fixes,
  124 browser cases, 20 contrast/focus regressions and 162 screenshots. Validation and A/B-owned
  follow-ups: `audit/22-notes.md`; exact files: `audit/files-dark-c.txt`. No commit by C.

- 2026-09-30 — **25c in review:** shared Slider ARIA forwarding and 44px hit targets fixed;
  focused production/browser tests pass. Item 4 traces to A-owned LanguageSwitch and awaits its
  coordinated token fix. Evidence and exact C files: `audit/25-c-notes.md`, `audit/files-25-c.txt`.
  No commit/push; screenshots stay local and are excluded from file lists.

- 2026-09-30 — **26 implemented by Codex C; awaiting lead review.** Six A4 report pages in
  canvas order 1,6,2,5,3,4, existing reportV2 data, NL/EN and embedded local fonts. Missing data
  is omitted; D measurement reference corrected to match the engine. Gates and actual PDF QA
  recorded in `audit/26-notes.md`; exact manifest `audit/files-26.txt`. No commit or push.

- 2026-09-30 — **29a implemented by C; awaiting lead review.** Shared Tooltip/Input/Select minimum
  targets are 44px; icon and larger overrides preserved. Owned mobile cases: 10 failures/18 small
  targets → 0. Combined B/C/D sweep: 280 cases without failures. Proof `audit/29a-notes.md`;
  manifest `audit/files-29a.txt`. No commit/push by C.

- 2026-09-30 — **30 implemented by Codex D; awaiting lead review.** Approved tool ranges, sourced
  carbohydrate bands, corrected sodium drink concentration and explicit FTP comparison tables.
  Sources, number inventory and final validation are in `audit/30-notes.md`; manifest `audit/files-30.txt`.
  No gender inference, hourly sodium dose, commit or push.

- 2026-09-30 — **30.1 result-headline review implemented by D.** Fuel advice/total/fluid lead the
  lime tile; FTP adds an explicitly selected reference rating. 70 focused tests, full lint/typecheck
  and 16 theme/locale/viewport captures pass. See `audit/30-notes.md`; no commit or deployment.

- 2026-09-30 — **C: DONE 41a and DONE 43a; awaiting lead review.**
  Shared autosave, gearing/saddle persistence, settings, Dutch toast labels; then one shared public
  form per account fit tool with authenticated calculatorStates storage. Notes and exact manifests:
  `audit/41a-notes.md`, `audit/files-41a.txt`, `audit/43a-notes.md`, `audit/files-43a.txt`. No commit/deploy.

  C verification: 40 + 33 focused tests, 24 autosave states, 24 public/account comparisons and
  36 filtered sweep cases pass. Final C production build/typecheck use an isolated passing baseline
  while B/D integration continues; exact shared-tree gate limitations are in `audit/43a-notes.md`.

- 2026-09-30 — **C: DONE40e**, shared NL number-field/dialog labels and the authorized home
  comparison text. English preserved;28 focused tests, scoped lint and full typecheck pass.
  See `audit/40e-notes.md`, `audit/files-40e.txt`. No commit. Continuing queued44b-C.

- 2026-10-01 — **D: DONE 41c.** Inline bike/geometry/gearing/notes/description/wheel/tire autosave,
  shared primitives, scoped ownership-checked updates and explicit optional clearing. 17 tests,
  lint/typecheck and production build pass. 16 stateful browser cases plus 28 route cases pass technical
  gates; remaining language findings are the documented rider fixture name. Evidence: `audit/41c-notes.md`,
  `audit/41c-browser.json`, `final-sweep/41c/report.md`, `audit/files-41c.txt`. Deploy Convex first; no commit.

- 2026-10-01 — **D: DONE 43b.** Four performance tools now reuse the public form in account mode,
  with saved/profile/default precedence and C’s scoped storage/autosave. 67 focused tests plus two harness
  registry tests, lint/typecheck and production build pass. 32 public/account comparisons and 32 NL/EN
  route cases pass technical checks; source-title language flags are retained and classified.
  See `audit/43b-notes.md`, `audit/files-43b.txt`. No commit/deploy. D continues with 44b batch D last.

- 2026-10-01 — **C: DONE 44b-C.** Twelve bilingual guide rewrites, twelve route-B SVG/WebP heroes,
  CMS review JSON and authorized shared guide renderer/audit integration. 46 tests, lint, typecheck, production
  build, 24 localized audit pages and 48 desktop/mobile browser cases pass. Sitemap validator passes; local
  CMS sitemap coverage and publishing limitations are recorded in `audit/44b-C-notes.md`.
  Files: `audit/files-44b-C.txt`. No commit or database writes.

- 2026-10-01 — **C: shared guide registration checkpoint.** A/B exports and A/B/C title maps connected.
  Snapshot covers A4+B1+C12 guides; 34 localized pages audited. 17 integration tests, lint, typecheck and
  production build pass. Editorial/link findings and pending D title export are in
  `audit/44b-registration-notes.md`; full-batch sign-off remains pending. No commit/database writes.

- 2026-10-01 — **D: 44b-D content ready; shared registration pending.** Twelve bilingual rewrites,
  twelve route-B SVG/WebP heroes and CMS review JSON are ready. 62 tests, full lint and typecheck pass.
  C must register batchDGuides and guideRewriteTitlesD before the real-route 24-page audit/48 browser captures.
  Request: `messages/20261001-d-to-c-info-44b-registration.md`; evidence: `audit/44b-D-notes.md`.
  No commit or database writes. Not yet DONE 44b-D.

- 2026-10-01 — **A: DONE 44b-A; awaiting lead review.** Twelve bilingual guides,
  twelve new route-B SVG/WebP heroes and CMS review JSON. 37 content/export/image tests, lint,
  typecheck and production build pass; 24/24 localized audits and 48/48 browser captures pass.
  Lead anatomy follow-up: seven figures corrected; anchored IK and native/390px review pass.
  C's shared regression corrections verified: 30/30 tests pass across the three affected suites.
  Notes `audit/44b-A-notes.md`, manifest `audit/files-44b-A.txt`. No commit/CMS writes.

- 2026-10-01 — **C: all four guide batches registered (48 guides).** Combined audit covers96localizedpages;
  94 pass all checks. Two D NL tips sections are under300words; handed to D. 62 shared regression tests pass.
  C rider figures37/38/44 rebuilt with anchored IK and checked at1600/390px;25 content and2geometry tests pass.
  Evidence: `audit/44b-registration-notes.md`, `audit/44b-C-rider-review.json`, `audit/44b-C-notes.md`. No commit.

- 2026-10-01 — **C: shared 44b integration complete.** All A/B/C/D guides and title maps registered.
  Final combined audit: **96/96 localized pages pass every check**. Fresh production build/TypeScript,
  124 shared and D tests, scoped lint and diff checks pass. Two short D NL sections received one practical
  sentence each; CMS review JSON regenerated. See `audit/44b-registration-notes.md` and
  `audit/files-44b-registration.txt`. Supersedes the earlier 94/96 checkpoint. No commit/database writes.

- 2026-10-01 — **C: DONE 47.** All six image-weight steps complete. Public assets reduced from201.72MB
  to18.97MB (90.6%); guide SVGs archived outside public/git. 80 dedicated1200×630 social JPEGs, all≤62,087bytes.
  Ten WebP conversions, legacy source compression, unused-asset cleanup and lint:images guard. 2,015tests pass
  (25skipped), full lint/typecheck and production build pass;13before/after comparisons and3route checks pass.
  Notes: `audit/47-notes.md`; files: `audit/files-47.txt` (no PNGs). No commit/database writes by C.
