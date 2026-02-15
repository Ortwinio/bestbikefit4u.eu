import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendFitReport } from "../actions";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

function makeRecommendation() {
  return {
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
    confidenceScore: 88,
    algorithmVersion: "v-test",
    frameSizeRecommendations: [{ size: "M", fitScore: 88, notes: "test" }],
    fitNotes: ["Test note"],
  };
}

describe("emails.sendFitReport contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.AUTH_RESEND_KEY;
  });

  it("accepts minimal args contract and sends using server-side recommendation source", async () => {
    const runQuery = vi
      .fn()
      .mockResolvedValueOnce({ email: "rider@example.com" })
      .mockResolvedValueOnce(makeRecommendation());
    const handler = (sendFitReport as unknown as { _handler: TestHandler })._handler;

    const result = await handler(
      { runQuery },
      {
        sessionId: "session_1",
        recipientEmail: "rider@example.com",
      }
    );

    expect(result).toEqual({ success: true });
    expect(runQuery).toHaveBeenCalledTimes(2);
  });

  it("rejects invalid email format", async () => {
    const runQuery = vi.fn().mockResolvedValueOnce({ email: "rider@example.com" });
    const handler = (sendFitReport as unknown as { _handler: TestHandler })._handler;

    await expect(
      handler(
        { runQuery },
        {
          sessionId: "session_1",
          recipientEmail: "not-an-email",
        }
      )
    ).rejects.toThrow("Invalid email address format");
  });

  it("rejects sending to a different email than the authenticated user", async () => {
    const runQuery = vi.fn().mockResolvedValueOnce({ email: "owner@example.com" });
    const handler = (sendFitReport as unknown as { _handler: TestHandler })._handler;

    await expect(
      handler(
        { runQuery },
        {
          sessionId: "session_1",
          recipientEmail: "other@example.com",
        }
      )
    ).rejects.toThrow("Reports can only be sent to your own email address");
  });

  it("returns recommendation not found when no recommendation exists", async () => {
    const runQuery = vi
      .fn()
      .mockResolvedValueOnce({ email: "owner@example.com" })
      .mockResolvedValueOnce(null);
    const handler = (sendFitReport as unknown as { _handler: TestHandler })._handler;

    await expect(
      handler(
        { runQuery },
        {
          sessionId: "session_1",
          recipientEmail: "owner@example.com",
        }
      )
    ).rejects.toThrow("Recommendation not found");
  });
});
