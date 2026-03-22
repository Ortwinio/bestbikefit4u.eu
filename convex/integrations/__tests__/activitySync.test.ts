import { describe, expect, it } from "vitest";
import type { Id } from "../../_generated/dataModel";
import {
  matchActivityToBike,
  normalizeStravaActivity,
  summarizeBikeActivities,
  type BikeCandidate,
} from "../activitySync";

describe("activity sync helpers", () => {
  it("keeps activities without gear ids in the no_gear bucket", () => {
    const activity = normalizeStravaActivity(
      {
        id: 42,
        name: "Morning ride",
        type: "Ride",
        sport_type: "Ride",
        start_date: "2025-01-01T08:00:00Z",
        distance: 25000,
        moving_time: 3600,
        elapsed_time: 3700,
      },
      null
    );

    expect(activity.matchStatus).toBe("no_gear");
    expect(activity.gearId).toBeUndefined();
    expect(activity.distanceKm).toBe(25);
  });

  it("matches gear to bikes by stable identifiers before inference", () => {
    const bikeId = "bike-1" as Id<"bikes">;
    const bike: BikeCandidate = {
      _id: bikeId,
      name: "Road Rocket",
      bikeType: "road",
      brand: "Cervelo",
      model: "R5",
    };

    const match = matchActivityToBike(
      {
        stravaActivityId: "a1",
        gearId: "gear-1",
        gearName: "Cervelo R5 Road Rocket",
        activityName: "Ride",
        activityType: "Ride",
        startAt: Date.now(),
        distanceKm: 38,
        movingTimeSec: 4200,
        matchStatus: "unmatched_gear",
        matchConfidence: 0,
      },
      [bike]
    );

    expect(match.bikeId).toBe(bikeId);
    expect(match.matchStatus).toBe("matched_gear");
    expect(match.matchConfidence).toBeGreaterThan(0.65);
  });

  it("infers a commute-oriented role and patch from bike activity summaries", () => {
    const bikeId = "bike-2" as Id<"bikes">;
    const bike: BikeCandidate = {
      _id: bikeId,
      name: "City Commuter",
      bikeType: "hybrid",
    };
    const activities = [
      {
        stravaActivityId: "a1",
        activityName: "Commute home",
        activityType: "Ride",
        sportType: "Ride",
        startAt: 1_700_000_000_000,
        distanceKm: 12,
        movingTimeSec: 1800,
        commute: true,
        trainer: false,
        matchStatus: "matched_gear" as const,
        matchConfidence: 0.9,
      },
      {
        stravaActivityId: "a2",
        activityName: "Commute out",
        activityType: "Ride",
        sportType: "Ride",
        startAt: 1_700_100_000_000,
        distanceKm: 11,
        movingTimeSec: 1740,
        commute: true,
        trainer: false,
        matchStatus: "matched_gear" as const,
        matchConfidence: 0.9,
      },
    ];

    const result = summarizeBikeActivities({
      bike,
      activities,
      syncedAt: 1_700_200_000_000,
    });

    expect(result.summary.rideCount).toBe(2);
    expect(result.summary.inferredBikeRole).toBe("commute");
    expect(result.summary.inferredRidingStyle).toBe("commuting");
    expect(result.summary.inferredPrimaryGoal).toBe("comfort");
    expect(result.inferredPatch.ridingStyle).toBe("commuting");
  });
});
