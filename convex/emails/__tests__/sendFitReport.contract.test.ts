import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendFitReport } from "../actions";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("resend", () => ({ Resend: class { emails = { send }; } }));

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
    vi.stubEnv("AUTH_RESEND_KEY", "");
    vi.stubEnv("SITE_URL", "https://example.com");
    send.mockResolvedValue({ data: { id: "email_1" }, error: null });
  });
  afterEach(() => vi.unstubAllEnvs());

  it.each([
    { saved: "nl", request: "en", expected: "nl" },
    { saved: "en", request: "nl", expected: "en" },
    { saved: undefined, request: "nl", expected: "nl" },
    { saved: undefined, request: undefined, expected: "en" },
  ])("resolves report locale $expected from saved=$saved request=$request", async ({ saved, request, expected }) => {
    vi.stubEnv("AUTH_RESEND_KEY", "test-only-key");
    const recommendation = makeRecommendation();
    recommendation.fitNotes = ["Your position is quite aggressive. Consider building up to this gradually."];
    const runQuery = vi.fn().mockResolvedValueOnce({ email: "rider@example.com", locale: saved })
      .mockResolvedValueOnce(recommendation);
    const handler = (sendFitReport as unknown as { _handler: TestHandler })._handler;
    await expect(handler({ runQuery }, { sessionId: "session_1", recipientEmail: "RIDER@example.com", locale: request })).resolves.toEqual({ success: true, emailId: "email_1" });
    const delivered = send.mock.calls[0][0];
    expect(delivered.to).toEqual(["rider@example.com"]);
    expect(delivered.html).toContain(`lang="${expected}"`);
    expect(delivered.html).toContain(`https://example.com/${expected}/fit/session_1/results`);
    expect(delivered.text).toContain(expected === "nl" ? "Je houding is vrij diep en sportief" : "Your position is quite aggressive");
    if (expected === "nl") expect(delivered.html).not.toContain(recommendation.fitNotes[0]);
    expect(delivered.headers).toBeUndefined();
  });

  it.each([null, {}])("rejects unauthenticated or email-less recipients", async (user) => {
    const handler = (sendFitReport as unknown as { _handler: TestHandler })._handler;
    await expect(handler({ runQuery: vi.fn().mockResolvedValueOnce(user) }, { sessionId: "session_1", recipientEmail: "rider@example.com" }))
      .rejects.toThrow(user ? "Reports can only be sent to your own email address" : "Not authenticated");
    expect(send).not.toHaveBeenCalled();
  });

  it("propagates provider errors", async () => {
    vi.stubEnv("AUTH_RESEND_KEY", "test-only-key");
    send.mockResolvedValue({ data: null, error: { message: "provider failure" } });
    const runQuery = vi.fn().mockResolvedValueOnce({ email: "rider@example.com" }).mockResolvedValueOnce(makeRecommendation());
    const handler = (sendFitReport as unknown as { _handler: TestHandler })._handler;
    await expect(handler({ runQuery }, { sessionId: "session_1", recipientEmail: "rider@example.com" })).rejects.toThrow("provider failure");
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
