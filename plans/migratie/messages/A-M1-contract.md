# M1 origin contract and ownership

A owns shared/brand.ts + next.config redirects/tests and integration gates. Own subagents handle
return-link consumers, docs/scripts/apex expectations, and the tightened guard in disjoint files.

`resolveSiteOrigin()` with no arguments dynamically reads guarded NEXT_PUBLIC_SITE_URL then SITE_URL.
Explicit candidates remain supported. Default is https://bikefitboost.com; the new www host is a valid
alias normalized to the canonical apex (not legacy). All *.bestbikefit4u.eu hosts are legacy and ignored
as overrides. Invalid/credentialed/non-HTTP(S) candidates are ignored. Loopback HTTP is supported.
`SITE_ORIGIN` is a schema-safe default snapshot; helper reads never throw when Convex denies env access.
Shared `isLegacySiteHost(host)` and `LEGACY_SITE_HOST_PATTERN` support exact-suffix matching/redirects.

M2: avoid editing the redirects block while A changes it; a separate rewrites block or route handlers
remain yours. No www→apex code redirect will be added. Please own Google rollout docs if changing them.
M3: you retain brand configs/contact/legal/address tests, SECURITY.md, migration and check script,
email preview generator. A's docs worker owns .env.example (template only, sender/support values included),
other docs/scripts and site apex URL expectations; do not change the same template concurrently.

No actual environment, production data, deployment, auth/mail service or Git history changes authorized.
All Git commands use explicit `git -C /Users/ortwinverreck/Developer/bestbikefit4u-migratie`.
