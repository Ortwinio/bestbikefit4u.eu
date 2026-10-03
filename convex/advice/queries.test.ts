import { beforeEach, describe, expect, it, vi } from "vitest";
import { listAdviceGroups } from "./queries";
import type { AdviceGroup } from "../../shared/advice/types";
const { auth } = vi.hoisted(() => ({ auth: vi.fn() }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: auth }));
type Row = Record<string, unknown> & { _id: string };
function context(tables: Record<string, Row[]> = {}) {
  return { db: {
    get: async (id: string) => Object.values(tables).flat().find(row => row._id === id) ?? null,
    query: (table: string) => {
      const filters: Array<(row: Row) => boolean> = [];
      const index = { eq: (field: string, value: unknown) => { filters.push(row => row[field] === value); return index; } };
      const rows = () => (tables[table] ?? []).filter(row => filters.every(filter => filter(row)));
      const cursor = {
        withIndex: (_name: string, apply: (builder: typeof index) => unknown) => { apply(index); return cursor; },
        first: async () => rows()[0] ?? null, collect: async () => rows(),
      };
      return cursor;
    },
  } };
}
const invoke = (tables: Record<string, Row[]> = {}, args: { bikeId?: string } = {}) =>
  (listAdviceGroups as unknown as { _handler: (ctx: unknown, args: unknown) => Promise<AdviceGroup[]> })._handler(context(tables), args);
const pressure = (id: string, createdAt: number, overrides = {}): Row => ({ _id: id, userId: "owner", createdAt,
  recommendedFrontBar: 4, recommendedRearBar: 4.5, currentFrontBar: 4.2, ...overrides });
beforeEach(() => auth.mockResolvedValue("owner"));
describe("listAdviceGroups", () => {
  it("requires authentication", async () => { auth.mockResolvedValue(null); await expect(invoke()).rejects.toThrow("Not authenticated"); });
  it("returns all seven stable empty groups, not fixture advice", async () => {
    const groups = await invoke();
    expect(groups.map(group => group.key)).toEqual(["seating", "contact", "cockpit", "drivetrain", "tires", "performance", "frame"]);
    expect(groups.flatMap(group => group.items)).toEqual([]);
  });
  it("checks explicit bike ownership", async () => {
    await expect(invoke({ bikes: [{ _id: "other-bike", userId: "other" }] }, { bikeId: "other-bike" })).rejects.toThrow("Bike not found");
  });
  it("excludes another owner and orphaned or transferred bikes; chooses latest per bike", async () => {
    const groups = await invoke({ bikes: [{ _id: "bike", userId: "owner" }], pressureCalculations: [
      pressure("old", 1), pressure("latest", 2), pressure("foreign", 3, { userId: "other" }),
      pressure("orphan", 4, { bikeId: "missing" }), pressure("bike-latest", 3, { bikeId: "bike" }),
    ] });
    expect(groups[4].items.map(item => item.id)).toEqual([
      "bike-latest:pressureFrontBar", "bike-latest:pressureRearBar", "latest:pressureFrontBar", "latest:pressureRearBar",
    ]);
    expect(groups[4].items[0].staleness.status).toBe("unknown");
    expect(groups[4].items[0].reliability.value).toBeNull();
    expect(groups[4].items[0].difference).toBeCloseTo(-0.2);
    expect(groups.every(group => group.improvements.length <= 3)).toBe(true);
  });
  it("compares canonical current values and observation identity without cross-bike leakage", async () => {
    const groups = await invoke({ profiles: [{ _id: "profile", userId: "owner", weightKg: 72, _creationTime: 1 }],
      pressureCalculations: [pressure("result", 1, { inputProvenance: { version: 1, capturedAt: 1,
        dependencies: [{ field: "weightKg", value: 70, observationId: "weight1" }] } })] });
    expect(groups[4].items[0].status).toBe("stale");
    expect(groups[4].items[0].staleness.reasons[0].reason).toBe("value_changed");
  });
  it("does not convert saved defaults into results", async () => {
    const groups = await invoke({ calculatorStates: [{ _id: "state", userId: "owner", calculator: "ftp-wkg", updatedAt: 4,
      state: { calculator: "ftp-wkg", values: { values: { ftp: 250 } } } }] });
    expect(groups[5].items[0]).toMatchObject({ value: null, range: null, status: "needs_calculation", sourceLink: "/tools/ftp-wkg" });
  });
  it("shows persisted per-item progress without hiding stale inputs", async () => {
    const progress = { key: "pressureFrontBar", performedAt: 1 };
    const row = pressure("result", 1, { adviceRevision: 2, adviceProgress: [progress] });
    const tables = { pressureCalculations: [row] };
    let item = (await invoke(tables))[4].items[0];
    expect(item).toMatchObject({ status: "waiting_feedback", source: "pressureCalculations", adviceRevision: 2, progress });
    row.adviceProgress = [{ ...progress, feedback: { result: "same", recordedAt: 2 } }];
    item = (await invoke(tables))[4].items[0];
    expect(item.status).toBe("performed");
    row.inputProvenance = { version: 1, capturedAt: 1, dependencies: [{ field: "weightKg", value: 70 }] };
    item = (await invoke(tables))[4].items[0];
    expect(item.status).toBe("stale");
    expect(item.progress?.feedback?.result).toBe("same");
    expect((await invoke(tables))[4].items[1].progress).toBeUndefined();
  });
  it("prefers a replacement outcome even when its createdAt clock is unchanged", async () => {
    const older = pressure("old", 1, { _creationTime: 2,
      adviceProgress: [{ key: "pressureFrontBar", performedAt: 1, feedback: { result: "better", recordedAt: 2 } }] });
    const replacement = pressure("new", 1, { _creationTime: 3 });
    const groups = await invoke({ pressureCalculations: [replacement, older] });
    expect(groups[4].items[0]).toMatchObject({ recordId: "new", status: "new", adviceRevision: 0 });
    expect(groups[4].items[0].progress).toBeUndefined();
  });
  it("offers only explicitly linked owned ride feedback after this item's performed date", async () => {
    const fit = { _id: "fit", userId: "owner", sessionId: "session", createdAt: 1, confidenceScore: 80,
      calculatedFit: { saddleHeightMm: 700, saddleHeightRange: { min: 695, max: 705 } },
      adviceProgress: [{ key: "saddleHeightMm", performedAt: 2 }] };
    const ride = { _id: "ride", userId: "owner", sessionId: "session", createdAt: 3, notes: "explicit optional note" };
    const groups = await invoke({ recommendations: [fit], rideFeedbackEntries: [ride,
      { ...ride, _id: "foreign", userId: "foreign" }, { ...ride, _id: "other-session", sessionId: "other" },
      { ...ride, _id: "old", createdAt: 1 }, { ...ride, _id: "wrong-bike", bikeId: "wrong" }] });
    expect(groups[0].items[0].eligibleRideFeedback).toEqual([{ id: "ride", date: 3, note: "explicit optional note" }]);
    expect(groups[0].items[0].status).toBe("waiting_feedback");
  });
  it("keeps a known absent tire limit current until a limit is added, but detects deletion", async () => {
    const tire: Row = { _id: "tire", userId: "owner", wheelsetId: "wheel" };
    const tables = { bikes: [{ _id: "bike", userId: "owner" }],
      wheelsets: [{ _id: "wheel", userId: "owner", bikeId: "bike" }], tireSetups: [tire],
      pressureCalculations: [pressure("result", 1, { bikeId: "bike", inputProvenance: { version: 1, capturedAt: 1,
        dependencies: [{ field: "maxPressureBar", bikeId: "bike", record: { table: "tireSetups", id: "tire" }, value: null }] } })] };
    expect((await invoke(tables))[4].items[0].staleness.status).toBe("current");
    tire.maxPressureBar = 4;
    expect((await invoke(tables))[4].items[0].staleness.reasons[0].reason).toBe("value_changed");
    delete tire.maxPressureBar;
    expect((await invoke(tables))[4].items[0].staleness.status).toBe("current");
    tables.tireSetups = [];
    expect((await invoke(tables))[4].items[0].staleness.reasons[0].reason).toBe("missing_input");
  });
  it("checks used tire widths and rim fields, ignoring unrelated tires", async () => {
    const tables = {
      bikes: [{ _id: "bike", userId: "owner" }],
      wheelsets: [{ _id: "wheel", userId: "owner", bikeId: "bike", rimType: "hooked" }],
      tireSetups: [{ _id: "tire", userId: "owner", wheelsetId: "wheel", widthFrontMm: 28 },
        { _id: "other-tire", userId: "owner", wheelsetId: "wheel", widthFrontMm: 55 }],
      pressureCalculations: [pressure("pressure", 1, { bikeId: "bike", inputProvenance: { version: 1, capturedAt: 1,
        dependencies: [
          { field: "widthFrontMm", bikeId: "bike", record: { table: "tireSetups", id: "tire" }, value: 28 },
          { field: "rimType", bikeId: "bike", record: { table: "wheelsets", id: "wheel" }, value: "hooked" },
        ] } })],
    };
    expect((await invoke(tables))[4].items[0].staleness.status).toBe("current");
    tables.tireSetups[0].widthFrontMm = 30;
    expect((await invoke(tables))[4].items[0].staleness.reasons[0]).toMatchObject({ reason: "value_changed", field: "widthFrontMm" });
    tables.tireSetups[0].widthFrontMm = 28;
    tables.wheelsets[0].rimType = "hookless";
    expect((await invoke(tables))[4].items[0].staleness.reasons[0]).toMatchObject({ reason: "value_changed", field: "rimType" });
    tables.wheelsets[0].rimType = "hooked";
    tables.tireSetups[0].userId = "foreign";
    expect((await invoke(tables))[4].items[0].staleness.reasons[0].reason).toBe("missing_input");
    tables.tireSetups[0].userId = "owner";
    tables.wheelsets[0].bikeId = "different-bike";
    expect((await invoke(tables))[4].items[0].staleness.reasons.every(reason => reason.reason === "missing_input")).toBe(true);
  });
  it("merges owned dashboard saddle and gearing outcomes, not public or foreign sessions", async () => {
    const saddle = { _id: "saddle", userId: "owner", sessionType: "dashboard", createdAt: 2,
      recommendedWidthMm: 145, widthRangeMinMm: 140, widthRangeMaxMm: 150, currentSaddleWidthMm: 140, confidenceScore: 75 };
    const gearing = { _id: "gearing", userId: "owner", sessionType: "dashboard", createdAt: 3,
      math: { rangePercent: 400 }, suitability: { confidence: { score: 85 } } };
    const groups = await invoke({ saddleWidthSessions: [saddle, { ...saddle, _id: "public", sessionType: "public", createdAt: 4 }],
      gearingSessions: [gearing, { ...gearing, _id: "foreign", userId: "foreign", createdAt: 4 }] });
    expect(groups[1].items).toHaveLength(1);
    expect(groups[1].items[0]).toMatchObject({ value: 145, current: 140, difference: 5,
      range: { min: 140, max: 150 }, reliability: { value: 75 } });
    expect(groups[3].items).toHaveLength(1);
    expect(groups[3].items[0]).toMatchObject({ value: 400, unit: "%", reliability: { value: 85 } });
  });
  it("uses explicitly persisted calculation outputs", async () => {
    const groups = await invoke({ calculatorStates: [{ _id: "state", userId: "owner", calculator: "ftp-wkg", updatedAt: 4,
      adviceOutput: [{ key: "wkg", value: 3, unit: "W/kg" }] }] });
    expect(groups[5].items[0]).toMatchObject({ key: "wkg", value: 3, unit: "W/kg", status: "new" });
  });
  it("places actual bike-fit output keys in seating, cockpit and frame groups without duplication", async () => {
    const keys = ["saddleHeight", "saddleSetback", "barDrop", "saddleToBarReach", "frameStack", "frameReach"];
    const groups = await invoke({ calculatorStates: [{ _id: "fit-state", userId: "owner", calculator: "bike-fit", updatedAt: 4,
      adviceOutput: keys.map((key, index) => ({ key, value: 100 + index, unit: "mm" })) }] });
    expect(groups.find(group => group.key === "seating")!.items.map(item => item.key)).toEqual(["saddleHeight", "saddleSetback"]);
    expect(groups.find(group => group.key === "cockpit")!.items.map(item => item.key)).toEqual(["barDrop", "saddleToBarReach"]);
    expect(groups.find(group => group.key === "frame")!.items.map(item => item.key)).toEqual(["frameReach", "frameStack"]);
    expect(groups.flatMap(group => group.items)).toHaveLength(keys.length);
  });
  it("preserves supported owned-bike scope in each calculator source link without measurement values", async () => {
    const bikeId = "bike/one&two";
    const groups = await invoke({ bikes: [{ _id: bikeId, userId: "owner" }],
      saddleWidthSessions: [{ _id: "saddle", userId: "owner", bikeId, sessionType: "dashboard", createdAt: 1,
        recommendedWidthMm: 145, widthRangeMinMm: 140, widthRangeMaxMm: 150 }],
      gearingSessions: [{ _id: "gearing", userId: "owner", bikeId, sessionType: "dashboard", createdAt: 1,
        math: { rangePercent: 400 }, suitability: { confidence: { score: 85 } } }],
      pressureCalculations: [pressure("pressure", 1, { bikeId })],
      calculatorStates: [{ _id: "state", userId: "owner", bikeId, calculator: "bike-fit", updatedAt: 1,
        adviceOutput: [{ key: "barDrop", value: 70, unit: "mm" }] },
      { _id: "uncalculated", userId: "owner", bikeId, calculator: "ftp-wkg", updatedAt: 1 }],
    });
    const links = groups.flatMap(group => group.items.map(item => item.sourceLink));
    expect(new Set(links.map(link => new URL(link, "https://example.test").pathname))).toEqual(new Set([
      "/saddle-selector", "/gearing", "/pressure-calculator", "/tools/bike-fit", "/tools/ftp-wkg",
    ]));
    for (const link of links) {
      const url = new URL(link, "https://example.test");
      expect([...url.searchParams.entries()]).toEqual([["bikeId", bikeId]]);
      expect(link).toContain("bikeId=bike%2Fone%26two");
    }
  });
  it.each(["56-57 cm", "M-L"])("preserves frame-size result %s without inventing a midpoint", async frameSize => {
    const groups = await invoke({ calculatorStates: [{ _id: "state", userId: "owner", calculator: "frame-size", updatedAt: 4,
      adviceOutput: [{ key: "frameSize", value: frameSize, unit: "" }] }] });
    expect(groups[6].items[0]).toMatchObject({ key: "frameSize", value: frameSize,
      range: null, difference: null, status: "new" });
  });
  it("does not publish empty string or nonfinite results", async () => {
    const groups = await invoke({ calculatorStates: [{ _id: "state", userId: "owner", calculator: "frame-size", updatedAt: 4,
      adviceOutput: [{ key: "frameSize", value: "  ", unit: "" }, { key: "invalid", value: Number.NaN, unit: "mm" }] }] });
    expect(groups[6].items).toEqual([]);
  });
  it("honors engine aliases, ranges and changeOrder before default fields", async () => {
    const groups = await invoke({ recommendations: [{ _id: "fit", userId: "owner", sessionId: "session", createdAt: 1,
      confidenceScore: 80, calculatedFit: { saddleHeightMm: 700, saddleHeightRange: { min: 695, max: 705 },
        handlebarDropMm: 50, handlebarReachMm: 600 }, recommendationItems: [
        { parameter: "saddleToBarReachMm", target: 590, confidence: 0.88, changeOrder: 1, rangeLow: 580, rangeHigh: 600 },
        { parameter: "barDropMm", target: 45, changeOrder: 2 },
      ] }] });
    expect(groups[2].items[0]).toMatchObject({ key: "handlebarReachMm", value: 590, range: { min: 580, max: 600 } });
    expect(groups[2].items[1]).toMatchObject({ key: "handlebarDropMm", value: 45 });
    expect(groups[2].items[0].reliability.value).toBe(88);
    expect(groups[2].items[1].reliability.value).toBe(80);
  });
});
