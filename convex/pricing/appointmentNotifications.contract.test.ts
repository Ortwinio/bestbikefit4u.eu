import { afterEach, describe, expect, it, vi } from "vitest";
import { prepare } from "./appointmentNotifications";

type Handler = { _handler: (ctx: unknown, args: { entitlementId: string }) => Promise<unknown> };
const invoke = (ctx: unknown) => (prepare as unknown as Handler)._handler(ctx, { entitlementId: "entitlement_1" });

afterEach(() => vi.unstubAllEnvs());

describe("internal fitter notification preparation", () => {
  it("reads only authoritative entitlement and owner contact, without scheduling or sending", async () => {
    vi.stubEnv("FITTER_NOTIFICATION_EMAIL", "configured@example.test");
    const rows = new Map<string, unknown>([
      ["entitlement_1", {
        userId: "owner", productId: "annual_personal", source: "purchase", status: "active",
        startsAt: Date.now() - 1000, expiresAt: Date.now() + 60000, appointmentGranted: true,
      }],
      ["owner", { displayName: "Rider", email: "owner@example.test", locale: "nl" }],
    ]);
    const db = { get: vi.fn(async (id: string) => rows.get(id) ?? null) };
    const scheduler = { runAfter: vi.fn() };
    const plan = await invoke({ db, scheduler });
    expect(plan).toEqual({
      status: "ready", recipient: "configured@example.test", idempotencyKey: "personal-bikefit:entitlement_1",
      rider: { name: "Rider", email: "owner@example.test" }, locale: "nl",
    });
    expect(db.get.mock.calls).toEqual([["entitlement_1"], ["owner"]]);
    expect(scheduler.runAfter).not.toHaveBeenCalled();
  });
  it("returns no contact details for a missing entitlement", async () => {
    expect(await invoke({ db: { get: async () => null } })).toEqual({ status: "not_eligible" });
  });
});
