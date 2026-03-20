# Step 05 — Migration And Rollout

## Goal

Backfill existing data and roll out the ownership change without breaking session creation or report rendering in production.

## Production Data Reality

There are likely three classes of data:

1. Bikes with only `bikeType`
2. Sessions with `bikeType`, `ridingStyle`, `primaryGoal`, but bikes missing the latter two
3. Sessions and bikes that may already disagree

## Recommended Migration Sequence

### Phase 1 — Schema + app support

- ship bike schema additions
- ship bike create/edit support
- ship transitional session creation logic

### Phase 2 — Backfill bikes

Write a one-time script/mutation to backfill bike-level values from the latest relevant fit session for that bike:

- `ridingStyle`
- `primaryGoal`

Rules:

- prefer the most recent completed/relevant session per bike
- log bikes where conflicting session history exists
- do not overwrite explicit newer bike-level values once set

### Phase 3 — UI cutover

- simplify fit-start UX
- remove repeated attribute prompts for bike-linked sessions

### Phase 4 — Cleanup

Only after production has been stable:

- decide whether to rename session fields to explicit snapshot names
- remove transitional client args from session creation

## Testing Matrix

- create bike with all three values
- edit bike values and verify they persist
- start fit for a bike and confirm session snapshot is correct
- verify old sessions still render in results and PDF
- verify recommendation generation still uses the correct category/goal
- verify migrated bikes appear correctly in UI

## Acceptance Criteria

- [ ] There is a documented backfill strategy for existing bikes
- [ ] Migration does not rewrite historical session meaning
- [ ] UI cutover happens only after bike data is available
- [ ] Cleanup of transitional fields is explicitly deferred until safe
