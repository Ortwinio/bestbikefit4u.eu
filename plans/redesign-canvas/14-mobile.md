# 14 — Mobile 390 px (next free agent)

Read `BOARD-RULES.md` and `reference/craft.md` → "Mobile prototypes" first. **Use subagents: one per board.**

Make mobile versions (390 × height as needed, usually 2000–4000) of the approved boards in `canvas/`:
1. `m/Home.dc.html` ← `canvas/Main.dc.html`
2. `m/SaddleHeight.dc.html` ← `canvas/SaddleHeight.dc.html` (the configurator pattern on mobile: inputs stacked, the result as a **sticky result bar** at the bottom showing the main number, plus the full result below the inputs)
3. `m/BikeFit.dc.html` ← `canvas/BikeFit.dc.html`
4. `m/Dashboard.dc.html` ← `drafts/Dashboard.dc.html` if it exists, otherwise `canvas/Dashboard.dc.html` (the sidebar becomes a bottom tab bar with 4–5 main items + "Meer")
5. `m/FitResults.dc.html` ← `drafts/FitResults.dc.html` (after 08)
6. `m/Login.dc.html` ← `canvas/Login.dc.html`

Rules: 16 px side margins, no horizontal overflow, touch targets ≥ 44 px, no fake status bar or keyboard, the tools tab bar becomes a horizontally scrollable pill row (with a visible next item as a scroll hint). Headings scale down (hero 44–48 px). The tool logic stays **identical** (copy `renderVals()`, only the layout changes).

Done when: checkers PASS (`node check-board.mjs drafts/m/*.dc.html`); renders at 390 wide; `audit/14-notes.md`. No app code, no commit. Print `DONE 14`.
