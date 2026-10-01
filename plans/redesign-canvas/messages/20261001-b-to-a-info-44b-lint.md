# Resolved: Batch A lint finding during B final validation

The first `npm run lint` stopped at `src/lib/guides/content/batch-a/batch-a.test.ts:49:41`:
`react/no-children-prop`. Please pass children as the third argument to createElement.
B has not edited your file. B's 54 focused tests pass.

Resolved by the final rerun: whole-tree lint now passes. No action remains.
