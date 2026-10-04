// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import * as IndexRoute from "@/app/sitemap.xml/route";
import * as PagesRoute from "@/app/sitemap-pages.xml/route";
import * as CalculatorsRoute from "@/app/sitemap-calculators.xml/route";
import * as GuidesRoute from "@/app/sitemap-guides.xml/route";
import * as BlogRoute from "@/app/sitemap-blog.xml/route";
import { listGuideRewrites } from "@/lib/guides/rewrites";
import { BLOG_SITEMAP_CACHE_CONTROL, DEFAULT_SITEMAP_CACHE_CONTROL } from "@/lib/seo/sitemap/config";

const cms = vi.hoisted(() => ({
  blog: [] as Record<string, unknown>[],
  guides: [] as Record<string, unknown>[],
}));

vi.mock("server-only", () => ({}));
vi.mock("@convex-dev/auth/nextjs/server", () => ({ convexAuthNextjsToken: vi.fn() }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("convex/nextjs", () => ({
  fetchQuery: vi.fn(async (reference: Parameters<typeof getFunctionName>[0]) => {
    const name = getFunctionName(reference);
    if (name === "blog/queries:listPublishedSlugs") return cms.blog;
    if (name === "guides/queries:listPublishedGuides") return cms.guides;
    throw new Error(`Unexpected sitemap CMS query: ${name}`);
  }),
}));

beforeEach(() => {
  cms.blog = [];
  cms.guides = [];
});

const origin = "https://bikefitboost.com";
const routes = [
  ["/sitemap.xml", IndexRoute, "sitemapindex", DEFAULT_SITEMAP_CACHE_CONTROL],
  ["/sitemap-pages.xml", PagesRoute, "urlset", DEFAULT_SITEMAP_CACHE_CONTROL],
  ["/sitemap-calculators.xml", CalculatorsRoute, "urlset", DEFAULT_SITEMAP_CACHE_CONTROL],
  ["/sitemap-guides.xml", GuidesRoute, "urlset", DEFAULT_SITEMAP_CACHE_CONTROL],
  ["/sitemap-blog.xml", BlogRoute, "urlset", BLOG_SITEMAP_CACHE_CONTROL],
] as const;

function parseXml(xml: string) {
  const document = new DOMParser().parseFromString(xml, "application/xml");
  expect(document.querySelector("parsererror")).toBeNull();
  expect(document.documentElement.namespaceURI).toBe("http://www.sitemaps.org/schemas/sitemap/0.9");
  return document;
}

function entries(document: Document, tag: "url" | "sitemap") {
  return [...document.getElementsByTagName(tag)].map((entry) => ({
    loc: entry.querySelector("loc")?.textContent,
    lastmod: entry.querySelector("lastmod")?.textContent ?? null,
  }));
}

describe("sitemap HTTP routes", () => {
  it.each(routes)("serves valid GET XML and bodyless matching HEAD at %s", async (path, route, root, cacheControl) => {
    const get = await route.GET(new Request(origin + path));
    const head = await route.HEAD(new Request(origin + path, { method: "HEAD" }));
    expect(get.status).toBe(200);
    expect(head.status).toBe(200);
    const document = parseXml(await get.text());
    expect(document.documentElement.localName).toBe(root);
    const latestDate = [...document.getElementsByTagName("lastmod")]
      .map((element) => element.textContent).filter((date): date is string => Boolean(date)).sort().at(-1);
    expect(get.headers.get("last-modified")).toBe(latestDate ? new Date(latestDate).toUTCString() : null);
    expect(await head.text()).toBe("");
    for (const response of [get, head]) {
      expect(response.headers.get("content-type")).toBe("text/xml; charset=utf-8");
      expect(response.headers.get("cache-control")).toBe(cacheControl);
      expect(response.headers.get("x-robots-tag")).toBe("index, follow");
      expect(response.headers.get("x-content-type-options")).toBe("nosniff");
      expect(response.headers.has("content-length")).toBe(false);
      expect(response.headers.get("etag")).toMatch(/^"[a-f0-9]+"$/);
    }
    expect([...head.headers]).toEqual([...get.headers]);
  });

  it.each(routes)("returns bodyless GET and HEAD 304 responses for matching ETags at %s", async (path, route) => {
    const initial = await route.GET(new Request(origin + path));
    const etag = initial.headers.get("etag")!;
    for (const method of ["GET", "HEAD"] as const) {
      const response = await route[method](new Request(origin + path, { method, headers: { "if-none-match": etag } }));
      expect(response.status).toBe(304);
      expect(await response.text()).toBe("");
      expect(response.headers.get("etag")).toBe(etag);
      expect(response.headers.get("cache-control")).toBe(initial.headers.get("cache-control"));
      expect(response.headers.get("last-modified")).toBe(initial.headers.get("last-modified"));
      expect(response.headers.has("content-length")).toBe(false);
    }
    const stale = await route.GET(new Request(origin + path, { headers: { "if-none-match": '"stale"' } }));
    expect(stale.status).toBe(200);
    expect(await stale.text()).not.toBe("");
  });

  it.each(routes)("keeps preview sitemap responses non-indexable at %s", async (path, route) => {
    const response = await route.GET(new Request("https://fixture-preview.vercel.app" + path));
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow, noarchive");
  });

  it("retains an empty blog sitemap in the index without inventing its lastmod", async () => {
    const blog = await BlogRoute.GET(new Request(origin + "/sitemap-blog.xml"));
    const empty = parseXml(await blog.text());
    expect(empty.documentElement.localName).toBe("urlset");
    expect(empty.getElementsByTagName("url")).toHaveLength(0);
    expect(blog.headers.has("last-modified")).toBe(false);
    const index = await IndexRoute.GET(new Request(origin + "/sitemap.xml"));
    const nodes = entries(parseXml(await index.text()), "sitemap");
    expect(nodes.map((node) => node.loc).sort()).toEqual(routes.slice(1).map(([path]) => origin + path).sort());
    expect(nodes.find((node) => node.loc === origin + "/sitemap-blog.xml")?.lastmod).toBeNull();
  });

  it("serves authored guide rewrites and their content dates when CMS supplies no guides", async () => {
    const response = await GuidesRoute.GET(new Request(origin + "/sitemap-guides.xml"));
    const nodes = entries(parseXml(await response.text()), "url");
    expect(new Set(nodes.map((node) => node.loc)).size).toBe(nodes.length);
    for (const guide of listGuideRewrites()) {
      for (const locale of ["en", "nl"]) {
        expect(nodes).toContainEqual({ loc: `${origin}/${locale}/guides/${guide.slug}`, lastmod: guide.updatedAt });
      }
    }
  });

  it("preserves CMS guide dates and omits missing dates without generating invalid XML", async () => {
    cms.guides = [
      { slug: "s7-dated-guide", path: "/guides/s7-dated-guide", lastUpdatedAt: Date.UTC(2026, 8, 12), createdAt: Date.UTC(2026, 0, 2) },
      { slug: "s7-undated-guide", path: "/guides/s7-undated-guide" },
    ];
    const response = await GuidesRoute.GET(new Request(origin + "/sitemap-guides.xml"));
    const nodes = entries(parseXml(await response.text()), "url");
    for (const locale of ["en", "nl"]) {
      expect(nodes).toContainEqual({ loc: `${origin}/${locale}/guides/s7-dated-guide`, lastmod: "2026-09-12" });
      expect(nodes).toContainEqual({ loc: `${origin}/${locale}/guides/s7-undated-guide`, lastmod: null });
    }
    const latestDate = nodes.flatMap((node) => node.lastmod ? [node.lastmod] : []).sort().at(-1)!;
    expect(response.headers.get("last-modified")).toBe(new Date(latestDate).toUTCString());
  });

  it("carries real blog dates into XML/index headers while leaving undated posts undated", async () => {
    cms.blog = [{ slug: "dated-post", updatedAt: Date.UTC(2026, 8, 20), publishedAt: Date.UTC(2026, 8, 5) },
      { slug: "undated-post" }];
    const response = await BlogRoute.GET(new Request(origin + "/sitemap-blog.xml"));
    const nodes = entries(parseXml(await response.text()), "url");
    for (const locale of ["en", "nl"]) {
      expect(nodes).toContainEqual({ loc: `${origin}/${locale}/blog/dated-post`, lastmod: "2026-09-20" });
      expect(nodes).toContainEqual({ loc: `${origin}/${locale}/blog/undated-post`, lastmod: null });
    }
    expect(response.headers.get("last-modified")).toBe("Sun, 20 Sep 2026 00:00:00 GMT");
    const index = await IndexRoute.GET(new Request(origin + "/sitemap.xml"));
    expect(entries(parseXml(await index.text()), "sitemap")).toContainEqual({ loc: origin + "/sitemap-blog.xml", lastmod: "2026-09-20" });
  });

  it("invalidates an empty-blog ETag when published content becomes available", async () => {
    const empty = await BlogRoute.GET(new Request(origin + "/sitemap-blog.xml"));
    const etag = empty.headers.get("etag")!;
    cms.blog = [{ slug: "new-post", publishedAt: Date.UTC(2026, 8, 20) }];
    const updated = await BlogRoute.GET(new Request(origin + "/sitemap-blog.xml", { headers: { "if-none-match": etag } }));
    expect(updated.status).toBe(200);
    expect(updated.headers.get("etag")).not.toBe(etag);
    expect(entries(parseXml(await updated.text()), "url")).toHaveLength(2);
  });
});
