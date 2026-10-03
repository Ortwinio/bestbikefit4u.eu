import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { requireUserId } from "../lib/authz";
import { assertPaidProfileWrite } from "./paidAccess";
import { validateNumberRange, validateShortString } from "../lib/validation";
import { bikeTypeValidator, createBikeWithProfiles } from "../bikes/mutations";
import { PROFILE_RANGES } from "../../shared/profileBounds";
import { bikeEditRanges } from "../../shared/bikeEditValidation";

const recordValidator = v.object({
  field: v.string(), value: v.union(v.number(), v.string()), unit: v.string(),
  calculator: v.string(), method: v.union(v.literal("measured"), v.literal("estimated"),
    v.literal("declared"), v.literal("bike")), touchedAt: v.number(),
});
const flexValues = ["very_limited", "limited", "average", "good", "excellent"] as const;
const calculators = ["bike-fit", "saddle-height", "frame-size", "crank-length", "saddle-width",
  "tire-pressure", "gearing", "power-speed", "climb-planner", "ftp-wkg", "fuel-hydration"];
const riderFields: Record<string, { unit: string; target: string; range?: readonly [number, number] }> = {
  ...Object.fromEntries(Object.entries(PROFILE_RANGES).map(([field, range]) => [field, {
    target: field, range, unit: field.endsWith("Cm") ? "cm" : field.endsWith("Mm") ? "mm"
      : field === "weightKg" ? "kg" : field === "ftpWatts" ? "W" : field === "coreStabilityScore" ? "score" : "none",
  }])),
  flexibilityScore: { unit: "score", target: "flexibilityScore" },
  ridingGoal: { unit: "none", target: "positionPriority" },
  ftpMethod: { unit: "none", target: "ftpMethod" },
  cleatSystem: { unit: "none", target: "cleatSystem" },
  sweatProfile: { unit: "none", target: "sweatProfile" },
};
const bikeFields: Record<string, { unit: string; range?: readonly [number, number] }> = {
  bikeCategory: { unit: "none" },
  currentSaddleHeightMm: { unit: "mm", range: bikeEditRanges.currentSetup.saddleHeightMm },
  currentCrankLengthMm: { unit: "mm", range: bikeEditRanges.currentSetup.crankLengthMm },
  currentSaddleWidthMm: { unit: "mm", range: [80, 250] },
  currentSaddleModel: { unit: "none" },
  tireWidthFrontMm: { unit: "mm", range: [18, 120] },
  tireWidthRearMm: { unit: "mm", range: [18, 120] },
  rimType: { unit: "none" }, surface: { unit: "none" },
  outerChainringTeeth: { unit: "teeth", range: [20, 70] },
  innerChainringTeeth: { unit: "teeth", range: [20, 70] },
  cassetteSmallestCogTeeth: { unit: "teeth", range: [9, 60] },
  cassetteLargestCogTeeth: { unit: "teeth", range: [9, 60] },
};
type HandoffRecord = { field: string; value: number | string; unit: string; calculator: string;
  method: "measured" | "estimated" | "declared" | "bike"; touchedAt: number };
type Conflict = { field: string; currentValue: number | string; incomingValue: number | string; unit: string };

function normalizeRecord(record: HandoffRecord, now: number) {
  const definition = riderFields[record.field] ?? bikeFields[record.field];
  if (!definition || record.unit !== definition.unit || !calculators.includes(record.calculator)) {
    throw new Error("Invalid handoff field");
  }
  if (!Number.isSafeInteger(record.touchedAt) || record.touchedAt <= 0 || record.touchedAt > now + 60000) {
    throw new Error("Invalid handoff date");
  }
  if (riderFields[record.field] && record.method === "bike") throw new Error("Invalid handoff method");
  if (typeof record.value === "string") {
    validateShortString(record.value, "handoff");
    if (!record.value.trim()) throw new Error("Invalid handoff value");
  } else if (!Number.isFinite(record.value)) throw new Error("Invalid handoff value");
  let value = record.value;
  if (definition.range) {
    if (typeof value !== "number") throw new Error("Invalid handoff number");
    validateNumberRange(value, "handoff", ...definition.range);
    if ((record.unit === "teeth" || record.field === "coreStabilityScore") && !Number.isInteger(value)) {
      throw new Error("Invalid handoff number");
    }
  } else if (record.field === "flexibilityScore") {
    if (typeof value === "number" && Number.isInteger(value)) value = flexValues[value - 1];
    if (!flexValues.includes(value as typeof flexValues[number])) throw new Error("Invalid flexibility");
  } else if (typeof value !== "string") throw new Error("Invalid handoff value");
  if (record.field === "ridingGoal" && !["comfort", "balanced", "performance"].includes(String(value))) {
    throw new Error("Invalid riding goal");
  }
  if (record.field === "bikeCategory") {
    if (value === "mtb") value = "mountain";
    if (value === "tt" || value === "triathlon") value = "tt_triathlon";
    if (!["road", "gravel", "mountain", "hybrid", "tt_triathlon", "cyclocross", "touring", "city"].includes(String(value))) {
      throw new Error("Invalid bike type");
    }
  }
  const bikeTarget: Record<string, string> = {
    bikeCategory: "bikeType", currentSaddleHeightMm: "currentSetup.saddleHeightMm",
    currentCrankLengthMm: "currentSetup.crankLengthMm",
  };
  return { ...record, value, target: riderFields[record.field]?.target ?? bikeTarget[record.field] ?? record.field,
    isBike: Boolean(bikeFields[record.field]), kind: record.method === "bike" ? "declared" as const : record.method };
}

export const importHandoff = mutation({
  args: {
    records: v.array(recordValidator),
    resolutions: v.optional(v.array(v.object({ field: v.string(),
      choice: v.union(v.literal("profile"), v.literal("today"), v.literal("remeasure")),
      expectedCurrentValue: v.union(v.number(), v.string()),
    }))),
    bike: v.optional(v.object({ name: v.string(), bikeType: bikeTypeValidator,
      saddleHeightMeasurePoint: v.optional(v.literal("bb_center_to_saddle_top")),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    if (args.records.length > 32 || (args.resolutions?.length ?? 0) > 32) throw new Error("Too many handoff fields");
    const records = args.records.map((record) => normalizeRecord(record, now));
    if (new Set(records.map((record) => record.field)).size !== records.length) throw new Error("Duplicate handoff field");
    if (new Set(args.resolutions?.map((resolution) => resolution.field)).size !== (args.resolutions?.length ?? 0)) {
      throw new Error("Duplicate resolution");
    }
    if (args.bike) {
      validateShortString(args.bike.name, "bike name");
      if (!args.bike.name.trim()) throw new Error("Bike name required");
      const category = records.find((record) => record.field === "bikeCategory");
      if (category && category.value !== args.bike.bikeType) throw new Error("Bike type must match selected data");
      if (records.some((record) => record.field === "currentSaddleHeightMm") && !args.bike.saddleHeightMeasurePoint) {
        throw new Error("Saddle height measure point required");
      }
    }
    const profile = await ctx.db.query("profiles").withIndex("by_user", (range) => range.eq("userId", userId)).unique();
    const observations = await ctx.db.query("profileObservations")
      .withIndex("by_user_field", (range) => range.eq("userId", userId)).collect();
    const conflicts: Conflict[] = [];
    const accepted = records.filter((record) => {
      if (record.isBike) return Boolean(args.bike);
      const current = profile?.[record.target as keyof Doc<"profiles">];
      const resolution = args.resolutions?.find((entry) => entry.field === record.field);
      if (current !== undefined && current !== record.value) {
        if (typeof current !== "string" && typeof current !== "number") throw new Error("Invalid profile field");
        if (!resolution || resolution.expectedCurrentValue !== current) {
          conflicts.push({ field: record.field, currentValue: current, incomingValue: record.value, unit: record.unit });
          return false;
        }
        return resolution.choice === "today";
      }
      return resolution?.choice !== "profile" && resolution?.choice !== "remeasure";
    });
    if (conflicts.length) return { status: "conflicts" as const, importedFields: [], conflicts,
      profileId: profile?._id ?? null, bikeId: null };
    const updates: Record<string, number | string | undefined> = {};
    for (const record of accepted.filter((entry) => !entry.isBike)) updates[record.target] = record.value;
    const ftp = accepted.find((record) => record.field === "ftpWatts");
    if (ftp) {
      updates.ftpMeasuredAt = ftp.touchedAt;
      updates.ftpMethod = accepted.find((record) => record.field === "ftpMethod")?.value;
    }
    const weight = accepted.find((record) => record.field === "weightKg");
    if (weight) updates.weightUpdatedAt = weight.touchedAt;
    await assertPaidProfileWrite(ctx, userId, updates, profile, true);
    let profileId = profile?._id ?? null;
    if (Object.keys(updates).length) {
      if (profileId) await ctx.db.patch(profileId, { ...updates, updatedAt: now, riderProfileUpdatedAt: now });
      else profileId = await ctx.db.insert("profiles", { userId, ...updates, updatedAt: now, riderProfileUpdatedAt: now });
    }
    let bikeId: Id<"bikes"> | null = null;
    if (args.bike) {
      const height = accepted.find((record) => record.field === "currentSaddleHeightMm");
      const crank = accepted.find((record) => record.field === "currentCrankLengthMm");
      bikeId = await createBikeWithProfiles(ctx, { userId, name: args.bike.name.trim(),
        bikeType: args.bike.bikeType, source: "manual", bikeTypeSource: "user",
        currentSetup: {
          ...(height ? { saddleHeightMm: Number(height.value) } : {}),
          ...(crank ? { crankLengthMm: Number(crank.value) } : {}),
        },
      });
      if (height) {
        const bike = await ctx.db.get(bikeId);
        await ctx.db.patch(bikeId, { currentSetup: { ...bike?.currentSetup,
          saddleHeightMeasurement: { measurePoint: "bb_center_to_saddle_top",
            measuredAt: height.touchedAt, source: "public_handoff" } } });
      }
    }
    for (const record of accepted) {
      const current = observations.filter((observation) => observation.field === record.target &&
        observation.status === "current" && observation.bikeId === (record.isBike ? bikeId : undefined));
      if (current.some((observation) => observation.value === record.value &&
        observation.recordedAt === record.touchedAt && observation.kind === record.kind)) continue;
      for (const observation of current) await ctx.db.patch(observation._id, { status: "superseded" });
      await ctx.db.insert("profileObservations", { userId, ...(record.isBike && bikeId ? { bikeId } : {}),
        field: record.target, value: record.value, unit: record.unit, kind: record.kind,
        method: record.field === "ftpWatts" ? String(updates.ftpMethod ?? record.method) : record.method,
        source: "public_handoff", recordedAt: record.touchedAt, status: "current" });
    }
    return { status: "imported" as const, importedFields: accepted.map((record) => record.field),
      conflicts: [], profileId, bikeId };
  },
});
