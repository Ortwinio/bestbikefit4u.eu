import { describe, expect, it } from "vitest";
import {
  getMissingStravaGearIds,
  getStravaAutoImportLoginSessionKey,
  getStravaAutoImportSessionKey,
} from "./strava-auto-import";

describe("strava auto import helpers", () => {
  it("builds a stable session key per user", () => {
    expect(getStravaAutoImportSessionKey("user_123")).toBe(
      "bbf4u:strava:auto-import:user_123"
    );
  });

  it("builds a stable session key per login session", () => {
    expect(getStravaAutoImportLoginSessionKey("user_123", 1_700_000_000_000)).toBe(
      "bbf4u:strava:auto-import:user_123:1700000000000"
    );
  });

  it("returns only missing Strava gear ids", () => {
    const missing = getMissingStravaGearIds(
      [
        { id: "strava-1", name: "Road Bike" },
        { id: "strava-2", name: "Commuter" },
        { id: "strava-3", name: "Gravel Bike" },
      ],
      [
        { _id: "bike-1", name: "Road Bike", stravaGearId: "strava-1" },
        { _id: "bike-2", name: "Old Commuter" },
      ]
    );

    expect(missing).toEqual(["strava-2", "strava-3"]);
  });

  it("avoids duplicate imports when a local bike already matches by name", () => {
    const missing = getMissingStravaGearIds(
      [{ id: "strava-1", name: "Road Bike" }],
      [{ _id: "bike-1", name: " Road   Bike  " }]
    );

    expect(missing).toEqual([]);
  });
});
