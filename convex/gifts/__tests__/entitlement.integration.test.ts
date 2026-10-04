import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAccess, isUpgradeEligible, type PricingEntitlement } from "../../../shared/pricing/access";
import { give, redeem } from "../mutations";
import { getOverview } from "../queries";
import { fixture, invoke, requestKey } from "./fixture";

const auth = vi.hoisted(() => ({ userId: "giver" as string | null }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: async () => auth.userId }));

const REDEEMED_AT = Date.UTC(2027, 0, 31, 12);
const giveArgs = (sequence = 1) => ({
  recipientEmail: "recipient@example.com", locale: "nl", requestKey: requestKey(sequence),
});

beforeEach(() => {
  auth.userId = "giver";
  vi.spyOn(Date, "now").mockReturnValue(REDEEMED_AT);
});
afterEach(() => vi.restoreAllMocks());

describe("gift redemption with the real pricing entitlement hook", () => {
  it("grants one bike for three calendar months and upgrade eligibility for six", async () => {
    const test = fixture();
    await invoke(give, test.ctx, giveArgs());
    const giftId = test.tables.get("pricingGifts")![0]._id;
    auth.userId = "recipient";
    const args = { token: test.token(), bikeId: "bike" };
    expect(await invoke(redeem, test.ctx, args)).toEqual({ status: "redeemed" });
    expect(await invoke(redeem, test.ctx, args)).toEqual({ status: "redeemed" });

    const grants = test.tables.get("pricingEntitlements")!.filter((row) => row.source === "gift");
    expect(grants).toHaveLength(1);
    expect(grants[0]).toMatchObject({
      userId: "recipient", bikeId: "bike", productId: "single", source: "gift", status: "active",
      startsAt: REDEEMED_AT, expiresAt: Date.UTC(2027, 3, 30, 12),
      grantKey: `gift:${giftId}`, appointmentGranted: false, periodPriceCents: 0,
    });
    const entitlements = grants as unknown as PricingEntitlement[];
    const user = { entitlements };
    const access = (bikeId: string, now: number) => getAccess(user, bikeId, { enforced: true, now });
    expect(access("bike", REDEEMED_AT)).toMatchObject({ fullReport: true, maxBikes: 1, eligibleForUpgrade: true });
    expect(access("otherBike", REDEEMED_AT).fullReport).toBe(false);
    expect(access("bike", Date.UTC(2027, 3, 30, 12) - 1).fullReport).toBe(true);
    expect(access("bike", Date.UTC(2027, 3, 30, 12))).toMatchObject({ fullReport: false, eligibleForUpgrade: true });
    expect(isUpgradeEligible(entitlements, Date.UTC(2027, 6, 31, 12) - 1)).toBe(true);
    expect(isUpgradeEligible(entitlements, Date.UTC(2027, 6, 31, 12))).toBe(false);
  });

  it("preserves two credits for historical paid entry entitlements", async () => {
    const test = fixture();
    await test.ctx.db.patch("annual", { productId: "annual_entry" });
    expect(await invoke(getOverview, test.ctx)).toMatchObject({ eligible: true, availableCredits: 2 });
    await invoke(give, test.ctx, giveArgs(1));
    await invoke(give, test.ctx, giveArgs(2));
    await expect(invoke(give, test.ctx, giveArgs(3))).rejects.toThrow("NO_GIFT_CREDITS");
    expect(await invoke(getOverview, test.ctx)).toMatchObject({ availableCredits: 0 });
  });

  it("does not create a real entitlement for a refunded gift source", async () => {
    const test = fixture();
    await invoke(give, test.ctx, giveArgs());
    await test.ctx.db.patch("annual", { status: "revoked", revokedReason: "refunded" });
    auth.userId = "recipient";
    expect(await invoke(redeem, test.ctx, { token: test.token(), bikeId: "bike" })).toEqual({ status: "invalid" });
    expect(test.tables.get("pricingEntitlements")!.filter((row) => row.source === "gift")).toHaveLength(0);
  });
});
