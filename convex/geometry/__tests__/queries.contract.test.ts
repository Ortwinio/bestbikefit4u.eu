import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "../../_generated/dataModel";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

const { getAuthUserIdMock } = vi.hoisted(() => ({
  getAuthUserIdMock: vi.fn(),
}));

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: getAuthUserIdMock,
}));

import {
  buildRiderGeometryModelFamilies,
  buildRiderGeometrySizeOptions,
  formatGeometryYearLabel,
  listBrandsForRider,
  listModelsForRiderBrand,
  listSizeRecordsForRiderModel,
} from "../queries";

type FakeBrand = {
  _id: Id<"geometry_brands">;
  name: string;
  slug: string;
};

type FakeModel = {
  _id: Id<"geometry_models">;
  brandId: Id<"geometry_brands">;
  name: string;
  category: "road" | "gravel" | "mtb" | "tt" | "endurance" | "city" | "other";
  yearStart?: number;
  yearEnd?: number;
};

type FakeRecord = {
  _id: Id<"geometry_records">;
  modelId: Id<"geometry_models">;
  brandId: Id<"geometry_brands">;
  sizeLabel: string;
  status: "draft" | "active" | "superseded" | "rejected";
};

const brand1 = "brand_1" as Id<"geometry_brands">;
const brand2 = "brand_2" as Id<"geometry_brands">;
const model1 = "model_1" as Id<"geometry_models">;
const model2 = "model_2" as Id<"geometry_models">;
const model3 = "model_3" as Id<"geometry_models">;
const record1 = "record_1" as Id<"geometry_records">;
const record2 = "record_2" as Id<"geometry_records">;
const record3 = "record_3" as Id<"geometry_records">;
const recordA = "record_a" as Id<"geometry_records">;
const recordB = "record_b" as Id<"geometry_records">;
const recordDraft = "record_draft" as Id<"geometry_records">;

function makeCtx({
  brands = [],
  models = [],
  records = [],
}: {
  brands?: FakeBrand[];
  models?: FakeModel[];
  records?: FakeRecord[];
}) {
  return {
    db: {
      get: vi.fn(async (id: string) => models.find((model) => model._id === id) ?? null),
      query: vi.fn((table: string) => {
        if (table === "geometry_brands") {
          return {
            collect: vi.fn(async () => brands),
          };
        }

        if (table === "geometry_models") {
          return {
            collect: vi.fn(async () => models),
            withIndex: vi.fn(
              (
                indexName: string,
                builder: (query: { eq: (field: string, value: string) => unknown }) => unknown
              ) => {
                if (indexName !== "by_brand") {
                  throw new Error(`Unexpected geometry_models index ${indexName}`);
                }
                let brandId: string | null = null;
                builder({
                  eq: (_field: string, value: string) => {
                    brandId = value;
                    return undefined;
                  },
                });
                return {
                  collect: vi.fn(async () =>
                    models.filter((model) => model.brandId === brandId)
                  ),
                };
              }
            ),
          };
        }

        if (table === "geometry_records") {
          return {
            collect: vi.fn(async () => records),
            withIndex: vi.fn(
              (
                indexName: string,
                builder: (query: { eq: (field: string, value: string) => unknown }) => unknown
              ) => {
                if (indexName !== "by_model") {
                  throw new Error(`Unexpected geometry_records index ${indexName}`);
                }
                let modelId: string | null = null;
                builder({
                  eq: (_field: string, value: string) => {
                    modelId = value;
                    return undefined;
                  },
                });
                return {
                  collect: vi.fn(async () =>
                    records.filter((record) => record.modelId === modelId)
                  ),
                };
              }
            ),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    },
  };
}

describe("rider-safe geometry queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthUserIdMock.mockResolvedValue("user_1");
  });

  it("formats year labels predictably for known and partial year ranges", () => {
    expect(formatGeometryYearLabel(undefined, undefined)).toBeNull();
    expect(formatGeometryYearLabel(2024, 2024)).toBe("2024");
    expect(formatGeometryYearLabel(2023, 2025)).toBe("2023-2025");
    expect(formatGeometryYearLabel(2023, undefined)).toBe("2023+");
    expect(formatGeometryYearLabel(undefined, 2022)).toBe("Until 2022");
  });

  it("builds grouped model families and marks when year selection is required", () => {
    const result = buildRiderGeometryModelFamilies({
      models: [
        {
          _id: model1,
          brandId: brand1,
          name: "Tarmac",
          category: "road",
          yearStart: 2024,
          yearEnd: 2024,
        },
        {
          _id: model2,
          brandId: brand1,
          name: "Tarmac",
          category: "road",
          yearStart: 2022,
          yearEnd: 2023,
        },
        {
          _id: model3,
          brandId: brand1,
          name: "Roubaix",
          category: "endurance",
        },
      ],
      recordsByModelId: new Map([
        [
          String(model1),
          [
            {
              _id: record1,
              brandId: brand1,
              modelId: model1,
              sizeLabel: "56",
              status: "active",
            },
          ],
        ],
        [
          String(model2),
          [
            {
              _id: record2,
              brandId: brand1,
              modelId: model2,
              sizeLabel: "54",
              status: "draft",
            },
          ],
        ],
        [
          String(model3),
          [
            {
              _id: record3,
              brandId: brand1,
              modelId: model3,
              sizeLabel: "58",
              status: "active",
            },
          ],
        ],
      ]),
    });

    expect(result).toEqual([
      {
        modelKey: "roubaix::endurance",
        name: "Roubaix",
        category: "endurance",
        yearSelectionRequired: false,
        variantCount: 1,
        sizeRecordCount: 1,
        hasUsableSizes: true,
        yearOptions: [
          {
            modelId: model3,
            yearStart: null,
            yearEnd: null,
            yearLabel: null,
            sizeRecordCount: 1,
          },
        ],
      },
      {
        modelKey: "tarmac::road",
        name: "Tarmac",
        category: "road",
        yearSelectionRequired: true,
        variantCount: 2,
        sizeRecordCount: 1,
        hasUsableSizes: true,
        yearOptions: [
          {
            modelId: model1,
            yearStart: 2024,
            yearEnd: 2024,
            yearLabel: "2024",
            sizeRecordCount: 1,
          },
          {
            modelId: model2,
            yearStart: 2022,
            yearEnd: 2023,
            yearLabel: "2022-2023",
            sizeRecordCount: 0,
          },
        ],
      },
    ]);
  });

  it("returns sorted active size options only", () => {
    const result = buildRiderGeometrySizeOptions([
      {
        _id: recordB,
        brandId: brand1,
        modelId: model1,
        sizeLabel: "58",
        status: "active",
      },
      {
        _id: recordA,
        brandId: brand1,
        modelId: model1,
        sizeLabel: "54",
        status: "active",
      },
      {
        _id: recordDraft,
        brandId: brand1,
        modelId: model1,
        sizeLabel: "56",
        status: "draft",
      },
    ]);

    expect(result).toEqual([
      { recordId: recordA, sizeLabel: "54" },
      { recordId: recordB, sizeLabel: "58" },
    ]);
  });

  it("lists rider-safe brand summaries with usable-model indicators", async () => {
    const handler = (listBrandsForRider as unknown as { _handler: TestHandler })._handler;
    const ctx = makeCtx({
      brands: [
        { _id: brand1, name: "Canyon", slug: "canyon" },
        { _id: brand2, name: "Ghost", slug: "ghost" },
      ],
      models: [
        { _id: model1, brandId: brand1, name: "Aeroad", category: "road" },
      ],
      records: [
        {
          _id: record1,
          brandId: brand1,
          modelId: model1,
          sizeLabel: "M",
          status: "active",
        },
      ],
    });

    const result = await handler(ctx, {});

    expect(result).toEqual([
      {
        brandId: brand1,
        name: "Canyon",
        slug: "canyon",
        modelCount: 1,
        activeSizeRecordCount: 1,
        hasUsableModels: true,
      },
      {
        brandId: brand2,
        name: "Ghost",
        slug: "ghost",
        modelCount: 0,
        activeSizeRecordCount: 0,
        hasUsableModels: false,
      },
    ]);
  });

  it("lists grouped models for a selected brand and returns null for a missing model size query", async () => {
    const modelsHandler = (listModelsForRiderBrand as unknown as { _handler: TestHandler })
      ._handler;
    const sizesHandler = (listSizeRecordsForRiderModel as unknown as { _handler: TestHandler })
      ._handler;
    const ctx = makeCtx({
      brands: [{ _id: brand1, name: "Specialized", slug: "specialized" }],
      models: [
        {
          _id: model1,
          brandId: brand1,
          name: "Tarmac",
          category: "road",
          yearStart: 2024,
          yearEnd: 2024,
        },
        {
          _id: model2,
          brandId: brand1,
          name: "Tarmac",
          category: "road",
          yearStart: 2022,
          yearEnd: 2023,
        },
      ],
      records: [
        {
          _id: record1,
          brandId: brand1,
          modelId: model1,
          sizeLabel: "54",
          status: "active",
        },
        {
          _id: record2,
          brandId: brand1,
          modelId: model1,
          sizeLabel: "56",
          status: "active",
        },
        {
          _id: record3,
          brandId: brand1,
          modelId: model2,
          sizeLabel: "58",
          status: "rejected",
        },
      ],
    });

    const modelsResult = await modelsHandler(ctx, { brandId: brand1 });
    const sizesResult = await sizesHandler(ctx, { modelId: model1 });
    const missingSizes = await sizesHandler(ctx, {
      modelId: "missing_model" as Id<"geometry_models">,
    });

    expect(modelsResult).toEqual([
      {
        modelKey: "tarmac::road",
        name: "Tarmac",
        category: "road",
        yearSelectionRequired: true,
        variantCount: 2,
        sizeRecordCount: 2,
        hasUsableSizes: true,
        yearOptions: [
          {
            modelId: model1,
            yearStart: 2024,
            yearEnd: 2024,
            yearLabel: "2024",
            sizeRecordCount: 2,
          },
          {
            modelId: model2,
            yearStart: 2022,
            yearEnd: 2023,
            yearLabel: "2022-2023",
            sizeRecordCount: 0,
          },
        ],
      },
    ]);

    expect(sizesResult).toEqual({
      modelId: model1,
      modelName: "Tarmac",
      category: "road",
      yearStart: 2024,
      yearEnd: 2024,
      yearLabel: "2024",
      sizeOptions: [
        { recordId: record1, sizeLabel: "54" },
        { recordId: record2, sizeLabel: "56" },
      ],
    });
    expect(missingSizes).toBeNull();
  });
});
