import { describe, expect, it } from "vitest";
import { buildPressureAlternates } from "./tirePressure";

describe("programmatic tire pressure alternates", () => {
  it("uses the English route as x-default for both locales", () => {
    const english = buildPressureAlternates(75, "road-bike", "en");
    const dutch = buildPressureAlternates(75, "road-bike", "nl");

    expect(english.languages["x-default"]).toBe(
      "https://bestbikefit4u.eu/en/tire-pressure/75kg-road-bike"
    );
    expect(dutch.languages["x-default"]).toBe(
      "https://bestbikefit4u.eu/en/tire-pressure/75kg-road-bike"
    );
    expect(dutch.canonical).toBe(
      "https://bestbikefit4u.eu/nl/bandenspanning/75kg-racefiets"
    );
  });
});
