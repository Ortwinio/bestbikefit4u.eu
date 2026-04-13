export type BikeGeometryFallbackState = {
  standardBrandId?: string;
  standardBrand?: string;
  standardModelFamilyKey?: string;
  standardModelId?: string;
  standardModel?: string;
  geometrySizeLabel?: string;
  geometryRecordId?: string;
  customBrandEnabled: boolean;
  customBrand: string;
  customModelEnabled: boolean;
  customModel: string;
};

type BikeGeometryFallbackInitial = {
  brandId?: string | null;
  brand?: string;
  modelFamilyKey?: string | null;
  modelId?: string | null;
  model?: string;
  geometrySizeLabel?: string | null;
  geometryRecordId?: string | null;
};

type BikeGeometryIdentityPayload = {
  brand?: string;
  model?: string;
  geometryRecordId?: string;
};

type StandardGeometrySelectionPayload = {
  brandId?: string | null;
  brandName?: string | null;
  modelFamilyKey?: string | null;
  modelId?: string | null;
  modelName?: string | null;
  geometryRecordId?: string | null;
  sizeLabel?: string | null;
};

function normalizeOptionalText(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export function createBikeGeometryFallbackState(
  initial: BikeGeometryFallbackInitial
): BikeGeometryFallbackState {
  const brandId = normalizeOptionalText(initial.brandId);
  const geometryRecordId = normalizeOptionalText(initial.geometryRecordId);
  const modelFamilyKey = normalizeOptionalText(initial.modelFamilyKey);
  const modelId = normalizeOptionalText(initial.modelId);
  const brand = normalizeOptionalText(initial.brand);
  const geometrySizeLabel = normalizeOptionalText(initial.geometrySizeLabel);
  const model = normalizeOptionalText(initial.model);

  if (geometryRecordId) {
    return {
      standardBrandId: brandId,
      standardBrand: brand,
      standardModelFamilyKey: modelFamilyKey,
      standardModelId: modelId,
      standardModel: model,
      geometrySizeLabel,
      geometryRecordId,
      customBrandEnabled: false,
      customBrand: "",
      customModelEnabled: false,
      customModel: "",
    };
  }

  if (brand || model) {
    return {
      standardBrandId: brandId,
      standardBrand: brand,
      standardModelFamilyKey: modelFamilyKey,
      standardModelId: modelId,
      standardModel: model,
      geometrySizeLabel,
      geometryRecordId: undefined,
      customBrandEnabled: false,
      customBrand: "",
      customModelEnabled: false,
      customModel: "",
    };
  }

  return {
    standardBrandId: undefined,
    standardBrand: undefined,
    standardModelFamilyKey: undefined,
    standardModelId: undefined,
    standardModel: undefined,
    geometrySizeLabel: undefined,
    geometryRecordId: undefined,
    customBrandEnabled: Boolean(brand),
    customBrand: brand ?? "",
    customModelEnabled: Boolean(model),
    customModel: model ?? "",
  };
}

export function enableCustomBrandFallback(
  state: BikeGeometryFallbackState
): BikeGeometryFallbackState {
  return {
    standardBrandId: undefined,
    standardBrand: undefined,
    standardModelFamilyKey: undefined,
    standardModelId: undefined,
    standardModel: undefined,
    geometrySizeLabel: undefined,
    geometryRecordId: undefined,
    customBrandEnabled: true,
    customBrand: state.customBrand || state.standardBrand || "",
    customModelEnabled: true,
    customModel: state.customModel || "",
  };
}

export function disableCustomBrandFallback(
  state: BikeGeometryFallbackState
): BikeGeometryFallbackState {
  return {
    ...state,
    standardBrandId: undefined,
    standardBrand: undefined,
    standardModelFamilyKey: undefined,
    standardModelId: undefined,
    standardModel: undefined,
    geometrySizeLabel: undefined,
    geometryRecordId: undefined,
    customBrandEnabled: false,
    customBrand: "",
    customModelEnabled: false,
    customModel: "",
  };
}

export function enableCustomModelFallback(
  state: BikeGeometryFallbackState
): BikeGeometryFallbackState {
  return {
    ...state,
    standardModelFamilyKey: undefined,
    standardModelId: undefined,
    standardModel: undefined,
    geometrySizeLabel: undefined,
    geometryRecordId: undefined,
    customModelEnabled: true,
    customModel: state.customModel || state.standardModel || "",
  };
}

export function disableCustomModelFallback(
  state: BikeGeometryFallbackState
): BikeGeometryFallbackState {
  return {
    ...state,
    standardModelFamilyKey: undefined,
    standardModelId: undefined,
    standardModel: undefined,
    geometrySizeLabel: undefined,
    geometryRecordId: undefined,
    customModelEnabled: false,
    customModel: "",
  };
}

export function applyStandardBrandSelection(
  state: BikeGeometryFallbackState,
  input: { brandId?: string | null; brandName?: string | null }
): BikeGeometryFallbackState {
  return {
    ...state,
    standardBrandId: normalizeOptionalText(input.brandId),
    standardBrand: normalizeOptionalText(input.brandName),
    standardModelFamilyKey: undefined,
    standardModelId: undefined,
    standardModel: undefined,
    geometrySizeLabel: undefined,
    geometryRecordId: undefined,
    customBrandEnabled: false,
    customBrand: "",
    customModelEnabled: false,
    customModel: "",
  };
}

export function applyStandardModelFamilySelection(
  state: BikeGeometryFallbackState,
  input: { modelFamilyKey?: string | null; modelName?: string | null }
): BikeGeometryFallbackState {
  return {
    ...state,
    standardModelFamilyKey: normalizeOptionalText(input.modelFamilyKey),
    standardModelId: undefined,
    standardModel: normalizeOptionalText(input.modelName),
    geometrySizeLabel: undefined,
    geometryRecordId: undefined,
    customModelEnabled: false,
    customModel: "",
  };
}

export function applyStandardModelVariantSelection(
  state: BikeGeometryFallbackState,
  input: { modelId?: string | null; modelName?: string | null }
): BikeGeometryFallbackState {
  return {
    ...state,
    standardModelId: normalizeOptionalText(input.modelId),
    standardModel: normalizeOptionalText(input.modelName) ?? state.standardModel,
    geometrySizeLabel: undefined,
    geometryRecordId: undefined,
    customModelEnabled: false,
    customModel: "",
  };
}

export function applyGeometryRecordSelection(
  state: BikeGeometryFallbackState,
  input: { geometryRecordId?: string | null; sizeLabel?: string | null }
): BikeGeometryFallbackState {
  return {
    ...state,
    geometryRecordId: normalizeOptionalText(input.geometryRecordId),
    geometrySizeLabel: normalizeOptionalText(input.sizeLabel),
    customModelEnabled: false,
    customModel: "",
  };
}

export function applyStandardGeometrySelection(
  state: BikeGeometryFallbackState,
  input: StandardGeometrySelectionPayload
): BikeGeometryFallbackState {
  return {
    ...state,
    standardBrandId: normalizeOptionalText(input.brandId),
    standardBrand: normalizeOptionalText(input.brandName),
    standardModelFamilyKey: normalizeOptionalText(input.modelFamilyKey),
    standardModelId: normalizeOptionalText(input.modelId),
    standardModel: normalizeOptionalText(input.modelName),
    geometrySizeLabel: normalizeOptionalText(input.sizeLabel),
    geometryRecordId: normalizeOptionalText(input.geometryRecordId),
    customBrandEnabled: false,
    customBrand: "",
    customModelEnabled: false,
    customModel: "",
  };
}

export function normalizeBikeGeometryIdentityPayload(
  state: BikeGeometryFallbackState
): BikeGeometryIdentityPayload {
  if (state.customBrandEnabled) {
    return {
      brand: normalizeOptionalText(state.customBrand),
      model: normalizeOptionalText(state.customModel),
      geometryRecordId: undefined,
    };
  }

  if (state.customModelEnabled) {
    return {
      brand: normalizeOptionalText(state.standardBrand),
      model: normalizeOptionalText(state.customModel),
      geometryRecordId: undefined,
    };
  }

  return {
    brand: normalizeOptionalText(state.standardBrand),
    model: normalizeOptionalText(state.standardModel),
    geometryRecordId: normalizeOptionalText(state.geometryRecordId),
  };
}
