import { afterEach, describe, expect, it, vi } from "vitest";
import { claimFitterNotification, finishFitterNotification, queueFitterNotification } from "./internal";

type Row = Record<string, unknown>;
type Handler = { _handler: (ctx: unknown, args: { entitlementId: string }) => Promise<unknown> };
const invoke = (ctx: unknown) => (queueFitterNotification as unknown as Handler)
  ._handler(ctx, { entitlementId: "personal_1" });

function fixture() {
  const entitlement: Row = {
    userId: "owner", productId: "annual_personal", source: "purchase", status: "active",
    startsAt: Date.now() - 1000, createdAt: Date.now(), expiresAt: Date.now() + 60000, appointmentGranted: true,
    inseamCm: 86,
  };
  const user = { name: "Rider", email: "owner@example.test", locale: "nl" };
  const notifications: Row[] = [];
  const ctx = {
    db: {
      get: async (id: string) => id === "personal_1" ? entitlement : id === "owner" ? user
        : notifications.find(row => row._id === id) ?? null,
      query: () => ({ withIndex: () => ({ unique: async () => notifications[0] ?? null }) }),
      insert: vi.fn(async (_table: string, value: Row) => {
        notifications.push({ _id: "notification_1", ...value });
        return "notification_1";
      }),
      patch: vi.fn(async (id: string, values: Row) => {
        Object.assign(notifications.find(row => row._id === id)!, values);
      }),
    },
    scheduler: { runAfter: vi.fn() },
  };
  return { ctx, entitlement, notifications, user };
}

function claim(ctx: unknown) {
  return (claimFitterNotification as unknown as {
    _handler: (context: unknown, args: { notificationId: string }) => Promise<unknown>;
  })._handler(ctx, { notificationId: "notification_1" });
}

function finish(ctx: unknown, sent: boolean) {
  return (finishFitterNotification as unknown as {
    _handler: (context: unknown, args: { notificationId: string; sent: boolean }) => Promise<unknown>;
  })._handler(ctx, { notificationId: "notification_1", sent });
}

afterEach(() => vi.unstubAllEnvs());

describe("fitter notification outbox", () => {
  it("queues one durable intent on repeated verified purchase callbacks and schedules once", async () => {
    vi.stubEnv("FITTER_NOTIFICATION_EMAIL", "fitter@example.test");
    const { ctx, notifications } = fixture();
    expect(await invoke(ctx)).toEqual({ status: "pending", id: "notification_1" });
    expect(await invoke(ctx)).toEqual({ status: "pending", id: "notification_1" });
    expect(ctx.db.insert).toHaveBeenCalledTimes(1);
    expect(notifications[0]).toMatchObject({
      recipient: "fitter@example.test", riderEmail: "owner@example.test", locale: "nl",
      entitlementId: "personal_1", idempotencyKey: "personal-bikefit:personal_1", status: "pending",
    });
    expect(ctx.scheduler.runAfter).toHaveBeenCalledTimes(1);
  });
  it.each(["annual_personal", "personal_fit_standalone"])("claims %s only once and excludes measurements", async productId => {
    vi.stubEnv("FITTER_NOTIFICATION_EMAIL", "fitter@example.test");
    const { ctx, entitlement, user, notifications } = fixture();
    entitlement.productId = productId;
    await invoke(ctx);
    user.name = "Updated rider";
    expect(await claim(ctx)).toEqual({
      recipient: "fitter@example.test", riderName: "Updated rider", riderEmail: "owner@example.test",
      locale: "nl", productId, paidAt: entitlement.createdAt, idempotencyKey: "personal-bikefit:personal_1",
    });
    expect(await claim(ctx)).toBeNull();
    await finish(ctx, true);
    expect(notifications[0]).toMatchObject({ status: "sent", sentAt: expect.any(Number) });
    await invoke(ctx);
    expect(ctx.scheduler.runAfter).toHaveBeenCalledTimes(1);
  });
  it("cancels a refunded appointment before delivery", async () => {
    vi.stubEnv("FITTER_NOTIFICATION_EMAIL", "fitter@example.test");
    const { ctx, entitlement, notifications } = fixture();
    await invoke(ctx);
    entitlement.status = "revoked";
    entitlement.revokedReason = "refunded";
    expect(await claim(ctx)).toBeNull();
    expect(notifications[0].status).toBe("cancelled");
  });
  it("upgrades a legacy pending intent once without inserting a duplicate", async () => {
    vi.stubEnv("FITTER_NOTIFICATION_EMAIL", "fitter@example.test");
    const { ctx, notifications } = fixture();
    await invoke(ctx);
    notifications[0].status = "pending_integration";
    ctx.scheduler.runAfter.mockClear();
    await invoke(ctx);
    await invoke(ctx);
    expect(ctx.db.insert).toHaveBeenCalledTimes(1);
    expect(ctx.scheduler.runAfter).toHaveBeenCalledTimes(1);
  });
  it("does not retry an ambiguous provider failure or overwrite it with a stale completion", async () => {
    vi.stubEnv("FITTER_NOTIFICATION_EMAIL", "fitter@example.test");
    const { ctx, notifications } = fixture();
    await invoke(ctx);
    await claim(ctx);
    await finish(ctx, false);
    await finish(ctx, true);
    expect(await claim(ctx)).toBeNull();
    expect(notifications[0].status).toBe("failed");
  });
  it("does not invent a recipient or queue without configuration", async () => {
    vi.stubEnv("FITTER_NOTIFICATION_EMAIL", "");
    const { ctx } = fixture();
    expect(await invoke(ctx)).toEqual({ status: "not_configured" });
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
  it.each(["annual", "single"])("does not queue for %s or renewal without an appointment", async (productId) => {
    vi.stubEnv("FITTER_NOTIFICATION_EMAIL", "fitter@example.test");
    const { ctx, entitlement } = fixture();
    entitlement.productId = productId;
    entitlement.appointmentGranted = false;
    expect(await invoke(ctx)).toEqual({ status: "not_eligible" });
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
});
