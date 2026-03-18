# 10 — Cleanup and Verification

## Goal

Remove all dead code, verify types, and do a final visual check to confirm the migration is complete and correct.

## Steps

### 1. Remove dead files

Check that no old custom component files remain unreplaced. If any files from the original set were not fully replaced, either replace them now or confirm they are intentionally kept.

Files that should now be Prototyper UI versions (not the originals):
- `src/components/ui/Button.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Select.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/AccessibleDialog.tsx` (or replaced by `Dialog.tsx`)
- `src/components/ui/Tooltip.tsx`
- `src/components/ui/FieldLabel.tsx` (or replaced by `Label.tsx`)
- `src/components/ui/States.tsx`
- `src/components/questionnaire/ProgressBar.tsx`

### 2. Check for leftover imports

```
grep -r "from.*ui/Button\|from.*ui/Input\|from.*ui/Select" --include="*.tsx" src/
```

Confirm all imports resolve to the new components.

### 3. Type check

```bash
npm run typecheck
```

Or:

```bash
npx tsc --noEmit
```

Fix any remaining type errors.

### 4. Lint

```bash
npm run lint
```

Fix any lint errors.

### 5. Verify dark mode

If the project has a dark mode toggle or `.dark` is being applied as part of this migration, enable it and confirm the Prototyper UI tokens apply correctly (backgrounds, borders, text). Otherwise, verify only that dormant `.dark` token overrides exist and do not break light mode.

### 6. Execute the test plan

Work through `plans/feature-prototyper-ui-migration/TESTPLAN.md`. If any checks are intentionally deferred, note them explicitly in the README before sign-off.

### 7. Update the plan README

Mark all acceptance criteria as completed.

### 8. Commit

Commit with a message summarizing the migration:

```
Migrate UI primitives to Prototyper UI

Replace 8 custom-built UI components (Button, Input, Select, Card,
Dialog, Tooltip, FieldLabel, States) with Prototyper UI components
built on @base-ui/react. Add OKLCH design token system to globals.css
with compatibility wrappers for high-usage existing component APIs.
```

## Acceptance Criteria

- [ ] No dead component files remain
- [ ] `npm run typecheck` passes with 0 errors
- [ ] `npm run lint` passes
- [ ] Relevant tests pass
- [ ] App renders correctly in light mode
- [ ] Dark mode is verified only if it is actually wired into the app during this migration
- [ ] Plan README acceptance criteria all checked
