import { describe, expect, it } from "vitest";
import {
  formatBikeDate,
  formatBikeDistanceKm,
  formatBikeSpeedKph,
  formatImportedBikeDistance,
  getAlreadyImportedCandidateIds,
  parseStravaBikeCandidates,
  resolveBikeReadiness,
  resolveBikeUsageSummary,
  resolveStravaBikeOverviewCandidate,
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

describe("Strava bike overview helpers", () => {
  it("derives readiness from imported bike setup state", () => {
    expect(
      resolveBikeReadiness({
        imported: true,
        needsTypeConfirmation: true,
      })
    ).toBe("imported_needs_type_confirmation");
    expect(
      resolveBikeReadiness({
        imported: true,
        needsTypeConfirmation: false,
        currentGeometry: { stackMm: 560 },
        currentSetup: { saddleHeightMm: 745 },
      })
    ).toBe("fit_ready");
  });

  it("derives a usage summary from Strava activity data", () => {
    const summary = resolveBikeUsageSummary({
      _id: "bike-1",
      name: "Road Bike",
      stravaGearId: "gear-1",
      rideCount90d: 5,
      recentDistance90dMeters: 250000,
      avgRideDistance90dMeters: 50000,
      avgSpeed90dKph: 31.4,
      lastRideAt: 1_700_000_000_000,
      activitySummary: {
        recentDistance90dMeters: 250000,
        rideCount: 5,
        averageSpeedMps: 8.72,
        lastActivityAt: 1_700_000_000_000,
        dominantSportType: "Ride",
      },
    });

    expect(summary.rideCount).toBe(5);
    expect(summary.recentDistanceMeters).toBe(250000);
    expect(summary.avgRideDistanceMeters).toBe(50000);
    expect(summary.avgSpeedKph).toBe(31.4);
    expect(summary.explanation).toContain("5 rides");
  });

  it("resolves a full overview row from imported bike data", () => {
    const row = resolveStravaBikeOverviewCandidate({
      gear: {
        id: "gear-1",
        name: "Road Machine",
        brand: "Specialized",
        model: "Tarmac SL7",
        distanceMeters: 3255000,
      },
      localBike: {
        _id: "bike-1",
        name: "Road Machine",
        stravaGearId: "gear-1",
        currentGeometry: { stackMm: 560 },
        currentSetup: { saddleHeightMm: 745 },
        rideCount90d: 5,
        recentDistance90dMeters: 250000,
        avgRideDistance90dMeters: 50000,
        avgSpeed90dKph: 31.4,
        lastRideAt: 1_700_000_000_000,
        activitySummary: {
          recentDistance90dMeters: 250000,
          rideCount: 5,
          averageSpeedMps: 8.72,
          lastActivityAt: 1_700_000_000_000,
          dominantSportType: "Ride",
        },
      },
    });

    expect(row.imported).toBe(true);
    expect(row.readiness).toBe("fit_ready");
    expect(row.usage.rideCount).toBe(5);
  });

  it("formats date, distance and speed values for the overview", () => {
    expect(formatBikeDistanceKm(3255000)).toBe("3,255 km");
    expect(formatBikeSpeedKph(31.4)).toBe("31.4 kph");
    expect(formatBikeDate(1_700_000_000_000)).toContain("2023");
  });
});
