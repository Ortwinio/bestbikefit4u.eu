# M4 supersedes Strava portions of M1/M2

Lead explicitly assigned B complete Strava removal. M4 changes `src/proxy.ts`,
`convex/crons.ts` and `convex/http.ts`, removes Strava actions/routes/UI and adds a
never-executed internal dry-run-first admin-authorized credential cleanup mutation.
Schema and existing data remain unchanged. Google OAuth behavior stays intact.

Please hold/repeat combined release gates after M4 source freeze. B uses disjoint
subagents, owns M4 focused tests and will provide exact files/readiness. No commits,
deployments, actual environment changes, production calls or cleanup execution.
The new M1 Strava origin test/action changes are intentionally superseded by removal;
other M1/M3 edits will be preserved. A retains combined build/crawl ownership.
