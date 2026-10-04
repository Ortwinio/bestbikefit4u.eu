# M4 credential cleanup — owner-only, never executed by the agent

The integration is removed from the application. `convex/schema.ts` is unchanged and all existing
bikes, activities, observations and profile data remain. This runbook concerns only the optional,
separately approved removal of obsolete `integrations` connection records and their secrets.

## Guardrails

`migrations/retireStrava:clearConnections` is an **internal mutation**, not a public API. It additionally
requires an authenticated identity whose current users record has `super_admin` role, even for dry-run.
It defaults to `dryRun: true`, returns aggregate counts/cursors only, and requires the exact confirmation
`CLEAR_STRAVA_CONNECTIONS` for writes. Page size defaults to25 and is bounded1–100, with100-row/1MB read
caps. It never returns/logs tokens, names, user IDs or individual connection records.

The installed CLI supports `--identity` under deployment admin credentials. The lead must use an
existing verified super-admin user ID, never an arbitrary account, and must protect the deployment
credentials. This is a privileged operational identity assertion, not a browser authentication flow.
No new user/admin role is created. Ordinary/public and unauthenticated calls fail.

## Approved operator sequence (instructions only)

1. Obtain the owner's separate explicit go. Verify the removal deployment and no remaining scheduled
   integration jobs; inspect/cancel previously queued import jobs through the owner's approved operational
   process if present. Removed function references must not be mistaken for successful job completion.
2. Take a secured database backup through the established export process (`npx convex export --prod`),
   under the owner's authorization. Treat exports as sensitive because they contain credentials/PII;
   store encrypted with restricted access, never commit them or include tokens in notes.
3. Run every dry-run page, starting with `cursor:null`, summing `scanned`, `eligible`, `withTokens` and
   `withState` until `isDone:true`. Pass each returned `continueCursor` unchanged. Review aggregate totals.

   ```sh
   npx convex run --prod --identity '{"subject":"<VERIFIED_SUPER_ADMIN_USER_ID>"}' \
     migrations/retireStrava:clearConnections '{"cursor":null,"dryRun":true,"numItems":25}'
   ```

4. Only after reviewing the complete dry-run, obtain confirmation for that deletion scope. Restart from
   `cursor:null` with the same page size and explicit write confirmation; repeat returned cursors until done.

   ```sh
   npx convex run --prod --identity '{"subject":"<VERIFIED_SUPER_ADMIN_USER_ID>"}' \
     migrations/retireStrava:clearConnections \
     '{"cursor":null,"dryRun":false,"numItems":25,"confirmation":"CLEAR_STRAVA_CONNECTIONS"}'
   ```

5. Rerun a full dry-run from null and verify zero eligible connections. Record counts/date/approver,
   never secrets. The mutation is retry-safe: already deleted rows are absent. The confirmation is a
   deliberate safety latch, not a persisted proof that the operator actually reviewed every dry-run page.
6. Owner deletes the Strava API application afterwards, as requested, and separately removes obsolete
   actual STRAVA_CLIENT_ID/STRAVA_CLIENT_SECRET deployment variables. Local token deletion does **not**
   itself revoke tokens at the provider. No provider revocation request is made by this code.

## Data effects and recovery

Only matching `integrations` records are deleted, including their OAuth tokens/state and cached connection
metadata. No bike, activity, profile, observation, user/auth account, feedback, message or audit document is
changed. Historical activity `integrationId` values remain as legacy references after their connection
record is removed; the retired runtime never dereferences them. Imported bikes remain ordinary editable
bikes. Account deletion still cleans up a user's legacy integration records if cleanup has not yet run.

There is no automatic rollback. The owner must assess any restoration from the secured backup separately;
restoring old credentials or the provider app is not a safe default. Keeping the schema allows existing
legacy documents to validate during rollout and does not authorize rewriting those documents.
