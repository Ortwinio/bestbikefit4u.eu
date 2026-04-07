import { describe, expect, it, vi } from "vitest";
import { submit } from "./mutations";

type TestHandler = (
  ctx: {
    db: { insert: ReturnType<typeof vi.fn> };
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
      { db: { insert }, scheduler: { runAfter } },
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
});
