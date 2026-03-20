# Step 03 — ThemeToggle Upgrade

## Objective

Decide whether `ThemeToggle` should be replaced with a Prototyper primitive or hardened in place, then implement the safer option.

## Background

Current `src/components/ui/ThemeToggle.tsx`:
- Three `<button>` elements wrapped in a `div`
- Active state handled with manual `cn()` class switching
- No ARIA role for the group (`role="group"` or `role="radiogroup"` missing)
- No keyboard navigation between options (left/right arrow keys)
- Styling duplicates what `SegmentedControl` already provides

The plan must not assume `SegmentedControl` exists in the current repo or upstream package set until verified.

## Tasks

1. **Feasibility check:**
   Confirm whether an upstream `segmented-control` or `toggle-group` component exists and is appropriate.

2. **Decision point:**
   - If a suitable Prototyper primitive exists, install or copy it and use it.
   - If not, keep `ThemeToggle.tsx` local and upgrade its semantics and keyboard behavior directly.

3. **Rewrite `ThemeToggle.tsx`:**
   The final component must:
   - Accept the same `labels: { light, dark, system }` prop (preserve the existing API — the component is used in translated form from outside)
   - Use Sun / Moon / Monitor icons alongside labels
   - Use `useTheme()` from `ThemeProvider` for state
   - Support keyboard navigation (arrow keys between options)
   - Have correct ARIA: `role="radiogroup"` on the group, `role="radio"` and `aria-checked` on items

4. **Update tests or add a focused test** if keyboard behavior or roles change materially.

5. **Verify:**
   - Toggle works correctly (light → dark → system → light cycling)
   - Active option visually distinct in both light and dark mode
   - Keyboard: Tab to reach group, arrow keys to switch, Enter/Space to confirm
   - Screen reader announces current selection

## Output

Write `output-03-themtoggle-upgrade.md`:
- Which option was chosen and why:
  Prototyper primitive vs hardened local implementation
- Install command used, if any
- API changes to `ThemeToggle` (should be none — same `labels` prop)
- Keyboard/ARIA verification notes
