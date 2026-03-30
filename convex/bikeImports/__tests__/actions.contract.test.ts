import { beforeEach, describe, expect, it, vi } from "vitest";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

const { getAuthUserIdMock } = vi.hoisted(() => ({
  getAuthUserIdMock: vi.fn(),
}));

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: getAuthUserIdMock,
}));

import { saveConfirmedImport } from "../actions";
import { beginSave } from "../mutations";

describe("bike import persistence contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthUserIdMock.mockResolvedValue("user_1");
  });

  it("reuses an existing imported bike for the same rider and canonical advert url", async () => {
    const currentImport = {
      _id: "import_current",
      userId: "user_1",
      sourceUrlNormalized: "https://www.marktplaats.nl/v/fietsen/example",
      canonicalUrlNormalized: "https://www.marktplaats.nl/v/fietsen/example-bike",
      parsedAdvert: {
        imageCandidates: [],
      },
      status: "parsed",
      telemetryJson: undefined,
      saveAttemptCount: 0,
    };
    const importedDuplicate = {
      _id: "import_existing",
      userId: "user_1",
      status: "imported",
      createdBikeId: "bike_existing",
    };
    const patches: Array<Record<string, unknown>> = [];
    const handler = (beginSave as unknown as { _handler: TestHandler })._handler;

    const result = (await handler(
      {
        db: {
          get: vi.fn(async (id: string) =>
            id === "import_current" ? currentImport : null
          ),
          query: vi.fn((table: string) => {
            expect(table).toBe("bikeImports");
            return {
              withIndex: vi.fn((indexName: string) => ({
                collect: vi.fn(async () =>
                  indexName === "by_user_canonical_url"
                    ? [currentImport, importedDuplicate]
                    : [currentImport]
                ),
              })),
            };
          }),
          patch: vi.fn(async (_id: string, patch: Record<string, unknown>) => {
            patches.push(patch);
          }),
        },
      },
      {
        userId: "user_1",
        importId: "import_current",
        saveRequest: {
          importId: "import_current",
          name: "Ridley Dean",
          bikeType: "tt_triathlon",
          selectedImageUrls: [],
        },
      }
    )) as { outcome: string; bikeId?: string };

    expect(result).toEqual({
      outcome: "duplicate_reuse",
      bikeId: "bike_existing",
    });
    expect(patches.at(-1)).toMatchObject({
      duplicateBikeId: "bike_existing",
    });
  });

  it("imports the bike even when one remote photo fails", async () => {
    const fetchMock = vi.fn<
      (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
    >();
    const successBlob = new Blob(["image-data"], { type: "image/jpeg" });
    fetchMock
      .mockResolvedValueOnce(
        new Response(successBlob, {
          status: 200,
          headers: {
            "content-type": "image/jpeg",
            "content-length": String(successBlob.size),
          },
        })
      )
      .mockRejectedValueOnce(new Error("network_down"));
    vi.stubGlobal("fetch", fetchMock);

    let saveStep = 0;
    const runMutation = vi.fn(async (_ref: unknown, args: Record<string, unknown>) => {
      if ("importId" in args && "saveRequest" in args && "userId" in args && !("bikeId" in args)) {
        saveStep += 1;
        if (saveStep === 1) {
          return {
            outcome: "proceed",
            sourceUrl: "https://www.marktplaats.nl/v/fietsen/example",
            canonicalUrl: "https://www.marktplaats.nl/v/fietsen/example-bike",
            advertTitle: "Canyon Aeroad CF SLX",
            selectedImages: [
              {
                url: "https://images.marktplaats.com/api/v1/photo-1.jpg",
                normalizedUrl: "https://images.marktplaats.com/api/v1/photo-1.jpg",
                sortOrder: 0,
                selectedByDefault: true,
                caption: "drive side",
              },
              {
                url: "https://images.marktplaats.com/api/v1/photo-2.jpg",
                normalizedUrl: "https://images.marktplaats.com/api/v1/photo-2.jpg",
                sortOrder: 1,
                selectedByDefault: true,
              },
            ],
          };
        }
        return "bike_1";
      }
      return null;
    });

    const handler = (saveConfirmedImport as unknown as { _handler: TestHandler })._handler;

    const result = (await handler(
      {
        runMutation,
        storage: {
          store: vi.fn(async () => "storage_1"),
          delete: vi.fn(async () => undefined),
        },
      },
      {
        saveRequest: {
          importId: "import_1",
          name: "Canyon Aeroad",
          bikeType: "road",
          description: "Fast aero road bike",
          selectedImageUrls: [
            "https://images.marktplaats.com/api/v1/photo-1.jpg",
            "https://images.marktplaats.com/api/v1/photo-2.jpg",
          ],
          primaryImageUrl: "https://images.marktplaats.com/api/v1/photo-1.jpg",
        },
      }
    )) as {
      status: string;
      bikeId: string;
      imageImportedCount: number;
      imageFailedCount: number;
    };

    expect(result).toEqual({
      status: "imported",
      bikeId: "bike_1",
      createdBikeId: "bike_1",
      imageImportedCount: 1,
      imageFailedCount: 1,
    });
    expect(runMutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        importId: "import_1",
        success: true,
        imageUrl: "https://images.marktplaats.com/api/v1/photo-1.jpg",
      })
    );
    expect(runMutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        importId: "import_1",
        success: false,
        imageUrl: expect.stringContaining("photo-2.jpg#network_down"),
      })
    );
    expect(runMutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        importId: "import_1",
        bikeId: "bike_1",
        imageImportedCount: 1,
        imageFailedCount: 1,
      })
    );
  });
});
