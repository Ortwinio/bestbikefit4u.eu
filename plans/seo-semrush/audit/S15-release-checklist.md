# S15 SEO release checklist

Current integration status: the lead authorized B's correction of the two unsupported
`exact: true` role-query options in the S16 test; that correction is resolved.
The parent confirms all final technical gates pass on build `rejwcKGnhSNUclqs6ffwl`.
Automated visual verification is complete on the same build: 84 captures, all HTTP 200,
with zero runtime/console errors, failed assets, broken images, document overflow or axe violations
(including the landmark check). Manual review and hash comparisons are complete in
`audit/S15-visual-notes.md`; final candidate identity/hash is recorded in `audit/S15-candidate.json`.
The six S10 LCP follow-ups remain open; no production work is marked complete.

Prepared 3 October 2026 for `fix/seo-semrush`. This is a release procedure, not release approval or proof of deployment. This worker read S5–S14 notes and current redirect/discovery code and changed only this file. No gates, builds, production requests, infrastructure changes, commits or deployments were run by this worker.

All unchecked items require fresh evidence and an owner. Parent owns integration gates and release decisions; the capture worker owns the visual sweep; Ortwin/lead owns infrastructure and production actions.

## 1. Record the exact candidate and local gates — parent

- [x] Parent identifies the final validated candidate as build `rejwcKGnhSNUclqs6ffwl`. Gate evidence: `audit/S15-gates.md`, `audit/S15-semrush.json`, `audit/S15-discovery.json` and `crawl-s15.md`. The Semrush/discovery summaries now reference this final build and link their full reports. Keep these results tied to this build; do not combine them with later source changes.
- [x] Parent reports final `npm run typecheck`, full `npm run lint`, unit/contracts and standalone Convex TypeScript passing. Unit: 2,149 passed, 20 skipped. Contracts: 232 passed. Skipped cases are recorded as skipped, not passed.
- [x] Parent reports final production build and five Node harness tests passing, followed by local crawl: 875 checks, zero findings; Semrush checks: six pressure pages, 65 redirects, 96 guide locales and four author/methods pages; discovery: exact 170-URL parity and four alias checks, all green. Parent runs the local production-server scripts; these are not production-site checks.
- [x] Parent confirms final `npm run seo:validate-sitemaps` passed against the isolated TLS preview using `audit/S15-sitemap-validation.mjs`, with the validation log retained there. Optional lastmod is accepted; supplied dates are validated. This is local XML validation, not a production request.
- [x] Parent confirms the automated NL/EN 1440/390 sweep completed on final build `rejwcKGnhSNUclqs6ffwl`: 84 captures, 84 HTTP 200, zero runtime/console errors, failed assets, broken images, document overflow and axe violations, including landmarks.
- [x] Manual layout/image review is complete in `audit/S15-visual-notes.md`: 68 real baseline captures, 84 final captures, 83 final PNGs identical to the reviewed checkpoint. Parent inspected the sole changed image and native crops. Intentional content additions and baseline presentation issues are disclosed.
- [x] Parent reports `git diff --check` green and frozen dictionaries unchanged.
- [x] B worked only in the Semrush worktree for S15, did not edit frozen dictionaries and ran no production operations. The sole application-file correction was the lead-authorized removal of two unsupported test options on C's behalf.

Historical evidence, not a substitute for this candidate: S7 reports 68 Vitest + 3 validator tests and 880 crawl checks; S8/S9 reports 105 focused tests, 170 discovery URLs and 875 crawl checks. S5/S6/S11 had larger pre-consolidation inventories. Counts differ because URLs were intentionally retired. Do not add overlapping test totals or present earlier failed builds/skipped crawls as passes. S8/S9 completion supersedes the transient missing-generator warnings in S12/S13 notes.

The checked local results above are the parent's final post-correction handoff for build `rejwcKGnhSNUclqs6ffwl`, superseding the earlier `5ztwnMwqAl6O3-9ztGSal` snapshot. They were not rerun by the checklist worker; parent finalized this document after visual review. The S16 test-option finding is resolved; technical and visual checks are complete. Candidate hash: `22b20d069e2246208c41a88c0b76e3d74dd81411c1ffbe2fc564dd1cc05eeaf7` (algorithm in S15-candidate.json). All after-deploy checks below remain unchecked even where equivalent local assertions passed.

- [x] Lead-authorized B correction of the unsupported `exact: true` test options completed.
- [x] Parent confirms final post-correction gate metrics and successful build `rejwcKGnhSNUclqs6ffwl`.
- [x] Parent confirms final post-correction automated visual sweep.
- [x] Parent records final manual visual review and updated candidate hash.

## 2. Explicit performance decision — Ortwin/lead

S10 is a completed measurement task, not a passed LCP budget. Strict mobile median targets are LCP < 2500 ms, CLS < 0.1 and TBT < 200 ms. After-run values from `S10-after/summary.md`:

| Template | LCP ms | CLS | TBT ms | Open ticket |
| --- | ---: | ---: | ---: | --- |
| /en | 5468.359 | 0 | 48.5 | PERF-after-1 |
| /en/calculators/saddle-height | 5292.737 | 0 | 32 | PERF-after-2 |
| /en/guides/how-to-compare-two-bikes-for-fit | 5486.032 | 0 | 50 | PERF-after-3 |
| /en/pain/knee-pain-cycling | 5042.009 | 0 | 41 | PERF-after-4 |
| /en/pricing | 5470.238 | 0 | 41 | PERF-after-5 |
| /en/login | 5518.779 | 0 | 28 | PERF-after-6 |

All six LCP budgets fail; CLS/TBT pass in these samples. Measurements are three simulated-mobile runs per template on local production builds with offline CMS data. The after build includes S11 content, so the comparison does not establish a causal optimization result. No field Core Web Vitals improvement is claimed.

- [ ] Either fix and rerun the failed budgets, or record explicit release acceptance of all six outstanding LCP exceptions with an owner and follow-up date for each ticket. A green general build must not silently waive Lighthouse failures.
- [ ] After deployment and real traffic, inspect Speed Insights template groups. Confirm query/hash/dynamic-slug stripping and absence of account or measurement values before interpreting field data.

## 3. Redirect matrix — verify after an authorized deployment

Base origin for every path below: `https://bestbikefit4u.eu`. On a GET or HEAD to a retired path, expect the exact status shown and a Location resolving to that origin plus the destination path. Its next response must be 200, with no intermediate redirect. Do not follow redirects in the first request when recording the status/Location.

### Pressure consolidation

For each weight `55, 60, 65, 70, 75, 80, 85, 90, 95, 100`, verify every row: 60 old localized weight URLs in total.

| Retired path (replace {weight}) | Status | Location path |
| --- | ---: | --- |
| /en/tire-pressure/{weight}kg-road-bike | 301 | /en/tire-pressure/road-bike |
| /en/tire-pressure/{weight}kg-gravel-bike | 301 | /en/tire-pressure/gravel-bike |
| /en/tire-pressure/{weight}kg-mountain-bike | 301 | /en/tire-pressure/mountain-bike |
| /nl/bandenspanning/{weight}kg-racefiets | 301 | /nl/bandenspanning/racefiets |
| /nl/bandenspanning/{weight}kg-gravelbike | 301 | /nl/bandenspanning/gravelbike |
| /nl/bandenspanning/{weight}kg-mountainbike | 301 | /nl/bandenspanning/mountainbike |

Also verify these legacy/cross-language examples:

| Request path | Status | Location path |
| --- | ---: | --- |
| /nl/bandenspanning/mtb | 301 | /nl/bandenspanning/mountainbike |
| /en/bandenspanning/mtb | 301 | /en/tire-pressure/mountain-bike |
| /en/bandenspanning/racefiets | 301 | /en/tire-pressure/road-bike |
| /nl/tire-pressure/road-bike | 301 | /nl/bandenspanning/racefiets |
| /en/bandenspanning/75kg-gravelbike | 301 | /en/tire-pressure/gravel-bike |
| /nl/tire-pressure/75kg-mountain-bike | 301 | /nl/bandenspanning/mountainbike |

The generic redirect accepts either known language slug under either pressure prefix, and uses an explicit locale prefix in preference to cookies. Unprefixed pressure paths resolve directly with 301 using `bf_locale`, then Accept-Language, then EN default. Verify with explicit cookie/Accept-Language fixtures, not an uncontrolled browser session. Unknown bike slugs must remain 404 rather than redirect to an unrelated page.

### Bike-fitting ownership and calculator aliases

| Request path | Status | Location path |
| --- | ---: | --- |
| /nl/fiets-afstellen | 301 | /nl/bikefitting |
| /en/fiets-afstellen | 301 | /en/bike-fitting |
| /nl/bike-fitting | 301 | /nl/bikefitting |
| /en/bikefitting | 301 | /en/bike-fitting |
| /fiets-afstellen with bf_locale=nl | 301 | /nl/bikefitting |
| /fiets-afstellen with bf_locale=en | 301 | /en/bike-fitting |
| /en/bandenspanning-calculator | 308 | /en/tire-pressure-calculator |
| /nl/tire-pressure-calculator | 308 | /nl/bandenspanning-calculator |

The two calculator-language aliases use Next permanentRedirect (308), unlike the explicit 301 topic/pressure consolidation. Ordinary unprefixed locale negotiation is 307; do not classify that unrelated behavior as a failed S9/S13 permanent redirect.

- [ ] Record all 60 weight redirects, the alias rows, both unprefixed locale cases and destination statuses.
- [ ] Repeat representative redirects with `?src=release-check`: preserve that query in Location and still reach the same canonical page. Do not append measurement or personal values. Canonical tags and discovery URLs must exclude query strings.
- [ ] Check GET and HEAD behavior. Use exact slashless paths for the one-hop matrix; record any extra framework/domain normalization separately.
- [ ] Verify the retired paths are absent from site navigation, guide links, sitemap URL sets and both llms documents. Redirected URLs do not need a duplicate rendered canonical page.

Example manual commands, deliberately not executed here:

```sh
curl -sS -D - -o /dev/null 'https://bestbikefit4u.eu/en/tire-pressure/75kg-road-bike'
curl -sS -I 'https://bestbikefit4u.eu/nl/fiets-afstellen'
curl -sS -D - -o /dev/null -H 'Cookie: bf_locale=nl' 'https://bestbikefit4u.eu/fiets-afstellen'
curl -sS -D - -o /dev/null 'https://bestbikefit4u.eu/en/tire-pressure/road-bike'
```

## 4. Canonical destinations and visible content

- [ ] Verify six pressure destinations above return 200, with exactly one self-canonical in raw HTML head. Each has reciprocal EN/NL hreflang for its bike pair and English x-default. Every table exposes all ten weights and both tire systems: 20 engine rows, front/rear bar and PSI, assumptions and limits.
- [ ] Verify `/en/bike-fitting` and `/nl/bikefitting` return 200 with one self-canonical, reciprocal hreflang and EN x-default. Confirm at least five distinct internal source pages per locale link directly to the canonical page, not through `fiets-afstellen`.
- [ ] Verify `/en/tire-pressure-calculator` and `/nl/bandenspanning-calculator` are the calculator canonical pair; neither is confused with the six reference-table pages.
- [ ] S5: inspect NL/EN home and calculator JSON-LD. No unsupported aggregateRating or invented rider/fit counts; WebApplication and free Offer remain. Do not restore fabricated reviews to satisfy an optional rich-result field.
- [ ] S6: FAQ resolved titles remain 48 characters NL / 32 EN with brand once, canonical and FAQPage intact. Contact has at least 150 paragraph words per locale, FAQ/measurement links, mailto only and response estimates explicitly not guarantees.
- [ ] S11: all 11 calculators × 2 locales expose answer, method, limits, actual-engine worked example and mistakes in server HTML. Exactly one FAQPage per calculator matches visible questions/answers.
- [ ] S12: all 48 guides × 2 locales show Ortwin Verreck attribution and the actual source update date where known. Unknown CMS dates remain unavailable/omitted from dateModified. No reviewer claims, invented credentials or social profiles; sameAs stays empty until verified profiles are supplied.
- [ ] Verify `/{en,nl}/authors/ortwin-verreck` and `/{en,nl}/methods` return 200 with localized canonical/alternates. Author page stays minimal; methods distinguish scientific sources, practice references and own assumptions.

## 5. Sitemaps, llms and indexability

| Endpoint | Fresh GET | HEAD | Content-Type | Required content |
| --- | ---: | ---: | --- | --- |
| /sitemap.xml | 200 | 200, no body | text/xml; charset=utf-8 | All four section links below |
| /sitemap-pages.xml | 200 | 200, no body | text/xml; charset=utf-8 | Canonical public pages incl. author/methods |
| /sitemap-calculators.xml | 200 | 200, no body | text/xml; charset=utf-8 | 11 tools in both locales plus six canonical pressure pages |
| /sitemap-guides.xml | 200 | 200, no body | text/xml; charset=utf-8 | Local guides plus eligible published CMS guides |
| /sitemap-blog.xml | 200 | 200, no body | text/xml; charset=utf-8 | Published CMS posts, or valid empty urlset |
| /llms.txt | 200 | 200, no body | text/plain; charset=utf-8 | Same canonical URL set, localized link summaries |
| /llms-full.txt | 200 | 200, no body | text/plain; charset=utf-8 | Same URL set, source-grounded topic answers |
| /robots.txt | 200 | 200, no body | text/plain | Sitemap: https://bestbikefit4u.eu/sitemap.xml |

- [ ] Parse XML/Markdown and compare exact URL sets across section sitemaps and both llms documents, not just counts. Historical offline S8/S9 count is 170; live published CMS content can legitimately add URLs.
- [ ] Always retain the blog sitemap link, even when it is empty. Confirm 48 local guides remain covered if CMS reads time out/fail. Do not simulate a production outage; rely on parent unit/local fallback evidence.
- [ ] Validate every supplied lastmod/dateModified as a real source date. Unknown dates and unknown HTTP Last-Modified are absent; build/request time must not substitute for content dates.
- [ ] Sitemap responses retain ETag, nosniff and cache policies: 3600-second shared cache for index/pages/calculators/guides; blog 900 seconds; stale-while-revalidate 86400. A matching If-None-Match gives 304 with no body. CDN/framework may add Content-Length; the app must not manually emit an incorrect length.
- [ ] Both llms documents use 3600-second shared cache, stale-while-revalidate 86400 and nosniff. HEAD does not perform CMS work. CMS-only content gets an honest generic summary; no fabricated article answer or generated source date.
- [ ] Production public canonical pages and production sitemap responses must not inherit preview noindex headers. Preview hosts must remain non-indexable; verify response headers rather than assuming local proxy behavior proves hosting configuration.
- [ ] Login pages retain noindex,follow and query-free canonical, with no hreflang discovery of auth URLs. Authenticated account layout retains noindex,nofollow. Unauthenticated protected paths continue redirecting to login (temporary auth redirect is expected).
- [ ] `science/calculation-engine`, `use-cases`, login, account/admin/API paths and the retired setup page stay out of sitemaps/llms. Verify the intended noindex signal for served utility pages in actual HTML/headers: route-policy exclusion alone is not proof of an emitted robots directive. Log any gap for the parent; do not claim exclusion equals noindex.
- [ ] Robots disallow rules retain protected/system scope without blocking the canonical public replacements. Use an authorized test account only if the lead separately approves authenticated production inspection.

## 6. Attribution hold through 17 October 2026

- [ ] Preserve existing login CTA `?src=` attribution throughout the 3–17 October baseline, including calculator/guide sources. Do not strip, rename or “SEO-clean” these links in this release.
- [ ] Keep measurement values out of URLs, analytics and release evidence. Confirm source tags survive existing redirect behavior while canonical metadata remains query-free.
- [ ] Only revisit login attribution after the baseline closes and the lead authorizes the follow-up; this checklist does not authorize a change on 17 October itself.

## 7. Manual infrastructure and production work — NOT RUN

- [ ] Ortwin/lead approves the exact release candidate and records acceptance or remediation of S10 exceptions. Determine whether any backend changes require a separately authorized backend release; do not deploy Convex merely because a standalone typecheck is listed.
- [ ] Record prior production deployment ID and rollback owner before any authorized release. No production migration/data change is required or executed by this checklist worker.
- [ ] In Vercel Domains, change the www-to-bare redirect from the earlier observed 307 to a permanent 308 (301 is also acceptable if explicitly chosen). This is an infrastructure action, not claimed fixed by code. Verify `https://www.bestbikefit4u.eu/sitemap.xml` Location is exactly `https://bestbikefit4u.eu/sitemap.xml`, then 200; test a localized page and query preservation too.
- [ ] After the separately authorized deployment, run sections 3–6 against the production hostname and record status/Location/canonical evidence. Verify cache freshness before comparing discovery sets; do not mistake stale CDN output for current source.
- [ ] In the correct Search Console property, submit/resubmit `https://bestbikefit4u.eu/sitemap.xml`. Inspect representative new canonical pressure pages, bike-fitting pages, author/methods and retired aliases. Record actual indexing reports later; successful submission is not proof of indexing.
- [ ] Run the approved live full-site crawl (for example Screaming Frog within its available URL limit); record the discovered inventory and any limit reached. Local five-agent checks do not replace a live internal-link crawl.
- [ ] Validate representative structured data with the chosen live tester. Separate syntax/eligibility warnings from actual false claims; no ratings or review dates may be invented.
- [ ] Schedule or assign the S14 monthly 20-question observation procedure. The existing visibility log starts empty; enter only actual assistant observations with dates/cited URLs, never projected gains. No assistant searches were performed by this worker.
- [ ] If release-critical redirects, canonicals, indexing signals or discovery parity fail, record the failing response and have the release owner decide fix versus rollback. After rollback, verify the old deployment and discovery behavior again; infrastructure redirects/caches may require separate handling.

## Sign-off record

| Item | Owner | Evidence / decision | Status |
| --- | --- | --- | --- |
| S16 test-option correction | B / lead | Lead authorized correction of unsupported `exact: true` options | Resolved |
| Local S15 automated gates | Parent | 2,149 unit pass / 20 skip; 232 contracts; 5 Node tests; typecheck, lint, Convex tsc, build; 875 crawl checks / zero findings; Semrush: 6 pressure, 65 redirects, 96 guide locales, 4 author/methods; discovery: 170-URL parity, 4 aliases | Final technical checks complete |
| Candidate/build ID and artifact links | Parent | `rejwcKGnhSNUclqs6ffwl`; `audit/S15-gates.md`, `audit/S15-semrush.json`, `audit/S15-discovery.json`, `crawl-s15.md`; summaries link full reports | Final candidate recorded |
| Local sitemap XML validation | Parent | Final pass via `audit/S15-sitemap-validation.mjs`; isolated TLS preview and retained log | Final technical check complete |
| NL/EN desktop/mobile automated sweep | Capture worker / parent | Same-build 84 captures / 84 HTTP 200; zero runtime/console errors, failed assets, broken images, document overflow or axe violations, including landmarks | Automated checks complete |
| Manual visual review and hash comparison | Capture worker / parent | `audit/S15-visual-notes.md`; 83/84 identical hashes; remaining image and native crops inspected | Complete |
| Whitespace and frozen dictionaries | Parent | `git diff --check` green; frozen dictionaries unchanged | Confirmed |
| Final candidate hash | Parent | `audit/S15-candidate.json`; SHA-256 `22b20d069e2246208c41a88c0b76e3d74dd81411c1ffbe2fc564dd1cc05eeaf7` | Recorded |
| Six LCP exceptions | Ortwin/lead | PERF-after-1 through PERF-after-6 | Acceptance/remediation required |
| Release approval and rollback target | Ortwin/lead | Pending | Not authorized by this document |
| www permanent redirect | Ortwin/lead | Earlier observation 307; production recheck required | Manual step not run |
| Deployment and production smoke checks | Authorized release owner | Pending | Not run |
| Search Console/live crawl/live structured-data checks | Ortwin/lead | Pending | Not run |
| S14 visibility observations | Assigned owner | Empty initial log | No results claimed |

Evidence sources: `S5-notes.md` through `S16-notes.md`, `S15-gates.md`, `S15-visual-notes.md`, `S10-comparison.md`, `S10-after/summary.md`, current redirect/discovery and auth/account code. S15 integration is complete; this checklist does not authorize deployment or mark manual production work complete.
