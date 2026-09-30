# 18 — Phase 6c: build the configurator pages (Codex C)

**App code, don't commit** (the lead reviews after every batch). Read `README.md`, `audit/16-notes.md` (your components) and `audit/engine-alignment.md` first.

## 0. Fix first (lead QA on 16)
The **border tokens are still too dark**: the header's bottom line and the footer's info box show an ink border, where the canvas uses `#DCE6E1` (`--border`). Check `border`, `border-dark`, `panel-border*` and `dashboard-border*` in `globals.css` (light + dark) and the components that use `border-foreground`/`border-dark`. Contrast lint stays green (UI borders are decorative; the 3:1 requirement only applies to input borders/focus rings).

## 1. Rebuild the pages to match the board (in this order, one batch = 3 pages)
Batch 1 (pilot): `/calculators/saddle-height` ← `canvas/SaddleHeight.dc.html`, `/calculators/frame-size` ← `canvas/FrameSize.dc.html`, `/calculators/crank-length` ← `canvas/CrankLength.dc.html`.
Batch 2: `/calculators/saddle-width`, `/calculators/bike-fit`, `/tire-pressure-calculator` + `/bandenspanning-calculator` + `/bandenspanning/{racefiets,gravelbike,mtb}`.
Batch 3: `/calculators/gearing`, `/calculators/power-speed`, `/calculators/climb-planner`, `/calculators/ftp-wkg`, `/calculators/fuel-hydration`.

Rules:
- **The engine stays the source.** Keep the existing adapters/engines (`src/lib/public-calculators/fitAdapters.ts`, `src/lib/pressure-engine.ts`, `src/lib/gearing-engine/*`, `src/lib/saddle-width-engine/*`). Only the UI changes. The board formulas are NOT copied (they were temporary). Where the board shows something the engine doesn't return, leave it out and note it.
- **Power↔speed, climb planner, FTP W/kg, fuel & hydration** (batch 3) have no calculator today. Build the UI with the existing physics helpers (`src/lib/gearing-engine/math.ts`) in a new small module, `src/lib/public-calculators/performance.ts`, with unit tests. Take the [VOORSTEL] ranges from `05-new-tool-contracts.md` as named constants (`PROPOSED_RANGES`, with a comment that they await approval). Fuel & hydration: no numbers without a source. The page shows the inputs and the timeline, with an honest "advies volgt" state instead of invented grams.
- **i18n**: all new copy goes through the existing dictionaries (`messages/` / `src/i18n`), in NL (from the board) and EN (a good translation). `npm run test:i18n` stays green (messages parity).
- **SEO**: keep metadata, canonicals, JSON-LD and the FAQ content of every page (the audit named the canonicals). Content sections under the tool (explanation, FAQ, related tools) may stay, restyled with the new components.
- **Behaviour**: numbers are sliders (with keyboard support and `aria-valuetext`), choices are segments/cards, the result is live. Mobile: stacked, with a sticky result bar showing the main number.
- Reuse the components from 16. If something is missing, add it to `src/components/ui/` with a test.

## Per batch: done when
- `npm run typecheck`, `npm run lint`, `npm run test:unit`, `npm run test:i18n` and `npm run build` pass.
- Screenshots (1440 + 390) of every page in NL, in `plans/redesign-canvas/code-renders/18-<page>-{desktop,mobile}.png`, plus 1 EN page per batch. Place the matching board render next to it for comparison (`drafts/_renders/` or render it).
- `audit/18-notes.md` (updated per batch): per page, which board elements were built, which weren't (and why), engine differences, and new i18n keys.
- Print `DONE 18.1`, `DONE 18.2`, `DONE 18.3` after each batch and **wait** for the lead's approval before starting the next batch.
