import { describe, expect, it } from "vitest";
import type { Id } from "../../../../convex/_generated/dataModel";
import {
  formatAdminDate,
  formatAdminDateTime,
  formatAdminPercent,
  getAdminDisplayName,
  getBikeDisplayName,
  summarizeJsonText,
} from "./admin-format";

describe("admin format helpers", () => {
  it("formats UTC timestamps consistently", () => {
    const timestamp = new Date("2026-03-22T08:48:00Z");

    expect(formatAdminDateTime(timestamp)).toBe("2026-03-22 08:48");
    expect(formatAdminDate(timestamp)).toBe("2026-03-22");
  });

  it("formats percentages and fallbacks", () => {
    expect(formatAdminPercent(0.923)).toBe("92%");
    expect(formatAdminPercent(undefined)).toBe("—");
  });

  it("builds readable admin labels", () => {
    expect(
      getAdminDisplayName({
        _id: "user_1" as Id<"users">,
        displayName: "Mila Vermeer",
        name: "Mila",
        email: "mila@example.com",
      })
    ).toBe("Mila Vermeer");

    expect(
      getBikeDisplayName({
        _id: "bike_1" as Id<"bikes">,
        name: "Domane",
        brand: "Trek",
        model: "SL 6",
        bikeType: "road",
      })
    ).toBe("Domane · Trek SL 6");
  });

  it("summarizes json payloads for admin surfaces", () => {
    expect(summarizeJsonText('{"alpha":1,"beta":2}')).toContain("alpha: 1");
    expect(summarizeJsonText("plain-text")).toBe("plain-text");
  });
});
