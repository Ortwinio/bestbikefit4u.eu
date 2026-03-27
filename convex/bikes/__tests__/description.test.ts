import { describe, expect, it } from "vitest";
import {
  buildBikeDescriptionTemplate,
  sanitizeGeneratedBikeDescription,
} from "../description";

describe("bike description helpers", () => {
  it("builds a concise english fallback without geometry claims", () => {
    const description = buildBikeDescriptionTemplate({
      locale: "en",
      name: "Weekend Road",
      bikeType: "road",
      brand: "Canyon",
      model: "Endurace",
      ridingStyle: "sportive",
      primaryGoal: "comfort",
    });

    expect(description).toContain("Canyon Endurace");
    expect(description.toLowerCase()).not.toContain("stack");
    expect(description.toLowerCase()).not.toContain("reach");
  });

  it("rejects generated geometry or spec claims", () => {
    expect(() =>
      sanitizeGeneratedBikeDescription(
        "This bike has 390 mm reach and exact geometry for aggressive racing."
      )
    ).toThrow(/safety rules/i);
  });

  it("accepts a short descriptive summary", () => {
    const description = sanitizeGeneratedBikeDescription(
      "This is my dependable gravel bike for mixed-surface rides and long weekend loops. It feels calm, planted, and easy to ride for hours."
    );

    expect(description).toContain("gravel bike");
    expect(description.length).toBeGreaterThan(40);
  });
});
