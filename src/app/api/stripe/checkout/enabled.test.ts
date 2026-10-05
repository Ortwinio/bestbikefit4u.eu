import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ token: vi.fn(), reserve: vi.fn(), create: vi.fn(), customer: vi.fn() }));
vi.mock("@convex-dev/auth/nextjs/server", () => ({ convexAuthNextjsToken: mocks.token }));
vi.mock("convex/nextjs", () => ({ fetchMutation: mocks.reserve }));
vi.mock("@/lib/billing/serverStripe", () => ({
  stripeEnvironment: (key: string) => key,
  getServerStripe: () => ({ checkout: { sessions: { create: mocks.create } },
    customers: { create: mocks.customer }, prices: { retrieve: async () => ({
      active: true, currency: "eur", unit_amount: 2150, recurring: { interval: "year", interval_count: 1 },
    }) },
  }),
}));
import { POST } from "./route";
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("STRIPE_BILLING_ENABLED", "true");
  vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "true");
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("No network allowed"); }));
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  mocks.token.mockResolvedValue("auth-token");
  mocks.reserve.mockResolvedValue({ reservationId: "owned-reservation", userId: "owner",
    email: "owner@example.com", productId: "annual", eligibleForUpgrade: false });
  mocks.customer.mockResolvedValue({ id: "cus_owner" });
  mocks.create.mockResolvedValue({ id: "cs_mock", url: "https://checkout.stripe.com/mock" });
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
function request(body: Record<string, unknown>) {
  return new Request("https://bikefitboost.com/api/stripe/checkout", { method: "POST", body: JSON.stringify(body) });
}
it("uses authorized reservation and configured prices; ignores client customer, coupon, amount and redirect", async () => {
  const response = await POST(request({ productId: "annual", locale: "nl", withdrawalAccepted: true,
    customerId: "attacker", coupon: "free", amount: 1, returnUrl: "https://attacker.example" }));
  expect(await response.json()).toEqual({ sessionId: "cs_mock", url: "https://checkout.stripe.com/mock" });
  expect(mocks.reserve).toHaveBeenCalledWith(expect.anything(), {
    productId: "annual", locale: "nl", withdrawalAccepted: true, bikeId: undefined,
  }, { token: "auth-token" });
  expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ customer: "cus_owner",
    mode: "subscription", metadata: expect.objectContaining({ userId: "owner", reservationId: "owned-reservation" }),
  }), { idempotencyKey: "checkout:owned-reservation" });
  expect(mocks.customer).toHaveBeenCalledWith(expect.anything(), { idempotencyKey: "customer:owner" });
  expect(fetch).not.toHaveBeenCalled();
});
it("rejects missing consent without reserving or creating provider resources", async () => {
  const response = await POST(request({ productId: "annual", locale: "en" }));
  expect(response.status).toBe(400);
  expect(mocks.reserve).not.toHaveBeenCalled();
  expect(mocks.create).not.toHaveBeenCalled();
});
it("never creates a checkout after backend ownership/eligibility rejection", async () => {
  mocks.reserve.mockRejectedValue(new Error("BIKE_NOT_OWNED"));
  const response = await POST(request({ productId: "single", bikeId: "other-bike", withdrawalAccepted: true }));
  expect(response.status).toBe(400);
  expect(mocks.customer).not.toHaveBeenCalled();
  expect(mocks.create).not.toHaveBeenCalled();
  expect(JSON.stringify(await response.json())).not.toContain("BIKE_NOT_OWNED");
});
