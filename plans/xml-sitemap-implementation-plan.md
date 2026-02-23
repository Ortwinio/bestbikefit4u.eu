# XML Sitemap Implementation Plan

Project: `bestbikefit4u.eu`  
Stack: `Next.js App Router` on `Vercel`  
Locales: `en`, `nl`

## 1. Goal and Constraints

1. Build an SEO-correct XML sitemap system for multilingual public pages.
2. Include only canonical, indexable, public URLs.
3. Exclude all private/authenticated/noindex routes.
4. Support `hreflang` alternates between `en` and `nl`.
5. Scale via sitemap index + content-type child sitemaps.
6. Keep implementation deterministic, cacheable, and CI-validated.

## 2. Sitemap Scope and Inclusion Rules

### 2.1 Include

1. Localized public marketing pages:
   - `/en`, `/nl`
   - `/en/pricing`, `/nl/pricing`
   - `/en/about`, `/nl/about`
   - `/en/contact`, `/nl/contact`
   - `/en/terms`, `/nl/terms`
   - `/en/privacy`, `/nl/privacy`
2. Localized public SEO pages:
   - Calculators (`/en/calculators/...`, `/nl/calculators/...`)
   - Guides/content pages (e.g. `/en/why-bikefit-matters`, `/nl/why-bikefit-matters`)
   - FAQ (`/en/faq`, `/nl/faq`)
   - Blog posts (`/en/blog/...`, `/nl/blog/...`) if enabled.

### 2.2 Exclude

1. Authenticated pages:
   - `/dashboard`, `/en/dashboard`, `/nl/dashboard`
   - Fit session flows/results and account pages.
2. System/non-SEO routes:
   - `/api/*`, framework internals, error pages.
3. Non-canonical variants:
   - Query parameter URLs (`?utm=...`, filters, sort params).
   - Hash URLs.
   - Redirecting URLs.
   - Uppercase or mixed-case duplicates.
4. Any route with `noindex` metadata or blocked by robots policy.

### 2.3 Canonicalization Rules

1. HTTPS only (`https://bestbikefit4u.eu`).
2. Lowercase paths only.
3. No query params and no fragments in sitemap URLs.
4. One trailing-slash policy:
   - Recommended: no trailing slash except locale roots (`/en`, `/nl`).
5. Sitemap URLs must resolve directly to `200` canonical responses (not `3xx`).

## 3. Sitemap Structure

Use a sitemap index from day one for growth.

### 3.1 Endpoints

1. `/sitemap.xml` (sitemap index)
2. `/sitemap-pages.xml` (core static/marketing pages)
3. `/sitemap-calculators.xml` (calculator pages)
4. `/sitemap-guides.xml` (guides/content pages, incl. FAQ if preferred)
5. `/sitemap-blog.xml` (blog posts)

### 3.2 Growth Strategy

1. If any child sitemap approaches limits, shard by sequence:
   - `/sitemap-blog-1.xml`, `/sitemap-blog-2.xml`, ...
2. Hard limits per sitemap:
   - `< 50,000` URLs
   - `< 50MB` uncompressed

## 4. Multilingual `hreflang` Strategy

### 4.1 XML Example

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://bestbikefit4u.eu/en/pricing</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://bestbikefit4u.eu/en/pricing"/>
    <xhtml:link rel="alternate" hreflang="nl" href="https://bestbikefit4u.eu/nl/pricing"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://bestbikefit4u.eu/en/pricing"/>
    <lastmod>2026-02-23</lastmod>
  </url>
  <url>
    <loc>https://bestbikefit4u.eu/nl/pricing</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://bestbikefit4u.eu/en/pricing"/>
    <xhtml:link rel="alternate" hreflang="nl" href="https://bestbikefit4u.eu/nl/pricing"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://bestbikefit4u.eu/en/pricing"/>
    <lastmod>2026-02-23</lastmod>
  </url>
</urlset>
```

### 4.2 Rules

1. Emit alternates only for URLs that exist and are indexable.
2. If translation is missing:
   - Include only existing canonical URL.
   - Do not output non-existent alternate.
3. Keep hreflang reciprocal for translated pairs.
4. Keep hreflang target URLs canonical (no redirects).

## 5. Metadata Strategy (`lastmod`, `changefreq`, `priority`)

### 5.1 `lastmod` (Required)

1. Must reflect real content update timestamps.
2. Source-of-truth priority:
   - CMS/DB `updatedAt` for blog/guides.
   - Static registry `updatedAt` for fixed pages/calculators.
   - Fallback only if needed: git file change timestamp.
3. Format as ISO date or datetime in UTC.

### 5.2 `changefreq` and `priority` (Optional)

1. Optional since Google gives limited weight.
2. If used, apply consistently:
   - Home: `weekly`, `1.0`
   - Pricing/About/Contact/FAQ: `weekly` or `monthly`, `0.7-0.9`
   - Calculators: `weekly`, `0.8`
   - Guides: `monthly`, `0.7`
   - Blog: `monthly`, `0.6` (or `weekly` for actively updated posts)
   - Legal pages: `yearly`, `0.2-0.3`

## 6. Implementation Architecture (Next.js App Router)

### 6.1 File Layout

1. `src/app/sitemap.xml/route.ts` (index)
2. `src/app/sitemap-pages.xml/route.ts`
3. `src/app/sitemap-calculators.xml/route.ts`
4. `src/app/sitemap-guides.xml/route.ts`
5. `src/app/sitemap-blog.xml/route.ts`
6. `src/lib/seo/sitemap/types.ts`
7. `src/lib/seo/sitemap/config.ts`
8. `src/lib/seo/sitemap/sources.ts`
9. `src/lib/seo/sitemap/filters.ts`
10. `src/lib/seo/sitemap/normalize.ts`
11. `src/lib/seo/sitemap/xml.ts`
12. `scripts/seo/validate-sitemaps.ts`

### 6.2 Data Sources

1. Static route registry (marketing/legal/faq).
2. Calculator registry (code-based list or DB table).
3. CMS/DB queries for guides/blog (published only).
4. Locale mapping table to pair EN/NL equivalents.

### 6.3 Route Handler Pattern (Pseudo-code)

```ts
export async function GET() {
  const raw = await getEntriesForGroup("pages");
  const filtered = raw.filter(isPublicIndexable).map(toCanonical).filter(noRedirectDuplicate);
  const xml = renderUrlSet(filtered, { hreflang: true });
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
```

### 6.4 Validation Guards in Code

1. Reject URLs not matching allowed public route patterns.
2. Reject URLs marked `noindex`.
3. Reject URLs blocked by robots rules.
4. Reject non-HTTPS canonical mismatches.
5. Deduplicate by normalized canonical path.

## 7. Caching and Performance on Vercel

1. Serve sitemap XML through route handlers with CDN caching.
2. Default cache headers:
   - `s-maxage=3600`
   - `stale-while-revalidate=86400`
3. For frequently updated blog sitemap:
   - `s-maxage=900` recommended.
4. Keep output deterministic (stable sort by URL path) for diffability and cache hit consistency.
5. Optional: trigger revalidation/webhook on CMS publish/update events.

## 8. `robots.txt` Integration

### 8.1 Required Entry

```txt
Sitemap: https://bestbikefit4u.eu/sitemap.xml
```

### 8.2 Consistency Rules

1. Do not include in sitemap any URL blocked by robots.
2. Ensure private routes are both:
   - excluded from sitemap, and
   - disallowed or protected as needed.
3. Keep robots and sitemap policies synchronized in one config source if possible.

## 9. QA and Testing Checklist

1. XML validity:
   - Valid sitemap schema.
   - Correct namespaces (`sitemap`, `xhtml`).
2. Endpoint correctness:
   - Each sitemap endpoint returns `200`.
   - `Content-Type` is `application/xml`.
   - No redirects for sitemap files.
3. URL quality:
   - Every `<loc>` resolves to canonical `200`.
   - No query params, no uppercase duplicates.
4. Hreflang quality:
   - EN/NL alternates reciprocal and canonical.
   - Missing translations handled safely (no broken alternates).
5. Exclusion quality:
   - No private/auth/noindex URLs included.
6. Size limits:
   - URL count and file size under limits.
7. CI automation:
   - Script validates XML, status codes, duplicate URLs, and hreflang reciprocity.

## 10. Delivery Plan (Step-by-Step)

1. Build shared sitemap types/config/normalization utilities.
2. Implement static route registries and content source fetchers.
3. Implement index sitemap route (`/sitemap.xml`).
4. Implement each child sitemap route.
5. Add hreflang alternate generation in XML serializer.
6. Add filtering to enforce public/indexable/canonical constraints.
7. Update robots.txt with sitemap pointer and aligned rules.
8. Add validation script + npm script (e.g. `npm run seo:validate-sitemaps`).
9. Run local validation and production URL smoke checks.
10. Submit sitemap index to Google Search Console and Bing Webmaster Tools.

## 11. Acceptance Criteria

1. `/sitemap.xml` exists and is a valid sitemap index.
2. Child sitemaps return valid XML and include only allowed canonical public URLs.
3. EN/NL hreflang alternates are present and correct for translated pages.
4. Pages without translation do not emit invalid alternates.
5. Private/authenticated/noindex pages are absent from all sitemap files.
6. `lastmod` values reflect real content updates.
7. `robots.txt` includes sitemap reference and has no policy conflicts.
8. CI validation passes and deployment on Vercel serves sitemap endpoints correctly.

## 12. Definition of Done

1. All sitemap routes implemented, tested, and deployed.
2. XML and hreflang validation checks pass.
3. Google Search Console accepts sitemap index without critical errors.
4. Monitoring/review process in place for sitemap growth and broken URL detection.
