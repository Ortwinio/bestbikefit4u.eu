import { beforeEach, describe, expect, it, vi } from "vitest";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

const { getAuthUserIdMock } = vi.hoisted(() => ({
  getAuthUserIdMock: vi.fn(),
}));

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: getAuthUserIdMock,
}));

import { createBeta } from "../mutations";

describe("validationCaptures.createBeta contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthUserIdMock.mockResolvedValue("user_1");
    process.env.ENGINE_V2_DYNAMIC_VALIDATION_ENABLED = "true";
  });

  it("stores a validation capture for the owned session when beta is enabled", async () => {
    const db = {
      get: vi.fn(async (id: string) => {
        if (id === "session_1") {
          return {
            _id: "session_1",
            userId: "user_1",
            bikeId: "bike_1",
            bikeProfileId: "bike_profile_1",
          };
        }
        return null;
      }),
      insert: vi.fn(async () => "capture_1"),
    };

    const handler = (createBeta as unknown as { _handler: TestHandler })._handler;
    const result = await handler(
      { db },
      {
        sessionId: "session_1",
        captureType: "side_video",
        sourceType: "video_beta",
        qualityScore: 82,
        kneeAngleBdcDeg: 147,
      }
    );

    expect(result).toBe("capture_1");
    expect(db.insert).toHaveBeenCalledWith(
      "validationCaptures",
      expect.objectContaining({
        sessionId: "session_1",
        bikeId: "bike_1",
        bikeProfileId: "bike_profile_1",
        qualityScore: 82,
      })
    );
  });

  it("rejects capture submission when the beta flag is disabled", async () => {
    process.env.ENGINE_V2_DYNAMIC_VALIDATION_ENABLED = "false";
    const db = { get: vi.fn(), insert: vi.fn() };
    const handler = (createBeta as unknown as { _handler: TestHandler })._handler;

    await expect(
      handler(
        { db },
        {
          sessionId: "session_1",
          captureType: "side_video",
          sourceType: "video_beta",
          qualityScore: 82,
        }
      )
    ).rejects.toThrow("Dynamic validation beta is disabled");
  });
});
