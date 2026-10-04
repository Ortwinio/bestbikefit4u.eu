import { afterEach, describe, expect, it, vi } from "vitest";
import Stripe from "stripe";
import { handleStripeWebhook } from "../webhook";
import { stripeNotImplemented } from "../../../shared/billing/stripeStub";

afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });
const request = (body = "{}", signature?: string) => new Request("https://example.test/stripe/webhook", {
  method: "POST", body, headers: signature ? { "stripe-signature": signature } : {},
});
describe("Stripe signed webhook boundary", () => {
  it("off returns the original stub without reading body, verifying, or invoking mutations", async () => {
    vi.stubEnv("STRIPE_BILLING_ENABLED", "false");
    const process = vi.fn();
    const input = request();
    const read = vi.spyOn(input, "text");
    const response = await handleStripeWebhook(input, process);
    expect(response.status).toBe(501);
    expect(await response.json()).toEqual(stripeNotImplemented());
    expect(process).not.toHaveBeenCalled();
    expect(read).not.toHaveBeenCalled();
  });
  it("rejects forged signatures before invoking the mutation", async () => {
    vi.stubEnv("STRIPE_BILLING_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "true");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");
    const process = vi.fn();
    expect((await handleStripeWebhook(request("{}", "forged"), process)).status).toBe(400);
    expect(process).not.toHaveBeenCalled();
  });
  it("verifies a real local HMAC before processing; failure returns generic 500", async () => {
    vi.stubEnv("STRIPE_BILLING_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "true");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");
    const body = JSON.stringify({ id: "evt_1", type: "invoice.paid", data: { object: {} } });
    const stripe = new Stripe("sk_test_fake");
    const header = stripe.webhooks.generateTestHeaderString({ payload: body, secret: "whsec_test" });
    const process = vi.fn().mockResolvedValue({});
    expect((await handleStripeWebhook(request(body, header), process)).status).toBe(200);
    expect(process).toHaveBeenCalledWith(body);
    process.mockRejectedValue(new Error("private details"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const failed = await handleStripeWebhook(request(body, header), process);
    expect(failed.status).toBe(500);
    expect(await failed.text()).toBe("Webhook processing failed");
  });
});
