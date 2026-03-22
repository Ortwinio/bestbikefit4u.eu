import { describe, expect, it } from "vitest";
import {
  formatImportedBikeDistance,
  getAlreadyImportedCandidateIds,
  parseStravaBikeCandidates,
} from "./stravaBikeImport";

describe("parseStravaBikeCandidates", () => {
  it("parses supported bike candidate shapes and maps frame types", () => {
    const { candidates, parseError } = parseStravaBikeCandidates(
      JSON.stringify({
        bikes: [
          {
            id: "gear-1",
            name: "Road Machine",
            brand_name: "Specialized",
            model_name: "Tarmac SL7",
            distance: 3255000,
            primary: true,
            frame_type: 3,
          },
          {
            gear_id: "gear-2",
            name: "Mystery Bike",
            needsTypeConfirmation: true,
          },
        ],
      })
    );

    expect(parseError).toBe(false);
    expect(candidates).toEqual([
      {
        id: "gear-1",
        name: "Road Machine",
        brand: "Specialized",
        model: "Tarmac SL7",
        distanceMeters: 3255000,
        primary: true,
        bikeType: "road",
        ambiguous: false,
        matchedBikeId: undefined,
      },
      {
        id: "gear-2",
        name: "Mystery Bike",
        brand: undefined,
        model: undefined,
        distanceMeters: undefined,
        primary: undefined,
        bikeType: undefined,
        ambiguous: true,
        matchedBikeId: undefined,
      },
    ]);
  });

  it("reports invalid JSON as a parse error", () => {
    const result = parseStravaBikeCandidates("{");
    expect(result).toEqual({ candidates: [], parseError: true });
  });
});

describe("getAlreadyImportedCandidateIds", () => {
  it("matches imported bikes by exact signature or explicit bike id", () => {
    const imported = getAlreadyImportedCandidateIds(
      [
        { id: "gear-1", name: "Road Machine", brand: "Specialized", model: "Tarmac SL7" },
        { id: "gear-2", name: "Gravel Rig", matchedBikeId: "bike-local-2" },
      ],
      [
        {
          _id: "bike-local-1",
          name: "Road Machine",
          brand: "Specialized",
          model: "Tarmac SL7",
        },
        {
          _id: "bike-local-2",
          name: "Anything",
        },
      ]
    );

    expect(Array.from(imported).sort()).toEqual(["gear-1", "gear-2"]);
  });
});

describe("formatImportedBikeDistance", () => {
  it("formats meters as rounded kilometers", () => {
    expect(formatImportedBikeDistance(3255000)).toBe("3,255 km");
  });
});
