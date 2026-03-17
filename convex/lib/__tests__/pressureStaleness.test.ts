import { describe, expect, it } from "vitest";
import { isPressureStale } from "../pressureStaleness";

describe("isPressureStale", () => {
  it("returns false without a calculation", () => {
    expect(isPressureStale(null, null, null)).toBe(false);
  });

  it("detects stale state after weight update", () => {
    expect(
      isPressureStale(
        { createdAt: 100 },
        { weightUpdatedAt: 200 },
        { updatedAt: 50 }
      )
    ).toBe(true);
  });

  it("detects stale state after pressure input update", () => {
    expect(
      isPressureStale(
        { createdAt: 100 },
        { weightUpdatedAt: 90 },
        { updatedAt: 150 }
      )
    ).toBe(true);
  });
});
