import { beforeEach, describe, expect, it, vi } from "vitest";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

const { getAuthUserIdMock, calculateBikeFitMock } = vi.hoisted(() => ({
  getAuthUserIdMock: vi.fn(),
  calculateBikeFitMock: vi.fn(),
}));

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: getAuthUserIdMock,
}));

vi.mock("../../lib/fitAlgorithm", async () => {
  const actual = await vi.importActual<typeof import("../../lib/fitAlgorithm")>(
    "../../lib/fitAlgorithm"
  );
  return {
    ...actual,
    calculateBikeFit: calculateBikeFitMock,
  };
});

import { generate } from "../mutations";

function makeCalculatedResult() {
  return {
    frameStackTargetMm: 560,
    frameReachTargetMm: 390,
    saddleToBarReachMm: 500,
    saddleHeightMm: 720,
    saddleSetbackMm: 60,
    saddleHeightRange: { min: 715, max: 725 },
    barDropMm: 80,
    stemLengthMm: 100,
    stemAngleDeg: -6,
    crankLengthMm: 172.5,
    handlebarWidthMm: 420,
    cleatOffsetMm: 8,
    confidenceScore: 88,
    algorithmVersion: "v-test",
    warnings: [],
  };
}

function makeCtx(params: {
  session: {
    _id: string;
    userId: string;
    profileId: string;
    bikeType?: string;
    bikeId?: string;
    ridingStyle: string;
    primaryGoal: string;
  };
  profile: {
    _id: string;
    userId: string;
    heightCm: number;
    inseamCm: number;
    flexibilityScore: "very_limited" | "limited" | "average" | "good" | "excellent";
    coreStabilityScore: number;
    torsoLengthCm?: number;
    armLengthCm?: number;
  };
  bike?: { _id: string; userId: string; bikeType: string };
  existingRecommendation?: { _id: string } | null;
}) {
  const { session, profile, bike, existingRecommendation = null } = params;
  const sessionId = session._id;

  const db = {
    get: vi.fn(async (id: string) => {
      if (id === sessionId) return session;
      if (id === profile._id) return profile;
      if (bike && id === bike._id) return bike;
      return null;
    }),
    query: vi.fn((table: string) => {
      if (table !== "recommendations") {
        throw new Error(`Unexpected table query: ${table}`);
      }
      return {
        withIndex: vi.fn(() => ({
          unique: vi.fn(async () => existingRecommendation),
        })),
      };
    }),
    insert: vi.fn(async () => "rec_1"),
    patch: vi.fn(async () => undefined),
  };

  return { db, sessionId } as const;
}

describe("recommendations.generate contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthUserIdMock.mockResolvedValue("user_1");
    calculateBikeFitMock.mockReturnValue(makeCalculatedResult());
  });

  it("uses session bikeType snapshot over linked bike type", async () => {
    const ctx = makeCtx({
      session: {
        _id: "session_1",
        userId: "user_1",
        profileId: "profile_1",
        bikeType: "mountain",
        bikeId: "bike_1",
        ridingStyle: "commuting",
        primaryGoal: "balanced",
      },
      profile: {
        _id: "profile_1",
        userId: "user_1",
        heightCm: 178,
        inseamCm: 82,
        flexibilityScore: "average",
        coreStabilityScore: 3,
      },
      bike: {
        _id: "bike_1",
        userId: "user_1",
        bikeType: "road",
      },
    });

    const handler = (generate as unknown as { _handler: TestHandler })._handler;
    const recId = await handler(ctx, { sessionId: ctx.sessionId });

    expect(recId).toBe("rec_1");
    expect(calculateBikeFitMock).toHaveBeenCalledTimes(1);
    expect(calculateBikeFitMock.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ category: "mtb" })
    );
    expect(ctx.db.get).not.toHaveBeenCalledWith("bike_1");
  });

  it("falls back to linked bike type when session bikeType is missing", async () => {
    const ctx = makeCtx({
      session: {
        _id: "session_1",
        userId: "user_1",
        profileId: "profile_1",
        bikeId: "bike_1",
        ridingStyle: "fitness",
        primaryGoal: "comfort",
      },
      profile: {
        _id: "profile_1",
        userId: "user_1",
        heightCm: 175,
        inseamCm: 80,
        flexibilityScore: "good",
        coreStabilityScore: 4,
      },
      bike: {
        _id: "bike_1",
        userId: "user_1",
        bikeType: "cyclocross",
      },
    });

    const handler = (generate as unknown as { _handler: TestHandler })._handler;
    await handler(ctx, { sessionId: ctx.sessionId });

    expect(calculateBikeFitMock.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ category: "gravel" })
    );
    expect(ctx.db.get).toHaveBeenCalledWith("bike_1");
  });

  it("returns existing recommendation id without recalculation", async () => {
    const ctx = makeCtx({
      session: {
        _id: "session_1",
        userId: "user_1",
        profileId: "profile_1",
        bikeType: "road",
        ridingStyle: "racing",
        primaryGoal: "performance",
      },
      profile: {
        _id: "profile_1",
        userId: "user_1",
        heightCm: 181,
        inseamCm: 84,
        flexibilityScore: "excellent",
        coreStabilityScore: 5,
      },
      existingRecommendation: { _id: "rec_existing" },
    });

    const handler = (generate as unknown as { _handler: TestHandler })._handler;
    const recId = await handler(ctx, { sessionId: ctx.sessionId });

    expect(recId).toBe("rec_existing");
    expect(calculateBikeFitMock).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
});
