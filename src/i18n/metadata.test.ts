import { describe, expect, it } from "vitest";
import { buildLocaleAlternates, buildLocalizedAlternates } from "./metadata";

describe("metadata alternates", () => {
  it("builds reciprocal locale alternates for localized static routes", () => {
    const alternates = buildLocaleAlternates("/guides", "nl");

    expect(alternates.canonical).toBe("https://bestbikefit4u.eu/nl/guides");
    expect(alternates.languages?.en).toBe("https://bestbikefit4u.eu/en/guides");
    expect(alternates.languages?.nl).toBe("https://bestbikefit4u.eu/nl/guides");
    expect(alternates.languages?.["x-default"]).toBe("https://bestbikefit4u.eu/en/guides");
  });

  it("supports route families whose default locale stays on a different localized path", () => {
    const alternates = buildLocalizedAlternates(
      {
        en: "/en/tire-pressure/75kg-road-bike",
        nl: "/nl/bandenspanning/75kg-racefiets",
      },
      "nl",
      "en"
    );

    expect(alternates.canonical).toBe(
      "https://bestbikefit4u.eu/nl/bandenspanning/75kg-racefiets"
    );
    expect(alternates.languages?.en).toBe(
      "https://bestbikefit4u.eu/en/tire-pressure/75kg-road-bike"
    );
    expect(alternates.languages?.["x-default"]).toBe(
      "https://bestbikefit4u.eu/en/tire-pressure/75kg-road-bike"
    );
  });
});
