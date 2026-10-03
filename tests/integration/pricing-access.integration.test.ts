import { afterEach, describe, expect, it, vi } from "vitest";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import type { MutationCtx } from "../../convex/_generated/server";
import { getUserAccess } from "../../convex/pricing/access";
import { assertPaidProfileWrite } from "../../convex/profiles/paidAccess";
import { reportAccess, visibleRecommendation } from "../../convex/recommendations/access";
import { BASE_RIDER_RULES, REFINEMENT_RULES, scoreRiderProfile } from "../../shared/profileScore";
import type { RiderValues } from "../../shared/profileScore/types";

type Row = Record<string, unknown> & { _id: string };
const now = Date.UTC(2026, 9, 3);
const userId = "owner" as Id<"users">;
const bikeId = "bike-a" as Id<"bikes">;
const otherBikeId = "bike-b" as Id<"bikes">;
function fixture(expiresAt = now + 1) {
  const reports = ["a", "b"].map((key, index) => ({
    _id: `report-${key}`, _creationTime: index + 1, createdAt: index + 1, userId,
    sessionId: `session-${key}`, bikeId: `bike-${key}`, calculatedFit: { saddleHeightMm: 740 },
    frameSizeRecommendations: [], fitNotes: ["Private refinement"], adjustmentPriorities: ["Private plan"],
    confidenceScore: 80, algorithmVersion: "v2",
  })) as unknown as Doc<"recommendations">[];
  const tables: Record<string, Row[]> = {
    bikes: [{ _id: bikeId, userId }, { _id: otherBikeId, userId }, { _id: "foreign", userId: "other" }],
    pricingEntitlements: [{ _id: "grant", userId, bikeId, productId: "single", status: "active",
      source: "purchase", startsAt: now - 1000, expiresAt, appointmentGranted: false }],
    recommendations: reports,
  };
  const query = (table: string) => {
    const filters: Array<[string, unknown]> = [];
    const range = { eq: (field: string, value: unknown) => { filters.push([field, value]); return range; } };
    const cursor = {
      withIndex: (_name: string, apply: (builder: typeof range) => unknown) => { apply(range); return cursor; },
      collect: async () => (tables[table] ?? []).filter(row => filters.every(([field, value]) => row[field] === value)),
    };
    return cursor;
  };
  const ctx = { db: { query, get: async (id: string) => Object.values(tables).flat().find(row => row._id === id) ?? null } } as unknown as MutationCtx;
  return { ctx, reports, tables };
}
const completeProfile = Object.fromEntries([...BASE_RIDER_RULES, ...REFINEMENT_RULES]
  .flatMap(rule => rule.fields.map(field => [field, field === "hasPain" ? "no" : field === "painAreas" ? [] : 10]))) as RiderValues;

afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("pricing access across profile and reports", () => {
  it("expires score, paid writes and matching-bike reports at the same exact boundary without waiting for cron", async () => {
    vi.stubEnv("PAID_ACCESS_ENFORCED", "true");
    const clock = vi.spyOn(Date, "now").mockReturnValue(now);
    const { ctx, reports } = fixture();
    expect(scoreRiderProfile({ profile: completeProfile }, now, await getUserAccess(ctx, userId)).completeness).toBe(100);
    await expect(assertPaidProfileWrite(ctx, userId, { femurLengthCm: 42 }, null)).resolves.toBeUndefined();
    expect(await reportAccess(ctx, reports[0])).toMatchObject({ fullReport: true, canDownloadPdf: true });
    expect(await reportAccess(ctx, reports[1])).toMatchObject({ fullReport: false, canDownloadPdf: true, isLatestReport: true });
    clock.mockReturnValue(now + 1);
    expect(scoreRiderProfile({ profile: completeProfile }, now + 1, await getUserAccess(ctx, userId)).completeness).toBe(80);
    await expect(assertPaidProfileWrite(ctx, userId, { femurLengthCm: 42 }, null)).rejects.toThrow("PAID_PROFILE_ACCESS_REQUIRED");
    expect(await reportAccess(ctx, reports[0])).toMatchObject({ fullReport: false, canDownloadPdf: false });
    expect((await visibleRecommendation(ctx, reports[0]))?.fitNotes).toEqual([]);
    await expect(assertPaidProfileWrite(ctx, userId, { hasPain: "yes", painAreas: ["knee"] }, null)).resolves.toBeUndefined();
  });
  it("preserves legacy report access without granting paid editing rights or another bike's report", async () => {
    vi.stubEnv("PAID_ACCESS_ENFORCED", "true");
    vi.spyOn(Date, "now").mockReturnValue(now);
    const { ctx, reports } = fixture(now);
    reports[0].legacyFullAccess = true;
    expect(await reportAccess(ctx, reports[0])).toMatchObject({ fullReport: true, legacyFullAccess: true, canDownloadPdf: true });
    expect((await visibleRecommendation(ctx, reports[0]))?.fitNotes).toEqual(["Private refinement"]);
    expect((await getUserAccess(ctx, userId)).fullProfile).toBe(false);
    expect((await reportAccess(ctx, reports[1])).fullReport).toBe(false);
    await expect(getUserAccess(ctx, userId, "foreign" as Id<"bikes">)).rejects.toThrow("Bike not found");
  });
  it("keeps flag-OFF behaviour independent of expired grants", async () => {
    vi.stubEnv("PAID_ACCESS_ENFORCED", "false");
    vi.spyOn(Date, "now").mockReturnValue(now);
    const { ctx, reports } = fixture(now);
    const access = await getUserAccess(ctx, userId);
    expect(access).toMatchObject({ enforced: false, fullProfile: true, fullReport: true, maxBikes: null });
    expect(scoreRiderProfile({ profile: completeProfile }, now, access))
      .toEqual(scoreRiderProfile({ profile: completeProfile }, now));
    expect(await visibleRecommendation(ctx, reports[0])).toBe(reports[0]);
    expect((await reportAccess(ctx, reports[0])).canDownloadPdf).toBe(true);
  });
});
