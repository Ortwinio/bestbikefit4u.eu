import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ token: vi.fn(), report: vi.fn() }));
vi.mock("@convex-dev/auth/nextjs/server", () => ({ convexAuthNextjsToken: mocks.token }));
vi.mock("@/lib/billing/billingAlert", () => ({ reportBillingAlert: mocks.report }));
import { stripeRoute } from "./handler";
import { stripeNotImplemented } from "@/lib/billing/stripeStub";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.token.mockResolvedValue("test-token");
  vi.stubEnv("STRIPE_BILLING_ENABLED", "true");
  vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "true");
});
afterEach(() => vi.unstubAllEnvs());
const request = (body = '{}') => new Request("https://example.test/api/stripe/checkout", { method: "POST", body });
it.each(["nl", "en"])("reports a redacted error and returns a localized generic failure (%s)", async locale => {
  const action = vi.fn().mockRejectedValue(new Error("provider private payload"));
  const response = await stripeRoute(action)(request(JSON.stringify({ locale })));
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ code: "BILLING_REQUEST_FAILED", message: locale === "nl"
    ? "De betaling kon niet worden verwerkt. Probeer het opnieuw."
    : "The billing request could not be processed. Please try again." });
  expect(mocks.report).toHaveBeenCalledExactlyOnceWith("BILLING_REQUEST_FAILED");
});
it("reports invalid JSON using a fixed code", async () => {
  await stripeRoute(vi.fn())(request("invalid"));
  expect(mocks.report).toHaveBeenCalledWith("BILLING_INVALID_JSON");
});
it("disabled billing preserves the 501 body and never invokes the provider", async () => {
  vi.stubEnv("STRIPE_BILLING_ENABLED", "false");
  const action = vi.fn();
  const response = await stripeRoute(action)(request());
  expect(response.status).toBe(501);
  expect(await response.json()).toEqual(stripeNotImplemented("nl"));
  expect(action).not.toHaveBeenCalled();
  expect(mocks.report).not.toHaveBeenCalled();
});
it("unauthenticated stays 401", async () => {
  mocks.token.mockResolvedValue(null);
  const action = vi.fn();
  expect((await stripeRoute(action)(request())).status).toBe(401);
  expect(action).not.toHaveBeenCalled();
});
