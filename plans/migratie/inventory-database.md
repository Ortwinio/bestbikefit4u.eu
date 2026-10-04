# Inventory: old domain in the production Convex database

**Date**: 2026-10-04
**Scope**: production Convex deployment, read-only (`convex data --prod <table> --limit 8000 --format jsonl`)
**Search pattern**: case-insensitive `bestbikefit4u` (this covers `bestbikefit4u.eu`, `www.`, every subdomain, `@bestbikefit4u.eu` and bucket/storage names)
**Target**: `https://www.bikefitboost.com`

## Method

- I dumped all 72 production tables, including the auth tables and the `pricing*` tables that exist in prod but not in the migratie `schema.ts`. That is 19,469 documents. Every table was under the 8000 row limit, so every dump is complete. All lines parsed as JSON.
- I walked every string field recursively and classified each match.
- Dump files have been deleted. This document contains no personal data, only IDs and counts.

## Headline

- **Absolute URLs with the old domain: 128 occurrences in 128 documents across 4 tables.** Every host is the bare `bestbikefit4u.eu`. None use `www.`, and there are no subdomains such as `notifications.`, no storage or bucket names, and no `http://` URLs.
- **Inline absolute links in guide or blog bodies: 0.** Links in bodies are relative, for example `](/en/about)`.
- **Canonical URL fields holding the old domain: 0.**
- **`@bestbikefit4u.eu` email addresses: 2 documents** (1 user + 1 auth account). **Do not rewrite.**
- **The brand name `BestBikeFit4U` with no domain** appears in a lot of SEO and copy text (about 690 occurrences). This is a rebrand question, not a URL migration question. It is listed separately below.
- `bikefitboost` does not appear anywhere in the DB yet.

## Per table: old domain (URL / email)

| Table | Total docs | Docs with domain | Field(s) | Kind | Count | Example IDs |
|---|---|---|---|---|---|---|
| `guidePages` | 49 | 48 | `ogImageUrl` | image URL `https://bestbikefit4u.eu/og/illustrations/guides/<slug>.jpg` | 48 | s17fdagehwtgj16tyyd6cefmph8fh3sz, s17evmr9m4rgpn71bm21cxcypd8fgxg6, s174thh3b3d6zrgnhs1zyseet58fh04k, s170th9zg43hjbc04qv1jxm9c58fhmb6, s17enkxbzczafcrmbaeh1gd7xs8fhhgx |
| `guideRevisions` | 78 | 48 | `snapshot.ogImageUrl` | image URL (same pattern) | 48 | s577z03hbgfedyzbm1acdjcj0d8fgbdv, s579fxjwkxj7x02m5tnmew736s8fghgg, s5711adjr7g9w1fkwe25r7n7d18fhwd5, s57e6mfb7zvy0x6qmfbq300qm18fg0ca, s57e7d4v5ypm1v0hmbnhdjdmzs8fhj76 |
| `guideAuditLog` | 48 | 30 | `fieldChanges[].newValue` / `oldValue` | image URL (same pattern) | 30 | rx71g37kpz0be8yqjf01ydkz018fhgzk, rx738y45m6eemrredtgr7269s18fhma6, rx77pwz3myvfk76x2hzsc7t5pd8fgfck, rx73xybkspxrah7sn90pzg6q4n8fgsre, rx73h62a8n8wsn0nbq1hdxw38x8fhee3 |
| `feedback_items` | 2 | 2 | `pageUrl` | page URL (`https://bestbikefit4u.eu/en`, `.../nl/fit/<id>/results`) | 2 | pd737rs9mr9e8cnaveyftgf5nx83ha97, pd7evwcppa9rt6h4r95nx4chj583gas1 |
| `users` | 98 | 1 | `email` | email `@bestbikefit4u.eu` | 1 | ks77dyk5s52fj5n54xhzzkd3ax81eee7 |
| `authAccounts` | 101 | 1 | `providerAccountId` | email `@bestbikefit4u.eu` (login identifier) | 1 | j578ebbkm67q3dzq4mh7djpzys81e61f |

The only `guidePages` document without the old og URL is `s176y4mdghgjfn9egphvvm0z19863gm5`, which has an empty `ogImageUrl` (the overview page).

## Per table: brand name `BestBikeFit4U` (text, no domain)

| Table | Docs | Fields | Notes |
|---|---|---|---|
| `guidePages` | 49 | `metaTitle.en/nl` (49), `ogTitle.en/nl` (48), `libraryBody.en/nl` (2), `metaDescription.en/nl` (1), `body.*.items[]` (1) | Every metaTitle and ogTitle ends in the suffix `\| BestBikeFit4U`. Prose mentions are in s17adyf00h0a65vgn0casvgy2s862gph and s176y4mdghgjfn9egphvvm0z19863gm5 |
| `guideRevisions` | 78 | `snapshot.metaTitle`, `snapshot.ogTitle`, `snapshot.libraryBody`, `snapshot.pageBrief`, `snapshot.body` | Historical snapshots, including markdown links `[BestBikeFit4U](/en/about)` |
| `guideAuditLog` | 30 | `fieldChanges[].oldValue/newValue` | Historical diffs |
| `dashboard_messages` | 1 | `body` | Signed "Team BestBikeFit4U" (nx7evaq4ka741qwqz713hjmxhd84vp2k) |
| `admin_audit_logs` | 1 | `payload` | Audit record of that same message (nh70m4tahd9jypdp55d6c5k3yh84tw6c) |

## Tables with 0 matches (checked)

These are the content and email-related tables: `blogPosts` (1), `blogRevisions` (2), `redirects` (0), `lifecycleEmailLog` (143), `emailReports` (0), `newsletterConsentEvents` (1), `releases` (1), `release_items` (0), `integrations` (2), `organizations` (0), `caseStudyLeads` (0), `plans` (0), `questionDefinitions` (0), `profilePrompts` / `profilePromptCards`, `marketingEvents` (1961), `bikePhotos`, `bikeImports`, `recommendations`, `fitSessions`, and the other auth tables (`authSessions`, `authRefreshTokens`, `authVerificationCodes`, `authVerifiers`, `authRateLimits`). All the remaining tables also had 0 matches.

## Recommendation for the migration script

**Rewrite:**
1. `guidePages.ogImageUrl`: replace `https://bestbikefit4u.eu/` with `https://www.bikefitboost.com/` (48 docs). First check that `/og/illustrations/guides/*.jpg` is served on the new domain. A relative path is another option.
2. Optionally, `guideRevisions.snapshot.ogImageUrl` (48 docs), so that restoring a revision does not bring back the old URL. This is historical data, so it is a choice.

**Do NOT rewrite:**
- `users.email` and `authAccounts.providerAccountId` with `@bestbikefit4u.eu`. This is a real mailbox and login identifier. If it changes, the account can no longer log in. If needed, migrate it separately and deliberately.
- `guideAuditLog` and `admin_audit_logs`: audit trails must stay historically accurate.
- `feedback_items.pageUrl`: records where the feedback was given (historical context). Harmless to keep.
- `lifecycleEmailLog`: no matches, and it should stay unchanged anyway.

**Separate decision (rebrand, not domain):**
- The `| BestBikeFit4U` suffix in `metaTitle` and `ogTitle` (49 guides × 2 languages) and the prose mentions in 2 guides. This belongs to the rebrand pass, together with the app copy. It is not covered by a URL rewrite.
- `dashboard_messages` nx7evaq4ka741qwqz713hjmxhd84vp2k ("Team BestBikeFit4U"): leave it or update it manually, since it was a message that has already been sent.
