# 10 — Cleanup, Validation, and Sign-Off

## Goal

Remove migration-only glue, validate the completed migration, and record any unrelated repo-level blockers that remain.

## Steps

### 1. Remove dead code and temporary glue

Check that no legacy implementation remains where copied Prototyper source should now be the base layer.

Files that should now be copied Prototyper source or thin adapters over it:

- `src/components/ui/Button.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Select.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/AccessibleDialog.tsx`
- `src/components/ui/Tooltip.tsx`
- `src/components/ui/FieldLabel.tsx`
- `src/components/ui/Progress.tsx`
- `src/components/ui/States.tsx`
- `src/components/questionnaire/ProgressBar.tsx`

### 2. Check for leftover imports

```bash
grep -r "from.*ui/Button\|from.*ui/Input\|from.*ui/Select\|from.*ui/AccessibleDialog" --include="*.tsx" src/
```

Confirm imports resolve to the migrated components and that no consumer still depends on deleted implementation details.

### 3. Type check

```bash
npm run typecheck
```

Fix migration-related type errors.

### 4. Build

```bash
npm run build
```

Fix migration-related build errors.

### 5. Run targeted validation

Run the migration-focused checks that are expected to be actionable for this work:

- targeted UI tests
- component tests in `src/components/ui/` if present
- the checklist in `plans/feature-prototyper-ui-migration/TESTPLAN.md`

### 6. Record unrelated blockers explicitly

If `npm run lint` or `npm test` still fail for unrelated existing issues, record that in the README or handoff notes rather than expanding scope silently.

### 7. Verify dark mode only if applicable

If the project has a dark mode toggle or `.dark` is being applied as part of this migration, enable it and confirm Prototyper UI tokens apply correctly. Otherwise, only verify that dormant `.dark` token overrides do not break light mode.

### 8. Update the plan README

Mark all acceptance criteria as completed and note any deferred manual checks.

### 9. Commit

Commit with a message summarizing the migration:

```text
Install real Prototyper UI source and rebuild local primitives around it
```

## Acceptance Criteria

- [ ] No dead component files remain
- [ ] `npm run typecheck` passes with 0 migration-related errors
- [ ] `npm run build` passes
- [ ] Relevant tests pass
- [ ] App renders correctly in light mode
- [ ] Dark mode is verified only if it is actually wired during this migration
- [ ] `TESTPLAN.md` is executed or deferred explicitly
- [ ] Unrelated repo-level failures are documented
- [ ] Plan README acceptance criteria all checked
