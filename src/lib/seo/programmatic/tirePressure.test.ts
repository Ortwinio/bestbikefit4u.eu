import { describe, expect, it } from "vitest";
import { buildPressureAlternates } from "./tirePressure";

describe("programmatic tire pressure alternates", () => {
  it("uses the English route as x-default for both locales", () => {
    const english = buildPressureAlternates(75, "road-bike", "en");
    const dutch = buildPressureAlternates(75, "road-bike", "nl");

    expect(english.languages["x-default"]).toBe(
      "https://bikefitboost.com/en/tire-pressure/75kg-road-bike"
    );
    expect(dutch.languages["x-default"]).toBe(
      "https://bikefitboost.com/en/tire-pressure/75kg-road-bike"
    );
    expect(dutch.canonical).toBe(
      "https://bikefitboost.com/nl/bandenspanning/75kg-racefiets"
    );
  });
});

import { calculateBasicPressure } from "@/lib/pressure-engine";
import { EN_BIKE_TYPES, WEIGHT_STEPS, buildPressureBikeTable, buildPressureInput,
  getPressureBikeEntries, getPressureBikePath, parsePressureBikeSlug, buildPressureBikeAlternates } from "./tirePressure";

describe("consolidated bike pressure pages", () => {
  it.each(EN_BIKE_TYPES)("preserves all ten real engine rows and both tube setups for %s", bikeType => {
    const rows = buildPressureBikeTable(bikeType);
    expect(rows.map(row => row.weightKg)).toEqual([...WEIGHT_STEPS]);
    for (const row of rows) {
      expect(row.tubeless).toEqual(calculateBasicPressure(buildPressureInput(row.weightKg, bikeType, "tubeless")));
      expect(row.innerTube).toEqual(calculateBasicPressure(buildPressureInput(row.weightKg, bikeType, "inner_tube")));
    }
  });
  it("has precisely three reciprocal localized canonical destinations", () => {
    expect(getPressureBikeEntries()).toHaveLength(3);
    for (const bike of EN_BIKE_TYPES) {
      const en = buildPressureBikeAlternates(bike, "en");
      const nl = buildPressureBikeAlternates(bike, "nl");
      expect(en.languages).toEqual(nl.languages);
      expect(en.canonical).toBe(en.languages.en);
      expect(nl.canonical).toBe(nl.languages.nl);
      expect(en.languages["x-default"]).toBe(en.canonical);
      expect(parsePressureBikeSlug(getPressureBikePath(bike, "nl").split("/").at(-1)!, "nl")).toBe(bike);
    }
    expect(parsePressureBikeSlug("mtb", "nl")).toBeNull();
    expect(parsePressureBikeSlug("70kg-road-bike", "en")).toBeNull();
  });
});
