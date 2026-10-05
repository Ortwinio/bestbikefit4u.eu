import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { save } from "./mutations";
import { get } from "./queries";
import { shouldReplace, validateInput } from "./merge";
import type { CalculatorInput } from "./validators";

const state = vi.hoisted(() => ({ userId: "rider" as string | null,
  profile: null as Record<string, unknown> | null, observations: [] as Record<string, unknown>[] }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: async () => state.userId }));
vi.mock("../profiles/provenance", () => ({ readProfileProvenance: async () => state }));
vi.mock("../profiles/paidAccess", () => ({ assertPaidProfileWrite: vi.fn(async () => {}) }));
const runSave = (save as unknown as { _handler: (ctx: MutationCtx, args: {
  entries: CalculatorInput[]; expectedUserId: Id<"users">; removedFields?: string[]; inseamConfirmed?: boolean;
  calculator?: string;
  confirmedProfileFields?: { field: string; expectedValue: number | string; expectedTouchedAt: number }[];
}) => Promise<{ acceptedFields: string[]; retainedFields: string[]; removedFields: string[] }> })._handler;
const runGet = (get as unknown as { _handler: (ctx: QueryCtx) => Promise<{ userId: string; entries: CalculatorInput[] }> })._handler;
const entry = (patch: Partial<CalculatorInput> = {}): CalculatorInput => ({ field: "heightCm", value: 180,
  unit: "cm", method: "measured", calculator: "saddle-height", touchedAt: Date.now() - 1000, ...patch });
function context() {
  const insert = vi.fn(async () => "profile");
  const patch = vi.fn(async (_id: string, _record: Record<string, unknown>) => {});
  const db = { insert, patch, query: () => ({ withIndex: () => ({ collect: async () => [] }) }) };
  return { ctx: { db } as unknown as MutationCtx & QueryCtx, insert, patch };
}
beforeEach(() => { state.userId = "rider"; state.profile = null; state.observations = []; });

describe("calculator profile data", () => {
  it("requires authentication and guards account switches before writes", async () => {
    const { ctx, insert } = context();
    state.userId = null;
    await expect(runGet(ctx)).rejects.toThrow();
    await expect(runSave(ctx, { entries: [entry()], expectedUserId: "rider" as Id<"users"> })).rejects.toThrow();
    state.userId = "other";
    await expect(runSave(ctx, { entries: [entry()], expectedUserId: "rider" as Id<"users"> })).rejects.toThrow("ACCOUNT_CHANGED");
    expect(insert).not.toHaveBeenCalled();
  });
  it("creates missing profile, canonical values and preserved provenance", async () => {
    const { ctx, insert } = context();
    const input = entry({ repeatCount: 3, withinTolerance: true, unresolvedWarning: false });
    expect(await runSave(ctx, { entries: [input], expectedUserId: "rider" as Id<"users"> }))
      .toMatchObject({ acceptedFields: ["heightCm"], retainedFields: [] });
    expect(insert).toHaveBeenCalledWith("profiles", expect.objectContaining({ userId: "rider", heightCm: 180,
      calculatorInputs: [expect.objectContaining({ repeatCount: 3, withinTolerance: true, unresolvedWarning: false })] }));
    expect(insert).toHaveBeenCalledWith("profileObservations", expect.objectContaining({ field: "heightCm", kind: "measured" }));
  });
  it("uses canonical profile observations and does not overwrite measurements with newer declarations", async () => {
    const { ctx, patch } = context();
    state.profile = { _id: "profile", heightCm: 178 };
    state.observations = [{ field: "heightCm", value: 178, unit: "cm", kind: "measured", method: "fitter", recordedAt: 1 }];
    expect(await runGet(ctx)).toMatchObject({ userId: "rider", entries: [expect.objectContaining({
      value: 178, method: "measured", measurementMethod: "fitter" })] });
    expect(await runSave(ctx, { entries: [entry({ method: "declared" })], expectedUserId: "rider" as Id<"users"> }))
      .toMatchObject({ acceptedFields: [], retainedFields: ["heightCm"] });
    expect(patch).not.toHaveBeenCalled();
  });
  it("stores hip circumference as a protected canonical body measurement", async () => {
    const { ctx, insert, patch } = context();
    const input = entry({ field: "hipCircumferenceCm", value: 100, calculator: "saddle-width" });
    await runSave(ctx, { entries: [input], expectedUserId: "rider" as Id<"users"> });
    expect(insert).toHaveBeenCalledWith("profiles", expect.objectContaining({ hipCircumferenceCm: 100 }));
    expect(insert).toHaveBeenCalledWith("profileObservations", expect.objectContaining({
      field: "hipCircumferenceCm", value: 100, kind: "measured", unit: "cm",
    }));
    state.profile = { _id: "profile", hipCircumferenceCm: 100, calculatorInputs: [input] };
    expect(await runSave(ctx, { entries: [{ ...input, value: 105, method: "declared",
      touchedAt: input.touchedAt + 1 }], expectedUserId: "rider" as Id<"users"> }))
      .toMatchObject({ acceptedFields: [], retainedFields: ["hipCircumferenceCm"] });
    expect(patch).not.toHaveBeenCalled();
  });
  it("only accepts newer equal-quality entries, and retains measured canonical removal", async () => {
    const { ctx, patch } = context();
    const stored = entry();
    state.profile = { _id: "profile", calculatorInputs: [stored, entry({ field: "surface", unit: "none", value: "road" })] };
    expect(await runSave(ctx, { entries: [stored], calculator: "saddle-height",
      removedFields: ["surface", "heightCm"], expectedUserId: "rider" as Id<"users"> }))
      .toMatchObject({ acceptedFields: [], removedFields: ["surface"], retainedFields: ["heightCm", "heightCm"] });
    expect(patch).toHaveBeenCalledWith("profile", expect.objectContaining({ calculatorInputs: [stored] }));
    expect(shouldReplace(stored, entry({ touchedAt: stored.touchedAt - 1 }))).toBe(false);
    expect(shouldReplace(stored, entry({ touchedAt: stored.touchedAt + 1 }))).toBe(true);
  });
  it.each([
    { value: 999 }, { field: "unknown" }, { unit: "mm" }, { touchedAt: Date.now() + 1_000_000 },
    { repeatCount: 0 }, { repeatCount: 2.5 }, { measurementMethod: "" },
  ])("rejects invalid values and provenance %j", patch => {
    expect(() => validateInput(entry(patch), Date.now())).toThrow();
  });
  it("preserves lower-quality uncertainty and warnings", () => {
    const incoming = entry({ method: "estimated", kind: "derived", repeatCount: 3,
      withinTolerance: false, unresolvedWarning: true });
    expect(validateInput(incoming, Date.now())).toEqual(incoming);
    expect(shouldReplace(entry(), incoming)).toBe(false);
  });
  it("keeps scenarios per calculator and rider fields global", async () => {
    const { ctx, patch } = context();
    const stored = entry({ field: "powerWatts", value: 200, unit: "W", calculator: "power-speed" });
    const incoming = entry({ field: "powerWatts", value: 250, unit: "W", calculator: "climb-planner" });
    state.profile = { _id: "profile", calculatorInputs: [stored, entry()] };
    await runSave(ctx, { entries: [incoming, entry({ calculator: "frame-size", value: 185, touchedAt: Date.now() })],
      expectedUserId: "rider" as Id<"users"> });
    const record = patch.mock.calls[0][1] as { calculatorInputs: CalculatorInput[] };
    expect(record.calculatorInputs).toHaveLength(3);
    expect(record.calculatorInputs).toEqual(expect.arrayContaining([stored,
      expect.objectContaining({ calculator: "climb-planner", value: 250 }),
      expect.objectContaining({ field: "heightCm", value: 185 })]));
    state.profile = { _id: "profile", calculatorInputs: record.calculatorInputs };
    expect((await runGet(ctx)).entries.filter(value => value.field === "powerWatts")).toHaveLength(2);
    await runSave(ctx, { entries: [], calculator: "climb-planner", removedFields: ["powerWatts"],
      expectedUserId: "rider" as Id<"users"> });
    expect(patch).toHaveBeenLastCalledWith("profile", expect.objectContaining({ calculatorInputs: expect.arrayContaining([stored]) }));
    await expect(runSave(ctx, { entries: [], removedFields: ["powerWatts"], expectedUserId: "rider" as Id<"users"> }))
      .rejects.toThrow("INVALID_CALCULATOR_INPUT");
  });
  it("allows an explicit profile replacement only against the confirmed current value", async () => {
    const { ctx, patch } = context();
    const stored = entry();
    state.profile = { _id: "profile", calculatorInputs: [stored] };
    const incoming = entry({ method: "declared", value: 182, touchedAt: Date.now() });
    const confirmation = { field: "heightCm", expectedValue: stored.value, expectedTouchedAt: stored.touchedAt };
    await expect(runSave(ctx, { entries: [incoming], expectedUserId: "rider" as Id<"users">,
      confirmedProfileFields: [{ ...confirmation, expectedValue: 170 }] })).rejects.toThrow("PROFILE_VALUE_CHANGED");
    expect(patch).not.toHaveBeenCalled();
    expect(await runSave(ctx, { entries: [incoming], expectedUserId: "rider" as Id<"users">,
      confirmedProfileFields: [confirmation] })).toMatchObject({ acceptedFields: ["heightCm"] });
    expect(patch).toHaveBeenCalledWith("profile", expect.objectContaining({ heightCm: 182 }));
  });
  it("accepts same-field scenarios in different calculators and uses the last scenario independent of quality", async () => {
    const { ctx, patch } = context();
    const stored = entry({ field: "powerWatts", value: 200, unit: "W", calculator: "power-speed" });
    state.profile = { _id: "profile", calculatorInputs: [stored] };
    const first = { ...stored, method: "declared" as const, value: 210, touchedAt: stored.touchedAt + 1 };
    const second = { ...first, calculator: "climb-planner", value: 230 };
    expect(await runSave(ctx, { entries: [first, second], expectedUserId: "rider" as Id<"users"> }))
      .toMatchObject({ acceptedFields: ["powerWatts", "powerWatts"] });
    expect(patch).toHaveBeenCalledWith("profile", expect.objectContaining({ calculatorInputs: [
      expect.objectContaining({ calculator: "power-speed", value: 210, kind: "declared" }),
      expect.objectContaining({ calculator: "climb-planner", value: 230, kind: "declared" }),
    ] }));
    await expect(runSave(ctx, { entries: [first, first], expectedUserId: "rider" as Id<"users"> }))
      .rejects.toThrow("INVALID_CALCULATOR_INPUT");
  });
  it.each([[90, false, true], [90, true, false], [105, true, true]] as const)(
    "derives inseam %s warning with explicit confirmation %s", async (inseamCm, confirmed, warning) => {
      const { ctx, insert } = context();
      const values = [entry({ value: 180 }), entry({ field: "inseamCm", value: inseamCm,
        repeatCount: 3, withinTolerance: true, unresolvedWarning: false })];
      await runSave(ctx, { entries: values, expectedUserId: "rider" as Id<"users">, inseamConfirmed: confirmed });
      expect(insert).toHaveBeenCalledWith("profileObservations", expect.objectContaining({ field: "inseamCm",
        repeatCount: 1, withinTolerance: false, unresolvedWarning: warning }));
      expect(insert).toHaveBeenCalledWith("profiles", expect.objectContaining({ calculatorInputs: expect.arrayContaining([
        expect.objectContaining({ field: "inseamCm", repeatCount: 1, withinTolerance: false, unresolvedWarning: warning }),
      ]) }));
    },
  );
  it("recomputes warnings on height changes without refreshing inseam evidence", async () => {
    const { ctx, patch } = context();
    const oldInseam = entry({ field: "inseamCm", value: 90, repeatCount: 3, withinTolerance: true,
      unresolvedWarning: false, touchedAt: 1234, measurementMethod: "repeat_measurement" });
    state.profile = { _id: "profile", heightCm: 195, inseamCm: 90, calculatorInputs: [oldInseam] };
    state.observations = [{ _id: "inseamObservation", field: "inseamCm", value: 90, unit: "cm", kind: "measured",
      method: "repeat_measurement", recordedAt: 1234, repeatCount: 3, withinTolerance: true, unresolvedWarning: false }];
    await runSave(ctx, { entries: [entry({ value: 160 })], expectedUserId: "rider" as Id<"users"> });
    expect(patch).toHaveBeenCalledWith("profile", expect.objectContaining({ calculatorInputs: expect.arrayContaining([
      expect.objectContaining({ field: "inseamCm", value: 90, touchedAt: 1234, measurementMethod: "repeat_measurement",
        repeatCount: 3, withinTolerance: true, unresolvedWarning: true }),
    ]) }));
  });
});
