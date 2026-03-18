# Step 02 — Test Coverage Check

## Objective

Identify which new features and changed modules lack meaningful test coverage.

## Tasks

1. Run `npm test -- --coverage 2>&1` (or equivalent vitest coverage command) and capture results

2. Review test files for new features:
   - Tire pressure module — does a test exist for the calculation logic?
   - Dashboard upgrade — are new flows tested?
   - GTM consent gate — is there a test that GTM only loads after consent?

3. Check `primitives.test.tsx` — does it cover all migrated Prototyper UI components?

4. Check `Tooltip.test.tsx` — does it test accessible behavior (keyboard, aria attributes)?

5. Identify any component in `src/components/ui/` with no corresponding test

## Acceptance Criteria

- Coverage report captured and saved
- Each new feature has at least one test covering the critical path
- All UI primitive components have at least a smoke-test (renders without crashing)
- Gaps are documented with priority

## Output

Document findings in `output-02-test-coverage-check.md`:
- Coverage summary (lines/branches/functions if available)
- List of untested modules with suggested test type (unit/integration)
- Priority: P0 (business logic untested), P1 (component renders untested), P2 (edge cases)
