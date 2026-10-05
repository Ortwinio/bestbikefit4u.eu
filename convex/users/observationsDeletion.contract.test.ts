import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteAccount } from "./mutations";

const { auth } = vi.hoisted(() => ({ auth: vi.fn() }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: auth }));

describe("account observation deletion", () => {
  beforeEach(() => auth.mockResolvedValue("owner"));

  it("deletes current, superseded and bike-scoped evidence only for the account owner", async () => {
    const observations = [
      { _id: "current", userId: "owner", status: "current" },
      { _id: "history", userId: "owner", status: "superseded" },
      { _id: "bike", userId: "owner", bikeId: "bike_1", status: "current" },
      { _id: "other", userId: "other", status: "current" },
    ];
    const remove = vi.fn();
    const query = (table: string) => {
      const conditions: [string, unknown][] = [];
      const range = { eq: (key: string, value: unknown) => { conditions.push([key, value]); return range; } };
      const records = table === "profileObservations" ? observations
        : ["profilePrompts", "profilePromptCards", "profilePromptActivity", "newsletterConsentEvents", "pricingEntitlements", "pricingTransitionOffers", "pricingAppointmentNotifications", "reliabilityInseamMeasurements", "reliabilityKneeMeasurements",
          "reliabilitySaddlePreferences"].includes(table)
          ? [{ _id: table, userId: "owner" }, { _id: `${table}_other`, userId: "other" }] : [];
      const rows = () => records.filter(row => conditions.every(([key, value]) =>
        row[key as keyof typeof row] === value));
      const cursor = {
        withIndex: (_name: string, apply: (builder: typeof range) => unknown) => { apply(range); return cursor; },
        collect: async () => rows(), unique: async () => rows()[0] ?? null,
      };
      return cursor;
    };
    await (deleteAccount as unknown as { _handler: (ctx: unknown, args: object) => Promise<void> })
      ._handler({ db: { query, delete: remove } }, {});
    expect(remove.mock.calls.map(([id]) => id)).toEqual([
      "pricingEntitlements", "pricingTransitionOffers", "pricingAppointmentNotifications",
      "reliabilityInseamMeasurements", "reliabilityKneeMeasurements", "reliabilitySaddlePreferences",
      "current", "history", "bike", "profilePrompts", "profilePromptCards", "profilePromptActivity",
      "newsletterConsentEvents", "owner",
    ]);
  });

  it("requires authentication before reading or deleting observations", async () => {
    auth.mockResolvedValue(null);
    const query = vi.fn();
    await expect((deleteAccount as unknown as { _handler: (ctx: unknown, args: object) => Promise<void> })
      ._handler({ db: { query } }, {})).rejects.toThrow();
    expect(query).not.toHaveBeenCalled();
  });
});
