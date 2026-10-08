import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import { beginTransition, continueTransition, expireEntitlements } from "./internal";
import { redeemTransitionOffer } from "./mutations";
import { getAccess, getSubscription, getTransitionOffer } from "./queries";
import { grantPurchasedAccess } from "./grants";
import { grantGiftEntitlement } from "./gifts";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
const { auth } = vi.hoisted(() => ({ auth: vi.fn() }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: auth }));
type Row = Record<string, unknown> & { _id: string; _creationTime: number };
type Handler = { _handler: (ctx: unknown, args: unknown) => Promise<unknown> };
const call = (handler: unknown, ctx: unknown, args = {}) => (handler as Handler)._handler(ctx, args);
const now = Date.UTC(2026, 9, 3);
const cutoff = now - 1000;
const row = (_id: string, data: object = {}): Row => ({ _id, _creationTime: cutoff - 1000, ...data });
function context(rows: Row[]) {
  const db = {
    get: async (id: string) => rows.find((entry) => entry._id === id) ?? null,
    insert: vi.fn(async (table: string, data: object) => {
      const id = `${table}:${rows.length}`;
      rows.push(row(id, { ...data, _creationTime: now }));
      return id;
    }),
    patch: vi.fn(async (id: string, patch: object) => Object.assign(rows.find((entry) => entry._id === id)!, patch)),
    query: (table: string) => {
      let selected = rows.filter((entry) => entry._id.startsWith(`${table}:`));
      const chain = {
        withIndex: (_name: string, callback: (query: unknown) => unknown) => {
          const index = {
            eq: (field: string, value: unknown) => { selected = selected.filter((entry) => entry[field] === value); return index; },
            gt: (field: string, value: number) => { selected = selected.filter((entry) => Number(entry[field]) > value); return index; },
            lte: (field: string, value: number) => { selected = selected.filter((entry) => Number(entry[field]) <= value); return index; },
          };
          callback(index); return chain;
        },
        filter: (callback: (query: { field: (name: string) => string; lt: (field: string, value: number) => (entry: Row) => boolean; and: (...conditions: Array<(entry: Row) => boolean>) => (entry: Row) => boolean }) => (entry: Row) => boolean) => {
          selected = selected.filter(callback({
            field: (name) => name,
            lt: (field, value) => (entry) => Number(entry[field]) < value,
            and: (...conditions) => (entry) => conditions.every((condition) => condition(entry)),
          }));
          return chain;
        },
        collect: async () => selected,
        unique: async () => selected[0] ?? null,
        first: async () => selected[0] ?? null,
        take: async (count: number) => selected.slice(0, count),
        paginate: async ({ cursor, numItems }: { cursor: string | null; numItems: number }) => {
          const offset = Number(cursor ?? 0);
          return { page: selected.slice(offset, offset + numItems), isDone: offset + numItems >= selected.length, continueCursor: String(offset + numItems) };
        },
      };
      return chain;
    },
  };
  return { db, scheduler: { runAfter: vi.fn() } };
}
beforeEach(() => { auth.mockResolvedValue("users:owner"); vi.spyOn(Date, "now").mockReturnValue(now); vi.stubEnv("PAID_ACCESS_ENFORCED", "true"); });
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

describe("transition offer status", () => {
  it("requires authentication and scopes absence to the current user", async () => {
    const ctx = context([row("pricingTransitionOffers:other", { userId: "users:other" })]);
    auth.mockResolvedValue(null);
    await expect(call(getTransitionOffer, ctx)).rejects.toThrow("Not authenticated");
    auth.mockResolvedValue("users:owner");
    expect(await call(getTransitionOffer, ctx)).toEqual({ status: "none" });
  });
  it.each([
    [now + 1, now + 1000, { status: "upcoming", goLiveAt: now + 1 }],
    [now, now + 1000, { status: "available", redeemBy: now + 1000 }],
    [cutoff, now, { status: "expired" }],
    [cutoff, now - 1, { status: "expired" }],
  ])("returns only the status contract for %s / %s", async (goLiveAt, redeemBy, expected) => {
    const ctx = context([row("pricingTransitionOffers:1", { userId: "users:owner", goLiveAt, redeemBy })]);
    expect(await call(getTransitionOffer, ctx)).toEqual(expected);
  });
  it("retains redemption history after the offer and measurement expire", async () => {
    const redeemedAt = Date.UTC(2026, 0, 31);
    const ctx = context([row("pricingTransitionOffers:1", { userId: "users:owner", goLiveAt: redeemedAt,
      redeemBy: cutoff, redeemedAt, bikeId: "bikes:1", entitlementId: "pricingEntitlements:1" })]);
    expect(await call(getTransitionOffer, ctx)).toEqual({ status: "redeemed", bikeId: "bikes:1", expiresAt: Date.UTC(2026, 3, 30) });
  });
});

describe("pricing ownership and redemption", () => {
  it("rejects missing offers, foreign bikes, and unauthenticated redemption without writes", async () => {
    const ctx = context([row("bikes:1", { userId: "users:owner" }), row("bikes:other", { userId: "users:other" })]);
    await expect(call(redeemTransitionOffer, ctx, { bikeId: "bikes:1" })).rejects.toThrow("TRANSITION_OFFER_NOT_FOUND");
    await expect(call(redeemTransitionOffer, ctx, { bikeId: "bikes:other" })).rejects.toThrow("Bike not found");
    auth.mockResolvedValue(null);
    await expect(call(redeemTransitionOffer, ctx, { bikeId: "bikes:1" })).rejects.toThrow("Not authenticated");
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
  it("rejects before go-live and redeems exactly at go-live with all flags OFF", async () => {
    for (const flag of ["PAID_ACCESS_ENFORCED", "NEXT_PUBLIC_PAID_ACCESS_ENFORCED", "STRIPE_BILLING_ENABLED", "NEXT_PUBLIC_STRIPE_BILLING_ENABLED"]) vi.stubEnv(flag, "false");
    const offer = row("pricingTransitionOffers:1", { userId: "users:owner", goLiveAt: now + 1, redeemBy: now + 1000 });
    const ctx = context([row("bikes:1", { userId: "users:owner" }), row("bikes:2", { userId: "users:owner" }), offer]);
    await expect(call(redeemTransitionOffer, ctx, { bikeId: "bikes:1" })).rejects.toThrow("TRANSITION_OFFER_UNAVAILABLE");
    expect(ctx.db.insert).not.toHaveBeenCalled();
    vi.mocked(Date.now).mockReturnValue(now + 1);
    expect(await call(getTransitionOffer, ctx)).toEqual({ status: "available", redeemBy: now + 1000 });
    const entitlementId = await call(redeemTransitionOffer, ctx, { bikeId: "bikes:1" });
    vi.mocked(Date.now).mockReturnValue(now + 2000);
    expect(await call(redeemTransitionOffer, ctx, { bikeId: "bikes:1" })).toBe(entitlementId);
    await expect(call(redeemTransitionOffer, ctx, { bikeId: "bikes:2" })).rejects.toThrow("TRANSITION_OFFER_ALREADY_REDEEMED");
    expect(await call(getTransitionOffer, ctx)).toEqual({ status: "redeemed", bikeId: "bikes:1", expiresAt: Date.UTC(2027, 0, 3) + 1 });
    expect(ctx.db.insert).toHaveBeenCalledTimes(1);
    expect(ctx.scheduler.runAfter).not.toHaveBeenCalled();
  });
  it("returns null logged out and rejects another owner's bike", async () => {
    const ctx = context([row("bikes:1", { userId: "users:other" })]);
    auth.mockResolvedValue(null);
    expect(await call(getAccess, ctx)).toBeNull();
    expect(await call(getSubscription, ctx)).toBeNull();
    auth.mockResolvedValue("users:owner");
    await expect(call(getAccess, ctx, { bikeId: "bikes:1" })).rejects.toThrow("Bike not found");
  });
  it("redeems an owned bike once with three calendar months", async () => {
    const rows = [row("bikes:1", { userId: "users:owner" }), row("pricingTransitionOffers:1", { userId: "users:owner", goLiveAt: cutoff, redeemBy: now + 1000 })];
    const ctx = context(rows);
    const id = await call(redeemTransitionOffer, ctx, { bikeId: "bikes:1" });
    expect(await call(redeemTransitionOffer, ctx, { bikeId: "bikes:1" })).toBe(id);
    expect(ctx.db.insert).toHaveBeenCalledTimes(1);
    expect(rows.find((entry) => entry._id === id)).toMatchObject({ productId: "single", source: "transition",
      expiresAt: Date.UTC(2027, 0, 3), periodPriceCents: 0, renewed: false, cancelled: false });
    expect(await call(getAccess, ctx, { bikeId: "bikes:1" })).toMatchObject({ fullReport: true });
  });
  it("rejects expired offers and changing the redemption bike", async () => {
    const offer = row("pricingTransitionOffers:1", { userId: "users:owner", goLiveAt: cutoff, redeemBy: now });
    const ctx = context([row("bikes:1", { userId: "users:owner" }), offer]);
    await expect(call(redeemTransitionOffer, ctx, { bikeId: "bikes:1" })).rejects.toThrow("UNAVAILABLE");
    Object.assign(offer, { redeemedAt: now, bikeId: "bikes:other" });
    await expect(call(redeemTransitionOffer, ctx, { bikeId: "bikes:1" })).rejects.toThrow("ALREADY_REDEEMED");
  });
  it("does not expose another user's entitlements and rejects orphan single rights", async () => {
    const ctx = context([row("pricingEntitlements:1", { userId: "users:other" }), row("pricingEntitlements:2", {
      userId: "users:owner", productId: "single", bikeId: "bikes:missing", status: "active", source: "purchase", startsAt: now - 1, expiresAt: now + 1,
    })]);
    expect(await call(getAccess, ctx)).toMatchObject({ fullProfile: false, eligibleForUpgrade: true });
    expect(await call(getSubscription, ctx)).toMatchObject({ entitlements: [expect.objectContaining({ userId: "users:owner" })] });
  });
  it("expires at most 200 rows, and read-time checks cover the remainder", async () => {
    const rows = Array.from({ length: 201 }, (_, index) => row(`pricingEntitlements:${index}`, { status: "active", expiresAt: now }));
    const ctx = context(rows);
    expect(await call(expireEntitlements, ctx)).toEqual({ expired: 200, mayHaveMore: true });
    expect(ctx.scheduler.runAfter).toHaveBeenCalledOnce();
    expect(rows.filter((entry) => entry.status === "active")).toHaveLength(1);
    expect(await call(expireEntitlements, ctx)).toEqual({ expired: 1, mayHaveMore: false });
    expect(await call(expireEntitlements, ctx)).toEqual({ expired: 0, mayHaveMore: false });
    expect(ctx.scheduler.runAfter).toHaveBeenCalledOnce();
  });
  it("expiry retains future, already expired and revoked grants", async () => {
    const rows = [row("pricingEntitlements:future", { status: "active", expiresAt: now + 1 }),
      row("pricingEntitlements:expired", { status: "expired", expiresAt: now - 1 }),
      row("pricingEntitlements:revoked", { status: "revoked", expiresAt: now - 1 })];
    const ctx = context(rows);
    expect(await call(expireEntitlements, ctx)).toEqual({ expired: 0, mayHaveMore: false });
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
});

describe("admin dry-run-first transition", () => {
  const fixtures = () => [row("users:owner", { adminRole: "billing_admin" }), row("users:rider"),
    row("recommendations:old", { userId: "users:rider", createdAt: cutoff - 1 }),
    row("recommendations:new", { userId: "users:rider", createdAt: now }),
    row("plans:pro", { tier: "pro" }), row("subscriptions:1", { userId: "users:rider", planId: "plans:pro", status: "active", currentPeriodEnd: now + 9999 })];
  it("requires actual billing admin and completed matching evidence", async () => {
    await expect(call(beginTransition, context([row("users:owner")]), { goLiveAt: cutoff })).rejects.toThrow("Not authorized");
    await expect(call(beginTransition, context(fixtures()), { goLiveAt: cutoff, dryRun: false })).rejects.toThrow("COMPLETED_DRY_RUN_REQUIRED");
  });
  it("rejects future writes without evidence, incomplete or foreign dry-run evidence", async () => {
    const rows = fixtures(); const ctx = context(rows);
    expect(await call(beginTransition, ctx, { goLiveAt: now + 1000 })).toBeTypeOf("string");
    await expect(call(beginTransition, ctx, { goLiveAt: now + 1000, dryRun: false })).rejects.toThrow("COMPLETED_DRY_RUN_REQUIRED");
    const runId = await call(beginTransition, ctx, { goLiveAt: cutoff });
    await expect(call(beginTransition, ctx, { goLiveAt: cutoff, dryRun: false, dryRunId: runId })).rejects.toThrow("COMPLETED_DRY_RUN_REQUIRED");
    await call(continueTransition, ctx, { runId }); await call(continueTransition, ctx, { runId });
    await expect(call(beginTransition, ctx, { goLiveAt: cutoff - 1, dryRun: false, dryRunId: runId })).rejects.toThrow("COMPLETED_DRY_RUN_REQUIRED");
    rows.push(row("users:other", { adminRole: "super_admin" })); auth.mockResolvedValue("users:other");
    await expect(call(beginTransition, ctx, { goLiveAt: cutoff, dryRun: false, dryRunId: runId })).rejects.toThrow("COMPLETED_DRY_RUN_REQUIRED");
    await expect(call(continueTransition, ctx, { runId })).rejects.toThrow("TRANSITION_NOT_FOUND");
  });
  it("persists bounded report cursors across calls", async () => {
    const rows = fixtures();
    for (let index = 0; index < 51; index += 1) rows.push(row(`recommendations:extra${index}`, { userId: "users:rider", createdAt: cutoff - 1 }));
    const ctx = context(rows); const runId = await call(beginTransition, ctx, { goLiveAt: cutoff });
    expect(await call(continueTransition, ctx, { runId })).toMatchObject({ phase: "reports", cursor: "50" });
    expect(await call(continueTransition, ctx, { runId })).toMatchObject({ phase: "users", reportCount: 52 });
    expect(await call(continueTransition, ctx, { runId })).toMatchObject({ phase: "complete", offerCount: 1 });
  });
  it("precreates offers 14 days ahead without migrating access, including runs crossing go-live", async () => {
    const goLiveAt = now + 14 * 24 * 60 * 60 * 1000;
    const rows = fixtures();
    Object.assign(rows.find((entry) => entry._id === "subscriptions:1")!, { currentPeriodEnd: goLiveAt + 9999 });
    const ctx = context(rows);
    const dryRunId = await call(beginTransition, ctx, { goLiveAt });
    await call(continueTransition, ctx, { runId: dryRunId });
    await call(continueTransition, ctx, { runId: dryRunId });
    expect(rows.some((entry) => entry._id.startsWith("pricingTransitionOffers:"))).toBe(false);
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const runId = await call(beginTransition, ctx, { goLiveAt, dryRun: false, dryRunId });
      if (attempt === 1) vi.mocked(Date.now).mockReturnValue(goLiveAt);
      await call(continueTransition, ctx, { runId });
      await call(continueTransition, ctx, { runId });
      expect(await call(continueTransition, ctx, { runId })).toMatchObject({ phase: "complete" });
      expect(rows.some((entry) => entry.legacyFullAccess)).toBe(false);
      expect(rows.some((entry) => entry._id.startsWith("pricingEntitlements:"))).toBe(false);
    }
    expect(rows.filter((entry) => entry._id.startsWith("pricingTransitionOffers:"))).toEqual([
      expect.objectContaining({ userId: "users:rider", goLiveAt, redeemBy: Date.UTC(2026, 11, 17) }),
    ]);
    rows.push(row("users:late", { _creationTime: goLiveAt - 1 }),
      row("recommendations:late", { userId: "users:late", _creationTime: goLiveAt - 1, createdAt: goLiveAt - 1 }),
      row("users:post", { _creationTime: goLiveAt }),
      row("recommendations:post", { userId: "users:post", _creationTime: goLiveAt, createdAt: goLiveAt }));
    const launchPreview = await call(beginTransition, ctx, { goLiveAt });
    await call(continueTransition, ctx, { runId: launchPreview });
    await call(continueTransition, ctx, { runId: launchPreview });
    const launchRun = await call(beginTransition, ctx, { goLiveAt, dryRun: false, dryRunId: launchPreview });
    await call(continueTransition, ctx, { runId: launchRun });
    await call(continueTransition, ctx, { runId: launchRun });
    expect(rows.find((entry) => entry._id === "recommendations:old")?.legacyFullAccess).toBe(true);
    expect(rows.find((entry) => entry._id === "recommendations:late")?.legacyFullAccess).toBe(true);
    expect(rows.find((entry) => entry._id === "recommendations:post")?.legacyFullAccess).toBeUndefined();
    expect(rows.filter((entry) => entry._id.startsWith("pricingTransitionOffers:"))).toHaveLength(2);
    expect(rows.filter((entry) => entry._id.startsWith("pricingEntitlements:"))).toEqual([
      expect.objectContaining({ source: "legacy_pro", startsAt: goLiveAt, expiresAt: goLiveAt + 9999 }),
    ]);
  });
  it.each([{ status: "canceled" }, { cancelAtPeriodEnd: true }])("maps real legacy cancellation metadata %j", async (patch) => {
    const rows = fixtures(); Object.assign(rows.find((entry) => entry._id === "subscriptions:1")!, patch);
    const ctx = context(rows); const runId = await call(beginTransition, ctx, { goLiveAt: cutoff });
    await call(continueTransition, ctx, { runId }); await call(continueTransition, ctx, { runId });
    const writeId = await call(beginTransition, ctx, { goLiveAt: cutoff, dryRun: false, dryRunId: runId });
    await call(continueTransition, ctx, { runId: writeId }); await call(continueTransition, ctx, { runId: writeId });
    const migrated = rows.find((entry) => entry._id.startsWith("pricingEntitlements:"))!;
    expect(migrated.cancelled).toBe(true);
    expect(migrated.periodPriceCents).toBeUndefined();
    expect(migrated.renewed).toBeUndefined();
  });
  it("dry-run writes only audit evidence; execution preserves old reports and maps real period once", async () => {
    const rows = fixtures(); const ctx = context(rows);
    const runId = await call(beginTransition, ctx, { goLiveAt: cutoff });
    await call(continueTransition, ctx, { runId }); await call(continueTransition, ctx, { runId });
    expect(rows.find((entry) => entry._id === runId)).toMatchObject({ dryRun: true, phase: "complete", reportCount: 1, offerCount: 1, legacyProCount: 1 });
    expect(rows.some((entry) => entry.legacyFullAccess)).toBe(false);
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const writeId = await call(beginTransition, ctx, { goLiveAt: cutoff, dryRun: false, dryRunId: runId });
      await call(continueTransition, ctx, { runId: writeId }); await call(continueTransition, ctx, { runId: writeId });
    }
    expect(rows.find((entry) => entry._id === "recommendations:old")?.legacyFullAccess).toBe(true);
    expect(rows.find((entry) => entry._id === "recommendations:new")?.legacyFullAccess).toBeUndefined();
    expect(rows.filter((entry) => entry._id.startsWith("pricingTransitionOffers:"))).toHaveLength(1);
    const migrated = rows.filter((entry) => entry._id.startsWith("pricingEntitlements:"));
    expect(migrated).toEqual([expect.objectContaining({ expiresAt: now + 9999, productId: "annual", appointmentGranted: false, cancelled: false })]);
    expect(migrated[0].periodPriceCents).toBeUndefined();
    expect(migrated[0].renewed).toBeUndefined();
  });
});

describe("internal-only purchase grant helper", () => {
  const grantArgs = { userId: "users:owner" as Id<"users">, productId: "annual_personal" as const, grantKey: "purchase:1", startsAt: now };
  it("is idempotent and renewal never adds an appointment", async () => {
    const rows = [row("users:owner")]; const ctx = context(rows) as unknown as MutationCtx;
    const id = await grantPurchasedAccess(ctx, grantArgs);
    expect(await grantPurchasedAccess(ctx, grantArgs)).toBe(id);
    await grantPurchasedAccess(ctx, { ...grantArgs, renewal: true, grantKey: "purchase:renewal" });
    expect(rows.filter((entry) => entry.appointmentGranted)).toHaveLength(1);
    expect(rows.find((entry) => entry._id === id)).toMatchObject({ periodPriceCents: 23450, renewed: false, cancelled: false });
    expect(rows.at(-1)).toMatchObject({ productId: "annual", appointmentGranted: false, periodPriceCents: 2150, renewed: true, cancelled: false });
    expect(ctx.scheduler.runAfter).toHaveBeenCalledTimes(1);
    const schedule = vi.mocked(ctx.scheduler.runAfter).mock.calls[0];
    expect(getFunctionName(schedule[1])).toBe("pricingAppointments/internal:queueFitterNotification");
    expect(schedule[2]).toEqual({ entitlementId: id });
  });
  it("validates entry eligibility and bike ownership", async () => {
    const ctx = context([row("users:owner")]) as unknown as MutationCtx;
    await expect(grantPurchasedAccess(ctx, { ...grantArgs, productId: "annual_upgrade" })).rejects.toThrow("UPGRADE_NOT_ELIGIBLE");
    await expect(grantPurchasedAccess(ctx, { ...grantArgs, productId: "single", bikeId: "bikes:foreign" as Id<"bikes"> })).rejects.toThrow("Bike not found");
  });
  it("grants a new appointment for each explicit personal purchase, not its renewal", async () => {
    const rows = [row("users:owner")]; const ctx = context(rows) as unknown as MutationCtx;
    const firstId = await grantPurchasedAccess(ctx, grantArgs);
    Object.assign(rows.find((entry) => entry._id === firstId)!, { appointmentUsedAt: now });
    const secondId = await grantPurchasedAccess(ctx, { ...grantArgs, grantKey: "purchase:2" });
    expect(rows.find((entry) => entry._id === secondId)).toMatchObject({ appointmentGranted: true });
    expect(rows.find((entry) => entry._id === secondId)?.appointmentUsedAt).toBeUndefined();
    expect(await grantPurchasedAccess(ctx, { ...grantArgs, grantKey: "purchase:2" })).toBe(secondId);
    await grantPurchasedAccess(ctx, { ...grantArgs, grantKey: "renewal:2", renewal: true });
    expect(rows.at(-1)).toMatchObject({ productId: "annual", appointmentGranted: false });
    expect(rows.filter((entry) => entry.appointmentGranted)).toHaveLength(2);
  });
  it("preserves entry eligibility after deleting the single's bike, but not refund", async () => {
    const prior = row("pricingEntitlements:single", { userId: "users:owner", productId: "single",
      status: "revoked", source: "purchase", revokedReason: "bike_deleted", startsAt: now - 1 });
    const ctx = context([row("users:owner"), prior]) as unknown as MutationCtx;
    await expect(grantPurchasedAccess(ctx, { ...grantArgs, productId: "annual_upgrade" })).resolves.toBeTypeOf("string");
    prior.revokedReason = "refunded";
    await expect(grantPurchasedAccess(ctx, { ...grantArgs, productId: "annual_upgrade", grantKey: "different" })).rejects.toThrow("UPGRADE_NOT_ELIGIBLE");
  });
});


describe("Stripe period grants and gift redemption", () => {
  const userId = "users:owner" as Id<"users">;
  const bikeId = "bikes:1" as Id<"bikes">;
  it("uses the verified Stripe period and keeps payment references", async () => {
    const rows = [row(userId)];
    await grantPurchasedAccess(context(rows) as unknown as MutationCtx, {
      userId, productId: "annual", grantKey: "invoice:paid", startsAt: now,
      periodEnd: now + 1234, subscriptionId: "sub_test", paymentIntentId: "pi_test", customerId: "cus_test",
    });
    expect(rows.at(-1)).toMatchObject({ expiresAt: now + 1234, subscriptionId: "sub_test", periodPriceCents: 2150 });
  });
  it("standalone is an appointment, not a subscription, and cron does not expire its zero sentinel", async () => {
    const rows = [row(userId), row("pricingEntitlements:single", {
      userId, productId: "single", source: "purchase", startsAt: now - 1, status: "expired",
    })];
    const ctx = context(rows) as unknown as MutationCtx;
    const args = { userId, productId: "personal_fit_standalone" as const, grantKey: "payment:1", startsAt: now };
    await grantPurchasedAccess(ctx, args);
    expect(rows.at(-1)).toMatchObject({ expiresAt: 0, appointmentGranted: true, periodPriceCents: 20950 });
    expect(await call(expireEntitlements, ctx)).toMatchObject({ expired: 0 });
    await expect(grantPurchasedAccess(ctx, { ...args, renewal: true })).rejects.toThrow("PRODUCT_NOT_RECURRING");
  });
  it("gift redemption is atomic and idempotent for the same owner and bike", async () => {
    const rows = [row(userId), row(bikeId, { userId })];
    const ctx = context(rows) as unknown as MutationCtx;
    const args = { userId, bikeId, giftId: "gift1", redeemedAt: now };
    const id = await grantGiftEntitlement(ctx, args);
    expect(await grantGiftEntitlement(ctx, args)).toBe(id);
    expect(rows.at(-1)).toMatchObject({ source: "gift", grantKey: "gift:gift1", expiresAt: Date.UTC(2027, 0, 3) });
    await expect(grantGiftEntitlement(ctx, { ...args, userId: "users:other" as Id<"users"> })).rejects.toThrow("Bike not found");
    await expect(grantGiftEntitlement(ctx, { ...args, redeemedAt: now + 1 })).rejects.toThrow("GRANT_KEY_CONFLICT");
  });
});


describe("delayed verified payment grant", () => {
  it("uses reserved eligibility time while preserving the paid period start", async () => {
    const userId = "users:owner" as Id<"users">;
    const purchasedAt = Date.UTC(2026, 0, 3);
    const eligibilityAt = Date.UTC(2026, 6, 2);
    const rows = [row(userId), row("pricingEntitlements:single", {
      userId, productId: "single", source: "purchase", status: "expired", startsAt: purchasedAt,
    })];
    const ctx = context(rows) as unknown as MutationCtx;
    const args = { userId, productId: "annual_upgrade" as const, startsAt: now, grantKey: "invoice:delayed" };
    await expect(grantPurchasedAccess(ctx, args)).rejects.toThrow("UPGRADE_NOT_ELIGIBLE");
    const id = await grantPurchasedAccess(ctx, { ...args, eligibilityAt });
    expect(rows.find((entry) => entry._id === id)).toMatchObject({ startsAt: now, periodPriceCents: 950 });
    expect(await grantPurchasedAccess(ctx, { ...args, eligibilityAt, paymentIntentId: "pi_late" })).toBe(id);
    expect(rows.find((entry) => entry._id === id)).toMatchObject({ paymentIntentId: "pi_late" });
    await expect(grantPurchasedAccess(ctx, { ...args, eligibilityAt, paymentIntentId: "pi_other" }))
      .rejects.toThrow("GRANT_KEY_CONFLICT");
  });
});


describe("Stripe second-precision checkout timestamps", () => {
  it("accepts a reservation within the same second but rejects truly future eligibility", async () => {
    const userId = "users:owner" as Id<"users">;
    const bikeId = "bikes:precision" as Id<"bikes">;
    const rows = [row(userId), row(bikeId, { userId })];
    const ctx = context(rows) as unknown as MutationCtx;
    const args = { userId, bikeId, productId: "single" as const, startsAt: now, grantKey: "precision" };
    await expect(grantPurchasedAccess(ctx, { ...args, eligibilityAt: now + 721 })).resolves.toBeTypeOf("string");
    await expect(grantPurchasedAccess(ctx, { ...args, grantKey: "future", eligibilityAt: now + 1000 }))
      .rejects.toThrow("INVALID_ELIGIBILITY_TIME");
  });
});
