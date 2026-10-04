import { describe, expect, it, vi } from "vitest";
import type { Id } from "../../_generated/dataModel";
import { addMonths, resolveAccess } from "../entitlements";
import { expireEndedEntitlements } from "../../entitlements/mutations";

const NOW = Date.UTC(2026, 9, 4, 12);
const DAY = 24 * 60 * 60 * 1000;
const bikeA = "bike_a" as Id<"bikes">;
const bikeB = "bike_b" as Id<"bikes">;

type Kind = "single_fit" | "annual" | "gift_fit";
type Status = "active" | "expired" | "canceled";

function entitlement(
  kind: Kind,
  opts: { bikeId?: Id<"bikes">; startsAt?: number; endsAt?: number; status?: Status } = {}
) {
  return {
    kind,
    bikeId: opts.bikeId,
    startsAt: opts.startsAt ?? NOW - 10 * DAY,
    endsAt: opts.endsAt ?? NOW + 80 * DAY,
    status: opts.status ?? ("active" as Status),
  };
}

describe("resolveAccess", () => {
  it("gives free access without entitlements", () => {
    expect(resolveAccess([], NOW, bikeA)).toEqual({
      level: "free",
      bikeScoped: false,
      everPaid: false,
      lastPaidEndsAt: undefined,
      upgradeEligible: false,
    });
  });

  it("opens only the bike of a single fit", () => {
    const rights = [entitlement("single_fit", { bikeId: bikeA })];
    expect(resolveAccess(rights, NOW, bikeA)).toMatchObject({ level: "single", bikeScoped: true });
    expect(resolveAccess(rights, NOW, bikeB)).toMatchObject({ level: "free", everPaid: true });
    expect(resolveAccess(rights, NOW)).toMatchObject({ level: "free", upgradeEligible: true });
  });

  it("opens every bike with an annual licence", () => {
    const rights = [entitlement("annual", { endsAt: NOW + 300 * DAY })];
    expect(resolveAccess(rights, NOW, bikeA)).toMatchObject({ level: "annual", bikeScoped: false });
    expect(resolveAccess(rights, NOW, bikeB)).toMatchObject({ level: "annual" });
    expect(resolveAccess(rights, NOW)).toMatchObject({ level: "annual", upgradeEligible: false });
  });

  it("prefers annual over a single fit on the same bike", () => {
    const rights = [
      entitlement("single_fit", { bikeId: bikeA }),
      entitlement("annual", { endsAt: NOW + 300 * DAY }),
    ];
    expect(resolveAccess(rights, NOW, bikeA)).toMatchObject({ level: "annual", endsAt: NOW + 300 * DAY });
  });

  it("closes access once a single fit has ended, but remembers it was paid", () => {
    const endedAt = NOW - DAY;
    const rights = [entitlement("single_fit", { bikeId: bikeA, endsAt: endedAt })];
    expect(resolveAccess(rights, NOW, bikeA)).toEqual({
      level: "free",
      bikeScoped: false,
      everPaid: true,
      lastPaidEndsAt: endedAt,
      upgradeEligible: true,
    });
  });

  it("ignores canceled and not-yet-started entitlements", () => {
    const rights = [
      entitlement("annual", { status: "canceled" }),
      entitlement("gift_fit", { bikeId: bikeA, startsAt: NOW + DAY }),
    ];
    expect(resolveAccess(rights, NOW, bikeA)).toMatchObject({ level: "free", upgradeEligible: false });
  });

  it("allows the €9,50 upgrade only within 6 months after a single fit or redeemed gift", () => {
    const fiveMonthsAgo = addMonths(NOW, -5);
    const sevenMonthsAgo = addMonths(NOW, -7);
    expect(
      resolveAccess([entitlement("single_fit", { bikeId: bikeA, startsAt: fiveMonthsAgo, endsAt: addMonths(fiveMonthsAgo, 3), status: "expired" })], NOW)
    ).toMatchObject({ upgradeEligible: true });
    expect(
      resolveAccess([entitlement("gift_fit", { bikeId: bikeA, startsAt: fiveMonthsAgo, endsAt: addMonths(fiveMonthsAgo, 3), status: "expired" })], NOW)
    ).toMatchObject({ upgradeEligible: true });
    expect(
      resolveAccess([entitlement("single_fit", { bikeId: bikeA, startsAt: sevenMonthsAgo, endsAt: addMonths(sevenMonthsAgo, 3), status: "expired" })], NOW)
    ).toMatchObject({ upgradeEligible: false, everPaid: true });
  });

  it("treats a gift like a single fit for its bike", () => {
    const rights = [entitlement("gift_fit", { bikeId: bikeB })];
    expect(resolveAccess(rights, NOW, bikeB)).toMatchObject({ level: "single", bikeScoped: true });
  });
});

describe("addMonths", () => {
  it("adds calendar months for the three-month single fit", () => {
    expect(new Date(addMonths(Date.UTC(2026, 9, 4), 3)).toISOString()).toBe("2027-01-04T00:00:00.000Z");
  });
});

describe("expireEndedEntitlements", () => {
  type Row = { _id: string; status: Status; endsAt: number; updatedAt?: number };

  function makeCtx(rows: Row[]) {
    const db = {
      query: vi.fn(() => ({
        withIndex: (_index: string, build: (q: unknown) => unknown) => {
          let status: Status | undefined;
          let maxEnd = Number.POSITIVE_INFINITY;
          const q = {
            eq: (_field: string, value: Status) => {
              status = value;
              return q;
            },
            lte: (_field: string, value: number) => {
              maxEnd = value;
              return q;
            },
          };
          build(q);
          return {
            take: async (n: number) =>
              rows.filter((row) => row.status === status && row.endsAt <= maxEnd).slice(0, n),
          };
        },
      })),
      patch: vi.fn(async (id: string, patch: Partial<Row>) => {
        Object.assign(rows.find((row) => row._id === id)!, patch);
      }),
    };
    return { db };
  }

  const handler = (expireEndedEntitlements as unknown as {
    _handler: (ctx: unknown, args: { now?: number }) => Promise<{ expired: number; hasMore: boolean }>;
  })._handler;

  it("expires ended rights once and leaves current ones alone", async () => {
    const rows: Row[] = [
      { _id: "e1", status: "active", endsAt: NOW - DAY },
      { _id: "e2", status: "active", endsAt: NOW + DAY },
      { _id: "e3", status: "canceled", endsAt: NOW - DAY },
    ];
    const ctx = makeCtx(rows);

    expect(await handler(ctx, { now: NOW })).toEqual({ expired: 1, hasMore: false });
    expect(rows.map((row) => row.status)).toEqual(["expired", "active", "canceled"]);

    expect(await handler(ctx, { now: NOW })).toEqual({ expired: 0, hasMore: false });
  });
});
