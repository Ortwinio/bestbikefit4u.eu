import type { Id } from "../_generated/dataModel";

export type RidingStyle =
  | "recreational"
  | "fitness"
  | "sportive"
  | "racing"
  | "commuting"
  | "touring";

export type PrimaryGoal = "comfort" | "balanced" | "performance" | "aerodynamics";
export type Discipline = "road" | "gravel" | "mtb" | "tt";

export interface BikeCandidate {
  _id: Id<"bikes">;
  name: string;
  bikeType: "road" | "gravel" | "mountain" | "hybrid" | "tt_triathlon" | "cyclocross" | "touring" | "city";
  brand?: string | null;
  model?: string | null;
  discipline?: Discipline | null;
  ridingStyle?: RidingStyle | null;
  primaryGoal?: PrimaryGoal | null;
  activitySummary?: unknown;
}

export interface GearDetails {
  id: string;
  name?: string | null;
  brandName?: string | null;
  modelName?: string | null;
}

export interface NormalizedBikeActivity {
  stravaActivityId: string;
  gearId?: string;
  gearName?: string;
  gearBrand?: string;
  gearModel?: string;
  activityName: string;
  activityType: string;
  sportType?: string;
  startAt: number;
  distanceKm: number;
  movingTimeSec: number;
  elapsedTimeSec?: number;
  elevationGainM?: number;
  commute?: boolean;
  trainer?: boolean;
  manual?: boolean;
  bikeId?: Id<"bikes">;
  matchStatus: "matched_gear" | "unmatched_gear" | "no_gear";
  matchConfidence: number;
  matchReason?: string;
}

export interface ActivitySummary {
  source: "strava_v1_1";
  syncedAt: number;
  activityCount: number;
  rideCount: number;
  totalDistanceKm: number;
  totalMovingTimeSec: number;
  totalElevationGainM?: number;
  lastActivityAt?: number;
  lastActivityName?: string;
  lastActivityType?: string;
  matchedGearCount: number;
  unmatchedGearCount: number;
  noGearCount: number;
  inferredBikeRole?:
    | "endurance_road"
    | "race_road"
    | "gravel"
    | "mountain"
    | "tt_triathlon"
    | "training"
    | "commute";
  inferredRidingStyle?: RidingStyle;
  inferredPrimaryGoal?: PrimaryGoal;
  inferredDiscipline?: Discipline;
  inferenceConfidence: number;
}

const KNOWN_STYLE_TOKENS: Record<RidingStyle, string[]> = {
  recreational: ["recreational", "casual", "easy"],
  fitness: ["fitness", "training", "trainer", "indoor"],
  sportive: ["sportive", "group", "endurance", "club"],
  racing: ["race", "racing", "interval", "fast"],
  commuting: ["commute", "commuting", "city", "urban"],
  touring: ["tour", "touring", "adventure", "long"],
};

const KNOWN_GOAL_TOKENS: Record<PrimaryGoal, string[]> = {
  comfort: ["comfort", "commute", "touring"],
  balanced: ["balanced", "endurance", "fitness"],
  performance: ["performance", "race", "racing", "fast"],
  aerodynamics: ["aero", "aerodynamic", "tt", "time trial"],
};

const KNOWN_DISCIPLINE_TOKENS: Record<Discipline, string[]> = {
  road: ["road", "endurance", "race"],
  gravel: ["gravel", "allroad", "mixed"],
  mtb: ["mtb", "mountain", "trail", "offroad"],
  tt: ["tt", "tri", "time trial", "aero"],
};

function normalizeText(value: string | null | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function hasAnyToken(text: string, tokens: string[]): boolean {
  return tokens.some((token) => text.includes(token));
}

function countMatches<T>(items: T[], predicate: (item: T) => boolean): number {
  return items.reduce((count, item) => count + (predicate(item) ? 1 : 0), 0);
}

function activityToken(activity: Pick<NormalizedBikeActivity, "activityType" | "sportType" | "activityName">): string {
  return normalizeText([activity.sportType, activity.activityType, activity.activityName].filter(Boolean).join(" "));
}

export function normalizeStravaActivity(
  activity: {
    id: number | string;
    name?: string | null;
    type?: string | null;
    sport_type?: string | null;
    gear_id?: string | null;
    commute?: boolean | null;
    trainer?: boolean | null;
    manual?: boolean | null;
    start_date?: string | null;
    start_date_local?: string | null;
    moving_time?: number | null;
    elapsed_time?: number | null;
    distance?: number | null;
    total_elevation_gain?: number | null;
  },
  gear: GearDetails | null
): NormalizedBikeActivity {
  const startAt = Date.parse(activity.start_date_local ?? activity.start_date ?? "") || Date.now();
  const distanceKm = Math.max(0, Number(activity.distance ?? 0) / 1000);

  return {
    stravaActivityId: String(activity.id),
    gearId: activity.gear_id ?? undefined,
    gearName: gear?.name ?? undefined,
    gearBrand: gear?.brandName ?? undefined,
    gearModel: gear?.modelName ?? undefined,
    activityName: activity.name ?? "Untitled activity",
    activityType: activity.type ?? "Ride",
    sportType: activity.sport_type ?? undefined,
    startAt,
    distanceKm,
    movingTimeSec: Math.max(0, Number(activity.moving_time ?? 0)),
    elapsedTimeSec: activity.elapsed_time ?? undefined,
    elevationGainM: activity.total_elevation_gain ?? undefined,
    commute: activity.commute ?? undefined,
    trainer: activity.trainer ?? undefined,
    manual: activity.manual ?? undefined,
    matchStatus: activity.gear_id ? "unmatched_gear" : "no_gear",
    matchConfidence: 0,
  };
}

export function matchActivityToBike(
  activity: NormalizedBikeActivity,
  bikes: BikeCandidate[]
): {
  bikeId?: Id<"bikes">;
  matchStatus: NormalizedBikeActivity["matchStatus"];
  matchConfidence: number;
  matchReason: string;
} {
  if (!activity.gearId) {
    return {
      matchStatus: "no_gear",
      matchConfidence: 0,
      matchReason: "activity has no gear_id",
    };
  }

  const gearText = normalizeText([activity.gearName, activity.gearBrand, activity.gearModel, activity.gearId].filter(Boolean).join(" "));
  if (!gearText) {
    return {
      matchStatus: "unmatched_gear",
      matchConfidence: 0,
      matchReason: "gear lookup returned no matchable text",
    };
  }

  const scored = bikes
    .map((bike) => {
      const bikeText = normalizeText([bike.name, bike.brand, bike.model, bike.bikeType, bike.discipline, bike.ridingStyle, bike.primaryGoal].filter(Boolean).join(" "));
      let score = 0;
      const reasons: string[] = [];

      if (bike.brand && gearText.includes(normalizeText(bike.brand))) {
        score += 0.35;
        reasons.push("brand");
      }
      if (bike.model && gearText.includes(normalizeText(bike.model))) {
        score += 0.35;
        reasons.push("model");
      }
      if (bike.name && gearText.includes(normalizeText(bike.name))) {
        score += 0.3;
        reasons.push("name");
      }
      if (bikeText && gearText.includes(bikeText)) {
        score += 0.15;
        reasons.push("full bike text");
      }

      if (score === 0) {
        const bikeTokens = normalizeText([bike.name, bike.brand, bike.model].filter(Boolean).join(" "))
          .split(" ")
          .filter(Boolean);
        const tokenHits = bikeTokens.filter((token) => gearText.includes(token)).length;
        if (tokenHits > 0) {
          score += Math.min(0.25, tokenHits * 0.08);
          reasons.push("token overlap");
        }
      }

      const gearTypeText = gearText;
      if (bike.bikeType === "mountain" && hasAnyToken(gearTypeText, KNOWN_DISCIPLINE_TOKENS.mtb)) {
        score += 0.18;
        reasons.push("mtb discipline");
      }
      if (bike.bikeType === "gravel" && hasAnyToken(gearTypeText, KNOWN_DISCIPLINE_TOKENS.gravel)) {
        score += 0.18;
        reasons.push("gravel discipline");
      }
      if (bike.bikeType === "tt_triathlon" && hasAnyToken(gearTypeText, KNOWN_DISCIPLINE_TOKENS.tt)) {
        score += 0.18;
        reasons.push("tt discipline");
      }

      return {
        bike,
        score: Math.min(1, score),
        reason: reasons.join(", ") || "no clear match",
      };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  const runnerUp = scored[1];
  if (!best || best.score < 0.65) {
    return {
      matchStatus: "unmatched_gear",
      matchConfidence: best?.score ?? 0,
      matchReason: best ? `best score ${best.score.toFixed(2)} below threshold` : "no bikes available",
    };
  }

  if (runnerUp && best.score - runnerUp.score < 0.1) {
    return {
      matchStatus: "unmatched_gear",
      matchConfidence: best.score,
      matchReason: `ambiguous match between ${best.bike.name} and ${runnerUp.bike.name}`,
    };
  }

  return {
    bikeId: best.bike._id,
    matchStatus: "matched_gear",
    matchConfidence: best.score,
    matchReason: best.reason,
  };
}

function inferRidingStyleFromActivities(
  activities: NormalizedBikeActivity[],
  avgDistanceKm: number,
  avgSpeedKmh: number,
  commuteShare: number,
  trainerShare: number,
  longRideShare: number,
  dominantToken: string
): RidingStyle {
  if (commuteShare >= 0.35 || hasAnyToken(dominantToken, KNOWN_STYLE_TOKENS.commuting)) {
    return "commuting";
  }
  if (longRideShare >= 0.3 || avgDistanceKm >= 70 || hasAnyToken(dominantToken, KNOWN_STYLE_TOKENS.touring)) {
    return avgDistanceKm >= 90 ? "touring" : "sportive";
  }
  if (avgSpeedKmh >= 28 && countMatches(activities, (activity) => activity.distanceKm <= 35) / Math.max(1, activities.length) >= 0.3) {
    return "racing";
  }
  if (trainerShare >= 0.3 || hasAnyToken(dominantToken, KNOWN_STYLE_TOKENS.fitness)) {
    return "fitness";
  }
  if (hasAnyToken(dominantToken, KNOWN_STYLE_TOKENS.recreational) || avgDistanceKm <= 18) {
    return "recreational";
  }
  return "fitness";
}

function inferPrimaryGoal(
  ridingStyle: RidingStyle,
  avgDistanceKm: number,
  avgSpeedKmh: number,
  longRideShare: number
): PrimaryGoal {
  switch (ridingStyle) {
    case "commuting":
      return "comfort";
    case "touring":
      return avgDistanceKm >= 90 ? "comfort" : "balanced";
    case "sportive":
      return "balanced";
    case "racing":
      return avgSpeedKmh >= 30 ? "performance" : "aerodynamics";
    case "fitness":
      return "balanced";
    case "recreational":
    default:
      return longRideShare >= 0.25 ? "comfort" : "balanced";
  }
}

function inferDiscipline(
  bikeType: BikeCandidate["bikeType"],
  dominantToken: string
): Discipline {
  if (bikeType === "mountain" || hasAnyToken(dominantToken, KNOWN_DISCIPLINE_TOKENS.mtb)) {
    return "mtb";
  }
  if (bikeType === "gravel" || bikeType === "cyclocross" || hasAnyToken(dominantToken, KNOWN_DISCIPLINE_TOKENS.gravel)) {
    return "gravel";
  }
  if (bikeType === "tt_triathlon" || hasAnyToken(dominantToken, KNOWN_DISCIPLINE_TOKENS.tt)) {
    return "tt";
  }
  return "road";
}

function inferBikeRole(args: {
  inferredDiscipline: Discipline;
  inferredRidingStyle: RidingStyle;
  commuteShare: number;
  trainerShare: number;
}): NonNullable<ActivitySummary["inferredBikeRole"]> {
  if (args.commuteShare >= 0.35 || args.inferredRidingStyle === "commuting") {
    return "commute";
  }
  if (args.trainerShare >= 0.35 || args.inferredRidingStyle === "fitness") {
    return "training";
  }
  if (args.inferredDiscipline === "gravel") {
    return "gravel";
  }
  if (args.inferredDiscipline === "mtb") {
    return "mountain";
  }
  if (args.inferredDiscipline === "tt") {
    return "tt_triathlon";
  }
  return args.inferredRidingStyle === "racing" ? "race_road" : "endurance_road";
}

export function summarizeBikeActivities(args: {
  bike: BikeCandidate;
  activities: NormalizedBikeActivity[];
  syncedAt: number;
}): { summary: ActivitySummary; inferredPatch: Partial<Pick<BikeCandidate, "discipline" | "ridingStyle" | "primaryGoal">> } {
  const { bike, activities, syncedAt } = args;
  const rideCount = activities.length;
  const totalDistanceKm = activities.reduce((sum, activity) => sum + activity.distanceKm, 0);
  const totalMovingTimeSec = activities.reduce((sum, activity) => sum + activity.movingTimeSec, 0);
  const totalElevationGainM = activities.reduce(
    (sum, activity) => sum + (activity.elevationGainM ?? 0),
    0
  );
  const sorted = [...activities].sort((a, b) => b.startAt - a.startAt);
  const lastActivity = sorted[0] ?? null;
  const matchedGearCount = countMatches(activities, (activity) => activity.matchStatus === "matched_gear");
  const unmatchedGearCount = countMatches(activities, (activity) => activity.matchStatus === "unmatched_gear");
  const noGearCount = countMatches(activities, (activity) => activity.matchStatus === "no_gear");
  const commuteShare = rideCount > 0 ? countMatches(activities, (activity) => Boolean(activity.commute)) / rideCount : 0;
  const trainerShare = rideCount > 0 ? countMatches(activities, (activity) => Boolean(activity.trainer)) / rideCount : 0;
  const longRideShare = rideCount > 0 ? countMatches(activities, (activity) => activity.distanceKm >= 60) / rideCount : 0;
  const avgDistanceKm = rideCount > 0 ? totalDistanceKm / rideCount : 0;
  const avgSpeedKmh = totalMovingTimeSec > 0 ? totalDistanceKm / (totalMovingTimeSec / 3600) : 0;
  const dominantToken = normalizeText(
    activities
      .map((activity) => [activity.sportType, activity.activityType, activity.activityName].filter(Boolean).join(" "))
      .join(" ")
  );

  const inferredRidingStyle = inferRidingStyleFromActivities(
    activities,
    avgDistanceKm,
    avgSpeedKmh,
    commuteShare,
    trainerShare,
    longRideShare,
    dominantToken
  );
  const inferredPrimaryGoal = inferPrimaryGoal(
    inferredRidingStyle,
    avgDistanceKm,
    avgSpeedKmh,
    longRideShare
  );
  const inferredDiscipline = inferDiscipline(bike.bikeType, dominantToken);
  const inferredBikeRole = inferBikeRole({
    inferredDiscipline,
    inferredRidingStyle,
    commuteShare,
    trainerShare,
  });
  const inferenceConfidence = Math.min(
    0.95,
    0.25 +
      Math.min(0.45, rideCount / 24) +
      Math.max(commuteShare, trainerShare, longRideShare, avgSpeedKmh >= 28 ? 0.2 : 0)
  );

  const inferredPatch: Partial<Pick<BikeCandidate, "discipline" | "ridingStyle" | "primaryGoal">> = {};
  if (!bike.discipline && inferenceConfidence >= 0.5) {
    inferredPatch.discipline = inferredDiscipline;
  }
  if (!bike.ridingStyle && inferenceConfidence >= 0.55) {
    inferredPatch.ridingStyle = inferredRidingStyle;
  }
  if (!bike.primaryGoal && inferenceConfidence >= 0.55) {
    inferredPatch.primaryGoal = inferredPrimaryGoal;
  }

  return {
    summary: {
      source: "strava_v1_1",
      syncedAt,
      activityCount: rideCount,
      rideCount,
      totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
      totalMovingTimeSec,
      totalElevationGainM: totalElevationGainM > 0 ? Math.round(totalElevationGainM) : undefined,
      lastActivityAt: lastActivity?.startAt,
      lastActivityName: lastActivity?.activityName,
      lastActivityType: lastActivity?.activityType,
      matchedGearCount,
      unmatchedGearCount,
      noGearCount,
      inferredBikeRole,
      inferredRidingStyle: inferredPatch.ridingStyle ?? bike.ridingStyle ?? inferredRidingStyle,
      inferredPrimaryGoal: inferredPatch.primaryGoal ?? bike.primaryGoal ?? inferredPrimaryGoal,
      inferredDiscipline: inferredPatch.discipline ?? bike.discipline ?? inferredDiscipline,
      inferenceConfidence: Number(inferenceConfidence.toFixed(2)),
    },
    inferredPatch,
  };
}

export function summarizeUserActivities(activities: NormalizedBikeActivity[]): ActivitySummary {
  const sorted = [...activities].sort((a, b) => b.startAt - a.startAt);
  const summary = summarizeBikeActivities({
    bike: {
      _id: "0" as Id<"bikes">,
      name: "summary",
      bikeType: "road",
    },
    activities,
    syncedAt: Date.now(),
  }).summary;

  return {
    ...summary,
    lastActivityAt: sorted[0]?.startAt,
    lastActivityName: sorted[0]?.activityName,
    lastActivityType: sorted[0]?.activityType,
  };
}
