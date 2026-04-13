import { v } from "convex/values";
import { query } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { requireUserId } from "../lib/authz";

const SIZE_LABEL_COLLATOR = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

type GeometryModelDoc = Doc<"geometry_models">;
type GeometryRecordDoc = Doc<"geometry_records">;
type GeometryModelLike = Pick<
  GeometryModelDoc,
  "_id" | "brandId" | "name" | "category" | "yearStart" | "yearEnd"
>;
type GeometryRecordLike = Pick<
  GeometryRecordDoc,
  "_id" | "brandId" | "modelId" | "sizeLabel" | "status"
>;
type RiderGeometrySizeOption = {
  recordId: Id<"geometry_records">;
  sizeLabel: string;
};

type RiderGeometryYearOption = {
  modelId: Id<"geometry_models">;
  yearStart: number | null;
  yearEnd: number | null;
  yearLabel: string | null;
  sizeRecordCount: number;
};

function normalizeYear(year?: number) {
  return typeof year === "number" ? year : null;
}

export function formatGeometryYearLabel(yearStart?: number, yearEnd?: number) {
  const start = normalizeYear(yearStart);
  const end = normalizeYear(yearEnd);

  if (start === null && end === null) {
    return null;
  }
  if (start !== null && end !== null && start === end) {
    return String(start);
  }
  if (start !== null && end !== null) {
    return `${start}-${end}`;
  }
  if (start !== null) {
    return `${start}+`;
  }
  return `Until ${end}`;
}

function countActiveRecords(records: GeometryRecordLike[]) {
  return records.filter((record) => record.status === "active").length;
}

function buildModelFamilyKey(model: GeometryModelLike) {
  return `${model.name.trim().toLowerCase()}::${model.category}`;
}

export function buildRiderGeometryModelFamilies({
  models,
  recordsByModelId,
}: {
  models: GeometryModelLike[];
  recordsByModelId: Map<string, GeometryRecordLike[]>;
}) {
  const byKey = new Map<
    string,
    {
      key: string;
      name: string;
      category: GeometryModelLike["category"];
      yearOptions: RiderGeometryYearOption[];
      totalSizeRecordCount: number;
      hasUsableSizes: boolean;
    }
  >();

  for (const model of models) {
    const modelId = String(model._id);
    const activeRecordCount = countActiveRecords(recordsByModelId.get(modelId) ?? []);
    const key = buildModelFamilyKey(model);
    const existing = byKey.get(key);
    const yearOption: RiderGeometryYearOption = {
      modelId: model._id,
      yearStart: normalizeYear(model.yearStart),
      yearEnd: normalizeYear(model.yearEnd),
      yearLabel: formatGeometryYearLabel(model.yearStart, model.yearEnd),
      sizeRecordCount: activeRecordCount,
    };

    if (existing) {
      existing.yearOptions.push(yearOption);
      existing.totalSizeRecordCount += activeRecordCount;
      existing.hasUsableSizes ||= activeRecordCount > 0;
      continue;
    }

    byKey.set(key, {
      key,
      name: model.name,
      category: model.category,
      yearOptions: [yearOption],
      totalSizeRecordCount: activeRecordCount,
      hasUsableSizes: activeRecordCount > 0,
    });
  }

  return [...byKey.values()]
    .map((family) => {
      const yearOptions = [...family.yearOptions].sort((left, right) => {
        const leftStart = left.yearStart ?? Number.MIN_SAFE_INTEGER;
        const rightStart = right.yearStart ?? Number.MIN_SAFE_INTEGER;
        if (leftStart !== rightStart) {
          return rightStart - leftStart;
        }
        const leftEnd = left.yearEnd ?? Number.MIN_SAFE_INTEGER;
        const rightEnd = right.yearEnd ?? Number.MIN_SAFE_INTEGER;
        if (leftEnd !== rightEnd) {
          return rightEnd - leftEnd;
        }
        return String(left.modelId).localeCompare(String(right.modelId));
      });

      return {
        modelKey: family.key,
        name: family.name,
        category: family.category,
        yearSelectionRequired: yearOptions.length > 1,
        variantCount: yearOptions.length,
        sizeRecordCount: family.totalSizeRecordCount,
        hasUsableSizes: family.hasUsableSizes,
        yearOptions,
      };
    })
    .sort((left, right) => {
      const nameSort = left.name.localeCompare(right.name, undefined, {
        sensitivity: "base",
      });
      if (nameSort !== 0) {
        return nameSort;
      }
      return left.category.localeCompare(right.category);
    });
}

export function buildRiderGeometrySizeOptions(
  records: GeometryRecordLike[]
): RiderGeometrySizeOption[] {
  return records
    .filter((record) => record.status === "active")
    .sort((left, right) => SIZE_LABEL_COLLATOR.compare(left.sizeLabel, right.sizeLabel))
    .map((record) => ({
      recordId: record._id,
      sizeLabel: record.sizeLabel,
    }));
}

export const listBrandsForRider = query({
  args: {},
  handler: async (ctx) => {
    await requireUserId(ctx);

    const [brands, models, records] = await Promise.all([
      ctx.db.query("geometry_brands").collect(),
      ctx.db.query("geometry_models").collect(),
      ctx.db.query("geometry_records").collect(),
    ]);

    return brands
      .map((brand) => {
        const brandModels = models.filter((model) => model.brandId === brand._id);
        const modelIds = new Set(brandModels.map((model) => String(model._id)));
        const activeRecordCount = records.filter(
          (record) =>
            record.status === "active" && modelIds.has(String(record.modelId))
        ).length;

        return {
          brandId: brand._id,
          name: brand.name,
          slug: brand.slug,
          modelCount: brandModels.length,
          activeSizeRecordCount: activeRecordCount,
          hasUsableModels:
            brandModels.length > 0 && activeRecordCount > 0,
        };
      })
      .sort((left, right) =>
        left.name.localeCompare(right.name, undefined, { sensitivity: "base" })
      );
  },
});

export const listModelsForRiderBrand = query({
  args: { brandId: v.id("geometry_brands") },
  handler: async (ctx, args) => {
    await requireUserId(ctx);

    const models = await ctx.db
      .query("geometry_models")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();

    const recordsByModelId = new Map<string, GeometryRecordDoc[]>();
    await Promise.all(
      models.map(async (model) => {
        const records = await ctx.db
          .query("geometry_records")
          .withIndex("by_model", (q) => q.eq("modelId", model._id))
          .collect();
        recordsByModelId.set(String(model._id), records);
      })
    );

    return buildRiderGeometryModelFamilies({ models, recordsByModelId });
  },
});

export const listSizeRecordsForRiderModel = query({
  args: { modelId: v.id("geometry_models") },
  handler: async (ctx, args) => {
    await requireUserId(ctx);

    const [model, records] = await Promise.all([
      ctx.db.get(args.modelId),
      ctx.db
        .query("geometry_records")
        .withIndex("by_model", (q) => q.eq("modelId", args.modelId))
        .collect(),
    ]);

    if (!model) {
      return null;
    }

    return {
      modelId: model._id,
      modelName: model.name,
      category: model.category,
      yearStart: normalizeYear(model.yearStart),
      yearEnd: normalizeYear(model.yearEnd),
      yearLabel: formatGeometryYearLabel(model.yearStart, model.yearEnd),
      sizeOptions: buildRiderGeometrySizeOptions(records),
    };
  },
});

export const getGeometryRecordPreview = query({
  args: { recordId: v.id("geometry_records") },
  handler: async (ctx, args) => {
    await requireUserId(ctx);

    const record = await ctx.db.get(args.recordId);
    if (!record || record.status !== "active") {
      return null;
    }

    return {
      recordId: record._id,
      sizeLabel: record.sizeLabel,
      stackMm: record.stack ?? null,
      reachMm: record.reach ?? null,
      seatTubeAngle: record.seatTubeAngle ?? null,
      headTubeAngle: record.headTubeAngle ?? null,
    };
  },
});

export const getGeometryRecordSelectionForRider = query({
  args: { recordId: v.id("geometry_records") },
  handler: async (ctx, args) => {
    await requireUserId(ctx);

    const record = await ctx.db.get(args.recordId);
    if (!record || record.status !== "active") {
      return null;
    }

    const [brand, model] = await Promise.all([
      ctx.db.get(record.brandId),
      ctx.db.get(record.modelId),
    ]);

    if (!brand || !model) {
      return null;
    }

    return {
      recordId: record._id,
      brandId: brand._id,
      brandName: brand.name,
      modelFamilyKey: buildModelFamilyKey(model),
      modelId: model._id,
      modelName: model.name,
      yearLabel: formatGeometryYearLabel(model.yearStart, model.yearEnd),
      sizeLabel: record.sizeLabel,
    };
  },
});
