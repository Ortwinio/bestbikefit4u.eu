import { beforeEach, describe, expect, it, vi } from "vitest";
import { calculateBikeFit } from "../../lib/fitAlgorithm";
import { buildFitInputs, estimateEffectiveTopTubeMm } from "../inputMapping";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

const { getAuthUserIdMock } = vi.hoisted(() => ({
  getAuthUserIdMock: vi.fn(),
}));

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: getAuthUserIdMock,
}));

import { generate } from "../mutations";

describe("recommendations.generate mapping integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthUserIdMock.mockResolvedValue("user_1");
  });

  it("maps profile + session through algorithm into persisted calculatedFit fields", async () => {
    const session = {
      _id: "session_1",
      userId: "user_1",
      profileId: "profile_1",
      bikeType: "road",
      ridingStyle: "racing",
      primaryGoal: "performance",
      painPoints: [],
    };

    const profile = {
      _id: "profile_1",
      userId: "user_1",
      heightCm: 178,
      inseamCm: 82,
      flexibilityScore: "good" as const,
      coreStabilityScore: 4,
      torsoLengthCm: 59,
      armLengthCm: 63,
      shoulderWidthCm: 41,
      footLengthCm: 27,
      femurLengthCm: 47,
    };

    const db = {
      get: vi.fn(async (id: string) => {
        if (id === "session_1") return session;
        if (id === "profile_1") return profile;
        return null;
      }),
      query: vi.fn(() => ({
        withIndex: vi.fn(() => ({
          collect: vi.fn(async () => []),
        })),
      })),
      insert: vi.fn(async (_table: string, _doc: unknown) => "rec_1"),
      patch: vi.fn(async () => undefined),
    };

    const handler = (generate as unknown as { _handler: TestHandler })._handler;
    const recId = await handler({ db }, { sessionId: "session_1" });

    expect(recId).toBe("rec_1");
    expect(db.insert).toHaveBeenCalledTimes(1);

    const fitInputs = buildFitInputs({
      profile,
      session: {
        primaryGoal: session.primaryGoal,
        ridingStyle: session.ridingStyle,
      },
      bikeType: session.bikeType,
    });
    const result = calculateBikeFit(fitInputs);

    const inserted = db.insert.mock.calls[0]?.[1] as Record<string, unknown> | undefined;
    if (!inserted) {
      throw new Error("Expected inserted recommendation payload");
    }
    expect(inserted.calculatedFit).toEqual({
      recommendedStackMm: result.frameStackTargetMm,
      recommendedReachMm: result.frameReachTargetMm,
      effectiveTopTubeMm: estimateEffectiveTopTubeMm(result.saddleToBarReachMm),
      saddleHeightMm: result.saddleHeightMm,
      saddleSetbackMm: result.saddleSetbackMm,
      saddleHeightRange: result.saddleHeightRange,
      handlebarDropMm: result.barDropMm,
      handlebarReachMm: result.saddleToBarReachMm,
      stemLengthMm: result.stemLengthMm,
      stemAngleRecommendation: `${result.stemAngleDeg}\u00B0`,
      crankLengthMm: result.crankLengthMm,
      handlebarWidthMm: result.handlebarWidthMm,
    });
    expect(inserted.algorithmVersion).toBe(result.algorithmVersion);
    expect(inserted.confidenceScore).toBe(result.confidenceScore);

    expect(db.patch).toHaveBeenCalledWith("session_1", {
      status: "completed",
      completedAt: expect.any(Number),
    });
  });
});
