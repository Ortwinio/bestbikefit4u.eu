import { describe, expect, it } from "vitest";
import { parseHead, parseSitemap, metadataIssues, isNoindex } from "./html.mjs";

const tags = '<title>Real &amp; title</title><meta name="description" content="Real description">'
  + '<link rel="canonical" href="https://bestbikefit4u.eu/en/guides/example">';
const canonical = "https://bestbikefit4u.eu/en/guides/example";
describe("raw source metadata parser", () => {
  it("finds one complete set inside the explicit head", () => {
    const result = parseHead(`<!doctype html><html><head>${tags}</head><body>Page</body></html>`);
    expect(metadataIssues(result, canonical)).toEqual([]);
    expect(result.titles[0].value).toBe("Real & title");
  });
  it("detects streamed metadata in the body, without moving it into the head", () => {
    const result = parseHead(`<html><head><meta charset=utf-8></head><body>${tags}</body></html>`);
    expect(metadataIssues(result, canonical)).toEqual([
      "title-outside-head", "description-outside-head", "canonical-outside-head",
    ]);
  });
  it("ignores tag-like text and closing heads in comments/scripts", () => {
    const result = parseHead(`<html><head><!-- </head><title>fake</title> -->
      <script>const fake = '</head><title>fake</title>';</script>${tags}</head>
      <body><svg><title>Illustration</title></svg></body></html>`);
    expect(result.titles).toHaveLength(1);
    expect(metadataIssues(result, canonical)).toEqual([]);
  });
  it("handles mixed-case attributes, entities, unquoted values and duplicate metadata", () => {
    const result = parseHead(`<HTML><HEAD>${tags}<META NAME=DESCRIPTION CONTENT='another &amp; one'>
      <LINK REL='alternate' HREFLANG=nl HREF='https://bestbikefit4u.eu/nl/guides/example'></HEAD></HTML>`);
    expect(result.descriptions[1].value).toBe("another & one");
    expect(metadataIssues(result, canonical)).toContain("description-count:2");
    expect(result.alternates[0]).toMatchObject({ lang: "nl", inHead: true });
  });
  it("rejects an implicitly closed malformed head and relative canonical", () => {
    const result = parseHead('<head><div>early close</div><title>Late</title>'
      + '<meta name=description content=Late><link rel=canonical href=/en/example></head>');
    expect(metadataIssues(result, canonical)).toContain("missing-explicit-head-end");
    expect(metadataIssues(result, canonical)).toContain("canonical-not-absolute");
  });
  it("reads robots noindex and navigation hrefs without executing scripts", () => {
    const result = parseHead('<head><meta name=robots content="noindex, follow"></head>'
      + '<body><script>throw Error("must not run")</script><a href="/nl/login?src=a&amp;b=c">Login</a></body>');
    expect(isNoindex(result)).toBe(true);
    expect(result.hrefs).toEqual(["/nl/login?src=a&b=c"]);
    expect(isNoindex(parseHead("<head></head>"), "noindex")).toBe(true);
  });
  it("does not treat Googlebot-only robots as noindex for Chrome", () => {
    const result = parseHead('<head><meta name=googlebot content=noindex></head>');
    expect(isNoindex(result, "", "Googlebot")).toBe(true);
    expect(isNoindex(result, "", "Chrome")).toBe(false);
  });
  it("parses sitemap indexes and only direct URL loc children", () => {
    expect(parseSitemap('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
      + '<sitemap><loc>https://bestbikefit4u.eu/sitemap-guides.xml</loc></sitemap></sitemapindex>'))
      .toEqual({ index: true, locations: ["https://bestbikefit4u.eu/sitemap-guides.xml"] });
    expect(parseSitemap('<urlset><url><loc>https://bestbikefit4u.eu/en?a=1&amp;b=2</loc>'
      + '<image><loc>ignore.jpg</loc></image></url></urlset>').locations)
      .toEqual(["https://bestbikefit4u.eu/en?a=1&b=2"]);
  });
});
