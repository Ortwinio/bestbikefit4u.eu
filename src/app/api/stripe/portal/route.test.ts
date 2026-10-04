import { afterEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ token: vi.fn(), query: vi.fn(), configure: vi.fn(), session: vi.fn() }));
vi.mock("@convex-dev/auth/nextjs/server", () => ({ convexAuthNextjsToken: mocks.token }));
vi.mock("convex/nextjs", () => ({ fetchQuery: mocks.query }));
vi.mock("@/lib/billing/serverStripe", () => ({ getServerStripe: () => ({ billingPortal: {
  configurations: { create: mocks.configure }, sessions: { create: mocks.session },
} }) }));
import { POST } from "./route";
afterEach(() => vi.unstubAllEnvs());
it("allows invoices and payment methods while disabling portal cancellation and plan changes", async () => {
  vi.stubEnv("STRIPE_BILLING_ENABLED", "true");
  vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "true");
  mocks.token.mockResolvedValue("token");
  mocks.query.mockResolvedValue({ customerId: "cus_owned" });
  mocks.configure.mockResolvedValue({ id: "bpc_safe" });
  mocks.session.mockResolvedValue({ url: "https://billing.stripe.com/session" });
  const response = await POST(new Request("https://bikefitboost.com/api/stripe/portal", {
    method: "POST", body: JSON.stringify({ locale: "nl", customerId: "cus_attacker" }),
  }));
  expect(response.status).toBe(200);
  expect(mocks.configure).toHaveBeenCalledWith(expect.objectContaining({ features: {
    invoice_history: { enabled: true }, payment_method_update: { enabled: true },
    customer_update: { enabled: false }, subscription_cancel: { enabled: false },
    subscription_update: { enabled: false },
  } }), { idempotencyKey: "portal:invoice-payment-only:v1" });
  expect(mocks.session).toHaveBeenCalledWith(expect.objectContaining({
    customer: "cus_owned", configuration: "bpc_safe", return_url: "https://bikefitboost.com/nl/settings",
  }));
});
