# 25c — sweep items 4–6

No commit or push. Source changes are limited to shared Slider and its regression test.

## Fixes

- Item 5: extract caller-supplied `aria-valuetext` before forwarding Slider root props. The group
  no longer receives a range-only attribute; the native range retains its custom accessible value.
  Remove unsupported `aria-required` from the group and thumb. Range inputs always have a value.
- Item 6: the real thumb and nested range input are 44×44px. A centered pseudo-element preserves
  the visible 30×30px circle. Keyboard focus remains visible. The 44px control/track area is unchanged.
- Item 4: all 44 baseline contrast cases trace to A-owned LanguageSwitch's selected text using an
  invalid raw tuple color. The required fix is `text-primary-foreground` in both selected branches.
  Coordination is pending with A/lead; C has not edited the shared layout file.

## Verification completed

- Full lint passes, including 254 contrast pairs and CSS-module token validation. Typecheck passes.
- 141 targeted UI/calculator/measurement/account-gearing tests pass (20 opt-in browser tests skipped).
- Filtered production sweep, 40 calculator cases (NL/EN × 1440/390), via:
  `node tests/visual/final-sweep/sweep.mjs --filter=calculators --port=4331
  --output=plans/redesign-canvas/code-renders/25c-calculators`
- Calculator before → after: 28 → 0 cases with `aria-allowed-attr`; 20 → 0 mobile cases with
  undersized slider inputs. Contrast remains 20 → 20 pending A's LanguageSwitch correction.
  Other remaining failures are A-owned header/breadcrumb links and known harness diagnostics.
- Eight focused actual-production browser cases cover NL/EN home, bike fit and public tire pressure
  at both widths. Axe `aria-allowed-attr` passes; every range and thumb is 44×44 and every visible
  circle is 30×30. ArrowRight updates values, and pointer drags starting 2px inside the expanded
  target (outside the visible circle) work. See `25-c-slider-browser.json`.
- Focused runner: `tests/visual/slider-a11y/check.mjs`; no form submissions or data writes.

The initial sweep JSON is retained locally in code-renders; screenshots remain unversioned and are
excluded from the file list. `25-c-before-after.json` preserves the comparison summary.

## Additional filtered sweeps

Production sweeps also ran with `--filter=pressure` (12 cases) and `--filter=bandenspanning`
(20 cases), both on port 4332, with matching `code-renders/25c-<filter>` output directories.
An additional `--filter=gearing` run (8 cases) verifies the account gearing page too.
Across all 80 filtered cases (76 unique route/locale/viewport cases) there are zero Slider ARIA violations and zero undersized range inputs.
The baseline comparison per filter is recorded in `25-c-before-after.json`. The remaining contrast
findings still target A's active language link. Known harness diagnostics and other owners' target
findings remain visible in the original local reports; they are not suppressed or counted as passes.

**Status:** items 5–6 complete; item 4 awaits the LanguageSwitch ownership handoff/fix.
Do not claim DONE 25c until the contrast fix is included and reverified.

## Combined sweep (lead's comma-separated filter)

Ran one invocation with `--filter=calculators,gearing,tire-pressure,bandenspanning --port=4332`
and output `plans/redesign-canvas/code-renders/25c-combined`. This covers 72 cases with the updated
D-owned harness diagnostics. All Slider ARIA and slider-size checks remain clear. The current
LanguageSwitch source still contains the invalid selected text classes; item 4 remains pending.
The complete latest summary and remaining findings are preserved in `25-c-before-after.json`.

Combined non-C-row findings: the four known React #418 cases remain on NL public gearing/power-speed
(D item 3). Two account gearing `<summary>` targets are 24/28px high; these are not slider inputs and
are retained as follow-up findings. The combined sweep is not claimed fully green.
