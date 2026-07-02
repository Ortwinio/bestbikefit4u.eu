# Prompt 04 — Public Pages

## Prerequisites

Prompts 01–03 must be complete. At least one published blog post must exist to verify the pages work.

## Context

Public pages live in `src/app/(public)/`. The closest reference is the guides public page:
- `src/app/(public)/guides/[slug]/page.tsx` — full guide article page (read this entire file)
- `src/app/(public)/guides/page.tsx` — guides index/hub page

Shared public layout components:
- `PublicPageShell`, `PublicSection`, `PublicHero`, `PublicBreadcrumbs`, `PublicCtaBand`, `PublicSurfaceCard` from `@/components/public`
- `JsonLd` from `@/components/seo/JsonLd`
- `RelatedLinksSection` from `@/components/seo/RelatedLinksSection`

SEO helpers:
- `buildArticleSchema`, `buildBreadcrumbListSchema` from `@/lib/seo/jsonLd`
- `buildLocaleAlternates` from `@/i18n/metadata`

i18n:
- `getRequestLocale()` from `@/i18n/request` — returns `"en"` or `"nl"`
- `withLocalePrefix(path, locale)` from `@/i18n/navigation`

Data fetching uses `next/cache` fetch patterns or Convex server-side queries. Follow the pattern in `src/app/(public)/guides/[slug]/page.tsx` — it uses a data module (`data.ts`) in the same directory.

---

## Files to create

### `src/app/(public)/blog/page.tsx` — Blog index

#### URL
`/blog` (EN) / `/nl/blog` (NL via i18n routing)

#### Metadata
```ts
export async function generateMetadata(): Promise<Metadata> {
  // Title: "Blog — BestBikeFit4U" (EN) / "Blog — BestBikeFit4U" (NL)
  // Description: brief summary of the blog purpose
  // Canonical: /blog
  // OG type: "website"
}
```

#### Page content
- `<PublicHero>` with heading "Blog" and a one-sentence sub-heading
- Optional category filter (render category chips, clicking one filters the listing)
- Grid of article cards — each card shows:
  - Featured image (next/image, aspect-ratio 16:9, lazy loading, descriptive alt)
  - Category label
  - Title (H2 within the card)
  - Excerpt (≤160 chars)
  - Published date (human-readable, e.g. "14 June 2025")
  - "Read article" link → `/blog/[slug]`
- Pagination: "Load more" button or numbered pages
- `<PublicCtaBand>` at the bottom

Data: call Convex `listPublishedPosts` via a server-side fetch. Posts sorted by `publishedAt` desc.

Breadcrumb JSON-LD: `Home → Blog`

---

### `src/app/(public)/blog/[slug]/page.tsx` — Article page

#### URL
`/blog/[slug]`

#### Metadata function
```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPublishedPostData(slug, locale);
  if (!post) return {};

  return {
    title: post.metaTitle[locale],
    description: post.metaDescription[locale],
    alternates: {
      canonical: post.canonicalUrl ?? `${BRAND.siteUrl}/blog/${slug}`,
      languages: buildLocaleAlternates(`/blog/${slug}`),
    },
    openGraph: {
      type: "article",
      title: post.ogTitle?.[locale] ?? post.metaTitle[locale],
      description: post.ogDescription?.[locale] ?? post.metaDescription[locale],
      url: `${BRAND.siteUrl}/blog/${slug}`,
      images: post.ogImageUrl ? [{ url: post.ogImageUrl, alt: post.ogImageAlt?.[locale] }] : [],
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      modifiedTime: new Date(post.updatedAt).toISOString(),
      authors: post.authorName ? [post.authorName] : undefined,
    },
    robots: post.robotsIndex ? undefined : { index: false, follow: false },
  };
}
```

#### `generateStaticParams`
```ts
export async function generateStaticParams() {
  const slugs = await fetchAllPublishedSlugs(); // server-side via api.blog.queries.listPublishedSlugs
  return slugs.map(({ slug }) => ({ slug }));
}
```

This ensures the pages are statically generated at build time and incrementally revalidated.

#### Page structure

```
<PublicPageShell>
  <JsonLd data={blogPostingSchema} />
  <JsonLd data={breadcrumbSchema} />

  <PublicBreadcrumbs
    items={[
      { label: "Home", href: "/" },
      { label: "Blog", href: "/blog" },
      { label: categoryLabel, href: `/blog?category=${post.category}` },
      { label: post.h1?.[locale] ?? post.title[locale] },
    ]}
  />

  <article>
    <header>
      <p class="category-label">{categoryLabel}</p>
      <h1>{post.h1?.[locale] ?? post.title[locale]}</h1>
      <p class="meta">
        {publishedDate} · {readingTimeMinutes} min read
        {post.authorName && <> · by {post.authorName}</>}
      </p>
    </header>

    {post.featuredImageUrl && (
      <Image
        src={post.featuredImageUrl}
        alt={post.featuredImageAlt?.[locale] ?? post.title[locale]}
        width={1200}
        height={630}
        priority
        className="..."
      />
    )}

    {/* Optional table of contents generated from H2/H3 in body */}
    {post.tableOfContents && <BlogTableOfContents body={post.body[locale]} />}

    {/* Rendered markdown body */}
    <BlogBodyMarkdown content={post.body[locale]} />

    {/* Internal links to related posts */}
    {relatedPosts.length > 0 && (
      <RelatedLinksSection
        heading="Related articles"
        links={relatedPosts.map(p => ({ label: p.title[locale], href: `/blog/${p.slug}`, description: p.excerpt?.[locale] }))}
      />
    )}

    {/* Internal links to related guides */}
    {post.relatedGuidePaths?.length > 0 && (
      <RelatedLinksSection
        heading="Related guides"
        links={relatedGuidePaths.map(path => ({ label: ..., href: path }))}
      />
    )}
  </article>

  <PublicCtaBand />
</PublicPageShell>
```

#### `BlogPosting` JSON-LD

Extend `buildArticleSchema` in `src/lib/seo/jsonLd.ts` (or create `buildBlogPostingSchema`) to produce:

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "...",
  "description": "...",
  "image": "...",
  "url": "https://bestbikefit4u.com/blog/slug",
  "datePublished": "2025-06-14T00:00:00Z",
  "dateModified": "2025-06-20T00:00:00Z",
  "author": {
    "@type": "Person",
    "name": "Ortwin Verreck"
  },
  "publisher": {
    "@id": "https://bestbikefit4u.com/#organization"
  },
  "mainEntityOfPage": "https://bestbikefit4u.com/blog/slug",
  "inLanguage": "en"
}
```

If `authorName` is blank, use the organization as author (`"@id": ".../#organization"`).

#### Breadcrumb JSON-LD

Use `buildBreadcrumbListSchema` with four items:
1. Home → `BRAND.siteUrl`
2. Blog → `${BRAND.siteUrl}/blog`
3. Category label → `${BRAND.siteUrl}/blog?category=${post.category}` (optional third level)
4. Article title (no href — leaf node)

#### Data module

Create `src/app/(public)/blog/[slug]/data.ts` (same pattern as `src/app/(public)/guides/[slug]/data.ts`):
- `getPublishedPostData(slug, locale)` — fetch post, return null if not found / not published
- Uses `fetchQuery` from `convex/nextjs` server helpers

#### 404 handling

If `getPublishedPostData` returns null, call `notFound()`.

#### Reading time

Calculate on the fly: `Math.ceil(wordCount / 200)` where `wordCount = body.split(/\s+/).length`.

---

### `src/components/content/BlogBodyMarkdown.tsx`

Client component that renders a markdown string using `react-markdown` (already in package.json).

```tsx
import ReactMarkdown from "react-markdown";

export function BlogBodyMarkdown({ content }: { content: string }) {
  return (
    <div className="prose prose-lg max-w-none ...">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
```

Apply Tailwind `prose` classes (already used elsewhere for guide body rendering — check `GuideBodyMarkdown.tsx` for the exact class names to reuse).

---

### `src/components/content/BlogTableOfContents.tsx`

Optional client component. Extract H2 headings from the markdown body using a simple regex, render as a sticky sidebar list or an in-page `<nav>` block. Only rendered when `post.tableOfContents === true`.

---

## Revalidation

Both pages should use `export const revalidate = 900` (15 min ISR) — same as the guides pages.

---

## Acceptance criteria

- `/blog` lists all published posts; unpublished posts do not appear
- `/blog/[slug]` returns 200 for a published post, 404 for a draft or missing slug
- HTML `<title>` matches `metaTitle` (confirmed via View Source)
- `<link rel="canonical">` is self-referencing (or matches `canonicalUrl` override)
- OG tags present and correct (verify with `og:title`, `og:description`, `og:image`, `og:type: article`)
- `BlogPosting` JSON-LD is valid (use Google Rich Results Test)
- Breadcrumb JSON-LD is present with all items
- Featured image renders via `next/image` with correct alt text
- `<h1>` is exactly one per page
- Page is mobile-friendly
- Related posts / guides sections appear when data is present
