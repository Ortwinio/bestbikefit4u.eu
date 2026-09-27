import { describe, expect, it, vi } from "vitest";
import { submit } from "./mutations";

type TestHandler = (
  ctx: {
    db: { insert: ReturnType<typeof vi.fn>; query?: ReturnType<typeof vi.fn> };
    scheduler: { runAfter: ReturnType<typeof vi.fn> };
  },
  args: Record<string, unknown>
) => Promise<unknown>;

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: vi.fn(async () => "user_123"),
}));

describe("caseStudyLeads.submit", () => {
  it("stores a normalized lead when consent is granted", async () => {
    const insert = vi.fn(async () => "lead_1");
    const runAfter = vi.fn(async () => undefined);
    const handler = (submit as unknown as { _handler: TestHandler })._handler;

    const result = await handler(
      { db: { insert, query: vi.fn(() => ({ withIndex: vi.fn(() => ({ unique: vi.fn(async () => null) })) })) }, scheduler: { runAfter } },
      {
        locale: "en",
        sourcePath: "/pain/knee-pain-cycling",
        painSlug: "knee-pain-cycling",
        name: " Ortwin ",
        email: " ORTWIN@ORMAC.NL ",
        ridingGoal: "Ride without knee pain",
        painSummary: "Pain starts after 90 minutes and returns on climbs.",
        consentAccepted: true,
      }
    );

    expect(result).toBe("lead_1");
    expect(insert).toHaveBeenCalledWith(
      "caseStudyLeads",
      expect.objectContaining({
        email: "ortwin@ormac.nl",
        consentAccepted: true,
        sourcePath: "/pain/knee-pain-cycling",
      })
    );
    expect(runAfter).toHaveBeenCalledTimes(2);
  });

  it("rejects submission when consent is missing", async () => {
    const handler = (submit as unknown as { _handler: TestHandler })._handler;

    await expect(
      handler(
        { db: { insert: vi.fn() }, scheduler: { runAfter: vi.fn() } },
        {
          locale: "en",
          sourcePath: "/pain/knee-pain-cycling",
          name: "Ortwin",
          email: "ortwin@ormac.nl",
          painSummary: "Pain.",
          consentAccepted: false,
        }
      )
    ).rejects.toThrow("Consent is required");
  });

  it("blocks exhausted lead limits before storing or emailing the lead", async () => {
    const insert = vi.fn();
    const runAfter = vi.fn();
    const query = vi.fn(() => ({ withIndex: vi.fn(() => ({ unique: vi.fn(async () => ({
      _id: "limit_1", attemptsLeft: 0, lastAttemptTime: Date.now(),
    })) })) }));
    const handler = (submit as unknown as { _handler: TestHandler })._handler;
    await expect(handler({ db: { insert, query }, scheduler: { runAfter } }, {
      locale: "en", sourcePath: "/pain/knee-pain-cycling", name: "Rider",
      email: "rider@example.com", painSummary: "Pain.", consentAccepted: true,
    })).rejects.toThrow("Too many case study requests");
    expect(insert).not.toHaveBeenCalled();
    expect(runAfter).not.toHaveBeenCalled();
  });

});
