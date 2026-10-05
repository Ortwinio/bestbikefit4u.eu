import { describe, expect, it, vi } from "vitest";
import { logMarketingEvent } from "./mutations";
import { ANONYMOUS_MARKETING_EVENT_TYPES, MARKETING_EVENT_TYPES } from "../../src/lib/analytics/marketing";

vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: async () => null }));
const run = (logMarketingEvent as unknown as {
  _handler: (ctx: unknown, args: unknown) => Promise<unknown>;
})._handler;

function fixture() {
  const insert = vi.fn(async (_table: string, _value: unknown) => "event");
  const chain = { withIndex: () => chain, unique: async () => null };
  return { insert, ctx: { db: { query: () => chain, insert } } };
}

const base = {
  eventType: "home_saddle_widget_used", sourceTag: "saddle-height",
  locale: "nl", pagePath: "/nl",
};

describe("anonymous value-free homepage saddle analytics", () => {
  it.each(["nl", "en"])("accepts only the expected %s homepage payload", async (locale) => {
    expect(MARKETING_EVENT_TYPES).toContain(base.eventType);
    expect(ANONYMOUS_MARKETING_EVENT_TYPES).toContain(base.eventType);
    const { ctx, insert } = fixture();
    await run(ctx, { ...base, locale, pagePath: `/${locale}` });
    const recorded = insert.mock.calls.find(([table]) => table === "marketingEvents");
    expect(JSON.parse(JSON.stringify(recorded?.[1]))).toEqual({
      ...base, locale, pagePath: `/${locale}`, occurredAt: expect.any(Number),
    });
  });

  it.each([
    { pagePath: "/" }, { pagePath: "/de" }, { pagePath: "/nl/" },
    { pagePath: "/en" }, { pagePath: "/nl/dashboard" },
    { pagePath: "/nl/calculators/saddle-height" },
    { pagePath: "/nl?height=190" }, { pagePath: "/nl#inseam=89" },
    { pagePath: "/nl?email=rider@example.com" },
    { sourceTag: undefined }, { sourceTag: "height:190" },
    { section: "inseam=89" }, { ctaLabel: "rider@example.com" },
    { ctaTargetPath: "/nl/calculators/saddle-height?height=190" },
    { valueCents: 190 }, { currency: "EUR" }, { section: "" }, { ctaLabel: "" },
  ])("rejects off-scope paths and extra data before inserting: %j", async (extra) => {
    const { ctx, insert } = fixture();
    await expect(run(ctx, { ...base, ...extra })).rejects.toThrow("Home saddle analytics");
    expect(insert).not.toHaveBeenCalled();
  });
});
