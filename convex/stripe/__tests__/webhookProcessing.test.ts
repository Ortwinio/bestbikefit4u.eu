import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MutationCtx } from "../../_generated/server";
import { applyStripeEvent } from "../events";
import { processWebhookEvent } from "../mutations";
import { fixture, event, session, invoice, now } from "./fixture";
const apply = (ctx: unknown, json: string) => applyStripeEvent(ctx as MutationCtx, json);
beforeEach(() => { vi.spyOn(Date, "now").mockReturnValue(now); });
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });
describe("transactional Stripe event contract", () => {
  it("off does not parse even invalid payload or access the database", async () => {
    vi.stubEnv("STRIPE_BILLING_ENABLED", "false");
    const access = vi.fn(() => { throw new Error("access"); });
    const handler = processWebhookEvent as unknown as { _handler: (ctx: unknown, args: object) => Promise<unknown> };
    expect(await handler._handler(new Proxy({}, { get: access }), { payloadJson: "invalid" }))
      .toMatchObject({ code: "STRIPE_NOT_IMPLEMENTED" });
    expect(access).not.toHaveBeenCalled();
  });
  it("unpaid completion never grants; asynchronous success grants once; older failure cannot downgrade", async () => {
    const { ctx, rows } = fixture();
    await apply(ctx, event("checkout.session.completed", session({ payment_status: "unpaid" })));
    expect(rows.filter(row => row._id.startsWith("pricingEntitlements:"))).toHaveLength(0);
    const paid = event("checkout.session.async_payment_succeeded", session(), "evt_paid");
    await apply(ctx, paid);
    expect(await apply(ctx, paid)).toEqual({ duplicate: true });
    await apply(ctx, event("checkout.session.async_payment_failed", session(), "evt_failed", now - 1000));
    expect(rows.filter(row => row._id.startsWith("pricingEntitlements:"))).toHaveLength(1);
    expect(rows[2].status).toBe("paid");
  });
  it.each(["checkout.session.async_payment_failed", "checkout.session.expired"])("%s grants nothing", async type => {
    const { ctx, rows } = fixture();
    await apply(ctx, event(type, session({ payment_status: "unpaid" })));
    expect(rows[2].status).toBe(type.endsWith("expired") ? "expired" : "failed");
    expect(rows.filter(row => row._id.startsWith("pricingEntitlements:"))).toHaveLength(0);
  });
  it.each([{ amount_total: 1 }, { currency: "usd" }, { metadata: { reservationId: "stripeCheckouts:checkout",
    userId: "users:other", productId: "single" } }])("rejects tampered metadata or amount %j", async patch => {
    const { ctx, rows } = fixture();
    await expect(apply(ctx, event("checkout.session.completed", session(patch)))).rejects.toThrow();
    expect(rows.filter(row => row._id.startsWith("pricingEntitlements:"))).toHaveLength(0);
  });
  it("subscription created/active and paid subscription checkout are not a paid billing period", async () => {
    const { ctx, rows } = fixture("annual");
    const metadata = { reservationId: "stripeCheckouts:checkout", userId: "users:owner", productId: "annual" };
    await apply(ctx, event("customer.subscription.created", { id: "sub_1", customer: "cus_1", metadata, status: "active" }));
    await apply(ctx, event("checkout.session.completed", session({ mode: "subscription", subscription: "sub_1",
      amount_total: 2150, metadata }), "evt_checkout"));
    expect(rows.filter(row => row._id.startsWith("pricingEntitlements:"))).toHaveLength(0);
  });
  it("invoice-first grants exact period once; subsequent checkout preserves paid; renewal has own period", async () => {
    const { ctx, rows } = fixture("annual");
    await apply(ctx, event("invoice.paid", invoice()));
    const first = rows.find(row => row._id.startsWith("pricingEntitlements:"))!;
    expect(first).toMatchObject({ startsAt: now, expiresAt: now + 365 * 86400_000, subscriptionId: "sub_1" });
    expect(rows[2]).toMatchObject({ status: "paid", amountTotalCents: 2150 });
    await apply(ctx, event("checkout.session.completed", session({ mode: "subscription", subscription: "sub_1", amount_total: 2150,
      metadata: { reservationId: "stripeCheckouts:checkout", userId: "users:owner", productId: "annual" } }), "evt_checkout"));
    await apply(ctx, event("invoice.paid", invoice(), "evt_invoice_duplicate"));
    expect(rows.filter(row => row._id.startsWith("pricingEntitlements:"))).toHaveLength(1);
    const secondStart = now + 365 * 86400_000;
    await apply(ctx, event("invoice.paid", invoice({ id: "in_2", billing_reason: "subscription_cycle", payment_intent: "pi_2",
      lines: { data: [{ parent: { type: "subscription_item_details" }, pricing: { price_details: { price: "price_annual" } },
        period: { start: secondStart / 1000, end: (secondStart + 365 * 86400_000) / 1000 } }] } }), "evt_renewal", secondStart));
    expect(rows.filter(row => row._id.startsWith("pricingEntitlements:"))).toHaveLength(2);
    expect(rows[2]).toMatchObject({ paymentIntentId: "pi_1", amountTotalCents: 2150 });
  });
  it("invoice payment failures/action required never revoke an already paid period", async () => {
    const { ctx, rows } = fixture("annual");
    await apply(ctx, event("invoice.paid", invoice()));
    await apply(ctx, event("invoice.payment_failed", invoice(), "evt_fail"));
    await apply(ctx, event("invoice.payment_action_required", invoice(), "evt_action"));
    expect(rows[2].status).toBe("paid");
    expect(rows.find(row => row._id.startsWith("pricingEntitlements:"))?.status).toBe("active");
  });
  it("wrong annual line cannot create a billing period", async () => {
    const { ctx } = fixture("annual");
    await expect(apply(ctx, event("invoice.paid", invoice({ lines: { data: [] } })))).rejects.toThrow("INVALID_BILLING_PERIOD");
  });
  it("refund-before-paid prevents access; partial refund alone preserves access; full refund revokes", async () => {
    const { ctx, rows } = fixture();
    const refund = { payment_intent: "pi_1", customer: "cus_1", amount: 1350, amount_refunded: 1350, refunded: true };
    await apply(ctx, event("charge.refunded", refund));
    await apply(ctx, event("checkout.session.completed", session(), "evt_paid"));
    expect(rows[2].status).toBe("refunded");
    expect(rows.filter(row => row._id.startsWith("pricingEntitlements:"))).toHaveLength(0);
    const other = fixture();
    await apply(other.ctx, event("checkout.session.completed", session()));
    await apply(other.ctx, event("charge.refunded", { ...refund, amount_refunded: 100, refunded: false }, "evt_partial"));
    expect(other.rows.find(row => row._id.startsWith("pricingEntitlements:"))?.status).toBe("active");
    await apply(other.ctx, event("charge.refunded", refund, "evt_full"));
    expect(other.rows.find(row => row._id.startsWith("pricingEntitlements:"))?.status).toBe("revoked");
  });
  it("ignores unrelated Stripe subscriptions without app metadata", async () => {
    const { ctx, rows } = fixture();
    await apply(ctx, event("customer.subscription.created", { id: "sub_other", customer: "cus_other", metadata: {} }));
    expect(rows.filter(row => row._id.startsWith("pricingEntitlements:"))).toHaveLength(0);
  });
  it("late payment identity revokes the existing grant when refund arrived first", async () => {
    const { ctx, rows } = fixture("annual");
    await apply(ctx, event("invoice.paid", invoice({ payment_intent: undefined })));
    await apply(ctx, event("charge.refunded", { payment_intent: "pi_1", customer: "cus_1", amount: 2150,
      amount_refunded: 2150, refunded: true }, "evt_refund"));
    await apply(ctx, event("invoice.paid", invoice(), "evt_late_identity"));
    expect(rows.find(row => row._id.startsWith("pricingEntitlements:")))
      .toMatchObject({ status: "revoked", paymentIntentId: "pi_1", revokedReason: "refunded" });
  });
  it("subscription deletion before delayed paid invoice persists cancellation and access end", async () => {
    const { ctx, rows } = fixture("annual");
    await apply(ctx, event("customer.subscription.deleted", { id: "sub_1", customer: "cus_1", ended_at: now / 1000,
      metadata: { reservationId: "stripeCheckouts:checkout", userId: "users:owner", productId: "annual",
        annualPriceId: "price_annual" } }));
    await apply(ctx, event("invoice.paid", invoice(), "evt_delayed"));
    await apply(ctx, event("invoice.paid", invoice(), "evt_delayed_again"));
    expect(rows.find(row => row._id.startsWith("pricingEntitlements:")))
      .toMatchObject({ cancelled: true, status: "expired", expiresAt: now });
  });

  it.each([true, false])("signed invoice-payment identity reconciles full refund in either order (mapping first=%s)", async first => {
    const { ctx, rows } = fixture("annual");
    const mapping = event("invoice_payment.paid", { id: "inpay_1", invoice: "in_1", status: "paid", amount_paid: 2150,
      currency: "eur", payment: { type: "payment_intent", payment_intent: "pi_1" } }, "evt_mapping");
    if (first) await apply(ctx, mapping);
    await apply(ctx, event("invoice.paid", invoice({ payment_intent: undefined })));
    await apply(ctx, event("charge.refunded", { payment_intent: "pi_1", customer: "cus_1", amount: 2150,
      amount_refunded: 2150, refunded: true }, "evt_refund"));
    if (!first) await apply(ctx, mapping);
    expect(rows.find(row => row._id.startsWith("pricingEntitlements:")))
      .toMatchObject({ paymentIntentId: "pi_1", status: "revoked", revokedReason: "refunded" });
    expect(rows.find(row => row._id.startsWith("stripeBillingPeriods:")))
      .toMatchObject({ invoiceId: "in_1", paymentIntentId: "pi_1" });
  });

});
