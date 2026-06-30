# Robots.txt Internal Blocked URLs Plan

## Goal

Reduce the "Internal Blocked by Robots.txt" SEO crawl issue without exposing private app, auth, admin, or API surfaces to search crawlers.

## Findings

The crawl report in `docs/issues_overview_report.csv` flags:

- `Response Codes: Internal Blocked by Robots.txt`
- priority `High`
- `86` URLs
- `35.250%` of crawled URLs

Production `https://bestbikefit4u.eu/robots.txt` matches the current repo implementation in `src/app/robots.ts`.

The disallow list is generated from:

- `src/app/robots.ts`
- `src/lib/seo/sitemap/config.ts`
- `src/lib/seo/routePolicy.ts`

The current route policy includes `private_app`, `auth`, and `api_or_system` families in `SEO_ROBOTS_DISALLOW_PATHS`.

That explains why internal resources are blocked:

1. Private dashboard and account routes are intentionally blocked:
   - `/dashboard`
   - `/fit`
   - `/bikes`
   - `/profile`
   - `/settings`
   - `/feedback`
   - localized variants such as `/en/dashboard` and `/nl/dashboard`
2. Auth routes are intentionally blocked:
   - `/login`
   - localized variants
3. API and system routes are blocked:
   - `/_next`
   - `/api`
   - `/trpc`
   - `/static`
4. Sitemap and robots endpoints are also blocked:
   - `/robots.txt`
   - `/sitemap.xml`
   - `/sitemap-pages.xml`
   - `/sitemap-calculators.xml`
   - `/sitemap-guides.xml`
   - `/sitemap-blog.xml`

The sitemap/robots endpoint blocks are the clearest improvement target. The site advertises `Sitemap: https://bestbikefit4u.eu/sitemap.xml` while also disallowing `/sitemap.xml`, which is contradictory for crawlers and can inflate SEO crawler warnings.

The private/auth blocks are not automatically wrong. They should remain blocked if those URLs are only app surfaces. The SEO issue becomes actionable when public indexable pages link to blocked URLs in crawlable HTML, especially login/dashboard CTAs.

## Scope

In scope:

- separate crawl-control policy for private routes from crawler utility endpoints
- remove sitemap and robots endpoints from robots `Disallow`
- remove auth entry pages from robots `Disallow` while keeping their `noindex, follow` metadata
- keep private app, auth, admin, and API routes out of sitemaps
- audit public pages for links to blocked private/auth URLs
- update validator expectations so tests encode the intended policy

Out of scope:

- making dashboard/account pages indexable
- changing auth flows
- changing sitemap URL inventory beyond crawl-policy consistency
- off-site SEO or Search Console work

## Proposed Policy

Robots.txt should:

- allow `/robots.txt`
- allow `/sitemap.xml` and child sitemap XML endpoints
- disallow private app routes
- allow auth entry pages to be crawled so their `noindex, follow` metadata can be seen
- disallow `/api`, `/trpc`, and private operational endpoints
- avoid disallowing `/_next` unless there is a clear reason; modern crawlers may fetch JS/CSS to render pages

Sitemaps should:

- include only canonical indexable public URLs
- never include private/auth/API/system URLs
- remain indexable on production
- remain `noindex, nofollow, noarchive` on non-production hosts via `X-Robots-Tag`

## Acceptance Criteria

- Production-like `robots.txt` no longer includes `Disallow: /sitemap.xml`, child sitemap paths, or `Disallow: /robots.txt`.
- Production-like `robots.txt` no longer includes `Disallow: /login`, `/en/login`, or `/nl/login`; auth pages remain `noindex, follow` through metadata.
- `robots.txt` still blocks private app, admin, API, and feedback route families as intentionally decided.
- The sitemap validator checks both:
  - disallowed private route prefixes are present
  - crawler utility endpoints are not disallowed
- `npm run seo:validate-sitemaps` passes against a local production-like server.
- Route-policy unit tests document the difference between `robots disallow` paths and `sitemap exclusion` paths.
- A public-page internal-link audit identifies or removes crawlable links from indexable pages to blocked login/dashboard/private URLs where those links are not necessary.

## Execution Steps

1. [01-audit-robots-policy.md](01-audit-robots-policy.md)
2. [02-update-policy-and-validator.md](02-update-policy-and-validator.md)
3. [03-internal-link-audit-and-release-check.md](03-internal-link-audit-and-release-check.md)

## Status

Complete.

- Step 01 output: [output-01-audit.md](output-01-audit.md)
- Step 02 output: [output-02-policy-and-validator.md](output-02-policy-and-validator.md)
- Step 03 output: [output-03-release-check.md](output-03-release-check.md)
