# Step 03 — UI Migration Validation

## Objective

Verify the Prototyper UI migration is complete and consistent — no half-migrated components, no broken consumer APIs, no visual regressions in component structure.

## Tasks

1. **Completeness check** — For each component listed in the `feature-prototyper-ui-migration` plan's component mapping, verify:
   - The old custom implementation has been fully replaced
   - The new component is re-exported from `index.ts` with the same name
   - Consumer files still import from `@/components/ui` (not directly from Prototyper source)

2. **API compatibility** — For each migrated component, check that:
   - Required props are the same (no consumer-breaking changes)
   - Variant/size enums match what consumers pass
   - `className` prop is forwarded correctly

3. **CSS token check** — Verify `globals.css` includes all OKLCH tokens required by Prototyper UI and that no existing custom tokens were accidentally removed

4. **Dark mode check** — If dark mode is implemented via `ThemeToggle.tsx`, verify Prototyper UI components respect the theme class

5. **Snapshot / visual diff** — Run tests that include DOM assertions to catch structural changes in migrated components

## Output

Document findings in `output-03-ui-migration-validation.md`:
- Component-by-component migration status table (Complete / Partial / Missing)
- Any API-breaking changes found and affected consumers
- CSS token gaps
- Pass/fail on dark mode behavior
