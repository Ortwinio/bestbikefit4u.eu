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

- 2026-09-29 — **Palette locked: canvas lime/petrol** (decided by Ortwin). It replaces the blue/Inter palette in `plans/BestBikeFit4U_Redesign_Plan.docx`. The brand rules (colors, type, logo, tone of voice, icons) are in `reference/brand.md`, and they win over anything else.

## Gate log

- 2026-09-29 — **Phase 1 passed.** 01 route map: 70/70 routes, 6 claims spot-checked OK. 02 engine alignment: 28 must-fix items, 6 claims spot-checked OK. Findings carried forward:
  - The 4 existing configurator boards need the must-fix list from `audit/engine-alignment.md` → new task 03.
  - `Login.dc.html` shows a password, but the live login is an email code (Resend) + Google → fix in 03.
  - Dead CTA links in the app: `/dashboard/bikes` (bikes/compare-fit:118) and `/dashboard/fit` (shoe-cleat-fit:118) → phase 6 bug card.
  - FTP W/kg, power↔speed, climb planner and fuel & hydration are content-only pages with no calculator contract → scope decision needed before their boards.
  - Frontend/engine range mismatch: bike-fit form height 140–220 cm vs engine 130–210 cm → phase 6.
