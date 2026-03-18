# 10 — Default V2 Cutover

## Objective

Make Engine v2 the default recommendation path only after shadow results, UX validation, and operational safeguards are acceptable.

## Preconditions

- shadow mode has passed agreed calibration gates
- migration/backfill path is complete enough for active users
- support and product stakeholders can inspect legacy snapshots
- rollback switch is tested

## In Scope

- flip default generation path to v2
- preserve legacy snapshot access
- monitor errors, recommendation generation health, and support tickets
- define a short rollback playbook

## Exit Criteria

- v2 is the default for new fits
- legacy snapshots remain available for comparison and support
- rollback path is documented and tested
- post-release monitoring is active
