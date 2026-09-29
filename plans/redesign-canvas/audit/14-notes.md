# 14 — Mobile boards

Task owner: Codex D. Drafts for Claude's review; no app changes, publication, or commit.

## Scope and sources

The Sfora assignment limits writes to `drafts/m/*.dc.html`, `drafts/_renders/m-*.png`, and this note. The shared README is therefore not changed. Other agents' existing edits are untouched.

| Mobile board | Source | Size | Adaptation |
| --- | --- | --- | --- |
| Home | `canvas/Main.dc.html` | Pending final QA | Stacked marketing sections and live saddle-height teaser |
| SaddleHeight | `canvas/SaddleHeight.dc.html` | 390 × 2740 | Stacked inputs, full result, sticky bottom result bar |
| BikeFit | `canvas/BikeFit.dc.html` | 390 × 2660 | Stacked input/results flow, two-column choices and result tiles |
| Dashboard | `drafts/Dashboard.dc.html` | 390 × 3260 | Four primary bottom tabs and Meer menu containing remaining account destinations |
| FitResults | `drafts/FitResults.dc.html` | Pending final QA | Mobile report and account navigation |
| Login | `canvas/Login.dc.html` | 390 × 1280 | Form first, email/code flow, benefits below form |

Each board has an individual subagent assignment. Board rules, format, brand, and mobile prototype guidance govern the adaptation. Side margins are 16 px; navigation and controls retain at least 44 px touch areas. No fake device chrome or keyboard is drawn. Tools navigation scrolls horizontally and shows the next pill at its edge. Links point to mobile siblings where available and `../` boards otherwise.

## Logic and state preservation

- SaddleHeight and BikeFit preserve the source Component scripts byte-for-byte, including input ranges, enums, formulas, handlers, and result geometry. Mobile layout does not change calculations.
- Dashboard retains all 14 original review states and actions; a separate Meer state exposes the remaining sidebar links. The account plan/usage information remains available below the content.
- Login retains the original login handlers and validation. Only review-state controls are added above the product UI to expose email, code, ready, and error states. These are prototype interactions, not real authentication or email sends.
- Existing account example data uses the single `Voorbeeldgegevens` chip. Review controls remain in the prescribed 44 px strip outside product content.

## QA evidence

Validation is in progress until the final results below are recorded. Rendering uses temporary Playwright template-expansion harnesses with the real `renderVals()` output and cached Google Fonts. The runtime checker exercises the actual handlers separately. The repository does not contain the canvas host's `support.js`; these checks do not claim a live published-canvas integration test.

- BikeFit: board checker PASS; runtime checker PASS (70 states). Default and city/Aero renders; no overflow, clipped text, unresolved holes, missing images, or undersized controls. Additional root QA includes links and summary elements.
- SaddleHeight: board checker PASS; runtime checker PASS (61 states). Default/minimum/maximum renders plus scrolled viewport captures. All touch targets, including links, pass. At scrollY 600 in a 390 × 844 viewport the result bar occupies y 764–844, with document width 390.
- Dashboard: board checker PASS; runtime checker PASS (73 states). All 14 source review states plus Meer rendered, with full-artboard and selected 390 × 844 viewport captures. All target types checked; no overflow or clipping. The bottom navigation remains visible while scrolling.
- Login: board checker PASS; runtime checker PASS (34 states). Email/code/ready/error renders visually reviewed; layout and fonts verified.

Renders use `drafts/_renders/m-<Board>*.png`. Bricolage Grotesque, Figtree, and DM Mono load in the renders. Scrollable review strips and tool tabs are deliberately exempt from off-screen-child checks; their containing page must still remain 390 px wide.

## Final results

Pending Home and FitResults completion and combined validation.
