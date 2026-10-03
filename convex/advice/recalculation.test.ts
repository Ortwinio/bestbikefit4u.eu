import { beforeEach, expect, it, vi } from "vitest";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { calculatorDefaults } from "../../src/lib/calculators/accountState";
import { recalculateState } from "./recalculateState";
import { recalculateAll } from "./mutations";

const mocks = vi.hoisted(() => ({ user: "user1" as string | null, generate: vi.fn() }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: async () => mocks.user }));
vi.mock("../recommendations/mutations", () => ({ generateRecommendation: mocks.generate }));
const profile = { _id: "profile1", userId: "user1", heightCm: 183, inseamCm: 88, weightKg: 80,
  ftpWatts: 250, flexibilityScore: "good", coreStabilityScore: 4, torsoLengthCm: 60,
  armLengthCm: 65, shoulderWidthCm: 42, positionPriority: "comfort" } as Doc<"profiles">;

beforeEach(() => { mocks.user = "user1"; mocks.generate.mockReset(); });

it("uses current profile values and returns the actual frame range", () => {
  const result = recalculateState({ calculator: "frame-size", values: calculatorDefaults["frame-size"] }, profile);
  expect(result.adviceOutput).toEqual([{ key: "frameSize", value: "58-59 cm", unit: "" }]);
  expect(result.state.values).toMatchObject({ heightCm: 183, inseamCm: 88, heightConfirmed: true, inseamConfirmed: true });
  expect(calculatorDefaults["frame-size"].heightCm).toBe(180);
});

it.each(["power-speed", "climb-planner", "ftp-wkg", "fuel-hydration", "crank-length", "saddle-height", "bike-fit"] as const)(
  "calculates %s with the existing engine", calculator => {
    const state = { calculator, values: calculatorDefaults[calculator] } as Parameters<typeof recalculateState>[0];
    const result = recalculateState(state, profile);
    expect(result.adviceOutput.length).toBeGreaterThan(0);
    expect(result.adviceOutput.every(output => typeof output.value === "string" || Number.isFinite(output.value))).toBe(true);
  });

it("does not fill missing current body inputs from calculator defaults", () => {
  expect(() => recalculateState({ calculator: "frame-size", values: calculatorDefaults["frame-size"] }, null))
    .toThrow("MISSING_CURRENT_INPUTS");
});

type Row = Record<string, unknown> & { _id: string };
function fixture(extra: Record<string, Row[]> = {}) {
  const tables: Record<string, Row[]> = { profiles: [profile as unknown as Row], ...extra };
  let count = 0;
  const db = {
    query: (table: string) => {
      const filters: [string, unknown][] = [];
      const range = { eq: (key: string, value: unknown) => { filters.push([key, value]); return range; } };
      const rows = () => (tables[table] ?? []).filter(row => filters.every(([key, value]) => row[key] === value));
      const query = { withIndex: (_name: string, apply: (index: typeof range) => unknown) => { apply(range); return query; },
        collect: async () => rows(), unique: async () => rows()[0] ?? null };
      return query;
    },
    get: async (id: string) => Object.values(tables).flat().find(row => row._id === id) ?? null,
    patch: vi.fn(async (id: string, patch: object) => Object.assign(Object.values(tables).flat().find(row => row._id === id)!, patch)),
    insert: async (table: string, value: object) => { const id = `insert${++count}`;
      (tables[table] ??= []).push({ ...value, _id: id }); return id; },
    delete: vi.fn(async (id: string) => { for (const table of Object.keys(tables)) tables[table] = tables[table].filter(row => row._id !== id); }),
  };
  return { tables, db, ctx: { db } as unknown as MutationCtx };
}
const run = (recalculateAll as unknown as { _handler: (ctx: MutationCtx, args: object) => Promise<{items: Array<{id:string;status:string;reason?:string}>}> })._handler;

it("requires authentication before reading any data", async () => {
  mocks.user = null;
  await expect(run({} as MutationCtx, {})).rejects.toThrow();
});

it("resets all four in-place outcome progress records on every successful same-clock recalculation", async () => {
  const clock = vi.spyOn(Date, "now").mockReturnValue(1790985600000);
  const progress = { adviceRevision: 4, adviceProgress: [{ key: "example", performedAt: 1,
    feedback: { result: "better", recordedAt: 2 } }] };
  const { ctx, tables } = fixture({ profiles: [{ ...profile, sitBoneWidthMm: 135 } as unknown as Row],
    calculatorStates: [{ _id: "state", userId: "user1", calculator: "frame-size", updatedAt: 1, ...progress,
      state: { calculator: "frame-size", values: calculatorDefaults["frame-size"] } }],
    gearingSessions: [{ _id: "gear", userId: "user1", sessionType: "dashboard", createdAt: 1, ...progress,
      input: { drivetrainType: "2x", chainrings: [50, 34], cassetteTeeth: [11, 16, 24, 32], wheelCircumferenceMm: 2105, cadenceRpm: 85 } }],
    saddleWidthSessions: [{ _id: "saddle", userId: "user1", sessionType: "dashboard", createdAt: 1, ...progress,
      measurementMethod: "measured", sitBoneWidthMm: 135, ridingType: "endurance_road", postureCategory: "balanced" }],
    pressureCalculations: [{ _id: "pressure", userId: "user1", sourceType: "dashboard_basic", createdAt: 1, ...progress,
      inputSnapshot: { bodyWeightKg: 80, discipline: "road", widthFrontMm: 28, widthRearMm: 28, tubeType: "inner_tube", surface: "rough_asphalt" } }],
  });
  try {
    for (const revision of [5, 6]) {
      const result = await run(ctx, {});
      expect(result.items).toHaveLength(4);
      expect(result.items.every(item => item.status === "updated")).toBe(true);
      for (const table of ["calculatorStates", "gearingSessions", "saddleWidthSessions", "pressureCalculations"]) {
        expect(tables[table][0].adviceRevision).toBe(revision);
        expect(tables[table][0].adviceProgress).toBeUndefined();
      }
    }
  } finally { clock.mockRestore(); }
});

it("updates only latest owned states and leaves failed and foreign rows untouched", async () => {
  const state = { calculator: "frame-size", values: calculatorDefaults["frame-size"] };
  const { ctx, db, tables } = fixture({ calculatorStates: [
    { _id: "old", userId: "user1", calculator: "frame-size", state, updatedAt: 1 },
    { _id: "latest", userId: "user1", calculator: "frame-size", state, updatedAt: 2 },
    { _id: "foreign", userId: "user2", calculator: "frame-size", state, updatedAt: 3 },
    { _id: "bad", userId: "user1", calculator: "crank-length", state: { calculator: "crank-length", values: { ...calculatorDefaults["crank-length"], category: "invalid" } }, updatedAt: 4 },
  ] });
  const result = await run(ctx, {});
  expect(result.items).toContainEqual({ source: "calculatorStates", id: "latest", status: "updated" });
  expect(tables.calculatorStates.find(row => row._id === "foreign")).not.toHaveProperty("adviceOutput");
  expect(db.patch.mock.calls.some(([id]) => id === "old")).toBe(false);
});

it("does not replace an old fit until generation succeeds and cleans failed clones", async () => {
  mocks.generate.mockRejectedValue(new Error("ENGINE_FAILURE"));
  const { ctx, tables } = fixture({ recommendations: [{ _id: "report", userId: "user1", sessionId: "fit", createdAt: 1 }],
    fitSessions: [{ _id: "fit", userId: "user1", ridingStyle: "fitness", primaryGoal: "comfort", status: "completed" }],
    questionnaireResponses: [{ _id: "answer", sessionId: "fit", questionId: "experience_level", response: "beginner" }] });
  const result = await run(ctx, {});
  expect(result.items).toEqual([{ source: "recommendations", id: "report", status: "failed", reason: "CALCULATION_FAILED" }]);
  expect(tables.fitSessions.map(row => row._id)).toEqual(["fit"]);
  expect(tables.questionnaireResponses.map(row => row._id)).toEqual(["answer"]);
  expect(tables.recommendations).toHaveLength(1);
  expect(mocks.generate.mock.calls[0][1]).toMatchObject({ suppressEmail: true });
});

it("reports pending fit generation without modifying the old report", async () => {
  const { ctx, tables } = fixture({ recommendations: [{ _id: "report", userId: "user1", sessionId: "fit", createdAt: 1 }],
    fitSessions: [{ _id: "fit", userId: "user1", ridingStyle: "fitness", primaryGoal: "comfort", status: "completed" }] });
  const result = await run(ctx, {});
  expect(result.items[0].status).toBe("pending");
  expect(tables.recommendations[0]).not.toHaveProperty("inputProvenance");
});

it("preserves the owned bike profile context when cloning a fit", async () => {
  const { ctx, tables } = fixture({
    bikes: [{ _id: "bike", userId: "user1", bikeType: "road" }],
    bikeProfiles: [{ _id: "bikeProfile", userId: "user1", bikeId: "bike", profileType: "race" }],
    recommendations: [{ _id: "report", userId: "user1", bikeId: "bike", sessionId: "fit", createdAt: 1 }],
    fitSessions: [{ _id: "fit", userId: "user1", bikeId: "bike", bikeProfileId: "bikeProfile",
      ridingStyle: "racing", primaryGoal: "performance", status: "completed" }],
  });
  expect((await run(ctx, {})).items[0].status).toBe("pending");
  expect(tables.fitSessions.find(row => row._id !== "fit")).toMatchObject({ bikeId: "bike", bikeProfileId: "bikeProfile" });
});

it.each(["foreign", "mismatched", "deleted"])("does not clone a fit with a %s bike profile", async state => {
  const { ctx, tables } = fixture({
    bikes: [{ _id: "bike", userId: "user1", bikeType: "road" }, { _id: "otherBike", userId: "user1", bikeType: "road" }],
    bikeProfiles: state === "deleted" ? [] : [{ _id: "bikeProfile", userId: state === "foreign" ? "other" : "user1",
      bikeId: state === "mismatched" ? "otherBike" : "bike" }],
    recommendations: [{ _id: "report", userId: "user1", bikeId: "bike", sessionId: "fit", createdAt: 1 }],
    fitSessions: [{ _id: "fit", userId: "user1", bikeId: "bike", bikeProfileId: "bikeProfile", status: "completed" }],
  });
  expect((await run(ctx, {})).items[0]).toMatchObject({ status: "skipped", reason: "FIT_UNAVAILABLE" });
  expect(tables.fitSessions).toHaveLength(1);
  expect(mocks.generate).not.toHaveBeenCalled();
});

it("refreshes pressure from owned current tire and wheel data with linked dependencies", async () => {
  const { ctx, tables } = fixture({ bikes: [{ _id: "bike", userId: "user1", bikeType: "gravel", bikeWeightKg: 10 }],
    tireSetups: [{ _id: "tire", userId: "user1", wheelsetId: "wheel", widthFrontMm: 42, widthRearMm: 44,
      tubeType: "tubeless", casingType: "reinforced", maxPressureBar: 4 }],
    wheelsets: [{ _id: "wheel", userId: "user1", bikeId: "bike", rimType: "hookless", internalRimWidthFrontMm: 25, internalRimWidthRearMm: 25 }],
    pressureCalculations: [{ _id: "pressure", userId: "user1", bikeId: "bike", tireSetupId: "tire", sourceType: "dashboard_advanced", createdAt: 1,
      inputSnapshot: { bodyWeightKg: 65, discipline: "road", widthFrontMm: 28, widthRearMm: 28, tubeType: "inner_tube", surface: "rough_asphalt" } }] });
  expect((await run(ctx, {})).items[0].status).toBe("updated");
  const row = tables.pressureCalculations[0];
  expect(row.inputSnapshot).toMatchObject({ bodyWeightKg: 80, bikeWeightKg: 10, widthFrontMm: 42, widthRearMm: 44, tubeType: "tubeless", rimType: "hookless" });
  expect(row.inputProvenance).toMatchObject({ dependencies: expect.arrayContaining([
    expect.objectContaining({ field: "widthFrontMm", value: 42, record: { table: "tireSetups", id: "tire" } }),
  ]) });
});

it("skips a deleted dependency instead of making stale advice fresh", async () => {
  const { ctx, db } = fixture({ profiles: [{ ...profile, weightKg: undefined } as unknown as Row],
    pressureCalculations: [{ _id: "pressure", userId: "user1", sourceType: "dashboard_basic", createdAt: 1,
      inputProvenance: { version: 1, capturedAt: 1, dependencies: [{ field: "weightKg", value: 75 }] } }] });
  expect((await run(ctx, {})).items[0]).toMatchObject({ status: "skipped", reason: "MISSING_CURRENT_INPUTS" });
  expect(db.patch).not.toHaveBeenCalled();
});

it("does not read foreign linked tire inputs into an owned pressure result", async () => {
  const { ctx, db } = fixture({ bikes: [{ _id: "bike", userId: "user1", bikeType: "road" }],
    tireSetups: [{ _id: "tire", userId: "other", wheelsetId: "wheel" }],
    pressureCalculations: [{ _id: "pressure", userId: "user1", bikeId: "bike", tireSetupId: "tire", sourceType: "dashboard_advanced", createdAt: 1,
      inputSnapshot: { bodyWeightKg: 65, discipline: "road", widthFrontMm: 28, widthRearMm: 28, tubeType: "inner_tube", surface: "rough_asphalt" } }] });
  expect((await run(ctx, {})).items[0].status).toBe("skipped");
  expect(db.patch).not.toHaveBeenCalled();
});

it("recalculates gearing from current drivetrain rather than the old snapshot", async () => {
  const { ctx, tables } = fixture({ bikes: [{ _id: "bike", userId: "user1", bikeType: "road", bikeWeightKg: 8,
    gearing: { chainrings: [48, 32], cassetteTeeth: [11, 18, 25, 36], wheelCircumferenceMm: 2120 } }],
    gearingSessions: [{ _id: "gear", userId: "user1", bikeId: "bike", sessionType: "dashboard", createdAt: 1,
      input: { drivetrainType: "2x", chainrings: [50, 34], cassetteTeeth: [11, 16, 24, 32], wheelCircumferenceMm: 2105, cadenceRpm: 85 } }] });
  expect((await run(ctx, {})).items[0].status).toBe("updated");
  expect(tables.gearingSessions[0].input).toMatchObject({ chainrings: [48, 32], cassetteTeeth: [11, 18, 25, 36], riderWeightKg: 80, ftpWatts: 250 });
  expect(tables.gearingSessions[0].inputProvenance).toMatchObject({ dependencies: expect.arrayContaining([
    expect.objectContaining({ field: "gearing.chainrings", bikeId: "bike", value: [48, 32] }),
  ]) });
});

it("recalculates saddle width from the current sit-bone measurement", async () => {
  const { ctx, tables } = fixture({ profiles: [{ ...profile, sitBoneWidthMm: 135 } as unknown as Row],
    saddleWidthSessions: [{ _id: "saddle", userId: "user1", sessionType: "dashboard", createdAt: 1,
      measurementMethod: "measured", sitBoneWidthMm: 110, ridingType: "endurance_road", postureCategory: "balanced" }] });
  expect((await run(ctx, {})).items[0].status).toBe("updated");
  expect(tables.saddleWidthSessions[0]).toMatchObject({ sitBoneWidthMm: 135, measurementMethod: "measured",
    recommendedWidthMm: expect.any(Number), inputProvenance: { dependencies: expect.arrayContaining([
      expect.objectContaining({ field: "sitBoneWidthMm", value: 135 }),
    ]) } });
});
