export type OverviewSeriesInterval = "daily" | "weekly" | "monthly";

type TimestampedRecord = {
  timestamp: number | null | undefined;
};

export type OverviewSeriesPoint = {
  bucketStart: number;
  label: string;
  users: number;
  logins: number;
  bikes: number;
};

type IntervalConfig = {
  bucketCount: number;
  floor: (timestamp: number) => number;
  shift: (timestamp: number, amount: number) => number;
  label: (timestamp: number) => string;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

function startOfUtcDay(timestamp: number) {
  const date = new Date(timestamp);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function startOfUtcWeek(timestamp: number) {
  const dayStart = startOfUtcDay(timestamp);
  const date = new Date(dayStart);
  const weekOffset = (date.getUTCDay() + 6) % 7;
  return dayStart - weekOffset * DAY_MS;
}

function startOfUtcMonth(timestamp: number) {
  const date = new Date(timestamp);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

function shiftUtcMonth(timestamp: number, amount: number) {
  const date = new Date(timestamp);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1);
}

const intervalConfig: Record<OverviewSeriesInterval, IntervalConfig> = {
  daily: {
    bucketCount: 30,
    floor: startOfUtcDay,
    shift: (timestamp, amount) => timestamp + amount * DAY_MS,
    label: (timestamp) =>
      new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(new Date(timestamp)),
  },
  weekly: {
    bucketCount: 12,
    floor: startOfUtcWeek,
    shift: (timestamp, amount) => timestamp + amount * WEEK_MS,
    label: (timestamp) =>
      new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(new Date(timestamp)),
  },
  monthly: {
    bucketCount: 12,
    floor: startOfUtcMonth,
    shift: shiftUtcMonth,
    label: (timestamp) =>
      new Intl.DateTimeFormat("en", {
        month: "short",
        year: "2-digit",
        timeZone: "UTC",
      }).format(new Date(timestamp)),
  },
};

function buildBuckets(interval: OverviewSeriesInterval, now: number) {
  const config = intervalConfig[interval];
  const currentBucketStart = config.floor(now);

  return Array.from({ length: config.bucketCount }, (_, index) => {
    const offset = index - (config.bucketCount - 1);
    const bucketStart = config.shift(currentBucketStart, offset);
    return {
      bucketStart,
      label: config.label(bucketStart),
      users: 0,
      logins: 0,
      bikes: 0,
    } satisfies OverviewSeriesPoint;
  });
}

function applySeriesCounts(
  points: OverviewSeriesPoint[],
  interval: OverviewSeriesInterval,
  rows: TimestampedRecord[],
  key: "users" | "logins" | "bikes"
) {
  const config = intervalConfig[interval];
  const firstBucketStart = points[0]?.bucketStart ?? 0;
  const lastBucketStart = points[points.length - 1]?.bucketStart ?? 0;
  const nextBucketStart = config.shift(lastBucketStart, 1);
  const bucketIndex = new Map(points.map((point, index) => [point.bucketStart, index]));

  for (const row of rows) {
    const timestamp = row.timestamp ?? null;
    if (!timestamp || timestamp < firstBucketStart || timestamp >= nextBucketStart) {
      continue;
    }

    const bucketStart = config.floor(timestamp);
    const index = bucketIndex.get(bucketStart);
    if (index === undefined) {
      continue;
    }

    points[index][key] += 1;
  }
}

export function buildOverviewSeries({
  userCreatedAt,
  userLastLoginAt,
  bikeCreatedAt,
  now = Date.now(),
}: {
  userCreatedAt: TimestampedRecord[];
  userLastLoginAt: TimestampedRecord[];
  bikeCreatedAt: TimestampedRecord[];
  now?: number;
}) {
  const intervals: OverviewSeriesInterval[] = ["daily", "weekly", "monthly"];

  return Object.fromEntries(
    intervals.map((interval) => {
      const points = buildBuckets(interval, now);
      applySeriesCounts(points, interval, userCreatedAt, "users");
      applySeriesCounts(points, interval, userLastLoginAt, "logins");
      applySeriesCounts(points, interval, bikeCreatedAt, "bikes");
      return [interval, points];
    })
  ) as Record<OverviewSeriesInterval, OverviewSeriesPoint[]>;
}
