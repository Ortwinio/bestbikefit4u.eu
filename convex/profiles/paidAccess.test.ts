import { afterEach, describe, expect, it, vi } from "vitest";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { assertPaidProfileWrite, PAID_PROFILE_FIELDS } from "./paidAccess";
import { validateProfileObservationValue } from "../../shared/profileObservationFields";

const access = vi.hoisted(() => ({ fullProfile: false }));
vi.mock("../pricing/access", () => ({ getUserAccess: vi.fn(async () => access) }));
const ctx = {} as MutationCtx;
const userId = "owner" as Id<"users">;
afterEach(() => { vi.unstubAllEnvs(); access.fullProfile = false; });

describe("paid profile write boundary", () => {
  it.each(PAID_PROFILE_FIELDS)("refuses new or changed %s and provenance reconfirmation", async field => {
    vi.stubEnv("PAID_ACCESS_ENFORCED", "true");
    const previous = { [field]: 10 } as unknown as Doc<"profiles">;
    await expect(assertPaidProfileWrite(ctx, userId, { [field]: 11 }, previous)).rejects.toThrow("PAID_PROFILE_ACCESS_REQUIRED");
    await expect(assertPaidProfileWrite(ctx, userId, { [field]: 10 }, null)).rejects.toThrow("PAID_PROFILE_ACCESS_REQUIRED");
    await expect(assertPaidProfileWrite(ctx, userId, { [field]: 10 }, previous, true)).rejects.toThrow("PAID_PROFILE_ACCESS_REQUIRED");
    await expect(assertPaidProfileWrite(ctx, userId, { [field]: 10 }, previous)).resolves.toBeUndefined();
    await expect(assertPaidProfileWrite(ctx, userId, { [field]: undefined }, previous)).resolves.toBeUndefined();
  });

  it("preserves unrestricted behaviour off and allows active profile access on", async () => {
    vi.stubEnv("PAID_ACCESS_ENFORCED", "false");
    await expect(assertPaidProfileWrite(ctx, userId, { femurLengthCm: 40 }, null)).resolves.toBeUndefined();
    vi.stubEnv("PAID_ACCESS_ENFORCED", "true");
    access.fullProfile = true;
    await expect(assertPaidProfileWrite(ctx, userId, { femurLengthCm: 40 }, null)).resolves.toBeUndefined();
  });

  it("never locks self-assessment or complaint fields", async () => {
    vi.stubEnv("PAID_ACCESS_ENFORCED", "true");
    await expect(assertPaidProfileWrite(ctx, userId, { flexibilityScore: "good", coreStabilityScore: 4,
      hasPain: "yes", painAreas: ["knee"], painSeverity: 2 }, null, true)).resolves.toBeUndefined();
  });

  it.each([["flexibilityTestCm", -20, 20], ["coreTestSeconds", 0, 180]] as const)("validates %s board limits", (field, min, max) => {
    for (const value of [min, 0, max]) expect(validateProfileObservationValue(field, value)).toBe(value);
    for (const value of [min - 1, max + 1, Infinity, NaN]) expect(() => validateProfileObservationValue(field, value)).toThrow();
  });
});
