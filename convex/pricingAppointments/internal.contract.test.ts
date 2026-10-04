import { afterEach, describe, expect, it, vi } from "vitest";
import { queueFitterNotification } from "./internal";

type Row = Record<string, unknown>;
type Handler = { _handler: (ctx: unknown, args: { entitlementId: string }) => Promise<unknown> };
const invoke = (ctx: unknown) => (queueFitterNotification as unknown as Handler)
  ._handler(ctx, { entitlementId: "personal_1" });

function fixture() {
  const entitlement: Row = {
    userId: "owner", productId: "annual_personal", source: "purchase", status: "active",
    startsAt: Date.now() - 1000, expiresAt: Date.now() + 60000, appointmentGranted: true,
  };
  const user = { name: "Rider", email: "owner@example.test", locale: "nl" };
  const notifications: Row[] = [];
  const ctx = {
    db: {
      get: async (id: string) => id === "personal_1" ? entitlement : id === "owner" ? user : null,
      query: () => ({ withIndex: () => ({ unique: async () => notifications[0] ?? null }) }),
      insert: vi.fn(async (_table: string, value: Row) => {
        notifications.push({ _id: "notification_1", ...value });
        return "notification_1";
      }),
    },
    scheduler: { runAfter: vi.fn() },
  };
  return { ctx, entitlement, notifications };
}

afterEach(() => vi.unstubAllEnvs());

describe("fitter notification pending-integration outbox", () => {
  it("queues one durable intent on repeated verified purchase callbacks and never sends", async () => {
    vi.stubEnv("FITTER_NOTIFICATION_EMAIL", "fitter@example.test");
    const { ctx, notifications } = fixture();
    expect(await invoke(ctx)).toEqual({ status: "pending_integration", id: "notification_1" });
    expect(await invoke(ctx)).toEqual({ status: "pending_integration", id: "notification_1" });
    expect(ctx.db.insert).toHaveBeenCalledTimes(1);
    expect(notifications[0]).toMatchObject({
      recipient: "fitter@example.test", riderEmail: "owner@example.test", locale: "nl",
      entitlementId: "personal_1", idempotencyKey: "personal-bikefit:personal_1", status: "pending_integration",
    });
    expect(ctx.scheduler.runAfter).not.toHaveBeenCalled();
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
