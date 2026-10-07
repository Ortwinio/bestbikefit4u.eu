import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { reserveCheckout } from "../checkout";
import { billingContext, getCheckoutStatus } from "../queries";
import { fixture, row, now } from "./fixture";
const { auth } = vi.hoisted(() => ({ auth: vi.fn() }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: auth }));
const call = (fn: unknown, ctx: unknown, args = {}) => (fn as {
  _handler: (ctx: unknown, args: object) => Promise<unknown>;
})._handler(ctx, args);
beforeEach(() => {
  auth.mockReset();
  auth.mockResolvedValue("users:owner");
  vi.spyOn(Date, "now").mockReturnValue(now);
  vi.stubEnv("STRIPE_BILLING_ENABLED", "true");
  vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "true");
  vi.stubEnv("PERSONAL_FIT_SALES_ENABLED", undefined);
  vi.stubEnv("NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED", undefined);
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });
const request = { productId: "single", bikeId: "bikes:bike", locale: "nl", withdrawalAccepted: true };
describe("authenticated Stripe reservations and read models", () => {
  describe.each(["annual_personal", "personal_fit_standalone"])("personal sales: %s", (productId) => {
    it.each([undefined, "false", "TRUE", "1"])("rejects disabled server flag %s even with public sales visible", async (serverValue) => {
      vi.stubEnv("PERSONAL_FIT_SALES_ENABLED", serverValue);
      vi.stubEnv("NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED", "true");
      const { ctx, rows } = fixture(productId);
      await expect(call(reserveCheckout, ctx, { ...request, productId })).rejects.toThrow("PERSONAL_FIT_SALES_DISABLED");
      expect(rows).toHaveLength(3);
      expect(ctx.db.insert).not.toHaveBeenCalled();
      expect(ctx.db.patch).not.toHaveBeenCalled();
    });
    it.each([undefined, "false", "true"])("allows enabled server sales independently of public flag %s", async (publicValue) => {
      vi.stubEnv("PERSONAL_FIT_SALES_ENABLED", "true");
      vi.stubEnv("NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED", publicValue);
      const { ctx, rows } = fixture();
      rows.push(row("pricingEntitlements:annual", { userId: "users:owner", productId: "annual", status: "active",
        source: "purchase", startsAt: now - 1000, expiresAt: now + 1000 }));
      expect(await call(reserveCheckout, ctx, { ...request, productId })).toMatchObject({ productId });
      expect(ctx.db.insert).toHaveBeenCalledWith("stripeCheckouts", expect.objectContaining({ productId, status: "pending" }));
    });
    it.each(["STRIPE_BILLING_ENABLED", "NEXT_PUBLIC_STRIPE_BILLING_ENABLED"])("keeps %s disabled precedence", async (billingFlag) => {
      vi.stubEnv(billingFlag, "false");
      expect(await call(reserveCheckout, {}, { ...request, productId })).toMatchObject({ code: "STRIPE_NOT_IMPLEMENTED" });
      expect(auth).not.toHaveBeenCalled();
    });
  });
  it("allows annual sales while personal sales are disabled", async () => {
    const { ctx } = fixture();
    expect(await call(reserveCheckout, ctx, { ...request, productId: "annual" })).toMatchObject({ productId: "annual" });
  });
  it("still requires standalone eligibility when personal sales are enabled", async () => {
    vi.stubEnv("PERSONAL_FIT_SALES_ENABLED", "true");
    const { ctx } = fixture();
    await expect(call(reserveCheckout, ctx, { ...request, productId: "personal_fit_standalone" }))
      .rejects.toThrow("PERSONAL_FIT_NOT_ELIGIBLE");
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
  it("off returns stub before auth or writes", async () => {
    vi.stubEnv("STRIPE_BILLING_ENABLED", "false");
    expect(await call(reserveCheckout, {}, request)).toMatchObject({ code: "STRIPE_NOT_IMPLEMENTED" });
    expect(auth).not.toHaveBeenCalled();
  });
  it("checks auth, withdrawal, bike ownership even with paid enforcement off", async () => {
    const { ctx, rows } = fixture();
    auth.mockResolvedValue(null);
    await expect(call(reserveCheckout, ctx, request)).rejects.toThrow("UNAUTHENTICATED");
    auth.mockResolvedValue("users:owner");
    await expect(call(reserveCheckout, ctx, { ...request, withdrawalAccepted: false })).rejects.toThrow("WITHDRAWAL");
    vi.stubEnv("PAID_ACCESS_ENFORCED", "false");
    rows[1].userId = "users:other";
    await expect(call(reserveCheckout, ctx, request)).rejects.toThrow("Bike not found");
  });
  it("reuses failed-provider attempt reservation without granting and recovers stale reservations", async () => {
    const { ctx, rows } = fixture();
    expect(await call(reserveCheckout, ctx, request)).toMatchObject({ reservationId: "stripeCheckouts:checkout" });
    expect(rows).toHaveLength(3);
    rows[2].createdAt = now - 24 * 3600_000;
    const recovered = await call(reserveCheckout, ctx, request);
    expect(recovered).not.toMatchObject({ reservationId: "stripeCheckouts:checkout" });
    expect(rows.filter(item => item._id.startsWith("pricingEntitlements:"))).toHaveLength(0);
  });
  it("does not reuse pending reservation with changed locale/provider parameters", async () => {
    const { ctx } = fixture();
    expect(await call(reserveCheckout, ctx, { ...request, locale: "en" }))
      .not.toMatchObject({ reservationId: "stripeCheckouts:checkout" });
  });
  it("status never exposes another owner or confirms unknown session IDs", async () => {
    const { ctx, rows } = fixture();
    expect(await call(getCheckoutStatus, ctx, { sessionId: "forged" })).toBeNull();
    Object.assign(rows[2], { sessionId: "cs_1", amountTotalCents: 1350 });
    expect(await call(getCheckoutStatus, ctx, { sessionId: "cs_1" })).toMatchObject({ status: "pending", currency: "EUR" });
    auth.mockResolvedValue("users:other");
    expect(await call(getCheckoutStatus, ctx, { sessionId: "cs_1" })).toBeNull();
  });
  it("a newer standalone appointment cannot hide the current annual billing context", async () => {
    const { ctx, rows } = fixture();
    rows.push(row("pricingEntitlements:annual", { userId: "users:owner", productId: "annual", status: "active",
      source: "purchase", startsAt: now - 1000, expiresAt: now + 1000, subscriptionId: "sub_1", customerId: "cus_actual" }));
    rows.push(row("pricingEntitlements:appointment", { userId: "users:owner", productId: "personal_fit_standalone",
      status: "active", source: "purchase", startsAt: now, expiresAt: 0 }));
    rows.push(row("stripeBillingPeriods:annual", { userId: "users:owner", entitlementId: "pricingEntitlements:annual",
      periodStart: now - 1000, periodEnd: now + 1000, subscriptionId: "sub_1", customerId: "cus_actual" }));
    expect(await call(billingContext, ctx)).toMatchObject({ subscriptionId: "sub_1", customerId: "cus_actual" });
  });
  it("cancelled access preserves original billing period for provider-timestamp refund retries", async () => {
    const { ctx, rows } = fixture();
    rows.push(row("pricingEntitlements:annual", { userId: "users:owner", productId: "annual", status: "expired",
      source: "purchase", startsAt: now - 1000, expiresAt: now - 1, subscriptionId: "sub_1", cancelled: true }));
    rows.push(row("stripeBillingPeriods:annual", { userId: "users:owner", entitlementId: "pricingEntitlements:annual",
      periodStart: now - 1000, periodEnd: now + 365 * 86400_000, subscriptionId: "sub_1", customerId: "cus_1",
      paymentIntentId: "pi_renewal", periodPriceCents: 2150, renewed: true }));
    const first = await call(billingContext, ctx);
    vi.spyOn(Date, "now").mockReturnValue(now + 30 * 86400_000);
    expect(await call(billingContext, ctx)).toEqual(first);
    expect(first).toMatchObject({ periodEnd: now + 365 * 86400_000, paymentIntentId: "pi_renewal", cancelled: true });
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
});
