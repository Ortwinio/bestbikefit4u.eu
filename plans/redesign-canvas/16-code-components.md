# 16 — Phase 6b: shared components (Codex C)

**App code, don't commit** (the lead reviews). Read `README.md`, `BOARD-RULES.md`, `reference/design-language.md` → "Componenten" and "Configurators: de interactieregels", and look at the approved boards in `canvas/` (e.g. `SaddleHeight.dc.html`, `CrankLength.dc.html`, `Gearing.dc.html`, `Pricing.dc.html`, `Main.dc.html`) and the approved account boards in `drafts/` (`FitResults`, `Profile`, `FitQuestionnaire`). **Use subagents** (e.g. one for inputs, one for display, one for layout).

Build or restyle in `src/components/ui/` (existing: `Slider`, `SegmentedControl`, `Selectable`, `Button`, `Card`, `MeasurementTile`, `StatRow`, `Progress` — **restyle them where possible instead of duplicating**, keeping their API compatible so existing pages keep working):

**Inputs**
1. `Slider` — the canvas pattern: label on the left, a large value on the right in DM Mono with a small muted unit, a filled petrol track, a white thumb with a petrol ring, optional scale ticks and a hint text. 44 px hit area, keyboard support, `aria-valuetext` with the unit.
2. `SegmentedControl` — the canvas segments (a soft track `#EEF3EF`; the active segment is white with a shadow, or ink/white for the "strong" variant), `aria-pressed`/radio semantics.
3. `OptionCard` (based on `Selectable`) — label + a 1-line description, selected = lime-soft with a petrol border, optional check icon.
4. `StepCard` — a white card with a numbered lime circle + title (the "1 Jouw lichaam" pattern).

**Display**
5. `ResultHero` — the lime (or ink) result panel with a large DM Mono number + unit + subtext.
6. `ResultTile` — a small white tile (label, DM Mono value + unit, optional status line).
7. `StatusChip` — ok/warn/deviation (lime/`#FFD66B`/`#FFB199` + ink text).
8. `Gauge` — the semicircle meter (per the design language), accessible (`role="meter"`).
9. `SizeScale` — a scale of discrete options with a highlighted recommendation and a bordered borderline option (FrameSize/CrankLength/SaddleWidth).
10. `AdjustOrder` — the "Pas in deze volgorde aan" block (numbered steps).

**Layout**
11. `ToolsTabBar` — the tools tab bar (the white pill with 8 tabs, active = ink), from `BOARD-RULES.md`, with real routes. On mobile: a horizontally scrollable row.
12. `MoreToolsNav` — the "Meer" sub-nav (4 tools).
13. `ConfiguratorLayout` — header area (eyebrow + question heading) + a 2-column grid (inputs 520–560 px / result), stacking on mobile with an optional sticky result bar.

**Playground**: `src/app/(public)/design-system/page.tsx`, **only outside production** (`notFound()` when `process.env.VERCEL_ENV === 'production'` or `NODE_ENV === 'production'` without a preview flag). Show every component in its states, with NL copy from the boards. Keep it out of the sitemap.

## Done when
- Unit tests for each new or restyled component (rendering, a11y roles/labels, keyboard for Slider/SegmentedControl). Existing tests stay green.
- `npm run typecheck`, `npm run lint`, `npm run test:unit` and `npm run build` pass.
- Screenshots of the playground (desktop 1440 + mobile 390) in `plans/redesign-canvas/code-renders/16-*.png`, plus 2 existing pages (`/nl/calculators/saddle-height`, `/nl/fit/...` if reachable, otherwise `/nl/profile` logged out → login) to prove nothing broke.
- `audit/16-notes.md`: components, APIs, which existing usages are affected, deviations from the boards.

Print `DONE 16`.
