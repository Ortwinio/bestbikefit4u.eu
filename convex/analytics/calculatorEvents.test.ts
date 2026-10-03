import { describe, expect, it, vi } from "vitest";
import { logMarketingEvent } from "./mutations";
import { ANONYMOUS_MARKETING_EVENT_TYPES } from "../../src/lib/analytics/marketing";

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
  eventType: "calculator_result_view", sourceTag: "saddle-height",
  locale: "nl", pagePath: "/nl/calculators/saddle-height",
};
describe("anonymous value-free calculator analytics", () => {
  it.each(["calculator_result_view", "calculator_login_cta_click"])("accepts %s without authentication", async (eventType) => {
    expect(ANONYMOUS_MARKETING_EVENT_TYPES).toContain(eventType);
    const { ctx, insert } = fixture();
    await run(ctx, { ...base, eventType });
    const recorded = insert.mock.calls.find(([table]) => table === "marketingEvents");
    expect(recorded).toBeDefined();
    expect(JSON.parse(JSON.stringify(recorded?.[1]))).toEqual({ ...base, eventType, occurredAt: expect.any(Number) });
  });
  it.each([
    { valueCents: 8400 }, { section: "inseam=84" }, { ctaLabel: "84" },
    { ctaTargetPath: "/login?inseam=84" }, { currency: "EUR" },
    { pagePath: "/nl/calculators/saddle-height?inseam=84" },
    { pagePath: "/settings" }, { sourceTag: "84" },
  ])("rejects extra data before inserting: %j", async (extra) => {
    const { ctx, insert } = fixture();
    await expect(run(ctx, { ...base, ...extra })).rejects.toThrow("Calculator analytics");
    expect(insert).not.toHaveBeenCalled();
  });
});
