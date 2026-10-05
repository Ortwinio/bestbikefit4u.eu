import { describe, expect, it } from "vitest";
import type { Doc, Id } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";
import { captureSessionProfile } from "../profileSnapshot";

const userId = "snapshot-user" as Id<"users">;
function profile(): Doc<"profiles"> {
  return { _id: "snapshot-profile" as Id<"profiles">, _creationTime: 100,
    userId, heightCm: 190, inseamCm: 89, updatedAt: 100 };
}
function measurement(quality: {
  repeatCount: number; withinTolerance: boolean; unresolvedWarning: boolean;
}): Doc<"profileObservations"> {
  return { _id: "snapshot-inseam" as Id<"profileObservations">, _creationTime: 101,
    userId, field: "inseamCm", value: 89, unit: "cm", kind: "measured",
    method: "single_measurement", source: "profile_edit", recordedAt: 101, status: "current", ...quality };
}
function context(rows: Doc<"profileObservations">[]): Pick<QueryCtx, "db"> {
  const cursor = {
    withIndex: (_name: string, apply: (range: { eq: (field: string, value: unknown) => unknown }) => unknown) => {
      apply({ eq: (field, value) => {
        expect(field).toBe("userId"); expect(value).toBe(userId);
      } });
      return cursor;
    },
    collect: async () => rows,
  };
  return { db: { query: (table: string) => {
    expect(table).toBe("profileObservations"); return cursor;
  } } as unknown as QueryCtx["db"] };
}

describe("session measurement snapshots", () => {
  it.each([
    { repeatCount: 3, withinTolerance: true, unresolvedWarning: false },
    { repeatCount: 3, withinTolerance: false, unresolvedWarning: true },
    { repeatCount: 1, withinTolerance: false, unresolvedWarning: false },
  ])("preserves actual measurement quality: %j", async quality => {
    const observation = measurement(quality);
    const result = await captureSessionProfile(context([observation]), profile());
    expect(result.profileObservationSnapshot.find(item => item.field === "inseamCm"))
      .toEqual({ field: "inseamCm", value: 89, unit: "cm", kind: "measured", method: "single_measurement",
        source: "profile_edit", recordedAt: 101, observationId: observation._id, ...quality });
  });

  it("does not promote a profile default without measurement evidence", async () => {
    const result = await captureSessionProfile(context([]), profile());
    const inseam = result.profileObservationSnapshot.find(item => item.field === "inseamCm");
    expect(inseam).toMatchObject({ value: 89, kind: "estimated", method: "legacy_unknown" });
    expect(inseam).not.toHaveProperty("repeatCount");
    expect(inseam).not.toHaveProperty("withinTolerance");
    expect(inseam).not.toHaveProperty("observationId");
  });

  it("keeps captured evidence unchanged after the live profile and observation change", async () => {
    const liveProfile = profile();
    const observation = measurement({ repeatCount: 3, withinTolerance: true, unresolvedWarning: false });
    const result = await captureSessionProfile(context([observation]), liveProfile);
    liveProfile.inseamCm = 91;
    Object.assign(observation, { value: 91, repeatCount: 1, withinTolerance: false,
      unresolvedWarning: true, status: "superseded" });
    expect(result.profileSnapshot?.inseamCm).toBe(89);
    expect(result.profileObservationSnapshot.find(item => item.field === "inseamCm"))
      .toMatchObject({ value: 89, repeatCount: 3, withinTolerance: true, unresolvedWarning: false });
  });
});
