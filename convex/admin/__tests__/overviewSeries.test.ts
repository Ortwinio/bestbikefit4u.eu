import { describe, expect, it } from "vitest";
import { buildOverviewSeries } from "../overviewSeries";

describe("buildOverviewSeries", () => {
  it("groups daily, weekly, and monthly counts into UTC buckets", () => {
    const now = Date.UTC(2026, 3, 14, 12, 0, 0);
    const series = buildOverviewSeries({
      userCreatedAt: [
        { timestamp: Date.UTC(2026, 3, 14, 8, 0, 0) },
        { timestamp: Date.UTC(2026, 3, 13, 9, 0, 0) },
        { timestamp: Date.UTC(2026, 2, 2, 9, 0, 0) },
      ],
      userLastLoginAt: [
        { timestamp: Date.UTC(2026, 3, 14, 10, 0, 0) },
        { timestamp: Date.UTC(2026, 3, 10, 10, 0, 0) },
      ],
      bikeCreatedAt: [
        { timestamp: Date.UTC(2026, 3, 14, 11, 0, 0) },
        { timestamp: Date.UTC(2026, 2, 31, 11, 0, 0) },
      ],
      now,
    });

    const latestDaily = series.daily.at(-1);
    const previousDaily = series.daily.at(-2);
    const latestWeekly = series.weekly.at(-1);
    const latestMonthly = series.monthly.at(-1);

    expect(latestDaily).toMatchObject({
      users: 1,
      logins: 1,
      bikes: 1,
    });
    expect(previousDaily).toMatchObject({
      users: 1,
      logins: 0,
      bikes: 0,
    });
    expect(latestWeekly).toMatchObject({
      users: 2,
      logins: 1,
      bikes: 1,
    });
    expect(latestMonthly).toMatchObject({
      users: 2,
      logins: 2,
      bikes: 1,
    });
  });

  it("drops timestamps outside the configured windows", () => {
    const now = Date.UTC(2026, 3, 14, 12, 0, 0);
    const series = buildOverviewSeries({
      userCreatedAt: [{ timestamp: Date.UTC(2025, 0, 1, 12, 0, 0) }],
      userLastLoginAt: [{ timestamp: null }],
      bikeCreatedAt: [{ timestamp: Date.UTC(2024, 0, 1, 12, 0, 0) }],
      now,
    });

    expect(series.daily.every((point) => point.users === 0 && point.logins === 0 && point.bikes === 0)).toBe(true);
    expect(series.weekly.every((point) => point.users === 0 && point.logins === 0 && point.bikes === 0)).toBe(true);
    expect(series.monthly.every((point) => point.users === 0 && point.logins === 0 && point.bikes === 0)).toBe(true);
  });
});
