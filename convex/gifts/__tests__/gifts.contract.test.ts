import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as mutations from "../mutations";
import * as queries from "../queries";
import { fixture, invoke, NOW, requestKey } from "./fixture";

const auth = vi.hoisted(() => ({ userId: "giver" as string | null }));
const grants = vi.hoisted(() => ({ grant: vi.fn(async (_ctx: unknown, _args: Record<string, unknown>) => undefined) }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: async () => auth.userId }));
vi.mock("../../pricing/gifts", () => ({ grantGiftEntitlement: grants.grant }));
const giveArgs = (sequence = 1) => ({ recipientEmail: "recipient@example.com", locale: "nl", requestKey: requestKey(sequence) });
beforeEach(() => { auth.userId = "giver"; vi.spyOn(Date, "now").mockReturnValue(NOW); grants.grant.mockReset(); });
afterEach(() => vi.restoreAllMocks());

describe("gift transactions", () => {
  it("stores only a token hash, queues one email and exact expiry for duplicate give", async () => {
    const test = fixture();
    const first = await invoke(mutations.give, test.ctx, giveArgs());
    expect(await invoke(mutations.give, test.ctx, giveArgs())).toEqual(first);
    expect(test.ctx.scheduler.runAfter).toHaveBeenCalledTimes(1);
    expect(test.ctx.scheduler.runAt).toHaveBeenCalledTimes(1);
    const gift = test.tables.get("pricingGifts")![0];
    expect(gift.tokenHash).toHaveLength(64);
    expect(gift.tokenHash).not.toBe(test.token());
    expect(JSON.stringify(gift)).not.toContain(test.token());
    expect(gift.expiresAt).toBe(Date.UTC(2026, 10, 4, 12));
  });
  it("caps concurrent serialized reservations at two", async () => {
    const test = fixture();
    const results = await Promise.allSettled([1, 2, 3].map((sequence) => test.transaction(mutations.give, giveArgs(sequence))));
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(2);
    expect(test.tables.get("pricingGifts")).toHaveLength(2);
  });
  it("restores expired credit only to the original period and erases email/message", async () => {
    const test = fixture(); await invoke(mutations.give, test.ctx, { ...giveArgs(), message: "Hello" });
    const giftId = test.tables.get("pricingGifts")![0]._id;
    await test.ctx.db.patch("annual", { startsAt: NOW });
    expect(await invoke(queries.getOverview, test.ctx)).toMatchObject({ availableCredits: 2 });
    await test.ctx.db.patch(giftId, { expiresAt: NOW });
    await invoke(mutations.expireGift, test.ctx, { giftId });
    expect(test.stored(giftId)).not.toHaveProperty("recipientEmail");
    expect(test.stored(giftId)).not.toHaveProperty("message");
    expect(await invoke(queries.getOverview, test.ctx)).toMatchObject({ availableCredits: 2 });
  });
  it("grants once for concurrent serialized redemption and replay", async () => {
    const test = fixture(); await invoke(mutations.give, test.ctx, giveArgs()); auth.userId = "recipient";
    const args = { token: test.token(), bikeId: "bike" };
    expect(await Promise.all([test.transaction(mutations.redeem, args), test.transaction(mutations.redeem, args)]))
      .toEqual([{ status: "redeemed" }, { status: "redeemed" }]);
    expect(grants.grant).toHaveBeenCalledTimes(1);
    expect(grants.grant.mock.calls[0][1]).toMatchObject({ bikeId: "bike", redeemedAt: NOW });
    expect(test.tables.get("pricingGifts")![0]).not.toHaveProperty("recipientEmail");
  });
  it("leaves gift pending when entitlement grant fails", async () => {
    const test = fixture(); await invoke(mutations.give, test.ctx, giveArgs()); auth.userId = "recipient";
    grants.grant.mockRejectedValueOnce(new Error("grant failed"));
    await expect(invoke(mutations.redeem, test.ctx, { token: test.token(), bikeId: "bike" })).rejects.toThrow("grant failed");
    expect(test.tables.get("pricingGifts")![0].status).toBe("pending");
  });
  it("refunded source cannot redeem or expose email context", async () => {
    const test = fixture(); await invoke(mutations.give, test.ctx, giveArgs()); await test.ctx.db.patch("annual", { status: "revoked" });
    expect(await invoke(queries.getGiftEmailContext, test.ctx, { giftId: test.tables.get("pricingGifts")![0]._id, token: test.token() })).toBeNull();
    expect(await invoke(queries.getOverview, test.ctx)).toMatchObject({ gifts: [{ status: "cancelled" }] });
    auth.userId = "recipient";
    expect(await invoke(mutations.redeem, test.ctx, { token: test.token(), bikeId: "bike" })).toEqual({ status: "invalid" });
    expect(grants.grant).not.toHaveBeenCalled();
  });
  it("rejects self gift, missing auth, unverified recipient and unowned bike", async () => {
    const test = fixture();
    await expect(invoke(mutations.give, test.ctx, { ...giveArgs(), recipientEmail: " GIVER@example.com " })).rejects.toThrow("SELF_GIFT_NOT_ALLOWED");
    await invoke(mutations.give, test.ctx, giveArgs());
    auth.userId = null;
    await expect(invoke(mutations.redeem, test.ctx, { token: test.token(), bikeId: "bike" })).rejects.toThrow("Not authenticated");
    auth.userId = "recipient";
    await expect(invoke(mutations.redeem, test.ctx, { token: test.token(), bikeId: "otherBike" })).rejects.toThrow("INVALID_BIKE");
    await test.ctx.db.patch("recipient", { emailVerificationTime: undefined });
    await expect(invoke(mutations.redeem, test.ctx, { token: test.token(), bikeId: "bike" })).rejects.toThrow("VERIFIED_EMAIL_REQUIRED");
  });
  it("rejects wrong verified email without granting or disclosing recipient", async () => {
    const test = fixture(); await invoke(mutations.give, test.ctx, giveArgs()); auth.userId = "recipient";
    await test.ctx.db.patch("recipient", { email: "different@example.com" });
    expect(await invoke(mutations.redeem, test.ctx, { token: test.token(), bikeId: "bike" })).toEqual({ status: "invalid" });
    expect(grants.grant).not.toHaveBeenCalled();
  });
  it("expires redemption at the deadline and removes stored personal data", async () => {
    const test = fixture(); await invoke(mutations.give, test.ctx, giveArgs()); auth.userId = "recipient";
    await test.ctx.db.patch(test.tables.get("pricingGifts")![0]._id, { expiresAt: NOW });
    expect(await invoke(mutations.redeem, test.ctx, { token: test.token(), bikeId: "bike" })).toEqual({ status: "expired" });
    expect(test.tables.get("pricingGifts")![0]).not.toHaveProperty("recipientEmail");
    expect(grants.grant).not.toHaveBeenCalled();
  });
  it("blocks grants from transition and open-access accounts", async () => {
    const test = fixture(); await test.ctx.db.patch("annual", { source: "transition" });
    await expect(invoke(mutations.give, test.ctx, giveArgs())).rejects.toThrow("PAID_ANNUAL_REQUIRED");
    test.tables.set("pricingEntitlements", []);
    await expect(invoke(mutations.give, test.ctx, giveArgs())).rejects.toThrow("PAID_ANNUAL_REQUIRED");
  });
  it("enforces daily abuse limit after five returned credits", async () => {
    const test = fixture();
    for (let sequence = 1; sequence <= 5; sequence++) {
      await invoke(mutations.give, test.ctx, giveArgs(sequence));
      await test.ctx.db.patch(test.tables.get("pricingGifts")!.at(-1)!._id, { status: "expired", recipientEmail: undefined });
    }
    await expect(invoke(mutations.give, test.ctx, giveArgs(6))).rejects.toThrow("GIFT_RATE_LIMIT");
  });
  it("returns only anonymous fields and handles malformed tokens", async () => {
    const test = fixture(); await invoke(mutations.give, test.ctx, giveArgs());
    const overview = JSON.stringify(await invoke(queries.getOverview, test.ctx));
    const preview = JSON.stringify(await invoke(queries.preview, test.ctx, { token: test.token() }));
    for (const output of [overview, preview]) {
      expect(output).not.toContain("@example.com"); expect(output).not.toContain("recipientId"); expect(output).not.toContain("giverId");
    }
    expect(await invoke(queries.preview, test.ctx, { token: "bad" })).toEqual({ status: "invalid" });
  });
});
