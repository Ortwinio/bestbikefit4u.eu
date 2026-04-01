import { describe, expect, it } from "vitest";
import {
  applyGeometryRecordSelection,
  applyStandardBrandSelection,
  applyStandardModelFamilySelection,
  applyStandardModelVariantSelection,
  createBikeGeometryFallbackState,
  disableCustomBrandFallback,
  disableCustomModelFallback,
  enableCustomBrandFallback,
  enableCustomModelFallback,
  normalizeBikeGeometryIdentityPayload,
} from "./bikeFormGeometry";

describe("bikeFormGeometry", () => {
  it("starts in standard mode when a geometry link already exists", () => {
    const state = createBikeGeometryFallbackState({
      brand: "Canyon",
      model: "Endurace CF 7",
      geometryRecordId: "record_123",
    });

    expect(state).toMatchObject({
      standardBrandId: undefined,
      standardBrand: "Canyon",
      standardModelId: undefined,
      standardModel: "Endurace CF 7",
      geometryRecordId: "record_123",
      customBrandEnabled: false,
      customModelEnabled: false,
    });
  });

  it("switches from linked geometry to custom brand and clears the stale link", () => {
    const state = enableCustomBrandFallback(
      createBikeGeometryFallbackState({
        brand: "Canyon",
        model: "Endurace CF 7",
        geometryRecordId: "record_123",
      })
    );

    expect(state.geometryRecordId).toBeUndefined();
    expect(state.geometrySizeLabel).toBeUndefined();
    expect(state.standardBrand).toBeUndefined();
    expect(state.standardModel).toBeUndefined();
    expect(state.customBrandEnabled).toBe(true);
    expect(state.customModelEnabled).toBe(true);
    expect(state.customBrand).toBe("Canyon");
  });

  it("switches from linked geometry to custom model while preserving the standard brand only", () => {
    const state = enableCustomModelFallback(
      createBikeGeometryFallbackState({
        brand: "Ridley",
        model: "Dean",
        geometryRecordId: "record_456",
      })
    );

    expect(state.geometryRecordId).toBeUndefined();
    expect(state.geometrySizeLabel).toBeUndefined();
    expect(state.standardBrand).toBe("Ridley");
    expect(state.standardModel).toBeUndefined();
    expect(state.customModelEnabled).toBe(true);
    expect(state.customModel).toBe("Dean");
  });

  it("normalizes custom fallback payloads without geometryRecordId", () => {
    const payload = normalizeBikeGeometryIdentityPayload({
      standardBrand: "Trek",
      standardBrandId: "brand_1",
      standardModelFamilyKey: "domane::road",
      standardModelId: "model_1",
      standardModel: "Domane",
      geometrySizeLabel: "56",
      geometryRecordId: "record_789",
      customBrandEnabled: false,
      customBrand: "",
      customModelEnabled: true,
      customModel: "Checkpoint ALR",
    });

    expect(payload).toEqual({
      brand: "Trek",
      model: "Checkpoint ALR",
      geometryRecordId: undefined,
    });
  });

  it("returns to an unlinked standard-ready state when custom fallback is cleared", () => {
    const customBrandState = disableCustomBrandFallback({
      standardBrand: undefined,
      standardBrandId: undefined,
      standardModel: undefined,
      standardModelFamilyKey: undefined,
      standardModelId: undefined,
      geometrySizeLabel: undefined,
      geometryRecordId: undefined,
      customBrandEnabled: true,
      customBrand: "Custom Brand",
      customModelEnabled: true,
      customModel: "Custom Model",
    });

    const customModelState = disableCustomModelFallback({
      standardBrand: "Giant",
      standardBrandId: "brand_2",
      standardModel: undefined,
      standardModelFamilyKey: undefined,
      standardModelId: undefined,
      geometrySizeLabel: undefined,
      geometryRecordId: undefined,
      customBrandEnabled: false,
      customBrand: "",
      customModelEnabled: true,
      customModel: "Defy Advanced",
    });

    expect(customBrandState).toMatchObject({
      customBrandEnabled: false,
      customModelEnabled: false,
      geometryRecordId: undefined,
    });
    expect(customModelState).toMatchObject({
      standardBrand: "Giant",
      standardBrandId: "brand_2",
      customModelEnabled: false,
      geometryRecordId: undefined,
    });
  });

  it("applies standard brand, model family, variant, and size selections in order", () => {
    const start = createBikeGeometryFallbackState({});
    const withBrand = applyStandardBrandSelection(start, {
      brandId: "brand_1",
      brandName: "Canyon",
    });
    const withFamily = applyStandardModelFamilySelection(withBrand, {
      modelFamilyKey: "endurace::road",
      modelName: "Endurace",
    });
    const withVariant = applyStandardModelVariantSelection(withFamily, {
      modelId: "model_1",
      modelName: "Endurace",
    });
    const withRecord = applyGeometryRecordSelection(withVariant, {
      geometryRecordId: "record_56",
      sizeLabel: "56",
    });

    expect(withRecord).toMatchObject({
      standardBrandId: "brand_1",
      standardBrand: "Canyon",
      standardModelFamilyKey: "endurace::road",
      standardModelId: "model_1",
      standardModel: "Endurace",
      geometryRecordId: "record_56",
      geometrySizeLabel: "56",
    });
  });
});
