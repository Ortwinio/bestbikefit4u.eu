# Step 06 — Browser QA

## Objective

Execute the full `plans/feature-prototyper-ui-migration/TESTPLAN.md` browser checklist, plus additional dark/light mode and new component checks from this plan. Document results and fix any remaining P0/P1 issues.

## Pre-requisites

Before running browser QA:
- Steps 01–05 of this plan are complete
- changed-scope type/build validation passes
- `npm run build` passes
- `npm run dev` runs without errors

## Execution Instructions

Run the app with the repo’s real frontend command if needed:
- `npm run dev`
- or `npm run dev:frontend` if backend/watch behavior needs isolation

Test in: Chrome (primary), Firefox (secondary). Test at both 1440px and 375px viewport widths.

---

## Section A — Dark / Light Mode (New in this plan)

Toggle using the ThemeToggle on the settings page or dashboard.

### A1 — Light mode baseline
- [ ] Page background is a subtle warm white/blue gradient (not pure white, not dark)
- [ ] Cards are white/near-white with visible shadow or border
- [ ] Inputs have white background, dark text, visible border
- [ ] Primary buttons are blue with white text
- [ ] Ghost/secondary buttons legible

### A2 — Dark mode
- [ ] Page background is dark (matches `--background` token ~`oklch(0.174 0.008 255.701)`)
- [ ] No white or near-white backgrounds anywhere
- [ ] Cards have dark surface (`--card`) with subtle border
- [ ] Inputs have dark background, light text, visible border
- [ ] Primary buttons visible against dark background
- [ ] Dialogs use dark surface — overlay is dark
- [ ] Tooltips use dark surface with light text
- [ ] Progress bar track visible against dark background
- [ ] Error states (danger red) visible on dark background
- [ ] Empty state icons and text visible
- [ ] Loading spinners visible

### A3 — Theme switching
- [ ] ThemeToggle shows correct active state in both modes
- [ ] Switching light→dark→system→light works
- [ ] System mode follows OS preference
- [ ] Preference persists after page reload (cookie or localStorage)
- [ ] Keyboard: Tab to ThemeToggle, arrow keys switch options

---

## Section B — Component Contracts (from TESTPLAN.md)

### B1 — Button
- [ ] `variant="primary"` renders blue background, white text
- [ ] `variant="secondary"` renders muted background
- [ ] `variant="outline"` renders bordered, transparent background
- [ ] `variant="ghost"` renders no background
- [ ] `variant="destructive"` renders red background
- [ ] `isLoading` shows spinner, disables button
- [ ] `disabled` state shows reduced opacity, no interaction
- [ ] Focus ring visible on keyboard focus (both light and dark)

### B2 — Input and FieldLabel
- [ ] Label renders above input with correct `for` / `id` linking
- [ ] Tooltip on FieldLabel: appears on hover AND keyboard focus
- [ ] Error state: red ring, error message below input
- [ ] Helper text: shows below input when no error
- [ ] `aria-describedby` links input to helper and error

### B3 — NumberField (new, if Step 04 implemented)
- [ ] Increment/decrement controls visible and functional
- [ ] Keyboard: up/down arrow keys increment/decrement
- [ ] Min/max enforced — cannot go below min or above max
- [ ] Measurement form: inseam, height, arm length all use NumberField
- [ ] Questionnaire numeric questions use NumberField

### B4 — Select
- [ ] Opens on click and keyboard Enter/Space
- [ ] Options navigable with arrow keys
- [ ] Selected option shown in trigger
- [ ] Closes on Escape or outside click
- [ ] Dark mode: dropdown uses dark surface

### B5 — Card
- [ ] `variant="default"` renders with shadow
- [ ] `variant="bordered"` renders with visible border
- [ ] `variant="elevated"` renders elevated look — border visible in dark mode (post-fix)

### B6 — Dialog (AccessibleDialog)
- [ ] Opens when trigger is activated
- [ ] Focus moves inside dialog on open
- [ ] Escape closes dialog
- [ ] Overlay click closes dialog
- [ ] Focus returns to trigger on close
- [ ] Dark mode: dialog surface is dark

### B7 — Tooltip
- [ ] Appears on hover
- [ ] Appears on keyboard focus
- [ ] Escape closes it
- [ ] Dark mode: dark background, light text

### B8 — Toast (new, if Step 05 implemented)
- [ ] Success toast appears on bike save
- [ ] Error toast appears on failed mutation
- [ ] Toast auto-dismisses after ~5s (success)
- [ ] Error toast stays until dismissed
- [ ] Keyboard: Escape dismisses toast

### B9 — Progress bar
- [ ] Indeterminate state (LoadingState) animates
- [ ] Determinate state shows correct percentage
- [ ] Questionnaire progress updates between steps

### B10 — States
- [ ] `LoadingState` renders spinner + progress
- [ ] `EmptyState` renders icon, title, description, action slot
- [ ] `ErrorState` renders with danger color (not hardcoded red)
- [ ] All states look correct in dark mode

---

## Section C — Feature Flows (from TESTPLAN.md)

### C1 — Auth flow
- [ ] Login form renders correctly (Input, Button)
- [ ] Submit shows loading state
- [ ] Error message renders on failure

### C2 — Questionnaire flow
- [ ] Progress bar visible and updates
- [ ] Numeric questions use NumberField
- [ ] Text questions use Input
- [ ] Previous/Next buttons work
- [ ] Submit button works

### C3 — Bikes flow
- [ ] Bike form inputs and select render correctly
- [ ] Save shows success Toast
- [ ] Delete shows confirmation dialog, then success Toast

### C4 — Results flow
- [ ] Results page renders (v1 or v2 depending on engine state)
- [ ] Email dialog opens and closes correctly
- [ ] PDF download works

### C5 — Profile flow
- [ ] Profile form renders
- [ ] Save shows success Toast
- [ ] Delete dialog opens and closes correctly

---

## Section D — Accessibility Spot-Check

- [ ] Tab through login form: all fields and button reachable, focus rings visible
- [ ] Tab through bike form: inputs, select, submit reachable
- [ ] Questionnaire: all controls keyboard-accessible
- [ ] Dialog: focus trap works, Escape closes
- [ ] Toast: announced by screen reader (check `role="status"` or `role="alert"`)

---

## Section E — Mobile (375px viewport)

- [ ] Login page: form not clipped, button full-width
- [ ] Dashboard: sidebar collapses to mobile menu
- [ ] Questionnaire: progress bar and questions readable
- [ ] Bike form: inputs and select full-width
- [ ] ThemeToggle: visible and tappable

---

## Documenting Results

For each failed item:
1. Note the exact failure
2. Classify: P0 (blocks a feature), P1 (broken UX), P2 (visual issue)
3. Fix P0 and P1 that are in scope for this plan before marking this step complete
4. Document P2 and out-of-scope P1 items separately

## Output

Write `output-06-browser-qa.md`:
- Full checklist with pass/fail per item
- Browser + viewport where each failure occurred
- P0/P1 fixes applied
- P2 backlog
- Out-of-scope failures discovered during QA
- Final sign-off statement
