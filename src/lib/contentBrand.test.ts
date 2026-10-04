import { describe, expect, it } from "vitest";
import { currentBrandCopy, currentBrandGuide } from "./contentBrand";

describe("CMS brand presentation", () => {
  it("preserves complete URL and email spans inside mixed copy", () => {
    const input = "BestBikeFit4U support@bestbikefit4u.eu https://bestbikefit4u.eu/x " +
      "https://example.org/path?brand=BestBikeFit4U bestbikefit4u.eu/contact mailto:BestBikeFit4U@example.org";
    expect(currentBrandCopy(input)).toBe(input.replace(/^BestBikeFit4U/, "BikeFitBoost"));
  });
  it("updates display text without changing email addresses or stored identity", () => {
    expect(currentBrandCopy("BestBikeFit4U: support@bestbikefit4u.eu"))
      .toBe("BikeFitBoost: support@bestbikefit4u.eu");
    expect(currentBrandCopy("support@BestBikeFit4U.eu https://BestBikeFit4U.eu"))
      .toBe("support@BestBikeFit4U.eu https://BestBikeFit4U.eu");
    const record = {
      _id: "BestBikeFit4U",
      slug: "bestbikefit4u-guide",
      canonicalUrl: "https://bestbikefit4u.eu/guides/example",
      metaTitle: { nl: "BestBikeFit4U gids", en: "BestBikeFit4U guide" },
      body: { nl: [{ title: "BestBikeFit4U", items: ["Gebruik BestBikeFit4U."] }] },
    };
    const displayed = currentBrandGuide(record);
    expect(displayed.metaTitle).toEqual({ nl: "BikeFitBoost gids", en: "BikeFitBoost guide" });
    expect(displayed.body.nl[0].items).toEqual(["Gebruik BikeFitBoost."]);
    expect(displayed._id).toBe(record._id);
    expect(displayed.slug).toBe(record.slug);
    expect(displayed.canonicalUrl).toBe(record.canonicalUrl);
    expect(record.metaTitle.nl).toBe("BestBikeFit4U gids");
  });
});
