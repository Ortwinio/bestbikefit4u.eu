import { saveObservation } from "../profiles/provenance";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { saveInseamMeasurement, saveKneeAngle, saveSaddlePreferences } from "./mutations";
import { getSaddleState, getDashboardReliability } from "./queries";
import { getEvaluationContext, markEvaluationSent } from "./evaluationData";
const { auth } = vi.hoisted(() => ({ auth: vi.fn() }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: auth }));
type Row = Record<string, unknown> & { _id: string };
function context() {
  const tables = new Map<string, Row[]>();
  let sequence = 0;
  const get = async (id: string) => [...tables.values()].flat().find(row => row._id === id) ?? null;
  const insert = vi.fn(async (table: string, fields: object) => {
    const row = { _id: `${table}_${++sequence}`, _creationTime: 1700000000000 + sequence, ...fields };
    tables.set(table, [...(tables.get(table) ?? []), row]);
    return row._id;
  });
  const patch = vi.fn(async (id: string, fields: object) => Object.assign((await get(id))!, fields));
  const query = (table: string) => {
    const filters: ((row: Row) => boolean)[] = [];
    const index = { eq: (field: string, value: unknown) => {
      filters.push(row => row[field] === value); return index;
    } };
    const expression = {
      field: (name: string) => (row: Row) => row[name],
      eq: (left: (row: Row) => unknown, value: unknown) => (row: Row) => left(row) === value,
      and: (...conditions: ((row: Row) => boolean)[]) => (row: Row) => conditions.every(part => part(row)),
    };
    const rows = () => (tables.get(table) ?? []).filter(row => filters.every(filter => filter(row)));
    const cursor = {
      withIndex: (_name: string, apply: (builder: typeof index) => unknown) => { apply(index); return cursor; },
      filter: (apply: (builder: typeof expression) => (row: Row) => boolean) => {
        filters.push(apply(expression)); return cursor;
      },
      unique: async () => rows()[0] ?? null,
      collect: async () => rows(),
    };
    return cursor;
  };
  return { db: { get, insert, patch, query }, tables, scheduler: { runAt: vi.fn() } };
}


type Handler = { _handler: (ctx: unknown, args: unknown) => Promise<unknown> };
const invoke = (fn: unknown, ctx: unknown, args: unknown = {}) => (fn as Handler)._handler(ctx, args);
const input = (valueCm = 89, requestId = "measure-001") => ({ valueCm, requestId });
beforeEach(() => { auth.mockResolvedValue("owner"); vi.spyOn(Date, "now").mockReturnValue(1791000000000);
  vi.stubEnv("PAID_ACCESS_ENFORCED", "false"); });
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });
async function profile(ctx: ReturnType<typeof context>, values: object = {}) {
  return ctx.db.insert("profiles", { userId: "owner", heightCm: 190, updatedAt: Date.now(), ...values });
}

describe("reliability measurements", () => {
  it("requires authentication for every public endpoint", async () => {
    auth.mockResolvedValue(null); const ctx = context();
    for (const fn of [saveInseamMeasurement, saveKneeAngle, saveSaddlePreferences, getSaddleState, getDashboardReliability]) {
      await expect(invoke(fn, ctx, input())).rejects.toThrow("Not authenticated");
    }
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
  it("stores actual repeats and their mean, caps precision at three, and deduplicates retry", async () => {
    const ctx = context(); await profile(ctx);
    await invoke(saveInseamMeasurement, ctx, input(89));
    await invoke(saveInseamMeasurement, ctx, input(89));
    expect(ctx.tables.get("reliabilityInseamMeasurements")).toHaveLength(1);
    await invoke(saveInseamMeasurement, ctx, input(89.1, "measure-002"));
    const result = await invoke(saveInseamMeasurement, ctx, input(88.9, "measure-003"));
    expect(result).toMatchObject({ meanInseamCm: 89, repeatCount: 3, withinTolerance: true });
    expect(ctx.tables.get("profileObservations")?.filter(row => row.status === "current")[0])
      .toMatchObject({ value: 89, kind: "measured", repeatCount: 3, withinTolerance: true });
    expect(await invoke(getSaddleState, ctx)).toMatchObject({ model: { halfWidthMm: 18, measurementCount: 3 } });
  });
  it("does not turn declared defaults into measurements and refuses conflicting idempotency keys", async () => {
    const ctx = context(); await profile(ctx, { inseamCm: 89 });
    await invoke(saveInseamMeasurement, ctx, input());
    expect(ctx.tables.get("reliabilityInseamMeasurements")).toHaveLength(1);
    await expect(invoke(saveInseamMeasurement, ctx, input(90))).rejects.toThrow("conflict");
  });
  it("retains spread and unresolved warning rather than claiming repeat precision", async () => {
    const ctx = context(); await profile(ctx);
    await invoke(saveInseamMeasurement, ctx, input(89));
    await invoke(saveInseamMeasurement, ctx, input(90, "measure-002"));
    expect(await invoke(saveInseamMeasurement, ctx, input(89, "measure-003")))
      .toMatchObject({ withinTolerance: false });
    expect(await invoke(getSaddleState, ctx)).toMatchObject({ model: { halfWidthMm: 23, canCheckKneeAngle: false } });
    await expect(invoke(saveInseamMeasurement, ctx, input(105, "measure-004")))
      .rejects.toThrow("INSEAM_OVERRIDE_REQUIRED");
    await invoke(saveInseamMeasurement, ctx, { ...input(105, "measure-004"), override: true, confirmed: true });
    expect(ctx.tables.get("profileObservations")?.find(row => row.status === "current"))
      .toMatchObject({ unresolvedWarning: true });
  });
  it.each([54, 106, NaN, Infinity])("rejects invalid inseam %s before writes", async value => {
    const ctx = context(); await profile(ctx); ctx.db.insert.mockClear();
    await expect(invoke(saveInseamMeasurement, ctx, input(value))).rejects.toThrow();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
  it("keeps a moderate warning open unless explicitly confirmed", async () => {
    const ctx = context(); await profile(ctx);
    await invoke(saveInseamMeasurement, ctx, input(95));
    expect(ctx.tables.get("profileObservations")?.find(row => row.status === "current"))
      .toMatchObject({ unresolvedWarning: true });
    const second = context(); await profile(second);
    await invoke(saveInseamMeasurement, second, { ...input(95), confirmed: true });
    expect(second.tables.get("profileObservations")?.find(row => row.status === "current"))
      .toMatchObject({ unresolvedWarning: false });
  });
});

describe("owned paid knee measurements", () => {
  const knee = { angleDegrees: 40, currentSaddleHeightMm: 787, requestId: "knee-measure-001" };
  it("allows signed-in users with enforcement off, computes max5mm server side, schedules once", async () => {
    const ctx = context(); await profile(ctx, { inseamCm: 89 });
    const result = await invoke(saveKneeAngle, ctx, knee);
    expect(result).toMatchObject({ stepMm: 5, targetSaddleHeightMm: 792, evaluationAfterDays: 7 });
    await invoke(saveKneeAngle, ctx, knee);
    expect(ctx.scheduler.runAt).toHaveBeenCalledTimes(1);
    expect(ctx.scheduler.runAt.mock.calls[0][0]).toBe(Date.now() + 7 * 86400000);
    expect(ctx.tables.get("reliabilityKneeMeasurements")).toHaveLength(1);
  });
  it("rejects free access when enforcement on and rejects another owner's bike even when off", async () => {
    const ctx = context(); await profile(ctx, { inseamCm: 89 });
    vi.stubEnv("PAID_ACCESS_ENFORCED", "true");
    await expect(invoke(saveKneeAngle, ctx, knee)).rejects.toThrow("PAID_ACCESS_REQUIRED");
    vi.stubEnv("PAID_ACCESS_ENFORCED", "false");
    const bikeId = await ctx.db.insert("bikes", { userId: "other" });
    await expect(invoke(saveKneeAngle, ctx, { ...knee, bikeId })).rejects.toThrow("Bike not found");
    expect(ctx.scheduler.runAt).not.toHaveBeenCalled();
  });
  it("keeps engine values unchanged and selects a genuine largest uncertainty reduction", async () => {
    const ctx = context(); const profileId = await profile(ctx, { inseamCm: 89 });
    await invoke(saveInseamMeasurement, ctx, input(89));
    const sessionId = await ctx.db.insert("fitSessions", { userId: "owner", profileId });
    await ctx.db.insert("recommendations", { userId: "owner", sessionId, createdAt: Date.now(),
      calculatedFit: { saddleHeightMm: 787, saddleSetbackMm: 62, handlebarDropMm: 74, handlebarReachMm: 510 } });
    const result = await invoke(getDashboardReliability, ctx, { sessionId });
    expect(result).toMatchObject({ rows: [
      { letter: "A", value: 787, range: { halfWidth: 49 } }, { letter: "B", value: 62 },
      { letter: "C", value: 74 }, { letter: "D", value: 510 },
    ], largestGain: { reduction: 26 } });
  });
  it("a retried knee save preserves the original evidence after profile changes", async () => {
    const ctx = context(); const id = await profile(ctx, { inseamCm: 89 });
    const first = await invoke(saveKneeAngle, ctx, knee);
    await ctx.db.patch(id, { inseamCm: 91 });
    expect(await invoke(saveKneeAngle, ctx, knee)).toEqual(first);
    expect(ctx.scheduler.runAt).toHaveBeenCalledTimes(1);
  });
  it("does not return another owner's report", async () => {
    const ctx = context(); await ctx.db.insert("recommendations", { userId: "other", sessionId: "foreign" });
    expect(await invoke(getDashboardReliability, ctx, { sessionId: "foreign" })).toBeNull();
  });
});

describe("evaluation service preferences and idempotency", () => {
  it("rechecks current preferences, due time, supersession and sent marker", async () => {
    const ctx = context(); const userId = await ctx.db.insert("users", { email: "owner@example.test",
      emailPreferences: { service: false } });
    const measurementId = await ctx.db.insert("reliabilityKneeMeasurements", { userId, evaluationAt: Date.now(),
      recordedAt: Date.now() - 7 * 86400000 });
    expect(await invoke(getEvaluationContext, ctx, { measurementId })).toBeNull();
    await ctx.db.patch(userId, { emailPreferences: { service: true } });
    expect(await invoke(getEvaluationContext, ctx, { measurementId })).toMatchObject({ user: { _id: userId } });
    await invoke(markEvaluationSent, ctx, { measurementId });
    expect(await invoke(getEvaluationContext, ctx, { measurementId })).toBeNull();
    const futureId = await ctx.db.insert("reliabilityKneeMeasurements", { userId, evaluationAt: Date.now() + 1 });
    expect(await invoke(getEvaluationContext, ctx, { measurementId: futureId })).toBeNull();
  });
});

describe("saddle account preferences", () => {
  it("persists touched controls, updates profile provenance and applies the climbing term", async () => {
    const ctx = context(); await profile(ctx, { inseamCm: 89 });
    await invoke(saveSaddlePreferences, ctx, { bikeType: "gravel", goal: "aero", flexibilityScore: 2,
      coreScore: 3, climbing: "high", currentSaddleHeightMm: 780 });
    expect(await invoke(getSaddleState, ctx)).toMatchObject({ preferences: {
      bikeType: "gravel", goal: "aero", flexibilityScore: 2, coreScore: 3, climbing: "high", currentSaddleHeightMm: 780 },
      model: { breakdown: { climbingMm: 4, goalMm: 6 } } });
    expect(ctx.tables.get("profileObservations")?.find(row => row.field === "flexibilityScore"))
      .toMatchObject({ kind: "estimated", method: "self_assessment", value: "limited" });
    await invoke(saveSaddlePreferences, ctx, { climbing: "low" });
    expect(ctx.tables.get("reliabilitySaddlePreferences")).toHaveLength(1);
    expect(await invoke(getSaddleState, ctx)).toMatchObject({ preferences: { goal: "aero", climbing: "low" } });
  });
  it("rejects foreign bikes and invalid scores without writes", async () => {
    const ctx = context(); const bikeId = await ctx.db.insert("bikes", { userId: "other" });
    ctx.db.insert.mockClear();
    await expect(invoke(saveSaddlePreferences, ctx, { bikeId, goal: "aero" })).rejects.toThrow("Bike not found");
    await expect(invoke(saveSaddlePreferences, ctx, { coreScore: 6 })).rejects.toThrow("Invalid score");
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
  it("hides paid dashboard rows when enforcement is on", async () => {
    const ctx = context(); const profileId = await profile(ctx, { inseamCm: 89 });
    const sessionId = await ctx.db.insert("fitSessions", { userId: "owner", profileId });
    await ctx.db.insert("recommendations", { userId: "owner", sessionId, createdAt: Date.now(),
      calculatedFit: { saddleHeightMm: 787, saddleSetbackMm: 62, handlebarDropMm: 74, handlebarReachMm: 510 } });
    vi.stubEnv("PAID_ACCESS_ENFORCED", "true");
    const result = await invoke(getDashboardReliability, ctx) as { rows: unknown[] };
    expect(result.rows).toHaveLength(1); expect(result.rows[0]).toMatchObject({ letter: "A" });
  });
});

describe("measurement series provenance", () => {
  it.each([80, 89])("resets old repeated evidence after an external measured edit to %s", async nextValue => {
    const ctx = context(); await profile(ctx);
    for (let count = 1; count <= 3; count++) await invoke(saveInseamMeasurement, ctx,
      input(89, `old-series-${count}`));
    await invoke(saveObservation, ctx, { field: "inseamCm", value: nextValue, kind: "measured",
      method: "single_measurement", expectedCurrentValue: 89, confirmed: true });
    expect(await invoke(getSaddleState, ctx)).toMatchObject({ measurements: [], model: { canCheckKneeAngle: false } });
    const saved = await invoke(saveInseamMeasurement, ctx, { ...input(nextValue, "new-series-001"), confirmed: true });
    expect(saved).toMatchObject({ meanInseamCm: nextValue, repeatCount: 2 });
    expect(await invoke(getSaddleState, ctx)).toMatchObject({ model: { measurementCount: 2, meanInseamCm: nextValue } });
  });
  it("preserves retry response after a later edit and rejects the reserved seed namespace", async () => {
    const ctx = context(); const id = await profile(ctx);
    const result = await invoke(saveInseamMeasurement, ctx, input());
    await ctx.db.patch(id, { inseamCm: 80 });
    expect(await invoke(saveInseamMeasurement, ctx, input())).toEqual(result);
    await expect(invoke(saveInseamMeasurement, ctx, input(89, "profile-seed"))).rejects.toThrow("Invalid request");
    await expect(invoke(saveInseamMeasurement, ctx, input(89, "internal-seed-any"))).rejects.toThrow("Invalid request");
  });
  it.each([50, 110])("does not seed a legacy measured inseam outside current bounds: %s", async value => {
    const ctx = context(); await profile(ctx, { inseamCm: value });
    await ctx.db.insert("profileObservations", { userId: "owner", field: "inseamCm", value,
      unit: "cm", kind: "measured", method: "single_measurement", status: "current", recordedAt: Date.now() });
    expect(await invoke(getSaddleState, ctx)).toMatchObject({ model: null });
    expect(await invoke(saveInseamMeasurement, ctx, input(89)))
      .toMatchObject({ meanInseamCm: 89, repeatCount: 1 });
    expect(ctx.tables.get("reliabilityInseamMeasurements")).toHaveLength(1);
    expect(await invoke(getSaddleState, ctx))
      .toMatchObject({ model: { meanInseamCm: 89, measurementCount: 1 } });
  });
  it("keeps legacy invalid profiles editable and rejects impossible current heights", async () => {
    const ctx = context(); await profile(ctx, { inseamCm: 50 });
    expect(await invoke(getSaddleState, ctx)).toMatchObject({ model: null });
    await expect(invoke(saveKneeAngle, ctx, { angleDegrees: 31,
      currentSaddleHeightMm: 1e6, requestId: "knee-invalid" })).rejects.toThrow("Invalid saddle height");
  });
});
