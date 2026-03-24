import { describe, expect, it } from "vitest";
import type { Id } from "../../_generated/dataModel";
import {
  getStravaBikeReadiness,
  inferBikeRole,
  isSupportedRideActivity,
  mapStravaFrameTypeToBikeType,
  parseStravaGearSummaryJson,
  summarizeBikeActivityGroup,
  summarizeStravaBikeOverviewActivities,
  type BikeActivityUsageInput,
} from "../strava";

describe("strava integration helpers", () => {
  it("maps known frame types to the expected bike type", () => {
    expect(mapStravaFrameTypeToBikeType(1)).toEqual({
      bikeType: "mountain",
      bikeTypeSource: "strava_frame_type",
      needsTypeConfirmation: false,
    });
    expect(mapStravaFrameTypeToBikeType(4)).toEqual({
      bikeType: "tt_triathlon",
      bikeTypeSource: "strava_frame_type",
      needsTypeConfirmation: false,
    });
  });

  it("uses a safe provisional bike type when frame type is unknown", () => {
    expect(mapStravaFrameTypeToBikeType(undefined)).toEqual({
      bikeType: "hybrid",
      bikeTypeSource: "fallback_pending_confirmation",
      needsTypeConfirmation: true,
    });
  });

  it("parses cached Strava gear summary json safely", () => {
    expect(
      parseStravaGearSummaryJson(
        JSON.stringify([
          { id: "b123", name: "Road", primary: true, distanceMeters: 12345 },
        ])
      )
    ).toEqual([
      { id: "b123", name: "Road", primary: true, distanceMeters: 12345 },
    ]);
    expect(parseStravaGearSummaryJson("not-json")).toBeNull();
  });

  it("recognizes supported ride-like activities", () => {
    expect(isSupportedRideActivity({ sport_type: "GravelRide", type: "Ride" })).toBe(true);
    expect(isSupportedRideActivity({ sport_type: "Run", type: "Run" })).toBe(false);
  });

  it("summarizes activity groups deterministically", () => {
    const bikeId = "bike-1" as Id<"bikes">;
    const activities: BikeActivityUsageInput[] = [
      {
        bikeId,
        sportType: "Ride",
        distanceMeters: 40000,
        movingTimeSec: 3600,
        elapsedTimeSec: 3700,
        elevationGainMeters: 220,
        trainer: false,
        commute: false,
        averageSpeed: 11.1,
        maxSpeed: 15.5,
        startDate: 1_700_000_000_000,
      },
      {
        bikeId,
        sportType: "Ride",
        distanceMeters: 38000,
        movingTimeSec: 3300,
        elapsedTimeSec: 3400,
        elevationGainMeters: 180,
        trainer: false,
        commute: false,
        averageSpeed: 11.3,
        maxSpeed: 16.2,
        startDate: 1_700_100_000_000,
      },
    ];

    const summary = summarizeBikeActivityGroup(bikeId, activities);

    expect(summary.rideCount90d).toBe(2);
    expect(summary.recentDistance90dMeters).toBe(78000);
    expect(summary.averageDurationSec).toBeCloseTo(3450, 5);
    expect(summary.trainerRatio).toBe(0);
    expect(summary.commuteRatio).toBe(0);
    expect(summary.dominantSportType).toBe("Ride");
    expect(summary.inferredBikeRole).toBe(inferBikeRole({
      rideCount90d: 2,
      averageDurationSec: summary.averageDurationSec,
      trainerRatio: summary.trainerRatio,
      commuteRatio: summary.commuteRatio,
      dominantSportType: summary.dominantSportType,
      averageSpeedMps: summary.averageSpeedMps,
      climbingMetersPerKm: summary.climbingMetersPerKm,
    }));
  });

  it("summarizes recent overview metrics for a Strava bike", () => {
    const summary = summarizeStravaBikeOverviewActivities([
      {
        distanceKm: 40,
        movingTimeSec: 3600,
        startAt: 1_700_000_000_000,
      },
      {
        distanceKm: 20,
        movingTimeSec: 1800,
        startAt: 1_700_100_000_000,
      },
    ]);

    expect(summary).toEqual({
      rideCountWindow: 2,
      totalDistanceWindowMeters: 60000,
      avgRideDistanceWindowMeters: 30000,
      avgSpeedWindowKph: 40,
      lastRideAt: 1_700_100_000_000,
    });
  });

  it("computes readiness states for imported and unimported bikes", () => {
    expect(getStravaBikeReadiness({ importedBike: null })).toBe(
      "available_in_strava"
    );
    expect(
      getStravaBikeReadiness({
        importedBike: {
          needsTypeConfirmation: true,
        },
      })
    ).toBe("imported_needs_type_confirmation");
    expect(
      getStravaBikeReadiness({
        importedBike: {
          needsTypeConfirmation: false,
          currentGeometry: {},
        },
      })
    ).toBe("imported_needs_fit_setup");
    expect(
      getStravaBikeReadiness({
        importedBike: {
          needsTypeConfirmation: false,
          currentGeometry: { frameSize: "56" },
        },
      })
    ).toBe("fit_ready");
  });
});
