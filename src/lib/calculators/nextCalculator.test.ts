import { describe, expect, it } from "vitest";
import { chooseNextCalculator } from "./nextCalculator";
describe("calculator chain next step", () => {
  it("prioritizes reported discomfort without asking a sensitive question", () => {
    expect(chooseNextCalculator("saddle-height", { hasPain: "yes", sitBoneWidthMm: 120 })).toBe("fit");
  });
  it("chooses missing or stale advice with the most complete inputs", () => {
    expect(chooseNextCalculator("ftp-wkg", { weightKg: 70, ftpWatts: 250 })).toBe("gearing");
    expect(chooseNextCalculator("ftp-wkg", { sweatProfile: "high" })).toBe("fuel-hydration");
    expect(chooseNextCalculator("ftp-wkg", { weightKg: 70, ftpWatts: 250 },
      [{ calculator: "gearing", stale: false }])).toBe("fuel-hydration");
    expect(chooseNextCalculator("ftp-wkg", {}, [{ calculator: "gearing", stale: false },
      { calculator: "fuel-hydration", stale: false }])).toBe("dashboard");
  });
  it("follows the saddle branch and does not recommend current advice again", () => {
    expect(chooseNextCalculator("saddle-height", { sitBoneWidthMm: 120 })).toBe("bike-fit");
    expect(chooseNextCalculator("crank-length", {}, [{ calculator: "saddle-height", stale: true }]))
      .toBe("saddle-height");
  });
});
