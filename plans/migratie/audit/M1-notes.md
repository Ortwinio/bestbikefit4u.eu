# M1 — canonical origin and legacy redirects

## Lead-requested final integrated rerun — 4 October, 10:46–10:53 UTC

After M2, M3 and M4 all reported DONE, A reran **every requested gate once** on the final integrated `migratie/bikefitboost` tree. These are fresh results, not reused earlier passes. M4's Strava removal is included. No source fixes were needed during this rerun.

| Gate | Fresh result |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS; brand/domain guard zero findings |
| `npm run test:unit` | PASS: 3,079 tests / 385 files; 20 existing skipped tests / one skipped file |
| `npm run test:contracts` | PASS: 556 tests / 50 files |
| `npx tsc --noEmit -p convex/tsconfig.json` | PASS |
| `npm run build` | PASS; build ID `ieZXsXV0bpOBFH0xpRfSl` |
| `node scripts/seo-crawl-check.mjs --local --skip-build --label=m1-release-integrated` | PASS: 170 sitemap URLs, 875 page/UA checks, 1,239 GET requests, zero findings |
| `node scripts/render-email-previews.mjs plans/migratie/renders/release-mails` | PASS: 26 bilingual HTML/text previews and 52 screenshots; all 52 layout/asset checks pass |
| `node scripts/domain-migration-check.mjs https://bikefitboost.com https://bestbikefit4u.eu --local --skip-build --label=m1-release-integrated` | PASS: 684 exact single-301 redirects / 228 paths, 170 HTML pages, all 48 guide JPEGs, zero findings |

Build and both local runtime checks use `NEXT_PUBLIC_SITE_URL=https://bikefitboost.com`; Convex endpoints are overridden to loopback port 9 for these commands only. `--skip-build` reuses the single fresh production build rather than starting redundant builds. Both local servers and the preview browser exited successfully. Email rendering blocks remote requests and sends no mail. No commits, deployments, production data operations or actual environment configuration changes occurred.

Fresh evidence:
- Logs: `/tmp/M1-release-{typecheck,lint,unit,contracts,convex-tsc,build,crawl,emails,domain}.log`.
- SEO: `plans/seo-crawl-fixes/audit/crawl-m1-release-integrated.md` and sibling JSON, completed 10:53:20 UTC.
- Migration: `plans/migratie/audit/domain-migration-m1-release-integrated.md` and sibling JSON.
- Preview checks: `plans/migratie/renders/release-mails/checks.json` (screenshots remain ignored).

Local CMS uses repository fallback data; live-only CMS/blog coverage and real provider/Vercel/DNS behavior remain deployment acceptance steps. OAuth destinations were intentionally not called; their legacy-domain 301 was verified. All following sections retain earlier implementation and verification history.

## Implementation

- Canonical origin is `https://bikefitboost.com`. The new www host is a valid alias normalized by URL generation, not a code redirect. HTTPS preview origins and explicit loopback development origins remain supported.
- `resolveSiteOrigin()` is the shared runtime resolver. It rejects legacy hosts (including subdomains), malformed/non-HTTP URLs, credentials and non-loopback plaintext HTTP overrides. Module evaluation safely falls back to the apex when Convex denies environment access; a VM regression exercises that behavior.
- Strava, Stripe checkout/portal, lifecycle email action links and email preferences use the resolver. Incoming request hosts no longer choose Stripe return destinations. Signed one-click unsubscribe still uses the separately validated Convex HTTP endpoint.
- Local backend dev auth explicitly resolves its private `SITE_URL`, never the public override. Three regression cases prevent a stale public localhost setting from enabling backend dev auth when private configuration is missing or public. Existing production/deployment checks stay intact.
- Next has one 301 rule covering the old apex, www and arbitrary subdomains. The wildcard path and query are preserved. No www-to-apex rule was added, avoiding a loop with the current Vercel domain configuration.
- Canonicals, alternate links, sitemap, robots, JSON-LD, llms and social images now use the apex. Historical CMS image URLs and the new www alias normalize on presentation without editing archived imports or production data.
- Current docs, harnesses and regression expectations are updated. `.env.example` is a template only; actual environment configuration was not changed. Existing names, asset filenames and persisted browser keys are unchanged.
- The domain guard now scans tests as well as runtime code and scripts. It has explicit legacy constants, redirect/migration regression and DB-history exceptions, not a general URL/email or test-file exemption.

## Review and initial verification

- Independent read-only review of origin/config/writers identified the private/public auth environment precedence issue; fixed before the full passing rerun.
- Frozen-source full unit gate: 391 files pass, 3,124 tests pass, 20 intentionally skipped (one skipped file).
- Full contracts: 531 tests / 47 files pass. Frontend typecheck, complete lint and standalone Convex TypeScript checks pass. Initial stale email/guide/current-auth test fixtures and M2's NextRequest test type mismatch are resolved.
- Backend writer focused suite: 61 tests; email layout/template suite: 36 tests; category-12 suite: 479 tests plus 3 Node harness tests; auth/guide contracts: 28 tests. Root origin/config/SEO suite: 45 tests before three additional alias cases; included in the full rerun.
- Final shared build, crawler, M3 checker and latest complete gate totals are recorded below following the other owners' source freeze.

Full gate logs: `/tmp/M1-unit.log`, `/tmp/M1-contracts.log`, `/tmp/M1-typecheck.log`, `/tmp/M1-lint.log`, `/tmp/M1-convex-tsc.log`. Non-failing test output includes the existing Vite config notice, missing TypeScript source-map warning and jsdom navigation notices.

## Combined runtime evidence

- Initial frozen M1/M2/M3 production build passes (`/tmp/M1-build.log`), built with canonical apex and offline loopback Convex endpoints. Real environment files remain unchanged.
- Initial local SEO crawl passes: 170 sitemap URLs, 875 page/user-agent checks, 1,239 sequential GET requests, zero findings. Evidence: `plans/seo-crawl-fixes/audit/crawl-m1-domain-apex.md` and sibling JSON. Five raw-HTML user agents cover Googlebot, Screaming Frog, GPTBot, ClaudeBot and Chrome; CMS coverage uses repository fallback rather than production data.
- C's first local migration check passes all 684 legacy redirects over 228 distinct paths (apex, www, arbitrary subdomain; exact path/query; pages, assets, sitemap, robots and old OAuth routes), including serving all 48 guide JPEGs. Four legal-page OG URL findings remain in that first report; C subsequently corrected NL/EN privacy and terms metadata and froze the fix for the next build.
- Lead's newly added README M4 assigns B Strava removal, superseding M1's Strava writer/test work. Shared gates were repeated after M4 source freeze, including C's narrow legal metadata fix. Earlier counts describe only the initial snapshot; final counts follow below.
- M4 now removes `convex/integrations/actions.ts` and its newly added origin test. Those two superseded files are omitted from final `files-M1.txt`; the writer worker's earlier scope/evidence remains historical. The remaining 89 source/test/doc/harness paths are M1's final manifest, excluding other owners' deletions and render artifacts.

## Final M1–M4 release snapshot

After B's M4 source freeze and C's legal metadata fix, all shared gates were rerun:

| Gate | Final result |
| --- | --- |
| `npm run test:unit` | PASS: 3,079 tests / 385 files; 20 tests and one file intentionally skipped |
| `npm run test:contracts` | PASS: 556 tests / 50 files |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS, including 254 contrast checks, 27 CSS modules with zero raw colors, image checks and zero brand/domain findings |
| `npx tsc --noEmit -p convex/tsconfig.json` | PASS |
| `npm run build` | PASS, apex canonical plus offline Convex endpoints |
| `scripts/seo-crawl-check.mjs --local --skip-build --label=m1-final-apex` | PASS: 170 sitemap URLs, 875 page/UA checks, 1,239 GET requests, zero findings |
| M3 local migration checker, final build `-9rVbWuZgW5CDu7Uy3-cW` | PASS: 684 exact single-301 redirects / 228 paths; 170 HTML pages; 48 JPEGs; zero findings |
| M1 manifest + scoped diff check | PASS: all 89 source/test/doc/harness paths exist; no whitespace errors |

Final gate logs use `/tmp/M1-final-{unit,contracts,typecheck,lint,convex-tsc,build,crawl}.log`. The rebuild regenerates the removed Strava route's stale Next types; no source workaround was necessary. Final crawl evidence: `plans/seo-crawl-fixes/audit/crawl-m1-final-apex.md` and sibling JSON (2026-10-04, 10:40–10:45 UTC). Both loopback runtime checks finished successfully and their servers stopped.

C's final checker evidence is `plans/migratie/audit/domain-migration-local.md` and sibling JSON. It verifies self-canonical/OG/hreflang URLs, robots, sitemaps and no mixed resources, including the legal OG correction. OAuth destinations are intentionally not invoked: only their first exact domain 301 is asserted. It uses loopback servers, not real DNS/Vercel/provider services. C also reports 26 bilingual local email previews / 52 screenshots with current apex links and sender/contact addresses, no deliveries (`M3-mail-notes.md`).

## Deployment boundaries and owner actions

- No commits, deployments, production data operations, environment changes or mail deliveries were performed. All work is in the migration worktree; Git operations use its explicit `-C` path.
- Owner must flip Vercel's current apex-to-www setting before rollout: www becomes an alias redirecting to the apex, and both old domains must stop their extra-hop configuration. Local code tests cannot establish deployed Vercel/DNS behavior.
- Configure both applicable site environment variables to the apex. Installed Convex Auth reads its own `SITE_URL`; repository URL consumers are normalized, but dependency-owned auth validation still requires the owner's correct deployment environment. See M2's exact Google/Convex/Strava acceptance checklist.
- `scripts/check-vercel-env.mjs` validates configuration presence and URL syntax, not application destination generation; it retains its generic required-variable validation. The health route reads only Convex endpoint presence, not site origins.
- Mail-domain verification, Workspace support/security mailboxes, provider Console updates and any production migration remain owner-controlled. M3's migration is dry-run-first and has not been executed against production.
- Remaining old brand-name mentions listed in README category 13 are deliberately not changed in this domain-only release.

Manifest: `files-M1.txt`. Supporting detail: `M1-writers.md`, `M1-docs-tests.md`, `M1-guard.md`.
