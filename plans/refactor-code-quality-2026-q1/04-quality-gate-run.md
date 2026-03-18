# Step 04 — Quality Gate Run

## Objective

Execute the full quality gate pipeline and confirm it passes end-to-end with no regressions.

## Commands to Run (in order)

```bash
npm run lint
npx tsc --noEmit
npm run build
npm test
```

If a `test:i18n` script exists, also run:
```bash
npm run test:i18n
```

## Success Criteria

All commands exit with code 0.

## If Gates Fail

For each failure:
1. Capture the full error output
2. Classify: P0 (build/type break), P1 (test failure), P2 (lint warning)
3. Do NOT fix in this step — document for Step 05

## Output

Document in `output-04-quality-gate-run.md`:
- Pass/fail status per gate with timestamp
- Full error output for any failures
- Summary table of P0/P1/P2 counts
