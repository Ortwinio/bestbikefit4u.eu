import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import type { MutationCtx } from "../../_generated/server";
import { applyStripeEvent } from "../events";
import { event, fixture, invoice, now, row, session } from "./fixture";

const apply = (context: unknown, payload: string) => applyStripeEvent(context as MutationCtx, payload);
beforeEach(() => {
  vi.spyOn(Date, "now").mockReturnValue(now);
  vi.stubEnv("STRIPE_BILLING_ENABLED", "true");
  vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "true");
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

describe("verified payment mail scheduling", () => {
  it.each(["single", "personal_fit_standalone"])("queues %s purchase once per payment intent", async productId => {
    const { ctx, rows } = fixture(productId);
    if (productId === "personal_fit_standalone") rows.push(row("pricingEntitlements:annual", {
      userId: "users:owner", productId: "annual", status: "active", startsAt: now - 86400_000,
      expiresAt: now + 86400_000,
    }));
    const data = session(productId === "single" ? {} : {
      amount_total: 20950,
      metadata: { reservationId: "stripeCheckouts:checkout", userId: "users:owner", productId },
    });
    await apply(ctx, event("checkout.session.completed", data));
    await apply(ctx, event("checkout.session.async_payment_succeeded", data, "evt_second"));
    await apply(ctx, event("checkout.session.completed", data));
    const jobs = rows.filter(entry => entry._id.startsWith("billingEmailJobs:"));
    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({ kind: "purchase", sendKey: "purchase:pi_1", status: "pending" });
    const scheduled = ctx.scheduler.runAfter.mock.calls.filter(call =>
      getFunctionName(call[1]) === "emails/billing:sendBillingEmail");
    expect(scheduled).toHaveLength(1);
    expect(scheduled[0][0]).toBe(0);
    expect(scheduled[0][2]).toEqual({ jobId: jobs[0]._id });
  });

  it.each(["annual", "annual_upgrade", "annual_personal"])("queues %s welcome once for initial period only", async productId => {
    const { ctx, rows } = fixture(productId);
    if (productId === "annual_upgrade") rows.push(row("pricingEntitlements:prior", {
      userId: "users:owner", productId: "single", source: "purchase", status: "active",
      startsAt: now - 86400_000, expiresAt: now + 86400_000,
    }));
    const amount = productId === "annual_upgrade" ? 950 : productId === "annual_personal" ? 23450 : 2150;
    const data = invoice({ amount_paid: amount, parent: { subscription_details: { subscription: "sub_1", metadata: {
      reservationId: "stripeCheckouts:checkout", userId: "users:owner", productId, annualPriceId: "price_annual",
    } } } });
    await apply(ctx, event("invoice.paid", data));
    await apply(ctx, event("invoice.paid", data, "evt_replay"));
    expect(rows.filter(entry => entry._id.startsWith("billingEmailJobs:")))
      .toMatchObject([{ kind: "welcome", sendKey: `welcome:sub_1:${now}` }]);
    const nextStart = now + 365 * 86400_000;
    await apply(ctx, event("invoice.paid", { ...data, id: "in_next", amount_paid: 2150,
      billing_reason: "subscription_cycle", payment_intent: "pi_next", lines: { data: [{
        parent: { type: "subscription_item_details" }, pricing: { price_details: { price: "price_annual" } },
        period: { start: nextStart / 1000, end: (nextStart + 365 * 86400_000) / 1000 },
      }] } }, "evt_next", nextStart));
    expect(rows.filter(entry => entry._id.startsWith("billingEmailJobs:"))).toHaveLength(1);
  });

  it("queues cancellation for latest billing period only, with replay dedupe", async () => {
    const { ctx, rows } = fixture("annual");
    rows.push(row("pricingEntitlements:old", { userId: "users:owner", subscriptionId: "sub_1",
      startsAt: now - 365 * 86400_000, expiresAt: now, status: "expired", productId: "annual" }));
    await apply(ctx, event("invoice.paid", invoice()));
    const cancellation = { id: "sub_1", customer: "cus_1", cancel_at_period_end: true };
    await apply(ctx, event("customer.subscription.updated", cancellation, "evt_cancel"));
    await apply(ctx, event("customer.subscription.updated", cancellation, "evt_cancel_again"));
    expect(rows.filter(entry => entry.kind === "cancellation"))
      .toMatchObject([{ sendKey: `cancellation:sub_1:${now}` }]);
  });

  it("cancellation before invoice still queues the confirmation when entitlement arrives", async () => {
    const { ctx, rows } = fixture("annual");
    await apply(ctx, event("customer.subscription.deleted", { id: "sub_1", customer: "cus_1", ended_at: now / 1000,
      metadata: { reservationId: "stripeCheckouts:checkout", userId: "users:owner", productId: "annual" } }));
    await apply(ctx, event("invoice.paid", invoice(), "evt_late"));
    expect(rows.filter(entry => entry.kind === "cancellation")).toHaveLength(1);
  });

  it("full refund arriving before payment creates no purchase mail", async () => {
    const { ctx, rows } = fixture();
    await apply(ctx, event("charge.refunded", { payment_intent: "pi_1", customer: "cus_1",
      amount: 1350, amount_refunded: 1350, refunded: true }));
    await apply(ctx, event("checkout.session.completed", session(), "evt_late"));
    expect(rows.filter(entry => entry._id.startsWith("billingEmailJobs:"))).toHaveLength(0);
  });

  it("does not persist unsupported event types outside the shared subscription list", async () => {
    const { ctx, rows } = fixture();
    expect(await apply(ctx, event("customer.created", { id: "cus_1" }))).toMatchObject({ ignored: true });
    expect(rows.filter(entry => entry._id.startsWith("stripe_events:"))).toHaveLength(0);
  });

  it.each(["invoice_payment.paid", "invoice.paid"])("%s wakes an existing job after delayed payment identity", async type => {
    const { ctx, rows } = fixture("annual");
    await apply(ctx, event("invoice.paid", invoice({ payment_intent: undefined })));
    const job = rows.find(entry => entry.kind === "welcome")!;
    Object.assign(job, { failureCode: "awaiting_payment_evidence", attempts: 0 });
    ctx.scheduler.runAfter.mockClear();
    const data = type === "invoice.paid" ? invoice() : { id: "inpay_link", invoice: "in_1", status: "paid",
      amount_paid: 2150, currency: "eur", payment: { type: "payment_intent", payment_intent: "pi_1" } };
    await apply(ctx, event(type, data, "evt_link", now + 3 * 86400_000));
    expect(job.failureCode).toBeUndefined();
    expect(job.attempts).toBe(0);
    expect(ctx.scheduler.runAfter).toHaveBeenCalledTimes(1);
    expect(rows.filter(entry => entry.kind === "welcome")).toHaveLength(1);
  });

  it("expanded charge refund stores the tagged cancellation amount separately from cumulative refunds", async () => {
    const { ctx, rows } = fixture("annual");
    await apply(ctx, event("invoice.paid", invoice()));
    const key = `refund:sub_1:${now}`;
    await apply(ctx, event("charge.refunded", { payment_intent: "pi_1", customer: "cus_1", currency: "eur",
      amount: 2150, amount_refunded: 1175, refunded: false, refunds: { data: [
        { id: "re_other", payment_intent: "pi_1", currency: "eur", status: "succeeded", amount: 100, metadata: {} },
        { id: "re_cancel", payment_intent: "pi_1", currency: "eur", status: "succeeded", amount: 1075,
          metadata: { cancellationKey: key } },
      ] } }, "evt_refunds"));
    expect(rows.find(entry => entry._id.startsWith("stripePaymentRefunds:"))).toMatchObject({
      amountRefunded: 1175, cancellationKey: key, cancellationAmountRefunded: 1075, fullyRefunded: false,
    });
  });

  it("standalone refund events require success and persist identical proof once", async () => {
    const { ctx, rows } = fixture("annual");
    await apply(ctx, event("invoice.paid", invoice()));
    const refund = { id: "re_cancel", payment_intent: "pi_1", currency: "eur", status: "pending", amount: 1075,
      metadata: { cancellationKey: `refund:sub_1:${now}` } };
    await apply(ctx, event("refund.created", refund, "evt_pending"));
    expect(rows.filter(entry => entry._id.startsWith("stripePaymentRefunds:"))).toHaveLength(0);
    await apply(ctx, event("refund.updated", { ...refund, status: "succeeded" }, "evt_succeeded"));
    await apply(ctx, event("refund.created", { ...refund, status: "succeeded" }, "evt_success_duplicate"));
    expect(rows.filter(entry => entry._id.startsWith("stripePaymentRefunds:")))
      .toMatchObject([{ cancellationKey: `refund:sub_1:${now}`, cancellationAmountRefunded: 1075 }]);
  });
});
