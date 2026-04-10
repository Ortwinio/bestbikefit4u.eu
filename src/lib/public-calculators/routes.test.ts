import { describe, expect, it } from "vitest";
import {
  getPublicCalculatorRouteEntry,
  getLocalizedPublicCalculatorPath,
  PUBLIC_CALCULATOR_ROUTE_REGISTRY,
} from "./routes";

describe("PUBLIC_CALCULATOR_ROUTE_REGISTRY", () => {
  it("keeps the fit calculators on the canonical calculators namespace", () => {
    expect(PUBLIC_CALCULATOR_ROUTE_REGISTRY["bike-fit"].canonicalPath).toBe(
      "/calculators/bike-fit"
    );
    expect(PUBLIC_CALCULATOR_ROUTE_REGISTRY["saddle-height"].canonicalPath).toBe(
      "/calculators/saddle-height"
    );
  });

  it("defines a future English tire-pressure canonical path with legacy aliases", () => {
    const tirePressure = getPublicCalculatorRouteEntry("tire-pressure");

    expect(tirePressure.canonicalPath).toBe("/tire-pressure-calculator");
    expect(tirePressure.localizedPaths.en).toBe("/tire-pressure-calculator");
    expect(tirePressure.localizedPaths.nl).toBe("/bandenspanning-calculator");
    expect(tirePressure.legacyAliases).toContain("/pressure-calculator");
    expect(tirePressure.legacyAliases).toContain("/bandenspanning-calculator");
  });

  it("returns locale-specific public paths via the helper", () => {
    expect(getLocalizedPublicCalculatorPath("tire-pressure", "en")).toBe(
      "/tire-pressure-calculator"
    );
    expect(getLocalizedPublicCalculatorPath("tire-pressure", "nl")).toBe(
      "/bandenspanning-calculator"
    );
  });
});
