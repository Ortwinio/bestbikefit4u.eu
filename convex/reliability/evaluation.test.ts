import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendEvaluation } from "./evaluation";
const { deliver, links, canSend } = vi.hoisted(() => ({ deliver: vi.fn(), links: vi.fn(), canSend: vi.fn() }));
vi.mock("../emails/delivery", () => ({ deliverEmail: deliver,
  emailActionUrl: (locale: string, path: string) => `https://bikefitboost.com/${locale}${path}` }));
vi.mock("../emails/unsubscribeTokens", () => ({ buildEmailPreferenceLinks: links, canSendPreferenceEmails: canSend }));
const invoke = (ctx: unknown) => (sendEvaluation as unknown as {
  _handler: (ctx: unknown, args: object) => Promise<void>;
})._handler(ctx, { measurementId: "measurement-1" });
beforeEach(() => {
  vi.stubEnv("AUTH_RESEND_KEY", "local-test-only"); canSend.mockReturnValue(true); deliver.mockResolvedValue(true);
  links.mockResolvedValue({ unsubscribeUrl: "https://bikefitboost.com/unsubscribe", preferencesUrl:
    "https://bikefitboost.com/preferences", headers: { "List-Unsubscribe": "<https://bikefitboost.com/unsubscribe>" } });
});
afterEach(() => { vi.clearAllMocks(); vi.unstubAllEnvs(); });
function context() {
  return { runQuery: vi.fn().mockResolvedValue({ user: { _id: "owner", email: "owner@example.test",
    locale: "nl", displayName: "Lisa Jansen" }, measurement: { _id: "measurement-1", angleDegrees: 31,
    targetSaddleHeightMm: 787 } }), runMutation: vi.fn() };
}
describe("scheduled evaluation delivery", () => {
  it("does not deliver when context is suppressed by preferences, not due, sent or superseded", async () => {
    const ctx = context(); ctx.runQuery.mockResolvedValue(null); await invoke(ctx);
    expect(deliver).not.toHaveBeenCalled(); expect(ctx.runMutation).not.toHaveBeenCalled();
  });
  it("uses one provider idempotency key per measurement and marks only successful delivery", async () => {
    const ctx = context(); await invoke(ctx);
    expect(deliver).toHaveBeenCalledWith("owner@example.test", expect.objectContaining({
      subject: "Hoe voelt je zadelhoogte na een week?" }), expect.objectContaining({
      idempotencyKey: "knee-evaluation/measurement-1" }));
    expect(ctx.runMutation).toHaveBeenCalledOnce();
    ctx.runMutation.mockClear(); deliver.mockResolvedValue(false); await invoke(ctx);
    expect(ctx.runMutation).not.toHaveBeenCalled();
  });
  it("does not query or send with missing delivery or unsubscribe config", async () => {
    const ctx = context(); vi.stubEnv("AUTH_RESEND_KEY", ""); await invoke(ctx);
    expect(ctx.runQuery).not.toHaveBeenCalled();
    vi.stubEnv("AUTH_RESEND_KEY", "local-test-only"); canSend.mockReturnValue(false); await invoke(ctx);
    expect(deliver).not.toHaveBeenCalled();
  });
});
