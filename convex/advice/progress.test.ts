import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { markPerformed, submitFeedback } from "./progress";
import { resetAdviceProgress } from "./revision";
const { auth } = vi.hoisted(() => ({ auth: vi.fn() }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: auth }));
type Row = Record<string, unknown> & { _id: string; adviceRevision?: number };
const today = Date.UTC(2026, 9, 3);
const now = today + 3600000;
function context(rows: Row[]) {
  return { db: {
    normalizeId: (table: string, id: string) => id.startsWith(`${table}:`) ? id : null,
    get: async (id: string) => rows.find(row => row._id === id) ?? null,
    patch: vi.fn(async (id: string, patch: object) => Object.assign(rows.find(row => row._id === id)!, patch)),
  } };
}
type Handler = { _handler: (ctx: unknown, args: unknown) => Promise<unknown> };
const mark = (ctx: unknown, args: object = {}) => (markPerformed as unknown as Handler)._handler(ctx,
  { source: "pressureCalculations", recordId: "pressureCalculations:1", key: "pressureFrontBar", expectedRevision: 0,
    performedAt: today, ...args });
const feedback = (ctx: unknown, args: object = {}) => (submitFeedback as unknown as Handler)._handler(ctx,
  { source: "pressureCalculations", recordId: "pressureCalculations:1", key: "pressureFrontBar", expectedRevision: 0,
    result: "better", ...args });
const pressure = (overrides = {}): Row => ({ _id: "pressureCalculations:1", userId: "owner", createdAt: now,
  recommendedFrontBar: 4, recommendedRearBar: 4.5, ...overrides });
beforeEach(() => { auth.mockResolvedValue("owner"); vi.spyOn(Date, "now").mockReturnValue(now); });
afterEach(() => vi.restoreAllMocks());

describe("advice progress ownership and lifecycle", () => {
  it("requires authentication and protects against account-switch writes", async () => {
    const ctx = context([pressure()]);
    auth.mockResolvedValue(null);
    await expect(mark(ctx)).rejects.toThrow("Not authenticated");
    auth.mockResolvedValue("owner");
    await expect(mark(ctx, { expectedUserId: "different" })).rejects.toThrow("AUTH_CHANGED");
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
  it.each([
    { userId: "foreign" }, { bikeId: "bikes:missing" },
  ])("rejects unavailable ownership %j", async override => {
    await expect(mark(context([pressure(override)]))).rejects.toThrow("ADVICE_NOT_FOUND");
  });
  it("checks bike ownership and source/table identity", async () => {
    const ctx = context([pressure({ bikeId: "bikes:1" }), { _id: "bikes:1", userId: "foreign" }]);
    await expect(mark(ctx)).rejects.toThrow("ADVICE_NOT_FOUND");
    await expect(mark(context([pressure()]), { source: "calculatorStates" })).rejects.toThrow("ADVICE_NOT_FOUND");
  });
  it("requires a real emitted item, never arbitrary keys or input-only calculator states", async () => {
    await expect(mark(context([pressure()]), { key: "arbitrary" })).rejects.toThrow("ADVICE_NOT_FOUND");
    const ctx = context([{ _id: "calculatorStates:1", userId: "owner", calculator: "ftp-wkg", updatedAt: now }]);
    await expect(mark(ctx, { source: "calculatorStates", recordId: "calculatorStates:1", key: "ftp-wkg" })).rejects.toThrow("ADVICE_NOT_FOUND");
  });
  it.each([today + 1, today + 86400000, today - 86400000, NaN, Infinity])("rejects invalid performed date %s", async performedAt => {
    await expect(mark(context([pressure()]), { performedAt })).rejects.toThrow("INVALID_DATE");
  });
  it("accepts the calculation's calendar date and records just the selected item", async () => {
    const row = pressure(); const ctx = context([row]);
    expect(await mark(ctx, { note: "  adjusted front  " })).toEqual({ status: "waiting_feedback" });
    expect(row.adviceProgress).toEqual([{ key: "pressureFrontBar", performedAt: today, note: "adjusted front" }]);
    expect(await feedback(ctx, { note: "  feels better  " })).toEqual({ status: "performed" });
    expect(row.adviceProgress).toEqual([{ key: "pressureFrontBar", performedAt: today, note: "adjusted front",
      feedback: { result: "better", note: "feels better", recordedAt: now } }]);
  });
  it.each(["better", "same", "worse"])("accepts explicit ride outcome %s without inferring a score", async result => {
    const row = pressure(); const ctx = context([row]); await mark(ctx); await feedback(ctx, { result });
    expect(row.adviceProgress).toEqual([{ key: "pressureFrontBar", performedAt: today, feedback: { result, recordedAt: now } }]);
  });
  it("requires performed state before feedback and rejects oversized notes", async () => {
    const ctx = context([pressure()]);
    await expect(feedback(ctx)).rejects.toThrow("FEEDBACK_REQUIRES_PERFORMED");
    await expect(mark(ctx, { note: "x".repeat(501) })).rejects.toThrow("INVALID_NOTE");
    await mark(ctx);
    await expect(feedback(ctx, { note: "x".repeat(501) })).rejects.toThrow("INVALID_NOTE");
    await expect(feedback(ctx, { result: "invented" })).rejects.toThrow("INVALID_FEEDBACK");
  });
  it("does not let late duplicate writes erase or overwrite feedback", async () => {
    const row = pressure(); const ctx = context([row]); await mark(ctx); await feedback(ctx);
    const persisted = structuredClone(row);
    expect(await mark(ctx)).toEqual({ status: "performed" });
    expect(await feedback(ctx)).toEqual({ status: "performed" });
    await expect(mark(ctx, { note: "different" })).rejects.toThrow("ADVICE_ALREADY_PERFORMED");
    await expect(feedback(ctx, { result: "worse" })).rejects.toThrow("FEEDBACK_ALREADY_RECORDED");
    expect(row).toEqual(persisted);
  });
  it("uses monotonically increasing revisions, independent of results and wall-clock timestamps", async () => {
    const row = pressure(); const ctx = context([row]); await mark(ctx);
    Object.assign(row, resetAdviceProgress(row));
    expect(row.adviceRevision).toBe(1); expect(row.adviceProgress).toBeUndefined();
    await expect(feedback(ctx)).rejects.toThrow("ADVICE_CHANGED");
    await expect(mark(ctx)).rejects.toThrow("ADVICE_CHANGED");
    await mark(ctx, { expectedRevision: 1 });
    Object.assign(row, resetAdviceProgress(row));
    expect(row.adviceRevision).toBe(2); expect(row.createdAt).toBe(now);
  });
  it.each([-1, 0.5, Number.MAX_SAFE_INTEGER])("rejects corrupt/exhausted revision %s", adviceRevision => {
    expect(() => resetAdviceProgress({ adviceRevision })).toThrow("INVALID_ADVICE_REVISION");
  });
  it("only links an owned feedback entry from the exact fit session, without copying notes", async () => {
    const row: Row = { _id: "recommendations:1", userId: "owner", sessionId: "fitSessions:1", createdAt: now,
      confidenceScore: 80, calculatedFit: { saddleHeightMm: 700, saddleHeightRange: { min: 695, max: 705 } } };
    const ride: Row = { _id: "rideFeedbackEntries:1", userId: "owner", sessionId: "fitSessions:1", createdAt: now,
      notes: "old ride notes", comfortScore: 5 };
    const ctx = context([row, ride, { _id: "fitSessions:1", userId: "owner" }]);
    const identity = { source: "recommendations", recordId: row._id, key: "saddleHeightMm" };
    await mark(ctx, identity);
    for (const patch of [{ userId: "foreign" }, { sessionId: "fitSessions:2" }, { bikeId: "bikes:other" }, { createdAt: today - 1 }]) {
      const original = { ...ride }; Object.assign(ride, patch);
      await expect(feedback(ctx, { ...identity, rideFeedbackId: ride._id })).rejects.toThrow("INVALID_FEEDBACK");
      for (const key of Object.keys(ride)) delete ride[key]; Object.assign(ride, original);
    }
    await feedback(ctx, { ...identity, rideFeedbackId: ride._id, result: "same" });
    expect(row.adviceProgress).toEqual([{ key: "saddleHeightMm", performedAt: today,
      feedback: { result: "same", recordedAt: now, rideFeedbackId: ride._id } }]);
  });
});
