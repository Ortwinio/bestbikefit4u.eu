import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { run24hProNudgeBatch, sendProWelcome } from "../fitpass";
import { runDay1TipsBatch, runFitReminderBatch, runUpgradeNudgeBatch, runWinbackBatch } from "../lifecycle";
import { sendCaseStudyConfirmation, sendLeadNotification } from "../../caseStudyLeads/emails";
import { BRAND } from "../../lib/brand";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("resend", () => ({ Resend: class { emails = { send }; } }));

type Context = { runQuery: ReturnType<typeof vi.fn>; runMutation: ReturnType<typeof vi.fn> };
type Handler = (ctx: Context, args: Record<string, string>) => Promise<unknown>;
const welcome = (sendProWelcome as unknown as { _handler: Handler })._handler;
const explainer = (run24hProNudgeBatch as unknown as { _handler: Handler })._handler;
const confirmation = (sendCaseStudyConfirmation as unknown as { _handler: Handler })._handler;
const notification = (sendLeadNotification as unknown as { _handler: Handler })._handler;

function emailContext(overrides: Record<string, unknown> = {}) {
  return {
    user: { _id: "user_1", email: "fresh@example.com", locale: "nl", tier: "pro", name: "Lisa Jansen", ...overrides },
    recommendation: { sessionId: "session_1", calculatedFit: { saddleHeightMm: 754, saddleSetbackMm: 49, handlebarDropMm: 98 } },
    hasFit: true,
  };
}

function batchContext(fresh: unknown = emailContext(), sent = false): Context {
  return {
    runQuery: vi.fn().mockResolvedValueOnce([{ _id: "user_1", email: "stale@example.com", locale: "en", tier: "pro" }])
      .mockResolvedValueOnce(fresh).mockResolvedValueOnce(sent),
    runMutation: vi.fn(),
  };
}

beforeEach(() => {
  send.mockReset().mockResolvedValue({ data: { id: "email_1" }, error: null });
  vi.stubEnv("AUTH_RESEND_KEY", "test-only-key");
  vi.stubEnv("SITE_URL", "https://example.com");
  vi.stubEnv("CONVEX_SITE_URL", "https://test.convex.site");
  vi.stubEnv("EMAIL_UNSUBSCRIBE_SECRET", "test-only-secret-with-at-least-32-characters");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("service and marketing production guard", () => {
  it.each([
    ["day1", runDay1TipsBatch],
    ["reminder", runFitReminderBatch],
    ["upgrade", runUpgradeNudgeBatch],
    ["winback", runWinbackBatch],
    ["explainer", run24hProNudgeBatch],
  ] as const)("skips %s once per run without a valid unsubscribe secret", async (_name, definition) => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const handler = (definition as unknown as { _handler: Handler })._handler;
    for (const secret of [undefined, "", "too-short"]) {
      vi.stubEnv("EMAIL_UNSUBSCRIBE_SECRET", secret);
      error.mockClear();
      const ctx = batchContext();
      await expect(handler(ctx, {})).resolves.toBeUndefined();
      expect(error).toHaveBeenCalledExactlyOnceWith(
        "Service/marketing email batch skipped: EMAIL_UNSUBSCRIBE_SECRET is missing or invalid.",
      );
      expect(ctx.runQuery).not.toHaveBeenCalled();
      expect(ctx.runMutation).not.toHaveBeenCalled();
      expect(send).not.toHaveBeenCalled();
    }
  });

  it("still sends and logs transactional mail with no unsubscribe secret", async () => {
    vi.stubEnv("EMAIL_UNSUBSCRIBE_SECRET", undefined);
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const ctx = {
      runQuery: vi.fn().mockResolvedValueOnce(emailContext()).mockResolvedValueOnce(false),
      runMutation: vi.fn(),
    };
    await welcome(ctx, { userId: "user_1" });
    expect(send).toHaveBeenCalledOnce();
    expect(send.mock.calls[0][0].headers).toBeUndefined();
    expect(ctx.runMutation).toHaveBeenCalledWith(expect.anything(), {
      userId: "user_1", emailType: "pro_welcome", locale: "nl",
    });
    expect(error).not.toHaveBeenCalled();
  });
});

describe("Fit Pass senders", () => {
  it("sends the transactional welcome despite opt-outs using current locale", async () => {
    const ctx = { runQuery: vi.fn().mockResolvedValueOnce(emailContext({ emailPreferences: { service: false, marketing: false } })).mockResolvedValueOnce(false), runMutation: vi.fn() };
    await welcome(ctx, { userId: "user_1" });
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ to: ["fresh@example.com"], html: expect.stringContaining('lang="nl"'), text: expect.stringContaining("volledige toegang") }), { idempotencyKey: "pro_welcome:user_1" });
    expect(send.mock.calls[0][0].headers).toBeUndefined();
    expect(ctx.runMutation).toHaveBeenCalledWith(expect.anything(), { userId: "user_1", emailType: "pro_welcome", locale: "nl" });
  });

  it("uses fresh user locale, email, fit values and service unsubscribe headers", async () => {
    const ctx = batchContext();
    await explainer(ctx, {});
    expect(send).toHaveBeenCalledWith(expect.objectContaining({
      to: ["fresh@example.com"], html: expect.stringContaining('lang="nl"'),
      text: expect.stringContaining("754"),
      headers: { "List-Unsubscribe": expect.stringContaining("https://test.convex.site/emails/unsubscribe?token="), "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    }), { idempotencyKey: "email_24h_pro_nudge:user_1" });
    expect(send.mock.calls[0][0].html).toContain("https://example.com/nl/fit/session_1/results");
    expect(ctx.runMutation).toHaveBeenCalledWith(expect.anything(), { userId: "user_1", emailType: "email_24h_pro_nudge", locale: "nl" });
  });

  it("renders English then Dutch after a saved locale change", async () => {
    await explainer(batchContext(emailContext({ locale: "en" })), {});
    await explainer(batchContext(emailContext({ locale: "nl" })), {});
    expect(send.mock.calls[0][0].html).toContain('lang="en"');
    expect(send.mock.calls[1][0].html).toContain('lang="nl"');
  });

  it.each([
    null,
    emailContext({ email: undefined }),
    emailContext({ tier: "free" }),
    emailContext({ emailPreferences: { service: false, marketing: true } }),
  ])("skips newly ineligible users", async (fresh) => {
    const ctx = batchContext(fresh);
    await explainer(ctx, {});
    expect(send).not.toHaveBeenCalled();
    expect(ctx.runMutation).not.toHaveBeenCalled();
  });

  it("rechecks explainer idempotency after candidate selection", async () => {
    const ctx = batchContext(emailContext(), true);
    await explainer(ctx, {});
    expect(send).not.toHaveBeenCalled();
    expect(ctx.runMutation).not.toHaveBeenCalled();
  });

  it("skips a previously sent welcome", async () => {
    const ctx = { runQuery: vi.fn().mockResolvedValueOnce(emailContext()).mockResolvedValueOnce(true), runMutation: vi.fn() };
    await welcome(ctx, { userId: "user_1" });
    expect(send).not.toHaveBeenCalled();
    expect(ctx.runMutation).not.toHaveBeenCalled();
  });

  it.each(["welcome", "explainer"])("does not log %s without a delivery key", async (kind) => {
    vi.stubEnv("AUTH_RESEND_KEY", "");
    vi.stubEnv("EMAIL_UNSUBSCRIBE_SECRET", "");
    const ctx = kind === "welcome" ? { runQuery: vi.fn().mockResolvedValueOnce(emailContext()).mockResolvedValueOnce(false), runMutation: vi.fn() } : batchContext();
    await (kind === "welcome" ? welcome : explainer)(ctx, { userId: "user_1" });
    expect(send).not.toHaveBeenCalled();
    expect(ctx.runMutation).not.toHaveBeenCalled();
  });

  it.each(["welcome", "explainer"])("does not log %s on provider error", async (kind) => {
    send.mockResolvedValue({ data: null, error: { message: "provider failure" } });
    const ctx = kind === "welcome" ? { runQuery: vi.fn().mockResolvedValueOnce(emailContext()).mockResolvedValueOnce(false), runMutation: vi.fn() } : batchContext();
    await expect((kind === "welcome" ? welcome : explainer)(ctx, { userId: "user_1" })).rejects.toThrow("provider failure");
    expect(ctx.runMutation).not.toHaveBeenCalled();
  });
});

describe("case study senders", () => {
  const lead = { name: "Lisa Jansen", email: "lisa@example.com", locale: "en", painSummary: "Knee pain", sourcePath: "/en/pain", createdAt: 1700000000000 };
  it.each(["nl", "en"])("uses stored %s for confirmation", async (locale) => {
    await confirmation({ runQuery: vi.fn().mockResolvedValue({ ...lead, locale }), runMutation: vi.fn() }, { leadId: "lead_1" });
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ to: [lead.email], html: expect.stringContaining(`lang="${locale}"`), text: expect.any(String) }), { idempotencyKey: "case_study_confirmation:lead_1" });
    expect(send.mock.calls[0][0].html).toContain(`https://example.com/${locale}/bikes`);
    expect(send.mock.calls[0][0].headers).toBeUndefined();
  });
  it("keeps the internal lead notification Dutch for an English lead", async () => {
    await notification({ runQuery: vi.fn().mockResolvedValue(lead), runMutation: vi.fn() }, { leadId: "lead_1" });
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ to: [BRAND.supportEmail], html: expect.stringContaining('lang="nl"'), text: expect.stringContaining(lead.email) }), { idempotencyKey: "case_study_lead:lead_1" });
  });
  it.each([confirmation, notification])("skips deleted leads", async (handler) => {
    await handler({ runQuery: vi.fn().mockResolvedValue(null), runMutation: vi.fn() }, { leadId: "lead_1" });
    expect(send).not.toHaveBeenCalled();
  });
  it.each([confirmation, notification])("propagates delivery errors", async (handler) => {
    send.mockResolvedValue({ data: null, error: { message: "provider failure" } });
    await expect(handler({ runQuery: vi.fn().mockResolvedValue(lead), runMutation: vi.fn() }, { leadId: "lead_1" })).rejects.toThrow("provider failure");
  });
});
