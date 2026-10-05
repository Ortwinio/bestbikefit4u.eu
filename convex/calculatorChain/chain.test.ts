import { afterEach, describe, expect, it, vi } from "vitest";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { applyChanges } from "./mutations";
import { getContext } from "./queries";
import { captureSessionProfile, sessionProfile } from "../sessions/profileSnapshot";

const { auth } = vi.hoisted(() => ({ auth: vi.fn(async () => "user1" as string | null) }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: auth }));
afterEach(() => auth.mockResolvedValue("user1"));
type Row = Record<string, unknown>;
const rider = { _id: "profile1", _creationTime: 1, userId: "user1", heightCm: 180,
  inseamCm: 84, flexibilityScore: "average", coreStabilityScore: 3, updatedAt: 10 };
const bike = { _id: "bike1", _creationTime: 1, userId: "user1", bikeType: "road", updatedAt: 1,
  currentSetup: { saddleHeightMm: 740, crankLengthMm: 172.5 }, name: "Bike" };
function context(extra: Record<string, Row[]> = {}) {
  const tables: Record<string, Row[]> = { profiles: [rider], bikes: [bike], profileObservations: [], ...extra };
  const db = {
    get: vi.fn(async (id: unknown) => Object.values(tables).flat().find(row => row._id === id) ?? null),
    query: vi.fn((table: string) => {
      const conditions: [string, unknown][] = [];
      const index = { eq: (key: string, value: unknown) => { conditions.push([key, value]); return index; } };
      const rows = () => (tables[table] ?? []).filter(row => conditions.every(([key, value]) => row[key] === value));
      const query = {
        withIndex: (_name: string, callback: (q: typeof index) => unknown) => { callback(index); return query; },
        filter: () => query, collect: async () => rows(), unique: async () => rows()[0] ?? null,
      };
      return query;
    }),
    insert: vi.fn(async () => "new-id"), patch: vi.fn(async () => undefined),
  };
  return { db, runMutation: vi.fn(async () => undefined) };
}
const save = (applyChanges as unknown as {
  _handler: (ctx: MutationCtx, args: { calculator: string; bikeId?: string; tireSetupId?: string; changes: Row[];
    automatic?: boolean; expectedUserId?: string }) => Promise<unknown>;
})._handler;
const read = (getContext as unknown as {
  _handler: (ctx: QueryCtx, args: { bikeId?: string }) => Promise<Record<string, unknown>>;
})._handler;
const change = { field: "inseamCm", value: 85, expectedCurrentValue: 84, kind: "declared" };

describe("account calculator chain", () => {
  it.each([84, 85])("blocks a queued declaration after the profile evidence becomes measured, incoming %s", async value => {
    const ctx = context({ profileObservations: [{ _id: "recent-measurement", userId: "user1", field: "inseamCm",
      value: 84, kind: "measured", status: "current", recordedAt: Date.now() }] });
    expect(await save(ctx as unknown as MutationCtx, { calculator: "bike-fit", automatic: true,
      expectedUserId: "user1", changes: [{ ...change, value }] })).toEqual({ status: "conflict",
      conflicts: [{ field: "inseamCm", currentValue: 84, incomingValue: value }] });
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
  it("rejects queued autosave after an account change", async () => {
    const ctx = context();
    await expect(save(ctx as unknown as MutationCtx, { calculator: "bike-fit", automatic: true,
      expectedUserId: "previous-user", changes: [change] })).rejects.toThrow("ACCOUNT_CHANGED");
    expect(ctx.db.query).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
  it("keeps explicit measured-profile replacement available after review", async () => {
    const ctx = context({ profileObservations: [{ _id: "measurement", userId: "user1", field: "inseamCm",
      value: 84, kind: "measured", status: "current" }] });
    expect(await save(ctx as unknown as MutationCtx, { calculator: "bike-fit", automatic: false,
      expectedUserId: "user1", changes: [change] })).toEqual({ status: "saved", fields: ["inseamCm"] });
    expect(ctx.db.insert).toHaveBeenCalledWith("profileObservations", expect.objectContaining({ kind: "declared" }));
  });
  it("allows a new actual measurement to replace an earlier measured profile value automatically", async () => {
    const ctx = context({ profileObservations: [{ _id: "measurement", userId: "user1", field: "inseamCm",
      value: 84, kind: "measured", status: "current" }] });
    expect(await save(ctx as unknown as MutationCtx, { calculator: "bike-fit", automatic: true,
      expectedUserId: "user1", changes: [{ ...change, kind: "measured" }] }))
      .toEqual({ status: "saved", fields: ["inseamCm"] });
    expect(ctx.db.insert).toHaveBeenCalledWith("profileObservations", expect.objectContaining({ kind: "measured", value: 85 }));
  });
  it("rejects unauthenticated requests and another owner's bike before writes", async () => {
    const ctx = context();
    auth.mockResolvedValue(null);
    await expect(save(ctx as unknown as MutationCtx, { calculator: "bike-fit", changes: [change] }))
      .rejects.toThrow("Not authenticated");
    auth.mockResolvedValue("user1");
    await expect(save(ctx as unknown as MutationCtx, { calculator: "bike-fit", bikeId: "foreign", changes: [change] }))
      .rejects.toThrow("Bike not found");
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
  it("returns all conflicts without partially writing otherwise valid changes", async () => {
    const ctx = context();
    expect(await save(ctx as unknown as MutationCtx, { calculator: "bike-fit", changes: [change,
      { field: "heightCm", value: 181, expectedCurrentValue: 170, kind: "declared" },
    ] })).toEqual({ status: "conflict", conflicts: [{ field: "heightCm", currentValue: 180, incomingValue: 181 }] });
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
  it("validates every change before writing and never accepts arbitrary paths or out-of-range values", async () => {
    for (const invalid of [{ field: "adminNotes", value: "private" }, { value: 500 },
      { source: "bike" }, { field: "flexibilityScore", value: "good", kind: "measured" }]) {
      const ctx = context();
      await expect(save(ctx as unknown as MutationCtx, { calculator: "bike-fit", changes: [{ ...change, ...invalid }] }))
        .rejects.toThrow();
      expect(ctx.db.patch).not.toHaveBeenCalled();
      expect(ctx.db.insert).not.toHaveBeenCalled();
    }
  });
  it("writes only explicitly changed values and preserves declared provenance", async () => {
    const ctx = context();
    expect(await save(ctx as unknown as MutationCtx, { calculator: "bike-fit", changes: [change] }))
      .toEqual({ status: "saved", fields: ["inseamCm"] });
    expect(ctx.db.insert).toHaveBeenCalledWith("profileObservations", expect.objectContaining({
      field: "inseamCm", value: 85, kind: "declared", method: "self_report", userId: "user1",
    }));
    expect(ctx.db.patch).toHaveBeenCalledWith("profile1", expect.objectContaining({ inseamCm: 85 }));
    expect(ctx.db.patch).not.toHaveBeenCalledWith("profile1", expect.objectContaining({ heightCm: expect.anything() }));
  });
  it("does not invent a new observation or date for unchanged values", async () => {
    const ctx = context();
    expect(await save(ctx as unknown as MutationCtx, { calculator: "bike-fit",
      changes: [{ ...change, value: 84 }] })).toEqual({ status: "saved", fields: [] });
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
  it("rejects derived values replacing measured evidence", async () => {
    const ctx = context({ profileObservations: [{ _id: "obs", userId: "user1", field: "inseamCm",
      value: 84, kind: "measured", status: "current" }] });
    await expect(save(ctx as unknown as MutationCtx, { calculator: "bike-fit",
      changes: [{ ...change, kind: "derived" }] })).rejects.toThrow("cannot replace a measurement");
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
  it("requires the saddle reference point and preserves other bike settings", async () => {
    const ctx = context();
    const saddle = { field: "currentSetup.saddleHeightMm", value: 745, expectedCurrentValue: 740, kind: "measured" };
    await expect(save(ctx as unknown as MutationCtx, { calculator: "saddle-height", bikeId: "bike1", changes: [saddle] }))
      .rejects.toThrow("measurement point required");
    await save(ctx as unknown as MutationCtx, { calculator: "saddle-height", bikeId: "bike1",
      changes: [{ ...saddle, measurePoint: "bb_center_to_saddle_top" }] });
    expect(ctx.db.patch).toHaveBeenCalledWith("bike1", expect.objectContaining({ currentSetup: expect.objectContaining({
      saddleHeightMm: 745, crankLengthMm: 172.5,
      saddleHeightMeasurement: expect.objectContaining({ measurePoint: "bb_center_to_saddle_top" }),
    }) }));
  });
  it("patches the real newest active tire setup without creating duplicate bike tires", async () => {
    const ctx = context({
      wheelsets: [{ _id: "wheel", userId: "user1", bikeId: "bike1", createdAt: 1, isActive: true }],
      tireSetups: [{ _id: "tire", userId: "user1", wheelsetId: "wheel", createdAt: 1,
        isActive: true, widthFrontMm: 28 }],
    });
    await save(ctx as unknown as MutationCtx, { calculator: "tire-pressure", bikeId: "bike1", tireSetupId: "tire", changes: [{
      field: "tires.widthFrontMm", value: 30, expectedCurrentValue: 28, kind: "declared",
    }] });
    expect(ctx.db.patch).toHaveBeenCalledWith("tire", expect.objectContaining({ widthFrontMm: 30 }));
    expect(ctx.db.patch).not.toHaveBeenCalledWith("bike1", expect.anything());
  });
  it("rejects stale active tire identities even when their values happen to match", async () => {
    const ctx = context({
      wheelsets: [{ _id: "wheel", userId: "user1", bikeId: "bike1", createdAt: 1, isActive: true }],
      tireSetups: [{ _id: "new-tire", userId: "user1", wheelsetId: "wheel", createdAt: 1,
        isActive: true, widthFrontMm: 28 }],
    });
    await expect(save(ctx as unknown as MutationCtx, { calculator: "tire-pressure", bikeId: "bike1",
      tireSetupId: "previous-tire", changes: [{
        field: "tires.widthFrontMm", value: 30, expectedCurrentValue: 28, kind: "declared",
      }] })).rejects.toThrow("Active tire setup changed");
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
  it("requires an explicit FTP protocol so changed watts cannot inherit an old test method", async () => {
    const ctx = context({ profiles: [{ ...rider, ftpWatts: 200, ftpMethod: "ramp" }] });
    const ftp = { field: "ftpWatts", value: 220, expectedCurrentValue: 200, kind: "declared" };
    await expect(save(ctx as unknown as MutationCtx, { calculator: "gearing", changes: [ftp] }))
      .rejects.toThrow("FTP_METHOD_REQUIRED");
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
    await save(ctx as unknown as MutationCtx, { calculator: "gearing", changes: [ftp,
      { field: "ftpMethod", value: "known", expectedCurrentValue: "ramp", kind: "declared" },
    ] });
    expect(ctx.db.patch).toHaveBeenCalledWith("profile1", expect.objectContaining({ ftpWatts: 220, ftpMethod: "known" }));
  });
  it("returns only the authenticated rider's context and matching current evidence", async () => {
    const ctx = context({ profiles: [rider, { ...rider, _id: "other", userId: "user2" }],
      bikes: [bike, { ...bike, _id: "otherBike", userId: "user2" }],
      calculatorStates: [{ userId: "user1", calculator: "saddle-height", updatedAt: 5 },
        { userId: "user2", calculator: "frame-size", updatedAt: 20 }],
    });
    const result = await read(ctx as unknown as QueryCtx, {});
    expect(result.profile).toEqual(rider);
    expect(result.bikes).toEqual([bike]);
    expect(result.recentCalculators).toEqual([{ calculator: "saddle-height", updatedAt: 5, bikeId: undefined }]);
    expect(JSON.stringify(result)).not.toContain("user2");
  });
});

describe("immutable fit inputs", () => {
  it("captures actual evidence IDs and keeps measurements fixed after later profile edits", async () => {
    const ctx = context({ profileObservations: [{ _id: "obs", userId: "user1", field: "inseamCm",
      value: 84, kind: "measured", status: "current", unit: "cm", method: "single_measurement",
      source: "profile_edit", recordedAt: 2 }] });
    const snapshot = await captureSessionProfile(ctx as unknown as QueryCtx, rider as unknown as Doc<"profiles">);
    expect(snapshot.profileObservationSnapshot).toContainEqual(expect.objectContaining({ observationId: "obs", value: 84 }));
    const resolved = sessionProfile({ ...rider, inseamCm: 90 } as unknown as Doc<"profiles">,
      { ...snapshot, status: "in_progress" });
    expect(resolved.inseamCm).toBe(84);
  });
  it("requires explicit trial consent, never borrows a measured ID for changed values, and never patches profile", async () => {
    const ctx = context();
    const inputs = { heightCm: 181, inseamCm: 85, flexibility: 3 as const, core: 3 as const,
      source: "measured" as const, ambition: "comfort" as const, category: "road" as const };
    await expect(captureSessionProfile(ctx as unknown as QueryCtx, rider as unknown as Doc<"profiles">, inputs))
      .rejects.toThrow("CALCULATOR_PROFILE_CONFLICT");
    const snapshot = await captureSessionProfile(ctx as unknown as QueryCtx, rider as unknown as Doc<"profiles">, inputs, true);
    const evidence = snapshot.profileObservationSnapshot.find(item => item.field === "inseamCm");
    expect(evidence).toMatchObject({ value: 85, kind: "estimated", method: "calculator_trial" });
    expect(evidence).not.toHaveProperty("observationId");
    expect(snapshot.inputProvenance.dependencies.some(item => item.field === "inseamCm")).toBe(false);
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
});
