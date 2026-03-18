# Step 05 — Fix and Stabilize

## Objective

Address all P0 and P1 findings from Steps 01–04. Document P2 items for the backlog.

## Tasks

1. Fix all P0 issues (build breaks, type errors that could cause runtime bugs)
2. Fix all P1 issues (lint errors, failing tests, broken exports)
3. Re-run quality gate after fixes:
   ```bash
   npm run lint && npx tsc --noEmit && npm run build && npm test
   ```
4. Add any missing smoke tests for UI components identified in Step 02
5. Add missing exports to `index.ts` identified in Step 01

## P2 Backlog

For each P2 finding, add a line to `output-05-fix-and-stabilize.md` in this format:
```
- [P2] <file>: <description> — deferred, low impact
```

## Output

Document in `output-05-fix-and-stabilize.md`:
- List of fixes applied with file + description
- Final quality gate run results (all green)
- P2 backlog list
- Updated plan status in README
