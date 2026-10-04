import { describe, expect, it, vi } from "vitest";
import { checkRedirect, inspectHtml, inspectRobots, readSitemaps, validateOrigins } from "./domain-migration-check.mjs";

const origin = "https://bikefitboost.com";
const legacy = "https://bestbikefit4u.eu";
const html = (url: string) => `<html><head><title>Page</title><meta name="description" content="Page description">
<link rel="canonical" href="${url}"><meta property="og:url" content="${url}">
<link rel="alternate" hreflang="en" href="${origin}/en">
<link rel="alternate" hreflang="nl" href="${origin}/nl"></head><body>Page</body></html>`;

describe("domain migration checker", () => {
  it("accepts configured legacy origins and rejects hostile or unclean origins", () => {
    expect(() => validateOrigins(origin, legacy)).not.toThrow();
    for (const value of [`${origin}.evil.test`, `${origin}/path`, `https://user@bikefitboost.com`, "http://bikefitboost.com"]) {
      expect(() => validateOrigins(value, legacy)).toThrow();
    }
    expect(() => validateOrigins(origin, `${legacy}.evil.test`)).toThrow();
  });
  it("requires exactly one 301 preserving path and encoded query", async () => {
    const path = "/nl/guides/example?src=a%2Fb&x=2";
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(null, {
      status: 301, headers: { location: origin + path },
    })).mockResolvedValueOnce(new Response("destination"));
    expect((await checkRedirect(fetcher, origin, legacy, path)).issues).toEqual([]);
    expect(fetcher.mock.calls).toEqual([[legacy + path], [origin + path]]);
  });
  it("requires JPEG content at guide image destinations, not a soft HTML success", async () => {
    const path = "/og/illustrations/guides/example.jpg";
    for (const type of ["image/jpeg", "text/html"]) {
      const fetcher = vi.fn().mockResolvedValueOnce(new Response(null, {
        status: 301, headers: { location: origin + path },
      })).mockResolvedValueOnce(new Response("body", { headers: { "content-type": type } }));
      expect((await checkRedirect(fetcher, origin, legacy, path)).issues)
        .toEqual(type === "image/jpeg" ? [] : ["guide-image-content-type"]);
    }
  });
  it("detects a second redirect and rejects 308", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(null, {
      status: 301, headers: { location: `${origin}/en` },
    })).mockResolvedValueOnce(new Response(null, { status: 307, headers: { location: `${origin}/nl` } }));
    expect((await checkRedirect(fetcher, origin, legacy, "/en")).issues).toContain("destination-status:307");
    const wrongStatus = vi.fn().mockResolvedValue(new Response(null, {
      status: 308, headers: { location: `${origin}/en` },
    }));
    expect((await checkRedirect(wrongStatus, origin, legacy, "/en")).issues).toContain("redirect-status:308");
  });
  it("rejects query loss and hostile destination without following", async () => {
    for (const location of [`${origin}/en`, `${origin}.evil.test/en?x=1`]) {
      const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 301, headers: { location } }));
      expect((await checkRedirect(fetcher, origin, legacy, "/en?x=1")).issues)
        .toContain("redirect-path-query-or-origin");
      expect(fetcher).toHaveBeenCalledTimes(1);
    }
  });
  it("does not start OAuth or consume callback codes", async () => {
    const path = "/api/auth/callback/google?error=access_denied";
    const fetcher = vi.fn().mockResolvedValue(new Response(null, {
      status: 301, headers: { location: origin + path },
    }));
    expect((await checkRedirect(fetcher, origin, legacy, path, true)).issues).toEqual([]);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("checks canonical, OG, hreflang and mixed content through an inert DOM", () => {
    expect(inspectHtml(html(`${origin}/en`), `${origin}/en`)).toEqual([]);
    const navigation = html(`${origin}/en`).replace("</body>", '<a href="http://example.com">Study</a></body>');
    expect(inspectHtml(navigation, `${origin}/en`)).toEqual([]);
    const bad = html(`${origin}/en`).replace('hreflang="nl" href="https://bikefitboost.com/nl"',
      'hreflang="nl" href="https://bikefitboost.com.evil.test/nl"')
      .replace("</body>", '<img src="http://cdn.example/image.jpg"></body>');
    expect(inspectHtml(bad, `${origin}/en`)).toEqual(["hreflang-origin", "mixed-content"]);
    expect(inspectHtml(html(`${origin}/nl`), `${origin}/en`)).toContain("canonical-not-self");
    expect(inspectHtml(html(`${origin}/nl`), `${origin}/en`)).toContain("og-url-not-self");
  });
  it("requires both language alternates", () => {
    const missing = html(`${origin}/en`).replace(/<link rel="alternate"[^>]+>/g, "");
    expect(inspectHtml(missing, `${origin}/en`)).toEqual(["hreflang-missing:en", "hreflang-missing:nl"]);
  });
  it("rejects empty sitemaps even when asset checks succeed", async () => {
    const result = await readSitemaps(async () => new Response("<urlset/>"), origin);
    expect(result.issues).toContain("sitemap-empty");
  });
  it("checks an optional robots Host directive against the exact apex", () => {
    expect(inspectRobots(`Sitemap: ${origin}/sitemap.xml\nHost: bikefitboost.com`, origin)).toEqual([]);
    expect(inspectRobots(`Sitemap: ${origin}/sitemap.xml\nHost: www.bikefitboost.com`, origin))
      .toEqual(["robots-host-origin"]);
    expect(inspectRobots(`Sitemap: ${origin}/sitemap.xml\nHost: bikefitboost.com.evil.test`, origin))
      .toEqual(["robots-host-origin"]);
  });
  it("recursively parses sitemaps, checks exact origin and never requests hostile locations", async () => {
    const fetcher = vi.fn(async (url: string) => new Response(url.endsWith("/sitemap.xml")
      ? `<sitemapindex><sitemap><loc>${origin}/pages.xml</loc></sitemap></sitemapindex>`
      : `<urlset><url><loc>${origin}/nl</loc></url><url><loc>${origin}.evil.test/en</loc></url></urlset>`));
    const result = await readSitemaps(fetcher, origin);
    expect(result.urls).toEqual([`${origin}/nl`]);
    expect(result.issues).toEqual([`sitemap-origin:${origin}.evil.test/en`]);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
