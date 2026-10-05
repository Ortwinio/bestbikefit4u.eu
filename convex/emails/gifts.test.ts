import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendGiftMeasurement } from "./gifts";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("resend", () => ({ Resend: class { emails = { send }; } }));

type Context = { runQuery: ReturnType<typeof vi.fn>; runMutation: ReturnType<typeof vi.fn> };
const handler = (sendGiftMeasurement as unknown as {
  _handler: (ctx: Context, args: { giftId: string; token: string }) => Promise<void>;
})._handler;
const args = { giftId: "gift_1", token: "private-redeem-token" };
const gift = { recipientEmail: "recipient@example.com", message: "Enjoy your ride!", locale: "en", expiresAt: Date.UTC(2026, 10, 4) };
const context = (value: unknown = gift): Context => ({ runQuery: vi.fn().mockResolvedValue(value), runMutation: vi.fn() });

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(Date.UTC(2026, 9, 4));
  vi.stubEnv("AUTH_RESEND_KEY", "test-only");
  vi.stubEnv("SITE_URL", "https://bikefitboost.com");
  send.mockReset().mockResolvedValue({ data: { id: "mail_1" }, error: null });
});
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });

describe("gift email delivery", () => {
  it("reads trusted gift data and sends only to its recipient", async () => {
    const ctx = context();
    await handler(ctx, args);
    expect(ctx.runQuery).toHaveBeenCalledWith(expect.anything(), args);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({
      to: [gift.recipientEmail], html: expect.stringContaining('lang="en"'),
      text: expect.stringContaining(`https://bikefitboost.com/en/gift#token=${args.token}`),
    }), { idempotencyKey: "gift_measurement:gift_1" });
    const outgoing = send.mock.calls[0][0];
    expect(outgoing.cc).toBeUndefined();
    expect(outgoing.bcc).toBeUndefined();
    expect(outgoing.replyTo).toBeUndefined();
    expect(outgoing.html).not.toContain(gift.recipientEmail);
    expect(ctx.runMutation).toHaveBeenCalledWith(expect.anything(), { giftId: args.giftId });
  });

  it.each([null, { ...gift, recipientEmail: undefined }, { ...gift, expiresAt: Date.UTC(2026, 9, 4) }])(
    "suppresses stale, redeemed, already sent, expired or erased gifts", async value => {
      const ctx = context(value);
      await handler(ctx, args);
      expect(send).not.toHaveBeenCalled();
      expect(ctx.runMutation).not.toHaveBeenCalled();
    });

  it("does not mark mail sent without configured delivery", async () => {
    vi.stubEnv("AUTH_RESEND_KEY", "");
    const ctx = context();
    await handler(ctx, args);
    expect(send).not.toHaveBeenCalled();
    expect(ctx.runMutation).not.toHaveBeenCalled();
  });

  it("does not mark delivery when the provider fails", async () => {
    send.mockResolvedValue({ data: null, error: { message: "provider rejected" } });
    const ctx = context();
    await expect(handler(ctx, args)).rejects.toThrow("provider rejected");
    expect(ctx.runMutation).not.toHaveBeenCalled();
  });
});
