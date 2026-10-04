import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Doc } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";
import { coreRecommendation, reportAccess, visibleRecommendation } from "../access";
import { getBySession, getReportAccess } from "../queries";

const mocks = vi.hoisted(() => ({ access: vi.fn(), auth: vi.fn() }));
vi.mock("../../pricing/access", () => ({ getUserAccess: mocks.access }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: mocks.auth }));

const recommendation = {
  _id: "report", _creationTime: 10, userId: "owner", sessionId: "session", bikeId: "bike",
  createdAt: 10, calculatedFit: { saddleHeightMm: 720 }, confidenceScore: 80, algorithmVersion: "test",
  frameSizeRecommendations: [{ size: "M", fitScore: 80, notes: "private-frame" }],
  fitNotes: ["private-note"], adjustmentPriorities: [{ rationale: "private-rationale" }],
  recommendationItems: [{ why: "private-explanation" }], painPointSolutions: [{ solution: "private-solution" }],
  climbingCalculatedFit: { saddleHeightMm: 730 }, pressureInsights: { warnings: ["private-pressure"] },
  comparisonSnapshot: { saddleHeightMm: 700 }, inputProvenance: { private: true },
} as unknown as Doc<"recommendations">;

function context(reports = [recommendation], owner = "owner") {
  return { db: {
    get: vi.fn(async () => ({ _id: "session", userId: owner })),
    query: vi.fn(() => ({ withIndex: vi.fn(() => ({ collect: vi.fn(async () => reports) })) })),
  } } as unknown as QueryCtx;
}

describe("report entitlement boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("PAID_ACCESS_ENFORCED", "true");
    mocks.access.mockResolvedValue({ fullReport: false });
    mocks.auth.mockResolvedValue("owner");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("whitelists core values without any paid narrative or alternate fit", () => {
    const result = coreRecommendation(recommendation);
    expect(result.calculatedFit).toEqual(recommendation.calculatedFit);
    expect(result.frameSizeRecommendations).toEqual([{ size: "M", fitScore: 80 }]);
    expect(result.fitNotes).toEqual([]);
    expect(result.adjustmentPriorities).toEqual([]);
    expect(result.recommendationItems).toEqual([]);
    expect(JSON.stringify(result)).not.toContain("private");
    expect(result.climbingCalculatedFit).toBeUndefined();
  });

  it("preserves exact existing report when enforcement is off without entitlement reads", async () => {
    vi.stubEnv("PAID_ACCESS_ENFORCED", "false");
    expect(await visibleRecommendation(context(), recommendation)).toBe(recommendation);
    expect(mocks.access).not.toHaveBeenCalled();
  });

  it("allows latest free core PDF/email but refuses earlier report exports", async () => {
    expect(await reportAccess(context(), recommendation)).toMatchObject({
      fullReport: false, isLatestReport: true, canDownloadPdf: true, canEmailReport: true,
    });
    const later = { ...recommendation, _creationTime: 11, sessionId: "later" } as Doc<"recommendations">;
    expect(await reportAccess(context([recommendation, later]), recommendation)).toMatchObject({
      fullReport: false, isLatestReport: false, canDownloadPdf: false, canEmailReport: false,
    });
  });

  it("passes the report's user and bike to entitlement matching", async () => {
    mocks.access.mockResolvedValue({ fullReport: true });
    const ctx = context();
    expect(await visibleRecommendation(ctx, recommendation)).toBe(recommendation);
    expect(mocks.access).toHaveBeenCalledWith(ctx, "owner", "bike");
  });

  it("preserves explicitly marked legacy reports even when no longer latest or paid", async () => {
    const legacy = { ...recommendation, legacyFullAccess: true };
    const latest = { ...recommendation, createdAt: 20, sessionId: "later" } as Doc<"recommendations">;
    expect(await reportAccess(context([latest]), legacy)).toMatchObject({
      legacyFullAccess: true, fullReport: true, isLatestReport: false, canDownloadPdf: true, canEmailReport: true,
    });
    expect(await visibleRecommendation(context(), legacy)).toBe(legacy);
    expect(mocks.access).not.toHaveBeenCalled();
  });

  it("redacts direct session reads and enforces report owner checks", async () => {
    type Handler = { _handler: (ctx: QueryCtx, args: { sessionId: string }) => Promise<unknown> };
    const direct = (getBySession as unknown as Handler)._handler;
    const access = (getReportAccess as unknown as Handler)._handler;
    expect(await direct(context(), { sessionId: "session" })).toEqual(coreRecommendation(recommendation));
    expect(await access(context([], "other"), { sessionId: "session" })).toBeNull();
    mocks.auth.mockResolvedValue(null);
    expect(await access(context(), { sessionId: "session" })).toBeNull();
  });
});
