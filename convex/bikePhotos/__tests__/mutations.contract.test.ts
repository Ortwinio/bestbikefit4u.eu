import { beforeEach, describe, expect, it, vi } from "vitest";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

const { getAuthUserIdMock } = vi.hoisted(() => ({
  getAuthUserIdMock: vi.fn(),
}));

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: getAuthUserIdMock,
}));

import { create, remove, update } from "../mutations";

type BikeRow = {
  _id: string;
  userId: string;
  photoUrl?: string;
  updatedAt: number;
};

type PhotoRow = {
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
  bike,
  photos = [],
}: {
  bike: BikeRow;
  photos?: PhotoRow[];
}) {
  const bikeState = { ...bike };
  const photoState = [...photos];
  let nextPhotoId = photoState.length + 1;

  return {
    bikeState,
    photoState,
    ctx: {
      db: {
        get: vi.fn(async (id: string) => {
          if (id === bikeState._id) {
            return bikeState;
          }
          return photoState.find((photo) => photo._id === id) ?? null;
        }),
        insert: vi.fn(async (table: string, value: Record<string, unknown>) => {
          if (table !== "bikePhotos") {
            throw new Error(`Unexpected insert table ${table}`);
          }
          const id = `photo_${nextPhotoId++}`;
          photoState.push({
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
        }),
        patch: vi.fn(async (id: string, patch: Record<string, unknown>) => {
          if (id === bikeState._id) {
            Object.assign(bikeState, patch);
            return;
          }
          const photo = photoState.find((entry) => entry._id === id);
          if (photo) {
            Object.assign(photo, patch);
            return;
          }
          throw new Error(`Unknown patch target ${id}`);
        }),
        delete: vi.fn(async (id: string) => {
          const index = photoState.findIndex((photo) => photo._id === id);
          if (index >= 0) {
            photoState.splice(index, 1);
          }
        }),
        query: vi.fn((table: string) => {
          if (table !== "bikePhotos") {
            throw new Error(`Unexpected table query ${table}`);
          }
          return {
            withIndex: vi.fn((indexName: string, builder: (query: { eq: (field: string, value: string) => unknown }) => unknown) => {
              if (indexName !== "by_bike") {
                throw new Error(`Unexpected index ${indexName}`);
              }
              builder({
                eq: () => undefined,
              });
              return {
                collect: vi.fn(async () =>
                  photoState.filter((photo) => photo.bikeId === bikeState._id)
                ),
              };
            }),
          };
        }),
      },
      storage: {
        delete: vi.fn(async () => undefined),
      },
    },
  };
}

describe("bike photo mutations contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthUserIdMock.mockResolvedValue("user_1");
  });

  it("migrates a legacy primary photo before adding a new gallery photo", async () => {
    const testCtx = makeCtx({
      bike: {
        _id: "bike_1",
        userId: "user_1",
        photoUrl: "storage_legacy",
        updatedAt: 100,
      },
    });
    const handler = (create as unknown as { _handler: TestHandler })._handler;

    await handler(testCtx.ctx, {
      bikeId: "bike_1",
      storageId: "storage_new",
    });

    expect(testCtx.photoState.map((photo) => photo.storageId)).toEqual([
      "storage_legacy",
      "storage_new",
    ]);
    expect(testCtx.photoState.map((photo) => photo.isPrimary)).toEqual([true, false]);
    expect(testCtx.bikeState.photoUrl).toBe("storage_legacy");
  });

  it("promotes an explicitly primary upload and syncs bike.photoUrl", async () => {
    const testCtx = makeCtx({
      bike: {
        _id: "bike_1",
        userId: "user_1",
        photoUrl: "storage_old",
        updatedAt: 100,
      },
      photos: [
        {
          _id: "photo_1",
          userId: "user_1",
          bikeId: "bike_1",
          storageId: "storage_old",
          isPrimary: true,
          sortOrder: 0,
          createdAt: 90,
          updatedAt: 90,
        },
      ],
    });
    const handler = (create as unknown as { _handler: TestHandler })._handler;

    await handler(testCtx.ctx, {
      bikeId: "bike_1",
      storageId: "storage_new",
      isPrimary: true,
    });

    expect(testCtx.photoState.map((photo) => ({
      storageId: photo.storageId,
      isPrimary: photo.isPrimary,
    }))).toEqual([
      { storageId: "storage_old", isPrimary: false },
      { storageId: "storage_new", isPrimary: true },
    ]);
    expect(testCtx.bikeState.photoUrl).toBe("storage_new");
  });

  it("removes a primary photo and promotes the oldest remaining sibling", async () => {
    const testCtx = makeCtx({
      bike: {
        _id: "bike_1",
        userId: "user_1",
        photoUrl: "storage_primary",
        updatedAt: 100,
      },
      photos: [
        {
          _id: "photo_1",
          userId: "user_1",
          bikeId: "bike_1",
          storageId: "storage_primary",
          isPrimary: true,
          sortOrder: 0,
          createdAt: 90,
          updatedAt: 90,
        },
        {
          _id: "photo_2",
          userId: "user_1",
          bikeId: "bike_1",
          storageId: "storage_next",
          isPrimary: false,
          sortOrder: 1,
          createdAt: 95,
          updatedAt: 95,
        },
      ],
    });
    const handler = (remove as unknown as { _handler: TestHandler })._handler;

    await handler(testCtx.ctx, { photoId: "photo_1" });

    expect(testCtx.photoState).toHaveLength(1);
    expect(testCtx.photoState[0]?.storageId).toBe("storage_next");
    expect(testCtx.photoState[0]?.isPrimary).toBe(true);
    expect(testCtx.bikeState.photoUrl).toBe("storage_next");
  });

  it("updates captions without changing the current primary photo", async () => {
    const testCtx = makeCtx({
      bike: {
        _id: "bike_1",
        userId: "user_1",
        photoUrl: "storage_primary",
        updatedAt: 100,
      },
      photos: [
        {
          _id: "photo_1",
          userId: "user_1",
          bikeId: "bike_1",
          storageId: "storage_primary",
          isPrimary: true,
          sortOrder: 0,
          createdAt: 90,
          updatedAt: 90,
        },
      ],
    });
    const handler = (update as unknown as { _handler: TestHandler })._handler;

    await handler(testCtx.ctx, {
      photoId: "photo_1",
      caption: "Drive side",
    });

    expect(testCtx.photoState[0]?.caption).toBe("Drive side");
    expect(testCtx.photoState[0]?.isPrimary).toBe(true);
    expect(testCtx.bikeState.photoUrl).toBe("storage_primary");
  });
});
