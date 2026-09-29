# Board rules — every `.dc.html` draft

The lead rejects any draft that breaks one of these rules.

## Files
- Write drafts to `plans/redesign-canvas/drafts/<Name>.dc.html`. Never edit `canvas/` (it's a snapshot of what's published).
- To change an existing board, copy it from `canvas/` into `drafts/` first, then edit the copy. Keep everything you weren't asked to change **exactly** as it is.
- Format: `reference/format.md`. The skeleton is the one in the existing boards (e.g. `canvas/SaddleHeight.dc.html`): keep `<script src="./support.js"></script>` exactly, close every element, quote every attribute, give the root a fixed `width`/`height` equal to the `$preview` in `data-props`, and write classic JS `class Component extends DCLogic` with no imports.
- `{{holes}}` are dotted lookups only (no expressions). Compute everything in `renderVals()`, return handlers from `renderVals()`, and set state in the constructor. `<sc-for>`/`<sc-if>` always carry `hint-*` attributes.
- No `innerHTML`, no network access except the Google Fonts link, no emoji, no gradients.

## Look (`reference/brand.md` wins over everything)
- Only brand colors: ink `#0F2420`, lime `#CFF26A` (always with ink text), petrol `#0A7263` (white text), soft variants, and the status chips (`#CFF26A` / `#FFD66B` / `#FFB199`). White text only on petrol or ink.
- Bricolage Grotesque for headings, Figtree for body, DM Mono for **every** number, with the unit small and muted.
- Tools header: copy it from `canvas/SaddleHeight.dc.html`. The tab bar in every configurator is: Bike fit · Zadelhoogte · Framemaat · Bandenspanning · Cranklengte · Zadelbreedte · Verzet · Meer. Link each tab to its board file (`CrankLength.dc.html`, `SaddleWidth.dc.html`, `Gearing.dc.html`); the active tab is ink with white text and `aria-current="page"`.
- Width 1440; configurators use 64 px side margins, with the input column 520–560 px on the left and the live result on the right.

## Configurator interaction
- Every number is a slider (label on the left, big DM Mono value on the right, filled track like `canvas/SaddleHeight.dc.html`). No typed numbers.
- Choices are segment buttons or option cards with `aria-pressed`. No dropdowns.
- Inputs are numbered steps 1, 2, 3 in a lime circle.
- The result updates live: a visual whose geometry follows the values, result tiles in DM Mono, a "Pas in deze volgorde aan" block, and a CTA to save the result in the account.
- Honesty: show a test margin, not false precision. Where the engine gives discrete values (e.g. crank lengths), show discrete values.
- **Ranges, steps, enums and discrete outputs come from `audit/engine-alignment.md`** (with file:line). The formulas in `renderVals()` may be simplified, but put the comment `// VOORLOPIGE REKENREGEL — echte engine: <file:line>` above each one.
- Touch targets are at least 44 px. Use real `<button>`, `<label for>` and `<input>`, and give icon-only buttons an `aria-label`.

## Copy
- Dutch, `lang="nl"`, informal "je", concrete and without hype (see `reference/brand.md` → Tone of voice). Buttons start with a verb.
- No invented numbers, reviews or claims. Anything missing becomes `[PLACEHOLDER]`. Example data in account screens must be recognisable as examples.

## Self-check before you say DONE
Run `node plans/redesign-canvas/check-board.mjs drafts/<Name>.dc.html` for every draft and fix everything it reports.

## Renders for the lead
Save a PNG per draft to `drafts/_renders/<Name>.png` (1440 wide, from your local headless render). For boards with several states, save one PNG per state (`<Name>-<state>.png`). The lead reviews them visually before a board is published.

## Consistency across boards (lead decision after the phase 2 visual QA)
- **"Meer" sub-nav**: exists only on the four tools under "Meer" (the main tab "Meer" is active there). Order and labels are fixed: **Vermogen ↔ snelheid · Klimplanner · FTP / W/kg · Voeding & drinken** → `PowerSpeed.dc.html`, `ClimbPlanner.dc.html`, `FtpWkg.dc.html`, `FuelHydration.dc.html`. It is a pill row directly under the header, **above** the eyebrow; the active pill is ink with white text and `aria-current="page"`. `Gearing.dc.html` is a main tab and gets **no** sub-nav.
- **Units in Dutch**: `km/u` (not km/h), `W`, `W/kg`, `kg`, `mm`, `cm`, `%`, `rpm`, `bar`, `min`, `uur`. Decimal comma.
- **DM Mono only for numbers and units** (plus short formulas like "FTP = 0,95 × 20-min"). Whole sentences are in Figtree; numbers inside a sentence may be in DM Mono via `<span>`.
- **No statistics or dev jargon in copy**: not "betrouwbaarheidsinterval", "gevoeligheidscheck", "schuifstap", "model", "engine". Honest limits are phrased for riders: "Een schatting bij constant vermogen en zonder wind."
