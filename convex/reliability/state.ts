import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { readProfileProvenance } from "../profiles/provenance";
import { calculateAccountSaddleHeight } from "../../shared/reliability/accountSaddle";
import type { SaddleHeightProvenance } from "../../shared/reliability/saddleHeight";

export async function ownedBike(ctx: Pick<QueryCtx, "db">, userId: Id<"users">, bikeId?: Id<"bikes">) {
  if (!bikeId) return null;
  const bike = await ctx.db.get(bikeId);
  if (!bike || bike.userId !== userId) throw new Error("Bike not found");
  return bike;
}

export function saddleProvenance(observations: readonly {
  field: string; kind?: string; method?: string; repeatCount?: number;
  withinTolerance?: boolean; unresolvedWarning?: boolean;
}[]): SaddleHeightProvenance {
  const entry = observations.find(observation => observation.field === "inseamCm");
  const kind = entry?.kind;
  return { kind: kind === "measured" || kind === "derived" || kind === "estimated" ? kind : "declared",
    method: entry?.method, repeatCount: entry?.repeatCount,
    withinTolerance: entry?.withinTolerance, unresolvedWarning: entry?.unresolvedWarning };
}

export async function saddleState(ctx: QueryCtx | MutationCtx, userId: Id<"users">, bikeId?: Id<"bikes">) {
  const { profile, observations } = await readProfileProvenance(ctx, userId);
  const bike = await ownedBike(ctx, userId, bikeId);
  const history = (await ctx.db.query("reliabilityInseamMeasurements")
    .withIndex("by_user", range => range.eq("userId", userId)).collect())
    .sort((a, b) => b._creationTime - a._creationTime);
  const currentInseamObservation = observations.find(item => item.field === "inseamCm");
  const anchorId = currentInseamObservation && "_id" in currentInseamObservation ? currentInseamObservation._id : null;
  const activeSeriesId = anchorId && history[0]?.profileObservationId === anchorId ? history[0].seriesId : null;
  const measurements = activeSeriesId ? history.filter(item => item.seriesId === activeSeriesId)
    .slice(0, 3).reverse() : [];
  const preferences = await ctx.db.query("reliabilitySaddlePreferences")
    .withIndex("by_user_bike", range => range.eq("userId", userId).eq("bikeId", bikeId)).unique();
  const provenance = saddleProvenance(observations);
  const flex = { very_limited: 1, limited: 2, average: 3, good: 4, excellent: 5 };
  const bikeType = preferences?.bikeType ?? (bike?.bikeType === "mountain" ? "mtb" : bike?.bikeType === "city" ? "city"
    : bike?.bikeType === "gravel" ? "gravel" : bike ? "road" : undefined);
  const goal = preferences?.goal ?? (bike?.primaryGoal === "aerodynamics" ? "aero" : bike?.primaryGoal === "performance" ? "performance"
    : bike?.primaryGoal === "comfort" ? "comfort" : profile?.positionPriority);
  // Only reuse history that still describes the current profile value; later edits invalidate old repeats.
  const mean = measurements.length ? measurements.reduce((sum, item) => sum + item.valueCm, 0) / measurements.length : null;
  const matchingHistory = mean !== null && Math.abs(mean - (profile?.inseamCm ?? 0)) < 0.001;
  let model: ReturnType<typeof calculateAccountSaddleHeight> | null = null;
  try {
    model = profile && (profile.inseamCm !== undefined || profile.heightCm !== undefined)
    ? calculateAccountSaddleHeight({ heightCm: profile.heightCm, inseamCm: profile.inseamCm,
      measurementsCm: matchingHistory ? measurements.map(item => item.valueCm) : undefined,
      provenance, bikeType, goal, flexibilityScore: profile.flexibilityScore ? flex[profile.flexibilityScore] : undefined,
      coreScore: profile.coreStabilityScore, climbing: preferences?.climbing }) : null;
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    // Old profiles may contain formerly allowed values. Keep the editor usable without inventing advice.
  }
  const latestKneeAngle = (await ctx.db.query("reliabilityKneeMeasurements")
    .withIndex("by_user", range => range.eq("userId", userId)).collect())
    .filter(item => item.bikeId === bikeId).sort((a, b) => b.recordedAt - a.recordedAt)[0] ?? null;
  return { profile, observations, measurements, activeSeriesId, bike, model, latestKneeAngle,
    preferences: { bikeType, goal, climbing: preferences?.climbing,
      currentSaddleHeightMm: preferences?.currentSaddleHeightMm ?? bike?.currentSetup?.saddleHeightMm,
      flexibilityScore: profile?.flexibilityScore ? flex[profile.flexibilityScore] : undefined,
      coreScore: profile?.coreStabilityScore },
    preferencesUpdatedAt: preferences?.updatedAt ?? null };
}

export function validRequestId(value: string) {
  if (value.startsWith("internal-") || value === "profile-seed" || !/^[a-zA-Z0-9_-]{8,100}$/.test(value)) throw new Error("Invalid request identifier");
}

export function latestMeasurementMean(rows: readonly Pick<Doc<"reliabilityInseamMeasurements">, "valueCm">[]) {
  const values = rows.map(row => row.valueCm);
  return { meanInseamCm: values.reduce((sum, value) => sum + value, 0) / values.length,
    repeatCount: values.length, withinTolerance: Math.max(...values) - Math.min(...values) <= 0.5 + 1e-9 };
}

/** Evidence only counts when it belongs to these exact inputs, including frozen report inputs. */
export function buildReliabilityEvidence(input: {
  profile: { inseamCm?: number; femurLengthCm?: number; footLengthCm?: number; torsoLengthCm?: number;
    armLengthCm?: number; flexibilityScore?: string; coreStabilityScore?: number;
    flexibilityTestCm?: number; coreTestSeconds?: number } | null;
  observations: readonly { field: string; value?: unknown; kind?: string; method?: string;
    repeatCount?: number; withinTolerance?: boolean; unresolvedWarning?: boolean }[];
  bike?: { currentGeometry?: { stackMm?: number; reachMm?: number } } | null;
  kneeAngle?: { angleDegrees: number; currentSaddleHeightMm: number; inseamCm: number } | null;
  saddleHeightMm?: number;
}): import("../../shared/reliability/calculators").ReliabilityEvidence {
  const { profile, bike, kneeAngle } = input;
  const observations = input.observations.filter(item => profile && item.value !== undefined
    && item.value === profile[item.field as keyof typeof profile]);
  const measured = (field: string) => observations.some(item => item.field === field && item.kind === "measured");
  return {
    inseamCm: profile?.inseamCm, inseamProvenance: saddleProvenance(observations),
    femurAndFootMeasured: measured("femurLengthCm") && measured("footLengthCm"),
    torsoAndArmMeasured: measured("torsoLengthCm") && measured("armLengthCm"),
    bikeGeometryKnown: !!bike?.currentGeometry?.stackMm && !!bike?.currentGeometry?.reachMm,
    flexibilityAndCoreAssessed: profile?.flexibilityScore !== undefined && profile?.coreStabilityScore !== undefined,
    flexibilityAndCoreTested: measured("flexibilityTestCm") && measured("coreTestSeconds"),
    ...(kneeAngle && kneeAngle.currentSaddleHeightMm === input.saddleHeightMm
      && kneeAngle.inseamCm === profile?.inseamCm ? { kneeAngleDegrees: kneeAngle.angleDegrees } : {}),
  };
}
