# DONE22 — shared UI dark-theme pass

Read latest redesign README ownership/styling rules. No commits, backend/engine/math,
root-dictionary, header/footer or page-calculation edits. Parent authorized full-color
CSS aliases and tooltip-coverage registration for playground.

## Changes
- Replaced invalid direct channel-token color classes with semantic Tailwind utilities
  in fields, labels, dialogs, tooltips, states and section headers. Wrapped channel tokens
  correctly inside InfoBox/Toast color-mix expressions; surfaces now actually resolve.
- Error copy/invalid labels use existing destructive-text ink-on-light/salmon-on-dark
  token, not destructive salmon fill. New source regression prevents this distinction
  regressing. No brand status-fill colors changed.
- Gauge label/value/unit/ticks inherit enclosing text color; actual meter bounds/value
  unchanged. Theme-aware gauge accent defaults to petrol in light, primary in dark;
  ResultHero scopes petrol-on-lime or lime-on-ink accent for nested gauges.
- Global heading color inherits contextual text rather than forcing theme-white headings
  inside fixed lime panels. Normal page headings inherit normal foreground unchanged.
- SizeScale idle surfaces and boundary become semantic; recommended dark state and
  selected segmented controls use primary/primary-foreground for a clearly visible pill.
- ToolsTabBar/MoreToolsNav use theme-aware card/border/text/hover/focus tokens; active
  state remains ink/white in light and readable primary/primary-foreground in dark.
- Fixed invalid-field-ring missing oklch wrapper. Slider thumb gains focus-within ring:
  Base UI focuses its nested native range input, so wrapper focus-visible alone did not fire.
- Tooltip ring now belongs to actual trigger focus-visible, not an always-ringed inner span.
- Added --bbf-ui-{foreground,muted-foreground,background,card,card-foreground,secondary,
  primary,primary-foreground,border,ring,muted,success,warning-foreground} full-color
  aliases in both root and dark scopes for token-only route CSS modules. Success alias
  is a fill color; use existing text-success-text utility for small status text.
- Playground now exercises a nested lime Gauge/heading, normal and invalid text fields
  with actual tooltips, section header and InfoBox statuses; registered it with tooltip
  enforcement, not an exemption. Authentication/access behavior unchanged.

## Verification
- Shared UI Vitest:18 files,72/72 tests pass, including dark source-color contracts,
  inherited Gauge values, keyboard control updates/focus hooks, valid status surfaces.
- Contrast checker:254/254 checks pass; adds fixed lime/status/ink foreground pairs and
  light/dark Gauge accent non-text checks, while retaining all semantic/focus pairs.
- Targeted ESLint all owned JS/TS/TSX files passes.
- Tooltip coverage guard passes47 form-control files.
- Every owned file <=120 columns after Prettier/long-class wrapping.
- Parent owns aggregate typecheck/build/unit gates and full public/account screenshotmatrix.
  Assets agent verified genuine browser Tab-to-slider/input/button focus assertions:
  all4 light/dark ×390/1440 cases pass; visible rings disappear onblur; combined browser
  suite20/20 passes. Wrapper selector is [data-slot=slider-thumb], since the native range
  input itself has no box shadow.
- Parent full screenshot computed-contrast pass initially identified salmon error copy on
  white; fixed in Input/Textarea/Select/NumberInput/States and covered by new regression.
  Parent refreshing design-system screenshots after that fix.

## Out-of-scope follow-up
- Account Settings LanguageSwitch active NL white-on-primary issue lives in
  src/components/layout/LanguageSwitch.tsx (A-owned). Parent notified; no edit by this worker.

## Exact files
- `src/app/globals.css`
- `src/components/ui/AccessibleDialog.tsx`
- `src/components/ui/FieldLabel.tsx`
- `src/components/ui/Gauge.tsx`
- `src/components/ui/InfoBox.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/MoreToolsNav.tsx`
- `src/components/ui/NumberInput.tsx`
- `src/components/ui/ResultHero.tsx`
- `src/components/ui/SectionHeader.tsx`
- `src/components/ui/SegmentedControl.tsx`
- `src/components/ui/Select.tsx`
- `src/components/ui/SizeScale.tsx`
- `src/components/ui/States.tsx`
- `src/components/ui/Textarea.tsx`
- `src/components/ui/Toast.tsx`
- `src/components/ui/ToolsTabBar.tsx`
- `src/components/ui/Tooltip.tsx`
- `src/app/(public)/design-system/Playground.tsx`
- `scripts/check-brand-contrast.mjs`
- `src/components/ui/DarkTheme.test.tsx`
- `src/components/ui/Slider.tsx`
- `src/components/ui/display.test.tsx`
- `scripts/check-tooltip-coverage.mjs`
