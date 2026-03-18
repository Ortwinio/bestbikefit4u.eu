import { beforeEach, describe, expect, it, vi } from "vitest";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

const { getAuthUserIdMock } = vi.hoisted(() => ({
  getAuthUserIdMock: vi.fn(),
}));

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: getAuthUserIdMock,
}));

import { submitBeta } from "../mutations";

describe("rideFeedback.submitBeta contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthUserIdMock.mockResolvedValue("user_1");
    process.env.ENGINE_V2_FEEDBACK_BETA_ENABLED = "true";
  });

  it("stores ride feedback and a conservative refinement suggestion", async () => {
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
      insert: vi.fn(async () => "feedback_1"),
    };

    const handler = (submitBeta as unknown as { _handler: TestHandler })._handler;
    const result = await handler(
      { db },
      {
        sessionId: "session_1",
        implementationStatus: "confirmed",
        comfortScore: 4,
        handPressureScore: 8,
      }
    );

    expect(result).toBe("feedback_1");
    expect(db.insert).toHaveBeenCalledWith(
      "rideFeedbackEntries",
      expect.objectContaining({
        bikeId: "bike_1",
        bikeProfileId: "bike_profile_1",
        refinementSuggestion: expect.objectContaining({
          parameter: "barDropMm",
          direction: "decrease",
          delta: 5,
        }),
      })
    );
  });

  it("rejects feedback submission when the beta flag is disabled", async () => {
    process.env.ENGINE_V2_FEEDBACK_BETA_ENABLED = "false";
    const db = { get: vi.fn(), insert: vi.fn() };
    const handler = (submitBeta as unknown as { _handler: TestHandler })._handler;

    await expect(
      handler(
        { db },
        {
          sessionId: "session_1",
          implementationStatus: "confirmed",
          comfortScore: 7,
        }
      )
    ).rejects.toThrow("Ride feedback beta is disabled");
  });
});
