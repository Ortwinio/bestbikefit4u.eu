import { describe, expect, it } from "vitest";
import { BRAND } from "@/config/brand";
import { currentSiteUrl } from "./siteUrl";

describe("persisted site URL presentation", () => {
  it.each(["https://bestbikefit4u.eu", "https://www.bestbikefit4u.eu", "http://bestbikefit4u.eu"])(
    "moves trusted legacy origin %s without losing URL components", (origin) => {
      expect(currentSiteUrl(`${origin}/nl/guides/example?source=guide#section`))
        .toBe(`${BRAND.siteUrl}/nl/guides/example?source=guide#section`);
    },
  );
  it.each([
    "https://example.org/original", "https://bestbikefit4u.eu.example.org/guide",
    "https://bestbikefit4u.eu@evil.example/guide", "ftp://bestbikefit4u.eu/file",
    "mailto:support@bestbikefit4u.eu", "/nl/guides/example", "not a URL",
  ])("preserves unrelated URL %s", (value) => {
    expect(currentSiteUrl(value)).toBe(value);
  });
});
