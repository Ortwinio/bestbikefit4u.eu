# 08 — Account: profile & fit flow (Codex A)

Read `README.md`, `BOARD-RULES.md` (including "Account screens"), `audit/route-map.md` (Dashboard/account) and `reference/design-language.md` → "Achter de login" first. **Use subagents if your tooling supports them**: one per board, and you do the final check yourself.

Boards (all under `drafts/`):
1. `Profile.dc.html` — `/profile`: the profile wizard (body measurements with illustrations, physical traits, riding context) + edit mode. Measurement illustration 02/06 from `public/illustrations/` may be used as `<img>` placeholders (the lead swaps them for canvas assets at publish time; use `src="/illustrations/02-zadelhoogte-meten.webp"`).
2. `ProfileImprove.dc.html` — `/profile/improve/*`: one template, 4 variants (body-measurements, flexibility, core-stability, comfort) via state.
3. `FitStart.dc.html` — `/fit`: choose a bike + session context, start a session.
4. `FitQuestionnaire.dc.html` — `/fit/[sessionId]/questionnaire`: the dynamic questions as option cards/sliders, progress, and back/next. Use the real questions from `convex/questionnaire/` (at least 4, with realistic branching shown as state).
5. `FitResults.dc.html` — `/fit/[sessionId]/results`: now vs. target, the live bike drawing (reuse the geometry from `drafts/BikeFit.dc.html`), top-3 adjustments, and the report actions (PDF/email) with the access state (Free vs Pro/Fit Pass).

Done when: `check-board.mjs` + `check-runtime.mjs` PASS; renders in `drafts/_renders/` (one per important state); `audit/08-notes.md` with the sources per board (file:line), the states, and "suggestions outside scope". No app code, no commit. Print `DONE 08`.
