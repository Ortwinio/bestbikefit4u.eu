import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { runDaily } from "./billingBatches";
import { begin, continueBatch, TRANSITION_DRY_RUN_MAX_AGE_MS } from "./transitionBatches";

const { queue, authorize } = vi.hoisted(() => ({ queue: vi.fn(), authorize: vi.fn() }));
vi.mock("./billingQueue", () => ({ queueBillingEmail: queue }));
vi.mock("../admin/authz", () => ({ requireAdminRole: authorize }));

const daily = (runDaily as unknown as { _handler: (ctx: MutationCtx, args: { cursor?: string; asOf?: number }) => Promise<unknown> })._handler;
type BeginArgs = { kind: "transition_announcement" | "transition_reminder"; launchAt: number; dryRun?: boolean; dryRunId?: Id<"billingTransitionRuns"> };
const start = (begin as unknown as { _handler: (ctx: MutationCtx, args: BeginArgs) => Promise<{ runId: Id<"billingTransitionRuns"> }> })._handler;
const advance = (continueBatch as unknown as { _handler: (ctx: MutationCtx, args: { runId: Id<"billingTransitionRuns"> }) => Promise<{ complete: boolean; eligible: number; queued: number; scanned: number }> })._handler;
type Row = Record<string, unknown>;
type Expression = (row: Row) => unknown;
const resolve = (value: unknown, row: Row) => typeof value === "function" ? (value as Expression)(row) : value;
const expression = {
  field: (name: string): Expression => row => row[name],
  eq: (left: unknown, right: unknown): Expression => row => resolve(left, row) === resolve(right, row),
  neq: (left: unknown, right: unknown): Expression => row => resolve(left, row) !== resolve(right, row),
  gt: (left: unknown, right: unknown): Expression => row => Number(resolve(left, row)) > Number(resolve(right, row)),
  lte: (left: unknown, right: unknown): Expression => row => Number(resolve(left, row)) <= Number(resolve(right, row)),
  and: (...items: Expression[]): Expression => row => items.every(item => item(row)),
  or: (...items: Expression[]): Expression => row => items.some(item => item(row)),
};
function context(seed: Record<string, Row[]> = {}) {
  const tables = { billingTransitionRuns: [], ...seed } as Record<string, Row[]>;
  const find = (id: string) => Object.values(tables).flat().find(row => row._id === id) ?? null;
  const db = {
    get: vi.fn(async (id: string) => find(id)),
    insert: vi.fn(async (table: string, value: Row) => {
      const rows = tables[table] ??= [];
      const id = `${table}_${rows.length}`;
      rows.push({ ...value, _id: id });
      return id;
    }),
    patch: vi.fn(async (id: string, value: Row) => Object.assign(find(id)!, value)),
    query: vi.fn((table: string) => {
      let rows = tables[table] ?? [];
      const builder = {
        withIndex: (_name: string, callback: (index: { eq: (field: string, value: unknown) => void }) => void) => {
          callback({ eq: (field, value) => { rows = rows.filter(row => row[field] === value); } });
          return builder;
        },
        filter: (callback: (operators: typeof expression) => Expression) => {
          rows = rows.filter(row => callback(expression)(row));
          return builder;
        },
        first: async () => rows[0] ?? null,
        unique: async () => rows[0] ?? null,
        paginate: async ({ cursor, numItems }: { cursor: string | null; numItems: number }) => {
          const offset = Number(cursor ?? 0);
          return { page: rows.slice(offset, offset + numItems), isDone: offset + numItems >= rows.length, continueCursor: String(offset + numItems) };
        },
      };
      return builder;
    }),
  };
  const scheduler = { runAfter: vi.fn() };
  return { ctx: { db, scheduler } as unknown as MutationCtx, tables, scheduler, db };
}
const now = Date.UTC(2026, 9, 7);
const day = 86_400_000;
const entitlement = (changes: Row = {}): Row => ({
  _id: "entitlement_fixture", userId: "rider_fixture", productId: "annual", status: "active",
  startsAt: now - day, expiresAt: now + 30 * day, subscriptionId: "subscription_fixture", ...changes,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
  vi.stubEnv("STRIPE_BILLING_ENABLED", "true");
  vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "true");
  authorize.mockReset().mockResolvedValue("admin_fixture");
  const keys = new Set<string>();
  queue.mockReset().mockImplementation(async (_ctx, args: { sendKey: string }) => {
    if (keys.has(args.sendKey)) return false;
    keys.add(args.sendKey);
    return true;
  });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

describe("daily billing scans", () => {
  it("queues renewal with stable period key and expiry with stable entitlement key on reruns", async () => {
    const { ctx } = context({ pricingEntitlements: [entitlement(), entitlement({ _id: "expired_fixture", userId: "other_fixture", expiresAt: now, status: "expired" })] });
    await daily(ctx, {});
    await daily(ctx, {});
    expect(queue.mock.calls.map(call => call[1].kind)).toEqual(["renewal", "expired", "renewal", "expired"]);
    expect(queue.mock.calls[0][1].sendKey).toBe(queue.mock.calls[2][1].sendKey);
    expect(queue.mock.calls[1][1].sendKey).toBe(queue.mock.calls[3][1].sendKey);
    expect(await queue.mock.results[2].value).toBe(false);
  });
  it.each([{ status: "revoked", revokedReason: "refunded" }, { productId: "personal_fit_standalone" }])("suppresses terminal or inapplicable access %j", async change => {
    const { ctx } = context({ pricingEntitlements: [entitlement(change), entitlement({ ...change, expiresAt: now })] });
    await daily(ctx, {});
    expect(queue).not.toHaveBeenCalled();
  });
  it("reminds a renewed second-year period", async () => {
    await daily(context({ pricingEntitlements: [entitlement({ renewed: true })] }).ctx, {});
    expect(queue).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ kind: "renewal" }));
  });
  it.each([{ renewed: true }, { cancelled: true }])("sends expiry after a renewed or cancelled period ends without replacement %j", async change => {
    await daily(context({ pricingEntitlements: [entitlement({ ...change, expiresAt: now, status: "expired" })] }).ctx, {});
    expect(queue).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ kind: "expired" }));
  });
  it("does not remind cancelled subscriptions that are still active", async () => {
    await daily(context({ pricingEntitlements: [entitlement({ cancelled: true })] }).ctx, {});
    expect(queue).not.toHaveBeenCalled();
  });
  it("suppresses expiry when a new annual period supersedes access", async () => {
    const { ctx } = context({ pricingEntitlements: [entitlement({ expiresAt: now }), entitlement({ _id: "renewed_fixture", startsAt: now, expiresAt: now + 365 * day })] });
    await daily(ctx, {});
    expect(queue).not.toHaveBeenCalled();
  });
  it("keeps expiry for a different bike but suppresses a replacement for the same bike", async () => {
    const expired = entitlement({ productId: "single", bikeId: "bike_fixture", expiresAt: now });
    const replacement = entitlement({ _id: "replacement_fixture", productId: "single", bikeId: "other_bike_fixture", expiresAt: now + 90 * day });
    await daily(context({ pricingEntitlements: [expired, replacement] }).ctx, {});
    expect(queue).toHaveBeenCalledTimes(1);
    queue.mockClear();
    await daily(context({ pricingEntitlements: [expired, { ...replacement, bikeId: "bike_fixture" }] }).ctx, {});
    expect(queue).not.toHaveBeenCalled();
  });
  it("does not remind before the reminder window or before access starts", async () => {
    await daily(context({ pricingEntitlements: [entitlement({ expiresAt: now + 30 * day + 1 }), entitlement({ startsAt: now + 1 })] }).ctx, {});
    expect(queue).not.toHaveBeenCalled();
  });
  it("bounds pages and schedules continuation with a stable clock", async () => {
    const { ctx, scheduler } = context({ pricingEntitlements: Array.from({ length: 51 }, (_value, index) => entitlement({ _id: `fixture_${index}`, cancelled: true })) });
    expect(await daily(ctx, {})).toEqual({ scanned: 50, complete: false });
    expect(scheduler.runAfter).toHaveBeenCalledWith(0, expect.anything(), { cursor: "50", asOf: now });
    expect(await daily(ctx, { cursor: "50", asOf: now })).toEqual({ scanned: 1, complete: true });
    expect(scheduler.runAfter).toHaveBeenCalledTimes(1);
  });
  it("does no database work or scheduling when billing is off", async () => {
    vi.stubEnv("STRIPE_BILLING_ENABLED", "false");
    const { ctx, db, scheduler } = context();
    await daily(ctx, {});
    expect(db.query).not.toHaveBeenCalled();
    expect(queue).not.toHaveBeenCalled();
    expect(scheduler.runAfter).not.toHaveBeenCalled();
  });
});

describe("transition service batches", () => {
  const args: BeginArgs = { kind: "transition_announcement", launchAt: now + 14 * day };
  const seed = () => ({ users: [{ _id: "rider_fixture", marketingConsent: false }, { _id: "no_report_fixture" }], recommendations: [{ _id: "report_fixture", userId: "rider_fixture" }] });
  it("defaults to dry run, returns aggregates only and dedupes repeated applies per user", async () => {
    const { ctx } = context(seed());
    for (let iteration = 0; iteration < 2; iteration += 1) {
      const preview = await start(ctx, args);
      expect(await advance(ctx, preview)).toEqual({ runId: preview.runId, scanned: 2, eligible: 1, queued: 0, complete: true });
      const apply = await start(ctx, { ...args, dryRun: false, dryRunId: preview.runId });
      const result = await advance(ctx, apply);
      expect(result.queued).toBe(iteration === 0 ? 1 : 0);
      expect(Object.keys(result).sort()).toEqual(["complete", "eligible", "queued", "runId", "scanned"]);
      await advance(ctx, apply);
    }
    expect(queue).toHaveBeenCalledTimes(2);
    expect(authorize).toHaveBeenCalledWith(expect.anything(), "billing_admin");
  });
  it("requires a completed preview matching admin, type and date, and rejects stale or reused evidence", async () => {
    const { ctx, tables } = context(seed());
    await expect(start(ctx, { ...args, dryRun: false })).rejects.toThrow("DRY_RUN_REQUIRED");
    const preview = await start(ctx, args);
    await expect(start(ctx, { ...args, dryRun: false, dryRunId: preview.runId })).rejects.toThrow("DRY_RUN_REQUIRED");
    await advance(ctx, preview);
    const evidence = tables.billingTransitionRuns[0];
    for (const change of [{ adminUserId: "different_admin_fixture" }, { kind: "transition_reminder" }, { launchAt: now }, { completedAt: now - TRANSITION_DRY_RUN_MAX_AGE_MS - 1 }]) {
      const original = { ...evidence };
      Object.assign(evidence, change);
      await expect(start(ctx, { ...args, dryRun: false, dryRunId: preview.runId })).rejects.toThrow("DRY_RUN_REQUIRED");
      Object.assign(evidence, original);
    }
    const apply = await start(ctx, { ...args, dryRun: false, dryRunId: preview.runId });
    await expect(start(ctx, { ...args, dryRun: false, dryRunId: preview.runId })).rejects.toThrow("DRY_RUN_REQUIRED");
    vi.setSystemTime(now + TRANSITION_DRY_RUN_MAX_AGE_MS + 1);
    await expect(advance(ctx, apply)).rejects.toThrow("STALE");
  });
  it("pages 25 users and never sends during previews", async () => {
    const users = Array.from({ length: 26 }, (_value, index) => ({ _id: `rider_fixture_${index}` }));
    const { ctx } = context({ users, recommendations: users.map(user => ({ userId: user._id })) });
    const run = await start(ctx, args);
    expect(await advance(ctx, run)).toMatchObject({ scanned: 25, eligible: 25, complete: false });
    expect(await advance(ctx, run)).toMatchObject({ scanned: 26, eligible: 26, complete: true });
    expect(queue).not.toHaveBeenCalled();
  });
  it("reminds only unredeemed matching offers within seven days and only with reports", async () => {
    const offers = [
      { redeemBy: now + 7 * day }, { redeemBy: now + 7 * day + 1 }, { redeemBy: now },
      { redeemBy: now + day, redeemedAt: now - day }, { redeemBy: now + day, goLiveAt: now - day },
    ].map((changes, index) => ({ _id: `offer_fixture_${index}`, userId: `rider_fixture_${index}`, goLiveAt: now, ...changes }));
    const users = offers.map(offer => ({ _id: offer.userId }));
    const { ctx } = context({ users, recommendations: users.map(user => ({ userId: user._id })), pricingTransitionOffers: offers });
    const reminder: BeginArgs = { kind: "transition_reminder", launchAt: now };
    const preview = await start(ctx, reminder);
    expect(await advance(ctx, preview)).toMatchObject({ eligible: 1, queued: 0 });
    const apply = await start(ctx, { ...reminder, dryRun: false, dryRunId: preview.runId });
    expect(await advance(ctx, apply)).toMatchObject({ eligible: 1, queued: 1 });
    expect(queue).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ transitionOfferId: offers[0]._id, kind: "transition_reminder" }));
  });
  it("requires admin ownership on continuation and respects the billing kill switch", async () => {
    const { ctx } = context(seed());
    const reminderArgs: BeginArgs = { ...args, kind: "transition_reminder" };
    const preview = await start(ctx, reminderArgs);
    authorize.mockResolvedValueOnce("other_admin_fixture");
    await expect(advance(ctx, preview)).rejects.toThrow("NOT_FOUND");
    await advance(ctx, preview);
    vi.stubEnv("STRIPE_BILLING_ENABLED", "false");
    await expect(start(ctx, { ...reminderArgs, dryRun: false, dryRunId: preview.runId })).rejects.toThrow("STRIPE_NOT_IMPLEMENTED");
    expect(queue).not.toHaveBeenCalled();
  });
  it("stops an already-started apply when billing is disabled", async () => {
    const { ctx } = context(seed());
    const reminderArgs: BeginArgs = { ...args, kind: "transition_reminder" };
    const preview = await start(ctx, reminderArgs);
    await advance(ctx, preview);
    const apply = await start(ctx, { ...reminderArgs, dryRun: false, dryRunId: preview.runId });
    vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "false");
    await expect(advance(ctx, apply)).rejects.toThrow("STRIPE_NOT_IMPLEMENTED");
    expect(queue).not.toHaveBeenCalled();
  });
  it("allows the admin-authorized prelaunch announcement with billing off and supplies stored proof", async () => {
    vi.stubEnv("STRIPE_BILLING_ENABLED", "false");
    const { ctx } = context(seed());
    authorize.mockRejectedValueOnce(new Error("Not authorized"));
    await expect(start(ctx, args)).rejects.toThrow("Not authorized");
    await expect(start(ctx, { ...args, dryRun: false })).rejects.toThrow("DRY_RUN_REQUIRED");
    const preview = await start(ctx, args);
    await advance(ctx, preview);
    const apply = await start(ctx, { ...args, dryRun: false, dryRunId: preview.runId });
    expect(await advance(ctx, apply)).toMatchObject({ queued: 1 });
    expect(queue).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      kind: "transition_announcement", transitionRunId: apply.runId,
    }));
  });
});
