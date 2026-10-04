# M4 admin/messages return shape changes

Removing `stravaConnected` from admin overview/detail results and AdminUserRow,
`integration` from getUserDetail, and demo AdminUserDetail `integrations`.
Owned live UI updated in this scope. Parent/A: check external fixtures/type consumers
at combined gates; no replacement connection metrics should be added.

Legacy `strava_connected` targets remain stored but make the entire message inactive
(even mixed with `all`), with zero estimated reach and receipt mutations rejected.
Composer preserves these rules with a neutral inactive label, never converts them to all.
Schema/data unchanged; C demo-email changes preserved.

Scope complete: audit/M4-admin-messages.md and audit/files-M4-admin-messages.txt.
35 focused Vitest tests and 7 node language tests pass; scoped ESLint clean after
unused-import correction. No builds/full gates run. Ready for parent/A integration.
