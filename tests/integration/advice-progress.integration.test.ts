import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listAdviceGroups } from "../../convex/advice/queries";
import { markPerformed, submitFeedback } from "../../convex/advice/progress";
import { recalculateAll } from "../../convex/advice/mutations";
import { calculatorDefaults } from "../../src/lib/calculators/accountState";
import type { AdviceGroup, AdviceItem } from "../../shared/advice/types";

const auth = vi.hoisted(() => ({ user: "users:owner" as string | null }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: async () => auth.user }));

type Row = Record<string, unknown> & { _id: string };
const now = Date.UTC(2026, 9, 3, 12);
const today = Date.UTC(2026, 9, 3);

function fixture(extra: Record<string, Row[]> = {}) {
  const tables: Record<string, Row[]> = {
    profiles: [{ _id: "profiles:owner", userId: "users:owner", _creationTime: now - 86400000,
      heightCm: 180, inseamCm: 81 }],
    calculatorStates: [{ _id: "calculatorStates:frame", userId: "users:owner", calculator: "frame-size",
      state: { calculator: "frame-size", values: calculatorDefaults["frame-size"] }, updatedAt: now }],
    ...extra,
  };
  const get = async (id: string) => Object.values(tables).flat().find(row => row._id === id) ?? null;
  const db = {
    get,
    normalizeId: (table: string, id: string) => id.startsWith(`${table}:`) ? id : null,
    query: (table: string) => {
      const filters: Array<[string, unknown]> = [];
      const index = { eq: (field: string, value: unknown) => { filters.push([field, value]); return index; } };
      const rows = () => (tables[table] ?? []).filter(row => filters.every(([field, value]) => row[field] === value));
      const cursor = {
        withIndex: (_name: string, apply: (builder: typeof index) => unknown) => { apply(index); return cursor; },
        collect: async () => rows(), first: async () => rows()[0] ?? null, unique: async () => rows()[0] ?? null,
      };
      return cursor;
    },
    patch: vi.fn(async (id: string, fields: Record<string, unknown>) => {
      const row = await get(id);
      if (!row) throw new Error("Missing document");
      for (const [field, value] of Object.entries(fields)) {
        if (value === undefined) delete row[field];
        else row[field] = value;
      }
    }),
  };
  return { tables, ctx: { db } };
}

function invoke<Result>(operation: unknown, ctx: unknown, args: object = {}): Promise<Result> {
  return (operation as { _handler: (context: unknown, input: object) => Promise<Result> })._handler(ctx, args);
}
async function items(ctx: unknown) {
  return (await invoke<AdviceGroup[]>(listAdviceGroups, ctx)).flatMap(group => group.items);
}
function identity(item: AdviceItem) {
  return { source: item.source, recordId: item.recordId, key: item.key,
    expectedRevision: item.adviceRevision, expectedUserId: "users:owner" };
}

beforeEach(() => { auth.user = "users:owner"; vi.spyOn(Date, "now").mockReturnValue(now); });
afterEach(() => vi.restoreAllMocks());

describe("persisted advice progress integration", () => {
  it.each(["better", "same", "worse"] as const)("persists %s feedback and resets the same result at the same clock", async result => {
    const { ctx } = fixture();
    await invoke(recalculateAll, ctx);
    const original = (await items(ctx))[0];
    expect(original.status).toBe("new");
    await invoke(markPerformed, ctx, { ...identity(original), performedAt: today, note: "  Changed setup  " });
    expect((await items(ctx))[0]).toMatchObject({ status: "waiting_feedback",
      progress: { performedAt: today, note: "Changed setup" } });
    await invoke(submitFeedback, ctx, { ...identity(original), result, note: "After my ride" });
    expect((await items(ctx))[0]).toMatchObject({ status: "performed",
      progress: { feedback: { result, note: "After my ride" } } });
    await invoke(recalculateAll, ctx);
    const replacement = (await items(ctx))[0];
    expect(replacement).toMatchObject({ recordId: original.recordId, value: original.value, status: "new" });
    expect(replacement.progress).toBeUndefined();
    expect(replacement.adviceRevision).toBeGreaterThan(original.adviceRevision!);
    await expect(invoke(submitFeedback, ctx, { ...identity(original), result })).rejects.toThrow("ADVICE_CHANGED");
    expect((await items(ctx))[0].status).toBe("new");
  });

  it("retains a stale warning without erasing performed evidence and denies a changed account", async () => {
    const { ctx, tables } = fixture();
    await invoke(recalculateAll, ctx);
    const original = (await items(ctx))[0];
    await invoke(markPerformed, ctx, { ...identity(original), performedAt: today });
    await invoke(submitFeedback, ctx, { ...identity(original), result: "same" });
    tables.profiles[0].inseamCm = 84;
    expect((await items(ctx))[0]).toMatchObject({ status: "stale", staleness: { stale: true },
      progress: { feedback: { result: "same" } } });
    auth.user = "users:other";
    expect(await items(ctx)).toEqual([]);
    await expect(invoke(markPerformed, ctx, { ...identity(original), performedAt: today })).rejects.toThrow();
    auth.user = "users:owner";
    expect((await items(ctx))[0].progress?.feedback?.result).toBe("same");
  });

  it("requires an actual result and a performed record before accepting feedback", async () => {
    const { ctx } = fixture();
    const saved = (await items(ctx))[0];
    expect(saved.status).toBe("needs_calculation");
    await expect(invoke(markPerformed, ctx, { ...identity(saved), performedAt: today })).rejects.toThrow();
    await invoke(recalculateAll, ctx);
    const calculated = (await items(ctx))[0];
    await expect(invoke(submitFeedback, ctx, { ...identity(calculated), result: "better" }))
      .rejects.toThrow("FEEDBACK_REQUIRES_PERFORMED");
  });

  it("links owned session ride feedback without inferring an outcome or rewriting the original ride", async () => {
    const ride = { _id: "rideFeedbackEntries:ride", userId: "users:owner", sessionId: "fitSessions:fit",
      createdAt: now - 3600000, comfortScore: 8, implementationStatus: "confirmed", notes: "Original ride note" };
    const originalRide = structuredClone(ride);
    const { ctx, tables } = fixture({ calculatorStates: [],
      fitSessions: [{ _id: "fitSessions:fit", userId: "users:owner" }],
      recommendations: [{ _id: "recommendations:fit", userId: "users:owner", sessionId: "fitSessions:fit",
        createdAt: now - 86400000, inputProvenance: { version: 1, capturedAt: now, dependencies: [] },
        calculatedFit: { saddleHeightMm: 720, saddleHeightRange: { min: 715, max: 725 } } }],
      rideFeedbackEntries: [ride],
    });
    const original = (await items(ctx))[0];
    expect(original.progress).toBeUndefined();
    await invoke(markPerformed, ctx, { ...identity(original), performedAt: today });
    const waiting = (await items(ctx))[0];
    expect(waiting.status).toBe("waiting_feedback");
    expect(waiting.eligibleRideFeedback).toContainEqual({ id: ride._id, date: ride.createdAt, note: ride.notes });
    expect(waiting.progress?.feedback).toBeUndefined();
    await invoke(submitFeedback, ctx, { ...identity(waiting), result: "same", rideFeedbackId: ride._id });
    expect((await items(ctx))[0]).toMatchObject({ status: "performed",
      progress: { feedback: { result: "same", rideFeedbackId: ride._id } } });
    expect(tables.rideFeedbackEntries).toEqual([originalRide]);
  });
});
