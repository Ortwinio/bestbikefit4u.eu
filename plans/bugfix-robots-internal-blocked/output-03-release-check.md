# Output 03 — Release Check

## Changed Policy

`robots.txt` now disallows private app, admin, API, static, and TRPC route families, but no longer disallows:

- `/login`
- `/en/login`
- `/nl/login`
- `/_next`
- `/robots.txt`
- `/sitemap.xml`
- `/sitemap-pages.xml`
- `/sitemap-calculators.xml`
- `/sitemap-guides.xml`
- `/sitemap-blog.xml`

Auth pages remain excluded from sitemaps and are protected from indexing by `src/app/(auth)/layout.tsx`, which emits `robots: { index: false, follow: true }`.

## Final Local Robots Output

Validated against `http://127.0.0.1:3006/robots.txt`:

```txt
User-Agent: *
Allow: /
Disallow: /admin
Disallow: /en/admin
Disallow: /nl/admin
Disallow: /app
Disallow: /en/app
Disallow: /nl/app
Disallow: /bikes
Disallow: /en/bikes
Disallow: /nl/bikes
Disallow: /dashboard
Disallow: /en/dashboard
Disallow: /nl/dashboard
Disallow: /feedback
Disallow: /en/feedback
Disallow: /nl/feedback
Disallow: /fit
Disallow: /en/fit
Disallow: /nl/fit
Disallow: /fit-history
Disallow: /en/fit-history
Disallow: /nl/fit-history
Disallow: /gearing
Disallow: /en/gearing
Disallow: /nl/gearing
Disallow: /pressure-calculator
Disallow: /en/pressure-calculator
Disallow: /nl/pressure-calculator
Disallow: /profile
Disallow: /en/profile
Disallow: /nl/profile
Disallow: /saddle-selector
Disallow: /en/saddle-selector
Disallow: /nl/saddle-selector
Disallow: /settings
Disallow: /en/settings
Disallow: /nl/settings
Disallow: /shoe-cleat-fit
Disallow: /en/shoe-cleat-fit
Disallow: /nl/shoe-cleat-fit
Disallow: /api
Disallow: /static
Disallow: /trpc

Host: bestbikefit4u.eu
Sitemap: https://bestbikefit4u.eu/sitemap.xml
```

## Validation

- `npx vitest run src/lib/seo/routePolicy.test.ts src/lib/seo/sitemap/xml.test.ts src/lib/seo/sitemap/sources.test.ts 'src/app/(auth)/login/page.test.tsx'` passed.
- `BASE_URL=http://127.0.0.1:3006 npm run seo:validate-sitemaps` passed.

## Remaining Expected Blocked URLs

Private app URLs can still appear in authenticated navigation components and dashboard-only UI. Public crawls may still discover some dashboard links from shared header/mobile menu states, but those route families remain intentionally private and excluded from sitemaps.
