# Step 01 — Gap Map And Data Contracts

## Goal

Replace ambiguity with an executable acceptance map before further implementation.

## Tasks

1. Create an explicit matrix of every admin route under `src/app/(admin)/admin/**`.
2. For each route, record:
   - current data source
   - current write flows
   - current auth boundary
   - current empty/loading/error/destructive state support
   - acceptance criteria it is supposed to satisfy
3. Mark each route as one of:
   - `live`
   - `partially_live`
   - `fixture_driven`
   - `shell_only`
4. Document the current fixture sources and the intended Convex query/mutation/action that will replace each one.
5. Record any route-level contract gaps between current UI props and current Convex return shapes.

## Required Output

- `plans/refactor-admin-panel-acceptance-remediation/output-01-gap-map.md`

## Done When

- There is no admin route without a named source of truth and replacement contract.
- The remaining steps can be executed slice-by-slice without guessing which routes are still mocked.
