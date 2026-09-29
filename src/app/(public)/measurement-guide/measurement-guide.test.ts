import { describe, expect, it } from "vitest";
import { measurementGuideCopy, measurementGuidePresentation } from "@/i18n/marketing/measurementGuide";

describe("measurement guide content", () => {
  for (const locale of ["nl", "en"] as const) {
    it(`retains all seven source measurements and instructions in ${locale}`, () => {
      const page = measurementGuideCopy[locale];
      expect(page.items.map((item) => item.id)).toEqual([
        "height", "inseam", "torso", "arm", "shoulder", "femur", "foot",
      ]);
      expect(page.items.filter((item) => item.required).map((item) => item.id)).toEqual(["height", "inseam"]);
      expect(page.items.map((item) => item.steps.length)).toEqual([3, 3, 3, 3, 3, 3, 3]);
      expect(page.items.map((item) => item.mistakes.length)).toEqual([2, 2, 2, 2, 2, 2, 2]);
      expect(page.items[0].targetRange).toBe("130-210 cm");
      expect(page.items[1].targetRange).toBe("55-105 cm");
      expect(page.items[6].targetRange).toBe("220-320 mm");
      expect(page.beforeStartBullets).toHaveLength(4);
      expect(page.remeasureBullets).toHaveLength(3);
      expect(measurementGuidePresentation[locale].diagramLabels).toHaveLength(7);
      expect(page.metadata.title).toBeTruthy();
      expect(page.metadata.description).toBeTruthy();
    });
  }

  it("keeps presentation keys aligned across languages", () => {
    expect(Object.keys(measurementGuidePresentation.nl)).toEqual(Object.keys(measurementGuidePresentation.en));
  });
});
