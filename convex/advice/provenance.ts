import type { Infer } from "convex/values";
import type { QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { inputProvenanceValidator } from "./validators";
import type { CalculatorState } from "../calculatorStates/validators";

export type InputProvenance = Infer<typeof inputProvenanceValidator>;
export type UsedInput = { field: string; value: unknown; bikeId?: Id<"bikes"> };

export function valueAt(record: unknown, field: string): unknown {
  return field.split(".").reduce<unknown>((value, key) =>
    value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined, record);
}

function supported(value: unknown): value is InputProvenance["dependencies"][number]["value"] {
  return value === null || typeof value === "string" || typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value)) ||
    (Array.isArray(value) && (value.every((item) => typeof item === "string") ||
      value.every((item) => typeof item === "number" && Number.isFinite(item))));
}

export function matchInputProvenance(
  userId: Id<"users">,
  used: UsedInput[],
  profile: Doc<"profiles"> | null,
  bike: Doc<"bikes"> | null,
  observations: Doc<"profileObservations">[],
  capturedAt: number,
): InputProvenance {
  const dependencies: InputProvenance["dependencies"] = [];
  for (const input of used) {
    const record = input.bikeId ? bike : profile;
    if (!record || record.userId !== userId || (input.bikeId && bike?._id !== input.bikeId) ||
      !supported(input.value) || JSON.stringify(valueAt(record, input.field)) !== JSON.stringify(input.value)) continue;
    const observation = observations.filter((row) => row.userId === userId && row.status === "current" &&
      row.field === input.field && row.bikeId === input.bikeId &&
      JSON.stringify(row.value) === JSON.stringify(input.value))
      .sort((left, right) => right.recordedAt - left.recordedAt)[0];
    dependencies.push({ field: input.field, value: Array.isArray(input.value) ? [...input.value] as string[] | number[] : input.value,
      ...(input.bikeId ? { bikeId: input.bikeId } : {}),
      ...(observation ? { observationId: observation._id } : {}) });
  }
  return { version: 1, capturedAt, dependencies };
}

export async function captureInputProvenance(
  ctx: Pick<QueryCtx, "db">,
  userId: Id<"users">,
  used: UsedInput[],
  bikeId?: Id<"bikes">,
): Promise<InputProvenance> {
  const profile = await ctx.db.query("profiles").withIndex("by_user", (query) => query.eq("userId", userId)).unique();
  const bike = bikeId ? await ctx.db.get(bikeId) : null;
  const observations = await ctx.db.query("profileObservations")
    .withIndex("by_user_field", (query) => query.eq("userId", userId)).collect();
  return matchInputProvenance(userId, used, profile, bike, observations, Date.now());
}

export function directInputs(values: object, fields: string[], bikeId?: Id<"bikes">): UsedInput[] {
  return fields.map((field) => ({ field, value: valueAt(values, field), ...(bikeId ? { bikeId } : {}) }));
}

export function calculatorUsedInputs(state: CalculatorState, bikeId?: Id<"bikes">): UsedInput[] {
  const values = state.values;
  if ("values" in values) {
    if (state.calculator === "fuel-hydration") return [];
    const used: UsedInput[] = [{ field: "weightKg", value: values.values.riderMass }];
    if (state.calculator === "climb-planner" || (state.calculator === "ftp-wkg" && values.method === "known")) {
      used.push({ field: "ftpWatts", value: values.values.ftp });
    }
    if (state.calculator === "power-speed" || state.calculator === "climb-planner") {
      if (state.calculator === "power-speed") used.push({ field: "bikeWeightKg", value: values.values.bikeMass, bikeId });
      used.push({ field: "bikeType", value: values.bike, bikeId });
    }
    return used;
  }
  return [
    ...directInputs(values, ["heightCm", "inseamCm"]),
    ...(state.calculator === "saddle-height" || state.calculator === "bike-fit" ? [
      { field: "flexibilityScore", value: ["very_limited", "limited", "average", "good", "excellent"][
        (values as { flexibility: number }).flexibility - 1] },
      { field: "coreStabilityScore", value: (values as { core: number }).core },
      { field: "positionPriority", value: (values as { ambition: string }).ambition },
    ] : []),
  ];
}

export function gearingUsedInputs(input: {
  riderWeightKg?: number; ftpWatts?: number; chainrings: number[]; cassetteTeeth: number[];
  wheelCircumferenceMm: number; crankLengthMm?: number; bikeType?: string; bikeWeightKg?: number;
}, bikeId?: Id<"bikes">): UsedInput[] {
  return [{ field: "weightKg", value: input.riderWeightKg }, { field: "ftpWatts", value: input.ftpWatts },
    ...Object.entries({ "gearing.chainrings": input.chainrings, "gearing.cassetteTeeth": input.cassetteTeeth,
      "gearing.wheelCircumferenceMm": input.wheelCircumferenceMm,
      "currentSetup.crankLengthMm": input.crankLengthMm, bikeType: input.bikeType, bikeWeightKg: input.bikeWeightKg,
    }).map(([field, value]) => ({ field, value, bikeId }))];
}

export function pressureUsedInputs(input: {
  bodyWeightKg: number; bikeWeightKg?: number; widthFrontMm: number; widthRearMm: number; tubeType: string;
}, bikeId?: Id<"bikes">): UsedInput[] {
  return [{ field: "weightKg", value: input.bodyWeightKg },
    ...Object.entries({ bikeWeightKg: input.bikeWeightKg, "tires.widthFrontMm": input.widthFrontMm,
      "tires.widthRearMm": input.widthRearMm, "tires.tubeType": input.tubeType,
    }).map(([field, value]) => ({ field, value, bikeId }))];
}

export async function capturePressureInputProvenance(
  ctx: Pick<QueryCtx, "db">,
  userId: Id<"users">,
  input: Parameters<typeof pressureUsedInputs>[0] & Record<string, unknown>,
  bikeId?: Id<"bikes">,
  tireSetupId?: Id<"tireSetups">,
): Promise<InputProvenance> {
  const snapshot = await captureInputProvenance(ctx, userId,
    tireSetupId ? [{ field: "weightKg", value: input.bodyWeightKg },
      { field: "bikeWeightKg", value: input.bikeWeightKg, bikeId }] : pressureUsedInputs(input, bikeId), bikeId);
  if (!tireSetupId || !bikeId) return snapshot;
  const tire = await ctx.db.get(tireSetupId);
  const wheel = tire ? await ctx.db.get(tire.wheelsetId) : null;
  const bike = await ctx.db.get(bikeId);
  if (!tire || tire.userId !== userId || !wheel || wheel.userId !== userId ||
    wheel.bikeId !== bikeId || !bike || bike.userId !== userId) {
    throw new Error("Pressure setup not found");
  }
  const records = [
    { row: tire, table: "tireSetups" as const,
      fields: ["widthFrontMm", "widthRearMm", "tubeType", "casingType", "maxPressureBar"] },
    { row: wheel, table: "wheelsets" as const,
      fields: ["rimType", "internalRimWidthFrontMm", "internalRimWidthRearMm"] },
  ];
  for (const { row, table, fields } of records) {
    for (const field of fields) {
      const value = input[field];
      const knownAbsent = Object.prototype.hasOwnProperty.call(input, field)
        && value === undefined && valueAt(row, field) === undefined;
      if (knownAbsent || (supported(value) && JSON.stringify(valueAt(row, field)) === JSON.stringify(value))) {
        const record = table === "tireSetups"
          ? { table, id: tire._id } : { table, id: wheel._id };
        snapshot.dependencies.push({ field, bikeId,
          value: knownAbsent ? null : value as InputProvenance["dependencies"][number]["value"], record });
      }
    }
  }
  return snapshot;
}
