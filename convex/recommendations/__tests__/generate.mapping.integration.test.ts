import { beforeEach, describe, expect, it, vi } from "vitest";
import { mapBikeCategory, mapAmbition } from "../inputMapping";

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

  it("transitions session to processing and schedules generateFromData action", async () => {
    const session = {
      _id: "session_1",
      userId: "user_1",
      profileId: "profile_1",
      status: "questionnaire_complete",
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

    const schedulerRunAfter = vi.fn(async () => undefined);

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
      patch: vi.fn(async () => undefined),
    };

    const handler = (generate as unknown as { _handler: TestHandler })._handler;
    const result = await handler(
      { db, scheduler: { runAfter: schedulerRunAfter } },
      { sessionId: "session_1" }
    );

    // The mutation now returns void — results arrive via reactive subscription
    expect(result).toBeUndefined();

    // Status transitions to "processing" immediately
    expect(db.patch).toHaveBeenCalledWith("session_1", { status: "processing" });

    // Action was scheduled with the correct measurements
    expect(schedulerRunAfter).toHaveBeenCalledTimes(1);
    const callArgs = schedulerRunAfter.mock.calls[0] as unknown as [number, unknown, Record<string, unknown>];
    const [delay, _actionRef, scheduledArgs] = callArgs;
    expect(delay).toBe(0);
    expect(scheduledArgs.sessionId).toBe("session_1");
    expect(scheduledArgs.userId).toBe("user_1");
    expect(scheduledArgs.heightCm).toBe(profile.heightCm);
    expect(scheduledArgs.inseamCm).toBe(profile.inseamCm);
    expect(scheduledArgs.flexibilityScore).toBe(profile.flexibilityScore);
    expect(scheduledArgs.bikeCategory).toBe(
      mapBikeCategory(session, session.bikeType)
    );
    expect(scheduledArgs.ambition).toBe(mapAmbition(session.primaryGoal));
  });

  it("returns early without scheduling when recommendation already exists", async () => {
    const session = {
      _id: "session_1",
      userId: "user_1",
      profileId: "profile_1",
      status: "completed",
      bikeType: "road",
      ridingStyle: "racing",
      primaryGoal: "performance",
    };

    const existingRec = { _id: "rec_existing", sessionId: "session_1", createdAt: 1000 };

    const schedulerRunAfter = vi.fn();

    const db = {
      get: vi.fn(async (id: string) => {
        if (id === "session_1") return session;
        return null;
      }),
      query: vi.fn(() => ({
        withIndex: vi.fn(() => ({
          collect: vi.fn(async () => [existingRec]),
        })),
      })),
      patch: vi.fn(),
    };

    const handler = (generate as unknown as { _handler: TestHandler })._handler;
    await handler(
      { db, scheduler: { runAfter: schedulerRunAfter } },
      { sessionId: "session_1" }
    );

    expect(schedulerRunAfter).not.toHaveBeenCalled();
    expect(db.patch).not.toHaveBeenCalled();
  });
});
