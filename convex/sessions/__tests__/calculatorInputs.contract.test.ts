import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CalculatorValues } from "../../calculatorStates/validators";

const { getAuthUserIdMock } = vi.hoisted(() => ({ getAuthUserIdMock: vi.fn() }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: getAuthUserIdMock }));

import { create } from "../mutations";
import { generate } from "../../recommendations/mutations";
import { getReportV2 } from "../../recommendations/queries";
import { calculatorMatchesBike, calculatorPrimaryGoal } from "../calculatorInputs";

type Handler = (ctx: unknown, args: unknown) => Promise<unknown>;
const createSession = (create as unknown as { _handler: Handler })._handler;
const generateRecommendation = (generate as unknown as { _handler: Handler })._handler;
const readReport = (getReportV2 as unknown as { _handler: Handler })._handler;

const values: CalculatorValues<"bike-fit"> = {
  heightCm: 191, inseamCm: 91, source: "measured", category: "road",
  ambition: "aero", flexibility: 5, core: 4,
};
const profile = Object.freeze({
  _id: "profile_1", userId: "user_1", heightCm: 175, inseamCm: 80,
  flexibilityScore: "limited", coreStabilityScore: 2, torsoLengthCm: 60,
  armLengthCm: 65, shoulderWidthCm: 42, footLengthCm: 26,
  experienceLevel: "intermediate", weeklyHours: "3-6", typicalRideLength: "medium",
  hasPain: "no", positionPriority: "comfort",
});
const args = {
  calculatorStateId: "calculator_1", bikeType: "road",
  ridingStyle: "fitness", primaryGoal: "comfort",
};

function makeCtx(options: {
  calculator?: unknown;
  calculatorInputs?: CalculatorValues<"bike-fit">;
  status?: string;
  owner?: string;
} = {}) {
  const calculator = options.calculator === undefined ? {
    _id: "calculator_1", userId: "user_1", calculator: "bike-fit",
    state: { calculator: "bike-fit", values }, updatedAt: 1,
  } : options.calculator;
  const session = {
    _id: "session_1", userId: options.owner ?? "user_1", profileId: "profile_1",
    bikeType: "road", ridingStyle: "fitness", primaryGoal: "comfort",
    status: options.status ?? "questionnaire_complete",
    calculatorInputs: options.calculatorInputs,
  };
  const db = {
    get: vi.fn(async (id: string) => {
      if (id === "calculator_1") return calculator;
      if (id === "profile_1") return profile;
      if (id === "session_1") return session;
      return null;
    }),
    query: vi.fn((table: string) => ({
      withIndex: vi.fn(() => ({
        unique: vi.fn(async () => table === "profiles" ? profile : null),
        collect: vi.fn(async () => []),
      })),
    })),
    insert: vi.fn(async (_table: string, _record: unknown) => "new_session"),
    patch: vi.fn(),
    replace: vi.fn(),
    delete: vi.fn(),
  };
  return { db, scheduler: { runAfter: vi.fn() } };
}

beforeEach(() => {
  vi.clearAllMocks();
  getAuthUserIdMock.mockResolvedValue("user_1");
});

describe("calculator session creation", () => {
  it.each(["comfort", "balanced", "performance"] as const)("shares effective %s goal with the frontend", (ambition) => {
    expect(calculatorPrimaryGoal({ ...values, ambition })).toBe(ambition);
  });

  it("shares category matching with the frontend", () => {
    expect(calculatorMatchesBike(values, "road")).toBe(true);
    expect(calculatorMatchesBike(values, "tt_triathlon")).toBe(true);
    expect(calculatorMatchesBike(values, "gravel")).toBe(false);
    expect(calculatorMatchesBike(values, undefined)).toBe(false);
  });

  it("requires auth before reading calculator data", async () => {
    getAuthUserIdMock.mockResolvedValue(null);
    const ctx = makeCtx();
    await expect(createSession(ctx, args)).rejects.toThrow("Not authenticated");
    expect(ctx.db.get).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it.each([null, { userId: "user_2" }])("rejects missing or foreign calculator rows", async (calculator) => {
    const ctx = makeCtx({ calculator });
    await expect(createSession(ctx, args)).rejects.toThrow("Calculator state not found");
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it.each([
    { calculator: "frame-size", state: { calculator: "bike-fit", values } },
    { calculator: "bike-fit", state: { calculator: "frame-size", values } },
    ...[
      { source: "missing" }, { heightCm: 211 }, { inseamCm: 54 },
      { heightCm: NaN }, { core: 6 }, { flexibility: 2.5 },
    ].map((override) => ({
      calculator: "bike-fit", state: { calculator: "bike-fit", values: { ...values, ...override } },
    })),
  ])("rejects wrong calculators, missing defaults and invalid bounds: %j", async (record) => {
    const ctx = makeCtx({ calculator: { userId: "user_1", ...record } });
    await expect(createSession(ctx, args)).rejects.toThrow("INVALID_CALCULATOR_VALUES");
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("rejects incompatible bike categories", async () => {
    const ctx = makeCtx();
    await expect(createSession(ctx, { ...args, bikeType: "gravel" })).rejects.toThrow("Bike category must match calculator values");
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it.each([
    ["road", "road", "aerodynamics"], ["tt_triathlon", "road", "aerodynamics"],
    ["gravel", "gravel", "aerodynamics"], ["cyclocross", "gravel", "aerodynamics"],
    ["touring", "gravel", "aerodynamics"], ["mountain", "mtb", "performance"],
    ["hybrid", "city", "performance"], ["city", "city", "performance"],
  ] as const)("snapshots %s/%s and resolves aero to %s", async (bikeType, category, primaryGoal) => {
    const savedValues = { ...values, category };
    const ctx = makeCtx({ calculator: {
      userId: "user_1", calculator: "bike-fit", updatedAt: 1,
      state: { calculator: "bike-fit", values: savedValues },
    } });
    await createSession(ctx, { ...args, bikeType });
    expect(ctx.db.insert).toHaveBeenCalledExactlyOnceWith("fitSessions", expect.objectContaining({
      calculatorInputs: savedValues, primaryGoal, bikeType, profileId: "profile_1",
    }));
    const inserted = ctx.db.insert.mock.calls[0][1] as { calculatorInputs: typeof values };
    expect(inserted.calculatorInputs).not.toBe(savedValues);
    savedValues.heightCm = 180;
    expect(inserted.calculatorInputs.heightCm).toBe(191);
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(ctx.db.replace).not.toHaveBeenCalled();
    expect(ctx.db.delete).not.toHaveBeenCalled();
  });

  it("keeps ordinary sessions free of calculator snapshots", async () => {
    const ctx = makeCtx();
    await createSession(ctx, { bikeType: "road", ridingStyle: "fitness", primaryGoal: "comfort" });
    expect(ctx.db.insert.mock.calls[0][1]).not.toHaveProperty("calculatorInputs");
  });
});

describe("session-local engine and report inputs", () => {
  it.each(["road", "gravel", "mtb", "city"] as const)("schedules snapshot measurements and %s ambition despite profile priority", async (category) => {
    const ctx = makeCtx({ calculatorInputs: { ...values, category } });
    await generateRecommendation(ctx, { sessionId: "session_1" });
    expect(ctx.scheduler.runAfter).toHaveBeenCalledExactlyOnceWith(0, expect.anything(), expect.objectContaining({
      heightCm: 191, inseamCm: 91, flexibilityScore: "excellent", coreStabilityScore: 4,
      torsoLengthCm: 60, armLengthCm: 65, shoulderWidthCm: 42, footLengthCm: 26,
      bikeCategory: category, ambition: category === "mtb" || category === "city" ? "performance" : "aero",
    }));
    expect(ctx.db.patch).toHaveBeenCalledExactlyOnceWith("session_1", { status: "processing" });
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.replace).not.toHaveBeenCalled();
    expect(profile.heightCm).toBe(175);
  });

  it("leaves legacy generation on current profile inputs", async () => {
    const ctx = makeCtx();
    await generateRecommendation(ctx, { sessionId: "session_1" });
    expect(ctx.scheduler.runAfter).toHaveBeenCalledWith(0, expect.anything(), expect.objectContaining({
      heightCm: 175, inseamCm: 80, flexibilityScore: "limited", coreStabilityScore: 2, ambition: "comfort",
    }));
  });

  it.each([1, 2, 3, 4, 5])("overlays report flexibility score %s without writing profile or archive", async (flexibility) => {
    const ctx = makeCtx({ calculatorInputs: { ...values, flexibility }, status: "archived" });
    const report = await readReport(ctx, { sessionId: "session_1" }) as { profile: unknown };
    expect(report.profile).toEqual({
      ...profile, heightCm: 191, inseamCm: 91, coreStabilityScore: 4,
      flexibilityScore: ["very_limited", "limited", "average", "good", "excellent"][flexibility - 1],
    });
    expect(report.profile).not.toBe(profile);
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.replace).not.toHaveBeenCalled();
  });

  it("leaves older archived reports without a snapshot unchanged", async () => {
    const ctx = makeCtx({ status: "archived" });
    const report = await readReport(ctx, { sessionId: "session_1" }) as { profile: unknown };
    expect(report.profile).toBe(profile);
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("does not expose another user's report snapshot", async () => {
    const ctx = makeCtx({ owner: "user_2", calculatorInputs: values });
    expect(await readReport(ctx, { sessionId: "session_1" })).toBeNull();
    expect(ctx.db.query).not.toHaveBeenCalled();
  });
});
