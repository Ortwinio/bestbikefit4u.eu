import { beforeEach, describe, expect, it, vi } from "vitest";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

const { getAuthUserIdMock } = vi.hoisted(() => ({
  getAuthUserIdMock: vi.fn(),
}));

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: getAuthUserIdMock,
}));

import {
  createPending,
  markFailed,
  storeParsedAdvert,
  updateDraft,
} from "../mutations";

type BikeImportRow = {
  _id: string;
  userId: string;
  sourceName: "marktplaats";
  sourceUrl: string;
  sourceUrlNormalized: string;
  canonicalUrl?: string;
  canonicalUrlNormalized?: string;
  advertTitle?: string;
  status: "pending_fetch" | "parsed" | "needs_review" | "imported" | "failed";
  parsedAdvert?: Record<string, unknown>;
  draftBike?: Record<string, unknown>;
  failureReason?: string;
  createdBikeId?: string;
  createdAt: number;
  updatedAt: number;
};

function makeCtx(rows: BikeImportRow[] = []) {
  const state = [...rows];
  let nextId = state.length + 1;

  return {
    state,
    ctx: {
      db: {
        get: vi.fn(async (id: string) => state.find((row) => row._id === id) ?? null),
        insert: vi.fn(async (table: string, value: Record<string, unknown>) => {
          if (table !== "bikeImports") {
            throw new Error(`Unexpected insert table ${table}`);
          }
          const id = `import_${nextId++}`;
          state.push({
            _id: id,
            userId: value.userId as string,
            sourceName: value.sourceName as "marktplaats",
            sourceUrl: value.sourceUrl as string,
            sourceUrlNormalized: value.sourceUrlNormalized as string,
            canonicalUrl: value.canonicalUrl as string | undefined,
            canonicalUrlNormalized: value.canonicalUrlNormalized as string | undefined,
            advertTitle: value.advertTitle as string | undefined,
            status: value.status as BikeImportRow["status"],
            parsedAdvert: value.parsedAdvert as Record<string, unknown> | undefined,
            draftBike: value.draftBike as Record<string, unknown> | undefined,
            failureReason: value.failureReason as string | undefined,
            createdBikeId: value.createdBikeId as string | undefined,
            createdAt: value.createdAt as number,
            updatedAt: value.updatedAt as number,
          });
          return id;
        }),
        patch: vi.fn(async (id: string, patch: Record<string, unknown>) => {
          const row = state.find((entry) => entry._id === id);
          if (!row) {
            throw new Error(`Unknown patch target ${id}`);
          }
          Object.assign(row, patch);
        }),
        query: vi.fn((table: string) => {
          if (table !== "bikeImports") {
            throw new Error(`Unexpected table ${table}`);
          }
          return {
            withIndex: vi.fn((indexName: string, builder: (query: { eq: (field: string, value: string) => unknown }) => unknown) => {
              const filters = new Map<string, string>();
              const chain = {
                eq: (field: string, value: string) => {
                  filters.set(field, value);
                  return chain;
                },
              };
              builder({
                eq: chain.eq,
              });

              if (indexName !== "by_user_source_url") {
                throw new Error(`Unexpected index ${indexName}`);
              }

              return {
                unique: vi.fn(async () =>
                  state.find(
                    (row) =>
                      row.userId === filters.get("userId") &&
                      row.sourceName === filters.get("sourceName") &&
                      row.sourceUrlNormalized === filters.get("sourceUrlNormalized")
                  ) ?? null
                ),
              };
            }),
          };
        }),
      },
    },
  };
}

describe("bike import mutation contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthUserIdMock.mockResolvedValue("user_1");
  });

  it("deduplicates a pending import by normalized URL", async () => {
    const testCtx = makeCtx([
      {
        _id: "import_1",
        userId: "user_1",
        sourceName: "marktplaats",
        sourceUrl: "https://www.marktplaats.nl/v/fietsen/m123",
        sourceUrlNormalized: "https://www.marktplaats.nl/v/fietsen/m123",
        status: "pending_fetch",
        createdAt: 100,
        updatedAt: 100,
      },
    ]);
    const handler = (createPending as unknown as { _handler: TestHandler })._handler;

    const result = await handler(testCtx.ctx, {
      sourceUrl: "https://www.marktplaats.nl/v/fietsen/m123/",
    });

    expect(result).toBe("import_1");
    expect(testCtx.state).toHaveLength(1);
  });

  it("stores a parsed advert snapshot, derives a draft, and sets review status", async () => {
    const testCtx = makeCtx([
      {
        _id: "import_1",
        userId: "user_1",
        sourceName: "marktplaats",
        sourceUrl: "https://www.marktplaats.nl/v/fietsen/m123",
        sourceUrlNormalized: "https://www.marktplaats.nl/v/fietsen/m123",
        status: "pending_fetch",
        createdAt: 100,
        updatedAt: 100,
      },
    ]);
    const handler = (storeParsedAdvert as unknown as { _handler: TestHandler })._handler;

    await handler(testCtx.ctx, {
      importId: "import_1",
      parsedAdvert: {
        parserVersion: "marktplaats.v1",
        fetchedAt: 200,
        sourceUrl: "https://www.marktplaats.nl/v/fietsen/m123",
        canonicalUrl: "https://www.marktplaats.nl/v/fietsen/m123-canyon-speedmax",
        advertTitle: "Canyon Speedmax TT maat M",
        description: "Carbon tijdritfiets",
        imageCandidates: [
          {
            url: "https://images.example.com/1.jpg",
            normalizedUrl: "https://images.example.com/1.jpg",
            sortOrder: 0,
            selectedByDefault: true,
          },
        ],
        candidateBrand: { value: "Canyon", confidence: "medium" },
        candidateModel: { value: "Speedmax", confidence: "low" },
        candidateBikeType: { value: "tt_triathlon", confidence: "medium" },
      },
    });

    expect(testCtx.state[0]).toMatchObject({
      canonicalUrl:
        "https://www.marktplaats.nl/v/fietsen/m123-canyon-speedmax",
      canonicalUrlNormalized:
        "https://www.marktplaats.nl/v/fietsen/m123-canyon-speedmax",
      advertTitle: "Canyon Speedmax TT maat M",
      status: "needs_review",
    });
    expect(testCtx.state[0]?.draftBike).toEqual({
      name: "Canyon Speedmax TT maat M",
      description: "Carbon tijdritfiets",
      selectedImageUrls: ["https://images.example.com/1.jpg"],
      primaryImageUrl: "https://images.example.com/1.jpg",
    });
  });

  it("validates draft primary image ownership and marks failures explicitly", async () => {
    const testCtx = makeCtx([
      {
        _id: "import_1",
        userId: "user_1",
        sourceName: "marktplaats",
        sourceUrl: "https://www.marktplaats.nl/v/fietsen/m123",
        sourceUrlNormalized: "https://www.marktplaats.nl/v/fietsen/m123",
        status: "needs_review",
        draftBike: {
          name: "Imported bike draft",
          selectedImageUrls: ["https://images.example.com/1.jpg"],
          primaryImageUrl: "https://images.example.com/1.jpg",
        },
        createdAt: 100,
        updatedAt: 100,
      },
    ]);
    const updateHandler = (updateDraft as unknown as { _handler: TestHandler })._handler;
    const failedHandler = (markFailed as unknown as { _handler: TestHandler })._handler;

    await expect(
      updateHandler(testCtx.ctx, {
        importId: "import_1",
        draftBike: {
          name: "Imported bike draft",
          selectedImageUrls: ["https://images.example.com/1.jpg"],
          primaryImageUrl: "https://images.example.com/2.jpg",
        },
      })
    ).rejects.toThrow("Primary image must be selected");

    await failedHandler(testCtx.ctx, {
      importId: "import_1",
      failureReason: "Remote fetch returned 403",
    });

    expect(testCtx.state[0]?.status).toBe("failed");
    expect(testCtx.state[0]?.failureReason).toBe("Remote fetch returned 403");
  });
});
