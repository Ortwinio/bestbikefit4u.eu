/* @vitest-environment jsdom */

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchQuery } from "convex/nextjs";
import BlogIndexPage, { generateMetadata as indexMetadata, revalidate as indexRevalidate } from "./page";
import BlogArticlePage, { generateMetadata as articleMetadata, generateStaticParams, revalidate as articleRevalidate } from "./[slug]/page";
import { formatBlogDate, getBlogCategoryLabel, type BlogPost } from "./data";
import { blogMessages } from "@/i18n/marketing/blog";

vi.mock("server-only", () => ({}));
vi.mock("@convex-dev/auth/nextjs/server", () => ({ convexAuthNextjsToken: vi.fn() }));
vi.mock("convex/nextjs", () => ({ fetchQuery: vi.fn() }));
vi.mock("../../../../convex/_generated/api", () => ({ api: { blog: { queries: {
  listPublishedPosts: "list", getPublishedPost: "post", listPublishedSlugs: "slugs",
} } } }));
vi.mock("@/i18n/request", () => ({ getRequestLocale: async () => locale }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NEXT_NOT_FOUND"); } }));
vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: ({ schema }: { schema: unknown }) => <script type="application/ld+json">{JSON.stringify(schema)}</script>,
}));

let locale: "nl" | "en" = "nl";
let posts: BlogPost[] = [];
let post: BlogPost | null;

function fixture(index = 0): BlogPost {
  return {
    slug: `cms-post-${index}`, status: "published", category: index < 10 ? "bike-fit" : "comfort",
    title: { nl: `CMS titel ${index}`, en: `CMS title ${index}` },
    h1: { nl: `CMS kop ${index}`, en: `CMS heading ${index}` },
    excerpt: { nl: "Gepubliceerde samenvatting.", en: "Published excerpt." },
    body: { nl: "## Positie\n\nGepubliceerde tekst.\n\n### Controle\n\n- Controleer je fiets\n\n## Positie\n\n[Tekstlink](/nl/guides/saddle-height)", en: "## Position\n\nPublished body.\n\n### Check\n\n- Check your bike\n\n## Position\n\n[Body link](/en/guides/saddle-height)" },
    featuredImageUrl: "/illustrations/01-racefiets.webp", featuredImageAlt: { nl: "CMS fiets", en: "CMS bike" },
    publishedAt: Date.UTC(2026, 8, 15), updatedAt: Date.UTC(2026, 8, 20), authorName: "CMS Author",
    metaTitle: { nl: "CMS SEO titel", en: "CMS SEO title" }, metaDescription: { nl: "CMS SEO beschrijving", en: "CMS SEO description" },
    canonicalUrl: "https://example.org/original", ogTitle: { nl: "CMS OG titel", en: "CMS OG title" },
    ogDescription: { nl: "CMS OG beschrijving", en: "CMS OG description" },
    ogImageUrl: "https://example.org/og.webp", ogImageAlt: { nl: "CMS OG beeld", en: "CMS OG image" },
    robotsIndex: false, tableOfContents: true, relatedPostSlugs: ["cms-post-0", "cms-post-1", "unpublished"],
    relatedGuidePaths: ["/en/guides/saddle-height"],
  };
}

beforeEach(() => {
  locale = "nl";
  posts = [];
  post = fixture();
  vi.mocked(fetchQuery).mockReset();
  vi.mocked(fetchQuery).mockImplementation(async (...args: Parameters<typeof fetchQuery>) => {
    const [query] = args;
    if (String(query) === "list") return { page: posts, isDone: true, continueCursor: "" };
    if (String(query) === "slugs") return posts.map(({ slug }) => ({ slug }));
    return post;
  });
});
afterEach(cleanup);

describe("blog index presentation and CMS contract", () => {
  it("translates Dutch category labels and metadata without changing English labels", async () => {
    expect(getBlogCategoryLabel("saddle-height", "nl")).toBe("Zadelhoogte");
    expect(getBlogCategoryLabel("science", "nl")).toBe("Wetenschap");
    expect(getBlogCategoryLabel("saddle-height", "en")).toBe("Saddle Height");
    const metadata = await indexMetadata();
    expect(metadata.description).toBe("Lees praktische artikelen over bikefitting, fietspositie, comfort en afstelkeuzes.");
    expect(metadata.openGraph?.description).toBe(metadata.description);
  });

  it.each(["nl", "en"] as const)("renders the real empty state and localized links in %s", async (language) => {
    locale = language;
    const { container } = render(await BlogIndexPage({}));
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByText(blogMessages[locale].emptyCopy)).toBeTruthy();
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    expect(screen.queryByRole("navigation", { name: blogMessages[locale].filters })).toBeNull();
    expect(screen.getByRole("link", { name: blogMessages[locale].calculator }).getAttribute("href")).toBe(`/${locale}/calculators/bike-fit`);
    expect(container.textContent).not.toMatch(/\[ARTIKEL|Voorbeeldgegevens/);
    expect(fetchQuery).toHaveBeenCalledWith("list", { numItems: 100, cursor: null, category: undefined });
    const metadata = await indexMetadata();
    expect(metadata.alternates?.canonical).toBe(`https://bestbikefit4u.eu/${locale}/blog`);
    const schema = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!);
    expect(schema.itemListElement[1].item).toBe(`https://bestbikefit4u.eu/${locale}/blog`);
  });

  it.each(["nl", "en"] as const)("renders nine published cards with images and dates in %s", async (language) => {
    locale = language;
    posts = Array.from({ length: 12 }, (_, index) => fixture(index));
    render(await BlogIndexPage({}));
    expect(screen.getAllByRole("article")).toHaveLength(9);
    const first = within(screen.getAllByRole("article")[0]);
    expect(first.getByRole("heading", { level: 3 }).textContent).toBe(posts[0].title[locale]);
    expect(first.getByRole("img").getAttribute("alt")).toBe(posts[0].featuredImageAlt![locale]);
    expect(first.getByRole("img").getAttribute("src")).toContain("01-racefiets.webp");
    expect(first.getByText(formatBlogDate(posts[0].publishedAt, locale)!)).toBeTruthy();
    expect(first.getByRole("link", { name: blogMessages[locale].read }).getAttribute("href")).toBe(`/${locale}/blog/cms-post-0`);
    expect(screen.getByRole("link", { name: `${blogMessages[locale].page} 2` }).getAttribute("href")).toBe(`/${locale}/blog?page=2`);
  });

  it("preserves category selection across pagination and resets the page on filter links", async () => {
    posts = Array.from({ length: 12 }, (_, index) => fixture(index));
    render(await BlogIndexPage({ searchParams: Promise.resolve({ category: ["bike-fit", "comfort"], page: "2" }) }));
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "CMS titel 9" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Pagina 2" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Pagina 1" }).getAttribute("href")).toBe("/nl/blog?category=bike-fit");
    const filters = within(screen.getByRole("navigation", { name: "Filter op onderwerp" }));
    expect(filters.getByRole("link", { name: "Bikefitting" }).getAttribute("aria-current")).toBe("page");
    expect(filters.getByRole("link", { name: "Comfort" }).getAttribute("href")).toBe("/nl/blog?category=comfort");
    expect(filters.getByRole("link", { name: "Alles" }).getAttribute("href")).toBe("/nl/blog");
  });

  it.each(["-1", "invalid", "999"])("keeps page normalization for %s", async (page) => {
    posts = Array.from({ length: 12 }, (_, index) => fixture(index));
    render(await BlogIndexPage({ searchParams: Promise.resolve({ page }) }));
    expect(screen.getAllByRole("article")).toHaveLength(page === "999" ? 3 : 9);
    expect(screen.getByRole("link", { name: `Pagina ${page === "999" ? 2 : 1}` }).getAttribute("aria-current")).toBe("page");
  });

  it("shows an empty selection without inventing posts or losing reset navigation", async () => {
    posts = [fixture()];
    render(await BlogIndexPage({ searchParams: Promise.resolve({ category: "unknown", page: "2" }) }));
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    expect(screen.getByText(blogMessages.nl.emptyCopy)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Alles" }).getAttribute("href")).toBe("/nl/blog");
    expect(screen.queryByRole("navigation", { name: blogMessages.nl.pages })).toBeNull();
  });
});

describe("blog detail content and SEO contract", () => {
  it("uses Dutch guide titles instead of slug text in related links", async () => {
    post = { ...fixture(), relatedGuidePaths: ["/en/guides/bike-fitting-for-lower-back-pain"] };
    render(await BlogArticlePage({ params: Promise.resolve({ slug: post.slug }) }));
    expect(screen.getByRole("link", { name: /Lage rugpijn fietsen: rustig je positie controleren/i }).getAttribute("href"))
      .toBe("/nl/guides/bike-fitting-for-lower-back-pain");
    expect(screen.queryByText(/Bike Fitting For Lower Back Pain/)).toBeNull();
  });

  it.each(["nl", "en"] as const)("preserves published content, TOC IDs, related links and schemas in %s", async (language) => {
    locale = language;
    posts = [fixture(), fixture(1), fixture(2)];
    const { container } = render(await BlogArticlePage({ params: Promise.resolve({ slug: "cms-post-0" }) }));
    expect(fetchQuery).toHaveBeenCalledWith("post", { slug: "cms-post-0" });
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(post!.h1![locale]);
    expect(screen.getByText(language === "nl" ? "Gepubliceerde tekst." : "Published body.")).toBeTruthy();
    expect(screen.getByText(formatBlogDate(post!.publishedAt, locale)!)).toBeTruthy();
    expect(screen.getByText(`${blogMessages[locale].by} CMS Author`)).toBeTruthy();
    expect(screen.getByRole("img").getAttribute("alt")).toBe(post!.featuredImageAlt![locale]);
    expect(screen.getByRole("img").getAttribute("src")).toContain("01-racefiets.webp");
    const toc = within(screen.getByRole("navigation", { name: blogMessages[locale].toc }));
    const headingId = language === "nl" ? "positie" : "position";
    expect(toc.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([`#${headingId}`, `#${headingId}-2`]);
    expect(container.querySelector(`#${headingId}-2`)?.tagName).toBe("H2");
    expect(container.querySelector(`a[href="/${locale}/blog/cms-post-1"]`)).toBeTruthy();
    expect(container.querySelector('a[href$="/blog/unpublished"]')).toBeNull();
    expect(container.querySelector(`a[href="/${locale}/guides/saddle-height"]`)).toBeTruthy();
    const schemas = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!);
    expect(schemas[0]).toMatchObject({ "@type": "BlogPosting", headline: post!.h1![locale], description: post!.metaDescription[locale], url: `https://bestbikefit4u.eu/${locale}/blog/cms-post-0`, inLanguage: locale, image: post!.ogImageUrl, datePublished: new Date(post!.publishedAt!).toISOString(), dateModified: new Date(post!.updatedAt).toISOString() });
    expect(schemas[1].itemListElement[2].item).toBe(`https://bestbikefit4u.eu/${locale}/blog?category=bike-fit`);
    const metadata = await articleMetadata({ params: Promise.resolve({ slug: "cms-post-0" }) });
    expect(metadata.title).toBe(post!.metaTitle[locale]);
    expect(metadata.description).toBe(post!.metaDescription[locale]);
    expect(metadata.alternates?.canonical).toBe(post!.canonicalUrl);
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.openGraph).toMatchObject({ title: post!.ogTitle![locale], description: post!.ogDescription![locale], url: post!.canonicalUrl, images: [{ url: post!.ogImageUrl, alt: post!.ogImageAlt![locale] }], authors: ["CMS Author"] });
  });

  it("preserves optional-content and metadata fallbacks without unnecessary related queries", async () => {
    post = { ...fixture(), h1: undefined, excerpt: undefined, featuredImageUrl: undefined, publishedAt: undefined, authorName: undefined, tableOfContents: false, relatedPostSlugs: [], relatedGuidePaths: [], canonicalUrl: undefined, ogTitle: undefined, ogDescription: undefined, ogImageUrl: undefined, robotsIndex: true };
    render(await BlogArticlePage({ params: Promise.resolve({ slug: post.slug }) }));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(post.title.nl);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.queryByRole("navigation", { name: blogMessages.nl.toc })).toBeNull();
    expect(screen.queryByRole("heading", { name: blogMessages.nl.relatedPosts })).toBeNull();
    expect(fetchQuery).not.toHaveBeenCalledWith("list", expect.anything());
    const metadata = await articleMetadata({ params: Promise.resolve({ slug: post.slug }) });
    expect(metadata.alternates?.canonical).toBe("https://bestbikefit4u.eu/nl/blog/cms-post-0");
    expect(metadata.openGraph).toMatchObject({ title: post.metaTitle.nl, description: post.metaDescription.nl });
    expect(metadata.robots).toBeUndefined();
  });

  it.each(["nl", "en"] as const)("keeps missing articles not-found and noindex in %s", async (language) => {
    locale = language;
    post = null;
    const props = { params: Promise.resolve({ slug: "missing" }) };
    await expect(BlogArticlePage(props)).rejects.toThrow("NEXT_NOT_FOUND");
    expect(await articleMetadata(props)).toEqual({ title: language === "nl" ? "Pagina niet gevonden" : "Page not found", robots: { index: false, follow: false } });
  });

  it("keeps static params and cache lifetimes tied to published CMS data", async () => {
    posts = [fixture(), fixture(1)];
    expect(await generateStaticParams()).toEqual([{ slug: "cms-post-0" }, { slug: "cms-post-1" }]);
    expect(fetchQuery).toHaveBeenCalledWith("slugs", {});
    expect(indexRevalidate).toBe(900);
    expect(articleRevalidate).toBe(900);
    expect(Object.keys(blogMessages.nl).sort()).toEqual(Object.keys(blogMessages.en).sort());
  });
});
