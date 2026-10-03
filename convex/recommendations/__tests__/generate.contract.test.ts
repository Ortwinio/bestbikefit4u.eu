import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Doc, Id } from "../../_generated/dataModel";
import { isStale } from "../../../shared/advice/staleness";

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
    status: "questionnaire_complete" | "processing" | "completed";
    bikeType?: string;
    bikeId?: string;
    ridingStyle: string;
    primaryGoal: string;
    profileSnapshot?: Doc<"fitSessions">["profileSnapshot"];
    inputProvenance?: Doc<"fitSessions">["inputProvenance"];
  };
  profile: {
    _id: string;
    userId: string;
    heightCm?: number;
    inseamCm?: number;
    flexibilityScore?: "very_limited" | "limited" | "average" | "good" | "excellent";
    coreStabilityScore?: number;
    torsoLengthCm?: number;
    armLengthCm?: number;
  };
  bike?: { _id: string; userId: string; bikeType: string };
  existingRecommendation?: { _id: string; createdAt: number } | null;
}) {
  const { session, profile: profileInput, bike, existingRecommendation = null } = params;
  const profile = { _creationTime: 1000, updatedAt: 2000, ...profileInput };
  const sessionId = session._id;
  const schedulerRunAfter = vi.fn(async () => undefined);

  const db = {
    get: vi.fn(async (id: string) => {
      if (id === sessionId) return session;
      if (id === profile._id) return profile;
      if (bike && id === bike._id) return bike;
      return null;
    }),
    query: vi.fn((table: string) => {
      if (table === "profiles") return { withIndex: () => ({ unique: async () => profile }) };
      if (table === "profileObservations") return { withIndex: () => ({ collect: async () => [] }) };
      if (table === "recommendations") {
        return {
          withIndex: vi.fn(() => ({
            collect: vi.fn(async () =>
              existingRecommendation ? [existingRecommendation] : []
            ),
          })),
        };
      }

      if (table === "questionnaireResponses") {
        return {
          withIndex: vi.fn(() => ({
            collect: vi.fn(async () => []),
          })),
        };
      }

      throw new Error(`Unexpected table query: ${table}`);
    }),
    insert: vi.fn(async () => "rec_1"),
    patch: vi.fn(async () => undefined),
  };

  return {
    db,
    sessionId,
    scheduler: { runAfter: schedulerRunAfter },
    schedulerRunAfter,
  } as const;
}

describe("recommendations.generate contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthUserIdMock.mockResolvedValue("user_1");
    calculateBikeFitMock.mockReturnValue(makeCalculatedResult());
  });

  it.each(["heightCm", "inseamCm", "flexibilityScore", "coreStabilityScore"] as const)(
    "rejects missing %s before scheduling or changing status", async (field) => {
      const ctx = makeCtx({
        session: { _id: "session_1", userId: "user_1", profileId: "profile_1",
          status: "questionnaire_complete", ridingStyle: "fitness", primaryGoal: "comfort" },
        profile: { _id: "profile_1", userId: "user_1", heightCm: 178, inseamCm: 83,
          flexibilityScore: "good", coreStabilityScore: 4, [field]: undefined },
      });
      const handler = (generate as unknown as { _handler: TestHandler })._handler;
      await expect(handler(ctx, { sessionId: ctx.sessionId })).rejects.toThrow(
        "Complete your rider profile before calculating a bike fit.",
      );
      expect(ctx.schedulerRunAfter).not.toHaveBeenCalled();
      expect(ctx.db.patch).not.toHaveBeenCalled();
    },
  );

  it("uses session bikeType snapshot over linked bike type", async () => {
    const ctx = makeCtx({
      session: {
        _id: "session_1",
        userId: "user_1",
        profileId: "profile_1",
        status: "questionnaire_complete",
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

    expect(recId).toBeUndefined();
    expect(ctx.db.patch).toHaveBeenCalledWith("session_1", { status: "processing" });
    expect(ctx.schedulerRunAfter).toHaveBeenCalledTimes(1);
    const firstScheduledArgs = (ctx.schedulerRunAfter.mock.calls as unknown[][])[0]?.[2] as
      | Record<string, unknown>
      | undefined;
    expect(firstScheduledArgs).toEqual(
      expect.objectContaining({ bikeCategory: "mtb" })
    );
    expect(ctx.db.get).toHaveBeenCalledWith("bike_1");
  });

  it("preserves used observation IDs and values when the profile changes after session creation", async () => {
    const dependency = { field: "heightCm", value: 178, observationId: "observation_old" as Id<"profileObservations"> };
    const ctx = makeCtx({
      session: { _id: "session_1", userId: "user_1", profileId: "profile_1",
        status: "questionnaire_complete", ridingStyle: "fitness", primaryGoal: "comfort",
        profileSnapshot: { capturedAt: 1000, trial: false, heightCm: 178, inseamCm: 83,
          flexibilityScore: "good", coreStabilityScore: 4 },
        inputProvenance: { version: 1, capturedAt: 1000, dependencies: [dependency] } },
      profile: { _id: "profile_1", userId: "user_1", heightCm: 181, inseamCm: 83,
        flexibilityScore: "good", coreStabilityScore: 4 },
    });
    const handler = (generate as unknown as { _handler: TestHandler })._handler;
    await handler(ctx, { sessionId: ctx.sessionId });
    const scheduled = (ctx.schedulerRunAfter.mock.calls as unknown[][])[0]?.[2] as {
      heightCm: number; inputProvenance: NonNullable<Doc<"fitSessions">["inputProvenance"]>;
    };
    expect(scheduled.heightCm).toBe(178);
    expect(scheduled.inputProvenance.dependencies).toContainEqual(dependency);
    expect(scheduled.inputProvenance.dependencies).not.toContainEqual(expect.objectContaining({ value: 181 }));
    expect(isStale(scheduled.inputProvenance, [{ field: "heightCm", value: 181,
      observationId: "observation_new" }])).toEqual(expect.objectContaining({ stale: true, status: "stale" }));
  });

  it("falls back to linked bike type when session bikeType is missing", async () => {
    const ctx = makeCtx({
      session: {
        _id: "session_1",
        userId: "user_1",
        profileId: "profile_1",
        status: "questionnaire_complete",
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

    expect(ctx.schedulerRunAfter).toHaveBeenCalledTimes(1);
    const firstScheduledArgs = (ctx.schedulerRunAfter.mock.calls as unknown[][])[0]?.[2] as
      | Record<string, unknown>
      | undefined;
    expect(firstScheduledArgs).toEqual(
      expect.objectContaining({ bikeCategory: "gravel" })
    );
    expect(ctx.db.get).toHaveBeenCalledWith("bike_1");
  });

  it("returns existing recommendation id without recalculation", async () => {
    const ctx = makeCtx({
      session: {
        _id: "session_1",
        userId: "user_1",
        profileId: "profile_1",
        status: "completed",
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
      existingRecommendation: { _id: "rec_existing", createdAt: 1 },
    });

    const handler = (generate as unknown as { _handler: TestHandler })._handler;
    const recId = await handler(ctx, { sessionId: ctx.sessionId });

    expect(recId).toBeUndefined();
    expect(ctx.schedulerRunAfter).not.toHaveBeenCalled();
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
});
