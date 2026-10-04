# M1 category 12: docs, scripts and test expectations

- Changed current-origin expectations to `https://bikefitboost.com` in metadata, hreflang, sitemap, JSON-LD, llms, marketing, account, PDF and analytics tests. Updated escaped URL matchers as well as literal URLs.
- Updated SEO QA scripts and guide/marketing visual-harness origins; retained asset paths, persisted keys and brand-name text.
- Updated `.env.example` only (not an actual environment): apex `SITE_URL` and `NEXT_PUBLIC_SITE_URL`, sender subdomain and support authorization address. Existing sender display-name text is unchanged because this release forbids further name changes.
- Deployment docs now identify owner-approved cutover steps, Vercel alias-loop risk, mail verification prerequisites and host-only sign-in behavior. Brand asset documentation reflects the approved host and mail addresses.
- Removed the visual rebrand harness exception that concealed old-domain email addresses.
- Preserved intentional legacy URL inputs in CSP and CMS migration/presentation regressions. Historical guide import JSON remains unchanged; review assertions normalize its URL through `currentSiteUrl` before comparing to runtime output.
- `docs/GOOGLE_SIGNIN_ROLLOUT.md` is left to M2 coordination; auth proxy/Strava tests and contact/legal/address tests remain with their owners.

## Evidence

- Focused owned-suite run: **53 files, 479 tests passed**, including lifecycle contract tests. Log: `/tmp/M1-all-owned-tests.log`.
- Local QA asset server tests: **3 passed** (`node --test tests/visual/final-sweep/assets.test.mjs`).
- Final contract follow-up: **28 tests passed** in auth and guide mutations contracts (`/tmp/M1-auth-guide-contracts.log`). Updated current login/canonical URLs and canonical error text; retained explicit legacy canonical rejection fixtures. Auth sender fixtures were already removed/updated by their owner, so no sender changes were necessary.
- Earlier dedicated SEO/PDF run identified historical import fixture assertions; these are resolved in the final owned-suite run.
- No production requests, real environment changes, emails, commits, deployments or database operations performed. Full release gates remain with M1 integration owner.
