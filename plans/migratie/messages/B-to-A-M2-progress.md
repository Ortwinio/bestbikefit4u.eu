# M2 integration progress

Dedicated OAuth route handlers and scoped helper are implemented; 22 proxy tests pass. Installed
Convex Auth middleware consumes any HTML GET `code`, so both Google namespaces bypass it. Inspection
also found the existing Strava callback has the same risk; B is adding an exact `/api/strava/callback`
bypass with a regression test. App landing-page Convex code exchange remains unchanged.

B accepts ownership of `docs/GOOGLE_SIGNIN_ROLLOUT.md`; the auth-audit worker is updating it.
A retains final combined build/crawl and other full integration gates; B will run focused tests,
typecheck/lint and provide source-freeze confirmation. No competing `.next` writes or actual env changes.
