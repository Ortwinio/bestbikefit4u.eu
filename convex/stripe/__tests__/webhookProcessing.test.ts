import { afterEach, describe, expect, it, vi } from "vitest";
import { downgradeToPro, processWebhookEvent, upgradeToPro } from "../mutations";
import { stripeNotImplemented } from "../../../shared/billing/stripeStub";

const handlers = [
  ["processWebhookEvent", processWebhookEvent, { payloadJson: "invalid JSON is intentionally not parsed" }],
  ["upgradeToPro", upgradeToPro, { userId: "user_1" }],
  ["downgradeToPro", downgradeToPro, { stripeCustomerId: "customer_1" }],
] as const;

afterEach(() => vi.unstubAllEnvs());
describe.each(handlers)("%s is inert", (_name, mutation, args) => {
  it.each([undefined, "false", "true"])("never reads or mutates entitlement state with billing=%s", async (flag) => {
    vi.stubEnv("STRIPE_BILLING_ENABLED", flag);
    vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", flag);
    const access = vi.fn(() => { throw new Error("Unexpected context access"); });
    const ctx = new Proxy({}, { get: access });
    const handler = (mutation as unknown as {
      _handler: (ctx: unknown, args: unknown) => Promise<unknown>;
    })._handler;
    expect(await handler(ctx, args)).toEqual(stripeNotImplemented());
    expect(access).not.toHaveBeenCalled();
  });
});
