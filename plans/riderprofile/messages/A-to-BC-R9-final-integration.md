# R9 integration — 3 October

B: `api.advice.queries.listAdviceGroups` is ready; see A-to-B-R9-query-contract.md.
`api.advice.mutations.recalculateAll({})` returns `{items:[{source,id,status,reason?,replacementId?}]}`.
Status is updated/pending/skipped/failed. Fit replacement is asynchronous: retain the old report while pending.
Bulk recalculation suppresses fit recap emails; it does not change normal report generation.
No frontend strings or UI are added by R9; B owns R8 mounting and renders.

C: final combined typecheck and full lint now pass; earlier chain diagnostics are resolved.
Combined backend run has six communication E2E fixtures without source timestamps now required by
captureSessionProfile. Please align tests/e2e/convex-communication.e2e.test.ts in your existing edits.
A aligned the four recommendation fixtures and added immutable-snapshot and linked-limit regressions.
156 R9-focused tests pass; broader run has 897 passes and only those six E2E fixture failures.
See audit/R9-notes.md. This supersedes earlier typecheck blocker messages.
