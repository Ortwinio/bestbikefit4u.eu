# R13 backend demographics tests

Status: DONE R13-backend-tests. Worktree: `/Users/ortwinverreck/Developer/bestbikefit4u-rider`.

## Exact source ownership

- `shared/riderDemographics.test.ts` — new helper tests.
- `convex/profiles/demographics.contract.test.ts` — new mutation contract tests.
- `convex/profiles/prompts.contract.test.ts` — added demographic prompt integration cases and score/type imports; existing R7 cases remain intact.

Source-only inventory: `files-R13-backend-tests.txt` beside this note. Production helpers, mutations, schema, policy, and UI were not edited. No commit, deployment, or new dependencies.

## Coverage

Helper tests cover the exact sex choice list, actual calendar parsing (including leap/century rules), strict YYYY-MM-DD format, future dates, invalid clocks/types, UTC birthday boundaries, and inclusive calendar ages 10–100. Calculating age from an explicitly supplied birth date is tested separately from the age-range validation; no stored age or birth date is inferred.

Mutation tests invoke real `saveObservation` and `upsert` `_handler` functions with a copy-on-read fake database. Both fields are covered through both paths, including every valid sex choice, invalid enum/date/age-bound values, authentication, owner isolation, and declared/self_report/profile_edit provenance with the actual recorded date. Single-observation conflicts make zero write attempts; explicit fresh choices supersede only the owner's rider evidence, preserving other users' and bike-scoped evidence.

Regressions verify missing demographics remain absent, omitted values remain preserved, repeated unchanged upserts do not restamp evidence, demographic saves do not change profile scores or add defaults, and existing age/FTP/protocol/date/flexibility/core values remain intact. A deliberately different existing age remains unchanged when saving a birth date. Two final regressions verify that changes to sex or birth date refresh `riderProfileUpdatedAt`, while subsequent same-value or omitted-field saves preserve that timestamp even as the clock and general `updatedAt` advance.

Prompt integration uses the actual landed policy and handlers. It suppresses the fixture's other scored candidates through valid existing skip-history records to isolate demographic slots. Cases cover two zero-gain declared questions without defaults or legacy-age inference; explicit answers and provenance with unchanged scores; non-disclosure hiding FTP-only birth-date questions without replacing reservations; flexibility still allowing birth date after sex is declined; no demographic requests when FTP and flexibility are already supplied; invalid values and measured-method rejection; and concurrent demographic conflicts with zero writes.

## Verification

```sh
npm test -- shared/riderDemographics.test.ts convex/profiles/demographics.contract.test.ts convex/profiles/prompts.contract.test.ts shared/profilePromptPolicy.test.ts
npx eslint shared/riderDemographics.test.ts convex/profiles/demographics.contract.test.ts convex/profiles/prompts.contract.test.ts
npm run typecheck -- --incremental false
```

Final focused run: **196 tests pass across four files**: 42 helper tests, 41 demographic mutation tests, 69 prompt contract tests (54 existing R7 + 15 new demographic cases), and 44 planner tests owned by the policy sidecar. Targeted ESLint passes again after the timestamp regressions. Full repository typecheck previously passed with exit code 0 and no diagnostics; the parent also reports its latest combined backend snapshot, typecheck, and lint green.

`npm run lint` also passes in full (exit code 0): ESLint, runtime boundaries, tooltip coverage, 254 contrast checks, CSS-module tokens, and image-weight checks.

R13 backend-test sidecar is closed. The parent's reported UI selector failures remain with the UI owner and are not hidden by this backend result. Exact three-file source manifest is unchanged. Holding for the R11 assignment; no R11 work started.
