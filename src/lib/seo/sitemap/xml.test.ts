import { describe, expect, it } from "vitest";
import { buildXmlHeadResponse, buildXmlResponse, latestSitemapLastmod, renderSitemapIndexXml, renderUrlSetXml } from "./xml";

describe("sitemap xml responses", () => {
  it("returns crawler-friendly XML headers", async () => {
    const request = new Request("https://www.bikefitboost.com/sitemap.xml");
    const response = buildXmlResponse(request, "<urlset></urlset>", {
      lastModified: "2026-03-31",
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/xml; charset=utf-8");
    expect(response.headers.get("x-robots-tag")).toBe("index, follow");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("last-modified")).toBe("Tue, 31 Mar 2026 00:00:00 GMT");
    expect(await response.text()).toBe("<urlset></urlset>");
  });

  it("marks non-production sitemap hosts as noindex", () => {
    const request = new Request("https://preview-bestbikefit4u.vercel.app/sitemap.xml");
    const response = buildXmlResponse(request, "<urlset></urlset>");

    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow, noarchive");
  });

  it("uses forwarded production host headers before internal request URLs", () => {
    const request = new Request("https://bestbikefit4u.vercel.app/sitemap.xml", {
      headers: {
        "x-forwarded-host": "www.bikefitboost.com",
      },
    });
    const response = buildXmlResponse(request, "<urlset></urlset>");

    expect(response.headers.get("x-robots-tag")).toBe("index, follow");
  });

  it("returns header-only responses for HEAD requests", async () => {
    const request = new Request("https://www.bikefitboost.com/sitemap.xml", {
      method: "HEAD",
    });
    const response = buildXmlHeadResponse(request, "<urlset></urlset>", {
      lastModified: "2026-03-31",
    });

    expect(response.status).toBe(200);
    expect(response.headers.has("content-length")).toBe(false);
    expect(await response.text()).toBe("");
  });

  it("omits unsupported dates without inventing a current date", () => {
    expect(renderSitemapIndexXml([{ loc: "https://www.bikefitboost.com/sitemap-blog.xml" }])).not.toContain("lastmod");
    expect(renderUrlSetXml([{ loc: "https://www.bikefitboost.com/en", alternates: [] }])).not.toContain("lastmod");
    expect(latestSitemapLastmod([{}, { lastmod: "invalid" }])).toBeUndefined();
    expect(latestSitemapLastmod([{}, { lastmod: "2026-10-01" }, { lastmod: "2026-09-30" }])).toBe("2026-10-01");
  });

  it("keeps GET and conditional responses free of manual content length", async () => {
    const url = "https://www.bikefitboost.com/sitemap-blog.xml";
    const response = buildXmlResponse(new Request(url), renderUrlSetXml([]));
    expect(response.headers.has("content-length")).toBe(false);
    const cached = buildXmlResponse(new Request(url, { headers: { "if-none-match": response.headers.get("etag")! } }),
      renderUrlSetXml([]));
    expect(cached.status).toBe(304);
    expect(cached.headers.has("content-length")).toBe(false);
    expect(await cached.text()).toBe("");
  });
});
