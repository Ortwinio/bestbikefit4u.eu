import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ subscription: vi.fn(), update: vi.fn(), cancel: vi.fn(),
  refund: vi.fn(), listRefunds: vi.fn(), payment: vi.fn(), invoice: vi.fn(), invoicePayments: vi.fn() }));
vi.mock("./serverStripe", () => ({ getServerStripe: () => ({ subscriptions: {
  retrieve: mocks.subscription, update: mocks.update, cancel: mocks.cancel,
}, refunds: { create: mocks.refund, list: mocks.listRefunds }, paymentIntents: { retrieve: mocks.payment },
invoices: { retrieve: mocks.invoice }, invoicePayments: { list: mocks.invoicePayments } }) }));
import { cancelOwnedSubscription, renewalRefundCents } from "./cancelSubscription";
const context = { userId: "owner", customerId: "cus_owner", subscriptionId: "sub_owned", paymentIntentId: "pi_owned",
  periodStart: 1000, periodEnd: 3000, periodPriceCents: 2150, renewed: true };
beforeEach(() => {
  vi.clearAllMocks();
  mocks.subscription.mockResolvedValue({ customer: "cus_owner", status: "active" });
  mocks.payment.mockResolvedValue({ customer: "cus_owner", status: "succeeded", currency: "eur", amount_received: 2150 });
  mocks.cancel.mockResolvedValue({ status: "canceled", canceled_at: 2, ended_at: 2 });
  mocks.listRefunds.mockResolvedValue({ data: [], has_more: false });
});
it("first year cancels at period end with no refund", async () => {
  await cancelOwnedSubscription({ ...context, renewed: false });
  expect(mocks.update).toHaveBeenCalledWith("sub_owned", { cancel_at_period_end: true }, expect.anything());
  expect(mocks.refund).not.toHaveBeenCalled();
  expect(mocks.cancel).not.toHaveBeenCalled();
});
it("cancels immediately and uses the provider's actual end timestamp for the refund", async () => {
  await cancelOwnedSubscription(context);
  expect(mocks.refund).toHaveBeenCalledWith(expect.objectContaining({ payment_intent: "pi_owned", amount: 1075 }),
    { idempotencyKey: "refund:sub_owned:1000" });
  expect(mocks.cancel).toHaveBeenCalledWith("sub_owned", { prorate: false }, { idempotencyKey: "cancel:sub_owned:1000" });
  expect(mocks.cancel.mock.invocationCallOrder[0]).toBeLessThan(mocks.refund.mock.invocationCallOrder[0]);
});
it("retries a failed refund after cancellation using the same confirmed timestamp", async () => {
  mocks.refund.mockRejectedValueOnce(new Error("PROVIDER_TEMPORARY_ERROR"));
  await expect(cancelOwnedSubscription(context)).rejects.toThrow("PROVIDER_TEMPORARY_ERROR");
  mocks.subscription.mockResolvedValue({ customer: "cus_owner", status: "canceled", canceled_at: 2, ended_at: 2 });
  await cancelOwnedSubscription(context);
  expect(mocks.cancel).toHaveBeenCalledTimes(1);
  expect(mocks.refund.mock.calls[0]).toEqual(mocks.refund.mock.calls[1]);
});
it("deduplicates successful refunds after the provider idempotency cache expires", async () => {
  mocks.subscription.mockResolvedValue({ customer: "cus_owner", status: "canceled", canceled_at: 2, ended_at: 2 });
  mocks.listRefunds.mockResolvedValue({ has_more: false, data: [{ amount: 1075, status: "succeeded",
    metadata: { cancellationKey: "refund:sub_owned:1000" } }] });
  await cancelOwnedSubscription(context);
  expect(mocks.refund).not.toHaveBeenCalled();
});
it("resolves unexpanded invoice payments from the owned exact subscription period", async () => {
  mocks.invoice.mockResolvedValue({ customer: "cus_owner", status: "paid", currency: "eur", amount_paid: 2150,
    parent: { subscription_details: { subscription: "sub_owned" } },
    lines: { data: [{ period: { start: 1, end: 3 } }] } });
  mocks.invoicePayments.mockResolvedValue({ has_more: false, data: [{ invoice: "in_owned", status: "paid",
    currency: "eur", amount_paid: 2150, payment: { type: "payment_intent", payment_intent: "pi_resolved" } }] });
  await cancelOwnedSubscription({ ...context, paymentIntentId: undefined, invoiceId: "in_owned" });
  expect(mocks.payment).toHaveBeenCalledWith("pi_resolved");
  expect(mocks.refund).toHaveBeenCalledWith(expect.objectContaining({ payment_intent: "pi_resolved" }), expect.anything());
});
it("rejects unrelated invoices before cancellation when resolving unexpanded payments", async () => {
  mocks.invoice.mockResolvedValue({ customer: "cus_attacker", status: "paid", currency: "eur", amount_paid: 2150,
    parent: { subscription_details: { subscription: "sub_owned" } },
    lines: { data: [{ period: { start: 1, end: 3 } }] } });
  await expect(cancelOwnedSubscription({ ...context, paymentIntentId: undefined, invoiceId: "in_wrong" }))
    .rejects.toThrow("INVOICE_MISMATCH");
  expect(mocks.cancel).not.toHaveBeenCalled();
});
it("does not use an earlier cancellation request or a caller's stale quote", async () => {
  mocks.cancel.mockResolvedValue({ status: "canceled", canceled_at: 1, ended_at: 3 });
  const result = await cancelOwnedSubscription({ ...context });
  expect(result.refundCents).toBe(0);
  expect(mocks.refund).not.toHaveBeenCalled();
});
it("rejects subscription or payment customer mismatches", async () => {
  mocks.subscription.mockResolvedValue({ customer: "cus_other" });
  await expect(cancelOwnedSubscription(context)).rejects.toThrow("SUBSCRIPTION_OWNER_MISMATCH");
  expect(mocks.refund).not.toHaveBeenCalled();
  mocks.subscription.mockResolvedValue({ customer: "cus_owner" });
  mocks.payment.mockResolvedValue({ customer: "cus_other", status: "succeeded", currency: "eur", amount_received: 2150 });
  await expect(cancelOwnedSubscription(context)).rejects.toThrow("PAYMENT_MISMATCH");
  expect(mocks.cancel).not.toHaveBeenCalled();
});
it("never refunds initial year, appointment amounts or an expired renewal", () => {
  expect(renewalRefundCents({ ...context, renewed: false }, 2000)).toBe(0);
  expect(renewalRefundCents({ ...context, periodPriceCents: 23450 }, 2000)).toBe(0);
  expect(renewalRefundCents(context, 4000)).toBe(0);
  expect(renewalRefundCents(context, 2000)).toBe(1075);
});
