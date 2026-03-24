import type { Id } from "../_generated/dataModel";

export type StravaGearSummary = {
  id: string;
  name: string;
  primary: boolean;
  distanceMeters: number;
}[];

export type StravaBikeType =
  | "road"
  | "gravel"
  | "mountain"
  | "hybrid"
  | "tt_triathlon"
  | "cyclocross"
  | "touring"
  | "city";

export type StravaBikeTypeSource =
  | "user"
  | "strava_frame_type"
  | "inferred_from_usage"
  | "admin_matched"
  | "fallback_pending_confirmation";

export type StravaBikeImportSource = "manual" | "strava" | "admin_import";

export type StravaBikeRole =
  | "endurance_road"
  | "race_road"
  | "gravel"
  | "mountain"
  | "tt_triathlon"
  | "training"
  | "commute";

export interface StravaGearDetail {
  id: string;
  name: string;
  primary: boolean;
  distanceMeters: number;
  brandName?: string;
  modelName?: string;
  description?: string;
  frameType?: number;
}

export interface StravaActivity {
  id?: number;
  name?: string;
  sport_type: string;
  type?: string;
  start_date?: string;
  distance?: number;
  moving_time?: number;
  elapsed_time?: number;
  total_elevation_gain?: number;
  trainer?: boolean;
  commute?: boolean;
  gear_id?: string;
  device_name?: string;
  average_speed?: number;
  max_speed?: number;
  average_cadence?: number;
  average_watts?: number;
  weighted_average_watts?: number;
  average_heartrate?: number;
  max_heartrate?: number;
}

export interface BikeActivityUsageInput {
  bikeId: Id<"bikes">;
  sportType: string;
  distanceMeters: number;
  movingTimeSec: number;
  elapsedTimeSec: number;
  elevationGainMeters?: number | null;
  trainer: boolean;
  commute: boolean;
  averageSpeed?: number | null;
  maxSpeed?: number | null;
  startDate: number;
}

export interface BikeUsageSummary {
  bikeId: Id<"bikes">;
  recentDistance90dMeters: number;
  rideCount90d: number;
  averageDurationSec: number;
  trainerRatio: number;
  commuteRatio: number;
  climbingMetersPerKm: number;
  dominantSportType: string;
  averageSpeedMps: number;
  maxSpeedMps: number;
  inferredBikeRole: StravaBikeRole;
}

export interface StravaImportedBikeRecord {
  _id: Id<"bikes">;
  stravaGearId?: string;
  bikeType?: StravaBikeType;
  bikeTypeSource?: StravaBikeTypeSource;
  needsTypeConfirmation?: boolean;
  source?: StravaBikeImportSource;
  ridingStyle?: "recreational" | "fitness" | "sportive" | "racing" | "commuting" | "touring";
  primaryGoal?: "comfort" | "balanced" | "performance" | "aerodynamics";
}

export type StravaBikeReadiness =
  | "available_in_strava"
  | "imported_needs_type_confirmation"
  | "imported_needs_fit_setup"
  | "fit_ready";

export interface StravaBikeOverviewActivitySummary {
  rideCountWindow: number;
  totalDistanceWindowMeters: number;
  avgRideDistanceWindowMeters?: number;
  avgSpeedWindowKph?: number;
  lastRideAt?: number;
}

function mostCommon(values: string[]): string {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  let winner = "";
  let winnerCount = 0;
  for (const [value, count] of counts) {
    if (count > winnerCount) {
      winner = value;
      winnerCount = count;
    }
  }

  return winner;
}

function average(values: number[]): number {
  return values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function parseStravaGearSummaryJson(
  value: string | null | undefined
): StravaGearSummary | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return null;
    }

    const entries = parsed
      .map((entry) => {
        if (
          typeof entry !== "object" ||
          entry === null ||
          !("id" in entry) ||
          !("name" in entry)
        ) {
          return null;
        }

        const bike = entry as Partial<StravaGearSummary[number]>;
        return {
          id: String(bike.id ?? ""),
          name: String(bike.name ?? ""),
          primary: Boolean(bike.primary),
          distanceMeters: Number(bike.distanceMeters ?? 0),
        };
      })
      .filter((entry): entry is StravaGearSummary[number] => entry !== null);

    return entries;
  } catch {
    return null;
  }
}

export function mapStravaFrameTypeToBikeType(
  frameType?: number | null
): {
  bikeType: StravaBikeType;
  bikeTypeSource: StravaBikeTypeSource;
  needsTypeConfirmation: boolean;
} {
  switch (frameType) {
    case 1:
      return {
        bikeType: "mountain",
        bikeTypeSource: "strava_frame_type",
        needsTypeConfirmation: false,
      };
    case 2:
      return {
        bikeType: "cyclocross",
        bikeTypeSource: "strava_frame_type",
        needsTypeConfirmation: false,
      };
    case 3:
      return {
        bikeType: "road",
        bikeTypeSource: "strava_frame_type",
        needsTypeConfirmation: false,
      };
    case 4:
      return {
        bikeType: "tt_triathlon",
        bikeTypeSource: "strava_frame_type",
        needsTypeConfirmation: false,
      };
    default:
      return {
        bikeType: "hybrid",
        bikeTypeSource: "fallback_pending_confirmation",
        needsTypeConfirmation: true,
      };
  }
}

export function fetchStravaGearSummaryEntry(
  gear: {
    id: string;
    name?: string | null;
    primary?: boolean | null;
    distance?: number | null;
  }
): StravaGearSummary[number] {
  return {
    id: gear.id,
    name: gear.name ?? "",
    primary: Boolean(gear.primary),
    distanceMeters: gear.distance ?? 0,
  };
}

export async function fetchStravaAthlete(accessToken: string): Promise<{
  athleteName?: string;
  athleteAvatarUrl?: string;
  athleteWeight?: number;
  bikes: StravaGearSummary;
}> {
  const response = await fetch("https://www.strava.com/api/v3/athlete", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Strava athlete fetch failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    firstname?: string;
    lastname?: string;
    profile?: string;
    weight?: number;
    bikes?: Array<{
      id: string;
      name: string;
      primary?: boolean;
      distance?: number;
    }>;
  };

  return {
    athleteName: [payload.firstname, payload.lastname].filter(Boolean).join(" ") || undefined,
    athleteAvatarUrl: payload.profile,
    athleteWeight: payload.weight,
    bikes: (payload.bikes ?? []).map(fetchStravaGearSummaryEntry),
  };
}

export async function fetchStravaGearDetail(accessToken: string, gearId: string): Promise<StravaGearDetail> {
  const response = await fetch(`https://www.strava.com/api/v3/gear/${gearId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Strava gear fetch failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    id: string;
    name: string;
    primary?: boolean;
    distance?: number;
    brand_name?: string;
    model_name?: string;
    description?: string;
    frame_type?: number;
  };

  return {
    id: payload.id,
    name: payload.name,
    primary: Boolean(payload.primary),
    distanceMeters: payload.distance ?? 0,
    brandName: payload.brand_name,
    modelName: payload.model_name,
    description: payload.description,
    frameType: payload.frame_type,
  };
}

export async function fetchStravaActivities(args: {
  accessToken: string;
  afterUnixSeconds: number;
  page: number;
  perPage?: number;
}): Promise<StravaActivity[]> {
  const search = new URLSearchParams({
    after: String(args.afterUnixSeconds),
    page: String(args.page),
    per_page: String(args.perPage ?? 50),
  });

  const response = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?${search.toString()}`,
    {
      headers: { Authorization: `Bearer ${args.accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Strava activities fetch failed with status ${response.status}`);
  }

  return (await response.json()) as StravaActivity[];
}

export function mapStravaActivityToBikeActivityRecord(activity: StravaActivity) {
  return {
    stravaActivityId: String(activity.id ?? ""),
    name: activity.name ?? "Untitled activity",
    sportType: activity.sport_type,
    type: activity.type ?? activity.sport_type,
    startDate: new Date(activity.start_date ?? Date.now()).getTime(),
    distanceMeters: activity.distance ?? 0,
    movingTimeSec: activity.moving_time ?? 0,
    elapsedTimeSec: activity.elapsed_time ?? 0,
    elevationGainMeters: activity.total_elevation_gain ?? undefined,
    trainer: Boolean(activity.trainer),
    commute: Boolean(activity.commute),
    stravaGearId: activity.gear_id ?? undefined,
    deviceName: activity.device_name ?? undefined,
    averageSpeed: activity.average_speed ?? undefined,
    maxSpeed: activity.max_speed ?? undefined,
    averageCadence: activity.average_cadence ?? undefined,
    averageWatts: activity.average_watts ?? undefined,
    weightedAverageWatts: activity.weighted_average_watts ?? undefined,
    averageHeartrate: activity.average_heartrate ?? undefined,
    maxHeartrate: activity.max_heartrate ?? undefined,
  };
}

export function inferBikeRole(params: {
  rideCount90d: number;
  averageDurationSec: number;
  trainerRatio: number;
  commuteRatio: number;
  dominantSportType: string;
  averageSpeedMps: number;
  climbingMetersPerKm: number;
}): StravaBikeRole {
  const sport = params.dominantSportType.toLowerCase();

  if (params.commuteRatio >= 0.5 || sport.includes("commute")) {
    return "commute";
  }

  if (params.trainerRatio >= 0.6 || sport.includes("virtual")) {
    return "training";
  }

  if (sport.includes("mountain") || sport.includes("mtb")) {
    return "mountain";
  }

  if (sport.includes("gravel") || sport.includes("cyclocross")) {
    return "gravel";
  }

  if (sport.includes("triathlon") || sport.includes("tt")) {
    return "tt_triathlon";
  }

  if (
    params.averageSpeedMps >= 8.2 &&
    params.averageDurationSec <= 5400 &&
    params.climbingMetersPerKm <= 15
  ) {
    return "race_road";
  }

  if (params.climbingMetersPerKm >= 12 || params.averageDurationSec >= 5400) {
    return "endurance_road";
  }

  if (params.rideCount90d <= 2 && params.averageSpeedMps >= 7.5) {
    return "race_road";
  }

  return "endurance_road";
}

export function summarizeBikeActivityGroup(
  bikeId: Id<"bikes">,
  activities: BikeActivityUsageInput[]
): BikeUsageSummary {
  const sorted = [...activities].sort((a, b) => b.startDate - a.startDate);
  const recentDistance90dMeters = sorted.reduce(
    (sum, activity) => sum + activity.distanceMeters,
    0
  );
  const rideCount90d = sorted.length;
  const averageDurationSec = rideCount90d
    ? sorted.reduce((sum, activity) => sum + activity.movingTimeSec, 0) /
      rideCount90d
    : 0;
  const trainerRatio = rideCount90d
    ? sorted.filter((activity) => activity.trainer).length / rideCount90d
    : 0;
  const commuteRatio = rideCount90d
    ? sorted.filter((activity) => activity.commute).length / rideCount90d
    : 0;
  const totalElevationGainMeters = sorted.reduce(
    (sum, activity) => sum + (activity.elevationGainMeters ?? 0),
    0
  );
  const climbingMetersPerKm =
    recentDistance90dMeters > 0
      ? totalElevationGainMeters / (recentDistance90dMeters / 1000)
      : 0;
  const dominantSportType = mostCommon(sorted.map((activity) => activity.sportType));
  const speedSamplesMps = sorted
    .map((activity) =>
      typeof activity.averageSpeed === "number"
        ? activity.averageSpeed / 3.6
        : undefined
    )
    .filter((value): value is number => typeof value === "number");
  const averageSpeedMps = speedSamplesMps.length > 0
    ? average(speedSamplesMps)
    : recentDistance90dMeters / Math.max(averageDurationSec * rideCount90d, 1);
  const maxSpeedMps = Math.max(
    0,
    ...sorted.map((activity) =>
      typeof activity.maxSpeed === "number" ? activity.maxSpeed / 3.6 : 0
    )
  );

  return {
    bikeId,
    recentDistance90dMeters,
    rideCount90d,
    averageDurationSec,
    trainerRatio,
    commuteRatio,
    climbingMetersPerKm,
    dominantSportType,
    averageSpeedMps,
    maxSpeedMps,
    inferredBikeRole: inferBikeRole({
      rideCount90d,
      averageDurationSec,
      trainerRatio,
      commuteRatio,
      dominantSportType,
      averageSpeedMps,
      climbingMetersPerKm,
    }),
  };
}

export function summarizeStravaBikeOverviewActivities(
  activities: Array<{
    distanceKm: number;
    movingTimeSec: number;
    startAt: number;
  }>
): StravaBikeOverviewActivitySummary {
  if (activities.length === 0) {
    return {
      rideCountWindow: 0,
      totalDistanceWindowMeters: 0,
    };
  }

  const rideCountWindow = activities.length;
  const totalDistanceWindowMeters = Math.round(
    activities.reduce((sum, activity) => sum + activity.distanceKm * 1000, 0)
  );
  const totalMovingTimeSec = activities.reduce(
    (sum, activity) => sum + activity.movingTimeSec,
    0
  );

  return {
    rideCountWindow,
    totalDistanceWindowMeters,
    avgRideDistanceWindowMeters: Math.round(
      totalDistanceWindowMeters / Math.max(rideCountWindow, 1)
    ),
    avgSpeedWindowKph:
      totalMovingTimeSec > 0
        ? Number(
            (
              (totalDistanceWindowMeters / 1000) /
              (totalMovingTimeSec / 3600)
            ).toFixed(1)
          )
        : undefined,
    lastRideAt: [...activities].sort((a, b) => b.startAt - a.startAt)[0]?.startAt,
  };
}

export function getStravaBikeReadiness(input: {
  importedBike: {
    needsTypeConfirmation?: boolean | null;
    currentGeometry?: { frameSize?: string | null } | null;
    geometryRecordId?: Id<"geometry_records"> | null;
    currentSetup?: unknown;
  } | null;
}): StravaBikeReadiness {
  if (!input.importedBike) {
    return "available_in_strava";
  }

  if (input.importedBike.needsTypeConfirmation) {
    return "imported_needs_type_confirmation";
  }

  const hasFrameSize = Boolean(input.importedBike.currentGeometry?.frameSize);
  const hasGeometryRecord = Boolean(input.importedBike.geometryRecordId);
  const hasSetup = Boolean(input.importedBike.currentSetup);

  if (!hasFrameSize && !hasGeometryRecord && !hasSetup) {
    return "imported_needs_fit_setup";
  }

  return "fit_ready";
}

export function isRideLikeActivity(activity: StravaActivity) {
  return [
    "Ride",
    "VirtualRide",
    "GravelRide",
    "MountainBikeRide",
    "EMountainBikeRide",
    "EBikeRide",
  ].includes(activity.sport_type);
}

export const isSupportedRideActivity = isRideLikeActivity;
