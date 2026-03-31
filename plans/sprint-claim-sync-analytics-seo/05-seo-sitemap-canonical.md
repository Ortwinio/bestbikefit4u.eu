# T05 — Sitemap, canonical, and hreflang audit

**Ticket:** T05
**Effort:** 1 developer-day
**Blocks:** T08 (pain pages must be in sitemap at launch)

---

## Context

The sitemap infrastructure exists: five XML sitemap files, a sitemap index, `buildLocaleAlternates()` for hreflang, and `robots.ts` for crawl directives. This ticket is an audit-first task. Walk every public route, check what is declared, fix what is wrong, and add the pain page route cluster before T08 publishes.

---

## Files involved

```
src/app/robots.ts
src/app/sitemap.xml/route.ts          (index)
src/app/sitemap-pages.xml/route.ts
src/app/sitemap-calculators.xml/route.ts
src/app/sitemap-guides.xml/route.ts
src/app/sitemap-blog.xml/route.ts
src/i18n/metadata.ts                  (buildLocaleAlternates)
```

---

## Audit checklist — run before making changes

For each route below, verify the following in the page source:

1. `<link rel="canonical" href="...">` — does it match the canonical URL?
2. `<link rel="alternate" hreflang="en" href="...">` — present and correct?
3. `<link rel="alternate" hreflang="nl" href="...">` — present if NL version exists?
4. `<link rel="alternate" hreflang="x-default" href="...">` — points to EN version?
5. The page URL appears in at least one sitemap XML file

### Routes to audit

**Public pages (should be in `sitemap-pages.xml`)**
- `/`
- `/pricing`
- `/about`
- `/contact`
- `/faq`
- `/measurement-guide`
- `/why-bikefit-matters`
- `/science/stack-and-reach/`
- `/science/bike-fit-methods/`
- `/science/calculation-engine/`

**Calculators (should be in `sitemap-calculators.xml`)**
- `/calculators/bike-fit`
- `/calculators/saddle-height`
- `/calculators/frame-size`
- `/bandenspanning-calculator`

**Guides (should be in `sitemap-guides.xml`)**
- `/guides/bike-fitting-for-knee-pain`
- `/guides/bike-fitting-for-lower-back-pain`
- `/guides/road-bike-fit-guide`
- `/guides/gravel-bike-fit-guide`

**Use-cases (must be added to a sitemap)**
- `/use-cases/`
- `/use-cases/endurance-cycling-fit`
- `/use-cases/back-pain-cycling`
- (all 10 slugs from `use-cases/data.ts`)

---

## Required fixes

### Fix 1 — Add use-cases to sitemap

`sitemap-pages.xml` or a new `sitemap-use-cases.xml` must include all use-case slugs.

Pattern (based on existing guide sitemap):

```ts
// In sitemap-pages.xml/route.ts or a new file
import { USE_CASES } from "@/app/(public)/use-cases/data";

const useCaseUrls = USE_CASES.flatMap((useCase) =>
  (["en", "nl"] as const).map((locale) => ({
    url: new URL(withLocalePrefix(`/use-cases/${useCase.slug}`, locale), BRAND.siteUrl).toString(),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))
);
```

### Fix 2 — Add pain pages route to sitemap

Before T08 deploys the first pain pages, the sitemap generator must be able to enumerate pain page slugs from `src/app/(public)/pain/data.ts`.

Create `src/app/sitemap-pain.xml/route.ts`:

```ts
import { PAIN_PAGES } from "@/app/(public)/pain/data";
import { BRAND } from "@/config/brand";
import { withLocalePrefix } from "@/i18n/navigation";

export async function GET() {
  const urls = PAIN_PAGES.flatMap((page) =>
    (["en", "nl"] as const).map((locale) => ({
      url: new URL(withLocalePrefix(`/pain/${page.slug}`, locale), BRAND.siteUrl).toString(),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified.toISOString()}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
```

Add the new sitemap to the index in `sitemap.xml/route.ts`.

### Fix 3 — Verify `buildLocaleAlternates()` is called on every localized public page

Grep for pages missing `buildLocaleAlternates`:

```bash
grep -rL "buildLocaleAlternates" src/app/\(public\)/**/page.tsx
```

For every file returned that has an NL counterpart, add the call to `generateMetadata`.

### Fix 4 — Robots.txt — verify dashboard and API are disallowed

Open `/robots.txt` in a browser. Confirm it contains:

```
Disallow: /dashboard
Disallow: /api
Disallow: /_next
```

The exact disallow paths come from `ROBOTS_DISALLOW_PATHS` constant in `robots.ts`. Verify the constant includes all internal-only routes.

### Fix 5 — OG tags audit

For the homepage, pricing page, and all calculator pages, verify `og:url` is set to the canonical URL (not a relative path). Check the `generateMetadata` or static `metadata` export.

---

## Priority/changeFrequency guide

| Page type | Priority | changeFrequency |
|-----------|----------|----------------|
| Homepage | 1.0 | weekly |
| Calculators | 0.9 | monthly |
| Pain pages | 0.7 | monthly |
| Use-cases | 0.6 | monthly |
| Guides | 0.6 | monthly |
| Pricing | 0.5 | monthly |
| Legal, FAQ | 0.3 | yearly |

---

## Acceptance criteria

- [ ] All routes in the audit list above return a canonical tag matching the served URL
- [ ] All routes with NL counterparts declare hreflang for `en`, `nl`, and `x-default`
- [ ] All 10 use-case slugs appear in a sitemap
- [ ] `sitemap-pain.xml` exists and is registered in the sitemap index
- [ ] `sitemap-pain.xml` returns 0 entries when `PAIN_PAGES` is empty (before T08), and correct entries after T08
- [ ] `/robots.txt` disallows `/dashboard`, `/api`, `/_next`
- [ ] `/robots.txt` includes a `Sitemap:` directive pointing to the sitemap index
- [ ] Google Search Console submission shows zero errors within 48 hours of deploy

## Edge cases

- If the pain page data file does not exist yet when this ticket ships, `sitemap-pain.xml` should return a valid empty XML document (not a 500 error)
- NL versions of pain pages may not exist in sprint 1. The sitemap should only include NL entries for routes that actually resolve. If the NL pain page returns a 404, remove it from the sitemap until content is ready.

## Human audit checklist

- [ ] Open `/sitemap.xml` — confirm all sub-sitemaps are listed
- [ ] Open `/sitemap-calculators.xml` — confirm all four calculators are present in both EN and NL
- [ ] Open `/sitemap-pain.xml` after T08 — confirm all five pain page slugs are present
- [ ] Submit updated sitemap to Google Search Console
- [ ] View source on `/calculators/bike-fit` — confirm canonical and hreflang tags
