import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import type { MutationCtx } from "../_generated/server";
import { fixture, row, now } from "../stripe/__tests__/fixture";
import { queueBillingEmail, wakeBillingEmailEvidence, type BillingEmailKind } from "./billingQueue";
import { claim, finish, freezePayload } from "./billingData";
import { sendBillingEmail } from "./billing";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("resend", () => ({ Resend: class { emails = { send }; } }));
type Handler = (ctx: unknown, args: Record<string, unknown>) => Promise<unknown>;
const handler = (fn: unknown) => (fn as { _handler: Handler })._handler;
const DAY = 86400000;

function setup(kind: BillingEmailKind = "purchase", productId = "single") {
  const { ctx, rows } = fixture(productId);
  Object.assign(rows[0], { locale: "en", emailPreferences: { service: true, marketing: false } });
  const entitlement = row("pricingEntitlements:paid", { userId: rows[0]._id, productId, status: "active", startsAt: now - DAY, expiresAt: now + 20 * DAY, grantKey: "grant", paymentIntentId: "pi_paid", periodPriceCents: 1350, subscriptionId: "sub_paid" });
  rows.push(entitlement);
  const job = row("billingEmailJobs:job", { userId: rows[0]._id, kind, sendKey: "key", entitlementId: entitlement._id, status: "pending", attempts: 0, createdAt: now });
  rows.push(job);
  const actionCtx = { runMutation: vi.fn(async (ref, args) => handler(getFunctionName(ref).endsWith(":claim") ? claim : getFunctionName(ref).endsWith(":freezePayload") ? freezePayload : finish)(ctx, args)) };
  return { ctx, rows, job, entitlement, actionCtx, run: () => handler(sendBillingEmail)(actionCtx, { jobId: job._id }) };
}

beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(now);
  vi.stubEnv("AUTH_RESEND_KEY", "test-only");
  vi.stubEnv("STRIPE_BILLING_ENABLED", "true");
  vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "true");
  vi.stubEnv("PERSONAL_BIKEFIT_AGENDA_URL", "https://example.test/agenda");
  send.mockReset().mockResolvedValue({ data: { id: "mail" }, error: null });
});
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });

describe("billing mail delivery", () => {
  it.each((["purchase", "welcome", "cancellation", "renewal", "expired", "transition_announcement", "transition_reminder"] as const).flatMap(kind => (["nl", "en"] as const).map(locale => ({ kind, locale }))))("delivers $kind once in $locale", async ({ kind, locale }) => {
    const state = setup(kind, kind === "purchase" ? "single" : "annual");
    state.rows[0].locale = locale;
    if (kind === "cancellation") state.entitlement.cancelled = true;
    if (kind === "expired") state.entitlement.expiresAt = now - 1;
    if (kind.startsWith("transition")) {
      state.job.launchAt = now + DAY;
      state.job.transitionOfferId = "pricingTransitionOffers:offer";
      state.rows.push(row("pricingTransitionOffers:offer", { userId: state.job.userId, goLiveAt: now + DAY, redeemBy: now + 6 * DAY }));
    }
    await state.run(); await state.run();
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0].html).toContain(`lang="${locale}"`);
    if (kind === "transition_reminder") {
      expect(send.mock.calls[0][0].html).toContain(`/${locale}/dashboard#transition-offer`);
      expect(send.mock.calls[0][0].text).toContain(`/${locale}/dashboard#transition-offer`);
      expect(send.mock.calls[0][0].text).not.toContain(`/${locale}/fit`);
    }
    expect(send.mock.calls[0][1]).toEqual({ idempotencyKey: "billing/billingEmailJobs:job" });
    expect(state.job.status).toBe("sent");
  });
  it("deduplicates persisted queue entries", async () => {
    const state = setup();
    const args = { kind: "purchase" as const, userId: state.job.userId, sendKey: "new-key" } as Parameters<typeof queueBillingEmail>[1];
    expect(await queueBillingEmail(state.ctx as unknown as MutationCtx, args)).toBe(true);
    expect(await queueBillingEmail(state.ctx as unknown as MutationCtx, args)).toBe(false);
    expect(state.ctx.scheduler.runAfter).toHaveBeenCalledTimes(1);
  });
  it.each(["annual", "annual_upgrade", "annual_personal"])("rejects purchase confirmation for %s", async productId => {
    const state = setup("purchase", productId); await state.run();
    expect(send).not.toHaveBeenCalled(); expect(state.job.status).toBe("failed"); expect(state.job.failureCode).toBe("invalid_product");
  });
  it.each(["single", "personal_fit_standalone"])("rejects subscription welcome for %s", async productId => {
    const state = setup("welcome", productId); await state.run();
    expect(send).not.toHaveBeenCalled(); expect(state.job.status).toBe("failed");
  });
  it("an active claim prevents a competing sender", async () => {
    const state = setup();
    await handler(claim)(state.ctx, { jobId: state.job._id });
    await state.run();
    expect(send).not.toHaveBeenCalled();
  });
  it("uses current NL locale and service opt out", async () => {
    const state = setup(); state.rows[0].locale = "nl";
    await state.run(); expect(send.mock.calls[0][0].html).toContain('lang="nl"');
    const optedOut = setup(); optedOut.rows[0].emailPreferences = { service: false, marketing: true };
    await optedOut.run(); expect(send).toHaveBeenCalledTimes(1);
    expect(optedOut.job.status).toBe("cancelled");
  });
  it("cancels fully refunded purchases before sending", async () => {
    const state = setup(); state.rows.push(row("stripePaymentRefunds:refund", { paymentIntentId: "pi_paid", fullyRefunded: true, amountRefunded: 1350 }));
    await state.run(); expect(send).not.toHaveBeenCalled(); expect(state.job.status).toBe("cancelled");
  });
  it("waits for delayed invoice payment linkage and checks its refund", async () => {
    const state = setup("welcome", "annual"); delete state.entitlement.paymentIntentId;
    state.rows.push(row("stripeBillingPeriods:period", { grantKey: "grant", invoiceId: "invoice" }));
    await state.run(); expect(send).not.toHaveBeenCalled(); expect(state.job.status).toBe("pending");
    expect(state.job.attempts).toBe(0);
    state.rows.push(row("stripeInvoicePaymentLinks:link", { invoiceId: "invoice", paymentIntentId: "pi_late" }));
    state.rows.push(row("stripePaymentRefunds:refund", { paymentIntentId: "pi_late", fullyRefunded: true }));
    vi.advanceTimersByTime(2 * DAY);
    await wakeBillingEmailEvidence(state.ctx as unknown as MutationCtx, state.job.userId as Parameters<typeof wakeBillingEmailEvidence>[1]);
    await state.run(); expect(send).not.toHaveBeenCalled(); expect(state.job.status).toBe("cancelled");
  });
  it("delivers after payment evidence arrives beyond the delivery retry window", async () => {
    const state = setup("welcome", "annual"); delete state.entitlement.paymentIntentId;
    state.rows.push(row("stripeBillingPeriods:period", { grantKey: "grant", invoiceId: "invoice" }));
    await state.run(); vi.advanceTimersByTime(3 * DAY);
    state.rows.push(row("stripeInvoicePaymentLinks:link", { invoiceId: "invoice", paymentIntentId: "pi_late" }));
    await wakeBillingEmailEvidence(state.ctx as unknown as MutationCtx, state.job.userId as Parameters<typeof wakeBillingEmailEvidence>[1]);
    await state.run(); expect(send).toHaveBeenCalledTimes(1); expect(state.job.attempts).toBe(1);
  });
  it("suppresses expiry if replacement annual access was granted", async () => {
    const state = setup("expired"); state.entitlement.expiresAt = now - 1;
    state.rows.push(row("pricingEntitlements:replacement", { userId: state.job.userId, productId: "annual", status: "active", startsAt: now, expiresAt: now + DAY }));
    await state.run(); expect(send).not.toHaveBeenCalled(); expect(state.job.status).toBe("cancelled");
  });
  it("waits for immediate cancellation refund evidence then includes it", async () => {
    const state = setup("cancellation", "annual"); Object.assign(state.entitlement, { cancelled: true, renewed: true, expiresAt: now });
    state.rows.push(row("stripeBillingPeriods:period", { grantKey: "grant", subscriptionId: "sub_paid", periodStart: now - DAY, periodEnd: now + DAY, periodPriceCents: 2000 }));
    await state.run(); expect(send).not.toHaveBeenCalled();
    state.rows.push(row("stripePaymentRefunds:refund", { paymentIntentId: "pi_paid", fullyRefunded: true, amountRefunded: 1000, cancellationKey: `refund:sub_paid:${now - DAY}`, cancellationAmountRefunded: 1000 }));
    vi.advanceTimersByTime(3 * 60 * 1000); await state.run();
    expect(send.mock.calls[0][0].text).toContain("€10");
  });
  it("does not mistake an unrelated partial refund for cancellation evidence", async () => {
    const state = setup("cancellation", "annual"); Object.assign(state.entitlement, { cancelled: true, renewed: true, expiresAt: now });
    state.rows.push(row("stripeBillingPeriods:period", { grantKey: "grant", subscriptionId: "sub_paid", periodStart: now - DAY, periodEnd: now + DAY, periodPriceCents: 2000 }));
    state.rows.push(row("stripePaymentRefunds:refund", { paymentIntentId: "pi_paid", fullyRefunded: false, amountRefunded: 1500 }));
    await state.run(); expect(send).not.toHaveBeenCalled(); expect(state.job.attempts).toBe(0);
  });
  it("sends cancellation without waiting when pro-rata refund rounds to zero", async () => {
    const state = setup("cancellation", "annual"); Object.assign(state.entitlement, { cancelled: true, renewed: true, expiresAt: now });
    state.rows.push(row("stripeBillingPeriods:period", { grantKey: "grant", subscriptionId: "sub_paid", periodStart: now - 365 * DAY, periodEnd: now + 1000, periodPriceCents: 2150 }));
    await state.run(); expect(send).toHaveBeenCalledTimes(1); expect(send.mock.calls[0][0].text).not.toContain("Pro-rata refund");
  });
  it.each(["annual_personal", "personal_fit_standalone"])("includes agenda for %s", async productId => {
    const state = setup(productId === "annual_personal" ? "welcome" : "purchase", productId);
    await state.run(); expect(send.mock.calls[0][0].text).toContain("https://example.test/agenda");
  });
  it("never sends an appointment placeholder when agenda configuration is missing", async () => {
    vi.stubEnv("PERSONAL_BIKEFIT_AGENDA_URL", "");
    const state = setup("welcome", "annual_personal"); await state.run();
    expect(send).not.toHaveBeenCalled(); expect(state.job.status).toBe("pending");
  });
  it("fails closed without configuration and bounds retries", async () => {
    const state = setup(); vi.stubEnv("AUTH_RESEND_KEY", "");
    for (let attempt = 0; attempt < 7; attempt++) { await state.run(); vi.advanceTimersByTime(61 * 60 * 1000); }
    expect(send).not.toHaveBeenCalled(); expect(state.job.status).toBe("failed"); expect(state.job.attempts).toBe(6);
  });
  it("retries provider failures with the same key", async () => {
    const state = setup(); send.mockResolvedValueOnce({ error: { message: "sensitive provider response" }, data: null });
    await state.run(); state.rows[0].locale = "nl"; vi.advanceTimersByTime(3 * 60 * 1000); await state.run();
    expect(send).toHaveBeenCalledTimes(2); expect(send.mock.calls[0][1]).toEqual(send.mock.calls[1][1]); expect(state.job.status).toBe("sent");
    expect(send.mock.calls[0][0]).toEqual(send.mock.calls[1][0]); expect(state.job.deliveryPayload).toBeUndefined();
  });
  it("allows only proved prelaunch announcements while billing is disabled", async () => {
    vi.stubEnv("STRIPE_BILLING_ENABLED", "false");
    const purchase = setup(); await purchase.run(); expect(send).not.toHaveBeenCalled();
    const state = setup("transition_announcement"); state.job.launchAt = now + DAY;
    await state.run(); expect(send).not.toHaveBeenCalled();
    state.job.transitionRunId = "billingTransitionRuns:apply";
    state.rows.push(row("billingTransitionRuns:apply", { kind: state.job.kind, launchAt: state.job.launchAt, dryRun: false, adminUserId: "users:admin", dryRunId: "billingTransitionRuns:dry" }));
    state.rows.push(row("billingTransitionRuns:dry", { kind: state.job.kind, launchAt: state.job.launchAt, dryRun: true, adminUserId: "users:admin", complete: true, completedAt: now - 1, appliedRunId: "billingTransitionRuns:apply" }));
    await state.run(); expect(send).toHaveBeenCalledTimes(1);
  });
});
