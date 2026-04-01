"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button, Input, Select } from "@/components/ui";
import { api } from "../../../convex/_generated/api";
import { pushDataLayerEvent } from "@/lib/analytics/marketing";
import type { DashboardMessages } from "@/i18n/dashboardMessages";
import {
  applyGeometryRecordSelection,
  applyStandardBrandSelection,
  applyStandardModelFamilySelection,
  applyStandardModelVariantSelection,
  disableCustomBrandFallback,
  disableCustomModelFallback,
  enableCustomBrandFallback,
  enableCustomModelFallback,
  type BikeGeometryFallbackState,
} from "./bikeFormGeometry";

type BikeGeometryLibraryFieldsProps = {
  state: BikeGeometryFallbackState;
  onChange: (updater: BikeGeometryFallbackState | ((current: BikeGeometryFallbackState) => BikeGeometryFallbackState)) => void;
  messages: DashboardMessages;
};

function asStateSetter(
  onChange: BikeGeometryLibraryFieldsProps["onChange"]
) {
  return (updater: (current: BikeGeometryFallbackState) => BikeGeometryFallbackState) => {
    onChange(updater);
  };
}

function trackGeometrySelection(eventType: string, payload: Record<string, unknown>) {
  pushDataLayerEvent({
    event: "bbf_marketing_event",
    eventType,
    ...payload,
  });
}

function matchesAutocompleteQuery(label: string, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  return label.toLowerCase().includes(normalizedQuery);
}

function compareAutocompleteMatches(left: string, right: string, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  const leftStarts = left.toLowerCase().startsWith(normalizedQuery);
  const rightStarts = right.toLowerCase().startsWith(normalizedQuery);

  if (leftStarts !== rightStarts) {
    return leftStarts ? -1 : 1;
  }

  return left.localeCompare(right, undefined, { sensitivity: "base" });
}

export function BikeGeometryLibraryFields({
  state,
  onChange,
  messages,
}: BikeGeometryLibraryFieldsProps) {
  const setState = asStateSetter(onChange);
  const [brandQuery, setBrandQuery] = useState(state.standardBrand ?? "");
  const [modelQuery, setModelQuery] = useState(state.standardModel ?? "");
  const brands = useQuery(api.geometry.queries.listBrandsForRider, {});
  const models = useQuery(
    api.geometry.queries.listModelsForRiderBrand,
    state.standardBrandId && !state.customBrandEnabled
      ? { brandId: state.standardBrandId as Id<"geometry_brands"> }
      : "skip"
  );
  const sizes = useQuery(
    api.geometry.queries.listSizeRecordsForRiderModel,
    state.standardModelId && !state.customBrandEnabled && !state.customModelEnabled
      ? { modelId: state.standardModelId as Id<"geometry_models"> }
      : "skip"
  );
  const selectedBrandOptions =
    brands?.filter((brand) => brand.hasUsableModels).map((brand) => ({
      value: String(brand.brandId),
      label: `${brand.name} (${brand.activeSizeRecordCount})`,
    })) ?? [];
  const selectedModelFamily = models?.find(
    (family) => family.modelKey === state.standardModelFamilyKey
  );

  useEffect(() => {
    setBrandQuery(state.standardBrand ?? "");
  }, [state.standardBrand]);

  useEffect(() => {
    setModelQuery(state.standardModel ?? "");
  }, [state.standardModel]);

  useEffect(() => {
    if (!brands || state.customBrandEnabled || state.standardBrandId || !state.standardBrand) {
      return;
    }

    const matchedBrand = brands.find(
      (brand) => brand.name.toLowerCase() === state.standardBrand?.toLowerCase()
    );
    if (!matchedBrand) {
      return;
    }

    setState((current) =>
      applyStandardBrandSelection(current, {
        brandId: String(matchedBrand.brandId),
        brandName: matchedBrand.name,
      })
    );
  }, [brands, setState, state.customBrandEnabled, state.standardBrand, state.standardBrandId]);

  useEffect(() => {
    if (
      !models ||
      state.customBrandEnabled ||
      state.customModelEnabled ||
      state.standardModelId ||
      !state.standardModel
    ) {
      return;
    }

    const matchedFamily = models.find(
      (family) => family.name.toLowerCase() === state.standardModel?.toLowerCase()
    );
    if (!matchedFamily) {
      return;
    }

    const defaultYearOption = matchedFamily.yearOptions[0];
    setState((current) =>
      applyStandardModelFamilySelection(
        applyStandardModelVariantSelection(current, {
          modelId: defaultYearOption ? String(defaultYearOption.modelId) : undefined,
          modelName: matchedFamily.name,
        }),
        {
          modelFamilyKey: matchedFamily.modelKey,
          modelName: matchedFamily.name,
        }
      )
    );
  }, [
    models,
    setState,
    state.customBrandEnabled,
    state.customModelEnabled,
    state.standardModel,
    state.standardModelId,
  ]);

  useEffect(() => {
    if (!models || state.customBrandEnabled || state.customModelEnabled || state.standardModelId) {
      return;
    }

    if (!state.standardModelFamilyKey && models.length === 1) {
      const family = models[0];
      const option = family.yearOptions[0];
      setState((current) =>
        applyStandardModelVariantSelection(
          applyStandardModelFamilySelection(current, {
            modelFamilyKey: family.modelKey,
            modelName: family.name,
          }),
          {
            modelId: option ? String(option.modelId) : undefined,
            modelName: family.name,
          }
        )
      );
    }
  }, [
    models,
    setState,
    state.customBrandEnabled,
    state.customModelEnabled,
    state.standardModelFamilyKey,
    state.standardModelId,
  ]);

  useEffect(() => {
    if (
      !selectedModelFamily ||
      state.customBrandEnabled ||
      state.customModelEnabled ||
      state.standardModelId
    ) {
      return;
    }

    if (selectedModelFamily.yearOptions.length === 1) {
      const onlyOption = selectedModelFamily.yearOptions[0];
      setState((current) =>
        applyStandardModelVariantSelection(current, {
          modelId: String(onlyOption.modelId),
          modelName: selectedModelFamily.name,
        })
      );
    }
  }, [
    selectedModelFamily,
    setState,
    state.customBrandEnabled,
    state.customModelEnabled,
    state.standardModelId,
  ]);

  useEffect(() => {
    if (!sizes || state.geometryRecordId || state.customBrandEnabled || state.customModelEnabled) {
      return;
    }

    if (sizes.sizeOptions.length === 1) {
      const onlySize = sizes.sizeOptions[0];
      setState((current) =>
        applyGeometryRecordSelection(current, {
          geometryRecordId: String(onlySize.recordId),
          sizeLabel: onlySize.sizeLabel,
        })
      );
    }
  }, [
    setState,
    sizes,
    state.customBrandEnabled,
    state.customModelEnabled,
    state.geometryRecordId,
  ]);

  const modelOptions =
    models?.filter((family) => family.hasUsableSizes).map((family) => ({
      value: family.modelKey,
      label: family.yearSelectionRequired
        ? `${family.name} (${family.variantCount})`
        : family.name,
    })) ?? [];

  const yearOptions =
    selectedModelFamily?.yearOptions.map((option) => ({
      value: String(option.modelId),
      label: option.yearLabel
        ? `${option.yearLabel} (${option.sizeRecordCount})`
        : messages.bikeForm.fields.geometryLink.year.unknownOptionLabel.replace(
            "{count}",
            String(option.sizeRecordCount)
          ),
    })) ?? [];

  const sizeOptions =
    sizes?.sizeOptions.map((option) => ({
      value: String(option.recordId),
      label: option.sizeLabel,
    })) ?? [];
  const brandSuggestions = useMemo(() => {
    if (!brands || state.customBrandEnabled) {
      return [];
    }

    return brands
      .filter((brand) => brand.hasUsableModels)
      .filter((brand) => matchesAutocompleteQuery(brand.name, brandQuery))
      .sort((left, right) => {
        const querySort = compareAutocompleteMatches(left.name, right.name, brandQuery);
        if (querySort !== 0) {
          return querySort;
        }
        return right.activeSizeRecordCount - left.activeSizeRecordCount;
      })
      .slice(0, 8);
  }, [brandQuery, brands, state.customBrandEnabled]);
  const modelSuggestions = useMemo(() => {
    if (!models || state.customBrandEnabled || state.customModelEnabled) {
      return [];
    }

    return models
      .filter((family) => family.hasUsableSizes)
      .filter((family) => matchesAutocompleteQuery(family.name, modelQuery))
      .sort((left, right) => compareAutocompleteMatches(left.name, right.name, modelQuery))
      .slice(0, 8);
  }, [modelQuery, models, state.customBrandEnabled, state.customModelEnabled]);
  const brandHelperText =
    brands === undefined
      ? messages.bikeForm.fields.geometryLink.loadingBrands
      : selectedBrandOptions.length === 0
        ? messages.bikeForm.fields.geometryLink.noBrands
        : messages.bikeForm.fields.geometryLink.standardBrand.helper;
  const modelHelperText =
    !state.standardBrandId
      ? messages.bikeForm.fields.geometryLink.selectBrandFirst
      : models === undefined
        ? messages.bikeForm.fields.geometryLink.loadingModels
        : modelOptions.length === 0
          ? messages.bikeForm.fields.geometryLink.noModels
          : messages.bikeForm.fields.geometryLink.standardModel.helper;

  return (
    <div className="space-y-4 rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-[color:var(--foreground)]">
          {messages.bikeForm.fields.geometryLink.title}
        </p>
        <p className="text-sm text-[color:var(--muted-foreground)]">
          {messages.bikeForm.fields.geometryLink.description}
        </p>
      </div>

      {state.geometryRecordId ? (
        <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-3 text-sm">
          <p className="font-medium text-[color:var(--foreground)]">
            {messages.bikeForm.fields.geometryLink.linkedTitle}
          </p>
          <p className="mt-1 text-[color:var(--muted-foreground)]">
            {messages.bikeForm.fields.geometryLink.linkedDescription}
          </p>
        </div>
      ) : null}

      {!state.customBrandEnabled ? (
        <div className="space-y-2">
          <Input
          label={messages.bikeForm.fields.geometryLink.standardBrand.label}
          value={brandQuery}
          helperText={brandHelperText}
          placeholder={messages.bikeForm.fields.geometryLink.standardBrand.placeholder}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setBrandQuery(nextQuery);
            if (
              state.standardBrandId &&
              nextQuery.trim().toLowerCase() !== state.standardBrand?.trim().toLowerCase()
            ) {
              setState((current) =>
                applyStandardBrandSelection(current, {
                  brandId: undefined,
                  brandName: undefined,
                })
              );
            }
          }}
          autoComplete="off"
        />

          {brandSuggestions.length > 0 ? (
            <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--card)] p-2">
              <div className="flex flex-wrap gap-2">
                {brandSuggestions.map((brand) => (
                  <button
                    key={String(brand.brandId)}
                    type="button"
                    className="rounded-full border border-[color:var(--border)] bg-[color:var(--secondary)] px-3 py-1.5 text-sm text-[color:var(--foreground)] transition hover:border-[color:var(--primary)] hover:bg-[color:var(--accent)]"
                    onClick={() => {
                      setBrandQuery(brand.name);
                      setState((current) =>
                        applyStandardBrandSelection(current, {
                          brandId: String(brand.brandId),
                          brandName: brand.name,
                        })
                      );
                      trackGeometrySelection("bike_geometry_brand_selected", {
                        brandName: brand.name,
                      });
                    }}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {!state.customBrandEnabled && state.standardBrandId ? (
        <div className="space-y-2">
          <Input
          label={messages.bikeForm.fields.geometryLink.standardModel.label}
          value={modelQuery}
          helperText={modelHelperText}
          placeholder={messages.bikeForm.fields.geometryLink.standardModel.placeholder}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setModelQuery(nextQuery);
            if (
              state.standardModelFamilyKey &&
              nextQuery.trim().toLowerCase() !== state.standardModel?.trim().toLowerCase()
            ) {
              setState((current) =>
                applyStandardModelFamilySelection(current, {
                  modelFamilyKey: undefined,
                  modelName: undefined,
                })
              );
            }
          }}
          disabled={!state.standardBrandId}
          autoComplete="off"
        />

          {modelSuggestions.length > 0 ? (
            <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--card)] p-2">
              <div className="flex flex-wrap gap-2">
                {modelSuggestions.map((family) => (
                  <button
                    key={family.modelKey}
                    type="button"
                    className="rounded-full border border-[color:var(--border)] bg-[color:var(--secondary)] px-3 py-1.5 text-sm text-[color:var(--foreground)] transition hover:border-[color:var(--primary)] hover:bg-[color:var(--accent)]"
                    onClick={() => {
                      setModelQuery(family.name);
                      setState((current) =>
                        applyStandardModelFamilySelection(current, {
                          modelFamilyKey: family.modelKey,
                          modelName: family.name,
                        })
                      );
                      trackGeometrySelection("bike_geometry_model_selected", {
                        brandName: state.standardBrand,
                        modelName: family.name,
                      });
                    }}
                  >
                    {family.name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {!state.customBrandEnabled &&
      !state.customModelEnabled &&
      selectedModelFamily &&
      selectedModelFamily.yearSelectionRequired ? (
        <Select
          label={messages.bikeForm.fields.geometryLink.year.label}
          value={state.standardModelId ?? ""}
          helperText={messages.bikeForm.fields.geometryLink.year.helper}
          onChange={(event) => {
            const modelId = event.target.value;
            const option = selectedModelFamily.yearOptions.find(
              (item) => String(item.modelId) === modelId
            );
            setState((current) =>
              applyStandardModelVariantSelection(current, {
                modelId,
                modelName: selectedModelFamily.name,
              })
            );
            if (option) {
              trackGeometrySelection("bike_geometry_year_selected", {
                brandName: state.standardBrand,
                modelName: selectedModelFamily.name,
                yearLabel: option.yearLabel,
              });
            }
          }}
          options={yearOptions}
          placeholder={messages.bikeForm.fields.geometryLink.year.placeholder}
        />
      ) : null}

      {!state.customBrandEnabled &&
      !state.customModelEnabled &&
      state.standardModelId &&
      sizes ? (
        <Select
          label={messages.bikeForm.fields.geometryLink.size.label}
          value={state.geometryRecordId ?? ""}
          helperText={messages.bikeForm.fields.geometryLink.size.helper}
          onChange={(event) => {
            const recordId = event.target.value;
            const size = sizes.sizeOptions.find((item) => String(item.recordId) === recordId);
            setState((current) =>
              applyGeometryRecordSelection(current, {
                geometryRecordId: recordId,
                sizeLabel: size?.sizeLabel,
              })
            );
            if (size) {
              trackGeometrySelection("bike_geometry_record_linked", {
                brandName: state.standardBrand,
                modelName: state.standardModel,
                sizeLabel: size.sizeLabel,
              });
            }
          }}
          options={sizeOptions}
          placeholder={messages.bikeForm.fields.geometryLink.size.placeholder}
        />
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant={state.customBrandEnabled ? "primary" : "outline"}
          onClick={() => {
            setState((current) =>
              current.customBrandEnabled
                ? disableCustomBrandFallback(current)
                : enableCustomBrandFallback(current)
            );
            if (!state.customBrandEnabled) {
              trackGeometrySelection("bike_geometry_custom_fallback_enabled", {
                fallbackType: "brand",
              });
            }
          }}
        >
          {messages.bikeForm.fields.geometryLink.customBrandAction}
        </Button>
        <Button
          type="button"
          variant={state.customModelEnabled ? "primary" : "outline"}
          onClick={() => {
            setState((current) =>
              current.customModelEnabled
                ? disableCustomModelFallback(current)
                : enableCustomModelFallback(current)
            );
            if (!state.customModelEnabled) {
              trackGeometrySelection("bike_geometry_custom_fallback_enabled", {
                fallbackType: "model",
              });
            }
          }}
          disabled={state.customBrandEnabled || !state.standardBrandId}
        >
          {messages.bikeForm.fields.geometryLink.customModelAction}
        </Button>
      </div>

      <p className="text-sm text-[color:var(--muted-foreground)]">
        {messages.bikeForm.fields.geometryLink.customExplanation}
      </p>

      {state.customBrandEnabled ? (
        <Input
          label={messages.bikeForm.fields.brand.label}
          value={state.customBrand}
          onChange={(event) =>
            setState((current) => ({
              ...current,
              customBrand: event.target.value,
            }))
          }
          placeholder={messages.bikeForm.fields.brand.placeholder}
        />
      ) : null}

      {state.customModelEnabled ? (
        <Input
          label={messages.bikeForm.fields.model.label}
          value={state.customModel}
          onChange={(event) =>
            setState((current) => ({
              ...current,
              customModel: event.target.value,
            }))
          }
          placeholder={messages.bikeForm.fields.model.placeholder}
        />
      ) : null}
    </div>
  );
}
