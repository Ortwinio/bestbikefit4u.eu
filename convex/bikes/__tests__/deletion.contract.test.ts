import { beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";

const { auth } = vi.hoisted(() => ({ auth: vi.fn() }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: auth }));

import { cascade, DELETE_BATCH_SIZE, preview } from "../deletion";
import { remove } from "../mutations";
import { getDetail } from "../queries";
import { storeShadowComparison } from "../../recommendations/internalMutations";
import { logEmailSent } from "../../emails/lifecycleData";

type Row = Record<string, unknown> & { _id: string; _creationTime: number };
type Handler = { _handler: (ctx: unknown, args: Record<string, unknown>) => Promise<unknown> };
const invoke = (definition: unknown, ctx: unknown, args: Record<string, unknown>) =>
  (definition as Handler)._handler(ctx, args);

function database() {
  const tables = new Map<string, Row[]>();
  const jobs: Record<string, unknown>[] = [];
  let sequence = 0;
  const add = (table: string, fields: Record<string, unknown> = {}) => {
    const row = { _id: `${table}_${++sequence}`, _creationTime: sequence, ...fields } as Row;
    tables.set(table, [...(tables.get(table) ?? []), row]);
    return row;
  };
  const find = (id: string) => [...tables.values()].flat().find((row) => row._id === id) ?? null;
  const reads: number[] = [];
  const db = {
    get: vi.fn(async (id: string) => find(id)),
    delete: vi.fn(async (id: string) => {
      for (const [table, rows] of tables) tables.set(table, rows.filter((row) => row._id !== id));
    }),
    patch: vi.fn(async (id: string, fields: Record<string, unknown>) => Object.assign(find(id)!, fields)),
    query: (table: string) => {
      const matches: [string, unknown][] = [];
      const builder = { eq: (field: string, value: unknown) => { matches.push([field, value]); return builder; } };
      const rows = () => (tables.get(table) ?? []).filter((row) => matches.every(([field, value]) => row[field] === value));
      const query = {
        withIndex: (_name: string, apply: (range: typeof builder) => unknown) => { apply(builder); return query; },
        first: async () => rows()[0] ?? null,
        take: async (count: number) => { reads.push(count); return rows().slice(0, count); },
        paginate: async ({ cursor, numItems }: { cursor: string | null; numItems: number }) => {
          reads.push(numItems);
          const remaining = rows().filter((row) => row._creationTime > Number(cursor ?? 0));
          const page = remaining.slice(0, numItems);
          return {
            page, isDone: remaining.length <= numItems,
            continueCursor: String(page.at(-1)?._creationTime ?? cursor ?? 0),
          };
        },
      };
      return query;
    },
  };
  const ctx = {
    db,
    storage: { delete: vi.fn(async (_id: string) => undefined) },
    scheduler: { runAfter: vi.fn(async (_delay, reference, args) => {
      expect(getFunctionName(reference)).toBe("bikes/deletion:cascade");
      jobs.push(args);
    }) },
  };
  const drain = async () => {
    let iterations = 0;
    while (jobs.length) {
      if (++iterations > 1_000) throw new Error("Cleanup did not finish");
      await invoke(cascade, ctx, jobs.shift()!);
    }
    return iterations;
  };
  return { add, find, tables, ctx, jobs, reads, drain };
}

describe("confirmed bike deletion", () => {
  beforeEach(() => { auth.mockResolvedValue("owner"); });

  it("rejects another owner and an inexact/missing name without deleting or scheduling", async () => {
    const store = database();
    const bike = store.add("bikes", { name: "My bike", userId: "owner" });
    auth.mockResolvedValue("other");
    await expect(invoke(remove, store.ctx, { bikeId: bike._id, confirmName: "My bike" })).rejects.toThrow("Bike not found");
    auth.mockResolvedValue("owner");
    for (const confirmName of [undefined, "", "my bike", "My bike "]) {
      await expect(invoke(remove, store.ctx, { bikeId: bike._id, confirmName })).rejects.toThrow("confirmation");
    }
    expect(store.ctx.db.delete).not.toHaveBeenCalled();
    expect(store.jobs).toHaveLength(0);
  });

  it("returns null after deletion without exposing another owner's bike detail", async () => {
    const store = database();
    const bike = store.add("bikes", { name: "My bike", userId: "owner" });
    auth.mockResolvedValue("other");
    await expect(invoke(getDetail, store.ctx, { bikeId: bike._id })).rejects.toThrow("Bike not found");
    auth.mockResolvedValue("owner");
    await invoke(remove, store.ctx, { bikeId: bike._id, confirmName: "My bike" });
    expect(await invoke(getDetail, store.ctx, { bikeId: bike._id })).toBeNull();
    auth.mockResolvedValue(null);
    await expect(invoke(getDetail, store.ctx, { bikeId: bike._id })).rejects.toThrow("Not authenticated");
  });

  it.each([null, { userId: "other" }])("does not recreate shadow advice or email logs after deletion: %j", async (session) => {
    const ctx = { db: { get: vi.fn(async () => session), insert: vi.fn(), query: vi.fn() } };
    await invoke(storeShadowComparison, ctx, { sessionId: "removed-session", userId: "owner" });
    await invoke(logEmailSent, ctx, { sessionId: "removed-session", userId: "owner", emailType: "results_recap" });
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.query).not.toHaveBeenCalled();
  });

  it("still records session and bike-independent lifecycle messages for a live owner", async () => {
    const ctx = { db: { get: vi.fn(async () => ({ userId: "owner" })), insert: vi.fn() } };
    await invoke(logEmailSent, ctx, { sessionId: "live-session", userId: "owner", emailType: "results_recap" });
    await invoke(logEmailSent, ctx, { userId: "owner", emailType: "welcome" });
    expect(ctx.db.insert).toHaveBeenCalledTimes(2);
  });

  it("counts direct and legacy profile sessions in bounded pages, excluding other bikes/users", async () => {
    const store = database();
    const bike = store.add("bikes", { name: "My bike", userId: "owner" });
    const profile = store.add("bikeProfiles", { bikeId: bike._id });
    const direct = store.add("fitSessions", { bikeId: bike._id, userId: "owner" });
    const legacy = store.add("fitSessions", { bikeProfileId: profile._id, userId: "owner" });
    store.add("fitSessions", { bikeId: "another", userId: "owner" });
    store.add("fitSessions", { bikeId: "another", userId: "other" });
    const result = await invoke(preview, store.ctx, { bikeId: bike._id, paginationOpts: { cursor: null, numItems: 10 } });
    expect(result).toMatchObject({ page: [direct._id, legacy._id], isDone: true });
    auth.mockResolvedValue("other");
    await expect(invoke(preview, store.ctx, { bikeId: bike._id })).rejects.toThrow("Bike not found");
  });

  it("deletes only the deleted bike's observations, retaining rider and other-bike evidence", async () => {
    const store = database();
    const bike = store.add("bikes", { name: "My bike", userId: "owner" });
    const removed = store.add("profileObservations", { bikeId: bike._id, userId: "owner", field: "currentSetup.saddleHeightMm" });
    const rider = store.add("profileObservations", { userId: "owner", field: "inseamCm" });
    const other = store.add("profileObservations", { userId: "owner", bikeId: "other-bike", field: "currentSetup.saddleHeightMm" });
    await invoke(remove, store.ctx, { bikeId: bike._id, confirmName: "My bike" });
    await store.drain();
    expect(store.find(removed._id)).toBeNull();
    expect(store.find(rider._id)).not.toBeNull();
    expect(store.find(other._id)).not.toBeNull();
  });

  it("immediately revokes the bike/passport, then deletes the complete graph in bounded batches", async () => {
    const store = database();
    const bike = store.add("bikes", {
      name: "My bike", userId: "owner", photoUrl: "legacy-storage", publicFitCode: "PUBLIC", bikePassportId: "PASSPORT",
    });
    const otherBike = store.add("bikes", { name: "Keep", userId: "owner", photoUrl: "shared-bike" });
    const otherUserBike = store.add("bikes", { name: "Other user", userId: "other" });
    const rider = store.add("profiles", { userId: "owner" });
    store.add("users", { profile_image_url: "shared-profile" });
    const profile = store.add("bikeProfiles", { bikeId: bike._id, userId: "owner" });
    const session = store.add("fitSessions", { bikeId: bike._id, userId: "owner", profileId: rider._id });
    const legacy = store.add("fitSessions", { bikeProfileId: profile._id, userId: "owner" });
    const keepSession = store.add("fitSessions", { bikeId: otherBike._id, userId: "owner" });
    const sessionTables = [
      "questionnaireResponses", "recommendations", "recommendationShadowComparisons", "validationCaptures",
      "rideFeedbackEntries", "emailReports", "fitPassPurchases", "lifecycleEmailLog",
    ];
    const deleted: string[] = [profile._id, session._id, legacy._id];
    const preserved: Row[] = [otherBike, otherUserBike, rider, keepSession];
    for (const table of sessionTables) {
      for (const parent of [session, legacy]) {
        for (let index = 0; index < DELETE_BATCH_SIZE + 2; index++) {
          deleted.push(store.add(table, { sessionId: parent._id, userId: "owner" })._id);
        }
      }
      preserved.push(store.add(table, { sessionId: keepSession._id, userId: "owner" }));
    }
    for (const parent of [session, legacy]) {
      deleted.push(store.add("reportRateLimits", { identifier: `report:${parent._id}:owner` })._id);
    }
    preserved.push(store.add("reportRateLimits", { identifier: `report:${keepSession._id}:owner` }));
    preserved.push(store.add("lifecycleEmailLog", { userId: "owner", emailType: "welcome" }));
    for (const table of [
      "pressureCalculations", "pressureProfiles", "gearingSessions", "saddleWidthSessions",
      "recommendations", "validationCaptures", "rideFeedbackEntries", "bikeActivities", "calculatorStates",
    ]) {
      for (let index = 0; index < DELETE_BATCH_SIZE + 2; index++) {
        deleted.push(store.add(table, { bikeId: bike._id, userId: "owner" })._id);
      }
      preserved.push(store.add(table, { bikeId: otherBike._id, userId: "owner" }));
      preserved.push(store.add(table, { bikeId: otherUserBike._id, userId: "other" }));
    }
    const wheelset = store.add("wheelsets", { bikeId: bike._id });
    preserved.push(store.add("calculatorStates", { userId: "owner", calculator: "saddle-height" }));
    deleted.push(wheelset._id);
    for (let index = 0; index < DELETE_BATCH_SIZE + 2; index++) {
      deleted.push(store.add("tireSetups", { wheelsetId: wheelset._id })._id);
    }
    const keepWheelset = store.add("wheelsets", { bikeId: otherBike._id });
    preserved.push(keepWheelset, store.add("tireSetups", { wheelsetId: keepWheelset._id }));
    for (const storageId of ["private-photo", "shared-bike", "shared-profile", "shared-photo"]) {
      deleted.push(store.add("bikePhotos", { bikeId: bike._id, storageId })._id);
    }
    preserved.push(store.add("bikePhotos", { bikeId: otherBike._id, storageId: "shared-photo" }));
    deleted.push(store.add("bikeImports", { createdBikeId: bike._id })._id);
    deleted.push(store.add("bikeImports", { duplicateBikeId: bike._id })._id);
    const sharedImport = store.add("bikeImports", { createdBikeId: otherBike._id, duplicateBikeId: bike._id });
    const feedback = store.add("feedback_items", { linkedBikeId: bike._id, linkedSessionId: session._id, title: "Keep discussion" });
    const comment = store.add("feedback_comments", { feedbackItemId: feedback._id, body: "Shared discussion" });
    const linkedProfile = store.add("bikeProfiles", { bikeId: otherBike._id, legacySessionId: session._id });
    const snapshots = structuredClone(preserved);
    await invoke(remove, store.ctx, { bikeId: bike._id, confirmName: "My bike" });
    expect(store.find(bike._id)).toBeNull();
    expect(store.find(session._id)).not.toBeNull();
    expect(store.jobs).toHaveLength(1);
    expect(await store.drain()).toBeGreaterThan(30);
    for (const id of deleted) expect(store.find(id), id).toBeNull();
    for (const row of snapshots) expect(store.find(row._id)).toEqual(row);
    expect(store.find(feedback._id)).toMatchObject({ linkedBikeId: undefined, linkedSessionId: undefined, title: "Keep discussion" });
    expect(store.find(sharedImport._id)).toMatchObject({ createdBikeId: otherBike._id, duplicateBikeId: undefined });
    expect(store.find(linkedProfile._id)).toMatchObject({ bikeId: otherBike._id, legacySessionId: undefined });
    expect(store.find(comment._id)).toEqual(comment);
    expect(store.ctx.storage.delete.mock.calls.map(([id]) => id).sort()).toEqual(["legacy-storage", "private-photo"]);
    expect(Math.max(...store.reads)).toBe(DELETE_BATCH_SIZE);
  });

  it("keeps external images out of managed storage and refuses cleanup while the bike exists", async () => {
    const store = database();
    const bike = store.add("bikes", { userId: "owner", name: "Bike", photoUrl: "https://example.invalid/bike.jpg" });
    await expect(invoke(cascade, store.ctx, { bikeId: bike._id, userId: "owner", stage: 0 })).rejects.toThrow("removed");
    await invoke(remove, store.ctx, { bikeId: bike._id, confirmName: "Bike" });
    await store.drain();
    expect(store.ctx.storage.delete).not.toHaveBeenCalled();
  });
});
