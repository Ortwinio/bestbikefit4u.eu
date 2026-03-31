import { describe, expect, it, vi } from "vitest";
import { submit } from "./mutations";

type TestHandler = (
  ctx: {
    db: { insert: ReturnType<typeof vi.fn> };
  },
  args: Record<string, unknown>
) => Promise<unknown>;

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: vi.fn(async () => "user_123"),
}));

describe("caseStudyLeads.submit", () => {
  it("stores a normalized lead when consent is granted", async () => {
    const insert = vi.fn(async () => "lead_1");
    const handler = (submit as unknown as { _handler: TestHandler })._handler;

    const result = await handler(
      { db: { insert } },
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
  });

  it("rejects submission when consent is missing", async () => {
    const handler = (submit as unknown as { _handler: TestHandler })._handler;

    await expect(
      handler(
        { db: { insert: vi.fn() } },
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
