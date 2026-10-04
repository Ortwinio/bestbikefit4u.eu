import { readFileSync, statSync } from "node:fs";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { socialImage } from "./social-image";
import { currentSiteUrl } from "./siteUrl";
import images from "./social-images.json";
import { listGuideRewrites } from "@/lib/guides/rewrites";

describe("dedicated social images", () => {
  it("maps relative and owned absolute sources, preserving alt and explicit dimensions", () => {
    const source = "/guides/media/003--guides--bike-fitting-for-knee-pain-hero.png";
    const expected = {
      url: "https://bikefitboost.com/og/guides/media/003--guides--bike-fitting-for-knee-pain-hero.jpg",
      width: 1200, height: 630, alt: "Kniepijn",
    };
    expect(socialImage(source, "Kniepijn")).toEqual(expected);
    expect(socialImage(`https://bikefitboost.com${source}`, "Kniepijn")).toEqual(expected);
    expect(socialImage(`https://bestbikefit4u.eu${source}`, "Kniepijn")).toEqual(expected);
    expect(socialImage(`https://archive.bestbikefit4u.eu${source}`, "Kniepijn")).toEqual(expected);
    expect(socialImage(`https://www.bikefitboost.com${source}`, "Kniepijn")).toEqual(expected);
    expect(socialImage(`https://external.example${source}`, "External"))
      .toEqual({ url: `https://external.example${source}`, alt: "External" });
  });

  it("ships every mapped JPEG at 1200×630 below 200 kB", async () => {
    for (const entry of Object.values(images)) {
      expect(statSync(`public${entry.path}`).size).toBeLessThanOrEqual(200000);
      const metadata = await sharp(`public${entry.path}`).metadata();
      expect(metadata).toMatchObject({ width: 1200, height: 630, format: "jpeg" });
    }
  });

  it("uses the new illustration for all 48 rewritten guide previews and CMS review records", () => {
    for (const guide of listGuideRewrites()) {
      const expected = socialImage(`/illustrations/guides/${guide.illustration}.webp`, guide.nl.alt);
      expect(expected.url).toContain(`/og/illustrations/guides/${guide.illustration}.jpg`);
      const cms = JSON.parse(readFileSync(`plans/redesign-canvas/guides-import/${guide.slug}.json`, "utf8"));
      expect(currentSiteUrl(cms.ogImageUrl)).toBe(expected.url);
    }
  });
});
