import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import { sendFitterNotification } from "./send";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("resend", () => ({ Resend: class { emails = { send }; } }));

const invoke = (ctx: unknown) => (sendFitterNotification as unknown as {
  _handler: (context: unknown, args: { notificationId: string }) => Promise<unknown>;
})._handler(ctx, { notificationId: "notification_1" });

function fixture(productId: string, locale: "nl" | "en") {
  let claimed = false;
  const runMutation = vi.fn(async (reference, args) => {
    if (getFunctionName(reference).endsWith(":claimFitterNotification")) {
      if (claimed) return null;
      claimed = true;
      return {
        recipient: "fitter@example.test", riderName: "Rider <script>test</script>",
        riderEmail: "rider@example.test", productId, paidAt: Date.UTC(2026, 9, 7),
        locale, idempotencyKey: "personal-bikefit:personal_1",
      };
    }
    return args;
  });
  return { runMutation };
}

beforeEach(() => {
  vi.stubEnv("AUTH_RESEND_KEY", "test-only-not-a-real-key");
  send.mockReset().mockResolvedValue({ data: { id: "mock-mail" }, error: null });
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("fitter notification delivery (Resend mocked)", () => {
  it.each([
    ["annual_personal", "nl"], ["annual_personal", "en"],
    ["personal_fit_standalone", "nl"], ["personal_fit_standalone", "en"],
  ] as const)("delivers %s in %s once with an external idempotency key", async (productId, locale) => {
    const ctx = fixture(productId, locale);
    expect(await invoke(ctx)).toEqual({ status: "sent" });
    expect(await invoke(ctx)).toEqual({ status: "skipped" });
    expect(send).toHaveBeenCalledTimes(1);
    const [payload, options] = send.mock.calls[0];
    expect(options).toEqual({ idempotencyKey: "personal-bikefit:personal_1" });
    expect(payload.to).toEqual(["fitter@example.test"]);
    expect(payload.html).toContain("rider@example.test");
    expect(payload.text).toContain("rider@example.test");
    expect(payload.text).toContain("2026");
    expect(payload.text).toContain(locale === "nl" ? "Betaling bevestigd op" : "Payment confirmed on");
    expect(payload.text).toContain(productId === "annual_personal"
      ? locale === "nl" ? "Jaarabonnement met persoonlijke bikefit" : "Annual subscription with personal bike fit"
      : locale === "nl" ? "Persoonlijke bikefit-afspraak" : "Personal bike fit appointment");
    expect(payload.html).not.toContain("<script>test</script>");
    expect(payload.html).not.toMatch(/inseam|binnenbeen|saddleHeight|bodyMeasurements/);
    expect(ctx.runMutation.mock.calls.some(([, args]) => args.sent === true)).toBe(true);
  });

  it("does not claim or send when mail configuration is missing", async () => {
    vi.stubEnv("AUTH_RESEND_KEY", "");
    const ctx = fixture("annual_personal", "nl");
    expect(await invoke(ctx)).toEqual({ status: "not_configured" });
    expect(ctx.runMutation).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it("does not send if the claim rejects a refunded or already handled entitlement", async () => {
    const ctx = { runMutation: vi.fn().mockResolvedValue(null) };
    expect(await invoke(ctx)).toEqual({ status: "skipped" });
    expect(send).not.toHaveBeenCalled();
  });

  it("records a safe failure without logging provider payload or retrying ambiguously", async () => {
    send.mockRejectedValue(new Error("sensitive provider payload must not be logged"));
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const ctx = fixture("personal_fit_standalone", "en");
    expect(await invoke(ctx)).toEqual({ status: "failed" });
    expect(log).toHaveBeenCalledExactlyOnceWith("BILLING_ALERT", { code: "FITTER_NOTIFICATION_FAILED" });
    expect(ctx.runMutation.mock.calls.some(([, args]) => args.sent === false)).toBe(true);
    expect(await invoke(ctx)).toEqual({ status: "skipped" });
    expect(send).toHaveBeenCalledTimes(1);
  });
});
