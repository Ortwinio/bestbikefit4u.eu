import { describe, expect, it } from "vitest";
import { buildXmlHeadResponse, buildXmlResponse } from "./xml";

describe("sitemap xml responses", () => {
  it("returns crawler-friendly XML headers", async () => {
    const request = new Request("https://bestbikefit4u.eu/sitemap.xml");
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
        "x-forwarded-host": "bestbikefit4u.eu",
      },
    });
    const response = buildXmlResponse(request, "<urlset></urlset>");

    expect(response.headers.get("x-robots-tag")).toBe("index, follow");
  });

  it("returns header-only responses for HEAD requests", async () => {
    const request = new Request("https://bestbikefit4u.eu/sitemap.xml", {
      method: "HEAD",
    });
    const response = buildXmlHeadResponse(request, "<urlset></urlset>", {
      lastModified: "2026-03-31",
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-length")).toBeDefined();
    expect(await response.text()).toBe("");
  });
});
