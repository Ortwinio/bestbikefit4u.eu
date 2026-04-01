import { beforeEach, describe, expect, it, vi } from "vitest";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

const { getAuthUserIdMock } = vi.hoisted(() => ({
  getAuthUserIdMock: vi.fn(),
}));

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: getAuthUserIdMock,
}));

import {
  createBikeWithProfiles,
  importByPassport,
} from "../mutations";
import { backfillMissingPassportIds } from "../passport";
import { lookupByPassportId } from "../queries";

type BikeRow = {
  _id: string;
  userId: string;
  name: string;
  bikeType:
    | "road"
    | "gravel"
    | "mountain"
    | "hybrid"
    | "tt_triathlon"
    | "cyclocross"
    | "touring"
    | "city";
  source?: "manual" | "strava" | "admin_import" | "marketplace_import" | "passport_import";
  bikePassportId?: string;
  importedFromBikePassportId?: string;
  currentGeometry?: Record<string, unknown>;
  currentSetup?: Record<string, unknown>;
  discipline?: "road" | "gravel" | "mtb" | "tt";
  ridingStyle?:
    | "recreational"
    | "fitness"
    | "sportive"
    | "racing"
    | "commuting"
    | "touring";
  primaryGoal?: "comfort" | "balanced" | "performance" | "aerodynamics";
  bikeWeightKg?: number;
  photoUrl?: string;
  brand?: string;
  model?: string;
  description?: string;
  descriptionSource?: "manual" | "generated" | "template" | "marketplace_import";
  createdAt: number;
  updatedAt: number;
};

type BikePhotoRow = {
  _id: string;
  userId: string;
  bikeId: string;
  storageId: string;
  caption?: string;
  isPrimary: boolean;
  sortOrder?: number;
  createdAt: number;
  updatedAt: number;
};

function makeCtx({
  bikes = [],
  bikePhotos = [],
}: {
  bikes?: BikeRow[];
  bikePhotos?: BikePhotoRow[];
} = {}) {
  const bikeState = [...bikes];
  const bikePhotoState = [...bikePhotos];
  let nextBikeId = bikeState.length + 1;
  let nextBikeProfileId = 1;
  let nextBikePhotoId = bikePhotoState.length + 1;

  return {
    bikeState,
    bikePhotoState,
    ctx: {
      db: {
        get: vi.fn(async (id: string) => bikeState.find((bike) => bike._id === id) ?? null),
        insert: vi.fn(async (table: string, value: Record<string, unknown>) => {
          if (table === "bikes") {
            const id = `bike_${nextBikeId++}`;
            bikeState.push({
              _id: id,
              userId: value.userId as string,
              name: value.name as BikeRow["name"],
              bikeType: value.bikeType as BikeRow["bikeType"],
              source: value.source as BikeRow["source"],
              bikePassportId: value.bikePassportId as string | undefined,
              importedFromBikePassportId: value.importedFromBikePassportId as string | undefined,
              currentGeometry: value.currentGeometry as Record<string, unknown> | undefined,
              currentSetup: value.currentSetup as Record<string, unknown> | undefined,
              discipline: value.discipline as BikeRow["discipline"],
              ridingStyle: value.ridingStyle as BikeRow["ridingStyle"],
              primaryGoal: value.primaryGoal as BikeRow["primaryGoal"],
              bikeWeightKg: value.bikeWeightKg as number | undefined,
              photoUrl: value.photoUrl as string | undefined,
              brand: value.brand as string | undefined,
              model: value.model as string | undefined,
              description: value.description as string | undefined,
              descriptionSource: value.descriptionSource as BikeRow["descriptionSource"],
              createdAt: value.createdAt as number,
              updatedAt: value.updatedAt as number,
            });
            return id;
          }

          if (table === "bikeProfiles") {
            return `bike_profile_${nextBikeProfileId++}`;
          }

          if (table === "bikePhotos") {
            const id = `bike_photo_${nextBikePhotoId++}`;
            bikePhotoState.push({
              _id: id,
              userId: value.userId as string,
              bikeId: value.bikeId as string,
              storageId: value.storageId as string,
              caption: value.caption as string | undefined,
              isPrimary: value.isPrimary as boolean,
              sortOrder: value.sortOrder as number | undefined,
              createdAt: value.createdAt as number,
              updatedAt: value.updatedAt as number,
            });
            return id;
          }

          throw new Error(`Unexpected insert table ${table}`);
        }),
        patch: vi.fn(async (id: string, patch: Record<string, unknown>) => {
          const bike = bikeState.find((entry) => entry._id === id);
          if (!bike) {
            throw new Error(`Unknown bike ${id}`);
          }
          Object.assign(bike, patch);
        }),
        query: vi.fn((table: string) => {
          if (table === "bikes") {
            return {
              collect: vi.fn(async () => [...bikeState]),
              withIndex: vi.fn(
                (
                  indexName: string,
                  builder: (query: {
                    eq: (field: string, value: string) => unknown;
                  }) => unknown
                ) => {
                  const filters = new Map<string, string>();
                  const chain = {
                    eq: (field: string, value: string) => {
                      filters.set(field, value);
                      return chain;
                    },
                  };
                  builder({ eq: chain.eq });

                  if (indexName === "by_bike_passport_id") {
                    return {
                      unique: vi.fn(async () =>
                        bikeState.find(
                          (bike) => bike.bikePassportId === filters.get("bikePassportId")
                        ) ?? null
                      ),
                    };
                  }

                  if (indexName === "by_user_imported_from_passport") {
                    return {
                      collect: vi.fn(async () =>
                        bikeState.filter(
                          (bike) =>
                            bike.userId === filters.get("userId") &&
                            bike.importedFromBikePassportId ===
                              filters.get("importedFromBikePassportId")
                        )
                      ),
                    };
                  }

                  if (indexName === "by_user") {
                    return {
                      collect: vi.fn(async () =>
                        bikeState.filter((bike) => bike.userId === filters.get("userId"))
                      ),
                    };
                  }

                  throw new Error(`Unexpected bikes index ${indexName}`);
                }
              ),
            };
          }

          if (table === "bikePhotos") {
            return {
              withIndex: vi.fn(
                (
                  indexName: string,
                  builder: (query: {
                    eq: (field: string, value: string) => unknown;
                  }) => unknown
                ) => {
                  const filters = new Map<string, string>();
                  const chain = {
                    eq: (field: string, value: string) => {
                      filters.set(field, value);
                      return chain;
                    },
                  };
                  builder({ eq: chain.eq });

                  if (indexName !== "by_bike") {
                    throw new Error(`Unexpected bikePhotos index ${indexName}`);
                  }

                  return {
                    collect: vi.fn(async () =>
                      bikePhotoState.filter(
                        (photo) => photo.bikeId === filters.get("bikeId")
                      )
                    ),
                  };
                }
              ),
            };
          }

          throw new Error(`Unexpected query table ${table}`);
        }),
      },
    },
  };
}

describe("bike passport contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthUserIdMock.mockResolvedValue("user_target");
  });

  it("assigns a formatted passport id to newly created bikes", async () => {
    const testCtx = makeCtx();

    const bikeId = await createBikeWithProfiles(testCtx.ctx as never, {
      userId: "user_target" as never,
      name: "Ridley Noah",
      bikeType: "road",
      source: "manual",
    });

    const bike = testCtx.bikeState.find((entry) => entry._id === bikeId);
    expect(bike?.bikePassportId).toMatch(/^BBF-[A-F0-9]{4}-[A-F0-9]{4}$/);
  });

  it("returns a ready preview for another rider's passport bike", async () => {
    const handler = (lookupByPassportId as unknown as { _handler: TestHandler })._handler;
    const testCtx = makeCtx({
      bikes: [{
        _id: "bike_source",
        userId: "user_source",
        name: "Canyon Aeroad",
        bikeType: "road",
        bikePassportId: "BBF-A1B2-C3D4",
        photoUrl: "https://images.example.com/legacy.jpg",
        brand: "Canyon",
        model: "Aeroad",
        description: "Fast aero road bike",
        createdAt: 100,
        updatedAt: 100,
      }],
      bikePhotos: [
        {
          _id: "photo_1",
          userId: "user_source",
          bikeId: "bike_source",
          storageId: "storage_clean_1",
          caption: "Drive side",
          isPrimary: true,
          sortOrder: 0,
          createdAt: 100,
          updatedAt: 100,
        },
        {
          _id: "photo_2",
          userId: "user_source",
          bikeId: "bike_source",
          storageId: "https://images.example.com/not-copyable.jpg",
          caption: "Remote preview",
          isPrimary: false,
          sortOrder: 1,
          createdAt: 100,
          updatedAt: 100,
        },
      ],
    });

    const result = await handler(testCtx.ctx, { bikePassportId: "bbf-a1b2-c3d4" }) as {
      status: string;
      bikePassportId: string;
      copyIncludesPhotos: boolean;
      existingBikeId: string | null;
      bike: { name: string; brand: string; photoUrl: string | null };
      photos: Array<{ storageId: string }>;
    };

    expect(result).toMatchObject({
      status: "available",
      bikePassportId: "BBF-A1B2-C3D4",
      existingBikeId: null,
      copyIncludesPhotos: true,
      bike: {
        name: "Canyon Aeroad",
        brand: "Canyon",
        photoUrl: "storage_clean_1",
      },
      photos: [{ storageId: "storage_clean_1" }],
    });
  });

  it("rejects importing your own passport bike", async () => {
    const handler = (importByPassport as unknown as { _handler: TestHandler })._handler;
    const testCtx = makeCtx({
      bikes: [{
        _id: "bike_source",
        userId: "user_target",
        name: "My Bike",
        bikeType: "road",
        bikePassportId: "BBF-A1B2-C3D4",
        createdAt: 100,
        updatedAt: 100,
      }],
    });

    await expect(
      handler(testCtx.ctx, { bikePassportId: "BBF-A1B2-C3D4" })
    ).rejects.toThrow("bike_passport_owned_by_user");
  });

  it("creates one editable copied bike and reuses it on duplicate import", async () => {
    const handler = (importByPassport as unknown as { _handler: TestHandler })._handler;
    const testCtx = makeCtx({
      bikes: [{
        _id: "bike_source",
        userId: "user_source",
        name: "Ridley Dean",
        bikeType: "tt_triathlon",
        bikePassportId: "BBF-AB12-CD34",
        photoUrl: "storage_clean_primary",
        brand: "Ridley",
        model: "Dean",
        description: "TT setup",
        createdAt: 100,
        updatedAt: 100,
      }],
      bikePhotos: [
        {
          _id: "photo_1",
          userId: "user_source",
          bikeId: "bike_source",
          storageId: "storage_clean_primary",
          caption: "Profile",
          isPrimary: true,
          sortOrder: 0,
          createdAt: 100,
          updatedAt: 100,
        },
        {
          _id: "photo_2",
          userId: "user_source",
          bikeId: "bike_source",
          storageId: "https://images.example.com/not-copyable.jpg",
          caption: "Remote image",
          isPrimary: false,
          sortOrder: 1,
          createdAt: 100,
          updatedAt: 100,
        },
      ],
    });

    const first = await handler(testCtx.ctx, {
      bikePassportId: "BBF-AB12-CD34",
      name: "My Dean",
      description: "Copied draft",
    }) as { status: string; bikeId: string; createdBikeId: string; copiedPhotoCount: number };

    expect(first).toMatchObject({
      status: "imported",
      bikeId: "bike_2",
      createdBikeId: "bike_2",
      copiedPhotoCount: 1,
    });

    const importedBike = testCtx.bikeState.find((bike) => bike._id === "bike_2");
    expect(importedBike).toMatchObject({
      userId: "user_target",
      source: "passport_import",
      name: "My Dean",
      importedFromBikePassportId: "BBF-AB12-CD34",
      photoUrl: "storage_clean_primary",
      description: "Copied draft",
      descriptionSource: "template",
    });
    expect(importedBike?.bikePassportId).toMatch(/^BBF-[A-F0-9]{4}-[A-F0-9]{4}$/);
    expect(importedBike?.bikePassportId).not.toBe("BBF-AB12-CD34");

    expect(
      testCtx.bikePhotoState.filter((photo) => photo.bikeId === "bike_2")
    ).toEqual([
      expect.objectContaining({
        userId: "user_target",
        bikeId: "bike_2",
        storageId: "storage_clean_primary",
        caption: "Profile",
        isPrimary: true,
      }),
    ]);

    const second = await handler(testCtx.ctx, {
      bikePassportId: "BBF-AB12-CD34",
    }) as { status: string; bikeId: string; createdBikeId: string };

    expect(second).toMatchObject({
      status: "duplicate_reused",
      bikeId: "bike_2",
      createdBikeId: "bike_2",
    });
  });

  it("backfills passport ids for existing bikes without one", async () => {
    const handler = (backfillMissingPassportIds as unknown as { _handler: TestHandler })._handler;
    const testCtx = makeCtx({
      bikes: [
        {
          _id: "bike_legacy_1",
          userId: "user_source",
          name: "Legacy One",
          bikeType: "road",
          createdAt: 100,
          updatedAt: 100,
        },
        {
          _id: "bike_legacy_2",
          userId: "user_source",
          name: "Legacy Two",
          bikeType: "gravel",
          bikePassportId: "BBF-AB12-CD34",
          createdAt: 101,
          updatedAt: 101,
        },
        {
          _id: "bike_legacy_3",
          userId: "user_source",
          name: "Legacy Three",
          bikeType: "tt_triathlon",
          createdAt: 102,
          updatedAt: 102,
        },
      ],
    });

    const result = await handler(testCtx.ctx, { limit: 10 }) as {
      scanned: number;
      updated: number;
      remaining: number;
    };

    expect(result).toEqual({
      scanned: 3,
      updated: 2,
      remaining: 0,
    });
    expect(testCtx.bikeState.find((bike) => bike._id === "bike_legacy_1")?.bikePassportId).toMatch(
      /^BBF-[A-F0-9]{4}-[A-F0-9]{4}$/
    );
    expect(testCtx.bikeState.find((bike) => bike._id === "bike_legacy_3")?.bikePassportId).toMatch(
      /^BBF-[A-F0-9]{4}-[A-F0-9]{4}$/
    );
    expect(testCtx.bikeState.find((bike) => bike._id === "bike_legacy_2")?.bikePassportId).toBe(
      "BBF-AB12-CD34"
    );
  });
});
