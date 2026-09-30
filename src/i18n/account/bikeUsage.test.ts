import { describe, expect, it } from "vitest";
import { getBikeUsageCopy } from "./bikeUsage";

describe("account bike usage copy", () => {
  it("covers the same saved values in Dutch and English", () => {
    const dutch = getBikeUsageCopy("nl");
    const english = getBikeUsageCopy("en");
    for (const key of ["experience", "weeklyHours", "rideLength", "positionPriority", "roadRiding", "terrain", "painAreas", "climbing"] as const) {
      expect(Object.keys(dutch[key])).toEqual(Object.keys(english[key]));
      expect(Object.values(dutch[key]).every(Boolean)).toBe(true);
      expect(Object.values(english[key]).every(Boolean)).toBe(true);
    }
    expect(dutch.otherDiscomfort).toBe("Overig ongemak");
  });
});
