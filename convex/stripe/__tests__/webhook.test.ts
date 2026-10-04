import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { stripeWebhookResponse } from "../webhook";
import { stripeNotImplemented } from "../../../shared/billing/stripeStub";

afterEach(() => vi.unstubAllEnvs());
describe("inert Stripe webhook", () => {
  it.each([undefined, "false", "true"])("never acknowledges an event with billing=%s", async (flag) => {
    vi.stubEnv("STRIPE_BILLING_ENABLED", flag);
    vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", flag);
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "unused-test-secret");
    const response = stripeWebhookResponse();
    expect(response.status).toBe(501);
    expect(await response.json()).toEqual(stripeNotImplemented());
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("registers the endpoint without exposing the request or mutation context", () => {
    const source = readFileSync("convex/http.ts", "utf8");
    expect(source).toContain('path: "/stripe/webhook"');
    expect(source).toContain("handler: httpAction(async () => stripeWebhookResponse())");
    expect(source).not.toContain("processWebhookEvent");
    expect(source).not.toContain("sendProWelcome");
    expect(source).not.toContain("STRIPE_WEBHOOK_SECRET");
  });
});
