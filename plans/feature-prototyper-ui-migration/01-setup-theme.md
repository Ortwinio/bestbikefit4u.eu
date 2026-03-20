# 01 — Baseline, Dependencies, and Theme Readiness

## Goal

Confirm the repo is ready for a strict Prototyper migration. After this step, dependencies and theme tokens are verified, current gaps are documented, and the app still builds from the current baseline.

## Background

This repo already appears to have partial Prototyper/Base UI setup. Do not assume the theme step is net-new work. First verify what is already present in `package.json`, `src/app/globals.css`, and `src/app/layout.tsx`, then only add what is still missing.

## Steps

### 1. Audit current baseline

Check:

- `package.json` for `@base-ui/react`, `class-variance-authority`, and `lucide-react`
- `src/app/globals.css` for token blocks and utilities
- `src/app/layout.tsx` for font variables
- `plans/feature-prototyper-ui-migration/MIGRATION-GAPS.md` to confirm the migration is still incomplete

Record what is already done versus what is still needed.

### 2. Install or adjust dependencies only if needed

If any required dependency is missing, add it. Do not churn dependency versions without a reason.

### 3. Update `src/app/globals.css` only if needed

If tokens or utilities are incomplete, bring them up to the Prototyper requirement. If they are already present, leave the file alone except for missing pieces.

Expected end state:

1. Keep `@import "tailwindcss"` at the top
2. Add the complete `@theme { ... }` block with Prototyper tokens if missing
3. Add `:root { ... }` light-mode token values if missing
4. Add `.dark { ... }` token overrides only as dormant support unless this migration wires a real theme switch
5. Add Prototyper utility classes that migrated components depend on
6. Preserve existing app-specific global rules such as `.skip-link`

### 4. Keep font changes minimal

If token variables reference fonts the app does not load, map token variables conservatively. Do not widen this prompt into a typography redesign.

### 5. Verify

Run the dev server and confirm:

- app still renders without errors
- `npm run typecheck` passes or any current baseline failures are documented
- the expected CSS variables exist
- current UI files are still the custom/Base UI versions described in `MIGRATION-GAPS.md`

## Acceptance Criteria

- [ ] Baseline dependency and theme audit completed
- [ ] Missing dependencies added only if needed
- [ ] `globals.css` contains the required Prototyper token/theme setup
- [ ] App renders without errors in dev mode
- [ ] `--background` and `--primary` CSS variables are present
- [ ] No unnecessary font-loading change was introduced
