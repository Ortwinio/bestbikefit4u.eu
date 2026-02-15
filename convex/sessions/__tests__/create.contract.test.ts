import { beforeEach, describe, expect, it, vi } from "vitest";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

const { getAuthUserIdMock } = vi.hoisted(() => ({
  getAuthUserIdMock: vi.fn(),
}));

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: getAuthUserIdMock,
}));

import { create } from "../mutations";

type BikeDoc = { _id: string; userId: string; bikeType: string } | null;
type ProfileDoc = { _id: string; userId: string } | null;

function makeCtx(params: { profile: ProfileDoc; bike: BikeDoc }) {
  const { profile, bike } = params;

  const db = {
    get: vi.fn(async (id: string) => {
      if (bike && id === bike._id) return bike;
      return null;
    }),
    query: vi.fn((table: string) => {
      if (table !== "profiles") {
        throw new Error(`Unexpected table query: ${table}`);
      }
      return {
        withIndex: vi.fn(() => ({
          unique: vi.fn(async () => profile),
        })),
      };
    }),
    insert: vi.fn(async () => "session_1"),
  };

  return { db } as const;
}

describe("sessions.create contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("persists explicit bikeType in fit session", async () => {
    getAuthUserIdMock.mockResolvedValue("user_1");
    const ctx = makeCtx({
      profile: { _id: "profile_1", userId: "user_1" },
      bike: null,
    });

    const handler = (create as unknown as { _handler: TestHandler })._handler;
    const sessionId = await handler(ctx, {
      bikeType: "gravel",
      ridingStyle: "touring",
      primaryGoal: "balanced",
    });

    expect(sessionId).toBe("session_1");
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "fitSessions",
      expect.objectContaining({
        bikeType: "gravel",
        ridingStyle: "touring",
        primaryGoal: "balanced",
      })
    );
  });

  it("rejects bikeId + bikeType mismatch", async () => {
    getAuthUserIdMock.mockResolvedValue("user_1");
    const ctx = makeCtx({
      profile: { _id: "profile_1", userId: "user_1" },
      bike: { _id: "bike_1", userId: "user_1", bikeType: "road" },
    });

    const handler = (create as unknown as { _handler: TestHandler })._handler;

    await expect(
      handler(ctx, {
        bikeType: "gravel",
        bikeId: "bike_1",
        ridingStyle: "fitness",
        primaryGoal: "performance",
      })
    ).rejects.toThrow("Bike type must match selected bike");

    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
});
