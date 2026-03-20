# Step 02 — Dark Mode Fixes

## Objective

Fix all dark/light mode issues found in Step 01, starting with the known critical bugs identified before the audit.

## Known Issues (Pre-Confirmed)

### P0 — Body background doesn't change in dark mode

**File:** `src/app/globals.css`

Current `body` background:
```css
body {
  background:
    radial-gradient(circle at top, rgb(59 130 246 / 0.08), transparent 28%),
    linear-gradient(180deg, rgb(255 255 255 / 0.96), rgb(248 250 252 / 0.98));
}
```

This uses hardcoded light `rgb(255 255 255)` and `rgb(248 250 252)` values. When `.dark` is applied, the CSS tokens on `--background` change correctly but the `body` background gradient never changes.

**Fix:** Replace with CSS token–based gradient:
```css
body {
  background:
    radial-gradient(circle at top, oklch(from var(--primary) l c h / 0.08), transparent 28%),
    var(--background);
  color: var(--foreground);
}

.dark body {
  /* The gradient tint needs to be visible on dark backgrounds */
  background:
    radial-gradient(circle at top, oklch(from var(--primary) l c h / 0.06), transparent 28%),
    var(--background);
}
```

Or simpler — just use `--background` and add a subtle gradient that works in both modes using CSS tokens instead of hardcoded white.

### P1 — `Card` `elevated` variant hardcoded white border

**File:** `src/components/ui/Card.tsx`

```
elevated: "border-[color:rgb(255_255_255_/_0.35)] shadow-xl shadow-slate-950/6"
```

`rgb(255_255_255_/_0.35)` is a translucent white border — completely invisible on a dark background.

**Fix:** Replace with a token-based border:
```
elevated: "border-[color:var(--border)] shadow-xl shadow-slate-950/6"
```
Or a subtle `oklch` overlay border that works in both modes.

### P1 — `shadow-slate-950/6` hardcoded shadow color

Same `Card.tsx` elevated variant. Use `shadow-black/10` or a CSS variable for shadow color in dark mode.

## Additional Fixes (from Step 01 Audit)

For each hardcoded color found in Step 01:

1. **Identify the semantic intent** — Is this a background? Border? Text? Shadow?
2. **Map to the appropriate CSS token** — Use `var(--card)`, `var(--border)`, `var(--muted)`, etc.
3. **Verify in both modes** — Each fix must make the element look correct in both light and dark.

## Scope Guard

This step should fix:
- `src/components/ui/*`
- `src/app/globals.css`
- any directly related layout shell files if Step 01 identified them as part of the migrated primitive surface

Do not expand this into a full-app theming refactor.

## Dark Mode Verification Checklist

After all fixes, visually verify (in `npm run dev` with dark mode active):

- [ ] Page background is dark (not white or near-white)
- [ ] Cards have dark surface color with visible border
- [ ] Inputs have dark background, visible border, legible text
- [ ] Select dropdown has dark background
- [ ] Dialog overlay and content are dark
- [ ] Tooltips have dark background with light text
- [ ] Progress bar track is dark, indicator visible
- [ ] Error states use `var(--danger)` — red visible on dark background
- [ ] Success/warning states visible on dark background
- [ ] ThemeToggle active state visible in dark mode
- [ ] Buttons (primary, secondary, ghost, destructive) all look correct in dark mode
- [ ] Focus rings visible in dark mode (check `--ring` token value)
- [ ] Loading spinners visible in dark mode
- [ ] Empty state icons visible in dark mode

## Quality Gates

After all fixes:
- Run targeted validation for changed files plus:
  - `npx tsc --noEmit` if repo state allows
  - `npm run build`
- Manually toggle dark/light and verify the checklist above

If unrelated repo failures block `tsc`, record them explicitly and continue with changed-scope verification.

## Output

Write `output-02-dark-mode-fixes.md`:
- List of fixes applied with file:line references
- Dark mode verification checklist result (pass/fail per item)
- Any items still failing with notes on why
