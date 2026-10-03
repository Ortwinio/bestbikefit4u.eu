import { describe, expect, it, vi } from "vitest";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

import { storeResult } from "../internalMutations";

function makeArgs() {
  return {
    sessionId: "session_1",
    userId: "user_1",
    calculatedFit: {
      recommendedStackMm: 560,
      recommendedReachMm: 390,
      effectiveTopTubeMm: 550,
      saddleHeightMm: 720,
      saddleSetbackMm: 60,
      saddleHeightRange: { min: 715, max: 725 },
      handlebarDropMm: 80,
      handlebarReachMm: 500,
      stemLengthMm: 100,
      stemAngleRecommendation: "-6°",
      crankLengthMm: 172.5,
      handlebarWidthMm: 420,
    },
    comparisonSnapshot: {
      saddleHeightMm: 720,
      saddleSetbackMm: 60,
      barDropMm: 80,
      saddleToBarReachMm: 500,
      stemLengthMm: 100,
      crankLengthMm: 172.5,
      handlebarWidthMm: 420,
      confidenceScore: 88,
    },
    recommendationItems: [
      {
        parameter: "saddleHeightMm",
        target: 720,
        rangeLow: 715,
        rangeHigh: 725,
        confidence: 0.88,
        method: "seed_engine_v1",
        why: "Primary pedaling extension baseline.",
        feasibility: "direct",
        riskFlags: [],
        changeOrder: 2,
      },
    ],
    confidenceScore: 88,
    algorithmVersion: "v-test",
    frameSizeRecommendations: [{ size: "M", fitScore: 88, notes: "Test" }],
    fitNotes: ["Test note"],
    adjustmentPriorities: [
      {
        priority: 1,
        component: "Cleats",
        recommendedValue: "8mm behind ball of foot",
        rationale: "Start with cleat position",
      },
    ],
    painPointSolutions: undefined,
  };
}

describe("recommendations.internalMutations.storeResult contract", () => {
  it.each([false, true])("preserves the captured inputs and suppresses bulk email when requested (%s)", async suppressEmail => {
    const inputProvenance = { version: 1, capturedAt: 100,
      dependencies: [{ field: "inseamCm", value: 82, observationId: "observation_1" }] };
    const args = { ...makeArgs(), inputProvenance, suppressEmail };
    const db = {
      query: vi
        .fn()
        .mockImplementationOnce(() => ({
          withIndex: vi.fn(() => ({
            collect: vi.fn(async () => []),
          })),
        }))
        .mockImplementationOnce(() => ({
          withIndex: vi.fn(() => ({
            collect: vi.fn(async () => []),
          })),
        }))
        .mockImplementationOnce(() => ({
          withIndex: vi.fn(() => ({
            unique: vi.fn(async () => null),
          })),
        })),
      get: vi.fn(async (id: string) => {
        if (id === "session_1") {
          return {
            _id: "session_1",
            userId: "user_1",
            bikeId: "bike_1",
            bikeProfileId: "bike_profile_1",
            engineVersion: "v1",
          };
        }
        if (id === "bike_1") {
          return { _id: "bike_1", userId: "user_1" };
        }
        return null;
      }),
      insert: vi.fn(async () => "rec_1"),
      patch: vi.fn(async () => undefined),
    };

    const handler = (storeResult as unknown as { _handler: TestHandler })._handler;
    const scheduler = { runAfter: vi.fn(async () => undefined) };
    const result = await handler({ db, scheduler }, args);

    expect(result).toBe("rec_1");
    expect(db.insert).toHaveBeenCalledWith(
      "recommendations",
      expect.objectContaining({
        bikeProfileId: "bike_profile_1",
        engineVersion: "v1",
        comparisonSnapshot: args.comparisonSnapshot,
        recommendationItems: args.recommendationItems,
        inputProvenance,
      })
    );
    expect(scheduler.runAfter).toHaveBeenCalledTimes(suppressEmail ? 0 : 1);
  });

  it("does not recreate advice for a deleted session", async () => {
    const db = { query: () => ({ withIndex: () => ({ collect: async () => [] }) }),
      get: async () => null, insert: vi.fn(), patch: vi.fn() };
    const scheduler = { runAfter: vi.fn() };
    const handler = (storeResult as unknown as { _handler: TestHandler })._handler;
    expect(await handler({ db, scheduler }, makeArgs())).toBeNull();
    expect(db.insert).not.toHaveBeenCalled();
    expect(db.patch).not.toHaveBeenCalled();
    expect(scheduler.runAfter).not.toHaveBeenCalled();
  });
});
