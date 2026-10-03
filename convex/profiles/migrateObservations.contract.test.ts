import { describe, expect, it, vi } from "vitest";
import type { Doc } from "../_generated/dataModel";
import { migrateBikes, migrateProfiles } from "./migrateObservations";
import { legacyRiderObservations, planLegacyObservations } from "../../shared/profileObservationMigration";

type RecordDoc = Record<string, unknown> & { _id: string; _creationTime: number };
type Handler = (ctx: unknown, args: { paginationOpts: { numItems: number; cursor: string | null }; dryRun?: boolean }) => Promise<{
  counts: { documents: number; candidates: number; planned: number; preservedCurrent: number; invalidValues: number };
  continueCursor: string;
  isDone: boolean;
}>;
const profilesHandler = (migrateProfiles as unknown as { _handler: Handler })._handler;
const bikesHandler = (migrateBikes as unknown as { _handler: Handler })._handler;
const options = { paginationOpts: { numItems: 10, cursor: null } };

function context(source: { profiles?: RecordDoc[]; bikes?: RecordDoc[]; observations?: RecordDoc[]; geometry?: RecordDoc[] }) {
  const tables: Record<string, RecordDoc[]> = {
    profiles: structuredClone(source.profiles ?? []), bikes: structuredClone(source.bikes ?? []),
    profileObservations: structuredClone(source.observations ?? []), geometry_records: structuredClone(source.geometry ?? []),
  };
  const pages: unknown[] = [];
  const takes: number[] = [];
  const db = {
    query: vi.fn((table: string) => ({
      paginate: vi.fn(async (pagination: { numItems: number; cursor: string | null }) => {
        pages.push(pagination);
        const start = Number(pagination.cursor ?? 0);
        const page = tables[table].slice(start, start + pagination.numItems);
        return { page, continueCursor: String(start + page.length), isDone: start + page.length >= tables[table].length };
      }),
      withIndex: vi.fn((index: string, build: (range: unknown) => unknown) => {
        expect(table).toBe("profileObservations");
        expect(index).toBe("by_user_field_bike_status");
        const conditions: Array<[string, unknown]> = [];
        const range = { eq: (field: string, value: unknown) => { conditions.push([field, value]); return range; } };
        build(range);
        expect(conditions.map(([field]) => field)).toEqual(["userId", "field", "bikeId", "status"]);
        expect(conditions.at(-1)).toEqual(["status", "current"]);
        return { take: async (count: number) => {
          expect(count).toBe(1);
          takes.push(count);
          return tables[table].filter(row => conditions.every(([field, value]) => row[field] === value)).slice(0, count);
        } };
      }),
    })),
    get: vi.fn(async (id: string) => tables.geometry_records.find(row => row._id === id) ?? null),
    insert: vi.fn(async (table: string, value: Record<string, unknown>) => {
      const id = `insert_${tables[table].length}`;
      tables[table].push({ ...value, _id: id, _creationTime: 9000 });
      return id;
    }),
    patch: vi.fn(), delete: vi.fn(),
  };
  return { db, tables, pages, takes };
}

const profile = { _id: "profile_private", _creationTime: 100, userId: "user_private", updatedAt: 8000,
  heightCm: 175, inseamCm: 81, armLengthCm: 77, torsoLengthCm: 56, shoulderWidthCm: 42 };
const bike = { _id: "bike_private", _creationTime: 200, userId: "user_private", bikeType: "road", updatedAt: 8000 };

describe("legacy observation migration contract", () => {
  it("exposes internal mutations only and defaults to a write-free dry run with identical planned counts", async () => {
    expect((migrateProfiles as unknown as { isInternal: boolean }).isInternal).toBe(true);
    expect((migrateBikes as unknown as { isInternal: boolean }).isInternal).toBe(true);
    const dry = context({ profiles: [profile] });
    const real = context({ profiles: [profile] });
    const preview = await profilesHandler(dry, options);
    expect(preview).toEqual(await profilesHandler(real, { ...options, dryRun: false }));
    expect(preview.counts.planned).toBe(5);
    expect(dry.db.insert).not.toHaveBeenCalled();
    expect(dry.db.patch).not.toHaveBeenCalled();
    expect(dry.db.delete).not.toHaveBeenCalled();
    expect(real.db.insert).toHaveBeenCalledTimes(5);
    expect(real.tables.profiles).toEqual([profile]);
    expect(real.db.patch).not.toHaveBeenCalled();
    expect(real.db.delete).not.toHaveBeenCalled();
  });

  it("exports the exact pure virtual rider drafts, conservatively identifying historical defaults", async () => {
    const before = structuredClone(profile);
    const drafts = legacyRiderObservations(profile as unknown as Doc<"profiles">);
    expect(profile).toEqual(before);
    expect(drafts).toContainEqual(expect.objectContaining({ field: "armLengthCm", kind: "derived", method: "legacy_height_formula" }));
    expect(drafts).toContainEqual(expect.objectContaining({ field: "torsoLengthCm", kind: "derived" }));
    expect(drafts).toContainEqual(expect.objectContaining({ field: "shoulderWidthCm", kind: "estimated", method: "legacy_default" }));
    expect(drafts).toContainEqual(expect.objectContaining({ field: "inseamCm", kind: "estimated", method: "legacy_unknown" }));
    expect(drafts.every(draft => draft.recordedAt === 100 && draft.source === "legacy_migration" && draft.status === "current")).toBe(true);
    const ctx = context({ profiles: [profile] });
    await profilesHandler(ctx, { ...options, dryRun: false });
    expect(ctx.db.insert.mock.calls.map(([, value]) => {
      const { userId: owner, ...draft } = value;
      expect(owner).toBe(profile.userId);
      return draft;
    })).toEqual(drafts);
  });

  it.each(["measured", "derived", "estimated", "declared"])("preserves a current %s observation and is idempotent on rerun", async (kind) => {
    const measured = { _id: "measured", _creationTime: 1, userId: profile.userId,
      field: "armLengthCm", value: 65, kind, status: "current" };
    const ctx = context({ profiles: [profile], observations: [measured] });
    const first = await profilesHandler(ctx, { ...options, dryRun: false });
    expect(first.counts.preservedCurrent).toBe(1);
    expect(ctx.tables.profileObservations[0]).toEqual(measured);
    const second = await profilesHandler(ctx, { ...options, dryRun: false });
    expect(second.counts.planned).toBe(0);
    expect(second.counts.preservedCurrent).toBe(5);
    expect(ctx.db.insert).toHaveBeenCalledTimes(4);
  });

  it("keeps rider and each bike scope separate, including superseded history", async () => {
    const observation = { _id: "existing", _creationTime: 1, userId: bike.userId, field: "bikeType", value: "road", status: "current" };
    const ctx = context({ bikes: [bike, { ...bike, _id: "second" }], observations: [observation,
      { ...observation, _id: "other_user", userId: "another", bikeId: bike._id },
      { ...observation, _id: "old", bikeId: bike._id, status: "superseded" },
      { ...observation, _id: "second_current", bikeId: "second" }] });
    const result = await bikesHandler(ctx, { ...options, dryRun: false });
    expect(result.counts).toMatchObject({ planned: 1, preservedCurrent: 1 });
    expect(ctx.db.insert).toHaveBeenCalledWith("profileObservations", expect.objectContaining({ bikeId: bike._id, field: "bikeType" }));
  });

  it("uses available field timestamps, never generic updatedAt or migration time", () => {
    const observations = legacyRiderObservations({ ...profile, weightKg: 75, weightUpdatedAt: 300,
      ftpWatts: 240, ftpMethod: "20-minute", ftpMeasuredAt: 400, hasPain: "no", riderProfileUpdatedAt: 500,
    } as unknown as Doc<"profiles">);
    expect(observations).toContainEqual(expect.objectContaining({ field: "weightKg", recordedAt: 300 }));
    expect(observations).toContainEqual(expect.objectContaining({ field: "ftpWatts", recordedAt: 400, method: "20-minute", kind: "derived" }));
    expect(observations).toContainEqual(expect.objectContaining({ field: "hasPain", recordedAt: 500, kind: "declared" }));
    expect(observations).toContainEqual(expect.objectContaining({ field: "heightCm", recordedAt: 100 }));
  });

  it("retains string arrays, empty pain areas, numeric gearing arrays and signed setup values", async () => {
    const rider = context({ profiles: [{ ...profile, hasPain: "no", painAreas: [], ridingDisciplines: ["road", "gravel"] }] });
    await profilesHandler(rider, { ...options, dryRun: false });
    expect(rider.db.insert).toHaveBeenCalledWith("profileObservations", expect.objectContaining({ field: "painAreas", value: [] }));
    expect(rider.db.insert).toHaveBeenCalledWith("profileObservations", expect.objectContaining({ field: "ridingDisciplines", value: ["road", "gravel"] }));
    const ctx = context({ bikes: [{ ...bike, gearing: { chainrings: [50, 34], cassetteTeeth: [11, 13, 30], source: "derived", updatedAt: 600 },
      currentSetup: { stemAngle: -6, saddleSetbackMm: 0 } }] });
    const preview = await bikesHandler(ctx, options);
    expect(preview).toEqual(await bikesHandler(ctx, { ...options, dryRun: false }));
    expect(ctx.db.insert).toHaveBeenCalledWith("profileObservations", expect.objectContaining({ field: "gearing.chainrings", value: [50, 34], kind: "derived", recordedAt: 600 }));
    expect(ctx.db.insert).toHaveBeenCalledWith("profileObservations", expect.objectContaining({ field: "currentSetup.stemAngle", value: -6 }));
    expect(ctx.db.insert).toHaveBeenCalledWith("profileObservations", expect.objectContaining({ field: "currentSetup.saddleSetbackMm", value: 0 }));
  });

  it("labels only matching reviewed database geometry as imported, never measured", async () => {
    const ctx = context({ bikes: [{ ...bike, source: "marketplace_import", geometryRecordId: "geometry",
      currentGeometry: { stackMm: 560, reachMm: 390, seatTubeAngle: 73 } }],
    geometry: [{ _id: "geometry", _creationTime: 50, stack: 560, reach: 380, seatTubeAngle: 73, status: "active", source: "manufacturer" }] });
    await bikesHandler(ctx, { ...options, dryRun: false });
    expect(ctx.db.get).toHaveBeenCalledExactlyOnceWith("geometry");
    expect(ctx.db.insert).toHaveBeenCalledWith("profileObservations", expect.objectContaining({ field: "currentGeometry.stackMm", kind: "declared", method: "geometry_database", recordedAt: 200 }));
    expect(ctx.db.insert).toHaveBeenCalledWith("profileObservations", expect.objectContaining({ field: "currentGeometry.reachMm", kind: "estimated", method: "listing_import" }));
    expect(ctx.tables.profileObservations.some(row => row.kind === "measured")).toBe(false);
  });

  it("retains explicit saddle measure-point evidence and its actual timestamp", () => {
    const { observations } = planLegacyObservations("bikes", { ...bike, currentSetup: { saddleHeightMm: 720,
      saddleHeightMeasurement: { measurePoint: "bb_center_to_saddle_top", measuredAt: 123 } } });
    expect(observations).toContainEqual(expect.objectContaining({ field: "currentSetup.saddleHeightMm", kind: "measured", method: "bb_center_to_saddle_top", recordedAt: 123 }));
  });

  it("keeps bike type and riding context inferred from activity explicitly derived", () => {
    const { observations } = planLegacyObservations("bikes", { ...bike, bikeTypeSource: "inferred_from_usage",
      primaryGoal: "performance", activitySummary: { inferredPrimaryGoal: "performance", syncedAt: 700 } });
    expect(observations).toContainEqual(expect.objectContaining({ field: "bikeType", kind: "derived" }));
    expect(observations).toContainEqual(expect.objectContaining({ field: "primaryGoal", kind: "derived", recordedAt: 700 }));
  });

  it.each(["strava", "marketplace_import", "passport_import", "admin_import"])("keeps %s bike geometry estimated without reviewed matching evidence", (source) => {
    const { observations } = planLegacyObservations("bikes", { ...bike, source, currentGeometry: { stackMm: 560 } },
      { stack: 560, status: "draft", source: "manufacturer" });
    expect(observations.find(entry => entry.field === "currentGeometry.stackMm")?.kind).toBe("estimated");
  });

  it("bounds page/current reads and preserves current values despite extensive superseded history", async () => {
    const observations = Array.from({ length: 100 }, (_, index) => ({ _id: `old_${index}`, _creationTime: index,
      userId: profile.userId, field: "inseamCm", status: index === 0 ? "current" : "superseded", kind: "measured" }));
    const ctx = context({ profiles: Array.from({ length: 11 }, (_, index) => ({ ...profile, _id: `profile_${index}` })), observations });
    const result = await profilesHandler(ctx, { paginationOpts: { numItems: 1000, cursor: null } });
    expect(ctx.pages[0]).toMatchObject({ numItems: 10, maximumRowsRead: 10, maximumBytesRead: 1_000_000 });
    expect(ctx.takes.every(count => count === 1)).toBe(true);
    expect(result).toMatchObject({ isDone: false, continueCursor: "10", counts: { documents: 10, planned: 4, preservedCurrent: 46 } });
    expect(ctx.db.insert).not.toHaveBeenCalled();
    const last = await profilesHandler(ctx, { paginationOpts: { numItems: 10, cursor: result.continueCursor } });
    expect(last).toMatchObject({ isDone: true, counts: { documents: 1 } });
  });

  it("migrates despite unrelated current bike/rider history, with matching dry-run counts and no duplicate scopes", async () => {
    const observations = Array.from({ length: 100 }, (_, index) => ({ _id: `old_${index}`, _creationTime: index,
      userId: bike.userId, field: "bikeType", bikeId: index % 2 ? "other" : undefined, status: "current" }));
    const source = { bikes: [bike, { ...bike, _id: "second" }], observations };
    const real = context(source);
    const preview = await bikesHandler(context(source), options);
    expect(preview.counts.planned).toBe(2);
    expect(preview).toEqual(await bikesHandler(real, { ...options, dryRun: false }));
    expect(real.db.insert).toHaveBeenCalledTimes(2);
    expect((await bikesHandler(real, { ...options, dryRun: false })).counts.planned).toBe(0);
    const duplicate = { profiles: [profile, { ...profile, _id: "duplicate" }] };
    expect(await profilesHandler(context(duplicate), options)).toEqual(await profilesHandler(context(duplicate), { ...options, dryRun: false }));
  });

  it("returns only aggregate counts and cursor, with no logging or raw identifiers/values", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const result = await profilesHandler(context({ profiles: [profile] }), options);
      expect(Object.keys(result).sort()).toEqual(["continueCursor", "counts", "isDone"]);
      expect(JSON.stringify(result)).not.toMatch(/user_private|profile_private|inseamCm|legacy_height_formula/);
      expect(log).not.toHaveBeenCalled();
      expect(warn).not.toHaveBeenCalled();
    } finally { log.mockRestore(); warn.mockRestore(); }
  });

  it("skips invalid and absent values without manufacturing defaults", async () => {
    const ctx = context({ profiles: [{ _id: "partial", _creationTime: 100, userId: "owner", inseamCm: 81,
      heightCm: 0, weightKg: Number.NaN, coreStabilityScore: null, painAreas: [1], adminNotes: "private" }] });
    const result = await profilesHandler(ctx, { ...options, dryRun: false });
    expect(result.counts).toMatchObject({ candidates: 1, planned: 1, invalidValues: 3 });
    expect(ctx.db.insert).toHaveBeenCalledExactlyOnceWith("profileObservations", expect.objectContaining({ field: "inseamCm", value: 81 }));
  });

  it("rejects invalid page sizes before any reads", async () => {
    const ctx = context({ profiles: [profile] });
    await expect(profilesHandler(ctx, { paginationOpts: { numItems: 0, cursor: null } })).rejects.toThrow("positive integer");
    expect(ctx.db.query).not.toHaveBeenCalled();
  });
});
